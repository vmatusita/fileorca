// Byte builders for the engine tests: ISO-BMFF boxes, small HEIF files with exactly the properties
// a test needs (irot 90 and 180, imir, clap, ipma with 15-bit indexes, 32-bit item ids, a plain
// hvc1 primary), and PNG/JPEG/WebP shells. The real fixtures cover what the ten HEIC files hold;
// this covers what they cannot (fixtures/images/expected.json says which is which).

import { crc32, deflateSync } from 'node:zlib';

export type Bytes = Uint8Array;

export const u8 = (...values: number[]): number[] => values;
export const u16 = (value: number): number[] => [(value >> 8) & 0xff, value & 0xff];
export const u32 = (value: number): number[] => [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
export const u32le = (value: number): number[] => [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
export const text = (value: string): number[] => [...value].map((char) => char.charCodeAt(0));

export function cat(...parts: (Bytes | readonly number[])[]): Bytes {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

export function box(type: string, ...payload: (Bytes | readonly number[])[]): Bytes {
  const body = cat(...payload);
  return cat(u32(8 + body.length), text(type), body);
}

export function fullBox(type: string, version: number, flags: number, ...payload: (Bytes | readonly number[])[]): Bytes {
  return box(type, [version, (flags >> 16) & 0xff, (flags >> 8) & 0xff, flags & 0xff], ...payload);
}

// --- HEIF properties ---------------------------------------------------------------------------

export const ispe = (width: number, height: number): Bytes => fullBox('ispe', 0, 0, u32(width), u32(height));
/** quarter turns anticlockwise: 1 is 90, 2 is 180, 3 is 270. */
export const irot = (quarterTurns: number): Bytes => box('irot', [quarterTurns]);
export const imir = (axis: number): Bytes => box('imir', [axis]);
export const clap = (width: number, height: number, xOffset = 0, yOffset = 0): Bytes =>
  box('clap', u32(width), u32(1), u32(height), u32(1), u32(xOffset), u32(1), u32(yOffset), u32(1));
export const colrNclx = (primaries: number): Bytes => box('colr', text('nclx'), u16(primaries), u16(13), u16(6), [0x80]);
export const colrIcc = (icc: Bytes): Bytes => box('colr', text('prof'), icc);
export const auxC = (urn: string): Bytes => fullBox('auxC', 0, 0, text(urn), [0]);
export const pixi = (): Bytes => fullBox('pixi', 0, 0, [3, 8, 8, 8]);

export interface HeifItemSpec {
  id: number;
  type: string;
  hidden?: boolean;
  /** For type 'mime'. */
  contentType?: string;
}

export interface HeifSpec {
  major: string;
  compatible: string[];
  /** pitm item id; null leaves the box out. */
  primary: number | null;
  pitmVersion?: 0 | 1;
  /** 2 uses 16-bit item ids, 3 uses 32-bit ids. */
  infeVersion?: 2 | 3;
  items: HeifItemSpec[];
  /** ipco children in order. */
  properties: Bytes[];
  /** item id -> 1-based property indexes, in association order. */
  associations: Record<number, number[]>;
  /** ipma version and flags (flags 1 means 15-bit property indexes). */
  ipma?: { version: 0 | 1; flags: 0 | 1 };
  refs?: { type: string; from: number; to: number[] }[];
  irefVersion?: 0 | 1;
  /** Items stored in mdat (iloc construction method 0), by id. */
  data?: Record<number, Bytes>;
  ilocVersion?: 0 | 1 | 2;
  /** Put meta after mdat, like the Samsung file. */
  metaAfterMdat?: boolean;
}

function infe(item: HeifItemSpec, version: 2 | 3): Bytes {
  const id = version === 2 ? u16(item.id) : u32(item.id);
  const tail = item.type === 'mime' ? [...text(item.contentType ?? ''), 0] : [];
  return fullBox('infe', version, item.hidden ? 1 : 0, id, u16(0), text(item.type), [0], tail);
}

function metaBox(spec: HeifSpec, mdatStart: number): Bytes {
  const infeVersion = spec.infeVersion ?? 2;
  const ilocVersion = spec.ilocVersion ?? 1;
  const ilocId = ilocVersion < 2 ? u16 : u32;
  const children: Bytes[] = [fullBox('hdlr', 0, 0, u32(0), text('pict'), u32(0), u32(0), u32(0), [0])];
  if (spec.primary !== null) {
    children.push(spec.pitmVersion === 1 ? fullBox('pitm', 1, 0, u32(spec.primary)) : fullBox('pitm', 0, 0, u16(spec.primary)));
  }
  children.push(fullBox('iinf', 0, 0, u16(spec.items.length), ...spec.items.map((item) => infe(item, infeVersion))));
  // iloc: 4-byte offsets and lengths, no base offset, one extent per stored item.
  let offset = mdatStart + 8;
  const entries: Bytes[] = [];
  for (const [key, bytes] of Object.entries(spec.data ?? {})) {
    const id = Number(key);
    entries.push(cat(ilocId(id), ilocVersion >= 1 ? u16(0) : [], u16(0), u16(1), u32(offset), u32(bytes.length)));
    offset += bytes.length;
  }
  children.push(fullBox('iloc', ilocVersion, 0, [0x44, 0x00], ilocVersion === 2 ? u32(entries.length) : u16(entries.length), ...entries));
  if (spec.refs?.length) {
    const irefVersion = spec.irefVersion ?? 0;
    const id = irefVersion === 0 ? u16 : u32;
    children.push(fullBox('iref', irefVersion, 0, ...spec.refs.map((ref) => box(ref.type, id(ref.from), u16(ref.to.length), ...ref.to.map((value) => id(value))))));
  }
  const ipma = spec.ipma ?? { version: 0, flags: 0 };
  const associations = Object.entries(spec.associations).map(([key, indexes]) => {
    const id = ipma.version === 0 ? u16(Number(key)) : u32(Number(key));
    const list = indexes.map((index) => (ipma.flags === 1 ? u16(index) : [index]));
    return cat(id, [indexes.length], ...list);
  });
  children.push(box('iprp', box('ipco', ...spec.properties), fullBox('ipma', ipma.version, ipma.flags, u32(associations.length), ...associations)));
  return fullBox('meta', 0, 0, ...children);
}

export function buildHeif(spec: HeifSpec): Bytes {
  const ftyp = box('ftyp', text(spec.major), u32(0), ...spec.compatible.map((brand) => text(brand)));
  const payload = cat(...Object.values(spec.data ?? {}));
  const mdat = box('mdat', payload);
  const metaLength = metaBox(spec, 0).length;
  if (spec.metaAfterMdat) return cat(ftyp, mdat, metaBox(spec, ftyp.length));
  return cat(ftyp, metaBox(spec, ftyp.length + metaLength), mdat);
}

/** A plain image item with an ispe, the common case of the tests. */
export function simpleHeif(overrides: Partial<HeifSpec> & { width: number; height: number; type?: string; transforms?: Bytes[] }): Bytes {
  const { width, height, type = 'hvc1', transforms = [], ...rest } = overrides;
  return buildHeif({
    major: 'heic',
    compatible: ['mif1', 'heic'],
    primary: 1,
    items: [{ id: 1, type }],
    properties: [ispe(width, height), ...transforms],
    associations: { 1: [1, ...transforms.map((_, index) => index + 2)] },
    data: { 1: new Uint8Array(40).fill(7) },
    ...rest,
  });
}

// --- other formats -----------------------------------------------------------------------------

export function pngChunk(type: string, data: readonly number[] | Bytes): Bytes {
  const body = cat(text(type), data);
  return cat(u32(data.length), body, u32(crc32(body)));
}

/** A real, tiny RGBA PNG (width × height, every pixel the same), with extra chunks if asked. */
export function tinyPng(width = 2, height = 2, rgba: [number, number, number, number] = [200, 30, 30, 255], extra: Bytes[] = []): Bytes {
  const rows: number[] = [];
  for (let y = 0; y < height; y += 1) {
    rows.push(0);
    for (let x = 0; x < width; x += 1) rows.push(...rgba);
  }
  return cat([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], pngChunk('IHDR', cat(u32(width), u32(height), [8, 6, 0, 0, 0])), ...extra, pngChunk('IDAT', deflateSync(Uint8Array.from(rows))), pngChunk('IEND', []));
}

/** A JPEG skeleton the parsers accept: SOI, optional segments, SOF0, SOS with entropy data, EOI. */
export function jpegShell(width: number, height: number, options: { segments?: Bytes[]; scan?: number[]; eoi?: boolean; trailing?: number[] } = {}): Bytes {
  const { segments = [], scan = [0x12, 0x34, 0xff, 0x00, 0x56], eoi = true, trailing = [] } = options;
  const sof = cat([0xff, 0xc0], u16(17), [8], u16(height), u16(width), [3, 1, 0x22, 0, 2, 0x11, 0, 3, 0x11, 0]);
  const sos = cat([0xff, 0xda], u16(12), [3, 1, 0, 2, 0x11, 3, 0x11, 0, 63, 0]);
  return cat([0xff, 0xd8], ...segments, sof, sos, scan, eoi ? [0xff, 0xd9] : [], trailing);
}

export function app1Exif(orientation: number): Bytes {
  const body = cat(text('Exif'), [0, 0], text('MM'), u16(42), u32(8), u16(1), u16(0x0112), u16(3), u32(1), u16(orientation), u16(0), u32(0));
  return cat([0xff, 0xe1], u16(body.length + 2), body);
}

export function riff(chunks: Bytes[], declaredSize?: number): Bytes {
  const body = cat(text('WEBP'), ...chunks);
  return cat(text('RIFF'), u32le(declaredSize ?? body.length), body);
}

export function riffChunk(type: string, data: readonly number[] | Bytes): Bytes {
  return cat(text(type), u32le(data.length), data, data.length % 2 ? [0] : []);
}
