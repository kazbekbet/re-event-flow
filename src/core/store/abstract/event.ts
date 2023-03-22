import { Stream } from '../../reactivity';

export abstract class Event<Val> extends Stream<Val> {}
