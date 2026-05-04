import * as React from 'react';

import { act, cleanup, render, renderHook, screen } from '@testing-library/react';

import { setEvent, setStore } from '../../core';
import { useStore } from '../hooks/use-store';

/**
 * Characterization tests for the React `useStore` hook.
 *
 * These tests pin down the CURRENT observable behavior of `useStore` so
 * that an upcoming refactor cannot silently change semantics.
 *
 * Documented quirks:
 *  - `subscribe`/`getState` only get fired through the reducer path
 *    (i.e. via an event configured with `.on(...)`). Mutating an object
 *    payload in place does NOT trigger React re-renders, since
 *    `notifyViewListeners` is only called from the reducer pipeline.
 */

const text = (testId: string) => screen.getByTestId(testId).textContent;

afterEach(() => {
  cleanup();
});

describe('useStore', () => {
  it('initial render reads store.getState()', () => {
    const counterStore = setStore(7);

    function Counter() {
      const value = useStore(counterStore);
      return <div data-testid="value">{value}</div>;
    }

    render(<Counter />);

    expect(text('value')).toBe('7');
  });

  it('re-renders on store update via fired event', () => {
    const counterStore = setStore(0);
    const increment = setEvent<number>();
    counterStore.on(increment, (state, payload) => state + payload);

    function Counter() {
      const value = useStore(counterStore);
      return <div data-testid="value">{value}</div>;
    }

    render(<Counter />);
    expect(text('value')).toBe('0');

    act(() => {
      increment(5);
    });

    expect(text('value')).toBe('5');

    act(() => {
      increment(3);
    });

    expect(text('value')).toBe('8');
  });

  it('does not re-render when an unrelated store changes', () => {
    const storeA = setStore(0);
    const storeB = setStore(0);
    const incA = setEvent<void>();
    const incB = setEvent<void>();
    storeA.on(incA, state => state + 1);
    storeB.on(incB, state => state + 1);

    const renderSpyA = jest.fn();

    function ComponentA() {
      const value = useStore(storeA);
      renderSpyA();
      return <div data-testid="a">{value}</div>;
    }

    render(<ComponentA />);

    const initialRenderCount = renderSpyA.mock.calls.length;
    expect(initialRenderCount).toBeGreaterThanOrEqual(1);

    act(() => {
      incB();
    });

    // A's render count should NOT have increased due to B mutating.
    expect(renderSpyA).toHaveBeenCalledTimes(initialRenderCount);
    expect(text('a')).toBe('0');

    act(() => {
      incA();
    });

    // After A's own event fires, render count must increase.
    expect(renderSpyA.mock.calls.length).toBeGreaterThan(initialRenderCount);
    expect(text('a')).toBe('1');
  });

  it('multiple components reading the same store all update on a single event fire', () => {
    const sharedStore = setStore(1);
    const setValue = setEvent<number>();
    sharedStore.on(setValue, (_state, payload) => payload);

    function ViewOne() {
      const value = useStore(sharedStore);
      return <div data-testid="one">{value}</div>;
    }

    function ViewTwo() {
      const value = useStore(sharedStore);
      return <div data-testid="two">{value}</div>;
    }

    function ViewThree() {
      const value = useStore(sharedStore);
      return <div data-testid="three">{value}</div>;
    }

    render(
      <>
        <ViewOne />
        <ViewTwo />
        <ViewThree />
      </>
    );

    expect(text('one')).toBe('1');
    expect(text('two')).toBe('1');
    expect(text('three')).toBe('1');

    act(() => {
      setValue(42);
    });

    expect(text('one')).toBe('42');
    expect(text('two')).toBe('42');
    expect(text('three')).toBe('42');
  });

  it('unmount unsubscribes the listener (viewListeners shrinks back)', () => {
    const counterStore = setStore(0);
    const inc = setEvent<void>();
    counterStore.on(inc, state => state + 1);

    // Read the private viewListeners set via cast.
    const viewListeners = (counterStore as unknown as { viewListeners: Set<Function> }).viewListeners;
    const before = viewListeners.size;

    function Counter() {
      const value = useStore(counterStore);
      return <div data-testid="v">{value}</div>;
    }

    const { unmount } = render(<Counter />);

    expect(viewListeners.size).toBe(before + 1);

    unmount();

    // After unmount the React subscription should have been cleaned up.
    expect(viewListeners.size).toBe(before);

    // Sanity: firing after unmount must not throw and must not bring listeners back.
    expect(() => {
      act(() => {
        inc();
      });
    }).not.toThrow();

    expect(viewListeners.size).toBe(before);
  });

  it('object state: replacing the object reference triggers re-render', () => {
    type Payload = { count: number };
    const objectStore = setStore<Payload>({ count: 0 });
    const replace = setEvent<Payload>();
    objectStore.on(replace, (_state, payload) => payload);

    const renderSpy = jest.fn();

    function View() {
      const value = useStore(objectStore);
      renderSpy();
      return <div data-testid="obj">{value.count}</div>;
    }

    render(<View />);

    const baseline = renderSpy.mock.calls.length;
    expect(text('obj')).toBe('0');

    act(() => {
      replace({ count: 9 });
    });

    expect(text('obj')).toBe('9');
    expect(renderSpy.mock.calls.length).toBeGreaterThan(baseline);
  });

  it('object state: mutating in place WITHOUT a reducer fire does not re-render (documented quirk)', () => {
    type Payload = { count: number };
    const initial: Payload = { count: 0 };
    const objectStore = setStore<Payload>(initial);

    const renderSpy = jest.fn();

    function View() {
      const value = useStore(objectStore);
      renderSpy();
      return <div data-testid="obj">{value.count}</div>;
    }

    render(<View />);
    const baseline = renderSpy.mock.calls.length;

    // Mutating the underlying object without going through a reducer.
    // `notifyViewListeners` is only called from the reducer pipeline,
    // so React is never told that anything changed.
    act(() => {
      initial.count = 123;
    });

    // Render count is unchanged — quirk documented.
    expect(renderSpy.mock.calls.length).toBe(baseline);
    // The DOM still reflects the previously rendered value.
    expect(text('obj')).toBe('0');
  });

  it('works inside React.StrictMode without crashing or losing updates', () => {
    const counterStore = setStore(0);
    const inc = setEvent<void>();
    counterStore.on(inc, state => state + 1);

    function Counter() {
      const value = useStore(counterStore);
      return <div data-testid="strict">{value}</div>;
    }

    expect(() =>
      render(
        <React.StrictMode>
          <Counter />
        </React.StrictMode>
      )
    ).not.toThrow();

    expect(text('strict')).toBe('0');

    act(() => {
      inc();
    });

    expect(text('strict')).toBe('1');

    act(() => {
      inc();
    });

    expect(text('strict')).toBe('2');
  });

  it('returns the up-to-date value synchronously after an event fire', () => {
    const counterStore = setStore(10);
    const increment = setEvent<void>();
    counterStore.on(increment, state => state + 1);

    const { result } = renderHook(() => useStore(counterStore));

    expect(result.current).toBe(10);

    act(() => {
      increment();
    });

    // Immediately after the act block, the hook must already reflect the new state.
    expect(result.current).toBe(11);

    act(() => {
      increment();
      increment();
    });

    expect(result.current).toBe(13);
  });
});
