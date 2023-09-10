# Re-event-flow state manager.

Light (2.63 kb gzip) state manager stream based inspired by [effector](https://github.com/effector/effector).

## Installation

> NPM
```bash
npm add re-event-flow
```

> Yarn
```bash
yarn add re-event-flow
```

## How to use
> Simple counter example with computed store
```typescript
// --> Initialize event
const increment = setEvent();

// --> Initialize store
const counterStore = setStore(0)
  .on(increment, count => count + 1);
  
// --> Initialize computed store if needed
const dividedByFiveStore = setComputedStore({
  store: counterStore,
  condition: value => value % 5 === 0,
}).watch(value => console.log('Divided by five with value:', value));

increment(1); // nothing happens...
increment(1); // nothing happens...
increment(1); // nothing happens...
increment(1); // nothing happens...
increment(1); // Prints "Divided by five with value: 5"
```

> Simple counter example with async effects
```typescript
// --> Promise for example
function asyncCount(countTo: number, delay: number, isReject: boolean): Promise<number> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      isReject ? reject({ message: 'Error!' }) : resolve(countTo);
    }, delay);
  });
}

// --> Initialize effect (underscore for private in this case)
const _asyncIncrement = setAsyncEvent(({ countTo, delay, isReject }: AsyncIncrementPayload) =>
  asyncCount(countTo, delay, isReject)
);

// --> Initialize success handler (for fulfilled example)
function handleAsyncIncrementSuccess() {
  _asyncIncrement({ delay: 1000, countTo: 1000, isReject: false });
}

// --> Initialize success handler (for rejected example)
function handleAsyncIncrementError() {
  _asyncIncrement({ delay: 1000, countTo: 1000, isReject: true });
}

// --> Initialize store with counter
const counterStore = setStore(0)
  .on(_asyncIncrement.fulfilled, (count, payload) => count + payload)
  .watch(value => console.log('With success value:', value));

// --> Initialize loading store
const isLoadingStore = setStore(false)
  .on(_asyncIncrement.pending, () => true)
  .on(_asyncIncrement.fulfilled, () => false)
  .on(_asyncIncrement.rejected, () => false)
  .watch(value => console.log('isLoading:', value));

// --> Initialize error store
const errorStore = setStore('')
  .on(_asyncIncrement.rejected, (_, payload) => payload.message)
  .watch(value => console.log('With error message:', value));
  
// --> Success call example
handleAsyncIncrementSuccess(); // Prints "isLoading: true"
// ...after 1 second prints 'With success value: 1'
// Prints "isLoading: false"

// --> Error call example
handleAsyncIncrementError(); // Prints "isLoading: true"
// ...after 1 second prints 'With error message: Error!'
// Prints "isLoading: false"
```

> Extended counter example with react [click here](https://github.com/kazbekbet/re-event-flow/tree/master/src/counter).

### Enjoy!
