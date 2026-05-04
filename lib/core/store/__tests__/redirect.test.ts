import { setEvent } from '../impl/creators';
import { redirect } from '../impl/helpers';

/**
 * Characterization tests for `redirect` helper.
 *
 * These tests document CURRENT behavior of `redirect` so that an upcoming
 * refactor has a safety net.
 */

describe('redirect', () => {
  it('with explicit event: handler is called with payload when event fires; returned value is the same event (identity)', () => {
    const event = setEvent<number>();
    const handler = jest.fn();

    const returned = redirect({ event, handler });

    expect(returned).toBe(event);

    event(42);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(42);
  });

  it('without explicit event: a NEW event is created and returned; firing it calls handler', () => {
    const handler = jest.fn();

    const created = redirect<string>({ handler });

    // It's callable and has an `.event` property — same shape as setEvent's return.
    expect(typeof created).toBe('function');
    expect(created.event).toBeDefined();

    created('hello');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('hello');
  });

  it('handler as array: every handler is called with the same payload, in array order', () => {
    const callOrder: string[] = [];
    const h1 = jest.fn(() => {
      callOrder.push('h1');
    });
    const h2 = jest.fn(() => {
      callOrder.push('h2');
    });
    const h3 = jest.fn(() => {
      callOrder.push('h3');
    });

    const event = setEvent<{ id: number }>();
    redirect({ event, handler: [h1, h2, h3] });

    const payload = { id: 7 };
    event(payload);

    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
    expect(h3).toHaveBeenCalledTimes(1);
    expect(h1).toHaveBeenCalledWith(payload);
    expect(h2).toHaveBeenCalledWith(payload);
    expect(h3).toHaveBeenCalledWith(payload);
    expect(callOrder).toEqual(['h1', 'h2', 'h3']);
  });

  it('handler is invoked once per fire (no duplicate calls)', () => {
    const handler = jest.fn();
    const event = setEvent<number>();

    redirect({ event, handler });

    event(1);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('multiple fires: handler is called each time with the new payload', () => {
    const handler = jest.fn();
    const event = setEvent<number>();

    redirect({ event, handler });

    event(1);
    event(2);
    event(3);

    expect(handler).toHaveBeenCalledTimes(3);
    expect(handler.mock.calls[0][0]).toBe(1);
    expect(handler.mock.calls[1][0]).toBe(2);
    expect(handler.mock.calls[2][0]).toBe(3);
  });
});
