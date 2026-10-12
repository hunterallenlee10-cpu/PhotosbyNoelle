/** Site-relative URL that respects Astro's `base` (e.g. GitHub Pages serves under /PhotosbyNoelle). */
export const u = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;
