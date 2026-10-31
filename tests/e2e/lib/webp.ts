// WebP (RIFF) reader for the tests: chunks, size, alpha and animation flags, and the metadata chunks
// (EXIF, XMP ). The size comes from the bitstream header (VP8, VP8L) or the VP8X canvas, never from
// the file name or the file size.

export interface WebpChunk {
  fourcc: string;
  data: Uint8Array;
}

const text = (bytes: Uint8Array, at: number): string => String.fromCharCode(...bytes.subarray(at, at + 4));

export function isWebp(bytes: Uint8Array): boolean {
  return bytes.length >= 12 && text(bytes, 0) === 'RIFF' && text(bytes, 8) === 'WEBP';
}

function readChunks(bytes: Uint8Array, from: number, to: number): WebpChunk[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out: WebpChunk[] = [];
  let at = from;
  while (at + 8 <= to) {
    const size = view.getUint32(at + 4, true);
    if (at + 8 + size > to) throw new Error(`chunk ${text(bytes, at)} runs past the end of the data`);
    out.push({ fourcc: text(bytes, at), data: bytes.subarray(at + 8, at + 8 + size) });
    at += 8 + size + (size % 2);
  }
  return out;
}

/** Top-level chunks. Throws when the RIFF size does not match the file. */
export function webpChunks(bytes: Uint8Array): WebpChunk[] {
  if (!isWebp(bytes)) throw new Error('not a WebP');
  const riffSize = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true);
  if (riffSize + 8 !== bytes.length) throw new Error(`RIFF size says ${riffSize + 8} bytes, the file has ${bytes.length}`);
  return readChunks(bytes, 12, bytes.length);
}

const le24 = (data: Uint8Array, at: number): number => (data[at] ?? 0) | ((data[at + 1] ?? 0) << 8) | ((data[at + 2] ?? 0) << 16);

/** Width and height from a VP8 (lossy) or VP8L (lossless) image chunk. */
function bitstreamSize(chunk: WebpChunk): { width: number; height: number; alphaHint: boolean } | null {
  const d = chunk.data;
  if (chunk.fourcc === 'VP8 ' && d[3] === 0x9d && d[4] === 0x01 && d[5] === 0x2a) {
    return { width: ((d[6] ?? 0) | ((d[7] ?? 0) << 8)) & 0x3fff, height: ((d[8] ?? 0) | ((d[9] ?? 0) << 8)) & 0x3fff, alphaHint: false };
  }
  if (chunk.fourcc === 'VP8L' && d[0] === 0x2f) {
    const bits = ((d[1] ?? 0) | ((d[2] ?? 0) << 8) | ((d[3] ?? 0) << 16) | ((d[4] ?? 0) << 24)) >>> 0;
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1, alphaHint: ((bits >>> 28) & 1) === 1 };
  }
  return null;
}

export interface WebpFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  durationMs: number;
}

/** The ANMF frames of an animation (empty for a still image). */
export function webpFrames(bytes: Uint8Array): WebpFrame[] {
  return webpChunks(bytes)
    .filter((chunk) => chunk.fourcc === 'ANMF')
    .map((chunk) => ({
      x: le24(chunk.data, 0) * 2,
      y: le24(chunk.data, 3) * 2,
      width: le24(chunk.data, 6) + 1,
      height: le24(chunk.data, 9) + 1,
      durationMs: le24(chunk.data, 12),
    }));
}

export interface WebpInfo {
  width: number;
  height: number;
  /** 'lossy' (VP8), 'lossless' (VP8L) or 'extended' (VP8X first, with any of them inside). */
  kind: 'lossy' | 'lossless' | 'extended';
  hasAlpha: boolean;
  animated: boolean;
  /** Frames of an animation, 1 for a still image. */
  frameCount: number;
  hasExif: boolean;
  hasXmp: boolean;
  hasIcc: boolean;
  chunkTypes: string[];
}

export function webpInfo(bytes: Uint8Array): WebpInfo {
  const chunks = webpChunks(bytes);
  const first = chunks[0];
  if (!first) throw new Error('WebP without chunks');
  const frames = chunks.filter((chunk) => chunk.fourcc === 'ANMF');
  const inside = frames.flatMap((frame) => readChunks(frame.data, 16, frame.data.length));
  const all = [...chunks, ...inside];
  const image = all.find((chunk) => chunk.fourcc === 'VP8 ' || chunk.fourcc === 'VP8L');
  const stream = image ? bitstreamSize(image) : null;
  const extended = first.fourcc === 'VP8X';
  const flags = extended ? (first.data[0] ?? 0) : 0;
  let width: number;
  let height: number;
  if (extended) {
    width = le24(first.data, 4) + 1;
    height = le24(first.data, 7) + 1;
  } else if (stream) {
    ({ width, height } = stream);
  } else {
    throw new Error('WebP without an image chunk');
  }
  return {
    width,
    height,
    kind: extended ? 'extended' : first.fourcc === 'VP8L' ? 'lossless' : 'lossy',
    hasAlpha: (flags & 0x10) !== 0 || all.some((chunk) => chunk.fourcc === 'ALPH') || (stream?.alphaHint ?? false),
    animated: (flags & 0x02) !== 0 && frames.length > 0,
    frameCount: frames.length || 1,
    hasExif: chunks.some((chunk) => chunk.fourcc === 'EXIF'),
    hasXmp: chunks.some((chunk) => chunk.fourcc === 'XMP '),
    hasIcc: chunks.some((chunk) => chunk.fourcc === 'ICCP'),
    chunkTypes: chunks.map((chunk) => chunk.fourcc),
  };
}

/** The EXIF chunk as a bare TIFF block (an "Exif\0\0" prefix, which some writers add, is dropped). */
export function webpExif(bytes: Uint8Array): Uint8Array | null {
  const chunk = webpChunks(bytes).find((candidate) => candidate.fourcc === 'EXIF');
  if (!chunk) return null;
  const prefixed = String.fromCharCode(...chunk.data.subarray(0, 6)) === 'Exif\0\0';
  return prefixed ? chunk.data.subarray(6) : chunk.data;
}

/** EXIF and XMP chunks in the file: empty for a clean output. */
export function webpMetadataChunks(bytes: Uint8Array): string[] {
  return webpChunks(bytes)
    .map((chunk) => chunk.fourcc)
    .filter((fourcc) => fourcc === 'EXIF' || fourcc === 'XMP ');
}
