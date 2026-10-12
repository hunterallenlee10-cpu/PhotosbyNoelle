## src/layouts/Base.astro

src/layouts/Base.astro:90 - theme-color metas follow system `prefers-color-scheme`, not the page's fixed `data-mode`; until site.ts runs (and always without JS) a Game Day page on a light-mode device gets sand chrome. Render one `<meta name="theme-color">` from `mode` when it isn't `'auto'`
src/layouts/Base.astro:67 - `viewport-fit=cover` opts into drawing under the notch, but nothing pads for it (see global.css:246, lightbox.css:15)

## src/components/BurstHero.astro

✓ pass

## src/components/Confirm.astro

✓ pass

## src/components/ContactSheet.astro

src/components/ContactSheet.astro:110 - `.chip` filter buttons have no `:hover` state
src/components/ContactSheet.astro:63 - filter result not announced; add a polite live region ("12 frames") updated on filter change
src/components/ContactSheet.astro:98 - up to 82 `.item`s: add `content-visibility: auto; contain-intrinsic-size: auto calc(var(--ar) * var(--row-h)) var(--row-h)` (the `auto` keyword keeps the rendered size after first paint)

## src/components/CropMarks.astro

✓ pass

## src/components/Footer.astro

src/components/Footer.astro:17 - without JS the scoreboard shows `--:--` placeholders (TwoWorlds hides its seam; this doesn't). Hide clocks under `:root:not(.js)` or mark `data-js-only`
src/components/Footer.astro:33 - Instagram handle `@noelle.lanham` needs `translate="no"`

## src/components/Header.astro

src/components/Header.astro:21 - Menu trigger is `<a href="#menu">` performing an action (opens dialog). Without JS `#menu` targets a closed `<dialog>`, so it does nothing on mobile. Use `<button>` + `data-js-only`, or keep the link and point it at `#footer-nav` as the no-JS fallback
src/components/Header.astro:40 - `.menu-btn` has no hover state (text-decoration none, no color/background change)

## src/components/Icon.astro

✓ pass

## src/components/KindWords.astro

src/components/KindWords.astro:16 - pause button combines `aria-pressed` with a label that swaps ("Pause rotation" ↔ "Resume rotation") → reads "Resume rotation, pressed". Keep one fixed label with `aria-pressed`, or swap labels and drop `aria-pressed`
src/components/KindWords.astro:20 - `aria-live="off"` never changes; set `polite` when paused or after prev/next clicks (and back to `off` while auto-rotating) so manual slide changes are announced

## src/components/Menu.astro

src/components/Menu.astro:31 - same as Header.astro:21: `<a href="#menu">` opens a dialog; no-JS target is a closed `<dialog>`
src/components/Menu.astro:35 - menu sheet (`max-height: 92dvh`, scrollable) lacks `overscroll-behavior: contain`; scroll chains to the page behind
src/components/Menu.astro:66 - hidden thumb bar uses only `opacity: 0; pointer-events: none`, so its "Inquire" and "Menu" links stay in tab order and the a11y tree while invisible. Add `visibility: hidden` (delay it in the transition) or toggle `inert` in site.ts:108

## src/components/ModeToggle.astro

✓ pass

## src/components/Photo.astro

✓ pass

## src/components/Scripture.astro

✓ pass

## src/components/StoryBlock.astro

src/components/StoryBlock.astro:24 - `{body}` rendered without `smart()`: "Crews'", "Gallo's" print straight apostrophes → ’

## src/components/TwoWorlds.astro

src/components/TwoWorlds.astro:22 - `{h.line}` rendered without `smart()`: "you'll" → "you’ll"

## src/components/Wordmark.astro

✓ pass

## src/pages/404.astro

src/pages/404.astro:34 - `transition: filter` (blur) isn't compositor-only. Minor (single image)

## src/pages/about.astro

src/pages/about.astro:31 - `{d.lead}` rendered raw: "Let's … lens..." → "Let’s", "…" (wrap in `smart()` and fix the ellipsis in about.md)
src/pages/about.astro:46 - `{c.body}` rendered raw: straight apostrophes ("school's", "I'm", "'26"); "Hawai'i" should use the ʻokina: "Hawaiʻi"
src/pages/about.astro:63 - `{f.text}` rendered raw: "It's" → "It’s"
src/pages/about.astro:75 - `{d.roll.sub}` rendered raw: "I'm", "I'd" → ’
src/pages/about.astro:58 - `aria-label` on `<p>` (generic role) is ignored by most screen readers; the visible "1 of 63" already reads fine, so drop it or move the text into a visually-hidden span
src/pages/about.astro:76 - Instagram handle needs `translate="no"`

## src/pages/index.astro

src/pages/index.astro:61 - `{d.intro.heading}` rendered without `smart()`: "I'm" → "I’m"
src/pages/index.astro:73 - Instagram handle needs `translate="no"`

## src/pages/inquire.astro

src/pages/inquire.astro:215 - double submit: during the request the button only gets `aria-busy` + `pointer-events: none` (line 144); pressing Enter in a field submits again. Guard with an in-flight flag or `send.disabled = true` once the request starts; add a spinner to the button
src/pages/inquire.astro:197 - errors shown on blur go into non-live `.err` nodes, so screen readers don't hear them until focus returns. Make `.err` `aria-live="polite"` or announce via the status region
src/pages/inquire.astro:160 - no `beforeunload` warning when the message (up to 4000 chars) has unsaved input
src/pages/inquire.astro:38 - email input missing `spellcheck="false"`
src/pages/inquire.astro:70 - "Date or season" input has no `autocomplete`; add `autocomplete="off"`
src/pages/inquire.astro:83 - "How did you hear" input has no `autocomplete`; add `autocomplete="off"`
src/pages/inquire.astro:71 - straight quotes `"flexible"` → `“flexible”`
src/pages/inquire.astro:17 - `{d.heading}` rendered raw: "Let's" → "Let’s"
src/pages/inquire.astro:18 - `{d.lead}` rendered raw: "you're", "I'll" → ’
src/pages/inquire.astro:102 - `{d.success.body}` rendered raw: "I'll" → "I’ll"

## src/pages/kind-words.astro

✓ pass

## src/pages/lifestyle.astro

✓ pass

## src/pages/sports.astro

✓ pass (filter state: see src/scripts/sheet.ts:42)

## src/pages/inquire/problem.astro

src/pages/inquire/problem.astro:8 - "didn't" (title + description) → "didn’t"
src/pages/inquire/problem.astro:10 - "That didn't send." → "didn’t"
src/pages/inquire/problem.astro:13 - "Back to the form" loads a blank `/inquire`, discarding what they typed. Tell them to use the browser Back button to keep their message (or link `javascript:history.back()` with `/inquire` as the href fallback)
src/pages/inquire/problem.astro:14 - Instagram handle needs `translate="no"`

## src/pages/inquire/thanks.astro

src/pages/inquire/thanks.astro:14 - `{d.success.body}` rendered raw: "I'll" → "I’ll"

## src/scripts/lightbox.ts

src/scripts/lightbox.ts:247 - zoom only via dblclick/pinch, pan only via drag; no keyboard or button alternative. Add `+`/`-`/`0` keys and arrow-key panning when zoomed (arrows currently always navigate)
src/scripts/lightbox.ts:186 - opening doesn't add a history entry (only `replaceState`), so the Android/browser Back gesture leaves the page instead of closing the viewer. `pushState` on open, close on `popstate`

## src/scripts/sheet.ts

src/scripts/sheet.ts:42 - sport filter isn't reflected in the URL; sync to `?sport=soccer` (`replaceState`) and apply it on init so filtered views can be shared and survive reload/back
src/scripts/sheet.ts:73 - finder marks transition `width`/`height` (layout) on every hover; animate with `transform` only (e.g. position the four corners individually via translate)

## src/scripts/site.ts

src/scripts/site.ts:161 - Lenis handler intercepts every `a[href^="#"]` including the skip link (Base.astro:109) and "See the work", then `preventDefault()`s without moving focus. On desktop (fine pointer, ≥1080px, motion allowed) the skip link scrolls but the next Tab still lands in the header. After `lenis.scrollTo`, call `target.focus({ preventScroll: true })` (target needs `tabindex="-1"` if not focusable), or exclude `.skip-link`

## src/styles/global.css

src/styles/global.css:170 - `scroll-padding-top` only covers the header. The sticky gallery toolbar (ContactSheet.astro:105, ~64px below the header) and the fixed bottom `.mobile-bar` (Menu.astro:57, ≤1080px) can hide keyboard-focused elements. Add the toolbar height on gallery pages and `scroll-padding-bottom: calc(80px + env(safe-area-inset-bottom))` at ≤1080px
src/styles/global.css:246 - `.wrap` padding ignores `env(safe-area-inset-left/right)` despite `viewport-fit=cover`; in landscape on notched phones a 16-34px gutter puts header and hero text under the notch. Use `padding-inline: max(var(--gutter), env(safe-area-inset-left)) max(var(--gutter), env(safe-area-inset-right))`
src/styles/global.css:143 - `.mode-shift *` transitions `font-stretch` and `font-weight` on every element: each frame reflows the whole page for 700ms (fallback path when View Transitions aren't available)
src/styles/global.css:189 - no `touch-action: manipulation` on buttons, links, or labels; rapid taps (lightbox close, carousel next, chips) can trigger double-tap zoom on iOS
src/styles/global.css:300 - "develop" transition animates `filter: blur()` on every lazy image (up to 82 per gallery); not compositor-only. Consider opacity-only, or a shorter blur on the LQIP layer

## src/styles/lightbox.css

src/styles/lightbox.css:15 - full-bleed dialog pads top/bottom for safe areas but not left/right; in landscape the close button (15) and prev/next (30-31) can sit under the notch. Use `max(…, env(safe-area-inset-left/right))`

## Top fixes

1. src/scripts/site.ts:161 - smooth-scroll handler breaks the skip link and in-page anchors for desktop keyboard users (focus never moves)
2. src/components/Header.astro:21 / src/components/Menu.astro:31 - Menu trigger is a link to a closed `<dialog>`: dead without JS on mobile, and the wrong semantics with JS
3. src/components/Menu.astro:66 - invisible thumb bar stays focusable and in the a11y tree
4. src/pages/inquire.astro:215 - inquiry can be submitted twice (Enter while sending); no in-flight guard or spinner
5. src/styles/global.css:170 - sticky gallery toolbar and fixed mobile bar can cover the focused element
6. src/components/KindWords.astro:16,20 - carousel pause toggle reads contradictory state; manual slide changes never announced
7. src/scripts/sheet.ts:42 - Sports filter state not in the URL (can't share, lost on reload/back)
8. src/scripts/lightbox.ts:247,186 - no keyboard zoom/pan; Back gesture leaves the page instead of closing the viewer
9. src/pages/inquire.astro:197,160 - blur-time errors not announced; no unsaved-changes warning
10. Frontmatter strings rendered without `smart()` (about, index, inquire, thanks, StoryBlock, TwoWorlds): straight apostrophes, "..." and "Hawai'i" ship as-is
