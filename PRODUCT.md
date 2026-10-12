# Product

<!-- impeccable:product-schema 1 -->

> Source: the build brief from Hunter Lee (Lee Systems Co.) plus a live scrape of
> https://noellelanham.mypixieset.com/ on 2026-10-12. No separate interview was run;
> the brief told the builder to work autonomously until STOP Checkpoint 1, where these
> facts are confirmed. Items marked _(open)_ are unknown and must not be invented.

## Platform

web

## Stack

Astro (static output, TypeScript strict, Astro image pipeline, content collections), GSAP
(ScrollTrigger, Flip, SplitText), Lenis on desktop only, at most one lazy WebGL moment.
Vercel deploy with one serverless function for inquiries (Resend, Formspree fallback).
Pinned by the brief. Every dependency is pinned to an exact version at least 14 days old.

## Users

- **Athletes and sports parents** who find Noelle on Instagram, on their phones, often right
  after a game. They want to see that she shoots their sport well and how to book her.
- **Teams, coaches, and athletic programs** (high school, college, minor league) evaluating
  her for ongoing coverage.
- **Portrait and lifestyle clients** (seniors, graduates, couples) in Oahu and Virginia who want
  bright, joyful, candid photos.

Mobile is the primary device.

## Product Purpose

A portfolio and inquiry site for **Photos by Noelle** (Noelle Lanham), a professional sports
and lifestyle photographer based in Honolulu, HI and Fredericksburg, VA. It replaces a stock
Pixieset template. Success: her work looks as good as it is, the site feels like her, and
visitors send booked inquiries.

## Positioning

Two worlds through one lens: high-intensity sports (minor league, college, high school) and
joyful lifestyle portraits, shot by the same bright, colorful eye, split across two homes,
Honolulu and Fredericksburg. Her credibility comes from real game access (Fredericksburg
Nationals stadium, Randolph-Macon College Athletics) and verbatim praise from coaches,
managers, scouts, and athletes.

## Operating Context

- Visitors arrive from Instagram (@noelle.lanham) on phones.
- Client galleries are delivered through Pixieset _(open: confirm she keeps Pixieset for delivery)_.
- Inquiries go to her by email _(open: her address)_.

## Capabilities and Constraints

- Pages: Home, Sports, Lifestyle, About ("Get to Know Me"), Kind Words, Inquire, 404.
- Inquiry form with client and server validation, honeypot, rate limit.
- Preview stays noindex until `PUBLIC_LAUNCH=true`.
- Fully usable with JavaScript disabled; every animation has a reduced-motion fallback.
- _(open)_ contact email, phone, pricing/packages, service area beyond the two cities, booking
  calendar, logo approval, years-of-experience wording.

## Brand Commitments

- Name: Photos by Noelle. Photographer: Noelle Lanham.
- Voice: bright, warm, playful, a little punny ("life through my lens...haha, get it?"). Short
  sentences. Warm and sincere about faith, never preachy.
- Faith is public on her site: gallery openers are 1 Corinthians 9:24 (sports, KJV) and
  Psalm 118:24 (lifestyle, KJV). Keep both.
- Editing style: bright and colorful. Sports = intense gameplay, raw emotion, frozen action.
  Portraits = genuine smiles, heartwarming frames.
- No existing logo; a wordmark is designed for approval.
- Do not use Lee Enterprises / LEU brand material. This is Noelle's brand.

## Evidence on Hand

- 82 sports frames, 55 lifestyle frames, 69 personal About photos, 8 testimonial photos, all
  her own, scraped at 2500px from her Pixieset site. 175 of 215 carry real EXIF.
- Captions for notable frames: Dylan Crews (debut, dugout), Joey Gallo (home run at FredNats
  stadium), Elijah Green (Low-A home run celebration, BP), Maddie Anderson (VHSL field hockey
  state championship).
- 8 testimonials, verbatim, each paired with a photo (Jake Lowery, Becky Larkin, Aidan Pinto,
  Jason Burton, Billy Fluharty, Bryan Diehr, Abby Lybarger, Jack Bowles).
- One About photo credits another photographer (RobinSkievaskiPhotography wedding party): About
  page only, with visible credit. Never in the portfolio.
- Absent and never to be fabricated: prices, packages, awards, client names beyond the
  testimonials, stats, year counts, email, phone, any extra testimonials.

## Product Principles

1. The photograph wins every tie. UI never covers a face, a ball, or the decisive moment.
2. Only true facts. Unknowns become visible `{{CONFIRM: ...}}` placeholders, not guesses.
3. Phone-first, Instagram-to-inquiry in as few taps as possible.
4. Personality through her own words and real details (Ruby, popcorn, one of 63 parks), not decoration.
5. Fast and calm: motion is optional, content is not.

## Accessibility & Inclusion

WCAG 2.2 AA. Full keyboard operation (nav, mode toggle, lightbox, form), visible focus,
reduced-motion parity, zero axe violations, works without JavaScript.
