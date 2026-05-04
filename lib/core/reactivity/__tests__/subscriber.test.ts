import { StreamImpl } from '../impl/stream';
import { SubscriberImpl } from '../impl/subscriber';

/**
 * Characterization tests for SubscriberImpl.
 *
 * Uses a real StreamImpl as the underlying stream, because the
 * SubscriberImpl constructor side-effects on the stream
 * (auto-adding itself via stream.addSubscriber).
 */

describe('SubscriberImpl', () => {
  it('constructor auto-adds itself to the stream; firing with no listeners is a no-op', () => {
    const stream = new StreamImpl<number>();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sub = new SubscriberImpl<number>(stream);

    // No listeners registered; firing should not throw.
    expect(() => stream.fire(1)).not.toThrow();
    expect(sub.listenFuncs.size).toBe(0);
  });

  it('listen registers a function that fires with the value when the stream fires', () => {
    const stream = new StreamImpl<number>();
    const sub = new SubscriberImpl<number>(stream);
    const fn = jest.fn();

    sub.listen(fn);
    stream.fire(42);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(42);
  });

  it('multiple listen calls register multiple functions; all fire on notify', () => {
    const stream = new StreamImpl<string>();
    const sub = new SubscriberImpl<string>(stream);
    const a = jest.fn();
    const b = jest.fn();
    const c = jest.fn();

    sub.listen(a).listen(b).listen(c);
    stream.fire('hello');

    expect(a).toHaveBeenCalledWith('hello');
    expect(b).toHaveBeenCalledWith('hello');
    expect(c).toHaveBeenCalledWith('hello');
  });

  it('pause removes the subscriber from the stream — listeners are not called on subsequent fire', () => {
    const stream = new StreamImpl<number>();
    const sub = new SubscriberImpl<number>(stream);
    const fn = jest.fn();
    sub.listen(fn);

    sub.pause();
    stream.fire(1);

    expect(fn).not.toHaveBeenCalled();
  });

  it('resume re-adds the subscriber; listener functions are preserved across pause/resume', () => {
    const stream = new StreamImpl<number>();
    const sub = new SubscriberImpl<number>(stream);
    const fn = jest.fn();
    sub.listen(fn);

    sub.pause();
    stream.fire(1);
    expect(fn).not.toHaveBeenCalled();

    sub.resume();
    stream.fire(2);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(2);
  });

  it('cancel clears all listener functions AND removes from stream', () => {
    const stream = new StreamImpl<number>();
    const sub = new SubscriberImpl<number>(stream);
    const fn = jest.fn();
    sub.listen(fn);

    sub.cancel();

    // Listener functions are cleared.
    expect(sub.listenFuncs.size).toBe(0);

    // Removed from stream — firing won't reach it.
    stream.fire(1);
    expect(fn).not.toHaveBeenCalled();

    // Even calling notify directly invokes nothing because the listener
    // functions Set was emptied.
    sub.notify(2);
    expect(fn).not.toHaveBeenCalled();

    // After cancel, resume re-adds the subscriber to the stream but
    // there are no listener functions left, so it's effectively a no-op.
    sub.resume();
    stream.fire(3);
    expect(fn).not.toHaveBeenCalled();
  });

  it('listen, pause, resume, cancel all return this (chainable)', () => {
    const stream = new StreamImpl<number>();
    const sub = new SubscriberImpl<number>(stream);
    const fn = () => undefined;

    expect(sub.listen(fn)).toBe(sub);
    expect(sub.pause()).toBe(sub);
    expect(sub.resume()).toBe(sub);
    expect(sub.cancel()).toBe(sub);
  });

  it('Set semantics: same listener function added twice is stored once and invoked once on fire', () => {
    const stream = new StreamImpl<number>();
    const sub = new SubscriberImpl<number>(stream);
    const fn = jest.fn();

    sub.listen(fn);
    sub.listen(fn);

    expect(sub.listenFuncs.size).toBe(1);

    stream.fire(7);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(7);
  });
});
