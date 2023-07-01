export declare abstract class Subscriber<Val> {
    abstract notify(value: Val): void;
    abstract listen<Res, Payload>(fn: (value: Payload) => Res): ThisType<Subscriber<Val>>;
    abstract pause(): ThisType<Subscriber<Val>>;
    abstract resume(): ThisType<Subscriber<Val>>;
    abstract cancel(): ThisType<Subscriber<Val>>;
}
