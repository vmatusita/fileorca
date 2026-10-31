// ISO-BMFF (HEIF/HEIC/AVIF) reader for the tests, independent of the engine's own container parser:
// ftyp brands, the items (primary, Exif, XMP), the properties that size and turn the primary image
// (ispe, irot, imir, clap, colr), and the references that tell the real photo from thumbnails, HDR
// gain maps, depth maps and grid tiles. Written against the box layouts of ISO/IEC 14496-12 and 23008-12.
//
// Orientation here is the CONTAINER's: irot/imir/clap. The Exif Orientation tag inside the Exif item
// is a second, redundant statement (heic-05 and heic-09 carry both) and must not be applied on top.

export interface Box {
  type: string;
  /** Offset of the first byte of the box (its size field). */
  start: number;
  end: number;
  /** Offset of the first byte of the payload (after size, type, and the uuid extended type if any). */
  body: number;
}

function boxesIn(bytes: Uint8Array, from: number, to: number): Box[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out: Box[] = [];
  let at = from;
  while (at + 8 <= to) {
    let size = view.getUint32(at);
    const type = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
    let header = 8;
    if (size === 1) {
      size = Number(view.getBigUint64(at + 8));
      header = 16;
    } else if (size === 0) {
      size = to - at;
    }
    if (type === 'uuid') header += 16;
    if (size < header || at + size > to) throw new Error(`box ${type} at ${at} has size ${size}`);
    out.push({ type, start: at, end: at + size, body: at + header });
    at += size;
  }
  return out;
}

export type Property =
  | { type: 'ispe'; width: number; height: number }
  | { type: 'irot'; anticlockwiseDegrees: number }
  | { type: 'imir'; axis: number }
  | { type: 'clap'; width: number; height: number }
  | { type: 'colr'; colorType: string; iccBytes: number; displayP3: boolean }
  | { type: 'auxC'; auxType: string }
  | { type: string };

export interface Item {
  id: number;
  /** Item type: hvc1, grid, av01, Exif, mime, ... */
  type: string;
  name: string;
  /** For mime items. */
  contentType: string;
  /** The hidden flag of the infe box: tiles, thumbnails and gain maps are hidden. */
  hidden: boolean;
  /** 0 file offset, 1 idat, 2 item offset. */
  constructionMethod: number;
  extents: { offset: number; length: number }[];
  /** In the order of the ipma association, which is the order transformations apply. */
  properties: Property[];
}

export interface Reference {
  type: string;
  from: number;
  to: number[];
}

export interface Bmff {
  majorBrand: string;
  minorVersion: number;
  compatibleBrands: string[];
  topLevelBoxes: string[];
  /** The meta box comes before the media data (false for the Samsung file, which has mdat first). */
  metaBeforeMdat: boolean;
  primaryItemId: number | null;
  items: Item[];
  references: Reference[];
  idat: Uint8Array | null;
}

const IMAGE_TYPES = ['hvc1', 'hev1', 'av01', 'avc1', 'grid', 'iden', 'iovl', 'jpeg', 'j2k1', 'unci'];

const ascii = (bytes: Uint8Array, from: number, to: number): string => String.fromCharCode(...bytes.subarray(from, to));
/** The text appears in the bytes as Latin-1 or as UTF-16BE (ICC v4 descriptions are UTF-16). */
function mentions(bytes: Uint8Array, text: string): boolean {
  const latin = ascii(bytes, 0, bytes.length);
  const wide = latin.replaceAll('\u0000', '');
  return latin.includes(text) || wide.includes(text);
}
function cString(bytes: Uint8Array, at: number, limit: number): [string, number] {
  let end = at;
  while (end < limit && bytes[end] !== 0) end += 1;
  return [new TextDecoder().decode(bytes.subarray(at, end)), end + 1];
}

export function isBmff(bytes: Uint8Array): boolean {
  return bytes.length >= 12 && ascii(bytes, 4, 8) === 'ftyp';
}

