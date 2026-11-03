// The image reader of the public-repository audit (scripts/publico/lib/exif.ts, DECISOES § 332): a JPEG built in
// memory with a synthetic Exif (GPS south and west, Artist, Copyright, CameraOwnerName, BodySerialNumber) proves the
// coordinate and the identity tags; a public sample fixture proves a real camera file is read too.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { coordinate, imageMetadata, tiffFacts } from '../../scripts/publico/lib/exif.ts';

interface Tag {
  tag: number;
  /** 2 ASCII, 4 LONG, 5 RATIONAL: the count comes from the bytes (one per character, eight per rational). */
  type: 2 | 4 | 5;
  /** Inline value (up to 4 bytes) or bytes stored in the data area. */
  bytes: number[];
}

const countOf = (entry: Tag): number => (entry.type === 5 ? entry.bytes.length / 8 : entry.type === 4 ? 1 : entry.bytes.length);

const ascii = (text: string): number[] => [...new TextEncoder().encode(text), 0];
const rational = (values: [number, number][]): number[] => values.flatMap(([numerator, denominator]) => [...u32(numerator), ...u32(denominator)]);
const u16 = (value: number): number[] => [value & 0xff, value >> 8];
const u32 = (value: number): number[] => [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >>> 24) & 0xff];

/** A little-endian TIFF with IFD0, an Exif IFD and a GPS IFD; pointer tags are filled in here. */
function buildTiff(ifd0: Tag[], exif: Tag[], gps: Tag[]): Uint8Array {
  const ifdSize = (tags: Tag[]): number => 2 + tags.length * 12 + 4;
  const pointers: Tag[] = [
    { tag: 0x8769, type: 4, bytes: [] },
    { tag: 0x8825, type: 4, bytes: [] },
  ];
  const withPointers = [...ifd0, ...pointers].sort((left, right) => left.tag - right.tag);
  const ifd0At = 8;
  const exifAt = ifd0At + ifdSize(withPointers);
  const gpsAt = exifAt + ifdSize(exif);
  let dataAt = gpsAt + ifdSize(gps);
  const out: number[] = [0x49, 0x49, ...u16(42), ...u32(ifd0At)];
  const data: number[] = [];
  const writeIfd = (tags: Tag[]): void => {
    out.push(...u16(tags.length));
    for (const entry of tags) {
      out.push(...u16(entry.tag), ...u16(entry.type), ...u32(countOf(entry)));
      if (entry.tag === 0x8769) out.push(...u32(exifAt));
      else if (entry.tag === 0x8825) out.push(...u32(gpsAt));
      else if (entry.bytes.length <= 4) out.push(...entry.bytes, ...new Array<number>(4 - entry.bytes.length).fill(0));
      else {
        out.push(...u32(dataAt));
        data.push(...entry.bytes);
        dataAt += entry.bytes.length;
      }
    }
    out.push(...u32(0));
  };
  writeIfd(withPointers);
  writeIfd(exif);
  writeIfd(gps);
  return new Uint8Array([...out, ...data]);
}

/** SOI, an APP1 Exif segment, a stub SOS and EOI: enough for the JPEG readers of the tests. */
function jpegWithExif(tiff: Uint8Array): Uint8Array {
  const payload = [...new TextEncoder().encode('Exif\0\0'), ...tiff];
  const length = payload.length + 2;
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe1, length >> 8, length & 0xff, ...payload, 0xff, 0xda, 0x00, 0x02, 0xff, 0xd9]);
}

const SYNTHETIC = buildTiff(
  [
    { tag: 0x013b, type: 2, bytes: ascii('Ana Exemplo') },
    { tag: 0x8298, type: 2, bytes: ascii('(c) Exemplo SA') },
  ],
  [
    { tag: 0xa430, type: 2, bytes: ascii('Dona Ex') },
    { tag: 0xa431, type: 2, bytes: ascii('SN000000') },
  ],
  [
    { tag: 1, type: 2, bytes: ascii('S') },
    { tag: 2, type: 5, bytes: rational([[25, 1], [30, 1], [0, 1]]) },
    { tag: 3, type: 2, bytes: ascii('W') },
    { tag: 4, type: 5, bytes: rational([[49, 1], [15, 1], [36, 1]]) },
  ],
);

describe('tiffFacts', () => {
  it('reads the coordinate with the hemisphere letters and the identity tags', () => {
    const facts = tiffFacts(SYNTHETIC);
    expect(facts.latitude).toBeCloseTo(-25.5, 9);
    expect(facts.longitude).toBeCloseTo(-(49 + 15 / 60 + 36 / 3600), 9);
    expect(facts.identity).toEqual([
      { tag: 'Artist', value: 'Ana Exemplo' },
      { tag: 'Copyright', value: '(c) Exemplo SA' },
      { tag: 'CameraOwnerName', value: 'Dona Ex' },
      { tag: 'BodySerialNumber', value: 'SN000000' },
    ]);
  });

  it('gives no coordinate for a zeroed GPS and nothing for bytes that are not a TIFF', () => {
    const zeroed = buildTiff([], [], [
      { tag: 1, type: 2, bytes: ascii('N') },
      { tag: 2, type: 5, bytes: rational([[0, 1], [0, 1], [0, 1]]) },
      { tag: 3, type: 2, bytes: ascii('E') },
      { tag: 4, type: 5, bytes: rational([[0, 1], [0, 1], [0, 1]]) },
    ]);
    expect(tiffFacts(zeroed)).toEqual({ latitude: null, longitude: null, identity: [] });
    expect(tiffFacts(new TextEncoder().encode('not a tiff at all'))).toEqual({ latitude: null, longitude: null, identity: [] });
  });
});

describe('imageMetadata', () => {
  it('finds the real GPS and the identity of a JPEG built in memory', () => {
    const meta = imageMetadata(jpegWithExif(SYNTHETIC));
    expect(meta?.format).toBe('jpeg');
    expect(meta?.gpsKind).toBe('real');
    expect(coordinate(meta?.latitude ?? 0, meta?.longitude ?? 0)).toBe('-25.500000, -49.260000');
    expect(meta?.identity.map((tag) => tag.tag)).toEqual(['Artist', 'Copyright', 'CameraOwnerName', 'BodySerialNumber']);
  });

  it('reads a public sample photo with GPS (fixtures/ORIGEM.md) without asserting where it is', () => {
    const meta = imageMetadata(new Uint8Array(readFileSync('fixtures/images/jpg-02-iphone6-paisagem-gps.jpg')));
    expect(meta?.gpsKind).toBe('real');
    expect(meta?.latitude).not.toBeNull();
    expect(meta?.longitude).not.toBeNull();
  });

  it('returns null for text and does not throw on a broken JPEG', () => {
    expect(imageMetadata(new TextEncoder().encode('hello'))).toBeNull();
    const broken = new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x40, 0x45, 0x78]);
    expect(() => imageMetadata(broken)).not.toThrow();
  });
});
