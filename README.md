# Photos by Noelle

Portfolio and inquiry site for **Noelle Lanham**, sports and lifestyle photographer in
Honolulu, HI and Fredericksburg, VA. Built by Lee Systems Co.

**Concept: "Two Shores, One Lens."** The site has two lighting states. **Game Day**
(stadium ink, floodlight white, dugout red) and **Golden Hour** (sunlit sand, deep ocean
teal, coral) are both pulled from her own photos. Sports opens in Game Day, Lifestyle
opens in Golden Hour, and every other page follows the visitor's system setting until they
use the switch in the header (the choice is remembered). The display type (Anybody)
changes width with the light: condensed caps under the lights, wide italics at sunset.

Stack: Astro 7 (static output + one Vercel function), TypeScript strict, Astro's image
pipeline (AVIF / WebP / JPEG), GSAP (Flip, SplitText), Lenis (desktop only). Every
dependency is pinned to an exact version that was at least 14 days old when installed.

---

## Run it locally

Requires Node 22.12 or newer.

```bash
npm install
npm run dev        # http://localhost:4321 (images are generated on demand, so first loads are slow)
npm run build      # production build into dist/ and .vercel/output/
npm run preview    # serve the production build
npm run check      # TypeScript + Astro diagnostics
```

The first full build processes about 3,300 image variants and takes roughly 10 to 15
minutes on a 4-core machine. Results are cached in `node_modules/.astro/`, so later builds
only process new or changed photos.

---

## Live demo (GitHub Pages)

Every push to `main` runs `.github/workflows/pages.yml`, which builds a fully static version
(`DEPLOY_TARGET=pages`, served under `/PhotosbyNoelle`) and publishes it to the `gh-pages`
branch: **https://hunterallenlee10-cpu.github.io/PhotosbyNoelle/**

GitHub Pages can't run the inquiry function, so on the demo the form validates and then
says it isn't connected yet. For launch, deploy to Vercel (below) where `/api/inquire` runs.

```bash
DEPLOY_TARGET=pages npm run build   # same build locally, output in dist/
```

## Environment variables

Copy `.env.example` to `.env` for local work; set the same keys in Vercel
(Project → Settings → Environment Variables).