export function parseBmff(bytes: Uint8Array): Bmff {
  if (!isBmff(bytes)) throw new Error('not an ISO-BMFF file (no ftyp box)');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const top = boxesIn(bytes, 0, bytes.length);
  const ftyp = top[0] as Box;
  const compatibleBrands: string[] = [];
  for (let at = ftyp.body + 8; at + 4 <= ftyp.end; at += 4) compatibleBrands.push(ascii(bytes, at, at + 4));
  const meta = top.find((box) => box.type === 'meta');
  if (!meta) throw new Error('no meta box');
  const mdat = top.find((box) => box.type === 'mdat');
  const kids = boxesIn(bytes, meta.body + 4, meta.end); // meta is a FullBox

  let primaryItemId: number | null = null;
  const pitm = kids.find((box) => box.type === 'pitm');
  if (pitm) primaryItemId = view.getUint8(pitm.body) === 0 ? view.getUint16(pitm.body + 4) : view.getUint32(pitm.body + 4);

  const items = new Map<number, Item>();
  const iinf = kids.find((box) => box.type === 'iinf');
  if (iinf) {
    const version = view.getUint8(iinf.body);
    for (const infe of boxesIn(bytes, iinf.body + (version === 0 ? 6 : 8), iinf.end)) {
      if (infe.type !== 'infe') continue;
      const v = view.getUint8(infe.body);
      const flags = view.getUint32(infe.body) & 0xffffff;
      if (v < 2) continue; // v0/v1 carry no item_type: nothing in this repo's files, nothing to classify
      const idSize = v === 2 ? 2 : 4;
      const id = v === 2 ? view.getUint16(infe.body + 4) : view.getUint32(infe.body + 4);
      const type = ascii(bytes, infe.body + 4 + idSize + 2, infe.body + 4 + idSize + 6);
      const [name, afterName] = cString(bytes, infe.body + 4 + idSize + 6, infe.end);
      const contentType = type === 'mime' ? cString(bytes, afterName, infe.end)[0] : '';
      items.set(id, { id, type, name, contentType, hidden: (flags & 1) !== 0, constructionMethod: 0, extents: [], properties: [] });
    }
  }

  const iloc = kids.find((box) => box.type === 'iloc');
  if (iloc) {
    const version = view.getUint8(iloc.body);
    const sizes = view.getUint8(iloc.body + 4);
    const more = view.getUint8(iloc.body + 5);
    const offsetSize = sizes >> 4;
    const lengthSize = sizes & 15;
    const baseSize = more >> 4;
    const indexSize = version > 0 ? more & 15 : 0;
    const read = (at: number, size: number): number => (size === 0 ? 0 : size === 2 ? view.getUint16(at) : size === 4 ? view.getUint32(at) : Number(view.getBigUint64(at)));
    let at = iloc.body + 6;
    const count = version < 2 ? view.getUint16(at) : view.getUint32(at);
    at += version < 2 ? 2 : 4;
    for (let n = 0; n < count; n += 1) {
      const id = version < 2 ? view.getUint16(at) : view.getUint32(at);
      at += version < 2 ? 2 : 4;
      let method = 0;
      if (version > 0) {
        method = view.getUint16(at) & 15;
        at += 2;
      }
      at += 2; // data_reference_index
      const base = read(at, baseSize);
      at += baseSize;
      const extentCount = view.getUint16(at);
      at += 2;
      const extents: { offset: number; length: number }[] = [];
      for (let e = 0; e < extentCount; e += 1) {
        at += indexSize;
        const offset = read(at, offsetSize);
        at += offsetSize;
        const length = read(at, lengthSize);
        at += lengthSize;
        extents.push({ offset: base + offset, length });
      }
      const item = items.get(id);
      if (item) {
        item.constructionMethod = method;
        item.extents = extents;
      }
    }
  }

  const references: Reference[] = [];
  const iref = kids.find((box) => box.type === 'iref');
  if (iref) {
    const version = view.getUint8(iref.body);
    for (const ref of boxesIn(bytes, iref.body + 4, iref.end)) {
      let at = ref.body;
      const from = version === 0 ? view.getUint16(at) : view.getUint32(at);
      at += version === 0 ? 2 : 4;
      const count = view.getUint16(at);
      at += 2;
      const to: number[] = [];
      for (let n = 0; n < count; n += 1) {
        to.push(version === 0 ? view.getUint16(at) : view.getUint32(at));
        at += version === 0 ? 2 : 4;
      }
      references.push({ type: ref.type, from, to });
    }
  }

  const iprp = kids.find((box) => box.type === 'iprp');
  if (iprp) {
    const inside = boxesIn(bytes, iprp.body, iprp.end);
    const ipco = inside.find((box) => box.type === 'ipco');
    const properties: Property[] = ipco ? boxesIn(bytes, ipco.body, ipco.end).map((box) => parseProperty(bytes, view, box)) : [];
    for (const ipma of inside.filter((box) => box.type === 'ipma')) {
      const version = view.getUint8(ipma.body);
      const wide = (view.getUint32(ipma.body) & 1) === 1;
      let at = ipma.body + 4;
      const entries = view.getUint32(at);
      at += 4;
      for (let n = 0; n < entries; n += 1) {
        const id = version < 1 ? view.getUint16(at) : view.getUint32(at);
        at += version < 1 ? 2 : 4;
        const associations = view.getUint8(at);
        at += 1;
        for (let a = 0; a < associations; a += 1) {
          const index = wide ? view.getUint16(at) & 0x7fff : view.getUint8(at) & 0x7f;
          at += wide ? 2 : 1;
          const property = properties[index - 1];
          if (index > 0 && property) items.get(id)?.properties.push(property);
        }
      }
    }
  }

  const idatBox = kids.find((box) => box.type === 'idat');
  return {
    majorBrand: ascii(bytes, ftyp.body, ftyp.body + 4),
    minorVersion: view.getUint32(ftyp.body + 4),
    compatibleBrands,
    topLevelBoxes: top.map((box) => box.type),
    metaBeforeMdat: !mdat || meta.start < mdat.start,
    primaryItemId,
    items: [...items.values()],
    references,
    idat: idatBox ? bytes.subarray(idatBox.body, idatBox.end) : null,
  };
}

