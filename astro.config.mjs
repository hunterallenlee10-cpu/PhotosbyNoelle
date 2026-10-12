// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// PUBLIC_LAUNCH=true turns off noindex and robots.txt disallow, and turns on the sitemap.
const launched = process.env.PUBLIC_LAUNCH === 'true';
const site = process.env.SITE_URL || 'https://photosbynoelle.vercel.app';

export default defineConfig({
  site,
  output: 'static',
  adapter: vercel({ imageService: false, webAnalytics: { enabled: false } }),
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  integrations: launched ? [sitemap({ filter: (page) => !page.includes('/404') })] : [],
  image: {
    responsiveStyles: false,
    // ~200 photos x several widths x AVIF/WebP/JPEG: keep cold builds well under Vercel's limit.
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: { avif: { effort: 2 }, webp: { effort: 4 }, jpeg: { mozjpeg: true, progressive: true } },
    },
  },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
