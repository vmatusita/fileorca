// A small ISO-BMFF / HEIF reader: enough to tell HEIC from AVIF, to know the display size of the
// primary image (ispe + irot/imir/clap) without decoding it, to find the Exif item and the colour
// profile, and to check that every byte the container points at is in the file.
//
// Why our own: libheif-js lists top-level images in item-id order and has no handle on colour or
// truncation, and the Safari decoder gives no way to tell a rotation applied twice (DECISOES § 7,
// the heic-05 and heic-09 trap). Boxes can come in any order (heic-09 has meta after mdat).
// Self-contained: nothing here imports from outside src/engine/image/.

export interface Box {
  type: string;
  /** Offset of the first byte of the box. */
  start: number;
  /** Offset of the first byte after the header (size, type, optional 64-bit size, optional uuid). */
  payload: number;
  /** Declared end; larger than the file when the file is cut. */
  end: number;
}

const ascii = (bytes: Uint8Array, from: number, to: number): string => {
  let text = '';
  for (let i = from; i < to && i < bytes.length; i += 1) text += String.fromCharCode(bytes[i] ?? 0);
  return text;
};

const u8 = (bytes: Uint8Array, at: number): number => bytes[at] ?? 0;
const u16 = (bytes: Uint8Array, at: number): number => (u8(bytes, at) << 8) | u8(bytes, at + 1);
const u32 = (bytes: Uint8Array, at: number): number => u16(bytes, at) * 0x10000 + u16(bytes, at + 2);

/** Big-endian unsigned integer of 0 to 8 bytes (a Number is exact up to 2^53, far beyond any file). */
function uint(bytes: Uint8Array, at: number, size: number): number {
  let value = 0;
  for (let i = 0; i < size; i += 1) value = value * 256 + u8(bytes, at + i);
  return value;
}

/** Boxes laid end to end between `from` and `to`; stops at the first malformed header. */
export function readBoxes(bytes: Uint8Array, from: number, to: number): Box[] {
  const boxes: Box[] = [];
  let at = from;
  while (at + 8 <= to) {
    let size = u32(bytes, at);
    const type = ascii(bytes, at + 4, at + 8);
    let header = 8;
    if (size === 1) {
      size = uint(bytes, at + 8, 8);
      header = 16;
    } else if (size === 0) {
      size = to - at; // runs to the end of the container
    }
    if (type === 'uuid') header += 16;
    if (size < header) break;
    boxes.push({ type, start: at, payload: at + header, end: at + size });
    at += size;
  }
  return boxes;
}

export interface Item {
  id: number;
  type: string;
  /** infe flag bit 0: not meant to be shown on its own (grid tiles). */
  hidden: boolean;
  /** For `mime` items (XMP is application/rdf+xml). */
  contentType: string;
}

export interface ItemLocation {
  id: number;
  /** 0: offsets are in the file; 1: in the idat box; 2: in another item. */
  method: number;
  /** Absolute file ranges (method 0), or ranges inside idat (method 1). */
  extents: { offset: number; length: number }[];
}

export interface Ref {
  type: string;
  from: number;
  to: number[];
}

export type Transform =
  /** Crop to a width × height (clean aperture). */
  | { kind: 'clap'; width: number; height: number; xOffset: number; yOffset: number }
  /** Rotation, in degrees ANTICLOCKWISE. */
  | { kind: 'irot'; degrees: 0 | 90 | 180 | 270 }
  /** Mirror: axis 0 is a vertical axis (left and right swap), axis 1 a horizontal axis (top and bottom swap). */
  | { kind: 'imir'; axis: 0 | 1 };

export type Colour =
  | { kind: 'nclx'; primaries: number; transfer: number; matrix: number; fullRange: boolean }
  | { kind: 'icc'; icc: Uint8Array };

