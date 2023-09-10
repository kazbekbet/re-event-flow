import type { Stream } from '../abstract/stream';
import type { Subscriber } from '../abstract/subscriber';

export class SubscriberImpl<Val> implements Subscriber<Val> {
  constructor(private stream: Stream<Val>) {
    stream.addSubscriber(this);
  }

  public listenFuncs = new Set<(value: any) => unknown>();

  public notify(value: Val) {
    this.listenFuncs.forEach(fn => fn(value));
  }

  public listen<Res, Payload>(fn: (value: Payload) => Res) {
    this.listenFuncs.add(fn);
    return this;
  }

  pause() {
    this.stream.clearSubscriber(this);
    return this;
  }

  resume() {
    this.stream.addSubscriber(this);
    return this;
  }

  cancel() {
    this.listenFuncs.clear();
    this.stream.clearSubscriber(this);
    return this;
  }
}
