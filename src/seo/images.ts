// Build-time images: the app icon PNGs and the Open Graph cards (resvg + satori; DECISOES § 21).
// The icon is docs/design/assets/Logo/app-icon.svg; the card puts the dark logo, the Oli (wave) and,
// on a tool page, the tool icon on the deep sea. Satori reads the .woff of @fontsource/fredoka and
// /figtree (OFL-1.1, devDependencies, the image does not distribute the font): static files, because
// a variable font renders only its default instance. No colour here that is not a token of
// docs/design/tokens.css.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Token values: deep, on-deep, on-deep-muted, brand (opaque icon ground), on-cat (ink of the tool icon),
// turquesa and coral (image and PDF categories) and the dark-theme water (the porthole behind the Oli).
const DEEP = '#0C2B5E';
const ON_DEEP = '#F7FAFD';
const ON_DEEP_MUTED = '#B4C3D8';
const BRAND = '#0B63F6';
const ON_CAT = '#0F1B2D';
const TURQUESA = '#14B8A6';
const CORAL = '#FF6B57';
const ALGA = '#2FBF71';
// F7: the home and health category (violet, with its own white text and icon colour) and the utilities (lime).
const VIOLETA = '#6C47F5';
const ON_VIOLETA = '#FFFFFF';
const LIMA = '#9BD84A';
const WATER_DEEP = '#14407E';

const designAsset = (...parts: string[]): string => readFileSync(join(process.cwd(), 'docs', 'design', 'assets', ...parts), 'utf8').trim();
const fontFile = (family: string, weight: number): Buffer =>
  readFileSync(join(process.cwd(), 'node_modules', '@fontsource', family, 'files', `${family}-latin-${weight}-normal.woff`));
const dataUri = (svg: string): string => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

/** The app icon (the Oli's face on the brand blue), as the SVG text: favicon, and the source of the PNGs. */
export const APP_ICON_SVG = designAsset('Logo', 'app-icon.svg');
/** Alias kept until the layout switches to APP_ICON_SVG. */
export const ICON_SVG = APP_ICON_SVG;

/** Square PNG of the app icon; `opaque` fills the rounded corners with the brand blue (iOS paints transparency black). */
export function iconPng(size: number, options: { opaque?: boolean } = {}): Buffer {
  return new Resvg(APP_ICON_SVG, {
    fitTo: { mode: 'width', value: size },
    font: { loadSystemFonts: false },
    ...(options.opaque ? { background: BRAND } : {}),
  }).render().asPng();
}

// Card geometry (px of the 1200x630 canvas).
const W = 1200;
const H = 630;
const PAD = 72;
const TEXT_W = 590;
const PORTHOLE = 440; // the water-coloured disc behind the Oli, inset from the right edge like the text from the left
const PORTHOLE_X = W - 56 - PORTHOLE;
const PORTHOLE_Y = (H - PORTHOLE) / 2;
const OLI = 400;
const TITLE_SIZES = [84, 74, 66, 58, 52] as const;
const TITLE_MAX_LINES = 3;
const TITLE_LINE = 1.1;

let cache: { fredoka: Buffer; figtree: Buffer; logo: string; oli: string } | undefined;
function assets() {
  cache ??= {
    fredoka: fontFile('fredoka', 600),
    figtree: fontFile('figtree', 400),
    logo: dataUri(designAsset('Logo', 'logo-dark.svg')),
    oli: dataUri(designAsset('Oli', 'oli-wave.svg')),
  };
  return cache;
}
const toolIcons = new Map<string, string>();
/** An icon of docs/design/assets/Icons drawn in the ink of the tool tile (on-cat). */
function toolIcon(name: string, stroke = ON_CAT): string {
  const key = `${name} ${stroke}`;
  let icon = toolIcons.get(key);
  if (!icon) {
    icon = dataUri(designAsset('Icons', `${name}.svg`).replace(/stroke="#[0-9A-Fa-f]{6}"/, `stroke="${stroke}"`));
    toolIcons.set(key, icon);
  }
  return icon;
}

/** The fill of a category tile and the colour of the icon on it (tokens.json: on-violeta on violet, on-cat on the rest). */
const TILE: Record<OgTool['category'], { fill: string; ink: string }> = {
  image: { fill: TURQUESA, ink: ON_CAT },
  pdf: { fill: CORAL, ink: ON_CAT },
  money: { fill: ALGA, ink: ON_CAT },
  home: { fill: VIOLETA, ink: ON_VIOLETA },
  util: { fill: LIMA, ink: ON_CAT },
};

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});
const img = (src: string, width: number, height: number, style: Record<string, unknown> = {}): Node =>
  h('img', { width, height, ...style }, undefined, { src, width, height });

