import { StreamImpl } from '../impl/stream';
import type { Subscriber } from '../abstract/subscriber';

/**
 * Characterization tests for StreamImpl.
 *
 * These tests are intentionally written against the *current* behavior
 * of the implementation (including known quirks) so that a future
 * refactor has a safety net to detect any unintended behavior change.
 */

function makeFakeSubscriber<Val>(): Subscriber<Val> & { calls: Val[] } {
  const calls: Val[] = [];
  const sub: Subscriber<Val> & { calls: Val[] } = {
    calls,
    notify(value: Val) {
      calls.push(value);
    },
    listen() {
      return sub;
    },
    pause() {
      return sub;
    },
    resume() {
      return sub;
    },
    cancel() {
      return sub;
    },
  };
  return sub;
}

describe('StreamImpl', () => {
  describe('constructor', () => {
    it('initializes with undefined when no value is provided', () => {
      const stream = new StreamImpl<number>();
      expect(stream.value).toBeUndefined();
    });

    it('initializes with the provided initial value', () => {
      const stream = new StreamImpl<number>(42);
      expect(stream.value).toBe(42);
    });
  });

  describe('fire', () => {
    it('updates .value with the fired value', () => {
      const stream = new StreamImpl<number>();
      stream.fire(7);
      expect(stream.value).toBe(7);
    });

    it('notifies every subscriber exactly once per fire', () => {
      const stream = new StreamImpl<number>();
      const sub = makeFakeSubscriber<number>();
      stream.addSubscriber(sub);

      stream.fire(1);

      expect(sub.calls).toEqual([1]);
    });

    it('returns this (chainable)', () => {
      const stream = new StreamImpl<number>();
      expect(stream.fire(1)).toBe(stream);
      expect(stream.fire(2)).toBe(stream);
    });
  });

  describe('multiple subscribers', () => {
    it('notifies every subscriber on fire', () => {
      const stream = new StreamImpl<string>();
      const a = makeFakeSubscriber<string>();
      const b = makeFakeSubscriber<string>();
      const c = makeFakeSubscriber<string>();

      stream.addSubscriber(a);
      stream.addSubscriber(b);
      stream.addSubscriber(c);

      stream.fire('hi');

      expect(a.calls).toEqual(['hi']);
      expect(b.calls).toEqual(['hi']);
      expect(c.calls).toEqual(['hi']);
    });

    it('clearSubscriber removes one without affecting the others', () => {
      const stream = new StreamImpl<string>();
      const a = makeFakeSubscriber<string>();
      const b = makeFakeSubscriber<string>();
      const c = makeFakeSubscriber<string>();

      stream.addSubscriber(a);
      stream.addSubscriber(b);
      stream.addSubscriber(c);

      stream.clearSubscriber(b);
      stream.fire('x');

      expect(a.calls).toEqual(['x']);
      expect(b.calls).toEqual([]);
      expect(c.calls).toEqual(['x']);
    });

    it('does not invoke a subscriber that was cleared before firing', () => {
      const stream = new StreamImpl<number>();
      const sub = makeFakeSubscriber<number>();
      stream.addSubscriber(sub);
      stream.clearSubscriber(sub);

      stream.fire(99);

      expect(sub.calls).toEqual([]);
    });
  });

  describe('clearSubscriber', () => {
    it('is a no-op for an unknown subscriber', () => {
      const stream = new StreamImpl<number>();
      const known = makeFakeSubscriber<number>();
      const unknown = makeFakeSubscriber<number>();
      stream.addSubscriber(known);

      expect(() => stream.clearSubscriber(unknown)).not.toThrow();

      stream.fire(5);
      expect(known.calls).toEqual([5]);
      expect(unknown.calls).toEqual([]);
    });
  });

  describe('checkEqualFunc', () => {
    /**
     * QUIRK: the `fire` method's structure means that even when equal
     * returns true (i.e. values are considered equal and notification
     * should logically be skipped), control falls through to the
     * unconditional `this._value = value; this.notifySubs(value);` at
     * the bottom of the method. The "early return" path exists only
     * inside the `!equal(...)` branch, so equal=true does NOT actually
     * short-circuit notification. Documented here as current behavior;
     * to be addressed by the upcoming refactor.
     */
    it('QUIRK: equal returning true does NOT skip notification — subscribers still get notified', () => {
      const equal = jest.fn().mockReturnValue(true);
      const stream = new StreamImpl<number>(1, equal);
      const sub = makeFakeSubscriber<number>();
      stream.addSubscriber(sub);

      stream.fire(2);

      expect(equal).toHaveBeenCalledTimes(1);
      expect(sub.calls).toEqual([2]);
      expect(stream.value).toBe(2);
    });

    it('calls equal with (newValue, prevValue) — current argument order', () => {
      const equal = jest.fn().mockReturnValue(false);
      const stream = new StreamImpl<number>(10, equal);
      const sub = makeFakeSubscriber<number>();
      stream.addSubscriber(sub);

      stream.fire(20);

      // Documents current behavior: the new (incoming) value is passed first,
      // the previously stored value second. Refactor candidate.
      expect(equal).toHaveBeenCalledWith(20, 10);
    });

    it('notifies and updates _value when equal returns false and the new value is truthy', () => {
      const equal = jest.fn().mockReturnValue(false);
      const stream = new StreamImpl<number>(1, equal);
      const sub = makeFakeSubscriber<number>();
      stream.addSubscriber(sub);

      stream.fire(2);

      expect(stream.value).toBe(2);
      expect(sub.calls).toEqual([2]);
    });

    /**
     * QUIRK: in StreamImpl.fire, the equality short-circuit branch is gated by
     * `if (typeof this.checkEqualFunc === 'function' && value)`. When the
     * incoming `value` is falsy (0, '', false, null, undefined), the truthy
     * guard fails, equal is NEVER consulted, and subscribers are notified
     * unconditionally. This is current behavior to be revisited in the
     * upcoming refactor.
     */
    it('QUIRK: bypasses equal and notifies when value is 0 (falsy), even if equal would return true', () => {
      const equal = jest.fn().mockReturnValue(true);
      const stream = new StreamImpl<number>(0, equal);
      const sub = makeFakeSubscriber<number>();
      stream.addSubscriber(sub);

      stream.fire(0);

      expect(equal).not.toHaveBeenCalled();
      expect(sub.calls).toEqual([0]);
      expect(stream.value).toBe(0);
    });

    it('QUIRK: bypasses equal and notifies when value is empty string, even if equal would return true', () => {
      const equal = jest.fn().mockReturnValue(true);
      const stream = new StreamImpl<string>('prev', equal);
      const sub = makeFakeSubscriber<string>();
      stream.addSubscriber(sub);

      stream.fire('');

      expect(equal).not.toHaveBeenCalled();
      expect(sub.calls).toEqual(['']);
      expect(stream.value).toBe('');
    });

    it('QUIRK: bypasses equal and notifies when value is false, even if equal would return true', () => {
      const equal = jest.fn().mockReturnValue(true);
      const stream = new StreamImpl<boolean>(true, equal);
      const sub = makeFakeSubscriber<boolean>();
      stream.addSubscriber(sub);

      stream.fire(false);

      expect(equal).not.toHaveBeenCalled();
      expect(sub.calls).toEqual([false]);
      expect(stream.value).toBe(false);
    });
  });
});
