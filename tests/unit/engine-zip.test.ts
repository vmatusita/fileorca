import { unzipSync } from 'fflate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { zipStored } from '../../src/engine/image/zip.ts';

const u16 = (bytes: Uint8Array, at: number) => (bytes[at] ?? 0) | ((bytes[at + 1] ?? 0) << 8);
const u32 = (bytes: Uint8Array, at: number) => u16(bytes, at) + u16(bytes, at + 2) * 0x10000;

/** Entries of the central directory: name, compression method, sizes. */
function directory(zip: Uint8Array) {
  let end = zip.length - 22;
  while (end >= 0 && u32(zip, end) !== 0x06054b50) end -= 1;
  const count = u16(zip, end + 10);
  let at = u32(zip, end + 16);
  const entries: { name: string; method: number; compressed: number; size: number; flags: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    const nameLength = u16(zip, at + 28);
    entries.push({
      name: new TextDecoder().decode(zip.subarray(at + 46, at + 46 + nameLength)),
      method: u16(zip, at + 10),
      compressed: u32(zip, at + 20),
      size: u32(zip, at + 24),
      flags: u16(zip, at + 8),
    });
    at += 46 + nameLength + u16(zip, at + 30) + u16(zip, at + 32);
  }
  return entries;
}

function noise(length: number, seed: number): Uint8Array {
  const out = new Uint8Array(length);
  let x = seed;
  for (let i = 0; i < length; i += 1) {
    x = (x * 1664525 + 1013904223) >>> 0;
    out[i] = x >>> 24;
  }
  return out;
}

describe('zip: a stored archive of the batch outputs', () => {
  const files = [
    { name: 'photo.jpg', bytes: noise(5000, 1) },
    { name: 'photo (2).jpg', bytes: noise(3000, 2) },
    { name: 'ação café ñ.png', bytes: noise(1200, 3) },
    { name: 'empty.webp', bytes: new Uint8Array(0) },
  ];
  const entries = files.map((file) => ({ name: file.name, blob: new Blob([file.bytes as BlobPart]) }));

  it('round-trips: same names, same bytes', async () => {
    const blob = await zipStored(entries);
    expect(blob.type).toBe('application/zip');
    const unzipped = unzipSync(new Uint8Array(await blob.arrayBuffer()));
    expect(Object.keys(unzipped).sort()).toEqual(files.map((file) => file.name).sort());
    for (const file of files) expect(Buffer.from(unzipped[file.name]!).equals(Buffer.from(file.bytes)), file.name).toBe(true);
  });

  it('stores the files without compressing them', async () => {
    const compressible = { name: 'flat.png', blob: new Blob([new Uint8Array(20_000).fill(7)]) };
    const zip = new Uint8Array(await (await zipStored([compressible])).arrayBuffer());
    const [entry] = directory(zip);
    expect(entry).toMatchObject({ name: 'flat.png', method: 0, compressed: 20_000, size: 20_000 });
  });

  it('records every entry in the directory, with names as UTF-8', async () => {
    const zip = new Uint8Array(await (await zipStored(entries)).arrayBuffer());
    const listed = directory(zip);
    expect(listed.map((entry) => entry.name)).toEqual(files.map((file) => file.name));
    expect(listed.every((entry) => entry.method === 0)).toBe(true);
    expect(listed.map((entry) => entry.size)).toEqual(files.map((file) => file.bytes.length));
    const accented = listed.find((entry) => entry.name.startsWith('ação'))!;
    expect(accented.flags & 0x800).toBe(0x800); // the UTF-8 name flag
  });

  it('is a few dozen bytes per entry larger than its contents, nothing more', async () => {
    const total = files.reduce((sum, file) => sum + file.bytes.length, 0);
    const blob = await zipStored(entries);
    expect(blob.size).toBeGreaterThan(total);
    expect(blob.size).toBeLessThan(total + 200 * files.length);
  });

  afterEach(() => vi.useRealTimers());

  it('does not stamp the time it was made', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 5, 1, 10, 30));
    const first = new Uint8Array(await (await zipStored(entries)).arrayBuffer());
    vi.setSystemTime(new Date(2031, 1, 2, 3, 4));
    const second = new Uint8Array(await (await zipStored(entries)).arrayBuffer());
    expect(Buffer.from(first).equals(Buffer.from(second))).toBe(true);
  });

  it('makes a valid empty archive from no files', async () => {
    const blob = await zipStored([]);
    expect(blob.size).toBe(22);
    expect(Object.keys(unzipSync(new Uint8Array(await blob.arrayBuffer())))).toEqual([]);
  });
});
