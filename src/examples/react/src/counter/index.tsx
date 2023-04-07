import { useStore } from '../../../../react';
import * as model from './model';

/**
 * Counter container.
 * */
export function Counter() {
  return (
    <>
      <DefaultCounter />
      <DivisibleByFiveCounter />
      <EvenCounter />
      <EvenTransformIndicator />
      <AsyncStatus />
      <Performance />
      <Buttons />
    </>
  );
}

/**
 * Render every count change.
 * */
function DefaultCounter() {
  const counter = useStore(model.counterStore);

  return <h1>Default counter: {counter}</h1>;
}

/**
 * Render only if value is can be divisible by 5 without a remainder .
 * */
function DivisibleByFiveCounter() {
  const counter = useStore(model.dividedByFiveStore);

  return <h1>Divided by five: {counter}</h1>;
}

/**
 * Render only if value is can be divisible by 2 without a remainder .
 * */
function EvenCounter() {
  const counter = useStore(model.evenStore);

  return <h1>Even: {counter}</h1>;
}

/**
 * Render every time when condition is changes (isEven).
 * */
function EvenTransformIndicator() {
  const isEven = useStore(model.isEvenStore);

  return (
    <h1>
      Is counter even:{' '}
      <span style={{ color: isEven ? 'green' : 'red' }}>
        {isEven ? 'Yes' : 'No'}
      </span>
    </h1>
  );
}

/**
 * Render when async status is changed.
 * */
function AsyncStatus() {
  const isLoading = useStore(model.isLoadingStore);
  const error = useStore(model.errorStore);

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </>
  );
}

function Performance() {
  const performance = useStore(model.millionIncrementsPerformanceStore);

  return (
    <>
      {Boolean(performance) && <p>1 million increments performs on: {performance} ms.</p>}
    </>
  );
}

/**
 * Controls.
 * */
function Buttons() {
  return (
    <>
      <button onClick={model.increment}>Increment</button>
      <button onClick={model.decrement}>Decrement</button>
      <button onClick={model.handleAsyncIncrementSuccess}>
        Async increment
      </button>
      <button onClick={model.handleAsyncIncrementError}>Async error</button>
      <button onClick={model.callMillionTimes}>
        Increment 1M times
      </button>
      <button onClick={model.reset}>Reset</button>
    </>
  );
}
