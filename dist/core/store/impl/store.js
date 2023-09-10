var u = Object.defineProperty;
var c = (i, e, t) => e in i ? u(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var s = (i, e, t) => (c(i, typeof e != "symbol" ? e + "" : e, t), t);
import { SubscriberImpl as a } from "../../reactivity/impl/subscriber.js";
class b {
  constructor(e, t) {
    s(this, "prevValue");
    s(this, "initialValue");
    s(this, "isLoggerAttached");
    s(this, "name");
    s(this, "watcherFn", () => {
    });
    s(this, "subscribers", /* @__PURE__ */ new Set());
    //TODO: подумать.
    s(this, "computedListeners", /* @__PURE__ */ new Set());
    s(this, "viewListeners", /* @__PURE__ */ new Set());
    s(this, "subscribe", (e) => (this.viewListeners.add(e), () => {
      this.viewListeners.delete(e);
    }));
    s(this, "getState", () => this.value);
    s(this, "getPrevState", () => this.prevValue);
    this.value = e, this.initialValue = e, this.prevValue = e, this.isLoggerAttached = !!(t != null && t.attachLogger), this.name = t == null ? void 0 : t.name;
  }
  notifyViewListeners() {
    this.viewListeners.forEach((e) => e());
  }
  on({ event: e }, t) {
    const r = new a(e);
    return this.subscribers.add(r), this.setListener(r, {
      isUpdatePrev: !0,
      reducer: t
    }), this;
  }
  clear({ event: e }) {
    const t = new a(e);
    return this.setListener(t, {
      isSetInitial: !0
    }), this;
  }
  setListener(e, {
    isUpdatePrev: t,
    isSetInitial: r,
    reducer: n
  }) {
    e.listen((h) => {
      t && (this.prevValue = this.value), r && (this.value = this.initialValue), typeof n == "function" && (this.value = n(this.value, h, this.initialValue)), this.notifyComputedListeners(this.value), this.watcherFn(this.value), this.log(), this.notifyViewListeners();
    });
  }
  watch(e) {
    return this.watcherFn = e, this;
  }
  destroy(e) {
    return new a(e).listen((r) => {
      this.subscribers.forEach((n) => {
        n.cancel();
      }), this.subscribers.clear(), this.value = this.initialValue;
    }), this;
  }
  /** Don't use directly. */
  addComputedListener(e) {
    this.computedListeners.add(e);
  }
  notifyComputedListeners(e) {
    this.computedListeners.forEach((t) => {
      t.condition(e) && t.fn(e);
    });
  }
  log() {
    if (this.isLoggerAttached) {
      const e = this.name ?? "";
      if (typeof this.value == "object") {
        console.log(`Current state of %c${e}:`, "color: green"), console.table(this.value);
        return;
      }
      console.log(`Current state of %c${e}:`, "color: green", this.value);
    }
  }
}
export {
  b as Store
};
