import { setEvent, setStore } from '../impl/creators';
import { Store } from '../impl/store';

/**
 * Characterization tests for `setStore` creator.
 *
 * These tests are written against current behavior — including known
 * quirks — to provide a safety net for the upcoming refactor.
 */

describe('setStore', () => {
  describe('basics', () => {
    it('returns a Store instance', () => {
      const store = setStore(0);
      expect(store).toBeInstanceOf(Store);
    });

    it('getState() returns the initial value', () => {
      const store = setStore({ count: 7 });
      expect(store.getState()).toEqual({ count: 7 });
    });

    it('getPrevState() returns the initial value before any event has fired', () => {
      const store = setStore('initial');
      expect(store.getPrevState()).toBe('initial');
    });
  });

  describe('chaining', () => {
    it('.on, .clear, .watch all return the Store (chainable)', () => {
      const inc = setEvent<number>();
      const reset = setEvent<void>();
      const store = setStore(0);

      const afterOn = store.on(inc, (state, payload) => state + payload);
      expect(afterOn).toBe(store);

      const afterClear = store.clear(reset);
      expect(afterClear).toBe(store);

      const afterWatch = store.watch(() => {});
      expect(afterWatch).toBe(store);

      // Combined chain works as well.
      const result = setStore(0)
        .on(inc, (s, p) => s + p)
        .on(inc, s => s)
        .clear(reset)
        .watch(() => {});

      expect(result).toBeInstanceOf(Store);
    });
  });

  describe('options.attachLogger', () => {
    let logSpy: jest.SpyInstance;
    let tableSpy: jest.SpyInstance;

    beforeEach(() => {
      logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      tableSpy = jest.spyOn(console, 'table').mockImplementation(() => {});
    });

    afterEach(() => {
      logSpy.mockRestore();
      tableSpy.mockRestore();
    });

    it('logs to console.log on update when attachLogger is true (primitive value)', () => {
      const inc = setEvent<number>();
      setStore(0, { attachLogger: true, name: 'counter' }).on(inc, (s, p) => s + p);

      inc(5);

      expect(logSpy).toHaveBeenCalled();
      // For primitive values, console.log receives 3 args: format string, css, value
      const call = logSpy.mock.calls[0];
      expect(call[0]).toContain('Current state of');
      expect(call[2]).toBe(5);
      expect(tableSpy).not.toHaveBeenCalled();
    });

    it('uses console.table for object state, plus a console.log header', () => {
      const update = setEvent<{ a: number }>();
      setStore({ a: 0 }, { attachLogger: true, name: 'objStore' }).on(update, (_s, p) => p);

      update({ a: 1 });

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(tableSpy).toHaveBeenCalledTimes(1);
      expect(tableSpy.mock.calls[0][0]).toEqual({ a: 1 });
    });

    it('does not log when attachLogger is absent', () => {
      const inc = setEvent<number>();
      setStore(0).on(inc, (s, p) => s + p);

      inc(1);

      expect(logSpy).not.toHaveBeenCalled();
      expect(tableSpy).not.toHaveBeenCalled();
    });

    it('does not log when attachLogger is false', () => {
      const inc = setEvent<number>();
      setStore(0, { attachLogger: false, name: 'silent' }).on(inc, (s, p) => s + p);

      inc(1);

      expect(logSpy).not.toHaveBeenCalled();
      expect(tableSpy).not.toHaveBeenCalled();
    });
  });

  describe('options.name', () => {
    let logSpy: jest.SpyInstance;
    let tableSpy: jest.SpyInstance;

    beforeEach(() => {
      logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      tableSpy = jest.spyOn(console, 'table').mockImplementation(() => {});
    });

    afterEach(() => {
      logSpy.mockRestore();
      tableSpy.mockRestore();
    });

    it('includes the configured name in the log output (primitive)', () => {
      const inc = setEvent<number>();
      setStore(0, { attachLogger: true, name: 'myCoolStore' }).on(inc, (s, p) => s + p);

      inc(1);

      const formatString = logSpy.mock.calls[0][0] as string;
      expect(formatString).toContain('myCoolStore');
    });

    it('includes the configured name in the log output (object)', () => {
      const update = setEvent<{ x: number }>();
      setStore({ x: 0 }, { attachLogger: true, name: 'objLog' }).on(update, (_s, p) => p);

      update({ x: 1 });

      const formatString = logSpy.mock.calls[0][0] as string;
      expect(formatString).toContain('objLog');
    });

    it('logs an empty name when name is omitted but attachLogger is true', () => {
      const inc = setEvent<number>();
      setStore(0, { attachLogger: true }).on(inc, (s, p) => s + p);

      inc(1);

      const formatString = logSpy.mock.calls[0][0] as string;
      // Currently formats as `Current state of %c:` (empty name).
      expect(formatString).toContain('Current state of');
    });
  });
});
