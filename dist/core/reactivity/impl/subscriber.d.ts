import type { Stream } from '../abstract/stream';
import type { Subscriber } from '../abstract/subscriber';
export declare class SubscriberImpl<Val> implements Subscriber<Val> {
    private stream;
    constructor(stream: Stream<Val>);
    listenFuncs: Set<(value: any) => unknown>;
    notify(value: Val): void;
    listen<Res, Payload>(fn: (value: Payload) => Res): this;
    pause(): this;
    resume(): this;
    cancel(): this;
}