type Property =
  | { type: 'ispe'; width: number; height: number }
  | { type: 'transform'; transform: Transform }
  | { type: 'colr'; colour: Colour | null }
  | { type: 'auxC'; urn: string }
  | { type: 'other' };

interface Association {
  index: number;
  essential: boolean;
}

export interface Heif {
  majorBrand: string;
  compatibleBrands: string[];
  primaryId: number | null;
  items: Map<number, Item>;
  locations: Map<number, ItemLocation>;
  refs: Ref[];
  /** ipco children in file order; property index n is properties[n - 1]. */
  properties: Property[];
  associations: Map<number, Association[]>;
  /** The idat box payload range, when there is one. */
  idat: { start: number; end: number } | null;
  hasMeta: boolean;
  /** A meta or mdat box declares more bytes than the file has: the file was cut. */
  cut: boolean;
  /** The highest byte any file-offset extent of the iloc box reaches. */
  extentsEnd: number;
}

function cstring(bytes: Uint8Array, at: number, end: number): { text: string; next: number } {
  let i = at;
  while (i < end && u8(bytes, i) !== 0) i += 1;
  return { text: ascii(bytes, at, i), next: i + 1 };
}

function parseInfe(bytes: Uint8Array, box: Box, end: number): Item | null {
  const version = u8(bytes, box.payload);
  const flags = uint(bytes, box.payload + 1, 3);
  let at = box.payload + 4;
  if (version < 2) return null; // v0 and v1 carry no item type: not a HEIF image item
  let id: number;
  if (version === 2) {
    id = u16(bytes, at);
    at += 2;
  } else {
    id = u32(bytes, at);
    at += 4;
  }
  at += 2; // item_protection_index
  const type = ascii(bytes, at, at + 4);
  at += 4;
  const name = cstring(bytes, at, end);
  const contentType = type === 'mime' ? cstring(bytes, name.next, end).text : '';
  return { id, type, hidden: (flags & 1) === 1, contentType };
}

function parseIloc(bytes: Uint8Array, box: Box, heif: Heif): void {
  const version = u8(bytes, box.payload);
  let at = box.payload + 4;
  const sizes = u8(bytes, at);
  const offsetSize = sizes >> 4;
  const lengthSize = sizes & 15;
  const more = u8(bytes, at + 1);
  const baseOffsetSize = more >> 4;
  const indexSize = version === 1 || version === 2 ? more & 15 : 0;
  at += 2;
  const count = version < 2 ? u16(bytes, at) : u32(bytes, at);
  at += version < 2 ? 2 : 4;
  const end = Math.min(box.end, bytes.length);
  for (let n = 0; n < count && at < end; n += 1) {
    let id: number;
    if (version < 2) {
      id = u16(bytes, at);
      at += 2;
    } else {
      id = u32(bytes, at);
      at += 4;
    }
    let method = 0;
    if (version === 1 || version === 2) {
      method = u16(bytes, at) & 15;
      at += 2;
    }
    at += 2; // data_reference_index
    const baseOffset = uint(bytes, at, baseOffsetSize);
    at += baseOffsetSize;
    const extentCount = u16(bytes, at);
    at += 2;
    const extents: ItemLocation['extents'] = [];
    for (let e = 0; e < extentCount && at < end; e += 1) {
      at += indexSize;
      const offset = uint(bytes, at, offsetSize);
      at += offsetSize;
      const length = uint(bytes, at, lengthSize);
      at += lengthSize;
      extents.push({ offset: baseOffset + offset, length });
      if (method === 0 && length > 0) heif.extentsEnd = Math.max(heif.extentsEnd, baseOffset + offset + length);
    }
    heif.locations.set(id, { id, method, extents });
  }
}

