// Screenshot pages at given widths. node scripts/dev/shoot.mjs <outDir> <widths,comma> <url-or-file>...
// Options via env: FULL=1 full page, MOTION=reduce, SCHEME=dark|light, HEIGHT=900, WAIT=ms
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
const [out, widths, ...targets] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const w of widths.split(',').map(Number)) {
  const h = w <= 500 ? 844 : w <= 1024 ? 1024 : Number(process.env.HEIGHT || 900);
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: process.env.MOTION || 'no-preference', colorScheme: process.env.SCHEME || 'light', isMobile: w <= 500, hasTouch: w <= 500 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log(`[console ${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  for (const t of targets) {
    const url = /^https?:/.test(t) ? t : 'file://' + path.resolve(t);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(Number(process.env.WAIT || 600));
    const name = (process.env.PREFIX || '') + (/^https?:/.test(t) ? (new URL(t).pathname.replace(/\/$/, '').replace(/\//g, '_') || 'home') : path.basename(t, '.html'));
    const file = path.join(out, `${name}-${w}.png`);
    await page.screenshot({ path: file, fullPage: !!process.env.FULL });
    console.log(file);
  }
  await ctx.close();
}
await browser.close();
