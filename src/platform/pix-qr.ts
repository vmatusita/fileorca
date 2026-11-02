// The QR of a Pix code, drawn at build time as an inline SVG (prompt F6, decision 8). The matrix comes from the
// `qrcode` package (MIT, a devDependency: it never reaches the browser); this file only draws it: one path of the dark
// modules in `currentColor` (the page fills them with the `deep` token, the same in both themes) on a white square with the
// quiet zone of four modules, the one hex the design system allows for the Pix QR (docs/design/README, "Cor").
// Error correction M (15%): the BR Code manual sets no level; M is the usual one for a code read off a screen, and the
// QR of these codes (144 to 153 characters) stays at version 7 (45 × 45 modules).
import QRCode from 'qrcode';

export const QR_LEVEL = 'M';
/** Modules of light margin around the code (ISO/IEC 18004 asks for four). */
export const QUIET_ZONE = 4;

export interface PixQr {
  /** The SVG markup, ready to inline. */
  svg: string;
  /** Modules on a side, without the quiet zone. */
  size: number;
}

/** The SVG of the QR of `text`, labelled for screen readers. */
export function qrSvg(text: string, label: string): PixQr {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: QR_LEVEL });
  const size = modules.size;
  const side = size + 2 * QUIET_ZONE;
  let path = '';
  for (let row = 0; row < size; row += 1) {
    let col = 0;
    while (col < size) {
      if (!modules.get(row, col)) {
        col += 1;
        continue;
      }
      // One horizontal run of dark modules per subpath.
      let end = col;
      while (end < size && modules.get(row, end)) end += 1;
      path += `M${col + QUIET_ZONE} ${row + QUIET_ZONE}h${end - col}v1h${col - end}z`;
      col = end;
    }
  }
  const escaped = label.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  const svg =
    `<svg class="fo-pix__qr" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" shape-rendering="crispEdges" role="img" aria-label="${escaped}">` +
    `<rect width="${side}" height="${side}" fill="#FFFFFF"/><path fill="currentColor" d="${path}"/></svg>`;
  return { svg, size };
}
