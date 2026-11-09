// Inline icons from docs/design/assets/Icons (DECISOES § 46). The files keep the stroke in Orca for
// <img> use; inline, the root <svg> is ours, with stroke="currentColor", so the icon takes the text
// colour. Safe for the browser bundle: the tool island imports single icons with `?raw`.

export const ICON_NAMES = [
  'alert', 'apple', 'area', 'arrow-right', 'bag', 'balance', 'balloon', 'book', 'browser-image', 'calculator',
  'calendar', 'car', 'card', 'check', 'chevron-down', 'chevron-right', 'close', 'coffee', 'coin-plus', 'coins',
  'compress', 'convert', 'crop', 'download', 'file', 'file-drop', 'globe', 'growth', 'heart', 'home', 'image', 'info',
  'key', 'link', 'lock', 'menu', 'merge', 'moon', 'offline', 'page-number', 'paint', 'paste', 'pdf', 'percent',
  'phone-photo', 'piggy', 'qr', 'refinance', 'reorder', 'resize', 'rotate', 'search', 'shield', 'shovel', 'sign',
  'sparkline', 'split', 'stroller', 'sun', 'table', 'tape', 'theme-system', 'thermometer', 'tile', 'trash',
  'trend-down', 'unlock', 'upload', 'wallet', 'watermark', 'weight', 'zoom',
] as const;
export type IconName = (typeof ICON_NAMES)[number];

/** The root attributes every icon file carries (checked by tests/unit/icons.test.ts). */
export const ICON_FILE_ROOT = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0F1B2D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

/** The children of an icon file (everything inside its root <svg>). */
export function iconInner(raw: string): string {
  const match = /^\s*<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/.exec(raw);
  if (!match?.[1]) throw new Error('icon: not an <svg> file');
  return match[1].trim();
}

/** The inline markup, as the Astro and Preact components render it. */
export function iconMarkup(inner: string, className = 'fo-icon'): string {
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}
