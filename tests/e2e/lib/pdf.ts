// Small PDF reader for the tests: page count, MediaBox per page, the Info dictionary (hex and literal
// strings, UTF-16BE or Latin-1), the presence of XMP, and every image XObject with its raw stream.
// A DCTDecode stream is a whole JPEG file, so a test can run jpeg.ts on it (exif, XMP, GPS) and prove
// the PDF does not carry the location of the photo. Works on classic xref files (pdf-lib saved with
// useObjectStreams: false) and, through the object stream decoder, on the default compressed layout.
// It is not a general parser: no encryption, no incremental-update chains, no repair of broken files.
import { unzlibSync } from 'fflate';

type Obj =
  | { t: 'num'; v: number }
  | { t: 'name'; v: string }
  | { t: 'str'; v: string }
  | { t: 'ref'; n: number }
  | { t: 'dict'; v: Map<string, Obj> }
  | { t: 'arr'; v: Obj[] }
  | { t: 'bool'; v: boolean }
  | { t: 'null' };

const WHITESPACE = new Set([0, 9, 10, 12, 13, 32]);
const DELIMITERS = new Set(['(', ')', '<', '>', '[', ']', '{', '}', '/', '%']);

/** PDF text string: UTF-16BE or UTF-16LE with a BOM, UTF-8 with a BOM, else Latin-1 (close to PDFDocEncoding). */
function textOf(bytes: number[]): string {
  const [a, b, c] = bytes;
  if (a === 0xfe && b === 0xff) {
    let out = '';
    for (let i = 2; i + 1 < bytes.length; i += 2) out += String.fromCharCode(((bytes[i] as number) << 8) | (bytes[i + 1] as number));
    return out;
  }
  if (a === 0xff && b === 0xfe) {
    let out = '';
    for (let i = 2; i + 1 < bytes.length; i += 2) out += String.fromCharCode(((bytes[i + 1] as number) << 8) | (bytes[i] as number));
    return out;
  }
  if (a === 0xef && b === 0xbb && c === 0xbf) return new TextDecoder().decode(Uint8Array.from(bytes.slice(3)));
  return String.fromCharCode(...bytes);
}

class Parser {
  readonly s: string;
  i: number;

  constructor(s: string, i = 0) {
    this.s = s;
    this.i = i;
  }

  ws(): void {
    while (this.i < this.s.length) {
      const c = this.s.charCodeAt(this.i);
      if (WHITESPACE.has(c)) this.i += 1;
      else if (c === 0x25) {
        while (this.i < this.s.length && this.s[this.i] !== '\n' && this.s[this.i] !== '\r') this.i += 1;
      } else break;
    }
  }

  value(): Obj {
    this.ws();
    const s = this.s;
    const c = s[this.i];
    if (s.startsWith('<<', this.i)) {
      this.i += 2;
      const dict = new Map<string, Obj>();
      for (;;) {
        this.ws();
        if (s.startsWith('>>', this.i)) {
          this.i += 2;
          return { t: 'dict', v: dict };
        }
        const key = this.value();
        if (key.t !== 'name') throw new Error(`dictionary key expected at ${this.i}`);
        dict.set(key.v, this.value());
      }
    }
    if (c === '<') return this.hex();
    if (c === '[') {
      this.i += 1;
      const items: Obj[] = [];
      for (;;) {
        this.ws();
        if (s[this.i] === ']') {
          this.i += 1;
          return { t: 'arr', v: items };
        }
        items.push(this.value());
      }
    }
    if (c === '/') return this.name();
    if (c === '(') return this.literal();
    const ref = /^(\d+)[ \t\r\n]+\d+[ \t\r\n]+R(?![A-Za-z0-9])/.exec(s.slice(this.i, this.i + 40));
    if (ref) {
      this.i += ref[0].length;
      return { t: 'ref', n: Number(ref[1]) };
    }
    const number = /^[+-]?(\d+\.?\d*|\.\d+)/.exec(s.slice(this.i, this.i + 40));
    if (number) {
      this.i += number[0].length;
      return { t: 'num', v: Number(number[0]) };
    }
    const word = /^[A-Za-z]+/.exec(s.slice(this.i, this.i + 12));
    if (word) {
      this.i += word[0].length;
      if (word[0] === 'true' || word[0] === 'false') return { t: 'bool', v: word[0] === 'true' };
      if (word[0] === 'null') return { t: 'null' };
    }
    throw new Error(`unexpected token at ${this.i}: ${JSON.stringify(s.slice(this.i, this.i + 20))}`);
  }

