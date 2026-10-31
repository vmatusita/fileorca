// RIFF/WebP assembly for the fixture generator: wraps the bitstreams Chromium's canvas produces in
// the extended (VP8X) container, to add an EXIF chunk or to build an animation.

const ascii = (text: string): number[] => [...text].map((char) => char.charCodeAt(0));

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

const le24 = (value: number): number[] => [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff];
const le32 = (value: number): number[] => [...le24(value), (value >>> 24) & 0xff];

/** A whole chunk: FourCC, size, payload and the pad byte of odd sizes. */
export function chunk(fourcc: string, payload: Uint8Array): Uint8Array {
  return concat([Uint8Array.from([...ascii(fourcc), ...le32(payload.length)]), payload, new Uint8Array(payload.length % 2)]);
}

/** "RIFF" + size + "WEBP" + the chunks. */
export function riff(chunks: Uint8Array[]): Uint8Array {
  const body = concat([Uint8Array.from(ascii('WEBP')), ...chunks]);
  return concat([Uint8Array.from([...ascii('RIFF'), ...le32(body.length)]), body]);
}

export function readChunks(webp: Uint8Array): { fourcc: string; payload: Uint8Array; whole: Uint8Array }[] {
  const text = (at: number): string => String.fromCharCode(webp[at] ?? 0, webp[at + 1] ?? 0, webp[at + 2] ?? 0, webp[at + 3] ?? 0);
  if (text(0) !== 'RIFF' || text(8) !== 'WEBP') throw new Error('not a WebP');
  const out: { fourcc: string; payload: Uint8Array; whole: Uint8Array }[] = [];
  let at = 12;
  while (at + 8 <= webp.length) {
    const size = (webp[at + 4] ?? 0) | ((webp[at + 5] ?? 0) << 8) | ((webp[at + 6] ?? 0) << 16) | ((webp[at + 7] ?? 0) << 24);
    const end = at + 8 + size + (size % 2);
    out.push({ fourcc: text(at), payload: webp.subarray(at + 8, at + 8 + size), whole: webp.subarray(at, Math.min(end, webp.length)) });
    at = end;
  }
  return out;
}

const VP8X_EXIF = 0x08;
const VP8X_ANIMATION = 0x02;

function vp8x(flags: number, width: number, height: number): Uint8Array {
  return chunk('VP8X', Uint8Array.from([flags, 0, 0, 0, ...le24(width - 1), ...le24(height - 1)]));
}

/**
 * The lossy image chunk of an opaque WebP. Chromium writes VP8X + ICCP + VP8 for a canvas; the
 * fixtures keep the bitstream only, so the container is exactly what each one is meant to test.
 */
function lossyChunk(webp: Uint8Array): Uint8Array {
  const chunks = readChunks(webp);
  const image = chunks.find((entry) => entry.fourcc === 'VP8 ');
  if (!image || chunks.some((entry) => entry.fourcc === 'ALPH' || entry.fourcc === 'ANIM' || entry.fourcc === 'VP8L')) {
    throw new Error(`expected an opaque lossy WebP, got ${chunks.map((entry) => entry.fourcc).join(',')}`);
  }
  return image.whole;
}

/** The lossy WebP with a VP8X header (EXIF flag) and an EXIF chunk after the image, as the spec orders them. */
export function withExif(webp: Uint8Array, tiff: Uint8Array, width: number, height: number): Uint8Array {
  return riff([vp8x(VP8X_EXIF, width, height), lossyChunk(webp), chunk('EXIF', tiff)]);
}

/** An animation from lossy single-frame WebPs of the same size: VP8X + ANIM + one ANMF per frame. */
export function animation(frames: Uint8Array[], width: number, height: number, durationMs: number): Uint8Array {
  const anim = chunk('ANIM', Uint8Array.from([0xff, 0xff, 0xff, 0xff, 0, 0])); // white background, loop forever
  const anmf = frames.map((frame) =>
    chunk('ANMF', concat([Uint8Array.from([...le24(0), ...le24(0), ...le24(width - 1), ...le24(height - 1), ...le24(durationMs), 0]), lossyChunk(frame)])),
  );
  return riff([vp8x(VP8X_ANIMATION, width, height), anim, ...anmf]);
}
