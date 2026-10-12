// Full-screen lightbox. A native modal <dialog> (focus stays inside, Esc closes),
// a GSAP Flip morph from the thumbnail, arrow keys, swipe, pinch / double-tap zoom,
// neighbor preloading, and deep links (/sports#frame-012).
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import xIcon from '@phosphor-icons/core/assets/bold/x-bold.svg?raw';
import leftIcon from '@phosphor-icons/core/assets/bold/caret-left-bold.svg?raw';
import rightIcon from '@phosphor-icons/core/assets/bold/caret-right-bold.svg?raw';
import '@/styles/lightbox.css';

gsap.registerPlugin(Flip);

export interface GalleryItem {
  id: string;
  n: string;
  srcset: string;
  w: number;
  h: number;
  alt: string;
  caption: string | null;
  exif: string | null;
  credit: string | null;
}
interface OpenOptions {
  gallery: string;
  items: GalleryItem[];
  index: number;
  total: number;
  thumbFor: (id: string) => HTMLElement | null;
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// Phosphor (bold) icons, imported as raw SVG so this JS-built UI uses the same icon set.
const ICON = { x: xIcon, left: leftIcon, right: rightIcon };
const svg = (raw: string) => raw.replace('<svg ', '<svg aria-hidden="true" focusable="false" fill="currentColor" ').replace(/ width=\"\d+\"| height=\"\d+\"/g, '');

let dlg: HTMLDialogElement;
let stage: HTMLElement;
let frame: HTMLElement;
let img: HTMLImageElement;
let cap: HTMLElement;
let state: OpenOptions;
let idx = 0;
let zoom = { s: 1, x: 0, y: 0 };
let returnFocus: Element | null = null;
const basePath = () => location.pathname + location.search;

function build() {
  dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.setAttribute('aria-label', 'Photo viewer');
  dlg.innerHTML = `
    <div class="lb-top">
      <p class="lb-count num" aria-hidden="true"><span class="lb-n"></span><span class="lb-of"></span></p>
      <button type="button" class="lb-btn lb-close" aria-label="Close photo viewer">${svg(ICON.x)}</button>
    </div>
    <div class="lb-stage">
      <div class="lb-frame"><img alt="" decoding="async" draggable="false" /></div>
      <button type="button" class="lb-btn lb-prev" aria-label="Previous photo">${svg(ICON.left)}</button>
      <button type="button" class="lb-btn lb-next" aria-label="Next photo">${svg(ICON.right)}</button>
    </div>
    <div class="lb-cap" aria-live="polite"></div>`;
  document.body.append(dlg);
  stage = dlg.querySelector('.lb-stage')!;
  frame = dlg.querySelector('.lb-frame')!;
  img = frame.querySelector('img')!;
  cap = dlg.querySelector('.lb-cap')!;
  dlg.querySelector('.lb-close')!.addEventListener('click', close);
  dlg.querySelector('.lb-prev')!.addEventListener('click', () => go(-1));
  dlg.querySelector('.lb-next')!.addEventListener('click', () => go(1));
  dlg.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'Home') show(0, 0);
    else if (e.key === 'End') show(state.items.length - 1, 0);
    else return;
    e.preventDefault();
  });
  // Click on the dark area (not the photo or a control) closes.
  stage.addEventListener('click', (e) => {
    if (e.target === stage && zoom.s === 1) close();
  });
  gestures();
}

function sizeFrame(it: GalleryItem) {
  // Fit the photo inside the stage at its own aspect ratio (no crop, no CLS).
  const r = stage.getBoundingClientRect();
  const s = Math.min(r.width / it.w, r.height / it.h, 1.6);
  frame.style.width = `${Math.round(it.w * s)}px`;
  frame.style.height = `${Math.round(it.h * s)}px`;
}

