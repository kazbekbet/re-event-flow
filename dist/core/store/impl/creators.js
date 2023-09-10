import { EventImpl as u } from "./event.js";
import { Store as c } from "./store.js";
function d() {
  const e = new u();
  function n(t) {
    return e.fire(t);
  }
  return n.event = e, n;
}
function a(e) {
  const n = new u(), t = new u(), o = new u();
  async function r(...i) {
    n.fire(), s(e, ...i).then((f) => t.fire(f)).catch((f) => o.fire(f));
  }
  return r.pending = { event: n }, r.fulfilled = { event: t }, r.rejected = { event: o }, r;
}
async function s(e, ...n) {
  return await e(...n);
}
function m(e, n) {
  return new c(e, n);
}
function l({
  store: e,
  condition: n,
  transform: t
}) {
  const o = d();
  function r(i) {
    return typeof t == "function" ? t(i) : i;
  }
  return e.addComputedListener({
    condition: n ?? (() => !0),
    fn: (i) => o(i)
  }), new c(r(e.getState()), {}).on(o, (i, f) => r(f));
}
export {
  a as setAsyncEvent,
  l as setComputedStore,
  d as setEvent,
  m as setStore
};
