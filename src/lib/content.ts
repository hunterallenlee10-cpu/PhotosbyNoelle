import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Photo = CollectionEntry<'photos'>['data'];
export type Testimonial = CollectionEntry<'testimonials'>['data'];

let photoCache: Map<string, Photo> | null = null;

export async function photoMap(): Promise<Map<string, Photo>> {
  if (!photoCache) {
    const all = await getCollection('photos');
    photoCache = new Map(all.map((p) => [p.data.id, p.data]));
  }
  return photoCache;
}

export async function photo(id: string): Promise<Photo> {
  const p = (await photoMap()).get(id);
  if (!p) throw new Error(`Unknown photo id "${id}" (check src/content/photos.json)`);
  return p;
}

export async function photos(ids: string[]): Promise<Photo[]> {
  return Promise.all(ids.map(photo));
}

export async function category(cat: Photo['category']): Promise<Photo[]> {
  return [...(await photoMap()).values()].filter((p) => p.category === cat && !p.hidden).sort((a, b) => a.order - b.order);
}

export async function testimonials(): Promise<Testimonial[]> {
  return (await getCollection('testimonials')).map((t) => t.data).sort((a, b) => a.order - b.order);
}

export async function page(id: string) {
  const entry = await getEntry('pages', id);
  if (!entry) throw new Error(`Missing page copy src/content/pages/${id}.md`);
  return entry;
}

export async function settings() {
  const entry = await getEntry('settings', 'site');
  if (!entry) throw new Error('Missing src/content/settings.json');
  return entry.data as unknown as Settings;
}

export interface Settings {
  name: string;
  photographer: string;
  jobTitle: string;
  instagram: { handle: string; url: string };
  clientGalleries: { label: string; url: string; confirm?: string };
  email: { value: string | null; confirm?: string };
  phone: { value: string | null; confirm?: string };
  since: { label: string; confirm?: string };
  logo: { confirm?: string };
  cities: { name: string; region: string; regionName: string; tz: string; zone: string }[];
  credit: { label: string; url: string | null };
}

export const launched = import.meta.env.PUBLIC_LAUNCH === 'true' || process.env.PUBLIC_LAUNCH === 'true';

/** Real typographic apostrophes and quotes without changing a word. */
export const smart = (s: string) =>
  s
    .replace(/(\w)'(\w)/g, '$1’$2')
    .replace(/(^|[\s(])'/g, '$1‘')
    .replace(/'/g, '’')
    .replace(/(^|[\s(])"/g, '$1“')
    .replace(/"/g, '”');

/** "Frame 012" style numbering. */
export const frameNo = (n: number) => String(n).padStart(3, '0');

export const exifLine = (p: Photo) => {
  const e = p.exif;
  if (!e) return null;
  return [e.camera.replace(/^Canon /, 'Canon '), e.focalLength ? `${e.focalLength}mm` : null, e.aperture ? `f/${e.aperture}` : null, e.shutter, e.iso ? `ISO ${e.iso}` : null]
    .filter(Boolean)
    .join('   ');
};
