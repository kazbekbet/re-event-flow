import { SetEvent } from '../abstract/contracts';
import { setEvent, setStore } from './index';

// TODO: refactor.
/**
 * Event definition.
 * */
type Event<Payload> = SetEvent.Return<Payload>;

type Handler<Payload> = (val: Payload) => unknown;

/**
 * Creates a one-way link between event and handler.
 * If the event is fired then the handler will be fired.
 * If the event was not passed then the redirect create and return new event.
 *
 * @param {Event<T>} [event].
 * @param {Handler<T> | Handler<T>[]} handler.
 * */
export function redirect<Payload>({
  event = setEvent<Payload>(),
  handler,
}: {
  event?: Event<Payload>;
  handler: Handler<Payload> | Handler<Payload>[];
}) {
  setStore(handler).on(event, (memoizedHandler, payload) => {
    if (Array.isArray(memoizedHandler)) {
      memoizedHandler.forEach(handlers => handlers(payload));
    } else {
      memoizedHandler(payload);
    }

    return memoizedHandler;
  });

  return event;
}
