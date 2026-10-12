// axe-core on every page in both lighting states. node scripts/dev/axe.mjs <baseUrl> [outFile]
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs';
const [base, out = 'qa/axe.json'] = process.argv.slice(2);
const pages = ['/', '/sports', '/lifestyle', '/about', '/kind-words', '/inquire', '/inquire/thanks', '/missing-page'];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const results = [];
for (const mode of ['gameday', 'goldenhour']) {
  for (const w of [1440, 390]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    await ctx.addInitScript((m) => localStorage.setItem('pbn-mode', m), mode);
    const page = await ctx.newPage();
    for (const p of pages) {
      await page.goto(base + p, { waitUntil: 'networkidle' });
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
      const v = r.violations.map((x) => ({ id: x.id, impact: x.impact, help: x.help, nodes: x.nodes.length, sample: x.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
      results.push({ page: p, mode, width: w, violations: v });
      console.log(`${mode} ${w} ${p}: ${v.length ? v.map((x) => `${x.id}(${x.nodes})`).join(', ') : 'none'}`);
    }
    await ctx.close();
  }
}
fs.writeFileSync(out, JSON.stringify(results, null, 2));
await browser.close();
