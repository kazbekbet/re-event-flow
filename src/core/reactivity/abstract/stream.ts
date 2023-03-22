import type { Subscriber } from './subscriber';

export abstract class Stream<Val> {
  public abstract addSubscriber(sub: Subscriber<Val>): void;

  public abstract clearSubscriber(sub: Subscriber<Val>): void;

  public abstract fire(value?: Val): ThisType<Stream<Val>>;
}
