// Builds the wordmark + favicon SVGs from outlined Anybody glyphs.
// node scripts/dev/build-wordmark.mjs <python-with-fonttools>
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const py = process.argv[2] || 'python3';
const FONT = 'node_modules/@fontsource-variable/anybody/files/anybody-latin-standard-normal.woff2';
const outline = (wdth, wght, track, text) => {
  const j = JSON.parse(execFileSync(py, ['scripts/dev/glyph-paths.py', FONT, String(wdth), String(wght), String(track), text]).toString());
  j.d = j.d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(+n * 10) / 10));
  return j;
};

const name = outline(56, 900, 0.012, 'NOELLE');
const pre = outline(138, 600, 0.04, 'PHOTOS BY');
const H = name.capHeight; // 1350-ish units
const s = (H * 0.24) / pre.capHeight; // "photos by" cap = 24% of NOELLE cap
const gap = H * 0.16;
const pad = H * 0.22, arm = H * 0.3, t = H * 0.07;

// Layout: "PHOTOS BY" sits above NOELLE, left aligned; crop marks frame NOELLE only.
const preH = pre.capHeight * s;
const top = preH + gap; // NOELLE cap top
const w = Math.max(name.width, pre.width * s);
const fx0 = -pad, fy0 = -pad, fx1 = name.width + pad, fy1 = top + H + pad;
const corner = (x, y, dx, dy) => `M${x} ${y + dy * arm}V${y}H${x + dx * arm}`;
const marks = [corner(fx0, fy0, 1, 1), corner(fx1, fy0, -1, 1), corner(fx0, fy1, 1, -1), corner(fx1, fy1, -1, -1)].join('');
const vb = [fx0 - t, fy0 - t, fx1 - fx0 + 2 * t, fy1 - fy0 + 2 * t].map((n) => Math.round(n));

const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" role="img" aria-labelledby="t"><title id="t">Photos by Noelle</title>
<path fill="currentColor" transform="translate(0 ${Math.round(preH)}) scale(${s.toFixed(4)})" d="${pre.d}"/>
<path fill="currentColor" transform="translate(0 ${Math.round(top + H)})" d="${name.d}"/>
<path fill="none" stroke="var(--wm-accent, currentColor)" stroke-width="${Math.round(t)}" stroke-linecap="square" d="${marks}"/>
</svg>`;

// Compact mark: N inside crop marks (favicon / avatar).
const n = outline(70, 900, 0, 'N');
const P = n.capHeight * 0.42, A = n.capHeight * 0.3, T = n.capHeight * 0.1;
const box = Math.max(n.width, n.capHeight) + 2 * P;
const ox = (box - n.width) / 2, oy = (box - n.capHeight) / 2;
const c2 = (x, y, dx, dy) => `M${x} ${y + dy * A}V${y}H${x + dx * A}`;
const m2 = [c2(T, T, 1, 1), c2(box - T, T, -1, 1), c2(T, box - T, 1, -1), c2(box - T, box - T, -1, -1)].join('');
const mark = (fg, bg, accent) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.round(box)} ${Math.round(box)}">
${bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : ''}<path fill="${fg}" transform="translate(${Math.round(ox)} ${Math.round(oy + n.capHeight)})" d="${n.d}"/>
<path fill="none" stroke="${accent}" stroke-width="${Math.round(T)}" stroke-linecap="square" d="${m2}"/></svg>`;

fs.mkdirSync('src/assets/brand', { recursive: true });
fs.writeFileSync('src/assets/brand/wordmark.svg', wordmark);
// favicon adapts to the browser chrome scheme
fs.writeFileSync('public/favicon.svg', mark('#0b111d', null, '#ff4b3a').replace('<svg ', '<svg ').replace('</svg>', '<style>@media (prefers-color-scheme: dark){path[fill]{fill:#eef2f6}}</style></svg>'));
fs.writeFileSync('src/assets/brand/mark-gameday.svg', mark('#eef2f6', '#0b111d', '#ff4b3a'));
fs.writeFileSync('src/assets/brand/mark-goldenhour.svg', mark('#073b45', '#f7dcb0', '#c23a20'));
console.log('wordmark viewBox', vb.join(' '), 'mark box', Math.round(box));
