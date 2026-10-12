// Merges per-photo notes (alt text, focal point, tags, sport, fun-fact) into
// src/content/photos.json. node scripts/merge-photo-notes.mjs <notesDir>
// Notes files: sports.json, lifestyle.json, testimonials.json, about.json
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
const MANIFEST = 'src/content/photos.json';
const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const byId = new Map(manifest.map((p) => [p.id, p]));

// Hidden from the site (still in the repo). Reasons are listed in the README handoff.
const HIDDEN = {
  a024: 'banner with other people\'s names and a beer bottle',
  a043: 'banner with other people\'s names',
  a056: 'group photo that includes a young child',
};
// Home "selected frames": strongest, most varied picks (hero and two-worlds frames excluded).
const FEATURED = ['s036', 'l015', 's054', 'l043', 's068', 'l002', 's047', 'l006', 's074', 'l028', 's035', 'l046', 's056', 'l038', 's075'];

let n = 0;
for (const f of ['sports', 'lifestyle', 'testimonials', 'about']) {
  const file = path.join(dir, `${f}.json`);
  if (!fs.existsSync(file)) continue;
  for (const note of JSON.parse(fs.readFileSync(file, 'utf8'))) {
    const p = byId.get(note.id);
    if (!p) throw new Error(`note for unknown id ${note.id}`);
    if (/[–—]/.test(note.alt)) throw new Error(`dash in alt for ${note.id}`);
    p.alt = note.alt.trim();
    p.focal = note.focal;
    p.tags = note.tags || (note.funFact ? [note.funFact] : []);
    if (note.sport) p.sport = note.sport;
    if (f === 'about') p.funFact = note.funFact ?? null;
    n++;
  }
}
for (const p of manifest) {
  p.featured = FEATURED.includes(p.id);
  if (HIDDEN[p.id]) p.hidden = true; else delete p.hidden;
}
const missing = manifest.filter((p) => !p.alt);
if (missing.length) throw new Error('missing alt: ' + missing.map((p) => p.id).join(', '));
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`merged ${n} notes; featured ${FEATURED.length}; hidden ${Object.keys(HIDDEN).length}`);
