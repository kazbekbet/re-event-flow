import { setAsyncEvent, setStore } from '../impl/creators';
import { EventImpl } from '../impl/event';

/**
 * Characterization tests for `setAsyncEvent` creator.
 *
 * These tests document the CURRENT behavior of `setAsyncEvent` — including
 * known quirks — so that an upcoming refactor has a safety net. They are not
 * idealized expectations; if a test name says "quirk", the behavior is
 * intentional-as-is for now and a refactor target.
 */

// Helper that flushes microtasks: awaiting this yields the event-loop
// enough times for `Promise.then` callbacks chained in `fireAsync` to run.
const flushMicrotasks = async () => {
  // Two awaits cover the two `.then`/`.catch` handler chain depths in
  // `promisifyFn(...).then(...).catch(...)`.
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

describe('setAsyncEvent', () => {
  it('successful flow: pending fires once, fulfilled fires with the resolved value, rejected does NOT fire', async () => {
    const asyncFn = jest.fn(async (n: number) => n * 2);
    const fireAsync = setAsyncEvent<number, number>(asyncFn);

    const pendingCount = setStore(0).on(fireAsync.pending, state => state + 1);
    const fulfilledValue = setStore<number | null>(null).on(
      fireAsync.fulfilled,
      (_state, payload) => payload
    );
    const rejectedCount = setStore(0).on(fireAsync.rejected, state => state + 1);

    await fireAsync(21);
    await flushMicrotasks();

    expect(pendingCount.getState()).toBe(1);
    expect(fulfilledValue.getState()).toBe(42);
    expect(rejectedCount.getState()).toBe(0);
  });

  it('failure flow: pending fires, then rejected fires with the rejection value (any thrown value, not necessarily an Error)', async () => {
    const rejection = { message: 'oops' };
    const asyncFn = jest.fn(async () => {
      throw rejection;
    });
    const fireAsync = setAsyncEvent<void, never>(asyncFn);

    const pendingCount = setStore(0).on(fireAsync.pending, state => state + 1);
    const fulfilledCount = setStore(0).on(fireAsync.fulfilled, state => state + 1);
    const rejectedPayload = setStore<unknown>(null).on(
      fireAsync.rejected,
      // The runtime payload is whatever was thrown (current code uses
      // .catch(error => rejectedEvent.fire(error))) — see creators.ts:29.
      (_state, payload) => payload as unknown
    );

    await fireAsync();
    await flushMicrotasks();

    expect(pendingCount.getState()).toBe(1);
    expect(fulfilledCount.getState()).toBe(0);
    // The exact thrown value is forwarded — it does NOT have to be an Error
    // instance. We assert payload shape (matches the demo `{ message: 'oops' }`).
    expect(rejectedPayload.getState()).toEqual({ message: 'oops' });
    expect(rejectedPayload.getState()).toBe(rejection);
  });

  it('concurrent calls: pending fires twice, then both fulfilleds in promise resolution order', async () => {
    // Manually-controlled deferred promises so we can resolve in a deterministic order.
    let resolveA!: (v: string) => void;
    let resolveB!: (v: string) => void;
    const promiseA = new Promise<string>(res => {
      resolveA = res;
    });
    const promiseB = new Promise<string>(res => {
      resolveB = res;
    });

    let callIdx = 0;
    const asyncFn = jest.fn(async () => {
      const idx = callIdx++;
      return idx === 0 ? promiseA : promiseB;
    });

    const fireAsync = setAsyncEvent<void, string>(asyncFn);

    const pendingCount = setStore(0).on(fireAsync.pending, state => state + 1);
    const fulfilledLog = setStore<string[]>([]).on(
      fireAsync.fulfilled,
      (state, payload) => [...state, payload]
    );

    await fireAsync();
    await fireAsync();

    // Both pendings should have fired synchronously when we called fireAsync.
    expect(pendingCount.getState()).toBe(2);
    expect(fulfilledLog.getState()).toEqual([]);

    // Resolve in reverse order — fulfilled events should fire in the
    // resolution order, not call order.
    resolveB('B');
    await flushMicrotasks();
    expect(fulfilledLog.getState()).toEqual(['B']);

    resolveA('A');
    await flushMicrotasks();
    expect(fulfilledLog.getState()).toEqual(['B', 'A']);
  });

  it('QUIRK: awaiting the returned call resolves BEFORE fulfilled is fired (current code does NOT await asyncFn internally)', async () => {
    // Current behavior — refactor target.
    // The returned `fireAsync` is itself `async` (creators.ts line 24) but
    // does not `await promisifyFn(...)`. It only chains `.then/.catch` to fire
    // fulfilled/rejected. As a result, awaiting `fireAsync(...)` simply
    // resolves at the end of its body — i.e. immediately after `pendingEvent.fire()`
    // — and BEFORE the inner asyncFn settles. Consumers that expect
    // `await fireAsync()` to also wait for fulfilled will be surprised.
    let resolveInner!: (v: number) => void;
    const innerPromise = new Promise<number>(res => {
      resolveInner = res;
    });
    const asyncFn = jest.fn(async () => innerPromise);
    const fireAsync = setAsyncEvent<void, number>(asyncFn);

    const fulfilledFired = setStore(false).on(fireAsync.fulfilled, () => true);

    await fireAsync();

    // After awaiting fireAsync, fulfilled has NOT fired yet because asyncFn
    // is still pending. This is the documented quirk.
    expect(fulfilledFired.getState()).toBe(false);

    resolveInner(7);
    await flushMicrotasks();

    expect(fulfilledFired.getState()).toBe(true);
  });

  it('.pending, .fulfilled, .rejected are objects shaped like { event: Event<Payload> } (matches Store#on requirement)', () => {
    const fireAsync = setAsyncEvent<number, number>(async n => n);

    expect(fireAsync.pending).toEqual(expect.objectContaining({ event: expect.any(EventImpl) }));
    expect(fireAsync.fulfilled).toEqual(expect.objectContaining({ event: expect.any(EventImpl) }));
    expect(fireAsync.rejected).toEqual(expect.objectContaining({ event: expect.any(EventImpl) }));

    // Prove they actually plug into Store#on without any adapter — i.e. the
    // shape really is what `Store#on` expects.
    expect(() => {
      setStore(0).on(fireAsync.pending, s => s);
      setStore(0).on(fireAsync.fulfilled, s => s);
      setStore(0).on(fireAsync.rejected, s => s);
    }).not.toThrow();
  });
});
