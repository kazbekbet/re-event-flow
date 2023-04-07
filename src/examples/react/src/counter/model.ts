import {
  setComputedStore,
  setStore,
  setEvent,
  setAsyncEvent,
  redirect,
} from '../../../../index';
import { asyncCount } from './api';

interface AsyncIncrementPayload {
  countTo: number;
  delay: number;
  isReject: boolean;
}

// --> Events on export.
export const increment = setEvent();
export const decrement = setEvent();
export const reset = setEvent();
export const callMillionTimes = redirect({
  handler: _handleIncrementMillionTimes,
});

// --> Events private (use underscore).
export const _setPerformance = setEvent<number>();

// --> Async events private.
export const _asyncIncrement = setAsyncEvent(
  ({ countTo, delay, isReject }: AsyncIncrementPayload) =>
    asyncCount(countTo, delay, isReject)
);

// --> Handlers for export.
export function handleAsyncIncrementSuccess() {
  _asyncIncrement({ delay: 1000, countTo: 1000, isReject: false });
}

export function handleAsyncIncrementError() {
  _asyncIncrement({ delay: 1000, countTo: 1000, isReject: true });
}

function _handleIncrementMillionTimes() {
  const now = performance.now();

  for (let i = 0; i <= 1_000_000; i++) {
    increment(1);
  }

  return _setPerformance(performance.now() - now);
}

// --> Stores for export.
export const counterStore = setStore(0)
  .on(increment, count => count + 1)
  .on(decrement, count => count - 1)
  .on(_asyncIncrement.fulfilled, (count, payload) => count + payload)
  .clear(reset);

export const dividedByFiveStore = setComputedStore({
  store: counterStore,
  condition: value => value % 5 === 0,
});

export const evenStore = setComputedStore({
  store: counterStore,
  condition: value => value % 2 === 0,
});

export const isEvenStore = setComputedStore({
  store: counterStore,
  transform: value => value !== 0 && value % 2 === 0,
});

export const millionIncrementsPerformanceStore = setStore(0)
  .on(_setPerformance, (_, payload) => Math.floor(payload))
  .clear(reset);

export const isLoadingStore = setStore(false)
  .on(_asyncIncrement.pending, () => true)
  .on(_asyncIncrement.fulfilled, () => false)
  .on(_asyncIncrement.rejected, () => false)
  .clear(reset);

export const errorStore = setStore('')
  .on(_asyncIncrement.rejected, (_, payload) => payload.message)
  .clear(_asyncIncrement.pending)
  .clear(reset);
