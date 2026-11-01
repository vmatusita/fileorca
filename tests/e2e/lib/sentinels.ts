// The sentinels of the privacy test of the PDF tools (F5a, decision 8; DECISOES § F5a-sentinelas) and the search for
// them. A sentinel is a value a person types or a mark inside a file that must never leave the tool: long, unique, and
// nothing else on the site looks like it. The search is pure string work, so tests/unit/pdf-sentinels.test.ts can prove
// that it finds what it must and says nothing otherwise, with no browser: a search that never fails proves nothing.
//
// "No character glued before or after": a sentinel of 12 characters or more is looked for as a plain substring, so a
// leak with anything glued to either side ("pwd=Orca-...&x", "xOrca-...y") is still found. A short one (the start
// number) is looked for as a whole word: no letter or digit before or after it, because the hashed names of the build
// ("/_astro/x8317Kq2.js") and the numbers of an event can hold the same digits by chance, and a false alarm is as bad as a
// missed leak. Both rules look at the sentinel as typed, without its spaces and percent-encoded, which is how a range or
// a name would travel in an address.
import { Buffer } from 'node:buffer';

/** Typed by the person, or written inside the file: none of them may reach a request, an event, a name or a store. */
export const SENTINELS = {
  /** The password of Protect PDF, and of Unlock PDF when it is the right one. */
  password: 'Orca-Sentinel-7391-Kq',
  /** The password Unlock PDF is told first, which is wrong. */
  wrongPassword: 'Orca-Wrong-5528-Vd',
  /** The text of the watermark. */
  watermark: 'Orca-Stamp-9046-Jx',
  /** The name typed into Sign PDF. */
  signature: 'Orca-Sign-4417-Hx',
  /** Text inside the fixture, on every page: the content of the file. */
  marker: 'Orca-Inside-3319-Rb',
  /** The first number of Add page numbers (the field takes 1 to 9999). */
  start: '8317',
  /** Ranges of Split, of Delete and of PDF to JPG; each is valid for the 12 pages of the fixture. */
  rangeSplit: '1-2, 4, 6-7, 9, 11-12',
  rangeDelete: '2-3, 5, 7-8, 10',
  rangeImages: '3-4, 6, 8-9, 12',
  /** The name of the file the person hands in: it is theirs, so only the names of the downloads may carry it. */
  file: 'Orca-File-6284-Wn',
} as const;

export type SentinelName = keyof typeof SENTINELS;

/** Where a sentinel may legitimately appear: the file name is the person's own, and comes back in the name of the download. */
export const NAME_MAY_CARRY: readonly SentinelName[] = ['file'];

/** The shapes a sentinel can take on its way out: as typed, without spaces, percent-encoded. */
export function variants(sentinel: string): string[] {
  const compact = sentinel.replace(/\s+/g, '');
  return [...new Set([sentinel, compact, encodeURIComponent(sentinel), encodeURIComponent(compact)])];
}

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Whether `text` holds `sentinel`, by the rules at the top of this file. */
export function holds(text: string, sentinel: string): boolean {
  return variants(sentinel).some((form) => {
    if (form.length >= 12) return text.includes(form);
    return new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(form)}(?![A-Za-z0-9])`).test(text);
  });
}

/** One place a sentinel could be: the label says where, for the failure message. */
export interface Surface {
  where: string;
  text: string;
}

/** "<where> holds <sentinel>" for every surface and every sentinel in it (the `except` ones are allowed there). */
export function leaksIn(surfaces: readonly Surface[], except: readonly SentinelName[] = []): string[] {
  const found: string[] = [];
  for (const surface of surfaces) {
    for (const [name, sentinel] of Object.entries(SENTINELS)) {
      if (except.includes(name as SentinelName)) continue;
      if (holds(surface.text, sentinel)) found.push(`${surface.where} holds the ${name} sentinel`);
    }
  }
  return found;
}

/**
 * The sentinel inside the bytes of a file, as a PDF could write it: plain ASCII, a UTF-16 text string (big endian, as a
 * PDF text string is, or little endian), or a hex string (<4f72...>). Returns the form it was found in, or null.
 */
export function bytesHold(bytes: Uint8Array, sentinel: string): string | null {
  const buffer = Buffer.from(bytes);
  const utf16le = Buffer.from(sentinel, 'utf16le');
  const forms: [string, Buffer][] = [
    ['ASCII', Buffer.from(sentinel, 'latin1')],
    ['UTF-16 little endian', utf16le],
    ['UTF-16 big endian', Buffer.from(utf16le).swap16()],
    ['hex (lower case)', Buffer.from(Buffer.from(sentinel, 'latin1').toString('hex'), 'latin1')],
    ['hex (upper case)', Buffer.from(Buffer.from(sentinel, 'latin1').toString('hex').toUpperCase(), 'latin1')],
  ];
  for (const [name, form] of forms) if (buffer.includes(form)) return name;
  return null;
}

/** What a request carried, as the context saw it: method, address, headers and body, one text to search. */
export interface SeenRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  /** The body as latin1, so no byte is lost; empty when there is none. */
  body: string;
  bodyBytes: number;
}

export const requestText = (request: SeenRequest): string => `${request.method} ${request.url}\n${Object.entries(request.headers).map(([key, value]) => `${key}: ${value}`).join('\n')}\n${request.body}`;

/**
 * Requests that break the rule of the site (CLAUDE.md, F3; tests/e2e/launch-claims.spec.ts): anything that is not a GET, has
 * a body, carries a query string, or goes to another origin. blob:, data: and about: stay in the browser and are not
 * requests to anywhere; they are still searched for the sentinels.
 */
export function brokenRequests(requests: readonly SeenRequest[], origin: string): string[] {
  const broken: string[] = [];
  for (const request of requests) {
    if (/^(blob|data|about):/.test(request.url)) continue;
    const url = new URL(request.url);
    if (url.origin !== origin) broken.push(`to another origin: ${request.method} ${url.origin}${url.pathname}`);
    else if (request.method !== 'GET') broken.push(`${request.method} ${url.pathname}`);
    else if (request.bodyBytes > 0) broken.push(`GET ${url.pathname} with a body of ${request.bodyBytes} bytes`);
    else if (url.search !== '') broken.push(`GET ${url.pathname} with a query string`);
  }
  return broken;
}
