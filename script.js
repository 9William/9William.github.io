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
  if (reduced || slides.length < 2) return;
  if (Math.abs(e.deltaY) < 10) return;
  const now = Date.now();
  if (now - lastWheel < 650) { e.preventDefault(); return; }
  if (scrollLock) { e.preventDefault(); return; }
  e.preventDefault();
  const dir = e.deltaY > 0 ? 1 : -1;
  const idx = nearestSlide();
  const target = idx + dir;
  if (target < 0 || target >= slides.length) return;
  lastWheel = now;
  glideTo(slides[target]);
}, { passive: false });

document.querySelector(".scroll-cue")?.addEventListener("click", () => glideTo(slides[1]));
document.querySelector(".menu")?.addEventListener("click", () => glideTo(slides[1]));
document.querySelector(".brand")?.addEventListener("click", (e) => {
  e.preventDefault();
  glideTo(slides[0]);
});

const marksLayer = document.querySelector(".marks");

if (marksLayer) {
  if (reduced || !window.matchMedia("(hover: hover)").matches) {
    marksLayer.style.display = "none";
  } else {
    const GAP = 64;
    const RADIUS = 230;
    const marks = [];
    let gx = window.innerWidth / 2;
    let gy = window.innerHeight / 3;
    let gtx = gx;
    let gty = gy;

    function buildMarks() {
      marksLayer.innerHTML = "";
      marks.length = 0;
      const cols = Math.ceil(window.innerWidth / GAP) + 1;
      const rows = Math.ceil(window.innerHeight / GAP) + 1;
      const frag = document.createDocumentFragment();
      for (let c = 1; c <= cols; c++) {
        for (let r = 1; r <= rows; r++) {
          const el = document.createElement("i");
          el.className = "mark";
          el.style.left = `${c * GAP}px`;
          el.style.top = `${r * GAP}px`;
          frag.appendChild(el);
          marks.push({ el, x: c * GAP, y: r * GAP, o: -1 });
        }
      }
      marksLayer.appendChild(frag);
    }
    buildMarks();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildMarks, 150);
    });

    const moveMarks = (e) => {
      gtx = e.clientX;
      gty = e.clientY;
    };
    window.addEventListener("pointermove", moveMarks);
    window.addEventListener("mousemove", moveMarks);

    (function loopMarks() {
      requestAnimationFrame(loopMarks);
      gx += (gtx - gx) * 0.09;
      gy += (gty - gy) * 0.09;
      for (const m of marks) {
        const d = Math.hypot(m.x - gx, m.y - gy);
        const o = d < RADIUS ? ((1 - d / RADIUS) * 0.85).toFixed(3) * 1 : 0;
        if (Math.abs(o - m.o) > 0.02) {
          m.o = o;
          m.el.style.opacity = o;
        }
      }
    })();
  }
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
