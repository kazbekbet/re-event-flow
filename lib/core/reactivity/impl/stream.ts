import type { Stream } from '../abstract/stream';
import type { Subscriber } from '../abstract/subscriber';

export class StreamImpl<Val> implements Stream<Val> {
  constructor(
    private _value?: Val,
    private checkEqualFunc?: (prev: Val, next?: Val) => boolean
  ) {}

  private subscribers = new Set<Subscriber<Val>>();

  get value() {
    return this._value;
  }

  addSubscriber(sub: Subscriber<Val>) {
    this.subscribers.add(sub);
  }

  clearSubscriber(sub: Subscriber<Val>) {
    this.subscribers.delete(sub);
  }

  fire(value: Val) {
    if (typeof this.checkEqualFunc === 'function' && value) {
      if (!this.checkEqualFunc(value, this._value)) {
        this._value = value;
        this.notifySubs(value);

        return this;
      }
    }

    this._value = value;
    this.notifySubs(value);

    return this;
  }

  private notifySubs(value: Val) {
    this.subscribers.forEach(sub => sub.notify(value));
  }
}
