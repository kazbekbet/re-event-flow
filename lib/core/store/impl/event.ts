import { StreamImpl } from '../../reactivity';
import { Event } from '../abstract/event';

/** Event implementation. */
export class EventImpl<Val> extends StreamImpl<Val> implements Event<Val> {}
