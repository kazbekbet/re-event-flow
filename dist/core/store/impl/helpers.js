import { setStore as c, setEvent as i } from "./creators.js";
import "./store.js";
function p({
  event: t = i(),
  handler: o
}) {
  return c(o).on(t, (r, f) => (Array.isArray(r) ? r.forEach((s) => s(f)) : r(f), r)), t;
}
export {
  p as redirect
};
