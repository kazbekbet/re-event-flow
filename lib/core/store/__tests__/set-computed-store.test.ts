import { setComputedStore, setEvent, setStore } from '../impl/creators';

/**
 * Characterization tests for `setComputedStore` creator.
 *
 * These tests document CURRENT behavior — including known quirks — so that
 * an upcoming refactor has a safety net. They are intentionally not
 * idealized expectations; if a test name says "quirk", the behavior is
 * a refactor target.
 */

describe('setComputedStore', () => {
  it('without `condition` and `transform`: computed store mirrors source store updates 1:1', () => {
    const update = setEvent<number>();
    const source = setStore(0).on(update, (_s, p) => p);

    const computed = setComputedStore({ store: source });

    expect(computed.getState()).toBe(0);

    update(7);
    expect(computed.getState()).toBe(7);

    update(99);
    expect(computed.getState()).toBe(99);
  });

  it('with `condition`: only updates that match condition propagate; non-matching updates leave computed unchanged', () => {
    const update = setEvent<number>();
    const source = setStore(0).on(update, (_s, p) => p);

    const computed = setComputedStore({
      store: source,
      condition: v => v % 2 === 0,
    });

    expect(computed.getState()).toBe(0);

    update(2);
    expect(computed.getState()).toBe(2);

    update(3);
    // 3 is odd — condition rejects it, computed stays at 2.
    expect(computed.getState()).toBe(2);

    update(4);
    expect(computed.getState()).toBe(4);
  });

  it('with `transform`: computed value is transform(sourceValue); initial value of computed is transform(initialSourceValue)', () => {
    // Verify against creators.ts line 63: `new Store(transformValue(store.getState()), {})`
    const update = setEvent<number>();
    const source = setStore(10).on(update, (_s, p) => p);

    const computed = setComputedStore({
      store: source,
      transform: v => v * 3,
    });

    // initial: transform(10) = 30
    expect(computed.getState()).toBe(30);

    update(4);
    expect(computed.getState()).toBe(12);
  });

  it('with both condition and transform: condition gates, transform applies on accepted updates', () => {
    const update = setEvent<number>();
    const source = setStore(2).on(update, (_s, p) => p);

    const computed = setComputedStore({
      store: source,
      condition: v => v > 0,
      transform: v => `n=${v}`,
    });

    // initial: transform(2) = "n=2"
    expect(computed.getState()).toBe('n=2');

    update(5);
    expect(computed.getState()).toBe('n=5');

    update(-1);
    // condition rejects, computed unchanged
    expect(computed.getState()).toBe('n=5');

    update(8);
    expect(computed.getState()).toBe('n=8');
  });

  it('computed type can differ from source: transform: (n: number) => boolean', () => {
    const update = setEvent<number>();
    const source = setStore(1).on(update, (_s, p) => p);

    const computed = setComputedStore<number, boolean>({
      store: source,
      transform: (n: number) => n > 0,
    });

    expect(computed.getState()).toBe(true);

    update(-5);
    expect(computed.getState()).toBe(false);

    update(3);
    expect(computed.getState()).toBe(true);
  });

  it('multiple computed stores from the same source all receive updates', () => {
    const update = setEvent<number>();
    const source = setStore(0).on(update, (_s, p) => p);

    const doubled = setComputedStore<number, number>({
      store: source,
      transform: n => n * 2,
    });
    const stringified = setComputedStore<number, string>({
      store: source,
      transform: n => `v:${n}`,
    });

    update(4);
    expect(doubled.getState()).toBe(8);
    expect(stringified.getState()).toBe('v:4');

    update(10);
    expect(doubled.getState()).toBe(20);
    expect(stringified.getState()).toBe('v:10');
  });

  it('computed-of-computed: chain still works (compose)', () => {
    const update = setEvent<number>();
    const source = setStore(1).on(update, (_s, p) => p);

    const doubled = setComputedStore<number, number>({
      store: source,
      transform: n => n * 2,
    });
    const labeled = setComputedStore<number, string>({
      store: doubled,
      transform: n => `x=${n}`,
    });

    expect(doubled.getState()).toBe(2);
    expect(labeled.getState()).toBe('x=2');

    update(5);
    expect(doubled.getState()).toBe(10);
    expect(labeled.getState()).toBe('x=10');

    update(7);
    expect(doubled.getState()).toBe(14);
    expect(labeled.getState()).toBe('x=14');
  });

  it('QUIRK: computed listeners are never cleaned up — after source.destroy(...) the computed listener remains on source', () => {
    // current behavior — refactor target.
    // `setComputedStore` calls `store.addComputedListener(...)` (creators.ts:58)
    // and there is no removal path. `Store#destroy` clears `subscribers` but
    // does NOT touch `computedListeners` (see store.ts:112-125 vs store.ts:128-131).
    // Verified two ways:
    //   1. `(source as any).computedListeners.size` remains 1 after destroy.
    //   2. The computed continues to receive updates from the (re-initialized) source.
    const update = setEvent<number>();
    const destroy = setEvent<void>();
    const source = setStore(0).on(update, (_s, p) => p).destroy(destroy.event);

    const computed = setComputedStore<number, number>({
      store: source,
      transform: n => n + 100,
    });

    // sanity: listener attached
    expect((source as unknown as { computedListeners: Set<unknown> }).computedListeners.size).toBe(1);

    update(5);
    expect(computed.getState()).toBe(105);

    // Trigger destroy — clears subscribers and resets value to initial.
    destroy();

    // QUIRK: computedListeners is NOT cleared.
    expect((source as unknown as { computedListeners: Set<unknown> }).computedListeners.size).toBe(1);

    // And because source was destroyed, its event subscribers were cancelled
    // — so further `update(...)` calls will not change source's value. We
    // therefore directly verify via the Set size above that the listener
    // remains attached. As a secondary check, fire a brand-new event wired
    // to source (post-destroy `Store#on` still works because it adds a
    // fresh subscriber) and confirm the computed listener still fires.
    const update2 = setEvent<number>();
    source.on(update2, (_s, p) => p);

    update2(50);
    // condition default is `() => true`, so this should propagate.
    expect(computed.getState()).toBe(150);
    // Listener Set still holds the computed listener.
    expect((source as unknown as { computedListeners: Set<unknown> }).computedListeners.size).toBe(1);
  });
});
