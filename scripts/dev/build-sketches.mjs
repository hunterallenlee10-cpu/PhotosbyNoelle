// Generates the Checkpoint 1 hero sketches (static HTML) into research/checkpoint-1/.
import fs from 'node:fs';

const D = 'research/checkpoint-1';
const wm = fs.readFileSync('src/assets/brand/wordmark.svg', 'utf8').replace(/<title id="t">/, '<title id="t-$RAND">').replace('aria-labelledby="t"', 'aria-hidden="true"');
const meta = JSON.parse(fs.readFileSync(`${D}/img/meta.json`, 'utf8'));
const exif = (k) => {
  const e = meta[k].exif;
  if (!e || !e.Model) return '';
  return `${e.Model.replace('Canon ', '')} &nbsp; ${e.FocalLength}mm &nbsp; f/${e.FNumber} &nbsp; 1/${Math.round(1 / e.ExposureTime)} &nbsp; ISO ${e.ISO}`;
};
const t = (tz) => new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(new Date());
const HNL = t('Pacific/Honolulu');
const FXBG = t('America/New_York');

const page = (title, mode, body, extraCss = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title}</title><link rel="stylesheet" href="sketch.css"><style>${extraCss}</style></head><body data-mode="${mode}">${body}</body></html>`;

const header = (mode, opts = {}) => `<header class="bar" ${opts.style ? `style="${opts.style}"` : ''}>
  <a class="wm" href="#" aria-label="Photos by Noelle">${wm}</a>
  <nav class="desk-only"><a href="#">Sports</a><a href="#">Lifestyle</a><a href="#">About</a><a href="#">Kind Words</a></nav>
  <span class="toggle desk-only"><span class="${mode === 'gameday' ? 'on' : ''}">Game Day</span><span class="${mode === 'goldenhour' ? 'on' : ''}">Golden Hour</span></span>
  <a class="btn btn-primary desk-only" href="#">Inquire</a>
</header>`;
const mbar = `<div class="mbar"><a class="btn btn-primary" href="#">Inquire</a><a class="btn menu" href="#" aria-label="Menu">Menu</a></div>`;

// ---------- H1: Freeze Frame ----------
const h1 = page('H1 Freeze Frame', 'gameday', `
${header('gameday')}
<main class="h1">
  <figure class="photo"><img src="img/s080.jpg" alt=""><span class="crop tl"></span><span class="crop tr"></span><span class="crop bl"></span><span class="crop br"></span>
    <div class="counter desk-only"><span class="num big">080</span><span class="num of">/ 137</span><span class="burst"><i></i><i></i><i></i><i></i><i></i><i class="on"></i></span></div>
  </figure>
  <div class="copy">
    <h1 class="display">Noelle<br>Lanham</h1>
    <p class="sub">Sports and lifestyle photographer. Honolulu, HI and Fredericksburg, VA.</p>
    <p class="ctas desk-only"><a class="btn btn-primary" href="#">Inquire</a><a class="btn btn-ghost" href="#">See the work</a></p>
    <p class="exif num">${exif('s080')}</p>
  </div>
