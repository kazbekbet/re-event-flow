import type { SetAsyncEvent, SetComputedStore, SetEvent } from '../abstract/contracts';
import { Store, StoreOptions } from './store';
export declare function setEvent<Payload>(): SetEvent.Return<Payload>;
export declare function setAsyncEvent<Args, Payload>(asyncFn: SetAsyncEvent.ArgFn<Args, Payload>): SetAsyncEvent.Return<Args, Payload>;
export declare function setStore<Val>(initialValue: Val, options?: StoreOptions): Store<Val>;
export declare function setComputedStore<OriginalStoreVal, ComputedStoreVal = OriginalStoreVal>({ store, condition, transform, }: SetComputedStore.Args<OriginalStoreVal, ComputedStoreVal>): Store<ComputedStoreVal>;
