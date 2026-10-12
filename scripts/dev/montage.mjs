// Side-by-side montage of one page at every width. node scripts/dev/montage.mjs <dir> <prefix> <out.jpg> [colW] [maxH]
import sharp from 'sharp';
import fs from 'node:fs';
const [dir, prefix, out, colW = 260, maxH = 2600] = process.argv.slice(2);
const widths = [375, 390, 768, 1024, 1280, 1440, 1920];
const cols = [];
for (const w of widths) {
  const f = `${dir}/${prefix}-${w}.png`;
  if (!fs.existsSync(f)) continue;
  const m = await sharp(f).metadata();
  const scale = +colW / m.width;
  const h = Math.min(Math.round(m.height * scale), +maxH);
  cols.push({ buf: await sharp(f).resize(+colW).extract({ left: 0, top: 0, width: +colW, height: h }).toBuffer(), h, w });
}
const H = Math.max(...cols.map((c) => c.h)) + 24;
const label = (t) => Buffer.from(`<svg width="${colW}" height="22"><text x="4" y="16" font-size="14" font-family="sans-serif" fill="#000">${t}px</text></svg>`);
await sharp({ create: { width: cols.length * (+colW + 10), height: H, channels: 3, background: '#bbb' } })
  .composite(cols.flatMap((c, i) => [{ input: label(c.w), left: i * (+colW + 10), top: 0 }, { input: c.buf, left: i * (+colW + 10), top: 24 }]))
  .jpeg({ quality: 70 }).toFile(out);
console.log(out);