function parseIref(bytes: Uint8Array, box: Box, heif: Heif): void {
  const version = u8(bytes, box.payload);
  const idSize = version === 0 ? 2 : 4;
  for (const child of readBoxes(bytes, box.payload + 4, Math.min(box.end, bytes.length))) {
    let at = child.payload;
    const from = uint(bytes, at, idSize);
    at += idSize;
    const count = u16(bytes, at);
    at += 2;
    const to: number[] = [];
    for (let i = 0; i < count && at + idSize <= child.end; i += 1) {
      to.push(uint(bytes, at, idSize));
      at += idSize;
    }
    heif.refs.push({ type: child.type, from, to });
  }
}

function parseProperty(bytes: Uint8Array, box: Box): Property {
  const end = Math.min(box.end, bytes.length);
  switch (box.type) {
    case 'ispe':
      return { type: 'ispe', width: u32(bytes, box.payload + 4), height: u32(bytes, box.payload + 8) };
    case 'irot':
      return { type: 'transform', transform: { kind: 'irot', degrees: ((u8(bytes, box.payload) & 3) * 90) as 0 | 90 | 180 | 270 } };
    case 'imir':
      return { type: 'transform', transform: { kind: 'imir', axis: (u8(bytes, box.payload) & 1) as 0 | 1 } };
    case 'clap': {
      // Eight 32-bit fields: width, height, horizontal and vertical offset, each a numerator and a
      // denominator. Only the offset numerators are signed.
      const d = (n: number) => u32(bytes, box.payload + n * 4);
      const signed = (n: number) => (d(n) > 0x7fffffff ? d(n) - 0x100000000 : d(n));
      const ratio = (num: number, den: number) => (den === 0 ? 0 : Math.round(num / den));
      return {
        type: 'transform',
        transform: { kind: 'clap', width: ratio(d(0), d(1)), height: ratio(d(2), d(3)), xOffset: ratio(signed(4), d(5)), yOffset: ratio(signed(6), d(7)) },
      };
    }
    case 'colr': {
      const kind = ascii(bytes, box.payload, box.payload + 4);
      if (kind === 'nclx') {
        const at = box.payload + 4;
        return { type: 'colr', colour: { kind: 'nclx', primaries: u16(bytes, at), transfer: u16(bytes, at + 2), matrix: u16(bytes, at + 4), fullRange: (u8(bytes, at + 6) & 0x80) !== 0 } };
      }
      if (kind === 'rICC' || kind === 'prof') return { type: 'colr', colour: { kind: 'icc', icc: bytes.slice(box.payload + 4, end) } };
      return { type: 'colr', colour: null };
    }
    case 'auxC':
      return { type: 'auxC', urn: cstring(bytes, box.payload + 4, end).text };
    default:
      return { type: 'other' };
  }
}

function parseIprp(bytes: Uint8Array, box: Box, heif: Heif): void {
  const end = Math.min(box.end, bytes.length);
  for (const child of readBoxes(bytes, box.payload, end)) {
    if (child.type === 'ipco') {
      for (const property of readBoxes(bytes, child.payload, Math.min(child.end, bytes.length))) heif.properties.push(parseProperty(bytes, property));
    } else if (child.type === 'ipma') {
      const version = u8(bytes, child.payload);
      const flags = uint(bytes, child.payload + 1, 3);
      let at = child.payload + 4;
      const count = u32(bytes, at);
      at += 4;
      const limit = Math.min(child.end, bytes.length);
      for (let n = 0; n < count && at < limit; n += 1) {
        let id: number;
        if (version < 1) {
          id = u16(bytes, at);
          at += 2;
        } else {
          id = u32(bytes, at);
          at += 4;
        }
        const associations = u8(bytes, at);
        at += 1;
        const list: Association[] = heif.associations.get(id) ?? [];
        for (let a = 0; a < associations; a += 1) {
          if ((flags & 1) === 1) {
            const value = u16(bytes, at);
            at += 2;
            list.push({ essential: (value & 0x8000) !== 0, index: value & 0x7fff });
          } else {
            const value = u8(bytes, at);
            at += 1;
            list.push({ essential: (value & 0x80) !== 0, index: value & 0x7f });
          }
        }
        heif.associations.set(id, list);
      }
    }
  }
}

