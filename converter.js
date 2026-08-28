"use strict";

const dropzoneEl = document.querySelector("#dropzone");
const fileInputEl = document.querySelector("#fileInput");
const formatPickerEl = document.querySelector("#formatPicker");
const qualityEl = document.querySelector("#quality");
const qualityValEl = document.querySelector("#qualityVal");
const previewEl = document.querySelector("#preview");
const downloadBtnEl = document.querySelector("#downloadBtn");
const downloadLabelEl = document.querySelector("#downloadLabel");
const statusEl = document.querySelector("#forgeStatus");
const pulseEl = document.querySelector("#forgePulse");

const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/webp"];
const SUPPORTED_NAME = {
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "image/webp": "WebP",
};

let loadedImage = null;
let activeFormat = "image/png";
let convertedBlob = null;

function setStatus(text, active = false) {
  statusEl.textContent = text;
  if (pulseEl) {
    pulseEl.classList.toggle("active", active);
  }
}

function setQualityVal(v) {
  qualityValEl.textContent = `${v}%`;
}

qualityEl.addEventListener("input", () => {
  setQualityVal(qualityEl.value);
});

setQualityVal(qualityEl.value);

fileInputEl.accept = "image/*";

function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    setStatus("unsupported file type", false);
    return;
  }

  if (file.size > 50 * 1024 * 1024) {
    setStatus("file exceeds 50MB", false);
    return;
  }

  const imgURL = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(imgURL);
    loadedImage = img;
    previewEl.innerHTML = `<img src="${img.src}" alt="${file.name} preview" />`;
    const ext = SUPPORTED_NAME[activeFormat];
    setStatus(`ready: ${file.name}`, false);
  };
  img.onerror = () => {
    URL.revokeObjectURL(imgURL);
    setStatus("failed to load image", false);
  };
  img.src = imgURL;
}

function formatSelected(fmt) {
  activeFormat = fmt;
  document.querySelectorAll(".fmt-option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.fmt === fmt);
  });
  setStatus(`output: ${SUPPORTED_NAME[fmt]}`, false);
}

formatPickerEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".fmt-option");
  if (!btn) return;
  formatSelected(btn.dataset.fmt);
});

document.querySelectorAll(".fmt-option").forEach((btn) => {
  btn.addEventListener("click", () => formatSelected(btn.dataset.fmt));
});

function onDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  dropzoneEl.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
}

function onDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  dropzoneEl.classList.add("dragover");
}

function onDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  dropzoneEl.classList.remove("dragover");
}

dropzoneEl.addEventListener("click", () => fileInputEl.click());
dropzoneEl.addEventListener("drop", onDrop);
dropzoneEl.addEventListener("dragover", onDragOver);
dropzoneEl.addEventListener("dragleave", onDragLeave);

fileInputEl.addEventListener("change", () => {
  const file = fileInputEl.files[0];
  if (file) handleFile(file);
});

function convertImage() {
  if (!loadedImage) {
    setStatus("no image loaded", false);
    return;
  }

  setStatus("converting…", true);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const w = loadedImage.naturalWidth;
  const h = loadedImage.naturalHeight;
  canvas.width = w;
  canvas.height = h;

  ctx.clearRect(0, 0, w, h);

  if (activeFormat === "image/png") {
    ctx.drawImage(loadedImage, 0, 0);
  } else if (activeFormat === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(loadedImage, 0, 0);
  } else if (activeFormat === "image/webp") {
    ctx.drawImage(loadedImage, 0, 0);
  }

  const quality = qualityEl.value / 100;

  canvas.toBlob(
    (blob) => {
      if (!blob) {
        setStatus("conversion failed", false);
        return;
      }
      convertedBlob = blob;
      const ext = SUPPORTED_NAME[activeFormat];
      downloadBtnEl.disabled = false;
      downloadLabelEl.textContent = `Download as ${ext}`;
      setStatus(`converted to ${ext}`, false);
    },
    activeFormat,
    quality
  );
}

downloadBtnEl.addEventListener("click", () => {
  if (!convertedBlob) {
    convertImage();
    return;
  }

  const ext = SUPPORTED_NAME[activeFormat];
  const baseName = (loadedImage.currentSrc || "image")
    .replace(/^.*[\\\/]/, "")
    .replace(/\.\w+$/, "");
  const filename = `${baseName || "converted"}.${ext.toLowerCase()}`;
  const url = URL.createObjectURL(convertedBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  setStatus(`downloaded ${filename}`, false);
});

let dragging = false;
dropzoneEl.addEventListener("dragstart", () => {
  dragging = true;
});

document.querySelectorAll(".fmt-option").forEach((btn) => {
  if (!btn.dataset.fmt) return;
});

const firstFmt = document.querySelector('.fmt-option[data-fmt="image/png"]');
if (firstFmt) {
  firstFmt.classList.add("active");
}

setStatus("ready — drop an image to begin", false);