  name(): Obj {
    this.i += 1;
    let out = '';
    while (this.i < this.s.length) {
      const ch = this.s[this.i] as string;
      if (WHITESPACE.has(ch.charCodeAt(0)) || DELIMITERS.has(ch)) break;
      if (ch === '#') {
        out += String.fromCharCode(parseInt(this.s.slice(this.i + 1, this.i + 3), 16));
        this.i += 3;
      } else {
        out += ch;
        this.i += 1;
      }
    }
    return { t: 'name', v: out };
  }

  hex(): Obj {
    const end = this.s.indexOf('>', this.i);
    const digits = this.s.slice(this.i + 1, end).replace(/\s+/g, '');
    this.i = end + 1;
    const bytes: number[] = [];
    for (let n = 0; n < digits.length; n += 2) bytes.push(parseInt(digits.slice(n, n + 2).padEnd(2, '0'), 16));
    return { t: 'str', v: textOf(bytes) };
  }

  literal(): Obj {
    this.i += 1;
    const bytes: number[] = [];
    let depth = 1;
    while (this.i < this.s.length) {
      const ch = this.s[this.i] as string;
      this.i += 1;
      if (ch === '\\') {
        const next = this.s[this.i] as string;
        this.i += 1;
        const simple: Record<string, number> = { n: 10, r: 13, t: 9, b: 8, f: 12, '(': 40, ')': 41, '\\': 92 };
        if (next in simple) bytes.push(simple[next] as number);
        else if (next >= '0' && next <= '7') {
          let octal = next;
          while (octal.length < 3 && (this.s[this.i] as string) >= '0' && (this.s[this.i] as string) <= '7') {
            octal += this.s[this.i];
            this.i += 1;
          }
          bytes.push(parseInt(octal, 8) & 0xff);
        } else if (next === '\r' && this.s[this.i] === '\n') this.i += 1;
        else if (next !== '\n' && next !== '\r') bytes.push(next.charCodeAt(0));
      } else if (ch === '(') {
        depth += 1;
        bytes.push(40);
      } else if (ch === ')') {
        depth -= 1;
        if (depth === 0) break;
        bytes.push(41);
      } else bytes.push(ch.charCodeAt(0));
    }
    return { t: 'str', v: textOf(bytes) };
  }
}

interface Entry {
  value: Obj;
  stream: { start: number; end: number } | null;
}

export interface PdfImage {
  /** Object number of the image XObject. */
  object: number;
  width: number;
  height: number;
  filters: string[];
  colorSpace: string;
  bitsPerComponent: number;
  hasSoftMask: boolean;
  /** The stream exactly as stored in the file. */
  data: Uint8Array;
  /** When the only filter is DCTDecode the stream IS a JPEG file: hand it to jpeg.ts. Otherwise null. */
  jpeg: Uint8Array | null;
  /** Inflated samples when the only filter is FlateDecode, otherwise null. */
  decode(): Uint8Array | null;
}

export interface PdfPage {
  index: number;
  /** [x0, y0, x1, y1] in points. */
  mediaBox: [number, number, number, number];
  width: number;
  height: number;
  rotate: number;
  images: PdfImage[];
}

export interface PdfDocument {
  /** The version of the header, e.g. "1.7". */
  version: string;
  pageCount: number;
  pages: PdfPage[];
  /** Every image XObject in the file, whether or not a page uses it. */
  images: PdfImage[];
  /** The Info dictionary: Title, Author, Subject, Keywords, Creator, Producer, CreationDate, ModDate. */
  info: Record<string, string>;
  /** A /Metadata stream (XMP) hangs off the catalog or exists as an object. */
  hasXmp: boolean;
  usesObjectStreams: boolean;
}

