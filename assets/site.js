/* PURSUIT site behaviour: menu, bios, newsreel and the hero monitor. */
(function () {
  "use strict";

  /* Mobile menu */
  var header = document.getElementById("site-header");
  var toggle = header && header.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    header.querySelectorAll(".site-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Photos that fail to load fall back to initials */
  document.querySelectorAll(".photo img").forEach(function (img) {
    function fail() { img.classList.add("failed"); }
    if (img.complete && img.naturalWidth === 0) { fail(); }
    img.addEventListener("error", fail);
  });

  /* Bio dialogs */
  document.querySelectorAll("[data-bio]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var dlg = document.getElementById(btn.getAttribute("data-bio"));
      if (!dlg) { return; }
      if (typeof dlg.showModal === "function") { dlg.showModal(); }
      else { dlg.setAttribute("open", ""); }
    });
  });
  document.querySelectorAll("dialog.bio").forEach(function (dlg) {
    var closeBtn = dlg.querySelector("[data-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        if (typeof dlg.close === "function") { dlg.close(); } else { dlg.removeAttribute("open"); }
      });
    }
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg && typeof dlg.close === "function") { dlg.close(); }
    });
  });

  /* Newsreel arrows */
  var reel = document.getElementById("reel");
  var reelBtns = document.querySelectorAll(".reel-btn");
  function updateReel() {
    if (!reel) { return; }
    var max = reel.scrollWidth - reel.clientWidth - 2;
    reelBtns.forEach(function (b) {
      var dir = Number(b.getAttribute("data-dir"));
      b.disabled = dir < 0 ? reel.scrollLeft <= 2 : reel.scrollLeft >= max;
    });
  }
  if (reel) {
    reelBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var card = reel.querySelector(".story");
        var step = card ? card.getBoundingClientRect().width + 18 : 340;
        reel.scrollBy({ left: Number(b.getAttribute("data-dir")) * step, behavior: "smooth" });
      });
    });
    reel.addEventListener("scroll", function () { window.requestAnimationFrame(updateReel); }, { passive: true });
    window.addEventListener("resize", updateReel);
    updateReel();
  }

  /* Copy buttons */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var label = btn.textContent;
      function done(msg) {
        btn.textContent = msg;
        window.setTimeout(function () { btn.textContent = label; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done("Copied"); }, function () { done(text); });
      } else {
        done(text);
      }
    });
  });

  /* Hero monitor: three bedside channels drawn with a sweeping erase bar */
  var canvas = document.querySelector(".hero-monitor");
  if (!canvas || !canvas.getContext) { return; }
  var hero = canvas.parentElement;
  var ctx = canvas.getContext("2d");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var W = 0, H = 0, dpr = 1;
  var head = 0, sweep = 1, lastT = 0, running = false, onScreen = true;

  function g(x, m, s) { return Math.exp(-((x - m) * (x - m)) / (2 * s * s)); }
  function ecg(p) {
    return 0.1 * g(p, 0.16, 0.022) - 0.1 * g(p, 0.33, 0.007) + 1.0 * g(p, 0.355, 0.0085) -
      0.26 * g(p, 0.378, 0.009) + 0.26 * g(p, 0.6, 0.04);
  }
  function art(p) {
    var q = (p + 0.65) % 1;
    var main = q < 0.12 ? g(q, 0.12, 0.028) : g(q, 0.12, 0.09);
    return 0.95 * main + 0.2 * g(q, 0.31, 0.03) - 0.07 * g(q, 0.255, 0.012);
  }
  function pleth(p) {
    var q = (p + 0.6) % 1;
    var main = q < 0.2 ? g(q, 0.2, 0.06) : g(q, 0.2, 0.13);
    return 0.9 * main + 0.1 * g(q, 0.45, 0.04);
  }

  var channels = [
    { label: "II", value: "HR 78", color: "rgba(232,240,243,0.82)", fn: ecg, amp: 0.62 },
    { label: "ART", value: "118/64 (82)", color: "#FF6A4D", fn: art, amp: 0.6 },
    { label: "SpO₂", value: "97", color: "#41D3C8", fn: pleth, amp: 0.5 }
  ];

  var copy = hero.querySelector(".hero-copy");
  function layout() {
    var wide = W >= 1180;
    var copyRight = copy ? copy.getBoundingClientRect().right - hero.getBoundingClientRect().left : W * 0.5;
    var x0 = wide ? Math.round(Math.max(W * 0.5, copyRight + 56)) : 0;
    var x1 = wide ? W - 140 : W;
    var top = wide ? H * 0.2 : H - 186;
    var bottom = wide ? H * 0.84 : H - 20;
    return { wide: wide, x0: x0, x1: x1, top: top, band: (bottom - top) / channels.length, beat: wide ? Math.max(150, Math.min(210, W * 0.13)) : 118 };
  }

  function resize() {
    var r = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() {
    var L = layout();
    var span = L.x1 - L.x0;
    ctx.clearRect(0, 0, W, H);
    var gap = reduceMotion.matches ? 0 : 26;
    channels.forEach(function (c, i) {
      var base = L.top + L.band * (i + 0.78);
      var amp = L.band * c.amp;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = c.color;
      ctx.globalAlpha = L.wide ? 1 : 0.85;
      ctx.beginPath();
      var started = false;
      for (var x = L.x0; x <= L.x1; x += 2) {
        var rel = x - L.x0;
        var inGap = gap && rel > head && rel < head + gap;
        if (inGap) { started = false; continue; }
        var offset = rel <= head ? sweep * span : (sweep - 1) * span;
        var p = ((rel + offset) / L.beat) % 1;
        var y = base - c.fn(p) * amp;
        if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
      }
      ctx.stroke();
      if (gap) {
        var hp = ((head + sweep * span) / L.beat) % 1;
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.arc(L.x0 + head, base - c.fn(hp) * amp, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (L.wide) {
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = c.color;
        ctx.font = "500 11px 'IBM Plex Mono', ui-monospace, monospace";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(c.label, L.x0, base - amp - 10);
        ctx.font = "500 15px 'IBM Plex Mono', ui-monospace, monospace";
        ctx.textAlign = "right";
        ctx.fillText(c.value, W - 24, base - amp * 0.35);
        ctx.textAlign = "left";
      }
      ctx.globalAlpha = 1;
    });
  }

  function frame(t) {
    if (!running) { return; }
    var dt = lastT ? Math.min(64, t - lastT) : 16;
    lastT = t;
    var L = layout();
    head += dt * (L.wide ? 0.13 : 0.09);
    if (head > L.x1 - L.x0) { head = 0; sweep += 1; }
    draw();
    window.requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduceMotion.matches || !onScreen || document.hidden) { return; }
    running = true;
    lastT = 0;
    window.requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  resize();
  head = Math.round((layout().x1 - layout().x0) * 0.62);
  draw();
  start();

  if ("ResizeObserver" in window) { new ResizeObserver(resize).observe(hero); }
  else { window.addEventListener("resize", resize); }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) { start(); } else { stop(); }
    }).observe(hero);
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) { stop(); } else { start(); } });
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", function () { stop(); draw(); start(); });
  }
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(draw); }
})();