function fonts() {
  const { fredoka, figtree } = assets();
  return [
    { name: 'Fredoka', data: fredoka, weight: 600 as const, style: 'normal' as const },
    { name: 'Figtree', data: figtree, weight: 400 as const, style: 'normal' as const },
  ];
}

const titleStyle = (size: number, breakWord = false): Record<string, unknown> => ({
  display: 'flex', width: TEXT_W, fontFamily: 'Fredoka', fontWeight: 600, fontSize: size, lineHeight: TITLE_LINE, color: ON_DEEP,
  ...(breakWord ? { wordBreak: 'break-word' } : {}),
});

/**
 * Largest title size that wraps in at most TITLE_MAX_LINES lines with no word wider than the column (the title laid
 * out alone). When none fits, the smallest size with words allowed to break.
 */
async function titleSize(title: string): Promise<{ size: number; breakWord: boolean }> {
  for (const size of TITLE_SIZES) {
    let height = 0;
    const svg = await satori(h('div', titleStyle(size), title) as never, {
      width: TEXT_W,
      height: H,
      fonts: fonts(),
      onNodeDetected: (node) => {
        height = Math.max(height, node.height);
      },
    });
    const ink = new Resvg(svg).getBBox();
    if (height <= size * TITLE_LINE * TITLE_MAX_LINES + 1 && (ink?.width ?? 0) <= TEXT_W) return { size, breakWord: false };
  }
  return { size: TITLE_SIZES[TITLE_SIZES.length - 1] ?? 52, breakWord: true };
}

/** The tool icon in its rounded square, rimmed like the Oli (Espuma rim, ink line). */
function toolTile(tool: OgTool): Node {
  return h('div', {
    display: 'flex', position: 'absolute', left: PORTHOLE_X - 30, top: PORTHOLE_Y + PORTHOLE - 140, width: 156, height: 156, borderRadius: 40,
    background: ON_DEEP, padding: 6, transform: 'rotate(-7deg)',
  }, [
    h('div', {
      display: 'flex', alignItems: 'center', justifyContent: 'center', width: 144, height: 144, borderRadius: 34,
      background: TILE[tool.category].fill, border: `3px solid ${ON_CAT}`, boxSizing: 'border-box',
    }, [img(toolIcon(tool.icon, TILE[tool.category].ink), 88, 88)]),
  ]);
}

/** The tool icon beside the Oli: the name of an icon of the design system and the category colour of its tile. */
export interface OgTool {
  icon: string;
  category: 'image' | 'pdf' | 'money' | 'home' | 'util';
}

export async function ogPng(title: string, subtitle: string, options: { tool?: OgTool } = {}): Promise<Buffer> {
  const { logo, oli } = assets();
  const { size, breakWord } = await titleSize(title);
  const tree = h('div', {
    display: 'flex', position: 'relative', width: W, height: H, background: DEEP, color: ON_DEEP, fontFamily: 'Figtree',
  }, [
    h('div', {
      display: 'flex', position: 'absolute', left: PORTHOLE_X, top: PORTHOLE_Y, width: PORTHOLE, height: PORTHOLE,
      borderRadius: PORTHOLE / 2, background: WATER_DEEP,
    }),
    img(oli, OLI, OLI, { position: 'absolute', left: PORTHOLE_X + (PORTHOLE - OLI) / 2, top: PORTHOLE_Y + (PORTHOLE - OLI) / 2 }),
    ...(options.tool ? [toolTile(options.tool)] : []),
    img(logo, 240, 72, { position: 'absolute', left: PAD - 14, top: 44 }),
    h('div', {
      display: 'flex', flexDirection: 'column', position: 'absolute', left: PAD, top: 150, width: TEXT_W, height: H - 150 - 64,
      justifyContent: 'center', gap: 26,
    }, [
      h('div', titleStyle(size, breakWord), title),
      h('div', { display: 'flex', width: TEXT_W, fontSize: 30, lineHeight: 1.3, color: ON_DEEP_MUTED }, subtitle),
    ]),
  ]);
  const svg = await satori(tree as never, { width: W, height: H, fonts: fonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: W }, font: { loadSystemFonts: false } }).render().asPng();
}
