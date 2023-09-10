import V from "react";
var A = { exports: {} }, w = {};
/**
 * @license React
 * use-sync-external-store-shim.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var R;
function G() {
  if (R)
    return w;
  R = 1;
  var t = V;
  function O(n, o) {
    return n === o && (n !== 0 || 1 / n === 1 / o) || n !== n && o !== o;
  }
  var p = typeof Object.is == "function" ? Object.is : O, h = t.useState, y = t.useEffect, v = t.useLayoutEffect, m = t.useDebugValue;
  function L(n, o) {
    var a = o(), S = h({ inst: { value: a, getSnapshot: o } }), i = S[0].inst, d = S[1];
    return v(function() {
      i.value = a, i.getSnapshot = o, f(i) && d({ inst: i });
    }, [n, a, o]), y(function() {
      return f(i) && d({ inst: i }), n(function() {
        f(i) && d({ inst: i });
      });
    }, [n]), m(a), a;
  }
  function f(n) {
    var o = n.getSnapshot;
    n = n.value;
    try {
      var a = o();
      return !p(n, a);
    } catch {
      return !0;
    }
  }
  function g(n, o) {
    return o();
  }
  var E = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? g : L;
  return w.useSyncExternalStore = t.useSyncExternalStore !== void 0 ? t.useSyncExternalStore : E, w;
}
var T = {};
/**
 * @license React
 * use-sync-external-store-shim.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var D;
function B() {
  return D || (D = 1, process.env.NODE_ENV !== "production" && function() {
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
    var t = V, O = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function p(r) {
      {
        for (var e = arguments.length, s = new Array(e > 1 ? e - 1 : 0), u = 1; u < e; u++)
          s[u - 1] = arguments[u];
        h("error", r, s);
      }
    }
    function h(r, e, s) {
      {
        var u = O.ReactDebugCurrentFrame, l = u.getStackAddendum();
        l !== "" && (e += "%s", s = s.concat([l]));
        var _ = s.map(function(c) {
          return String(c);
        });
        _.unshift("Warning: " + e), Function.prototype.apply.call(console[r], console, _);
      }
    }
    function y(r, e) {
      return r === e && (r !== 0 || 1 / r === 1 / e) || r !== r && e !== e;
    }
    var v = typeof Object.is == "function" ? Object.is : y, m = t.useState, L = t.useEffect, f = t.useLayoutEffect, g = t.useDebugValue, E = !1, n = !1;
    function o(r, e, s) {
      E || t.startTransition !== void 0 && (E = !0, p("You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."));
      var u = e();
      if (!n) {
        var l = e();
        v(u, l) || (p("The result of getSnapshot should be cached to avoid an infinite loop"), n = !0);
      }
      var _ = m({
        inst: {
          value: u,
          getSnapshot: e
        }
      }), c = _[0].inst, x = _[1];
      return f(function() {
        c.value = u, c.getSnapshot = e, a(c) && x({
          inst: c
        });
      }, [r, u, e]), L(function() {
        a(c) && x({
          inst: c
        });
        var U = function() {
          a(c) && x({
            inst: c
          });
        };
        return r(U);
      }, [r]), g(u), u;
    }
    function a(r) {
      var e = r.getSnapshot, s = r.value;
      try {
        var u = e();
        return !v(s, u);
      } catch {
        return !0;
      }
    }
    function S(r, e, s) {
      return e();
    }
    var i = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u", d = !i, C = d ? S : o, I = t.useSyncExternalStore !== void 0 ? t.useSyncExternalStore : C;
    T.useSyncExternalStore = I, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
  }()), T;
}
process.env.NODE_ENV === "production" ? A.exports = G() : A.exports = B();
var N = A.exports;
function H(t) {
  return N.useSyncExternalStore(t.subscribe, t.getState);
}
export {
  H as useStore
};
