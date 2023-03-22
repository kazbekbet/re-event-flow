import type { Event } from './event';
import type { Store } from '../impl/store';

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

    pending: Event<void>;
    fulfilled: Event<Payload>;
    rejected: Event<Error>;
  }
}

export namespace SetComputedStore {
  export interface Args<OriginalStoreVal, ComputedStoreVal> {
    store: Store<OriginalStoreVal>;
    condition?: (value: OriginalStoreVal) => boolean;
    transform?: (value: OriginalStoreVal) => ComputedStoreVal;
  }
}
