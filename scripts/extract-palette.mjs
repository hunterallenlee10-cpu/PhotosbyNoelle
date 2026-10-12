// Extract dominant swatches from Noelle's photos (sharp + node-vibrant) and
// aggregate them per category. Usage: node scripts/extract-palette.mjs <photosRoot> <out.json>
import { Vibrant } from 'node-vibrant/node';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const [root, out = 'research/palette.json'] = process.argv.slice(2);
const cats = ['sports', 'lifestyle'];
const result = { generatedAt: new Date().toISOString(), method: 'node-vibrant 4 on 400px downsamples, swatches weighted by population', categories: {} };

const hex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

for (const cat of cats) {
  const dir = path.join(root, cat);
  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f));
  const buckets = {};
  const perImage = [];
  for (const f of files) {
    const buf = await sharp(path.join(dir, f)).rotate().resize(400, 400, { fit: 'inside' }).jpeg().toBuffer();
    const pal = await Vibrant.from(buf).getPalette();
    const row = { file: f };
    for (const [name, sw] of Object.entries(pal)) {
      if (!sw) continue;
      row[name] = sw.hex;
      (buckets[name] ||= []).push({ rgb: sw.rgb, pop: sw.population });
    }
    perImage.push(row);
  }
  const summary = {};
  for (const [name, list] of Object.entries(buckets)) {
    const tot = list.reduce((a, s) => a + s.pop, 0);
    const avg = [0, 1, 2].map((i) => list.reduce((a, s) => a + s.rgb[i] * s.pop, 0) / tot);
    // also keep the 6 most-populous individual swatches (real colors, not averages)
    const top = [...list].sort((a, b) => b.pop - a.pop).slice(0, 6).map((s) => hex(s.rgb));
    summary[name] = { weightedAverage: hex(avg), mostPopulous: top, samples: list.length };
  }
  result.categories[cat] = { images: files.length, swatches: summary, perImage };
}
fs.writeFileSync(out, JSON.stringify(result, null, 2));
for (const [c, v] of Object.entries(result.categories)) {
  console.log(c);
  for (const [n, s] of Object.entries(v.swatches)) console.log('  ', n.padEnd(12), s.weightedAverage, s.mostPopulous.join(' '));
}
