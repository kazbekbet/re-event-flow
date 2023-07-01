import type { Event } from './event';
import type { Store } from '../impl/store';
export declare namespace SetEvent {
    interface Return<Payload> {
        (payload: Payload): Event<Payload>;
        event: Event<Payload>;
    }
}
export declare namespace SetAsyncEvent {
    type ArgFn<Args, Payload> = (...args: Args[]) => Promise<Payload>;
    interface Return<Args, Payload> {
        (...args: Args[]): Promise<unknown>;
        pending: {
            event: Event<void>;
        };
        fulfilled: {
            event: Event<Payload>;
        };
        rejected: {
            event: Event<Error>;
        };
    }
}
export declare namespace SetComputedStore {
    interface Args<OriginalStoreVal, ComputedStoreVal> {
        store: Store<OriginalStoreVal>;
        condition?: (value: OriginalStoreVal) => boolean;
        transform?: (value: OriginalStoreVal) => ComputedStoreVal;
    }
}