function parseMeta(bytes: Uint8Array, meta: Box, heif: Heif): void {
  heif.hasMeta = true;
  const end = Math.min(meta.end, bytes.length);
  for (const box of readBoxes(bytes, meta.payload + 4, end)) {
    switch (box.type) {
      case 'pitm': {
        const version = u8(bytes, box.payload);
        heif.primaryId = version === 0 ? u16(bytes, box.payload + 4) : u32(bytes, box.payload + 4);
        break;
      }
      case 'iinf': {
        const version = u8(bytes, box.payload);
        const first = box.payload + 4 + (version === 0 ? 2 : 4);
        for (const infe of readBoxes(bytes, first, Math.min(box.end, bytes.length))) {
          if (infe.type !== 'infe') continue;
          const item = parseInfe(bytes, infe, Math.min(infe.end, bytes.length));
          if (item) heif.items.set(item.id, item);
        }
        break;
      }
      case 'iloc':
        parseIloc(bytes, box, heif);
        break;
      case 'iref':
        parseIref(bytes, box, heif);
        break;
      case 'iprp':
        parseIprp(bytes, box, heif);
        break;
      case 'idat':
        heif.idat = { start: box.payload, end: Math.min(box.end, bytes.length) };
        break;
      default:
        break;
    }
  }
}

/** Parses the container; null when the bytes do not start with an ftyp box. */
export function parseHeif(bytes: Uint8Array): Heif | null {
  const top = readBoxes(bytes, 0, bytes.length);
  const ftyp = top[0];
  if (!ftyp || ftyp.type !== 'ftyp') return null;
  const ftypEnd = Math.min(ftyp.end, bytes.length);
  const compatibleBrands: string[] = [];
  for (let at = ftyp.payload + 8; at + 4 <= ftypEnd; at += 4) compatibleBrands.push(ascii(bytes, at, at + 4));
  const heif: Heif = {
    majorBrand: ascii(bytes, ftyp.payload, ftyp.payload + 4),
    compatibleBrands,
    primaryId: null,
    items: new Map(),
    locations: new Map(),
    refs: [],
    properties: [],
    associations: new Map(),
    idat: null,
    hasMeta: false,
    cut: false,
    extentsEnd: 0,
  };
  for (const box of top) {
    // Only meta and mdat decide truncation: other trailing boxes (Samsung's sefd) may be odd.
    if ((box.type === 'meta' || box.type === 'mdat') && box.end > bytes.length) heif.cut = true;
    if (box.type === 'meta') parseMeta(bytes, box, heif);
  }
  return heif;
}

const IMAGE_TYPES = new Set(['hvc1', 'hev1', 'av01', 'grid', 'iovl', 'iden', 'avc1', 'vvc1', 'j2k1', 'jpeg', 'mjpg']);

function refTargets(heif: Heif, type: string): Set<number> {
  const out = new Set<number>();
  for (const ref of heif.refs) if (ref.type === type) for (const id of ref.to) out.add(id);
  return out;
}

function refSources(heif: Heif, type: string): Set<number> {
  const out = new Set<number>();
  for (const ref of heif.refs) if (ref.type === type) out.add(ref.from);
  return out;
}

export interface DisplayInfo {
  id: number;
  type: string;
  /** ispe of the item. */
  storedWidth: number;
  storedHeight: number;
  /** Size on screen: ispe with the clap, irot and imir properties applied in association order. */
  width: number;
  height: number;
  /** The transformative properties, in association order. */
  transforms: Transform[];
}

function propertiesOf(heif: Heif, id: number): Property[] {
  const out: Property[] = [];
  for (const association of heif.associations.get(id) ?? []) {
    const property = heif.properties[association.index - 1];
    if (property) out.push(property);
  }
  return out;
}

