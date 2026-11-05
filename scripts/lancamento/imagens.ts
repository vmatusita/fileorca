// pnpm lancamento:imagens: the images of the Product Hunt kit (prompt F5b, decision 8), written to
// docs/lancamento/product-hunt/ and listed, with their size, weight and caption, in docs/lancamento/product-hunt.md.
//  - thumbnail.png and thumbnail.gif, 240 × 240: the Oli on the deep sea, drawn from docs/design/ (the SVG of the pose, the
//    token colours) by resvg. The GIF's frames come from the Oli's own animations in src/styles/components.css (fo-hello
//    for wave, fo-cheer for cheer) with the durations and easings of docs/design/tokens.json, computed frame by frame, so
//    the same files come out on every run; gifenc (MIT) writes the GIF.
//  - gallery-1.png to gallery-5.png, 1270 × 760: real states of the site's dist/, served as Cloudflare serves it and
//    opened in Chromium with the cookie choice already made (no notice on screen), each framed on the deep sea with its
//    caption in the site's own fonts and tokens.
// Only the Oli's wave and cheer poses, only token colours (the yellow only on a Download button inside a screenshot), and
// nothing of Product Hunt's brand. The PNGs keep only their image chunks and the GIF only its frames and loop: nothing of
// the machine that made them. Not part of pnpm verificar: tests/unit/launch-kit.test.ts checks what this script wrote.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, expect, type Page } from '@playwright/test';
import { Resvg } from '@resvg/resvg-js';
import gifenc from 'gifenc';
import { stripPng } from '../../src/engine/image/strip.ts';
import { requireDist } from '../lib/dist.ts';
import { ORIGIN, serve } from '../guides/lib/browser.ts';

// gifenc ships CommonJS for Node: its functions come through the default export.
const { GIFEncoder, applyPalette, quantize } = gifenc;

export const OUT = 'docs/lancamento/product-hunt';
export const KIT = 'docs/lancamento/product-hunt.md';
const THUMB = 240;
const GALLERY = { width: 1270, height: 760 };

// ---- tokens ---------------------------------------------------------------------------------------------------------

interface TokenEntry {
  name: string;
  value: string | { light: string; dark: string };
}
const TOKENS = JSON.parse(readFileSync('docs/design/tokens.json', 'utf8')) as Record<string, { tokens?: TokenEntry[] }>;

function token(name: string, theme: 'light' | 'dark' = 'light'): string {
  for (const group of Object.values(TOKENS)) {
    const found = group.tokens?.find((entry) => entry.name === name);
    if (found) return typeof found.value === 'string' ? found.value : found.value[theme];
  }
  throw new Error(`no token ${name}`);
}

const ms = (value: string): number => Number.parseFloat(value);

/** A CSS cubic-bezier(x1, y1, x2, y2) as a function of the time fraction. */
function bezier(value: string): (t: number) => number {
  const [x1, y1, x2, y2] = (value.match(/-?\d*\.?\d+/g) ?? []).map(Number) as [number, number, number, number];
  const at = (a: number, b: number, t: number): number => 3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3;
  return (x: number) => {
    let low = 0;
    let high = 1;
    for (let i = 0; i < 40; i += 1) {
      const middle = (low + high) / 2;
      if (at(x1, x2, middle) < x) low = middle;
      else high = middle;
    }
    return at(y1, y2, (low + high) / 2);
  };
}

// ---- the Oli's keyframes, read from the site's CSS ------------------------------------------------------------------

interface Pose {
  ty: number;
  rotate: number;
  scale: number;
}
const REST: Pose = { ty: 0, rotate: 0, scale: 1 };

function poseOf(transform: string): Pose {
  if (transform.trim() === 'none') return REST;
  const number = (pattern: RegExp, fallback: number): number => Number.parseFloat(pattern.exec(transform)?.[1] ?? String(fallback));
  return { ty: number(/translateY\((-?[\d.]+)px\)/, 0), rotate: number(/rotate\((-?[\d.]+)deg\)/, 0), scale: number(/scale\((-?[\d.]+)\)/, 1) };
}

/** The stops of a @keyframes rule of src/styles/components.css, as fractions of the duration. A selector may list several
 *  stops ("0%, 100%", the greeting of the F13a that starts and ends on the drawn pose; DECISOES § 460). */
