// Build-time images: provisional app icon and the Open Graph cards (satori + resvg).
// Satori cannot read woff2, so the OG text uses the .woff of @fontsource/figtree (OFL-1.1,
// build only; DECISOES § 21). The Oli and the final logo enter in the F1b.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Token values (docs/design/tokens.css): deep, on-deep, on-deep-muted, brand, water, sun is never used.
const DEEP = '#0C2B5E';
const ON_DEEP = '#F7FAFD';
const ON_DEEP_MUTED = '#B4C3D8';
const BRAND = '#0B63F6';
const WATER = '#D6E6FF';

/** Provisional app icon: a file with a folded corner on the brand blue. */
export const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${BRAND}"/><path d="M20 14h17l9 9v27a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2V16a2 2 0 0 1 2-2z" fill="${ON_DEEP}"/><path d="M37 14v9h9z" fill="${WATER}"/><path d="M18 40c5 0 5-3 10-3s5 3 10 3 5-3 8-3v13a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2z" fill="${WATER}"/></svg>`;

export function iconPng(size: number): Buffer {
  return new Resvg(ICON_SVG, { fitTo: { mode: 'width', value: size } }).render().asPng();
}

function font(weight: 400 | 700): Buffer {
  return readFileSync(join(process.cwd(), 'node_modules', '@fontsource', 'figtree', 'files', `figtree-latin-${weight}-normal.woff`));
}

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style, children } });

export async function ogPng(title: string, subtitle: string): Promise<Buffer> {
  const tree = h('div', {
    width: 1200, height: 630, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    padding: 72, background: DEEP, color: ON_DEEP, fontFamily: 'Figtree',
  }, [
    h('div', { display: 'flex', fontSize: 40, fontWeight: 700 }, [
      h('span', {}, 'File'), h('span', { color: WATER }, 'Orca'),
    ]),
    h('div', { display: 'flex', flexDirection: 'column', gap: 24, width: 1056 }, [
      h('div', { fontSize: 64, fontWeight: 700, lineHeight: 1.15, width: 1056 }, title),
      h('div', { fontSize: 32, color: ON_DEEP_MUTED, lineHeight: 1.3, width: 1056 }, subtitle),
    ]),
  ]);
  const svg = await satori(tree as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Figtree', data: font(400), weight: 400, style: 'normal' },
      { name: 'Figtree', data: font(700), weight: 700, style: 'normal' },
    ],
  });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
