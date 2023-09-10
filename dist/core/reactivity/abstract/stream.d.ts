import type { Subscriber } from './subscriber';
export declare abstract class Stream<Val> {
    abstract addSubscriber(sub: Subscriber<Val>): void;
    abstract clearSubscriber(sub: Subscriber<Val>): void;
    abstract fire(value?: Val): ThisType<Stream<Val>>;
}
