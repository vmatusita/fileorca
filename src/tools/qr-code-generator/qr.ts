// The QR code generator's matrix and drawing (prompt F7, decision 8), with no DOM so the Node tests run it as the page does.
// The matrix comes from the deep path of the `qrcode` package (MIT): `lib/core/qrcode.js` takes 22 modules and dijkstrajs,
// and leaves out the renderers of its index, which this page draws itself. The text goes in as the bytes of its UTF-8, in
// one byte-mode segment, so what a phone reads back is exactly what was typed (qrcode 1.5.4 writes no ECI header).
// Error correction is always H (30%): it is what lets the Oli sit in the middle and the code still read.
// Drawing: black modules on white, the quiet zone of four modules (ISO/IEC 18004), one path of horizontal runs (as the Pix
// QR of src/platform/pix-qr.ts), and the app icon in a white frame at the centre, aligned to the grid, an odd number of
// modules wide. The two hex colours are the file's, not the page's: a QR is read as black on white by every camera.
import { create } from 'qrcode/lib/core/qrcode.js';
import appIcon from '../../../docs/design/assets/Logo/app-icon.svg?raw';

/** Bytes a QR of version 40 holds in byte mode at error correction H (ISO/IEC 18004, table 7): the longest text allowed. */
export const MAX_BYTES = 1273;
/** Modules of white margin around the code (ISO/IEC 18004 asks for four). */
export const QUIET_ZONE = 4;
/** The error correction level asked of the library; `levelBit` 2 is H (an unknown level would fall back to M in silence). */
export const LEVEL = 'H';
export const LEVEL_H_BIT = 2;
/** The white frame of the Oli, as a share of the side of the matrix (without the quiet zone). */
export const OLI_SHARE = 0.22;
/** Margin between the frame and the icon, as a share of the side of the frame. */
export const ICON_INSET = 0.1;
/** The modules and the ground of the saved file. */
export const DARK = '#000000';
export const LIGHT = '#FFFFFF';
/** The id of the icon's clip path inside the QR (the icon file uses "ic", a name that could clash on a page). */
export const ICON_CLIP_ID = 'fo-qr-oli';

/** The PNG sizes on offer and the side, in pixels, each one aims at. */
export const PNG_TARGETS = { small: 512, medium: 1024, large: 2048 } as const;
export type PngSize = keyof typeof PNG_TARGETS;
export const PNG_SIZES: readonly PngSize[] = ['small', 'medium', 'large'];
/** The fewest pixels a module gets in the PNG: below this a camera, and jsQR, start to miss modules. */
export const MIN_MODULE_PX = 4;

export type QrProblem = 'empty' | 'long';

export interface QrMatrix {
  /** Modules on a side, without the quiet zone (21 for version 1, 177 for version 40). */
  size: number;
  version: number;
  /** The error correction level the library used, as its format bits: 2 is H. */
  levelBit: number;
  /** One byte per module, row by row: 1 is dark. */
  dark: Uint8Array;
}

export type Encoded = { ok: true; matrix: QrMatrix; bytes: number } | { ok: false; problem: QrProblem; bytes: number };

/** The UTF-8 bytes of a text, the way the QR carries them. */
export function utf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

/**
 * The QR of a text. Nothing is made for a text that is empty or only white space (spaces, tabs, line breaks: a code of
 * nothing to read), or longer than MAX_BYTES of UTF-8. The text itself goes in as typed, spaces included.
 */
export function encode(text: string): Encoded {
  const bytes = utf8(text);
  if (text.trim() === '') return { ok: false, problem: 'empty', bytes: bytes.length };
  if (bytes.length > MAX_BYTES) return { ok: false, problem: 'long', bytes: bytes.length };
  const qr = create([{ data: bytes, mode: 'byte' }], { errorCorrectionLevel: LEVEL });
  return {
    ok: true,
    bytes: bytes.length,
    matrix: { size: qr.modules.size, version: qr.version, levelBit: qr.errorCorrectionLevel.bit, dark: qr.modules.data },
  };
}

/** The white frame of the Oli, in modules inside the matrix: centred, an odd side, about OLI_SHARE of the matrix. */
export interface Frame {
  at: number;
  side: number;
}

