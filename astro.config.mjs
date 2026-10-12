// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// PUBLIC_LAUNCH=true turns off noindex and robots.txt disallow, and turns on the sitemap.
const launched = process.env.PUBLIC_LAUNCH === 'true';
// DEPLOY_TARGET=pages builds a fully static demo for GitHub Pages (served under /PhotosbyNoelle,
// no serverless function, so the inquiry form shows its "not connected yet" message).
const pages = process.env.DEPLOY_TARGET === 'pages';
const site = process.env.SITE_URL || (pages ? 'https://hunterallenlee10-cpu.github.io' : 'https://photosbynoelle.vercel.app');

/**
 * On GitHub Pages there are no functions: pre-render the API route to a static stub.
 * @type {import('astro').AstroIntegration}
 */
const staticApi = {
  name: 'static-api-on-pages',
  hooks: {
    'astro:route:setup': ({ route }) => {
      if (route.component.includes('src/pages/api/')) route.prerender = true;
    },
  },
};

export default defineConfig({
  site,
  base: pages ? '/PhotosbyNoelle' : undefined,
  output: 'static',
  adapter: pages ? undefined : vercel({ imageService: false, webAnalytics: { enabled: false } }),
  trailingSlash: 'never',
  build: { format: pages ? 'directory' : 'file', inlineStylesheets: 'auto' },
  integrations: [
    ...(launched ? [sitemap({ filter: (page) => !page.includes('/404') && !page.includes('/inquire/') })] : []),
    ...(pages ? [staticApi] : []),
  ],
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
