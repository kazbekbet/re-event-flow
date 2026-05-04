import { setEvent } from '../impl/creators';
import { setStore } from '../impl/creators';
import { EventImpl } from '../impl/event';

/**
 * Characterization tests for `setEvent` creator.
 *
 * These tests are written against current behavior — including known
 * quirks — to provide a safety net for the upcoming refactor.
 */

describe('setEvent', () => {
  it('returns a callable function', () => {
    const fire = setEvent<number>();

    expect(typeof fire).toBe('function');
  });

  it('calling the returned function fires the underlying event with payload', () => {
    const fire = setEvent<number>();
    const store = setStore(0).on(fire, (_state, payload) => payload);

    fire(42);

    expect(store.getState()).toBe(42);
  });

  it('exposes a `.event` property which is an EventImpl instance', () => {
    const fire = setEvent<string>();

    expect(fire.event).toBeInstanceOf(EventImpl);
  });

  it('the `.event` property is usable directly via Store#on (verifies plumbing)', () => {
    const fire = setEvent<string>();
    const store = setStore('initial').on({ event: fire.event }, (_state, payload) => payload);

    fire('updated');

    expect(store.getState()).toBe('updated');
  });

  it('two separate setEvent() calls produce independent events', () => {
    const fireA = setEvent<number>();
    const fireB = setEvent<number>();

    expect(fireA.event).not.toBe(fireB.event);

    const storeA = setStore(0).on(fireA, (_s, p) => p);
    const storeB = setStore(0).on(fireB, (_s, p) => p);

    fireA(1);
    expect(storeA.getState()).toBe(1);
    expect(storeB.getState()).toBe(0);

    fireB(2);
    expect(storeA.getState()).toBe(1);
    expect(storeB.getState()).toBe(2);
  });

  it('an undefined payload still triggers reducers (firing void events)', () => {
    const fire = setEvent<void>();
    const reducer = jest.fn((state: number, _payload: void) => state + 1);
    const store = setStore(0).on(fire, reducer);

    (fire as unknown as () => void)();

    expect(reducer).toHaveBeenCalledTimes(1);
    // payload arg is undefined for void events
    expect(reducer.mock.calls[0][1]).toBeUndefined();
    expect(store.getState()).toBe(1);
  });
});
