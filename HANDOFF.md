# Handoff: Photos by Noelle

Branch: `claude/intelligent-pasteur-n6a1ks` on `hunterallenlee10-cpu/PhotosbyNoelle`.
Run instructions, photo/copy editing and launch steps are in `README.md`; scores are in
`qa/REPORT.md`.

## Deploy the preview (not done: blocked by permissions)

The Vercel connector in this session could see the **leu** team but got
`403 forbidden` creating a project there, and no Vercel CLI token was available. To
deploy:

1. vercel.com → **Add New… → Project** → import `hunterallenlee10-cpu/PhotosbyNoelle`.
2. Framework preset **Astro** (auto-detected). Leave build/output settings at their defaults. Node 22.x or newer.
3. Production Branch: `claude/intelligent-pasteur-n6a1ks` (or merge it into `main` first).
4. No environment variables are needed for a private preview. `PUBLIC_LAUNCH` defaults to off, so the site ships `noindex`.
5. The first build processes ~3,300 image variants: expect 10 to 20 minutes.
6. To test the inquiry form end to end, add `RESEND_API_KEY` + `INQUIRY_TO_EMAIL` (or
   `FORMSPREE_ENDPOINT`) and redeploy. Until then the form validates but can't deliver.

## `{{CONFIRM}}` placeholders (resolve before launch)

These show as red tags on the preview and disappear at launch:

1. **Inquiry email address**: set `INQUIRY_TO_EMAIL`. Also decide the sender domain for `INQUIRY_FROM_EMAIL`.
2. **Experience wording**: her home page says "four years of experience", but her About page says she went pro in March 2023. The site says "shooting since 2023". (`src/content/settings.json` → `since`)
3. **Logo approval**: the PHOTOS BY NOELLE wordmark and N mark are new. (`src/assets/brand/`)
4. **Client Galleries link**: assumed she keeps Pixieset for delivery; it links to `https://noellelanham.mypixieset.com/`. Confirm, or replace with the real client-gallery URL. (`settings.json` → `clientGalleries`)
5. **Is this Ruby?**: a brown dog photo from her About page sits on the Ruby fun-fact card. (`src/content/pages/about.md`)

Unknown and simply left off the site (nothing invented):
- Phone number.
- Pricing and packages.
- Service area beyond Oahu and Fredericksburg, VA.
- Booking calendar.

## Photos: what's in, what's out

**In (212):**
- All 82 sports frames and all 55 lifestyle frames from her galleries, in her order.
- All 8 testimonial photos.
- Her portrait.
- 66 of the 69 personal photos from her About page, in a "Camera roll" gallery.
- The Robin Skievaski wedding-party photo appears on the About page only, with a visible credit.

**Hidden (3, still in the repo, `"hidden": true` in `photos.json`):**
- `a024`: a birthday banner showing other people's names, plus a beer bottle.
- `a043`: the same banner with other people's names.
- `a056`: a group photo that includes a young child.

**Not imported:**
- The two "Sports" / "Lifestyle" tiles on her Portfolio page: they're graphics with text baked into the photo.
- Her Instagram feed images: embedded from Instagram, not part of her galleries.

**Worth asking her about (published on her current site, so kept):**
- `a013`: a collage of someone else's military graduation.
- `a058`: her baptism photo, used on the About "Faith" chapter.
- `a063`: someone else's engagement.
- `a028`: a beer-branded cap on the dog.
- `a048`: a restaurant employee is in the frame.

All alt text describes only what's visible. People are named only where her own captions
name them (Dylan Crews, Joey Gallo, Elijah Green, Maddie Anderson) or, for Noelle, where
she's clearly the person in her portrait.

## The 3 decisions I'm least sure about

1. **Mobile LCP vs. photo quality.** Lighthouse mobile LCP is 2.8 to 3.1 s against the 2.0 s target. Getting there would mean a visibly softer hero photo. I kept the quality. Real-user data after launch should settle it.
2. **Home defaults to the visitor's system setting** (light → Golden Hour, dark → Game Day), and the switch persists site-wide. That includes overriding the Sports/Lifestyle defaults once someone picks. That's how I read "toggle persists". The alternative is per-page defaults that always win.
3. **Publishing all of her About photos.** You asked for all of her real photos, so the About page has a 66-photo camera roll. It's charming, but it's a lot of other people's faces. Trimming it to her 15 to 20 favorites might be kinder to her friends and faster to scroll.

## 3 optional upgrades

1. **Game Recap template**: a per-game story page (date, opponent, venue, 10 to 20 frames, one caption) she can add by dropping photos in a folder. It would give coaches and parents a shareable link the day after a game.
2. **Instagram feed strip**: her latest 6 posts via the Instagram Basic Display API or a cached build-time fetch, without a third-party widget.
3. **Booking calendar**: a Cal.com embed on the Inquire page for portrait sessions, once she has packages and availability she wants to publish.

## Definition of done

- ✅ Zero invented facts; all placeholders listed (above)
- ✅ All 8 testimonials verbatim (scraped, only straight quotes made typographic) and paired with the photo beside each on her site
- ✅ Every image optimized (AVIF/WebP/JPEG, responsive widths), sized (width/height, CLS ≤ 0.006), alt-texted
- ✅ Concept visible on every page; signature interactions (burst hero, contact sheet + Flip lightbox, viewfinder marks, lighting switch, scripture reveal) work, with reduced-motion and no-JS fallbacks
- ❌ Inquiry form delivers, tested end to end: validation, honeypot and rate limit are tested. Real email delivery needs Noelle's email + a Resend key, and the Vercel deploy is blocked (above)
- ❌ Performance / accessibility / SEO bars: all met except mobile LCP (2.8 to 3.1 s vs < 2.0 s). Mobile perf 93 to 99, desktop 99 to 100, A11y/BP/SEO 100, axe 0
- ✅ Screenshots reviewed at all 7 widths, both lighting states (`qa/montage/`)
- ✅ noindex on; launch flag documented and verified (robots, meta, sitemap)
- ✅ README complete
