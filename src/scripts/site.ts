// Site-wide behavior: lighting switch, dual clock, mobile menu + thumb bar,
// photo "develop" fallback, reveal-on-scroll, and desktop smooth scroll.
const root = document.documentElement;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

type Mode = 'gameday' | 'goldenhour';
const STORE = 'pbn-mode';
const THEME: Record<Mode, string> = { gameday: '#0b111d', goldenhour: '#f7dcb0' };

const currentMode = (): Mode => (root.dataset.mode === 'gameday' ? 'gameday' : 'goldenhour');

function syncToggles() {
  const on = currentMode() === 'goldenhour';
  document.querySelectorAll<HTMLButtonElement>('[data-mode-toggle]').forEach((b) => b.setAttribute('aria-checked', String(on)));
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => (m.content = THEME[currentMode()]));
}

function applyMode(next: Mode, persist = true) {
  if (next === currentMode()) return;
  if (persist) {
    try {
      localStorage.setItem(STORE, next);
    } catch {}
  }
  const swap = () => {
    root.dataset.mode = next;
    syncToggles();
    window.dispatchEvent(new CustomEvent('modechange', { detail: next }));
  };
  if (reduced()) return swap();
  // One smooth crossfade of the whole page.
  const vt = (document as Document & { startViewTransition?: (cb: () => void) => unknown }).startViewTransition;
  if (vt) {
    vt.call(document, swap);
  } else {
    root.classList.add('mode-shift');
    swap();
    window.setTimeout(() => root.classList.remove('mode-shift'), 760);
  }
}

document.addEventListener('click', (e) => {
  const t = (e.target as Element).closest('[data-mode-toggle]');
  if (t) applyMode(currentMode() === 'gameday' ? 'goldenhour' : 'gameday');
});
// Pages that follow the system keep following it until the visitor picks.
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORE);
  } catch {}
  if (!stored && root.dataset.default === 'auto') applyMode(e.matches ? 'gameday' : 'goldenhour', false);
});
syncToggles();

// ---------- Dual clock: Honolulu + Fredericksburg ----------
const clocks = [...document.querySelectorAll<HTMLElement>('[data-clock]')];
const fmt = new Map<string, Intl.DateTimeFormat>();
function tick() {
  const now = new Date();
  for (const el of clocks) {
    const tz = el.dataset.clock!;
    if (!fmt.has(tz)) fmt.set(tz, new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true }));
    const parts = fmt.get(tz)!.formatToParts(now);
    const hm = parts.filter((p) => p.type === 'hour' || p.type === 'minute' || p.type === 'literal').map((p) => p.value).join('').replace(/\s+$/, '');
    const ap = parts.find((p) => p.type === 'dayPeriod')?.value ?? '';
    el.querySelector('.hm')!.textContent = hm.replace(/\s*$/, '');
    el.querySelector('.ap')!.textContent = ap;
    el.setAttribute('datetime', now.toISOString());
    el.setAttribute('aria-label', `${hm} ${ap}`);
  }
}
if (clocks.length) {
  tick();
  window.setTimeout(() => {
    tick();
    window.setInterval(tick, 60_000);
  }, 60_000 - (Date.now() % 60_000) + 50);
}

// ---------- Mobile menu (modal dialog) ----------
const menu = document.getElementById('menu') as HTMLDialogElement | null;
let opener: HTMLElement | null = null;
document.addEventListener('click', (e) => {
  const open = (e.target as Element).closest<HTMLElement>('[data-menu-open]');
  if (open && menu?.showModal) {
    e.preventDefault();
    opener = open;
    menu.showModal();
  }
  if ((e.target as Element).closest('[data-menu-close]')) menu?.close();
});
menu?.addEventListener('click', (e) => {
  if (e.target === menu) menu.close(); // backdrop tap
});
menu?.addEventListener('close', () => opener?.focus());

// ---------- Thumb bar appears after the first scroll ----------
const bar = document.querySelector<HTMLElement>('[data-mobile-bar]');
if (bar) {
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:70vh;pointer-events:none';
  sentinel.setAttribute('aria-hidden', 'true');
  document.body.prepend(sentinel);
  const footer = document.getElementById('site-footer');
  let pastTop = false;
  let atFooter = false;
  const update = () => bar.classList.toggle('is-shown', pastTop && !atFooter);
  new IntersectionObserver(([e]) => {
    pastTop = !e.isIntersecting;
    update();
  }).observe(sentinel);
  if (footer)
    new IntersectionObserver(([e]) => {
      atFooter = e.isIntersecting;
      update();
    }, { rootMargin: '0px 0px -40% 0px' }).observe(footer);
}

// ---------- Photos that finished loading before the script ran ----------
document.querySelectorAll<HTMLImageElement>('img[data-develop]').forEach((img) => {
  if (img.complete && img.naturalWidth) img.classList.add('in');
  else img.addEventListener('load', () => img.classList.add('in'), { once: true });
  img.addEventListener('error', () => img.classList.add('in'), { once: true });
});

// ---------- Reveal on scroll ----------
const reveals = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (reveals.length) {
  if (reduced() || !('IntersectionObserver' in window)) reveals.forEach((el) => el.classList.add('is-in'));
  else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    reveals.forEach((el) => io.observe(el));
  }
}

// ---------- Smooth scroll: desktop pointers only, never under reduced motion ----------
if (!reduced() && matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth >= 1080) {
  const start = () =>
    import('lenis').then(({ default: Lenis }) => {
      const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, smoothWheel: true });
      (window as unknown as { __lenis: unknown }).__lenis = lenis;
      const raf = (t: number) => {
        lenis.raf(t);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
      window.addEventListener('lightbox', (e) => ((e as CustomEvent).detail ? lenis.stop() : lenis.start()));
      document.addEventListener('click', (e) => {
        const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
        const id = a?.getAttribute('href');
        if (!a || !id || id === '#' || a.hasAttribute('data-menu-open') || a.hasAttribute('data-frame-link')) return;
        const target = document.querySelector<HTMLElement>(id);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -80 });
          history.pushState(null, '', id);
          // Keep keyboard focus in step with the scroll (skip link, in-page links).
          if (!target.matches('a, button, input, textarea, select, [tabindex]')) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });
    });
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 2000 });
  else setTimeout(start, 600);
}

export {};
