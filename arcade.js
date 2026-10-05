/* Small shared helpers used by every game. Deliberately tiny — each game
   owns its own logic, this only removes the boilerplate they all repeat. */
(function (global) {
  "use strict";

  // Crisp canvas at a fixed logical size, scaled for the device pixel ratio.
  function fit(canvas, w, h) {
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.aspectRatio = w + " / " + h;
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.W = w;
    ctx.H = h;
    return ctx;
  }

  // Live keyboard state. keys.down("ArrowLeft"), keys.pressed consumed once.
  function keys(target) {
    var state = Object.create(null);
    var once = Object.create(null);
    var el = target || global;
    el.addEventListener("keydown", function (e) {
      if (!state[e.key]) once[e.key] = true;
      state[e.key] = true;
      // stop the page scrolling under the game
      if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.key) >= 0) e.preventDefault();
    });
    el.addEventListener("keyup", function (e) { state[e.key] = false; });
    global.addEventListener("blur", function () {
      for (var k in state) state[k] = false;
    });
    return {
      down: function (k) { return !!state[k]; },
      any: function () {
        for (var i = 0; i < arguments.length; i++) if (state[arguments[i]]) return true;
        return false;
      },
      // true once per physical press
      tapped: function (k) { if (once[k]) { once[k] = false; return true; } return false; },
      set: function (k, v) { if (v && !state[k]) once[k] = true; state[k] = v; },
      clear: function () { for (var k in state) { state[k] = false; once[k] = false; } }
    };
  }

  // requestAnimationFrame loop handing you a clamped delta in seconds.
  function loop(fn) {
    var last = 0, id = 0, running = true;
    function step(now) {
      if (!running) return;
      if (!last) last = now;
      var dt = (now - last) / 1000;
      last = now;
      if (dt > 0.1) dt = 0.1;         // never let a background tab fast-forward the world
      fn(dt, now);
      id = global.requestAnimationFrame(step);
    }
    id = global.requestAnimationFrame(step);
    return {
      stop: function () { running = false; global.cancelAnimationFrame(id); },
      pause: function () { running = false; global.cancelAnimationFrame(id); },
      resume: function () { if (!running) { running = true; last = 0; id = global.requestAnimationFrame(step); } }
    };
  }

  // High score, tolerant of blocked storage (private windows, cleared data).
  function best(key, score) {
    var k = "evercharge:" + key;
    var cur = 0;
    try { cur = parseInt(global.localStorage.getItem(k) || "0", 10) || 0; } catch (e) { cur = 0; }
    if (typeof score === "number" && score > cur) {
      cur = score;
      try { global.localStorage.setItem(k, String(score)); } catch (e) {}
    }
    return cur;
  }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function rndInt(a, b) { return Math.floor(rnd(a, b + 1)); }
  function dist(x1, y1, x2, y2) { var dx = x2 - x1, dy = y2 - y1; return Math.sqrt(dx * dx + dy * dy); }

  // Rounded rect path, used all over the place.
  function rrect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Wires up the standard overlay: show a panel, run a callback on the button.
  function overlay(el) {
    return {
      show: function (html) { el.innerHTML = '<div class="panel">' + html + "</div>"; el.hidden = false; },
      hide: function () { el.hidden = true; },
      get visible() { return !el.hidden; },
      onClick: function (sel, fn) {
        el.addEventListener("click", function (e) {
          var b = e.target.closest(sel);
          if (b) fn(b);
        });
      }
    };
  }

  // Binds on-screen buttons (data-key="ArrowLeft") to the key state, for touch.
  function touchKeys(container, k) {
    if (!container) return;
    container.querySelectorAll("[data-key]").forEach(function (btn) {
      var key = btn.getAttribute("data-key");
      var set = function (v) { return function (e) { e.preventDefault(); k.set(key, v); }; };
      btn.addEventListener("pointerdown", set(true));
      btn.addEventListener("pointerup", set(false));
      btn.addEventListener("pointerleave", set(false));
      btn.addEventListener("pointercancel", set(false));
      btn.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    });
  }

  global.Arcade = {
    fit: fit, keys: keys, loop: loop, best: best,
    clamp: clamp, rnd: rnd, rndInt: rndInt, dist: dist,
    rrect: rrect, overlay: overlay, touchKeys: touchKeys
  };
})(window);