/** Display size of one image item; null when it has no ispe. */
export function displayInfo(heif: Heif, id: number): DisplayInfo | null {
  const item = heif.items.get(id);
  if (!item) return null;
  const properties = propertiesOf(heif, id);
  const ispe = properties.find((property) => property.type === 'ispe');
  if (!ispe || ispe.type !== 'ispe') return null;
  let width = ispe.width;
  let height = ispe.height;
  const transforms: Transform[] = [];
  for (const property of properties) {
    if (property.type !== 'transform') continue;
    const transform = property.transform;
    transforms.push(transform);
    if (transform.kind === 'clap') {
      if (transform.width > 0) width = Math.min(width, transform.width);
      if (transform.height > 0) height = Math.min(height, transform.height);
    } else if (transform.kind === 'irot' && (transform.degrees === 90 || transform.degrees === 270)) {
      [width, height] = [height, width];
    }
  }
  return { id, type: item.type, storedWidth: ispe.width, storedHeight: ispe.height, width, height, transforms };
}

/** The primary item (pitm) with its display size; null when the container names none. */
export function primaryInfo(heif: Heif): DisplayInfo | null {
  return heif.primaryId === null ? null : displayInfo(heif, heif.primaryId);
}

/** Ids of the images a viewer would list: not grid tiles, thumbnails, auxiliary maps or hidden items. */
export function topLevelImages(heif: Heif): number[] {
  const tiles = refTargets(heif, 'dimg');
  const thumbnails = refSources(heif, 'thmb');
  const auxiliary = refSources(heif, 'auxl');
  const ids: number[] = [];
  for (const item of heif.items.values()) {
    if (!IMAGE_TYPES.has(item.type)) continue;
    if (tiles.has(item.id) || thumbnails.has(item.id) || auxiliary.has(item.id)) continue;
    if (item.hidden && item.id !== heif.primaryId) continue;
    ids.push(item.id);
  }
  return ids.sort((a, b) => a - b);
}

/** Absolute byte ranges of an item that sits in the file (iloc method 0). */
export function itemRanges(heif: Heif, id: number): { start: number; end: number }[] | null {
  const location = heif.locations.get(id);
  if (!location || location.method !== 0) return null;
  return location.extents.map((extent) => ({ start: extent.offset, end: extent.offset + extent.length }));
}

/** The Exif item that describes the primary image (a cdsc reference), or the first Exif item. */
export function exifItemId(heif: Heif): number | null {
  const exifIds = [...heif.items.values()].filter((item) => item.type === 'Exif').map((item) => item.id);
  for (const ref of heif.refs) {
    if (ref.type === 'cdsc' && exifIds.includes(ref.from) && heif.primaryId !== null && ref.to.includes(heif.primaryId)) return ref.from;
  }
  return exifIds[0] ?? null;
}

/** Exif Orientation (1 to 8) stored in an Exif item, or null. The engine NEVER applies this to a HEIC. */
export function exifItemOrientation(bytes: Uint8Array, heif: Heif): number | null {
  const id = exifItemId(heif);
  const range = id === null ? null : itemRanges(heif, id)?.[0];
  if (!range || range.end - range.start < 12) return null;
  const tiff = range.start + 4 + u32(bytes, range.start);
  const order = ascii(bytes, tiff, tiff + 2);
  if (order !== 'II' && order !== 'MM') return null;
  const little = order === 'II';
  const read16 = (at: number) => (little ? u8(bytes, at) | (u8(bytes, at + 1) << 8) : u16(bytes, at));
  const read32 = (at: number) => (little ? read16(at) + read16(at + 2) * 0x10000 : u32(bytes, at));
  const ifd = tiff + read32(tiff + 4);
  const count = read16(ifd);
  for (let i = 0; i < count && i < 512; i += 1) {
    const entry = ifd + 2 + i * 12;
    if (read16(entry) === 0x0112) {
      const value = read16(entry + 8);
      return value >= 1 && value <= 8 ? value : null;
    }
  }
  return null;
}

