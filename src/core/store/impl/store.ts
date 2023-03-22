import { Subscriber, SubscriberImpl } from '../../reactivity';
import type { Event } from '../abstract/event';

export interface StoreOptions {
  attachLogger?: boolean;
  name?: string;
}

export class Store<Val> {
  constructor(private value: Val, options?: StoreOptions) {
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

  //TODO: привязка к реакту, избавиться
  private readonly reactListeners: Set<Function> = new Set();

  //TODO: привязка к реакту, избавиться
  subscribe = (listener: Function) => {
    this.reactListeners.add(listener);
    return () => {
      this.reactListeners.delete(listener);
    };
  };

  //TODO: привязка к реакту, избавиться
  private notifyReactListeners() {
    this.reactListeners.forEach(listener => listener());
  }

  public getState = () => {
    return this.value;
  };

  public on<Payload>(
    event: Event<Payload>,
    reducer: (state: Val, value: Payload, initialValue: Val) => Val
  ) {
    const subscriber = new SubscriberImpl(event);
    this.subscribers.add(subscriber);

    subscriber.listen<void, Payload>(val => {
      this.prevValue = this.value;
      this.value = reducer(this.value, val, this.initialValue);
      this.watcherFn(this.value);
      this.log();
      this.notifyComputedListeners(this.value);
      this.notifyReactListeners();
    });

    return this;
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

  public clear(event: Event<void>) {
    const subscriber = new SubscriberImpl(event);

    subscriber.listen(_ => {
      this.value = this.initialValue;
      this.watcherFn(this.value);
      this.log();
      this.notifyReactListeners();
    });

    return this;
  }

  /** Don't use directly. */
  public addComputedListener(listener: {
    condition: (value: Val) => boolean;
    fn: (value: Val) => unknown;
  }) {
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
