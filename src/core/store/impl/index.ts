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

  fireAsync.pending = pendingEvent;
  fireAsync.fulfilled = fulfilledEvent;
  fireAsync.rejected = rejectedEvent;

  return fireAsync;
}

async function promisifyFn<Args, Payload>(
  asyncFn: SetAsyncEvent.ArgFn<Args, Payload>,
  ...args: Args[]
) {
  return await asyncFn(...args);
}

export function setStore<Val>(initialValue: Val, options?: StoreOptions) {
  return new Store(initialValue, options);
}

export function setComputedStore<Val>({
  store,
  condition,
}: SetComputedStore.Args<Val>) {
  const updateEvent = setEvent<Val>();

  store.addComputedListener({
    condition,
    fn: val => updateEvent(val),
  });

  return new Store(store.getState()).on(
    updateEvent.event,
    (_, payload) => payload
  );
}
