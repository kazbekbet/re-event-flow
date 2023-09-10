var i = Object.defineProperty;
var c = (r, s, t) => s in r ? i(r, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[s] = t;
var e = (r, s, t) => (c(r, typeof s != "symbol" ? s + "" : s, t), t);
class h {
  constructor(s) {
    e(this, "listenFuncs", /* @__PURE__ */ new Set());
    this.stream = s, s.addSubscriber(this);
  }
  notify(s) {
    this.listenFuncs.forEach((t) => t(s));
  }
  listen(s) {
    return this.listenFuncs.add(s), this;
  }
  pause() {
    return this.stream.clearSubscriber(this), this;
  }
  resume() {
    return this.stream.addSubscriber(this), this;
  }
  cancel() {
    return this.listenFuncs.clear(), this.stream.clearSubscriber(this), this;
  }
}
export {
  h as SubscriberImpl
};
