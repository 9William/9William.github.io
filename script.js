"use strict";

const codeEl = document.querySelector("#code");
const fileEl = document.querySelector("#file");
const statusEl = document.querySelector("#statustext");
const timeEl = document.querySelector("#time");
const ampmEl = document.querySelector("#ampm");
const winEl = document.querySelector(".win");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const SNIPPETS = [
  {
    file: "~/folio/profile.ts",
    lines: [
      [["kw", "const"], ["pl", " "], ["var", "gerry"], ["pl", " "], ["pun", "= {"]],
      [["pl", "  "], ["prop", "name"], ["pun", ": "], ["str", "\"Gerry William\""], ["pun", ","]],
      [["pl", "  "], ["prop", "role"], ["pun", ": "], ["str", "\"Full-Stack Developer\""], ["pun", ","]],
      [["pl", "  "], ["prop", "location"], ["pun", ": "], ["str", "\"Jakarta, ID\""], ["pun", ","]],
      [["pl", "  "], ["prop", "focus"], ["pun", ": "], ["str", "\"shipping my own projects\""], ["pun", ","]],
      [["pl", "  "], ["prop", "stack"], ["pun", ": ["]],
      [["pl", "    "], ["str", "\"react native\""], ["pun", ", "], ["str", "\"next.js\""], ["pun", ", "], ["str", "\"go\""]],
      [["pl", "  "], ["pun", "],"]],
      [["pl", "  "], ["prop", "openToWork"], ["pun", ": "], ["bool", "true"], ["pun", ","]],
      [["pun", "}"]]
    ]
  },
  {
    file: "~/folio/hero.tsx",
    lines: [
      [["kw", "export default function"], ["fn", " Gerry"], ["pun", "() {"]],
      [["kw", "  return"], ["pl", " "], ["pun", "("]],
      [["tagc", "    <App"], ["attr", " for"], ["pun", "="], ["str", "\"everyday life\""], ["tagc", " />"]],
      [["pl", "  "], ["pun", ")"]],
      [["pun", "}"]]
    ]
  },
  {
    file: "~/folio/theme.css",
    lines: [
      [["sel", ".folio"], ["pl", " {"]],
      [["prop", "  display"], ["pun", ": "], ["val", "grid"], ["pun", ";"]],
      [["prop", "  place-items"], ["pun", ": "], ["val", "center"], ["pun", ";"]],
      [["prop", "  min-height"], ["pun", ": "], ["num", "100vh"], ["pun", ";"]],
      [["prop", "  background"], ["pun", ": "], ["num", "#141414"], ["pun", ";"]],
      [["prop", "  color"], ["pun", ": "], ["num", "#ececec"], ["pun", ";"]],
      [["pun", "}"]]
    ]
  }
];

const STATUS_MESSAGES = [
  "compiling interface",
  "hydrating components",
  "optimizing interactions",
  "deploying build v0.1",
  "tuning pixels"
];

function flatten(snippet) {
  const flat = [];
  snippet.lines.forEach((tokens, li) => {
    tokens.forEach(([cls, text]) => {
      for (const ch of text) flat.push({ cls, ch });
    });
    if (li < snippet.lines.length - 1) flat.push({ cls: "", ch: "\n" });
  });
  return flat;
}

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function paint(flat, n) {
  let html = "";
  let run = "";
  let rc = null;
  for (let i = 0; i < n; i++) {
    const c = flat[i];
    if (c.cls !== rc) {
      if (run) html += rc ? `<span class="${rc}">${esc(run)}</span>` : esc(run);
      rc = c.cls;
      run = "";
    }
    run += c.ch;
  }
  if (run) html += rc ? `<span class="${rc}">${esc(run)}</span>` : esc(run);
  codeEl.innerHTML = html + '<span class="caret"></span>';
  codeEl.scrollTop = codeEl.scrollHeight;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function typeSnippet(snippet, flat) {
  fileEl.textContent = snippet.file;
  for (let n = 0; n <= flat.length; n++) {
    paint(flat, n);
    const ch = flat[n - 1] && flat[n - 1].ch;
    await wait(ch === "\n" ? 55 : 20 + Math.random() * 26);
  }
}

async function eraseSnippet(flat) {
  for (let n = flat.length; n >= 0; n -= 3) {
    paint(flat, Math.max(n, 0));
    await wait(12);
  }
  paint(flat, 0);
}

let current = SNIPPETS[0];

async function loop() {
  let i = 0;
  while (true) {
    current = SNIPPETS[i];
    const flat = flatten(current);
    if (reduced) {
      fileEl.textContent = current.file;
      paint(flat, flat.length);
      await wait(7000);
    } else {
      await typeSnippet(current, flat);
      await wait(2600);
      await eraseSnippet(flat);
      await wait(350);
    }
    i = (i + 1) % SNIPPETS.length;
  }
}

async function rotateStatus() {
  let i = 0;
  while (true) {
    statusEl.textContent = STATUS_MESSAGES[i];
    statusEl.style.opacity = "0";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        statusEl.style.opacity = "1";
      });
    });
    i = (i + 1) % STATUS_MESSAGES.length;
    await wait(2600);
  }
}

function tickClock() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  const mer = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  timeEl.textContent = `${h.toString().padStart(2, "0")}:${m}`;
  ampmEl.textContent = mer;
}

