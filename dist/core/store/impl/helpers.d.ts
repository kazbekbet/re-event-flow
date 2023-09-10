import { SetEvent } from '../abstract/contracts';
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
export declare function redirect<Payload>({ event, handler, }: {
    event?: Event<Payload>;
    handler: Handler<Payload> | Handler<Payload>[];
}): Event<Payload>;
export {};