function keyframes(name: string): { at: number; pose: Pose }[] {
  const css = readFileSync('src/styles/components.css', 'utf8');
  const rule = new RegExp(`@keyframes ${name} \\{(.*?)\\}\\s*\\}`, 's').exec(css)?.[1];
  if (!rule) throw new Error(`no @keyframes ${name}`);
  const at = (stop: string): number => (stop === 'from' ? 0 : stop === 'to' ? 1 : Number.parseFloat(stop) / 100);
  return [...rule.matchAll(/((?:from|to|\d+%)(?:\s*,\s*(?:from|to|\d+%))*)\s*\{\s*transform:\s*([^;]+);/g)]
    .flatMap((match) => (match[1] as string).split(',').map((stop) => ({ at: at(stop.trim()), pose: poseOf(match[2] as string) })))
    .sort((a, b) => a.at - b.at);
}

/** The pose at fraction t of an animation, eased segment by segment as CSS does. */
function poseAt(stops: { at: number; pose: Pose }[], t: number, ease: (t: number) => number): Pose {
  const next = stops.findIndex((stop) => stop.at >= t);
  if (next <= 0) return (stops[0] as { pose: Pose }).pose;
  const a = stops[next - 1] as { at: number; pose: Pose };
  const b = stops[next] as { at: number; pose: Pose };
  const k = ease((t - a.at) / (b.at - a.at));
  const mix = (x: number, y: number): number => x + (y - x) * k;
  return { ty: mix(a.pose.ty, b.pose.ty), rotate: mix(a.pose.rotate, b.pose.rotate), scale: mix(a.pose.scale, b.pose.scale) };
}

// ---- the thumbnail and the GIF --------------------------------------------------------------------------------------

/** The Oli at its largest on the site (the drop zone from 768 px): the keyframes' pixels are pixels of that size. */
const SITE_OLI = 112;
const OLI = 176;

function oliSvg(pose: 'wave' | 'cheer', motion: Pose): string {
  const raw = readFileSync(`docs/design/assets/Oli/oli-${pose}.svg`, 'utf8').trim();
  const inner = raw.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const x = (THUMB - OLI) / 2;
  const y = 30;
  const cx = x + OLI / 2;
  const cy = y + OLI / 2;
  const k = OLI / SITE_OLI;
  const transform = `translate(0 ${(motion.ty * k).toFixed(2)}) rotate(${motion.rotate.toFixed(2)} ${cx} ${cy}) translate(${cx} ${cy}) scale(${motion.scale.toFixed(4)}) translate(${-cx} ${-cy})`;
  return `<g transform="${transform}"><svg x="${x}" y="${y}" width="${OLI}" height="${OLI}" viewBox="0 0 128 128" overflow="visible">${inner}</svg></g>`;
}

function thumbnailSvg(pose: 'wave' | 'cheer', motion: Pose): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${THUMB}" height="${THUMB}" viewBox="0 0 ${THUMB} ${THUMB}">`
    + `<rect width="${THUMB}" height="${THUMB}" fill="${token('deep')}"/>`
    + `<circle cx="${THUMB / 2}" cy="${THUMB / 2 + 12}" r="${THUMB / 2 - 22}" fill="${token('water', 'dark')}"/>`
    + `${oliSvg(pose, motion)}</svg>`;
}

function render(svg: string): { png: Buffer; rgba: Uint8Array } {
  const image = new Resvg(svg, { fitTo: { mode: 'width', value: THUMB }, font: { loadSystemFonts: false } }).render();
  return { png: image.asPng(), rgba: new Uint8Array(image.pixels) };
}

function thumbnailGif(): Uint8Array {
  // F13a (DECISOES § 460): the wave greets once (fo-hello, 3 s, back on the drawn pose); the float that looped is gone.
  const helloStops = keyframes('fo-hello');
  const cheerStops = keyframes('fo-cheer');
  const helloEase = bezier(token('ease-in-out'));
  const cheerEase = bezier(token('ease-spring'));
  const helloMs = ms(token('dur-float'));
  const cheerMs = ms(token('dur-cheer'));
  const frames: { rgba: Uint8Array; delay: number }[] = [];
  // Wave, the greeting once, a frame every 150 ms.
  const step = 150;
  for (let time = 0; time < helloMs; time += step) {
    frames.push({ rgba: render(thumbnailSvg('wave', poseAt(helloStops, time / helloMs, helloEase))).rgba, delay: step });
  }
  // Cheer: the jump of the result card, a frame every 50 ms, then a rest on the last pose.
  const jump = 50;
  for (let time = 0; time <= cheerMs; time += jump) frames.push({ rgba: render(thumbnailSvg('cheer', poseAt(cheerStops, time / cheerMs, cheerEase))).rgba, delay: jump });
  frames.push({ rgba: render(thumbnailSvg('cheer', REST)).rgba, delay: 1200 });
  // One palette for every frame, so the colours do not flicker from frame to frame.
  const all = new Uint8Array(frames.reduce((sum, frame) => sum + frame.rgba.length, 0));
  let at = 0;
  for (const frame of frames) {
    all.set(frame.rgba, at);
    at += frame.rgba.length;
  }
  const palette = quantize(all, 256);
  const gif = GIFEncoder();
  for (const [index, frame] of frames.entries()) {
    gif.writeFrame(applyPalette(frame.rgba, palette), THUMB, THUMB, index === 0 ? { palette, delay: frame.delay, repeat: 0 } : { delay: frame.delay });
  }
  gif.finish();
  return gif.bytes();
}

