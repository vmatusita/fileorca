// What a file is, from its first bytes (DECISOES § 59): a PDF has "%PDF-" in its first kilobyte (the spec allows
// junk before the header, and some scanners write it); the image signatures tell an image that got a .pdf name, so its
// line can point at Image to PDF. Never the name, never the type the browser guessed.
// Self-contained: nothing here imports from outside src/engine/pdf/.

import type { PdfSniffed } from './types.ts';

const HEADER = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-

function startsWith(bytes: Uint8Array, signature: readonly number[], at = 0): boolean {
  return signature.every((value, i) => bytes[at + i] === value);
}

/** Offset of "%PDF-" inside the first 1024 bytes, or -1. */
export function headerOffset(bytes: Uint8Array): number {
  const end = Math.min(bytes.length - HEADER.length, 1024 - HEADER.length);
  for (let i = 0; i <= end; i += 1) if (startsWith(bytes, HEADER, i)) return i;
  return -1;
}

export function sniffPdf(bytes: Uint8Array): PdfSniffed {
  if (bytes.length === 0) return 'empty';
  if (headerOffset(bytes) >= 0) return 'pdf';
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return 'png';
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return 'webp';
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return 'gif';
  if (startsWith(bytes, [0x66, 0x74, 0x79, 0x70], 4)) return 'heic';
  // Printable ASCII and common whitespace in the first 512 bytes: a text file.
  const head = bytes.subarray(0, 512);
  if (head.every((value) => value === 9 || value === 10 || value === 13 || (value >= 32 && value < 127) || value >= 0xc2)) return 'text';
  return 'unknown';
}

/**
 * Whether the cross-reference index points where it should: "startxref" near the end, its offset inside the file, and
 * at that offset an xref table or an object (an xref stream). A file that fails this is read by scanning (pdf-lib does)
 * and comes out with a fresh index: it is repaired, not refused.
 */
export function indexIsSound(bytes: Uint8Array): boolean {
  const tail = new TextDecoder('latin1').decode(bytes.subarray(Math.max(0, bytes.length - 2048)));
  const at = tail.lastIndexOf('startxref');
  if (at < 0) return false;
  const match = /^startxref\s+(\d+)/.exec(tail.slice(at));
  if (!match) return false;
  const offset = Number(match[1]);
  if (!Number.isFinite(offset) || offset <= 0 || offset >= bytes.length) return false;
  const there = new TextDecoder('latin1').decode(bytes.subarray(offset, offset + 32));
  return /^xref\b/.test(there) || /^\d+\s+\d+\s+obj\b/.test(there);
}

/** "%%EOF" somewhere in the last 64 KB: a file that has it was written to its end. */
export function hasEnd(bytes: Uint8Array): boolean {
  const tail = new TextDecoder('latin1').decode(bytes.subarray(Math.max(0, bytes.length - 65_536)));
  return tail.includes('%%EOF');
}
