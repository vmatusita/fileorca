// ZIP reader for the tests. It reads the central directory itself, so it lists duplicate names (the
// object fflate's unzipSync returns keeps one entry per name, which would hide the very bug the
// "unique names" check looks for), and reports how each entry is stored. Data comes out through
// fflate's inflateSync when an entry is deflated. ZIP64 is not read: a batch in a test is far below 4 GiB.
import { inflateSync } from 'fflate';

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array, seed = 0): number {
  let crc = ~seed >>> 0;
  for (let i = 0; i < bytes.length; i += 1) crc = (CRC_TABLE[(crc ^ (bytes[i] ?? 0)) & 0xff] as number) ^ (crc >>> 8);
  return ~crc >>> 0;
}

export interface ZipEntry {
  name: string;
  /** 0 = stored, 8 = deflated. */
  method: number;
  compressedSize: number;
  size: number;
  crc: number;
  /** The "language encoding" flag (bit 11): the name is UTF-8. */
  utf8: boolean;
  bytes: Uint8Array;
  /** CRC-32 of the extracted bytes equals the one in the directory, and so does the size. */
  intact: boolean;
}

export function readZip(zip: Uint8Array): ZipEntry[] {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  let end = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 22 - 0xffff); i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error('not a ZIP (no end of central directory)');
  const count = view.getUint16(end + 10, true);
  let at = view.getUint32(end + 16, true);
  if (count === 0xffff || at === 0xffffffff) throw new Error('ZIP64 is not supported by this reader');
  const decoder = new TextDecoder('utf-8');
  const out: ZipEntry[] = [];
  for (let entry = 0; entry < count; entry += 1) {
    if (view.getUint32(at, true) !== 0x02014b50) throw new Error(`bad central directory entry ${entry}`);
    const flags = view.getUint16(at + 8, true);
    const method = view.getUint16(at + 10, true);
    const crc = view.getUint32(at + 16, true);
    const compressedSize = view.getUint32(at + 20, true);
    const size = view.getUint32(at + 24, true);
    const nameLength = view.getUint16(at + 28, true);
    const extraLength = view.getUint16(at + 30, true);
    const commentLength = view.getUint16(at + 32, true);
    const local = view.getUint32(at + 42, true);
    const name = decoder.decode(zip.subarray(at + 46, at + 46 + nameLength));
    if (view.getUint32(local, true) !== 0x04034b50) throw new Error(`bad local header for ${name}`);
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    const packed = zip.subarray(start, start + compressedSize);
    if (method !== 0 && method !== 8) throw new Error(`${name}: unsupported compression method ${method}`);
    const bytes = method === 0 ? packed.slice() : inflateSync(packed);
    out.push({ name, method, compressedSize, size, crc, utf8: (flags & 0x800) !== 0, bytes, intact: bytes.length === size && crc32(bytes) === crc });
    at += 46 + nameLength + extraLength + commentLength;
  }
  return out;
}

/** The names in directory order, duplicates included. */
export function zipNames(zip: Uint8Array): string[] {
  return readZip(zip).map((entry) => entry.name);
}
