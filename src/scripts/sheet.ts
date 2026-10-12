// Contact sheet behavior: sport filters (with a Flip reflow), the running frame
// counter, the viewfinder marks that snap to the hovered frame, and opening the lightbox.
import type { GalleryItem } from './lightbox';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let lightboxMod: Promise<typeof import('./lightbox')> | null = null;
const loadLightbox = () => (lightboxMod ??= import('./lightbox'));

export function initSheet(sheet: HTMLElement) {
  if (sheet.dataset.ready) return;
  sheet.dataset.ready = '1';
  const gallery = sheet.dataset.gallery!;
  const items = [...sheet.querySelectorAll<HTMLElement>('.item')];
  const data: GalleryItem[] = JSON.parse(sheet.querySelector('[data-gallery-data]')!.textContent || '[]');

  // Warm the lightbox code once someone shows interest.
  const warm = () => loadLightbox();
  sheet.addEventListener('pointerenter', warm, { once: true });
  sheet.addEventListener('focusin', warm, { once: true });

  // Open in the lightbox (the link still works as a plain image link without JS).
  sheet.addEventListener('click', async (e) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>('a.link');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const li = link.closest<HTMLElement>('.item')!;
    const visible = items.filter((it) => !it.hidden);
    const { openLightbox } = await loadLightbox();
    openLightbox({
      gallery,
      items: visible.map((it) => data[Number(it.dataset.index)]),
      index: visible.indexOf(li),
      total: data.length,
      thumbFor: (id) => sheet.querySelector<HTMLElement>(`#${CSS.escape(id)} img`),
    });
  });

  // ---------- Filters ----------
  const chips = [...sheet.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  chips.forEach((chip) =>
    chip.addEventListener('click', async () => {
      const f = chip.dataset.filter!;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      const apply = () => items.forEach((it) => (it.hidden = f !== 'all' && it.dataset.sport !== f));
      if (reduced()) return apply();
      const [{ gsap }, { Flip }] = await Promise.all([import('gsap'), import('gsap/Flip')]);
      gsap.registerPlugin(Flip);
      const state = Flip.getState(items);
      apply();
      Flip.from(state, { duration: 0.6, ease: 'expo.out', absolute: true, scale: true, onEnter: (els) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.4 }), onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.25 }) });
    }),
  );

  // ---------- Running frame counter ----------
  const counter = sheet.querySelector<HTMLElement>('[data-counter-n]');
  if (counter && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) counter.textContent = String(Number((e.target as HTMLElement).dataset.index) + 1).padStart(3, '0');
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    items.forEach((it) => io.observe(it));
  }

  // ---------- Viewfinder marks (fine pointers only) ----------
  const finder = sheet.querySelector<HTMLElement>('.finder');
  if (finder && matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced()) {
    let first = true;
    const snap = (it: HTMLElement) => {
      const a = it.querySelector('.ph')!.getBoundingClientRect();
      const b = sheet.getBoundingClientRect();
      finder.style.transition = first ? 'opacity 200ms' : 'opacity 200ms, transform 260ms cubic-bezier(.16,1,.3,1), width 260ms cubic-bezier(.16,1,.3,1), height 260ms cubic-bezier(.16,1,.3,1)';
      finder.style.transform = `translate(${a.left - b.left}px, ${a.top - b.top}px)`;
      finder.style.width = `${a.width}px`;
      finder.style.height = `${a.height}px`;
      finder.classList.add('on');
      first = false;
    };
    items.forEach((it) => it.addEventListener('pointerenter', () => snap(it)));
    sheet.addEventListener('pointerleave', () => {
      finder.classList.remove('on');
      first = true;
    });
  }

  // ---------- Deep links (/sports#frame-012) and links to frames from elsewhere on the page ----------
  const openById = (id: string, from: HTMLElement | null) => {
    const i = data.findIndex((d) => d.id === id);
    if (i < 0) return false;
    loadLightbox().then(({ openLightbox }) =>
      openLightbox({
        gallery,
        items: data,
        index: i,
        total: data.length,
        // Morph from the photo that was clicked, then return to the grid frame on close.
        thumbFor: (fid) => (fid === id && from ? from : sheet.querySelector<HTMLElement>(`#${CSS.escape(fid)} img`)),
      }),
    );
    return true;
  };
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash) openById(hash, null);
  window.addEventListener('hashchange', () => openById(decodeURIComponent(location.hash.slice(1)), null));
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-frame-link]');
    if (!a || e.metaKey || e.ctrlKey) return;
    if (openById(a.getAttribute('href')!.slice(1), a.querySelector('img'))) e.preventDefault();
  });
}