function render(it: GalleryItem) {
  img.removeAttribute('srcset');
  img.src = '';
  img.sizes = '100vw';
  img.srcset = it.srcset;
  img.alt = it.alt;
  sizeFrame(it);
  const pos = state.items.indexOf(it) + 1;
  dlg.querySelector('.lb-n')!.textContent = it.n;
  dlg.querySelector('.lb-of')!.textContent = ` / ${String(state.total).padStart(3, '0')}`;
  cap.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'lb-text';
  p.textContent = it.caption ?? it.alt;
  const sr = document.createElement('span');
  sr.className = 'visually-hidden';
  sr.textContent = `Frame ${it.n}, ${pos} of ${state.items.length}. `;
  p.prepend(sr);
  cap.append(p);
  if (it.exif) {
    const e = document.createElement('p');
    e.className = 'lb-exif num';
    e.textContent = it.exif;
    cap.append(e);
  }
  if (it.credit) {
    const c = document.createElement('p');
    c.className = 'lb-exif';
    c.textContent = `Photo: ${it.credit}`;
    cap.append(c);
  }
  history.replaceState(history.state, '', `${basePath()}#${it.id}`);
  preload(idx + 1);
  preload(idx - 1);
}

function preload(i: number) {
  const it = state.items[(i + state.items.length) % state.items.length];
  if (!it) return;
  const pre = new Image();
  pre.sizes = '100vw';
  pre.srcset = it.srcset;
}

function resetZoom(animate = true) {
  zoom = { s: 1, x: 0, y: 0 };
  gsap.to(img, { scale: 1, x: 0, y: 0, duration: animate && !reduced() ? 0.3 : 0, ease: 'expo.out' });
  dlg.classList.remove('is-zoomed');
}

function show(i: number, dir: number) {
  const n = state.items.length;
  idx = (i + n) % n;
  resetZoom(false);
  const it = state.items[idx];
  if (reduced() || !dir) return render(it);
  gsap.to(frame, {
    x: -dir * 40, opacity: 0, duration: 0.16, ease: 'power2.in',
    onComplete: () => {
      render(it);
      gsap.fromTo(frame, { x: dir * 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.42, ease: 'expo.out' });
    },
  });
}
const go = (d: number) => show(idx + d, d);

export function openLightbox(opts: OpenOptions) {
  if (!dlg) build();
  state = opts;
  idx = Math.max(0, opts.index);
  returnFocus = document.activeElement;
  const thumb = opts.thumbFor(opts.items[idx].id);
  if (thumb) thumb.dataset.flipId = 'lb-morph';
  const flipState = thumb && !reduced() ? Flip.getState(thumb) : null;
  dlg.showModal();
  document.documentElement.classList.add('lb-open');
  window.dispatchEvent(new CustomEvent('lightbox', { detail: true }));
  render(opts.items[idx]);
  // Start with the thumbnail's already-loaded pixels so the morph never shows a blank box.
  if (thumb instanceof HTMLImageElement && thumb.currentSrc) img.src = thumb.currentSrc;
  if (flipState && thumb) {
    img.dataset.flipId = 'lb-morph';
    Flip.from(flipState, { targets: img, duration: 0.7, ease: 'expo.out', absolute: true, scale: true, simple: true });
    gsap.fromTo(dlg, { '--lb-bg': 0 } as gsap.TweenVars, { '--lb-bg': 1, duration: 0.5, ease: 'power2.out' } as gsap.TweenVars);
  } else {
    dlg.style.setProperty('--lb-bg', '1');
  }
  (dlg.querySelector('.lb-close') as HTMLElement).focus();
}

function close() {
  const it = state.items[idx];
  const thumb = state.thumbFor(it.id);
  const done = () => {
    dlg.close();
    gsap.set([img, frame], { clearProps: 'all' });
    document.documentElement.classList.remove('lb-open');
    window.dispatchEvent(new CustomEvent('lightbox', { detail: false }));
    history.replaceState(history.state, '', basePath());
    // Return focus to the frame now in view (or where the visitor started).
    const link = thumb?.closest('a') ?? (returnFocus as HTMLElement | null);
    link?.focus({ preventScroll: false });
  };
  if (reduced() || !thumb || zoom.s !== 1) return done();
  thumb.scrollIntoView({ block: 'nearest' });
  gsap.to(dlg, { '--lb-bg': 0, duration: 0.35, ease: 'power2.in' } as gsap.TweenVars);
  Flip.fit(img, thumb, { duration: 0.45, ease: 'expo.inOut', absolute: true, onComplete: done });
}

