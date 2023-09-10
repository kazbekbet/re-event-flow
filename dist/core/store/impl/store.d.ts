import type { Event } from '../abstract/event';
export interface StoreOptions {
    attachLogger?: boolean;
    name?: string;
}
export declare class Store<Val> {
    private value;
    constructor(value: Val, options?: StoreOptions);
    private prevValue;
    private readonly initialValue;
    private readonly isLoggerAttached;
    private readonly name;
    private watcherFn;
    private readonly subscribers;
    private readonly computedListeners;
    private readonly viewListeners;
    subscribe: (listener: Function) => () => void;
    private notifyViewListeners;
    getState: () => Val;
    getPrevState: () => Val;
    on<Payload>({ event }: {
        event: Event<Payload>;
    }, reducer: (state: Val, value: Payload, initialValue: Val) => Val): this;
    clear({ event }: {
        event: Event<void>;
    }): this;
    private setListener;
    watch(fn: (val: Val) => void): this;
    destroy(event: Event<void>): this;
    /** Don't use directly. */
    addComputedListener(listener: {
        condition: (value: Val) => boolean;
        fn: (value: Val) => unknown;
    }): void;
    private notifyComputedListeners;
    private log;
}
