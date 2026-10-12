# QA report: Photos by Noelle

Run on 2026-10-12 against the production build (`astro build`, served statically;
the inquiry function is checked separately). One batched round, one fix batch, one
confirmation round, as the brief requires.

## Final scores (confirmation round)

Lighthouse 13.5, mobile = simulated slow 4G + 4x CPU (Moto G Power), desktop preset.
SEO is shown for the **launch build** (`PUBLIC_LAUNCH=true`). The private preview
deliberately scores SEO 66 to 69 because it sends `noindex` and `robots.txt` disallows
crawling. That is the intended preview behavior, not a defect.

| Page | Perf mobile | Perf desktop | A11y | Best practices | SEO (launch) | LCP mobile | LCP desktop | CLS | TBT |
|---|---|---|---|---|---|---|---|---|---|
| Home | 93 | 99 | 100 | 100 | 100 | 3.0 s | 0.9 s | 0 | 0 ms |
| Sports | 93 | 100 | 100 | 100 | 100 | 3.1 s | 0.7 s | 0 | 0 ms |
| Lifestyle | 96 | 100 | 100 | 100 | 100 * | 2.8 s | 0.7 s | 0.001 | 0 ms |
| About | 93 | 100 | 100 | 100 | 100 * | 3.1 s | 0.7 s | 0 | 0 ms |
| Kind Words | 93 | 100 | 100 | 100 | 100 * | 3.1 s | 0.6 s | 0.006 | 0 ms |
| Inquire | 99 | 100 | 100 | 100 | 100 * | 2.0 s | 0.5 s | 0 | 0 ms |

\* SEO was measured in launch mode on Home and Sports (mobile) and on Sports and Lifestyle
(desktop): all 100. The only failing SEO audit on any page in preview mode is `is-crawlable`
(the intended `noindex`), so the rest follow.

Raw reports: `qa/lighthouse/` (full confirmation run, all pages, both form factors),
`qa/lighthouse-check*/` (re-runs after the final fixes), `qa/lighthouse-launch/`,
`qa/lighthouse-round1/summary.json` (first round, for comparison).

### Against the brief's bars

| Bar | Target | Result |
|---|---|---|
| Lighthouse Performance, mobile | ≥ 90 | **Met**: 93 to 99 |
| Lighthouse Performance, desktop | ≥ 98 | **Met**: 99 to 100 |
| Accessibility / Best Practices / SEO | ≥ 98 | **Met**: 100 / 100 / 100 (SEO in launch mode) |
| CLS | < 0.05 | **Met**: max 0.006 |
| INP | < 200 ms | Lab proxy TBT is 0 ms on every page; no field data yet |
| LCP, mobile (simulated slow 4G) | < 2.0 s | **Not met**: 2.0 s (Inquire) to 3.1 s. See below |
| Home JS (gzipped, excluding lazy chunks) | ~120 KB | **Met**: about 8 KB of page scripts load up front; GSAP (28 KB) loads after `load` for the burst; the lightbox (GSAP + Flip, ~40 KB) loads on first interaction with a gallery; Lenis loads on idle, desktop only |
| axe-core | 0 violations | **Met**: 0 across 8 pages x 2 lighting states x 2 widths (32 runs, `qa/axe.json`) |

**Mobile LCP.** The LCP element on every page is one of Noelle's photos, and it's
requested within the first ~25 ms at high priority. Unthrottled, LCP lands in under
250 ms (`lcp-breakdown-insight`). Lighthouse's simulated slow-4G link (about 1.6 Mbps)
puts a 50 to 90 KB AVIF hero plus the display font at roughly 3 s. Getting under 2.0 s
there would take a hero image under about 25 KB, a visible quality loss on the
photograph, which the brief ranks above everything else. The fix batch cut mobile LCP
from 3.2 to 4.1 s down to 2.8 to 3.1 s. Recommended next step: measure real-user LCP with
Vercel Speed Insights after launch before trading away image quality.

## Round 1 findings and what was fixed

Sources: Lighthouse round 1, axe, Impeccable detector, Web Interface Guidelines review
(`qa/web-interface-review.md`), visual review of 98 screenshots (7 widths x 7 pages x 2
lighting states, summarized in `qa/montage/`), and scripted interactions.

Fixed in the batch:
- Blur-up "develop" effect hid photos at opacity 0 until load, delaying LCP by ~1 s. It's now a filter-only effect.
- Both fonts preloaded at high priority and competed with the hero. Now only the display face this visitor sees above the fold is preloaded.
- Images were one size step heavier than phones need. Quality, widths and `sizes` were retuned, and above-the-fold story/gallery frames now load eagerly.
- The hero burst now starts after `load`, so it never competes with the LCP image.
- Contrast: the frame counter in Golden Hour (2.27:1 → 5.95:1) and the last row of frame numbers spilling onto the sand background.
- SplitText added an `aria-label` to a `<p>` (prohibited). Now `aria: 'none'`.
- About page had two landmarks named "Camera roll".
- Smooth-scroll intercepted in-page links without moving focus (skip link). Focus now follows.
- Menu triggers were links to a closed dialog. They're now buttons, with a no-JS link to the footer nav.
- Hidden mobile thumb bar could still be tabbed to. It's now `visibility: hidden` while off-screen.
- Inquiry form could double-submit. It now locks while sending, shows "Sending…", announces inline errors, and warns before leaving with an unsent message.
- Sports filter now lives in the URL (`/sports?sport=soccer`).
- Lightbox: Back closes it (history entry), `+` `-` `0` zoom from the keyboard, notch-safe controls, and the thumbnail shows instantly while the sharp version decodes.
- Rotating testimonials: stable pause label; slides the visitor changes are announced.
- Typography: curly quotes, the ellipsis, ʻokina in Hawaiʻi, apostrophe in class of ’26, `translate="no"` on the Instagram handle.
- Layout: the verse wrapped into a 16-line sliver (width set in `ch` of a condensed face); the sticky frame counter squeezed the first gallery rows; Golden Hour hero name ran into the athlete's face at 1024 to 1280 px; tall portraits filled the whole phone screen on Kind Words; the Inquire success panel showed before sending (`display` overrode `hidden`).
- Detector: an empty `<img>` in the burst layer; a width transition on the switch.

Not changed, by decision:
- Detector flag "Arial" in `src/pages/api/inquire.ts`: that's the HTML email body, where web-safe fonts are correct.
- First-person copy and sentence-case headings: Noelle's voice, on purpose.

## Interactions (production build, `qa/interact/`)

| Check | Result |
|---|---|
| Burst hero plays once per visit, lands on frame 081 | Pass |
| Reduced motion: no burst, final frame and name shown at once | Pass |
| Game Day ↔ Golden Hour switch; choice persists across pages | Pass |
| Lightbox: open from grid, arrows, Esc, focus returns to the frame | Pass |
| Deep link `/sports#frame-052` opens that frame | Pass |
| Sport filter (field hockey: 20 frames) | Pass |
| Mobile: thumb bar hidden at top, shown after scroll; menu sheet opens | Pass |
| Form: empty submit shows 4 inline errors and focuses the first | Pass |
| API: invalid payload → 422 with field errors; honeypot → silent 200 | Pass (dev server; re-checked on the Vercel preview) |
| JavaScript disabled: frames are plain image links, switch hidden, form posts | Pass |
