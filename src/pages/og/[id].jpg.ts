// Open Graph / Twitter cards (1200x630), one per page, cut from Noelle's own photos
// around each photo's focal point, with the wordmark in the dark corner.
import type { APIRoute, GetStaticPaths } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { getCollection } from 'astro:content';

const W = 1200;
const H = 630;
const IDS: Record<string, string> = { home: 'home', sports: 'sports', lifestyle: 'lifestyle', about: 'about', 'kind-words': 'kind-words', inquire: 'inquire', 'not-found': 'not-found' };

export const getStaticPaths: GetStaticPaths = () => Object.keys(IDS).map((id) => ({ params: { id } }));

export const GET: APIRoute = async ({ params }) => {
  const pages = await getCollection('pages');
  const pageEntry = pages.find((p) => p.id === IDS[params.id!])!;
  const manifest = JSON.parse(await fs.readFile('src/content/photos.json', 'utf8')) as { id: string; file: string; width: number; height: number; focal: [number, number] }[];
  const p = manifest.find((m) => m.id === pageEntry.data.ogPhoto)!;
  const file = path.resolve('src/content', p.file);

  // Scale to cover, then crop around the focal point.
  const scale = Math.max(W / p.width, H / p.height);
  const rw = Math.round(p.width * scale);
  const rh = Math.round(p.height * scale);
  const left = Math.min(Math.max(0, Math.round((p.focal[0] / 100) * rw - W / 2)), rw - W);
  const top = Math.min(Math.max(0, Math.round((p.focal[1] / 100) * rh - H / 2)), rh - H);

  const wm = (await fs.readFile('src/assets/brand/wordmark.svg', 'utf8'))
    .replace('var(--wm-accent, currentColor)', '#ff4b3a')
    .replace(/currentColor/g, '#eef2f6');
  const wmPng = await sharp(Buffer.from(wm)).resize({ width: 300 }).png().toBuffer();
  const wmH = (await sharp(wmPng).metadata()).height ?? 157;
  const scrim = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" y1="1" x2="0.55" y2="0.2"><stop offset="0" stop-color="#0b111d" stop-opacity="0.85"/><stop offset="0.6" stop-color="#0b111d" stop-opacity="0"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`,
  );
  const out = await sharp(file)
    .resize(rw, rh)
    .extract({ left, top, width: W, height: H })
    .composite([{ input: scrim }, { input: wmPng, left: 48, top: H - 48 - wmH }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(out), { headers: { 'Content-Type': 'image/jpeg' } });
};