function parallax() {
  if (reduced) return;
  window.addEventListener("pointermove", (e) => {
    const dx = e.clientX / window.innerWidth - 0.5;
    const dy = e.clientY / window.innerHeight - 0.5;
    winEl.style.setProperty("--mx", `${dx * 10}px`);
    winEl.style.setProperty("--my", `${dy * 8}px`);
  });
}

tickClock();
setInterval(tickClock, 1000);
parallax();

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".fade-item").forEach((el) => {
  if (reduced) el.classList.add("in");
  else io.observe(el);
});

let scrollLock = false;
let lastWheel = 0;

const slides = [".hero-screen", "#work", "#about", "#experience"]
  .map((sel) => document.querySelector(sel))
  .filter(Boolean);

function nearestSlide() {
  const mid = window.scrollY + window.innerHeight / 2;
  let best = 0;
  let dist = Infinity;
  slides.forEach((el, i) => {
    const center = el.offsetTop + el.offsetHeight / 2;
    const d = Math.abs(center - mid);
    if (d < dist) {
      dist = d;
      best = i;
    }
  });
  return best;
}

function glideTo(el) {
  scrollLock = true;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  setTimeout(() => { scrollLock = false; }, 900);
}

window.addEventListener("wheel", (e) => {
  if (reduced || scrollLock || slides.length < 2) return;
  const now = Date.now();
  const fresh = now - lastWheel > 300;
  lastWheel = now;
  if (!fresh || Math.abs(e.deltaY) < 25) return;
  const idx = nearestSlide();
  const cur = slides[idx];
  const r = cur.getBoundingClientRect();
  const vh = window.innerHeight;
  if (e.deltaY > 0) {
    if (r.bottom > vh + 60) return;
    if (slides[idx + 1]) glideTo(slides[idx + 1]);
  } else {
    if (r.top < -60) return;
    if (slides[idx - 1]) glideTo(slides[idx - 1]);
  }
}, { passive: true });

document.querySelector(".scroll-cue")?.addEventListener("click", () => glideTo(slides[1]));
document.querySelector(".menu")?.addEventListener("click", () => glideTo(slides[1]));
document.querySelector(".brand")?.addEventListener("click", (e) => {
  e.preventDefault();
  glideTo(slides[0]);
});

const fx = document.querySelector(".grid-fx");
if (fx && !reduced) {
  const ctx = fx.getContext("2d");
  const GAP = 64;
  const RADIUS = 210;
  let w = 0;
  let h = 0;
  let mx = -9999;
  let my = -9999;
  let tx = -9999;
  let ty = -9999;

  function sizeFx() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = fx.clientWidth;
    h = fx.clientHeight;
    fx.width = w * dpr;
    fx.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeFx();
  window.addEventListener("resize", sizeFx);

  window.addEventListener("pointermove", (e) => {
    const r = fx.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
  });

  (function drawFx() {
    requestAnimationFrame(drawFx);
    if (window.scrollY > window.innerHeight) return;
    mx += (tx - mx) * 0.12;
    my += (ty - my) * 0.12;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    for (let x = GAP; x < w; x += GAP) {
      for (let y = GAP; y < h; y += GAP) {
        const d = Math.hypot(x - mx, y - my);
        if (d > RADIUS) continue;
        const a = 1 - d / RADIUS;
        ctx.strokeStyle = `rgba(224, 164, 88, ${(a * 0.5).toFixed(3)})`;
        const s = 2 + a * 2.5;
        ctx.beginPath();
        ctx.moveTo(x - s, y);
        ctx.lineTo(x + s, y);
        ctx.moveTo(x, y - s);
        ctx.lineTo(x, y + s);
        ctx.stroke();
      }
    }
  })();
}

if (!reduced && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".card").forEach((card) => {
    const thumb = card.querySelector(".thumb");
    if (!thumb) return;
    card.addEventListener("pointermove", (e) => {
      const r = thumb.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      thumb.style.transition = "transform .12s ease-out";
      thumb.style.transform = `rotateX(${((0.5 - py) * 8).toFixed(2)}deg) rotateY(${((px - 0.5) * 10).toFixed(2)}deg) translateY(-4px)`;
      thumb.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
      thumb.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
    });
    card.addEventListener("pointerleave", () => {
      thumb.style.transition = "transform .55s cubic-bezier(.2,.7,.3,1)";
      thumb.style.transform = "";
    });
  });
}

const fill = document.querySelector(".ruler-fill");
const wms = Array.from(document.querySelectorAll(".wm"));
let scrollTick = false;

function onScrollFx() {
  if (scrollTick) return;
  scrollTick = true;
  requestAnimationFrame(() => {
    scrollTick = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (fill) fill.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    if (!reduced) {
      const vh = window.innerHeight;
      wms.forEach((wm) => {
        const r = wm.parentElement.getBoundingClientRect();
        const off = r.top + r.height / 2 - vh / 2;
        wm.style.transform = `translateY(${(off * -0.06).toFixed(1)}px)`;
      });
    }
  });
}

window.addEventListener("scroll", onScrollFx, { passive: true });
onScrollFx();

if (statusEl) {
  statusEl.style.transition = "opacity .45s ease";
  rotateStatus();
}

loop();
