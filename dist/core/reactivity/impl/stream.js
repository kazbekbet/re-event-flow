var e = Object.defineProperty;
var c = (i, s, t) => s in i ? e(i, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[s] = t;
var r = (i, s, t) => (c(i, typeof s != "symbol" ? s + "" : s, t), t);
class h {
  constructor(s, t) {
    r(this, "subscribers", /* @__PURE__ */ new Set());
    this._value = s, this.checkEqualFunc = t;
  }
  get value() {
    return this._value;
  }
  addSubscriber(s) {
    this.subscribers.add(s);
  }
  clearSubscriber(s) {
    this.subscribers.delete(s);
  }
  fire(s) {
    return typeof this.checkEqualFunc == "function" && s && !this.checkEqualFunc(s, this._value) ? (this._value = s, this.notifySubs(s), this) : (this._value = s, this.notifySubs(s), this);
  }
  notifySubs(s) {
    this.subscribers.forEach((t) => t.notify(s));
  }
}
export {
  h as StreamImpl
};