// ---- the gallery ------------------------------------------------------------------------------------------------------

interface Shot {
  file: string;
  caption: string;
  alt: string;
  take: (page: Page) => Promise<Buffer>;
}

const fixture = (dir: 'images' | 'pdf', name: string): string => `fixtures/${dir}/${name}`;

async function open(page: Page, path: string): Promise<void> {
  const response = await page.goto(`${ORIGIN}${path}`);
  if (response?.status() !== 200) throw new Error(`${path}: ${response?.status()}`);
  await page.evaluate(() => document.fonts.ready);
  if ((await page.locator('#fo-tool-root').count()) > 0) await page.locator('#fo-tool-root[data-hydrated="true"]').waitFor({ state: 'attached' });
}

/** Lets the finite animations end, so the shot shows the final frame. */
async function still(page: Page): Promise<void> {
  await page.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined))));
}

const SHOTS: Shot[] = [
  {
    file: 'gallery-1.png',
    caption: 'Image, PDF and money tools that run in your browser',
    alt: 'The FileOrca home page: the heading and the cards of the image tools.',
    take: async (page) => {
      await open(page, '/');
      return page.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 800 } });
    },
  },
  {
    file: 'gallery-2.png',
    caption: 'HEIC to JPG: iPhone photos as JPGs, without uploading them',
    alt: 'HEIC to JPG with two iPhone photos converted: the result card, its Download button and the list of files.',
    take: async (page) => {
      await open(page, '/heic-to-jpg/');
      await page.setInputFiles('#fo-tool-root input[type="file"]', [fixture('images', 'heic-06-iphone7-paisagem-gps.heic'), fixture('images', 'heic-04-iphone11promax-retrato-livephoto-gps.heic')]);
      await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 120_000 });
      await still(page);
      return page.locator('#fo-tool-root').screenshot();
    },
  },
  {
    file: 'gallery-3.png',
    caption: 'Compress PDF: a PDF of photos made much lighter',
    alt: 'Compress PDF with a PDF of photos: the result card with the size before and after, and its Download button.',
    take: async (page) => {
      await open(page, '/compress-pdf/');
      await page.setInputFiles('#fo-tool-root input[type="file"]', [fixture('pdf', 'gen-fotos.pdf')]);
      await expect(page.locator('#fo-tool-root .fo-btn--download')).toBeVisible({ timeout: 120_000 });
      await still(page);
      return page.locator('#fo-tool-root').screenshot();
    },
  },
  {
    file: 'gallery-4.png',
    caption: 'File guides with numbers measured on our test files',
    alt: 'The guide "Why is my PDF so large?": its table of what takes the space in each test PDF, in pictures, fonts and everything else.',
    take: async (page) => {
      await open(page, '/guides/why-is-my-pdf-so-large/');
      // The table scrolls inside its frame on the page (DECISOES § 129); for the picture the frame shows all of it.
      await page.addStyleTag({ content: '.fo-table-wrap { width: auto !important; overflow: visible !important; }' });
      return page.locator('[data-content="measured"] .fo-table-wrap table').first().screenshot();
    },
  },
  {
    file: 'gallery-5.png',
    caption: 'Money calculators that keep your numbers on your device',
    alt: 'The mortgage calculator with its example filled in: the fields and the monthly payment.',
    take: async (page) => {
      await open(page, '/mortgage-calculator/');
      await still(page);
      return page.locator('#fo-tool-root').screenshot();
    },
  },
];