/** Colour of the primary image (its colr property, or the one of its first tile). */
export function primaryColour(heif: Heif): Colour | null {
  if (heif.primaryId === null) return null;
  const colourOf = (id: number): Colour | null => {
    for (const property of propertiesOf(heif, id)) if (property.type === 'colr' && property.colour) return property.colour;
    return null;
  };
  const own = colourOf(heif.primaryId);
  if (own) return own;
  const tile = heif.refs.find((ref) => ref.type === 'dimg' && ref.from === heif.primaryId)?.to[0];
  return tile === undefined ? null : colourOf(tile);
}

/** True when an auxiliary image carries the alpha channel (AVIF alpha plane, HEVC auxid:1). */
export function hasAlphaAuxiliary(heif: Heif): boolean {
  for (const id of refSources(heif, 'auxl')) {
    for (const property of propertiesOf(heif, id)) {
      if (property.type === 'auxC' && /alpha|auxid:1$/i.test(property.urn)) return true;
    }
  }
  return false;
}

/** 'avif' or 'heic' from the codec of the primary image (following a grid to its first tile). */
export function primaryCodec(heif: Heif): 'avif' | 'heic' | null {
  if (heif.primaryId === null) return null;
  let item = heif.items.get(heif.primaryId);
  if (item && (item.type === 'grid' || item.type === 'iovl')) {
    const first = heif.refs.find((ref) => ref.type === 'dimg' && ref.from === item?.id)?.to[0];
    item = first === undefined ? undefined : heif.items.get(first);
  }
  if (!item) return null;
  if (item.type === 'av01') return 'avif';
  if (item.type === 'hvc1' || item.type === 'hev1') return 'heic';
  return null;
}

// --- Display P3 -------------------------------------------------------------------------------

// Colorants of Apple's Display P3 profile, adapted to the D50 profile connection space.
const P3_D50: readonly (readonly [number, number, number])[] = [
  [0.5151, 0.2412, -0.0011],
  [0.292, 0.6922, 0.0419],
  [0.1571, 0.0666, 0.7841],
];

/** True when an ICC profile describes Display P3 (by its description text, else by its colorants). */
export function iccIsDisplayP3(icc: Uint8Array): boolean {
  if (icc.length < 132) return false;
  const count = Math.min(u32(icc, 128), 256);
  const tags = new Map<string, { offset: number; size: number }>();
  for (let i = 0; i < count; i += 1) {
    const at = 132 + i * 12;
    if (at + 12 > icc.length) break;
    tags.set(ascii(icc, at, at + 4), { offset: u32(icc, at + 4), size: u32(icc, at + 8) });
  }
  const desc = tags.get('desc');
  if (desc) {
    // ASCII 'desc' or UTF-16 'mluc': dropping the zero bytes leaves the plain letters either way.
    const text = ascii(icc, desc.offset, Math.min(desc.offset + desc.size, icc.length)).split('\0').join('');
    if (/display\s*p3/i.test(text)) return true;
  }
  return ['rXYZ', 'gXYZ', 'bXYZ'].every((signature, channel) => {
    const tag = tags.get(signature);
    const expected = P3_D50[channel];
    if (!tag || !expected || tag.offset + 20 > icc.length) return false;
    return expected.every((value, axis) => {
      const raw = u32(icc, tag.offset + 8 + axis * 4);
      const fixed = (raw > 0x7fffffff ? raw - 0x100000000 : raw) / 65536; // s15Fixed16
      return Math.abs(fixed - value) < 0.01;
    });
  });
}

/** Display P3: an ICC profile with those primaries, or nclx colour_primaries 12 (SMPTE EG 432-1). */
export function isDisplayP3(colour: Colour | null): boolean {
  if (!colour) return false;
  return colour.kind === 'nclx' ? colour.primaries === 12 : iccIsDisplayP3(colour.icc);
}