export function oliFrame(size: number): Frame {
  const side = 2 * Math.round((OLI_SHARE * size - 1) / 2) + 1;
  return { at: (size - side) / 2, side };
}

/** One horizontal run of dark modules: column and row in the drawing (quiet zone included) and its length. */
export type Run = readonly [x: number, y: number, length: number];

/** The dark modules as horizontal runs, without the ones under the Oli's frame when she is in the middle. */
export function runs(matrix: QrMatrix, oli: boolean): Run[] {
  const { size, dark } = matrix;
  const frame = oli ? oliFrame(size) : null;
  const hidden = (row: number, col: number): boolean =>
    frame !== null && row >= frame.at && row < frame.at + frame.side && col >= frame.at && col < frame.at + frame.side;
  const out: Run[] = [];
  for (let row = 0; row < size; row += 1) {
    let col = 0;
    while (col < size) {
      if (!dark[row * size + col] || hidden(row, col)) {
        col += 1;
        continue;
      }
      let end = col;
      while (end < size && dark[row * size + end] && !hidden(row, end)) end += 1;
      out.push([col + QUIET_ZONE, row + QUIET_ZONE, end - col]);
      col = end;
    }
  }
  return out;
}

/** Modules on a side of the drawing, quiet zone included. */
export function drawingSide(size: number): number {
  return size + 2 * QUIET_ZONE;
}

/** Where the icon goes, in modules of the drawing: inside the frame, ICON_INSET of it away from each edge. */
export function iconBox(size: number): { x: number; side: number } {
  const frame = oliFrame(size);
  const inset = frame.side * ICON_INSET;
  return { x: QUIET_ZONE + frame.at + inset, side: frame.side - 2 * inset };
}

const number = (value: number): string => String(Math.round(value * 100) / 100);

/** The app icon with its clip path renamed, opening tag left to the caller. */
function iconBody(): string {
  const body = appIcon.trim().replace(/^<svg[^>]*>/, '');
  return body.replaceAll('id="ic"', `id="${ICON_CLIP_ID}"`).replaceAll('url(#ic)', `url(#${ICON_CLIP_ID})`);
}

/**
 * The app icon as a file of its own, for the canvas: an image needs a width and a height on its root to be drawn at the
 * size asked in every browser.
 */
export function iconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">${iconBody()}`;
}

/**
 * The SVG of a QR: the white ground, one path of dark runs with crisp edges and, with the Oli, the icon nested at the
 * centre. It carries no text of the person: no <title>, no <desc>, no metadata.
 */
export function qrSvg(matrix: QrMatrix, oli: boolean): string {
  const side = drawingSide(matrix.size);
  const path = runs(matrix, oli)
    .map(([x, y, length]) => `M${x} ${y}h${length}v1h-${length}z`)
    .join('');
  let icon = '';
  if (oli) {
    const box = iconBox(matrix.size);
    icon = `<svg x="${number(box.x)}" y="${number(box.x)}" width="${number(box.side)}" height="${number(box.side)}" viewBox="0 0 128 128">${iconBody()}`;
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" width="${side * 8}" height="${side * 8}">` +
    `<rect width="${side}" height="${side}" fill="${LIGHT}"/><path fill="${DARK}" shape-rendering="crispEdges" d="${path}"/>${icon}</svg>`
  );
}

/** Pixels a module gets in the PNG of a size: a whole number (jsQR misses modules at a fractional scale), never below 4. */
export function pngScale(size: number, target: PngSize): number {
  return Math.max(MIN_MODULE_PX, Math.floor(PNG_TARGETS[target] / drawingSide(size)));
}

/** The side of the PNG in pixels, what the page says next to the size. */
export function pngSide(size: number, target: PngSize): number {
  return drawingSide(size) * pngScale(size, target);
}

/** Where the icon goes in the PNG, in whole pixels. */
export function pngIconBox(size: number, scale: number): { x: number; side: number } {
  const frame = oliFrame(size);
  const framePx = frame.side * scale;
  const inset = Math.round(framePx * ICON_INSET);
  return { x: (QUIET_ZONE + frame.at) * scale + inset, side: framePx - 2 * inset };
}