export function isPdf(bytes: Uint8Array): boolean {
  return bytes.length >= 5 && String.fromCharCode(...bytes.subarray(0, 5)) === '%PDF-';
}

export function parsePdf(bytes: Uint8Array): PdfDocument {
  if (!isPdf(bytes)) throw new Error('not a PDF');
  const s = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('latin1');
  const objects = new Map<number, Entry>();

  // Top-level objects, in file order. Scanning resumes after each stream, so binary data cannot
  // fake an "N G obj".
  const header = /(\d+)[ \t\r\n]+(\d+)[ \t\r\n]+obj\b/g;
  let position = 0;
  for (;;) {
    header.lastIndex = position;
    const match = header.exec(s);
    if (!match) break;
    const parser = new Parser(s, match.index + match[0].length);
    let value: Obj;
    try {
      value = parser.value();
    } catch {
      position = match.index + match[0].length;
      continue;
    }
    let stream: Entry['stream'] = null;
    parser.ws();
    if (s.startsWith('stream', parser.i)) {
      let start = parser.i + 6;
      if (s[start] === '\r') start += 1;
      if (s[start] === '\n') start += 1;
      const length = value.t === 'dict' ? value.v.get('Length') : undefined;
      let end = length?.t === 'num' ? start + length.v : -1;
      if (end < 0 || !/^[ \t\r\n]*endstream/.test(s.slice(end, end + 20))) {
        end = s.indexOf('endstream', start);
        if (s[end - 1] === '\n') end -= 1;
        if (s[end - 1] === '\r') end -= 1;
      }
      stream = { start, end };
      parser.i = s.indexOf('endstream', end) + 9;
    }
    objects.set(Number(match[1]), { value, stream });
    position = parser.i;
  }

  const dictOf = (o: Obj | undefined): Map<string, Obj> | null => {
    const resolved = deref(o);
    return resolved?.t === 'dict' ? resolved.v : null;
  };
  const deref = (o: Obj | undefined): Obj | undefined => {
    let current = o;
    for (let hops = 0; current?.t === 'ref' && hops < 20; hops += 1) current = objects.get(current.n)?.value;
    return current;
  };
  const bytesOf = (entry: Entry): Uint8Array => (entry.stream ? bytes.subarray(entry.stream.start, entry.stream.end) : new Uint8Array(0));
  const nameOf = (o: Obj | undefined): string => {
    const resolved = deref(o);
    return resolved?.t === 'name' ? resolved.v : '';
  };
  const numberOf = (o: Obj | undefined, fallback = 0): number => {
    const resolved = deref(o);
    return resolved?.t === 'num' ? resolved.v : fallback;
  };

  // Compressed object streams: their objects join the table.
  let usesObjectStreams = false;
  for (const entry of [...objects.values()]) {
    const dict = dictOf(entry.value);
    if (!dict || nameOf(dict.get('Type')) !== 'ObjStm' || !entry.stream) continue;
    usesObjectStreams = true;
    const raw = bytesOf(entry);
    const text = Buffer.from(nameOf(dict.get('Filter')) === 'FlateDecode' ? unzlibSync(raw) : raw).toString('latin1');
    const count = numberOf(dict.get('N'));
    const first = numberOf(dict.get('First'));
    const numbers = text.slice(0, first).trim().split(/\s+/).map(Number);
    for (let n = 0; n < count; n += 1) {
      const id = numbers[n * 2] as number;
      const offset = numbers[n * 2 + 1] as number;
      objects.set(id, { value: new Parser(text, first + offset).value(), stream: null });
    }
  }

  // Trailer: a classic "trailer" dictionary, or the XRef stream dictionary.
  let trailer: Map<string, Obj> | null = null;
  const at = s.lastIndexOf('trailer');
  if (at >= 0) trailer = dictOf(new Parser(s, at + 7).value());
  if (!trailer) {
    for (const entry of objects.values()) {
      const dict = dictOf(entry.value);
      if (dict && nameOf(dict.get('Type')) === 'XRef') trailer = dict;
    }
  }
  const catalog =
    dictOf(trailer?.get('Root')) ??
    [...objects.values()].map((entry) => dictOf(entry.value)).find((dict) => dict && nameOf(dict.get('Type')) === 'Catalog') ??
    null;

  const info: Record<string, string> = {};
  const infoDict = dictOf(trailer?.get('Info'));
  if (infoDict) {
    for (const [key, value] of infoDict) {
      const resolved = deref(value);
      if (resolved?.t === 'str') info[key] = resolved.v;
      else if (resolved?.t === 'name') info[key] = resolved.v;
    }
  }

  const toImage = (object: number, entry: Entry): PdfImage | null => {
    const dict = dictOf(entry.value);
    if (!dict || nameOf(dict.get('Subtype')) !== 'Image' || !entry.stream) return null;
    const filter = deref(dict.get('Filter'));
    const filters = filter?.t === 'name' ? [filter.v] : filter?.t === 'arr' ? filter.v.map((item) => nameOf(item)) : [];
    const space = deref(dict.get('ColorSpace'));
    const data = bytesOf(entry);
    return {
      object,
      width: numberOf(dict.get('Width')),
      height: numberOf(dict.get('Height')),
      filters,
      colorSpace: space?.t === 'name' ? space.v : space?.t === 'arr' ? nameOf(space.v[0]) : '',
      bitsPerComponent: numberOf(dict.get('BitsPerComponent')),
      hasSoftMask: dict.has('SMask'),
      data,
      jpeg: filters.length === 1 && filters[0] === 'DCTDecode' ? data : null,
      decode: () => (filters.length === 1 && filters[0] === 'FlateDecode' ? unzlibSync(data) : null),
    };
  };
  const images: PdfImage[] = [];
  const byObject = new Map<number, PdfImage>();
  for (const [object, entry] of objects) {
    const image = toImage(object, entry);
    if (image) {
      images.push(image);
      byObject.set(object, image);
    }
  }

  const pages: PdfPage[] = [];
  const walk = (node: Obj | undefined, inherited: { box: Obj | undefined; resources: Obj | undefined; rotate: number }): void => {
    const dict = dictOf(node);
    if (!dict) return;
    const state = { box: dict.get('MediaBox') ?? inherited.box, resources: dict.get('Resources') ?? inherited.resources, rotate: dict.has('Rotate') ? numberOf(dict.get('Rotate')) : inherited.rotate };
    const kids = deref(dict.get('Kids'));
    if (kids?.t === 'arr') {
      for (const kid of kids.v) walk(kid, state);
      return;
    }
    const box = deref(state.box);
    const numbers = box?.t === 'arr' ? box.v.map((item) => numberOf(item)) : [0, 0, 0, 0];
    const mediaBox: [number, number, number, number] = [numbers[0] ?? 0, numbers[1] ?? 0, numbers[2] ?? 0, numbers[3] ?? 0];
    const xobjects = dictOf(dictOf(state.resources)?.get('XObject'));
    const used: PdfImage[] = [];
    for (const reference of xobjects?.values() ?? []) {
      const image = reference.t === 'ref' ? byObject.get(reference.n) : undefined;
      if (image) used.push(image);
    }
    pages.push({ index: pages.length, mediaBox, width: mediaBox[2] - mediaBox[0], height: mediaBox[3] - mediaBox[1], rotate: state.rotate, images: used });
  };
  walk(catalog?.get('Pages'), { box: undefined, resources: undefined, rotate: 0 });

  const hasXmp =
    (catalog?.has('Metadata') ?? false) ||
    [...objects.values()].some((entry) => {
      const dict = dictOf(entry.value);
      return dict !== null && nameOf(dict.get('Type')) === 'Metadata';
    });

  return { version: s.slice(5, 8), pageCount: pages.length, pages, images, info, hasXmp, usesObjectStreams };
}
