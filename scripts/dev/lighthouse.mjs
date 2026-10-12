// Lighthouse (mobile + desktop) for each page; writes JSON to qa/lighthouse and prints scores + vitals.
// node scripts/dev/lighthouse.mjs <baseUrl> [outDir]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const [base, out = 'qa/lighthouse'] = process.argv.slice(2);
const pages = (process.env.PAGES || '/,/sports,/lifestyle,/about,/kind-words,/inquire').split(',');
fs.mkdirSync(out, { recursive: true });
const rows = [];
for (const form of (process.env.FORMS || 'mobile,desktop').split(',')) {
  for (const p of pages) {
    const name = (p === '/' ? 'home' : p.slice(1).replace(/\//g, '_')) + '-' + form;
    const file = `${out}/${name}.json`;
    const args = [base + p, '--output=json', `--output-path=${file}`, '--quiet', '--chrome-flags=--headless=new --no-sandbox', '--only-categories=performance,accessibility,best-practices,seo'];
    if (form === 'desktop') args.push('--preset=desktop');
    try { execFileSync('node_modules/.bin/lighthouse', args, { env: { ...process.env, CHROME_PATH: '/opt/pw-browsers/chromium' }, stdio: 'ignore', timeout: 240000 }); }
    catch (e) { if (!fs.existsSync(file)) { console.log(name, 'FAILED'); continue; } }
    const r = JSON.parse(fs.readFileSync(file, 'utf8'));
    const s = (k) => Math.round(r.categories[k].score * 100);
    const a = r.audits;
    const row = { page: name, perf: s('performance'), a11y: s('accessibility'), bp: s('best-practices'), seo: s('seo'), LCP: a['largest-contentful-paint'].displayValue, CLS: a['cumulative-layout-shift'].displayValue, TBT: a['total-blocking-time'].displayValue };
    rows.push(row);
    console.log(Object.values(row).join('\t'));
  }
}
fs.writeFileSync(`${out}/summary.json`, JSON.stringify(rows, null, 2));
