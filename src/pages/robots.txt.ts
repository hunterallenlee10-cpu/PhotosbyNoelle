// robots.txt follows the launch flag: private preview disallows everything,
// PUBLIC_LAUNCH=true allows crawling and points at the sitemap.
import type { APIRoute } from 'astro';
import { launched } from '@/lib/content';

export const GET: APIRoute = ({ site }) => {
  const body = launched
    ? `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`
    : `# Private preview: not for search engines yet (set PUBLIC_LAUNCH=true to launch).\nUser-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
