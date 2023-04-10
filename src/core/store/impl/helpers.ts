import { SetEvent } from '../abstract/contracts';
import { setEvent, setStore } from './index';

/**
 * Creates a one-way link between event and handler.
 * If the event is fired then the handler will be fired.
 * If the event was not passed then the redirect create and return new event.
 *
 * @param {SetEvent.Return<Payload>} [event].
 * @param {Function} handler.
 * */
export function redirect<Payload>({
  event = setEvent<Payload>(),
  handler,
}: {
  event?: SetEvent.Return<Payload>;
  handler: (val: Payload) => unknown;
}) {
  setStore(handler).on(event, (memoizedHandler, payload) => {
    memoizedHandler(payload);

    return memoizedHandler;
  });

  return event;
}
