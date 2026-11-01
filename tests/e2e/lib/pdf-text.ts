// Reads the text a PDF draws, from its content streams, in Node (prompt F4, decision 7): every stream with
// /FlateDecode is inflated with fflate, and the operands of Tj and TJ are decoded, hexadecimal (<...>, how
// pdf-lib writes the standard fonts) or literal ((...)), as WinAnsi. Enough for the calculator PDF, whose
// text is drawn with Helvetica; not a general PDF text extractor.
import { unzlibSync } from 'fflate';

const latin1 = new TextDecoder('latin1');

function streams(bytes: Uint8Array): { dict: string; data: Uint8Array }[] {
  const text = latin1.decode(bytes);
  const out: { dict: string; data: Uint8Array }[] = [];
  const pattern = /<<((?:(?!>>).|>>(?!\s*stream))*?)>>\s*stream\r?\n/gs;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    const start = match.index + match[0].length;
    const end = text.indexOf('endstream', start);
    if (end < 0) break;
    out.push({ dict: match[1] ?? '', data: bytes.subarray(start, end) });
    pattern.lastIndex = end;
  }
  return out;
}

function decodeHex(hex: string): string {
  const clean = hex.replace(/\s/g, '');
  const bytes = new Uint8Array(Math.ceil(clean.length / 2));
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt((clean.slice(i * 2, i * 2 + 2) + '0').slice(0, 2), 16);
  return latin1.decode(bytes);
}

function decodeLiteral(literal: string): string {
  return literal.replace(/\\([nrtbf()\\]|[0-7]{1,3})/g, (_, escape: string) => {
    const map: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '(': '(', ')': ')', '\\': '\\' };
    return map[escape] ?? String.fromCharCode(parseInt(escape, 8));
  });
}

/** The strings shown by Tj and TJ in one content stream, one per text operation. */
function shown(content: string): string[] {
  const out: string[] = [];
  const op = /(<[0-9A-Fa-f\s]*>|\((?:\\.|[^\\)])*\))\s*Tj|\[((?:\s*(?:<[0-9A-Fa-f\s]*>|\((?:\\.|[^\\)])*\)|-?[\d.]+))*)\s*\]\s*TJ/g;
  for (let match = op.exec(content); match; match = op.exec(content)) {
    const parts = match[1] ? [match[1]] : [...(match[2] ?? '').matchAll(/<[0-9A-Fa-f\s]*>|\((?:\\.|[^\\)])*\)/g)].map((part) => part[0]);
    out.push(parts.map((part) => (part.startsWith('<') ? decodeHex(part.slice(1, -1)) : decodeLiteral(part.slice(1, -1)))).join(''));
  }
  return out;
}

/** Every string the PDF draws, in the order of its content streams. */
export function pdfTextLines(bytes: Uint8Array): string[] {
  const lines: string[] = [];
  for (const stream of streams(bytes)) {
    let content: string;
    if (/\/FlateDecode/.test(stream.dict)) {
      try {
        content = latin1.decode(unzlibSync(stream.data));
      } catch {
        continue;
      }
    } else content = latin1.decode(stream.data);
    if (!/\bT[jJ]\b/.test(content)) continue;
    lines.push(...shown(content));
  }
  return lines;
}
