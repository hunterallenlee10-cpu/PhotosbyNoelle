# Design: Photos by Noelle

Concept: **Two Shores, One Lens.** Two lighting states, one camera vocabulary. The photo
wins every tie: UI never covers a face, a ball, or the decisive moment.

## Lighting states (tokens in `src/styles/global.css`)

| Token | Game Day (stadium night) | Golden Hour (sunlit sand) |
|---|---|---|
| `--bg` | `#0b111d` stadium ink | `#f7dcb0` sunlit sand |
| `--bg-2` | `#141c2c` | `#fbe8c9` |
| `--fg` | `#eef2f6` floodlight (16.8:1) | `#073b45` deep ocean teal (9.2:1) |
| `--fg-2` | `#9fabbd` (8.1:1) | `#3d6068` (5.2:1) |
| `--accent` | `#ff4b3a` dugout red | `#c23a20` coral |
| `--accent-text` | `#ff6a5b` | `#a3301a` (5.3:1) |
| `--on-accent` | `#0b111d` | `#fff6e8` |
| `--sheet` / `--sheet-accent` | `#141c2c` / `#ff4b3a` | `#073b45` / `#ff9b7e` |

Source swatches: `research/palette.json` (node-vibrant over all 137 portfolio frames).
Sports → Game Day, Lifestyle → Golden Hour, other pages follow `prefers-color-scheme` until
the visitor uses the switch (stored as `pbn-mode`). Switching crossfades the page (View
Transitions, with a CSS fallback).

## Type

- **Anybody** (variable, width 50 to 150%, weight 100 to 900): display. Game Day: width 56%, weight 900, uppercase. Golden Hour: width 125%, weight 620, italic, sentence case, scaled to 0.66. Numerals (frame counters, clocks, EXIF): width 68%, weight 750, tabular.
- **Atkinson Hyperlegible Next** (variable): text, 17 px base, line-height 1.6.
- Display sizes: `--fs-d-s/m/l/xl`, fluid with `clamp()`, multiplied by `--d-scale`.

## Shape, space, motion

- Square corners everywhere (radius 0). Buttons are filled (`btn-primary`) or 1.5 px inset outline (`btn-ghost`), with a minimum height of 48 px (44 px for nav).
- **Framing system:** viewfinder crop marks (`CropMarks.astro`, `.crop-marks`), 2 px corners. Used on hero, portraits, story leads, hovered gallery frames.
- Gutter `clamp(16px, 4vw, 56px)`, max width 1520 px, section rhythm `--s-8` / `--s-9`.
- Easing: `--ease-out` cubic-bezier(.16, 1, .3, 1); `--ease-shutter` for flashes.
- Motion moments, each with a reduced-motion fallback that shows the same content at once:
  - burst hero (once per visit, < 2.5 s);
  - Flip morph into the lightbox;
  - scripture lines;
  - blur-to-sharp "develop" on photos;
  - shutter flash between pages and on form success;
  - viewfinder marks that snap to the hovered frame.

## Components

`BurstHero`, `TwoWorlds` (each half lit in its own state via `data-mode-local`),
`ContactSheet` (justified grid, frame numbers, sport filters, sticky counter, lightbox),
`StoryBlock`, `Scripture`, `KindWords`, `Photo` (AVIF/WebP/JPEG + LQIP + focal point),
`ModeToggle` (`role="switch"`), `Header` / `Menu` (bottom sheet + thumb bar) / `Footer`
(scoreboard clocks), `Confirm` (preview-only placeholder tag).
