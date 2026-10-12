// One-time importer: takes the photos scraped from Noelle's Pixieset site and
// writes web-ready originals + the photos.json manifest.
//
//   node scripts/import-photos.mjs <rawDir> <scrapeManifest.json>
//
// rawDir layout: <rawDir>/<sports|lifestyle|about|testimonials|home>/<NNN>-<key>.<ext>
// Originals are re-encoded at max 2400px (mozjpeg q84); About snapshots at 1600px q80. Metadata is NOT copied into
// the output files (sharp strips it), so no GPS ever ships; EXIF that matters for the
// lightbox (body, lens, focal length, aperture, shutter, ISO) is kept in the manifest.
// Alt text, focal points and tags are merged in later by scripts/merge-photo-notes.mjs.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import exifr from 'exifr';

const [rawDir, scrapePath] = process.argv.slice(2);
if (!rawDir || !scrapePath) throw new Error('usage: node scripts/import-photos.mjs <rawDir> <scrapeManifest.json>');
const scrape = JSON.parse(fs.readFileSync(scrapePath, 'utf8'));

const OUT = 'src/assets/photos';
const MANIFEST = 'src/content/photos.json';
const existing = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : [];
const keep = new Map(existing.map((p) => [p.id, p]));

const SOURCE_PAGE = {
  sports: 'https://noellelanham.mypixieset.com/new-page/',
  lifestyle: 'https://noellelanham.mypixieset.com/new-page-3/',
  about: 'https://noellelanham.mypixieset.com/new-page-1/',
  testimonials: 'https://noellelanham.mypixieset.com/testimonials/',
  home: 'https://noellelanham.mypixieset.com/',
};

// Testimonial photos appear on her page in this order, each directly above its quote.
const TESTIMONIAL_ORDER = ['jake-lowery', 'becky-larkin', 'aidan-pinto', 'jason-burton', 'billy-fluharty', 'bryan-diehr', 'abby-lybarger', 'jack-bowles'];

// Captions published on her site, used as story hooks and the base of the alt text.
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
const shortCaption = (alt) => alt.split(/,| - /)[0];

const pad = (n) => String(n).padStart(3, '0');
const manifest = [];

for (const cat of ['sports', 'lifestyle', 'about', 'testimonials', 'home']) {
  const dir = path.join(rawDir, cat);
  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
  const outCat = cat === 'home' ? 'about' : cat;
  fs.mkdirSync(path.join(OUT, outCat), { recursive: true });

  for (const f of files) {
    const idx = Number(f.slice(0, 3));
    const key = f.slice(4).replace(/\.\w+$/, '');
    const src = scrape[cat]?.find((s) => s.key === key);
    const caption = src?.alt?.trim() || '';
    let id;
    if (cat === 'sports' || cat === 'lifestyle') id = `${cat === 'sports' ? 's' : 'l'}${pad(idx + 1)}`;
    else if (cat === 'about') id = `a${pad(idx + 1)}`;
    else if (cat === 'testimonials') id = `t-${TESTIMONIAL_ORDER[idx]}`;
    else id = 'noelle-portrait';

    let slug;
    if (cat === 'testimonials') slug = TESTIMONIAL_ORDER[idx];
    else if (cat === 'home') slug = 'noelle-portrait';
    else if (cat === 'about') slug = /RobinSkievaski/i.test(src?.file || key) ? `snap-${pad(idx + 1)}-wedding-party` : `snap-${pad(idx + 1)}`;
    else slug = `frame-${pad(idx + 1)}${caption ? '-' + slugify(shortCaption(caption)) : ''}`;

    const rel = `${outCat}/${slug}.jpg`;
    const dest = path.join(OUT, rel);
    const input = path.join(dir, f);

    const img = sharp(input).rotate();
    if (!fs.existsSync(dest)) {
      const max = outCat === 'about' && id !== 'noelle-portrait' ? 1600 : 2400;
      await img.clone().resize(max, max, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: outCat === 'about' ? 80 : 84, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(dest);
    }
    const meta = await sharp(dest).metadata();
    const stats = await sharp(dest).stats();
    const d = stats.dominant;
    const lqip = await sharp(dest).resize(24, 24, { fit: 'inside' }).webp({ quality: 40 }).toBuffer();

    let exif = null;
    try {
      const e = await exifr.parse(input, { pick: ['Make', 'Model', 'LensModel', 'FocalLength', 'FNumber', 'ExposureTime', 'ISO', 'DateTimeOriginal'] });
      if (e && e.Model && e.ExposureTime) {
        exif = {
          camera: [e.Make && !e.Model.startsWith(e.Make.split(' ')[0]) ? e.Make.split(' ')[0] : '', e.Model].join(' ').trim(),
          lens: e.LensModel || null,
          focalLength: e.FocalLength ? Math.round(e.FocalLength) : null,
          aperture: e.FNumber || null,
          shutter: e.ExposureTime >= 1 ? `${e.ExposureTime}s` : `1/${Math.round(1 / e.ExposureTime)}`,
          iso: e.ISO || null,
          taken: e.DateTimeOriginal ? new Date(e.DateTimeOriginal).toISOString().slice(0, 10) : null,
        };
      }
    } catch {}

    const prev = keep.get(id) || {};
    manifest.push({
      id,
      file: `../assets/photos/${rel}`,
      category: outCat,
      order: idx + 1,
      width: meta.width,
      height: meta.height,
      orientation: meta.width > meta.height * 1.05 ? 'landscape' : meta.height > meta.width * 1.05 ? 'portrait' : 'square',
      color: '#' + [d.r, d.g, d.b].map((v) => v.toString(16).padStart(2, '0')).join(''),
      lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
      caption: caption || null,
      alt: prev.alt || caption || '',
      focal: prev.focal || [50, 50],
      tags: prev.tags || [],
      featured: prev.featured || false,
      credit: /RobinSkievaski/i.test(src?.file || key) ? 'Robin Skievaski Photography' : null,
      exif,
      source: src?.best || null,
      sourcePage: SOURCE_PAGE[cat],
      sourceFile: src?.file || f,
    });
  }
}

fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
const by = manifest.reduce((a, p) => ((a[p.category] = (a[p.category] || 0) + 1), a), {});
console.log('photos:', manifest.length, by, 'with exif:', manifest.filter((p) => p.exif).length);