| Variable | Required | What it does |
|---|---|---|
| `PUBLIC_LAUNCH` | no (default `false`) | `true` removes `noindex`, opens `robots.txt`, and generates the sitemap. Leave it unset for the private preview. |
| `SITE_URL` | at launch | Canonical origin, e.g. `https://photosbynoelle.com`. Used for canonical URLs, Open Graph images, JSON-LD and the sitemap. |
| `RESEND_API_KEY` | for email | Resend API key. With `INQUIRY_TO_EMAIL`, inquiries are emailed through Resend. |
| `INQUIRY_TO_EMAIL` | for email | Where inquiries go (Noelle's address). Comma-separate for several. |
| `INQUIRY_FROM_EMAIL` | recommended | Sender, e.g. `Photos by Noelle <inquiries@photosbynoelle.com>`. The domain must be verified in Resend. Without it, Resend's test sender is used (which only delivers to the Resend account owner). |
| `FORMSPREE_ENDPOINT` | fallback | Used only when Resend isn't configured, e.g. `https://formspree.io/f/abcdwxyz`. |

If neither Resend nor Formspree is configured, the form validates normally but answers
"something went wrong" and logs `not-configured`, so set one before sharing the site.

### Inquiry form

- `POST /api/inquire` (`src/pages/api/inquire.ts`) runs as a Vercel function.
- Client-side and server-side validation share the rules in `src/lib/inquiry.ts`.
- Spam protection: a hidden honeypot field, a minimum fill time (2.5 s), and a per-IP
  limit of 5 submissions per 10 minutes. The limit lives in the function's memory, so
  it is a basic guard rather than a guarantee. If spam becomes a problem, add Vercel
  Firewall rate limiting or Cloudflare Turnstile.
- Without JavaScript the form posts normally and lands on `/inquire/thanks` or
  `/inquire/problem`.
- Replies go straight to the visitor: Resend sets `reply-to` to their email address.

**Resend setup:** create an account → add and verify the sending domain → create an API key →
set `RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL` → redeploy → send a test inquiry.

**Formspree setup:** create a form → copy its endpoint → set `FORMSPREE_ENDPOINT` → redeploy.

---

## Photos

Every photo on the site lives in `src/assets/photos/<category>/` and is listed in
`src/content/photos.json`. The four categories are `sports`, `lifestyle`, `about` and
`testimonials`. Astro generates all sizes and formats at build time and strips camera
metadata (including any GPS) from the output; the EXIF line shown in the lightbox comes
from `photos.json`.

### Add a photo

1. Export a JPEG, at least 2000 px on the long edge (2400 px is ideal).
2. Drop it into the right folder, e.g. `src/assets/photos/sports/frame-083-state-final.jpg`.
3. Add an entry to `src/content/photos.json` (copy a neighbor and edit it):

```jsonc
{
  "id": "s083",                       // unique; sports = sNNN, lifestyle = lNNN, about = aNNN
  "file": "../assets/photos/sports/frame-083-state-final.jpg",
  "category": "sports",
  "order": 83,                        // position in the gallery (frame number)
  "width": 2400, "height": 1600,      // pixel size of the file
  "orientation": "landscape",
  "color": "#3b5a2a",                 // any representative color (shows while loading)
  "lqip": "",                         // optional tiny blurred preview; may be left empty
  "caption": null,                    // published caption, if any (shown in the lightbox)
  "alt": "Describe the sport, the action and the emotion in one sentence.",
  "focal": [50, 40],                  // % from left, % from top: what must stay in a crop
  "tags": ["action"],
  "sport": "baseball",                // sports only: baseball, field-hockey, soccer, lacrosse, volleyball, basketball, other
  "featured": false,                  // true = eligible for the home page "selected frames"
  "credit": null,                     // another photographer's name, if it isn't Noelle's
  "exif": null,                       // or { camera, lens, focalLength, aperture, shutter, iso, taken }
  "source": null, "sourcePage": "", "sourceFile": "frame-083-state-final.jpg"
}
```

Run `npm run check` to catch typos. A missing file or alt text fails the build on purpose.

**Faster path for a batch:** `scripts/import-photos.mjs` turns a folder of originals into
web-ready files plus manifest entries (EXIF, size, color, preview) automatically. See the
header comment in the script.

### Remove or hide a photo

Set `"hidden": true` on its entry to take it off the site but keep it in the repo, or
delete the entry and the file.

### Home page picks

- Selected frames: `featured: true` in `photos.json`, ordered by the list in `src/pages/index.astro`.
- Hero burst: `hero.burst` in `src/content/pages/home.md`; the last id is the frame it freezes on.
- Two-worlds panels: `worlds` in `home.md`.

---

## Copy

All page text lives in `src/content/pages/*.md` (frontmatter plus body). Edit the words
there; no component code needs to change. Titles and descriptions in the same files
drive SEO.

| File | Page |
|---|---|
| `home.md` | Home (`/`) |
| `sports.md` | Sports (`/sports`): verse, intro, feature stories |
| `lifestyle.md` | Lifestyle (`/lifestyle`) |
| `about.md` | Get to Know Me (`/about`): chapters, fun facts, national parks count |
| `kind-words.md` | Kind Words (`/kind-words`) |
| `inquire.md` | Inquire (`/inquire`) and the thank-you message |
| `not-found.md` | 404 |

- Testimonials: `src/content/testimonials.json`, copied word for word from her Pixieset
  testimonials page. Each one points at a photo id.
- Business settings (Instagram, client galleries link, cities, open questions):
  `src/content/settings.json`.

### `{{CONFIRM}}` placeholders

Facts still waiting on Noelle are marked in the markup. On the preview they're hidden so the
demo reads cleanly; add `?confirm` to any URL to show them as red **{{CONFIRM: ...}}** tags.
They're removed entirely when `PUBLIC_LAUNCH=true`, so resolve every one before launch. The full list is in the handoff section below.

---

## Launch on a custom domain

1. Resolve every `{{CONFIRM}}` item (see the handoff section).
2. Vercel → Project → Settings → Domains → add the domain and follow the DNS instructions.
3. Set `SITE_URL=https://<domain>` and `PUBLIC_LAUNCH=true` for **Production**.
4. Set the email variables (above) and send a test inquiry.
5. Redeploy production. Then check `https://<domain>/robots.txt` (should allow crawling and
   list the sitemap) and that pages no longer carry `noindex`.
6. Submit `https://<domain>/sitemap-index.xml` in Google Search Console.

---

## Project map

```
src/
  assets/photos/        her photos (sports, lifestyle, about, testimonials)
  assets/brand/         wordmark + N mark (outlined SVG)
  content/              photos.json, testimonials.json, settings.json, pages/*.md
  components/           BurstHero, TwoWorlds, ContactSheet, StoryBlock, KindWords, ...
  layouts/Base.astro    head, meta, JSON-LD, lighting bootstrap, header/footer
  pages/                routes, plus api/inquire.ts, og/[id].jpg.ts, robots.txt.ts
  scripts/              site.ts (switch, clocks, menu), sheet.ts, lightbox.ts
  styles/               global.css (tokens for both lighting states), lightbox.css
research/               Phase 1 inspiration + screenshots, palette.json, checkpoint board
qa/                     Lighthouse, axe and guideline reports, screenshots
scripts/                photo import + notes merge; dev/ holds QA helpers
```

## QA helpers

```bash
node scripts/dev/shoot.mjs <outDir> 375,390,768,1024,1280,1440,1920 http://localhost:4321/sports   # FULL=1 MOTION=reduce SCHEME=dark
node scripts/dev/interact.mjs http://localhost:4321 qa/interact   # drives burst, switch, lightbox, filters, menu, form
```
