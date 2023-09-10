import type { Store } from '../impl/store';
import type { Event } from './event';

export namespace SetEvent {
  export interface Return<Payload> {
    (payload: Payload): Event<Payload>;

    event: Event<Payload>;
  }
}

export namespace SetAsyncEvent {
  export type ArgFn<Args, Payload> = (...args: Args[]) => Promise<Payload>;

  export interface Return<Args, Payload> {
    (...args: Args[]): Promise<unknown>;

    pending: { event: Event<void> };
    fulfilled: { event: Event<Payload> };
    rejected: { event: Event<Error> };
  }
}

export namespace SetComputedStore {
  export interface Args<OriginalStoreVal, ComputedStoreVal> {
    store: Store<OriginalStoreVal>;
    condition?: (value: OriginalStoreVal) => boolean;
    transform?: (value: OriginalStoreVal) => ComputedStoreVal;
  }
}
