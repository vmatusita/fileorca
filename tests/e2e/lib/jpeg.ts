// Minimal JPEG reader for the tests: lists APPn segments and finds the GPS IFD pointer (0x8825)
// in an Exif block. Enough to prove "the output carries no metadata, and no GPS".

export interface Segment {
  marker: number;
  data: Uint8Array;
}

export function segments(bytes: Uint8Array): Segment[] {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('not a JPEG');
  const out: Segment[] = [];
  let i = 2;
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff) throw new Error(`bad marker at ${i}`);
    const marker = bytes[i + 1] ?? 0;
    if (marker === 0xda) break; // start of scan: image data follows
    const length = ((bytes[i + 2] ?? 0) << 8) | (bytes[i + 3] ?? 0);
    out.push({ marker, data: bytes.subarray(i + 4, i + 2 + length) });
    i += 2 + length;
  }
  return out;
}

export function exifBlock(bytes: Uint8Array): Uint8Array | null {
  for (const segment of segments(bytes)) {
    const header = String.fromCharCode(...segment.data.subarray(0, 6));
    if (segment.marker === 0xe1 && header === 'Exif\0\0') return segment.data.subarray(6);
  }
  return null;
}

/** True when IFD0 of the Exif block has the GPSInfo tag (0x8825). */
export function hasGps(bytes: Uint8Array): boolean {
  const tiff = exifBlock(bytes);
  if (!tiff) return false;
  const little = tiff[0] === 0x49;
  const u16 = (offset: number) => (little ? (tiff[offset] ?? 0) | ((tiff[offset + 1] ?? 0) << 8) : ((tiff[offset] ?? 0) << 8) | (tiff[offset + 1] ?? 0));
  const u32 = (offset: number) => (little ? u16(offset) + u16(offset + 2) * 65536 : u16(offset) * 65536 + u16(offset + 2));
  const ifd0 = u32(4);
  const count = u16(ifd0);
  for (let entry = 0; entry < count; entry += 1) {
    if (u16(ifd0 + 2 + entry * 12) === 0x8825) return true;
  }
  return false;
}
