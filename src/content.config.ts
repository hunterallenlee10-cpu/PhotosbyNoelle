import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Every photo on the site. Add a photo by dropping the JPEG into
 * src/assets/photos/<category>/ and adding an entry here (see README).
 */
const photos = defineCollection({
  loader: file('src/content/photos.json'),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      file: image(),
      category: z.enum(['sports', 'lifestyle', 'about', 'testimonials']),
      order: z.number(),
      width: z.number(),
      height: z.number(),
      orientation: z.enum(['landscape', 'portrait', 'square']),
      color: z.string(),
      lqip: z.string(),
      caption: z.string().nullable(),
      alt: z.string().min(1),
      focal: z.tuple([z.number(), z.number()]),
      tags: z.array(z.string()),
      sport: z.string().optional(),
      featured: z.boolean(),
      hidden: z.boolean().optional(),
      credit: z.string().nullable(),
      funFact: z.string().nullable().optional(),
      exif: z
        .object({
          camera: z.string(),
          lens: z.string().nullable(),
          focalLength: z.number().nullable(),
          aperture: z.number().nullable(),
          shutter: z.string(),
          iso: z.number().nullable(),
          taken: z.string().nullable(),
        })
        .nullable(),
      source: z.string().nullable(),
      sourcePage: z.string(),
      sourceFile: z.string(),
    }),
});

/** Kind words, copied verbatim from her Pixieset testimonials page. */
const testimonials = defineCollection({
  loader: file('src/content/testimonials.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    quote: z.string(),
    photo: z.string(),
    order: z.number(),
    source: z.url(),
    onHome: z.boolean().optional(),
  }),
});

/** Page copy and SEO. One Markdown file per page in src/content/pages/. */
const verse = z.object({ text: z.string(), ref: z.string() });
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: 'src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ogPhoto: z.string(),
    mode: z.enum(['gameday', 'goldenhour', 'auto']),
    // Home
    hero: z.object({ burst: z.array(z.string()).min(2), sub: z.string() }).optional(),
    worlds: z.object({ sports: z.object({ photo: z.string(), line: z.string() }), lifestyle: z.object({ photo: z.string(), line: z.string() }) }).optional(),
    selected: z.object({ heading: z.string(), aside: z.string() }).optional(),
    intro: z.object({ heading: z.string(), photo: z.string(), link: z.string() }).optional(),
    kindWords: z.object({ heading: z.string(), ids: z.array(z.string()) }).optional(),
    instagram: z.object({ heading: z.string() }).optional(),
    closing: z.object({ heading: z.string(), button: z.string() }).optional(),
    // Galleries
    verse: verse.optional(),
    opener: z.string().optional(),
    stories: z.array(z.object({ id: z.string(), heading: z.string(), body: z.string(), photos: z.array(z.string()) })).optional(),
    galleryHeading: z.string().optional(),
    // About / Kind Words / Inquire / 404
    heading: z.string().optional(),
    lead: z.string().optional(),
    portrait: z.string().optional(),
    chapters: z.array(z.object({ heading: z.string(), body: z.string(), photo: z.string() })).optional(),
    facts: z.object({ heading: z.string(), items: z.array(z.object({ id: z.string(), label: z.string(), text: z.string(), photo: z.string().optional(), confirm: z.string().optional() })) }).optional(),
    parks: z.object({ visited: z.number(), total: z.number() }).optional(),
    roll: z.object({ heading: z.string(), sub: z.string() }).optional(),
    success: z.object({ heading: z.string(), body: z.string(), instagram: z.string() }).optional(),
  }),
});

/** Business settings: links, cities, and the facts still waiting on Noelle. */
const settings = defineCollection({
  loader: file('src/content/settings.json'),
  schema: z.looseObject({ id: z.string() }),
});

export const collections = { photos, testimonials, pages, settings };
