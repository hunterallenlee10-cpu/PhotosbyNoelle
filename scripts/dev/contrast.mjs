// WCAG contrast checker for palette pairs. node scripts/dev/contrast.mjs fg bg [fg bg ...]
const lum = (h) => { const c = h.replace('#','').match(/../g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const a = process.argv.slice(2);
for (let i = 0; i < a.length; i += 2) { const r = ratio(a[i], a[i + 1]); console.log(a[i], 'on', a[i + 1], r.toFixed(2), r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA-large' : 'FAIL'); }