</main>${mbar}`, `
.h1 { position: relative; min-height: 100dvh; }
.bar { background: linear-gradient(180deg, rgb(11 17 29 / .78), rgb(11 17 29 / 0)); }
.h1 .photo { position: absolute; inset: 0; }
.h1 .photo img { width: 100%; height: 100%; object-fit: cover; object-position: 62% 30%; }
.h1 .photo::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgb(11 17 29 / .86) 0%, rgb(11 17 29 / .55) 30%, transparent 55%); }
.h1 .crop { --crop: rgb(238 242 246 / .9); margin: 88px 32px 32px; width: 40px; height: 40px; z-index: 2; }
.h1 .counter { position: absolute; z-index: 3; right: 56px; top: 104px; text-align: right; color: #eef2f6; background: rgb(11 17 29 / .74); padding: 14px 16px 12px; }
.h1 .counter .big { font-size: 4.5rem; line-height: .8; display: block; letter-spacing: -0.02em; }
.h1 .counter .of { font-size: 1.1rem; color: #c9d2de; }
.h1 .burst { display: flex; gap: 4px; justify-content: flex-end; margin-top: 12px; }
.h1 .burst i { width: 14px; height: 4px; background: rgb(238 242 246 / .35); }
.h1 .burst i.on { background: var(--accent); }
.h1 .copy { position: relative; z-index: 3; min-height: 100dvh; display: flex; flex-direction: column; justify-content: flex-end; padding: 0 64px 64px; max-width: 760px; }
.h1 h1 { font-size: clamp(5rem, 11vw, 10rem); }
.h1 .sub { font-size: 1.2rem; margin-top: 20px; max-width: 30ch; color: #dfe5ec; }
.h1 .ctas { display: flex; gap: 12px; margin-top: 28px; }
.h1 .exif { margin-top: 36px; font-size: .78rem; letter-spacing: .06em; color: #b9c3d0; font-weight: 600; }
@media (max-width: 700px) {
  .h1 .photo { position: relative; height: 64dvh; }
  .h1 .photo::after { background: linear-gradient(0deg, var(--bg) 0%, transparent 28%); }
  .h1 .photo img { object-position: 74% 28%; }
  .h1 .crop { margin: 72px 16px 16px; width: 26px; height: 26px; }
  .h1 .copy { min-height: 0; padding: 0 16px 120px; margin-top: -64px; }
  .h1 h1 { font-size: 23vw; }
  .h1 .sub { font-size: 1.05rem; margin-top: 14px; }
  .h1 .exif { margin-top: 18px; font-size: .7rem; }
}`);

// ---------- H2: Two Shores ----------
const h2 = page('H2 Two Shores', 'gameday', `
${header('gameday', { style: 'color:#eef2f6' })}
<main class="h2">
  <a class="half gd" data-mode="gameday" href="#">
    <img src="img/s013.jpg" alt="">
    <span class="label"><span class="display word">Game Day</span><span class="what">Sports</span></span>
  </a>
  <a class="half gh" data-mode="goldenhour" href="#">
    <img src="img/l025.jpg" alt="">
    <span class="label"><span class="display word">Golden Hour</span><span class="what">Lifestyle</span></span>
  </a>
  <div class="seam">
    <h1 class="name"><span class="display a">Noelle</span><span class="display b">Lanham</span></h1>
    <p class="clocks num"><span>Honolulu ${HNL}</span><span>Fredericksburg ${FXBG}</span></p>
  </div>
</main>${mbar}`, `
.bar { background: #0b111d; }
.h2 { padding-top: 72px; display: grid; grid-template-columns: 1fr 1fr; min-height: 100dvh; position: relative; }
.h2 .half { position: relative; overflow: hidden; color: var(--fg); background: var(--bg); text-decoration: none; display: block; }
.h2 .half img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.h2 .gd img { object-position: 30% 30%; }
.h2 .gh img { object-position: 50% 40%; }
.h2 .half::after { content: ''; position: absolute; inset: 0; }
.h2 .gd::after { background: linear-gradient(0deg, rgb(11 17 29 / .85), transparent 40%); }
.h2 .gh::after { background: linear-gradient(0deg, rgb(247 220 176 / .92), transparent 40%); }
.h2 .label { position: absolute; z-index: 2; left: 40px; right: 40px; bottom: 40px; display: flex; justify-content: space-between; align-items: end; }
.h2 .word { font-size: clamp(2.4rem, 4.2vw, 4rem); }
.h2 .what { font-weight: 700; text-transform: uppercase; letter-spacing: .08em; font-size: .85rem; }
.h2 .seam { position: absolute; z-index: 3; left: 50%; top: 50%; transform: translate(-50%, -62%); text-align: center; pointer-events: none; }
.h2 .name { display: flex; align-items: baseline; gap: 0; font-size: clamp(4rem, 9vw, 8.4rem); }
.h2 .name .a { font-stretch: 54%; font-weight: 900; color: #eef2f6; padding-right: .12em; }
.h2 .name .b { font-stretch: 128%; font-weight: 640; font-style: italic; color: #073b45; background: #f7dcb0; padding: .06em .14em .02em; }
.h2 .name .a { background: #0b111d; padding: .06em .14em .02em; }
.h2 .clocks { margin-top: 18px; display: flex; gap: 0; justify-content: center; font-size: .9rem; }
.h2 .clocks span { padding: 8px 14px; }
.h2 .clocks span:first-child { background: #0b111d; color: #eef2f6; }
.h2 .clocks span:last-child { background: #f7dcb0; color: #073b45; }
@media (max-width: 700px) {
  .h2 { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; }
  .h2 .label { left: 16px; right: 16px; top: 14px; bottom: auto; }
  .h2 .gd::after { background: linear-gradient(180deg, rgb(11 17 29 / .8), transparent 35%); }
  .h2 .gh::after { background: linear-gradient(180deg, rgb(247 220 176 / .9), transparent 35%); }
  .h2 .word { font-size: 2.2rem; }
  .h2 .seam { top: 50%; transform: translate(-50%, -50%); width: 100%; }
  .h2 .name { justify-content: center; font-size: 11.5vw; }
  .h2 { padding-top: 60px; }
  .h2 .clocks { font-size: .78rem; margin-top: 8px; }
}`);

// ---------- H3: Contact Sheet ----------
const frames = ['s002', 'l005', 's051', 'l018', 's012', 'l022', 's027', 'l040', 's007'];
const pick = 3;
const GREASE = `<svg class="grease" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M4 9 C 30 3, 70 5, 96 8 C 98 40, 97 70, 95 93 C 70 97, 30 96, 6 94 C 3 70, 2 40, 5 7" fill="none" stroke="#ff8a6b" stroke-width="2.4" vector-effect="non-scaling-stroke" stroke-linecap="round"/></svg>`;
const h3 = page('H3 Contact Sheet', 'goldenhour', `
${header('goldenhour')}
<main class="h3">
  <div class="copy">
    <h1 class="display">Life through my lens.</h1>
    <p class="aside">haha, get it?</p>
    <p class="sub">Sports and lifestyle photographer in Honolulu, HI and Fredericksburg, VA. Bright, colorful, a little bit golden.</p>
    <p class="ctas"><a class="btn btn-primary" href="#">Inquire</a><a class="btn btn-ghost" href="#">See the work</a></p>
  </div>
  <div class="sheet">
    ${frames.map((f, i) => `<figure class="${i === pick ? 'pick' : ''}"><img src="img/${f}.jpg" alt=""><figcaption class="num">${String([2, 5, 51, 18, 12, 22, 27, 40, 7][i]).padStart(3, '0')}${i === pick ? ' <b>&#9733;</b>' : ''}</figcaption>${i === pick ? GREASE : ''}</figure>`).join('')}
  </div>
</main>${mbar}`, `
.h3 { min-height: 100dvh; display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: 56px; align-items: center; padding: 104px 56px 48px; }
.h3 h1 { font-size: clamp(3.4rem, 6.4vw, 6rem); line-height: .9; text-transform: none; }
.h3 .aside { font-family: 'Anybody'; font-style: italic; font-stretch: 110%; font-weight: 500; color: var(--accent-text); font-size: 1.3rem; margin-top: 10px; transform: rotate(-3deg); transform-origin: left; }
.h3 .sub { margin-top: 26px; font-size: 1.15rem; max-width: 34ch; color: var(--fg-2); }
.h3 .ctas { display: flex; gap: 12px; margin-top: 30px; }
.h3 .sheet { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px 12px; background: #073b45; padding: 18px 18px 8px; }
.h3 figure { position: relative; }
.h3 figure img { aspect-ratio: 3 / 2; object-fit: cover; width: 100%; filter: saturate(.9); }
.h3 figcaption { color: #f7dcb0; font-size: .72rem; padding: 4px 0 4px; letter-spacing: .08em; }
.h3 figcaption b { color: #ff8a6b; }
.h3 .pick { z-index: 2; transform: scale(1.5) rotate(-1.5deg); transform-origin: 70% 30%; box-shadow: 0 18px 40px -12px rgb(7 59 69 / .55); background: #073b45; padding: 6px 6px 0; }
.h3 .pick img { filter: none; }
.h3 .grease { position: absolute; z-index: 3; inset: -10px -12px -8px -10px; width: calc(100% + 22px); height: calc(100% + 18px); transform: rotate(2.5deg); pointer-events: none; }
@media (max-width: 700px) {
  .h3 { grid-template-columns: 1fr; padding: 84px 16px 120px; gap: 32px; align-content: start; }
  .h3 h1 { font-size: 15vw; }
  .h3 .sheet { margin: 0 -16px; padding: 12px; grid-template-columns: repeat(3, 1fr); }
  .h3 .pick { transform: scale(1.35) rotate(-1.5deg); transform-origin: 30% 40%; }
  .h3 .ctas { display: none; }
}`);

// ---------- H4: Scoreboard ----------
const h4 = page('H4 Scoreboard', 'gameday', `
${header('gameday')}
<main class="h4">
  <div class="board">
    <div class="cell"><span class="lbl">Honolulu, HI</span><span class="num t">${HNL.replace(/ ?[AP]M/, '')}<small>${HNL.slice(-2)}</small></span></div>
    <h1 class="display mid">Noelle Lanham</h1>
    <div class="cell r"><span class="lbl">Fredericksburg, VA</span><span class="num t">${FXBG.replace(/ ?[AP]M/, '')}<small>${FXBG.slice(-2)}</small></span></div>
  </div>
  <figure class="wide"><img src="img/s002.jpg" alt=""><span class="crop tl"></span><span class="crop tr"></span><span class="crop bl"></span><span class="crop br"></span>
    <figcaption><span>Sports and lifestyle photographer. Bright, colorful, frozen at 1/4000.</span><a class="btn btn-primary" href="#">Inquire</a></figcaption>
  </figure>
</main>${mbar}`, `
.h4 { min-height: 100dvh; padding: 88px 32px 32px; display: grid; grid-template-rows: auto 1fr; gap: 18px; }
.h4 .board { display: grid; grid-template-columns: 1fr auto 1fr; align-items: end; gap: 24px; border-top: 2px solid var(--line); border-bottom: 2px solid var(--line); padding: 14px 4px; }
.h4 .cell { display: flex; flex-direction: column; }
.h4 .cell.r { align-items: flex-end; }
.h4 .lbl { font-weight: 700; text-transform: uppercase; letter-spacing: .08em; font-size: .78rem; color: var(--fg-2); }
.h4 .t { font-size: clamp(3rem, 6vw, 5.6rem); line-height: .85; color: var(--accent); font-stretch: 60%; font-weight: 800; }
.h4 .t small { font-size: .3em; margin-left: .2em; color: var(--fg-2); }
.h4 .mid { font-size: clamp(3.6rem, 8.4vw, 7.6rem); text-align: center; }
.h4 .wide { position: relative; overflow: hidden; min-height: 0; }
.h4 .wide img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 55%; }
.h4 .crop { margin: 16px; width: 34px; height: 34px; --crop: #eef2f6; }
.h4 figcaption { position: absolute; left: 0; right: 0; bottom: 0; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(0deg, rgb(11 17 29 / .8), transparent); font-size: 1.1rem; }
@media (max-width: 700px) {
  .h4 { padding: 72px 16px 110px; }
  .h4 .board { grid-template-columns: 1fr 1fr; }
  .h4 .mid { grid-column: 1 / -1; grid-row: 1; font-size: 17vw; text-align: left; }
  .h4 .t { font-size: 13vw; }
  .h4 .wide { aspect-ratio: 4 / 5; }
  .h4 figcaption .btn { display: none; }
  .h4 figcaption { padding: 16px; font-size: 1rem; }
}`);

fs.writeFileSync(`${D}/h1-freeze-frame.html`, h1);
fs.writeFileSync(`${D}/h2-two-shores.html`, h2);
fs.writeFileSync(`${D}/h3-contact-sheet.html`, h3);
fs.writeFileSync(`${D}/h4-scoreboard.html`, h4);
console.log('sketches written', HNL, FXBG);