function frameHtml(css: string, logo: string, caption: string, shot: Buffer): string {
  const image = `data:image/png;base64,${shot.toString('base64')}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="${css}">
<style>
  html, body { margin: 0; background: var(--deep); }
  .kit { width: ${GALLERY.width}px; height: ${GALLERY.height}px; box-sizing: border-box; padding: 40px 48px 48px; display: flex; flex-direction: column; gap: 28px; }
  .kit__head { display: flex; align-items: center; justify-content: space-between; gap: 32px; }
  .kit__caption { margin: 0; font-family: var(--font-display); font-weight: 600; font-size: 42px; line-height: 1.12; color: var(--on-deep); max-width: 920px; }
  .kit__logo { height: 44px; flex: none; }
  .kit__shot { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; }
  .kit__shot img { max-width: 100%; max-height: 100%; border-radius: var(--radius-lg); border: 2px solid var(--stroke); background: var(--bg); }
</style></head><body><div class="kit"><div class="kit__head"><p class="kit__caption">${caption}</p><img class="kit__logo" alt="" src="${logo}"></div><div class="kit__shot"><img alt="" src="${image}"></div></div></body></html>`;
}

// ---- the files and the table of the kit -------------------------------------------------------------------------------

interface Written {
  file: string;
  use: string;
  width: number;
  height: number;
  bytes: number;
  alt: string;
}

function tableOf(rows: Written[]): string {
  const weight = (bytes: number): string => `${bytes.toLocaleString('pt-BR')} bytes`;
  return [
    '| Arquivo | Uso | Tamanho | Peso | Legenda (texto alternativo) |',
    '| --- | --- | --- | --- | --- |',
    ...rows.map((row) => `| \`${row.file}\` | ${row.use} | ${row.width} × ${row.height} | ${weight(row.bytes)} | ${row.alt} |`),
  ].join('\n');
}

async function main(): Promise<void> {
  requireDist();
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  const written: Written[] = [];

  const thumbnail = stripPng(new Uint8Array(render(thumbnailSvg('wave', REST)).png));
  writeFileSync(join(OUT, 'thumbnail.png'), thumbnail);
  written.push({ file: 'thumbnail.png', use: 'Miniatura (estática)', width: THUMB, height: THUMB, bytes: thumbnail.length, alt: 'The Oli, the FileOrca orca, waving on a round patch of sea.' });
  const gif = thumbnailGif();
  writeFileSync(join(OUT, 'thumbnail.gif'), gif);
  written.push({ file: 'thumbnail.gif', use: 'Miniatura (animada)', width: THUMB, height: THUMB, bytes: gif.length, alt: 'The Oli floating and waving, then jumping in a cheer, on a round patch of sea.' });

  const stop = await serve();
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'reduce' });
    await context.route(/google|googletagmanager|google-analytics|doubleclick|gstatic|googlesyndication/, (route) => route.abort());
    await context.addInitScript(() => localStorage.setItem('fo-consent', 'denied'));
    const page = await context.newPage();
    const css = `/_astro/${readdirSync('dist/_astro').find((name) => name.endsWith('.css')) ?? ''}`;
    const logo = `data:image/svg+xml;base64,${Buffer.from(readFileSync('docs/design/assets/Logo/logo-dark.svg')).toString('base64')}`;
    for (const shot of SHOTS) {
      console.log(`  ${shot.file}: ${shot.caption}`);
      const raw = await shot.take(page);
      await open(page, '/licenses/');
      await page.setViewportSize(GALLERY);
      await page.setContent(frameHtml(css, logo, shot.caption, raw), { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const png = stripPng(new Uint8Array(await page.screenshot({ clip: { x: 0, y: 0, ...GALLERY } })));
      writeFileSync(join(OUT, shot.file), png);
      written.push({ file: shot.file, use: 'Galeria', width: GALLERY.width, height: GALLERY.height, bytes: png.length, alt: `${shot.alt} Caption: "${shot.caption}".` });
      await page.setViewportSize({ width: 1280, height: 800 });
    }
  } finally {
    await browser.close();
    stop();
  }

  const kit = readFileSync(KIT, 'utf8');
  const start = '<!-- imagens: a tabela abaixo é reescrita pelo script -->';
  const end = '<!-- fim das imagens -->';
  const from = kit.indexOf(start);
  const to = kit.indexOf(end);
  if (from < 0 || to < 0) throw new Error(`${KIT} has no table markers`);
  writeFileSync(KIT, `${kit.slice(0, from + start.length)}\n${tableOf(written)}\n${kit.slice(to)}`);
  for (const row of written) console.log(`${row.file}: ${row.width} × ${row.height}, ${row.bytes} bytes`);
}

await main();
