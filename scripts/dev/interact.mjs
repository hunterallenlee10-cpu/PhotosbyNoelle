// Drives the signature interactions in a real browser and screenshots each state.
// node scripts/dev/interact.mjs <baseUrl> <outDir>
import { chromium } from 'playwright';
import fs from 'node:fs';
const [base = 'http://localhost:4321', out = 'qa/interact'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const log = [];
const note = (s) => { log.push(s); console.log(s); };

async function ctx(opts = {}) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const p = await c.newPage();
  p.on('console', (m) => ['error', 'warning'].includes(m.type()) && note(`  [console ${m.type()}] ${m.text()}`));
  p.on('pageerror', (e) => note(`  [pageerror] ${e.message}`));
  return { c, p };
}

// 1. Burst hero plays, then lands on the keeper.
{
  const { c, p } = await ctx();
  await p.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(700);
  const playing = await p.evaluate(() => document.querySelector('[data-burst]')?.hasAttribute('data-playing'));
  await p.screenshot({ path: `${out}/burst-mid.png` });
  await p.waitForTimeout(3000);
  const n = await p.textContent('[data-burst-n]');
  note(`burst: playing at 0.7s=${playing}; landed on frame ${n}`);
  await p.screenshot({ path: `${out}/burst-end.png` });

  // 2. Mode toggle.
  const before = await p.evaluate(() => document.documentElement.dataset.mode);
  await p.click('.site-header [data-mode-toggle]');
  await p.waitForTimeout(900);
  const after = await p.evaluate(() => document.documentElement.dataset.mode);
  const stored = await p.evaluate(() => localStorage.getItem('pbn-mode'));
  note(`mode: ${before} -> ${after}, stored=${stored}`);
  await p.screenshot({ path: `${out}/mode-toggled.png` });
  await p.goto(base + '/lifestyle', { waitUntil: 'domcontentloaded' });
  note(`mode persists on /lifestyle: ${await p.evaluate(() => document.documentElement.dataset.mode)}`);
  await c.close();
}

// 3. Lightbox: open, keyboard, deep link, close + focus return.
{
  const { c, p } = await ctx();
  await p.goto(base + '/sports', { waitUntil: 'networkidle' });
  await p.locator('#frame-012 a').scrollIntoViewIfNeeded();
  await p.waitForTimeout(500);
  await p.click('#frame-012 a');
  await p.waitForTimeout(1000);
  note(`lightbox open: ${await p.evaluate(() => document.querySelector('dialog.lightbox')?.open)} hash=${await p.evaluate(() => location.hash)}`);
  await p.screenshot({ path: `${out}/lightbox-open.png` });
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(700);
  note(`after ArrowRight: hash=${await p.evaluate(() => location.hash)} counter=${await p.textContent('.lb-n')}`);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(800);
  note(`after Esc: open=${await p.evaluate(() => document.querySelector('dialog.lightbox')?.open)} focus=${await p.evaluate(() => document.activeElement?.closest('li')?.id)} hash=${await p.evaluate(() => location.hash)}`);
  await p.goto(base + '/sports#frame-052', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  note(`deep link #frame-052: open=${await p.evaluate(() => document.querySelector('dialog.lightbox')?.open)} counter=${await p.textContent('.lb-n')}`);
  await p.screenshot({ path: `${out}/lightbox-deeplink.png` });
  await p.keyboard.press('Escape');
  // Filters.
  await p.click('[data-filter="field-hockey"]');
  await p.waitForTimeout(900);
  const vis = await p.evaluate(() => [...document.querySelectorAll('.item')].filter((i) => !i.hidden).length);
  note(`filter field-hockey: ${vis} visible`);
  await p.screenshot({ path: `${out}/filter.png` });
  await c.close();
}

// 4. Mobile: menu sheet, thumb bar, swipe in lightbox.
{
  const { c, p } = await ctx({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await p.goto(base + '/sports', { waitUntil: 'networkidle' });
  note(`mobile bar hidden at top: ${await p.evaluate(() => !document.querySelector('[data-mobile-bar]').classList.contains('is-shown'))}`);
  await p.evaluate(() => window.scrollTo(0, 1600));
  await p.waitForTimeout(700);
  note(`mobile bar shown after scroll: ${await p.evaluate(() => document.querySelector('[data-mobile-bar]').classList.contains('is-shown'))}`);
  await p.screenshot({ path: `${out}/mobile-bar.png` });
  await p.click('.mobile-bar [data-menu-open]');
  await p.waitForTimeout(700);
  note(`menu open: ${await p.evaluate(() => document.getElementById('menu').open)}`);
  await p.screenshot({ path: `${out}/mobile-menu.png` });
  await p.keyboard.press('Escape');
  await c.close();
}

// 5. Form validation (client) and API validation (server).
{
  const { c, p } = await ctx();
  await p.goto(base + '/inquire', { waitUntil: 'networkidle' });
  await p.click('.send');
  await p.waitForTimeout(300);
  const errs = await p.evaluate(() => [...document.querySelectorAll('.err')].filter((e) => e.textContent).map((e) => e.id));
  note(`empty submit errors: ${errs.join(', ')}; focus=${await p.evaluate(() => document.activeElement?.id)}`);
  await p.screenshot({ path: `${out}/form-errors.png`, fullPage: true });
  const api = await p.evaluate(async () => {
    const r = await fetch('/api/inquire', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '', email: 'nope' }) });
    return [r.status, await r.text()];
  });
  note(`API invalid -> ${api[0]} ${api[1]}`);
  const trap = await p.evaluate(async () => {
    const r = await fetch('/api/inquire', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ company: 'spam inc' }) });
    return [r.status, await r.text()];
  });
  note(`API honeypot -> ${trap[0]} ${trap[1]}`);
  await c.close();
}

// 6. Reduced motion: no burst, content visible.
{
  const { c, p } = await ctx({ reducedMotion: 'reduce' });
  await p.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  note(`reduced motion: burst playing=${await p.evaluate(() => document.querySelector('[data-burst]').hasAttribute('data-playing'))}`);
  await c.close();
}

// 7. JavaScript disabled: galleries are plain links, form posts normally.
{
  const { c, p } = await ctx({ javaScriptEnabled: false });
  await p.goto(base + '/sports', { waitUntil: 'networkidle' });
  const href = await p.getAttribute('#frame-001 a', 'href');
  const toggleVisible = await p.isVisible('.site-header [data-mode-toggle]');
  note(`no-JS: frame link -> ${href}; toggle visible=${toggleVisible}; form action=${await (await c.newPage()).goto(base + '/inquire').then(async (r) => r.status())}`);
  await p.screenshot({ path: `${out}/nojs-sports.png` });
  await c.close();
}

fs.writeFileSync(`${out}/interact.log`, log.join('\n') + '\n');
await browser.close();
