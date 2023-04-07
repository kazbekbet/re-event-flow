import { Store, StoreOptions } from './store';
import { EventImpl } from './event';
import type {
  SetAsyncEvent,
  SetComputedStore,
  SetEvent,
} from '../abstract/contracts';

export function setEvent<Payload>(): SetEvent.Return<Payload> {
  const event = new EventImpl<Payload>();

  function fire(payload: Payload) {
    return event.fire(payload);
  }

  fire.event = event;

  return fire;
}

export function setAsyncEvent<Args, Payload>(
  asyncFn: SetAsyncEvent.ArgFn<Args, Payload>
): SetAsyncEvent.Return<Args, Payload> {
  const pendingEvent = new EventImpl<void>(),
    fulfilledEvent = new EventImpl<Payload>(),
    rejectedEvent = new EventImpl<Error>();

  async function fireAsync(...args: Args[]) {
    pendingEvent.fire();

    promisifyFn(asyncFn, ...args)
      .then(res => fulfilledEvent.fire(res))
      .catch(error => rejectedEvent.fire(error));
  }

  fireAsync.pending = { event: pendingEvent };
  fireAsync.fulfilled = { event: fulfilledEvent };
  fireAsync.rejected = { event: rejectedEvent };

  return fireAsync;
}

async function promisifyFn<Args, Payload>(
  asyncFn: SetAsyncEvent.ArgFn<Args, Payload>,
  ...args: Args[]
) {
  return await asyncFn(...args);
}

export function redirect<Payload>({
  event = setEvent<Payload>(),
  handler,
}: {
  event?: SetEvent.Return<Payload>;
  handler: Function;
}) {
  setStore(handler).on(event, memoizedHandler => {
    memoizedHandler();
    return memoizedHandler;
  });

  return event;
}

export function setStore<Val>(initialValue: Val, options?: StoreOptions) {
  return new Store(initialValue, options);
}

export function setComputedStore<
  OriginalStoreVal,
  ComputedStoreVal = OriginalStoreVal
>({
  store,
  condition,
  transform,
}: SetComputedStore.Args<OriginalStoreVal, ComputedStoreVal>) {
  const updateEvent = setEvent<OriginalStoreVal>();

  function transformValue(val: OriginalStoreVal) {
    return typeof transform === 'function'
      ? transform(val)
      : (val as unknown as ComputedStoreVal);
  }

  store.addComputedListener({
    condition: condition ?? (() => true),
    fn: val => updateEvent(val),
  });

  return new Store(transformValue(store.getState()), {}).on(
    updateEvent,
    (_, payload) => transformValue(payload)
  );
}