// ---------- Swipe, pinch, pan, double-tap ----------
function gestures() {
  const pts = new Map<number, { x: number; y: number }>();
  let start = { x: 0, y: 0, t: 0, dist: 0, s: 1, zx: 0, zy: 0 };
  let swiping = false;
  let lastTap = 0;

  const apply = () => {
    gsap.set(img, { scale: zoom.s, x: zoom.x, y: zoom.y });
    dlg.classList.toggle('is-zoomed', zoom.s > 1.01);
  };
  const clampPan = () => {
    const r = frame.getBoundingClientRect();
    const mx = ((zoom.s - 1) * r.width) / 2;
    const my = ((zoom.s - 1) * r.height) / 2;
    zoom.x = Math.max(-mx, Math.min(mx, zoom.x));
    zoom.y = Math.max(-my, Math.min(my, zoom.y));
  };
  const zoomAt = (s: number, cx: number, cy: number) => {
    const r = frame.getBoundingClientRect();
    const ox = cx - (r.left + r.width / 2);
    const oy = cy - (r.top + r.height / 2);
    zoom = { s, x: -ox * (s - 1), y: -oy * (s - 1) };
    clampPan();
    gsap.to(img, { scale: zoom.s, x: zoom.x, y: zoom.y, duration: reduced() ? 0 : 0.35, ease: 'expo.out' });
    dlg.classList.toggle('is-zoomed', s > 1);
  };

  frame.addEventListener('dblclick', (e) => (zoom.s > 1 ? resetZoom() : zoomAt(2.5, e.clientX, e.clientY)));
  frame.addEventListener('pointerdown', (e) => {
    frame.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) {
      start = { x: e.clientX, y: e.clientY, t: performance.now(), dist: 0, s: zoom.s, zx: zoom.x, zy: zoom.y };
      swiping = zoom.s === 1;
      if (e.pointerType === 'touch') {
        const now = performance.now();
        if (now - lastTap < 280) zoom.s > 1 ? resetZoom() : zoomAt(2.5, e.clientX, e.clientY);
        lastTap = now;
      }
    } else if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      start.dist = Math.hypot(a.x - b.x, a.y - b.y);
      start.s = zoom.s;
      swiping = false;
    }
  });
  frame.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2 && start.dist) {
      const [a, b] = [...pts.values()];
      zoom.s = Math.max(1, Math.min(4, (start.s * Math.hypot(a.x - b.x, a.y - b.y)) / start.dist));
      clampPan();
      apply();
    } else if (pts.size === 1 && zoom.s > 1) {
      zoom.x = start.zx + (e.clientX - start.x);
      zoom.y = start.zy + (e.clientY - start.y);
      clampPan();
      apply();
    } else if (swiping) {
      gsap.set(frame, { x: (e.clientX - start.x) * 0.9 });
    }
  });
  const end = (e: PointerEvent) => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (swiping && pts.size === 0) {
      const dx = e.clientX - start.x;
      const fast = Math.abs(dx) / Math.max(1, performance.now() - start.t) > 0.5;
      if (Math.abs(dx) > 70 || (fast && Math.abs(dx) > 30)) go(dx < 0 ? 1 : -1);
      else gsap.to(frame, { x: 0, duration: 0.3, ease: 'expo.out' });
      swiping = false;
    }
    if (zoom.s <= 1.02 && pts.size === 0) resetZoom();
  };
  frame.addEventListener('pointerup', end);
  frame.addEventListener('pointercancel', end);
  window.addEventListener('resize', () => dlg.open && sizeFrame(state.items[idx]));
}
