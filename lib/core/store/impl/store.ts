import { Subscriber, SubscriberImpl } from '../../reactivity';
import type { Event } from '../abstract/event';

export interface StoreOptions {
  attachLogger?: boolean;
  name?: string;
}

export class Store<Val> {
  constructor(
    private value: Val,
    options?: StoreOptions
  ) {
    this.initialValue = value;
    this.prevValue = value;
    this.isLoggerAttached = Boolean(options?.attachLogger);
    this.name = options?.name;
  }

  private prevValue;
  private readonly initialValue;
  private readonly isLoggerAttached;
  private readonly name;
  private watcherFn: (val: Val) => void = () => {};
  private readonly subscribers = new Set<Subscriber<unknown>>();

  //TODO: подумать.
  private readonly computedListeners: Set<{
    condition: (value: Val) => boolean;
    fn: (value: Val) => unknown;
  }> = new Set();

  private readonly viewListeners: Set<Function> = new Set();

  subscribe = (listener: Function) => {
    this.viewListeners.add(listener);
    return () => {
      this.viewListeners.delete(listener);
    };
  };

  private notifyViewListeners() {
    this.viewListeners.forEach(listener => listener());
  }

  public getState = () => {
    return this.value;
  };

  public getPrevState = () => {
    return this.prevValue;
  };

  public on<Payload>(
    { event }: { event: Event<Payload> },
    reducer: (state: Val, value: Payload, initialValue: Val) => Val
  ) {
    const subscriber = new SubscriberImpl(event);
    this.subscribers.add(subscriber);

    this.setListener(subscriber, {
      isUpdatePrev: true,
      reducer,
    });

    return this;
  }

  public clear({ event }: { event: Event<void> }) {
    const subscriber = new SubscriberImpl(event);

    this.setListener(subscriber, {
      isSetInitial: true,
    });

    return this;
  }

  private setListener<Payload>(
    subscriber: Subscriber<Payload>,
    {
      isUpdatePrev,
      isSetInitial,
      reducer,
    }: {
      isSetInitial?: boolean;
      isUpdatePrev?: boolean;
      reducer?: (state: Val, value: Payload, initialValue: Val) => Val;
    }
  ) {
    subscriber.listen<void, Payload>(val => {
      if (isUpdatePrev) this.prevValue = this.value;

      if (isSetInitial) this.value = this.initialValue;

      if (typeof reducer === 'function') {
        this.value = reducer(this.value, val, this.initialValue);
      }

      this.notifyComputedListeners(this.value);
      this.watcherFn(this.value);
      this.log();
      this.notifyViewListeners();
    });
  }

  public watch(fn: (val: Val) => void) {
    this.watcherFn = fn;
    return this;
  }

  public destroy(event: Event<void>) {
    const subscriber = new SubscriberImpl(event);

    subscriber.listen(_ => {
      this.subscribers.forEach(sub => {
        sub.cancel();
      });

      this.subscribers.clear();
      this.value = this.initialValue;
    });

    return this;
  }

  /** Don't use directly. */
  public addComputedListener(listener: { condition: (value: Val) => boolean; fn: (value: Val) => unknown }) {
    //TODO: подумать насчёт очистки.
    this.computedListeners.add(listener);
  }

  private notifyComputedListeners(value: Val) {
    this.computedListeners.forEach(listener => {
      if (listener.condition(value)) {
        listener.fn(value);
      }
    });
  }

  private log() {
    if (this.isLoggerAttached) {
      const name = this.name ?? '';

      if (typeof this.value === 'object') {
        console.log(`Current state of %c${name}:`, 'color: green');
        console.table(this.value);

        return;
      }

      console.log(`Current state of %c${name}:`, 'color: green', this.value);
    }
  }
}
