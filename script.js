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

document.querySelector(".menu")?.addEventListener("click", () => {
  document.querySelector("#work")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
});

document.querySelector(".brand")?.addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
});

document.querySelector(".scroll-cue")?.addEventListener("click", () => {
  document.querySelector("#work")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
});

let scrollLock = false;

function glide(target) {
  scrollLock = true;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  setTimeout(() => { scrollLock = false; }, 1100);
}

window.addEventListener("wheel", (e) => {
  if (reduced || scrollLock) return;
  const hero = document.querySelector(".hero-screen");
  const work = document.querySelector("#work");
  if (!hero || !work) return;
  const vh = window.innerHeight;
  const heroTop = hero.getBoundingClientRect().top;
  const workTop = work.getBoundingClientRect().top;
  if (e.deltaY > 25 && heroTop > -vh * 0.4 && workTop > vh * 0.25) {
    glide(work);
  } else if (e.deltaY < -25 && workTop > -vh * 0.25 && workTop < vh * 0.55) {
    glide(hero);
  }
}, { passive: true });

if (statusEl) {
  statusEl.style.transition = "opacity .45s ease";
  rotateStatus();
}

loop();