function parseProperty(bytes: Uint8Array, view: DataView, box: Box): Property {
  switch (box.type) {
    case 'ispe':
      return { type: 'ispe', width: view.getUint32(box.body + 4), height: view.getUint32(box.body + 8) };
    case 'irot':
      return { type: 'irot', anticlockwiseDegrees: (view.getUint8(box.body) & 3) * 90 };
    case 'imir':
      return { type: 'imir', axis: view.getUint8(box.body) & 1 };
    case 'clap': {
      const part = (n: number, d: number): number => view.getUint32(box.body + d) === 0 ? 0 : Math.round(view.getUint32(box.body + n) / view.getUint32(box.body + d));
      return { type: 'clap', width: part(0, 4), height: part(8, 12) };
    }
    case 'colr': {
      const colorType = ascii(bytes, box.body, box.body + 4);
      const profile = colorType === 'nclx' ? new Uint8Array(0) : bytes.subarray(box.body + 4, box.end);
      return { type: 'colr', colorType, iccBytes: profile.length, displayP3: mentions(profile, 'Display P3') };
    }
    case 'auxC':
      return { type: 'auxC', auxType: cString(bytes, box.body + 4, box.end)[0] };
    default:
      return { type: box.type };
  }
}

/** The payload of an item: its extents read from the file (method 0) or from idat (method 1). */
export function itemBytes(bytes: Uint8Array, bmff: Bmff, item: Item): Uint8Array {
  const source = item.constructionMethod === 1 ? bmff.idat : bytes;
  if (!source) throw new Error(`item ${item.id} lives in idat, which the file does not have`);
  const parts = item.extents.map((extent) => source.subarray(extent.offset, extent.offset + extent.length));
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

/** Exif items as bare TIFF blocks (the 4-byte exif_tiff_header_offset and what it skips are removed). */
export function exifItems(bytes: Uint8Array, bmff: Bmff = parseBmff(bytes)): { id: number; tiff: Uint8Array }[] {
  return bmff.items
    .filter((item) => item.type === 'Exif')
    .map((item) => {
      const payload = itemBytes(bytes, bmff, item);
      const skip = new DataView(payload.buffer, payload.byteOffset, payload.byteLength).getUint32(0);
      return { id: item.id, tiff: payload.subarray(4 + skip) };
    });
}

/** XMP packets (mime items of type application/rdf+xml) as text. */
export function xmpItems(bytes: Uint8Array, bmff: Bmff = parseBmff(bytes)): { id: number; xml: string }[] {
  return bmff.items
    .filter((item) => item.type === 'mime' && item.contentType.includes('rdf+xml'))
    .map((item) => ({ id: item.id, xml: new TextDecoder().decode(itemBytes(bytes, bmff, item)) }));
}

/**
 * Photos in the file: image items that are not hidden and are neither a thumbnail, an auxiliary image
 * (HDR gain map, depth, alpha plane) nor a grid tile. heic-10 has two (the stereo pair), the others one.
 */
export function topLevelImages(bmff: Bmff): Item[] {
  const tiles = new Set(bmff.references.filter((ref) => ref.type === 'dimg').flatMap((ref) => ref.to));
  const secondary = new Set(bmff.references.filter((ref) => ref.type === 'thmb' || ref.type === 'auxl').map((ref) => ref.from));
  return bmff.items.filter((item) => IMAGE_TYPES.includes(item.type) && !item.hidden && !tiles.has(item.id) && !secondary.has(item.id));
}

export function thumbnailIds(bmff: Bmff): number[] {
  return bmff.references.filter((ref) => ref.type === 'thmb').map((ref) => ref.from);
}

export function auxiliaryIds(bmff: Bmff): number[] {
  return bmff.references.filter((ref) => ref.type === 'auxl').map((ref) => ref.from);
}

export interface PrimaryImage {
  id: number;
  type: string;
  /** ispe: the pixels before any transformation. */
  ispe: [number, number];
  /** The irot property in degrees anticlockwise, null when the item has none. */
  irot: number | null;
  imir: number | null;
  /** Size on screen: ispe, then the transformative properties in association order. */
  displayWidth: number;
  displayHeight: number;
  displayP3: boolean;
}

export function primaryImage(bmff: Bmff): PrimaryImage {
  const item = bmff.items.find((candidate) => candidate.id === bmff.primaryItemId);
  if (!item) throw new Error('the primary item is not in iinf');
  const ispe = item.properties.find((property): property is Extract<Property, { type: 'ispe' }> => property.type === 'ispe');
  if (!ispe) throw new Error('the primary item has no ispe');
  let width = ispe.width;
  let height = ispe.height;
  let irot: number | null = null;
  let imir: number | null = null;
  for (const property of item.properties) {
    if (property.type === 'irot' && 'anticlockwiseDegrees' in property) {
      irot = property.anticlockwiseDegrees;
      if (irot % 180 !== 0) [width, height] = [height, width];
    } else if (property.type === 'imir' && 'axis' in property) {
      imir = property.axis;
    } else if (property.type === 'clap' && 'width' in property) {
      width = property.width;
      height = property.height;
    }
  }
  const colr = item.properties.find((property): property is Extract<Property, { type: 'colr' }> => property.type === 'colr');
  return { id: item.id, type: item.type, ispe: [ispe.width, ispe.height], irot, imir, displayWidth: width, displayHeight: height, displayP3: colr?.displayP3 ?? false };
}
