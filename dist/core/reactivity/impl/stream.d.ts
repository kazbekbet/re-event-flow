import type { Stream } from '../abstract/stream';
import type { Subscriber } from '../abstract/subscriber';
export declare class StreamImpl<Val> implements Stream<Val> {
    private _value?;
    private checkEqualFunc?;
    constructor(_value?: Val | undefined, checkEqualFunc?: ((prev: Val, next?: Val) => boolean) | undefined);
    private subscribers;
    get value(): Val | undefined;
    addSubscriber(sub: Subscriber<Val>): void;
    clearSubscriber(sub: Subscriber<Val>): void;
    fire(value: Val): this;
    private notifySubs;
}
