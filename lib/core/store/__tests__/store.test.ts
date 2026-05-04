import { setEvent, setStore } from '../impl/creators';

/**
 * Characterization tests for the `Store<Val>` class.
 *
 * These tests are intentionally written against the *current* behavior of
 * the implementation (including known quirks) so that an upcoming refactor
 * has a safety net to detect any unintended behavior change.
 *
 * Real `setEvent` / `EventImpl` are used (no mocking).
 */

describe('Store', () => {
  describe('.on(event, reducer)', () => {
    it('runs reducer with (state, payload, initialValue) on fire', () => {
      const inc = setEvent<number>();
      const reducer = jest.fn((state: number, _payload: number, _initial: number) => state + _payload);
      const store = setStore(10).on(inc, reducer);

      inc(5);

      expect(reducer).toHaveBeenCalledTimes(1);
      const args = reducer.mock.calls[0];
      // (state, payload, initialValue)
      expect(args[0]).toBe(10);
      expect(args[1]).toBe(5);
      expect(args[2]).toBe(10);
      expect(store.getState()).toBe(15);
    });

    it('updates state for subsequent fires', () => {
      const inc = setEvent<number>();
      const store = setStore(0).on(inc, (state, payload) => state + payload);

      inc(1);
      inc(2);
      inc(3);

      expect(store.getState()).toBe(6);
    });
  });

  describe('getPrevState', () => {
    it('after one fire, returns the value that was current before that fire (initial)', () => {
      const set = setEvent<number>();
      const store = setStore(0).on(set, (_s, p) => p);

      set(100);

      expect(store.getState()).toBe(100);
      expect(store.getPrevState()).toBe(0);
    });

    it('after two fires, returns the state that was current right before the second fire', () => {
      const set = setEvent<number>();
      const store = setStore(0).on(set, (_s, p) => p);

      set(1);
      set(2);

      expect(store.getState()).toBe(2);
      expect(store.getPrevState()).toBe(1);
    });
  });

  describe('multiple .on for the same event', () => {
    it('each .on creates an independent SubscriberImpl, both reducers run on a single fire', () => {
      const evt = setEvent<number>();
      const order: string[] = [];

      const store = setStore(0)
        .on(evt, (state, payload) => {
          order.push('first');
          return state + payload;
        })
        .on(evt, (state, payload) => {
          order.push('second');
          return state * 10 + payload;
        });

      evt(2);

      // Both ran; insertion order: first then second.
      expect(order).toEqual(['first', 'second']);
      // first: 0 + 2 = 2. second runs on the new state: 2 * 10 + 2 = 22.
      expect(store.getState()).toBe(22);
    });
  });

  describe('multiple .on for different events on the same store', () => {
    it('each event drives its own reducer independently', () => {
      const inc = setEvent<number>();
      const setStr = setEvent<string>();

      // Heterogeneous payloads typed via any to keep characterization simple.
      const store = setStore<any>({ count: 0, label: 'a' })
        .on(inc, (state, payload: number) => ({ ...state, count: state.count + payload }))
        .on(setStr, (state, payload: string) => ({ ...state, label: payload }));

      inc(5);
      expect(store.getState()).toEqual({ count: 5, label: 'a' });

      setStr('b');
      expect(store.getState()).toEqual({ count: 5, label: 'b' });

      inc(2);
      expect(store.getState()).toEqual({ count: 7, label: 'b' });
    });
  });

  describe('.clear(event)', () => {
    it('resets state to initial value when the clear event fires', () => {
      const inc = setEvent<number>();
      const reset = setEvent<void>();
      const store = setStore(0)
        .on(inc, (s, p) => s + p)
        .clear(reset);

      inc(5);
      inc(5);
      expect(store.getState()).toBe(10);

      (reset as unknown as () => void)();

      expect(store.getState()).toBe(0);
    });

    /**
     * QUIRK: in `setListener`, only `isUpdatePrev` updates `prevValue`.
     * `.clear` passes only `{ isSetInitial: true }` (no `isUpdatePrev`),
     * so `prevValue` is NOT updated when a clear event fires. This is
     * current behavior to be revisited in the upcoming refactor.
     */
    it('QUIRK: getPrevState is NOT updated by .clear (current behavior — to be revisited in refactor)', () => {
      const inc = setEvent<number>();
      const reset = setEvent<void>();
      const store = setStore(0)
        .on(inc, (s, p) => s + p)
        .clear(reset);

      inc(7); // state: 7, prev: 0
      expect(store.getState()).toBe(7);
      expect(store.getPrevState()).toBe(0);

      (reset as unknown as () => void)(); // state: 0 (initial); prev should remain 0

      expect(store.getState()).toBe(0);
      // prev was 0 before clear; clear does not bump it to 7.
      expect(store.getPrevState()).toBe(0);
    });
  });

  describe('.watch(fn)', () => {
    it('invokes the watcher with the new state after .on', () => {
      const set = setEvent<number>();
      const watcher = jest.fn();
      const store = setStore(0).on(set, (_s, p) => p).watch(watcher);

      set(42);

      expect(watcher).toHaveBeenCalledTimes(1);
      expect(watcher).toHaveBeenCalledWith(42);
      expect(store.getState()).toBe(42);
    });

    it('invokes the watcher with the new (initial) state after .clear', () => {
      const set = setEvent<number>();
      const reset = setEvent<void>();
      const watcher = jest.fn();
      setStore(7)
        .on(set, (_s, p) => p)
        .clear(reset)
        .watch(watcher);

      set(99);
      expect(watcher).toHaveBeenLastCalledWith(99);

      (reset as unknown as () => void)();
      expect(watcher).toHaveBeenLastCalledWith(7);
    });

    /**
     * QUIRK: `watcherFn` is a single field (line 24 of store.ts). Calling
     * `.watch` a second time REPLACES the previous watcher rather than
     * adding another one. This is current behavior — to be revisited in
     * the upcoming refactor.
     */
    it('QUIRK: calling .watch twice REPLACES the previous watcher (current behavior — to be revisited in refactor)', () => {
      const set = setEvent<number>();
      const first = jest.fn();
      const second = jest.fn();
      const store = setStore(0).on(set, (_s, p) => p);

      store.watch(first);
      store.watch(second);

      set(1);

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
      expect(second).toHaveBeenCalledWith(1);
    });
  });

  describe('.destroy(event)', () => {
    it('cancels all subscribers and resets value to initial', () => {
      const inc = setEvent<number>();
      const die = setEvent<void>();
      const store = setStore(0)
        .on(inc, (s, p) => s + p)
        .destroy(die.event);

      inc(3);
      inc(4);
      expect(store.getState()).toBe(7);

      (die as unknown as () => void)();

      expect(store.getState()).toBe(0);
    });

    it('after destroy, firing the original on-bound event does NOT update state', () => {
      const inc = setEvent<number>();
      const die = setEvent<void>();
      const store = setStore(0)
        .on(inc, (s, p) => s + p)
        .destroy(die.event);

      inc(5);
      expect(store.getState()).toBe(5);

      (die as unknown as () => void)();
      expect(store.getState()).toBe(0);

      inc(99);
      // Subscribers were cancelled — no further reducer runs.
      expect(store.getState()).toBe(0);
    });
  });

  describe('.subscribe(listener) (React integration)', () => {
    it('returns an unsubscribe function', () => {
      const store = setStore(0);
      const unsub = store.subscribe(() => {});
      expect(typeof unsub).toBe('function');
    });

    it('calls the listener whenever state changes via .on or .clear', () => {
      const set = setEvent<number>();
      const reset = setEvent<void>();
      const listener = jest.fn();
      const store = setStore(0).on(set, (_s, p) => p).clear(reset);

      store.subscribe(listener);

      set(1);
      set(2);
      (reset as unknown as () => void)();

      expect(listener).toHaveBeenCalledTimes(3);
    });

    it('listener is NOT called by destroy itself; destroy also cancels reducers so subsequent fires do not notify', () => {
      const set = setEvent<number>();
      const die = setEvent<void>();
      const listener = jest.fn();
      const store = setStore(0)
        .on(set, (_s, p) => p)
        .destroy(die.event);

      store.subscribe(listener);

      set(1);
      expect(listener).toHaveBeenCalledTimes(1);

      (die as unknown as () => void)();
      // destroy itself does not call notifyViewListeners.
      expect(listener).toHaveBeenCalledTimes(1);

      // Subscribers cancelled; further fires do not notify.
      set(99);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('unsubscribe stops further calls', () => {
      const set = setEvent<number>();
      const listener = jest.fn();
      const store = setStore(0).on(set, (_s, p) => p);

      const unsub = store.subscribe(listener);
      set(1);
      expect(listener).toHaveBeenCalledTimes(1);

      unsub();
      set(2);
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('reducer returning the same value', () => {
    it('still triggers watcher and view listeners (no equality short-circuit at Store level)', () => {
      const evt = setEvent<void>();
      const watcher = jest.fn();
      const listener = jest.fn();
      const store = setStore(0)
        .on(evt, state => state) // no-op reducer returning same value
        .watch(watcher);

      store.subscribe(listener);

      (evt as unknown as () => void)();
      (evt as unknown as () => void)();

      expect(watcher).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenCalledTimes(2);
      expect(store.getState()).toBe(0);
    });
  });

  describe('initialValue argument of reducer', () => {
    it('reducer receives the original initial value even after many state changes', () => {
      const inc = setEvent<number>();
      const seen: number[] = [];
      const store = setStore(100).on(inc, (state, payload, initial) => {
        seen.push(initial);
        return state + payload;
      });

      inc(1);
      inc(2);
      inc(3);
      inc(4);

      expect(seen).toEqual([100, 100, 100, 100]);
      expect(store.getState()).toBe(110);
    });
  });
});
