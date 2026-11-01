// Build-time side of the file guides (server only: never import this from an island). Every number a guide shows comes
// from data/guides-measured.json, written by pnpm guias:medir (prompt F5b, decision 3): the {placeholders} of the texts
// and the rows of the "What we measured" tables. This module only formats; it never measures or adds a number.
import measuredJson from '../../../data/guides-measured.json' with { type: 'json' };
import { fileSize } from '../../i18n/format.ts';
import enCommon from '../../i18n/en/common.ts';
import type { FileGuidesSharedTexts, FileGuideTexts } from '../../i18n/types.ts';
import type { Cell, MeasuredFile, MeasuredNumber, MeasuredTable } from './measured-types.ts';
import type { FileGuideId } from './registry.ts';

export const MEASURED = measuredJson as unknown as MeasuredFile;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "November 1, 2026" (the guides are in English). */
export function longDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return `${MONTHS[(month ?? 1) - 1]} ${day}, ${year}`;
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const grouped = (value: number): string => value.toLocaleString('en-US');
const signed = (value: number): string => (value > 0 ? `+${value}%` : value < 0 ? `−${-value}%` : '0%');

/**
 * How a measured number can be written, by the suffix of its placeholder: {name} is the default of its unit, and
 * {name_off}, {name_more}, {name_times}, {name_change}, {name_exact} and {name_word} are the other ways.
 */
export const VARIANTS = {
  '': (n: MeasuredNumber): string => {
    switch (n.unit) {
      case 'bytes':
        return fileSize(n.value, 'en');
      case 'ratio':
        return `${Math.round(n.value * 100)}%`;
      case 'px':
        return grouped(n.value);
      case 'db':
        return `${n.value.toFixed(1)} dB`;
      case 'ppi':
        return `${n.value} ppi`;
      case 'count':
        return grouped(n.value);
    }
  },
  /** A ratio as what it takes off: 0.33 is "67%". */
  off: (n: MeasuredNumber): string => `${Math.round((1 - n.value) * 100)}%`,
  /** A ratio as what it adds: 1.25 is "25%". */
  more: (n: MeasuredNumber): string => `${Math.round((n.value - 1) * 100)}%`,
  /** A ratio as a multiple: 5.23 is "5.2 times". */
  times: (n: MeasuredNumber): string => `${(Math.round(n.value * 10) / 10).toFixed(1)} times`,
  /** A ratio as a signed change: 1.25 is "+25%", 0.93 is "−7%". */
  change: (n: MeasuredNumber): string => signed(Math.round((n.value - 1) * 100)),
  /** Bytes to the byte. */
  exact: (n: MeasuredNumber): string => `${grouped(n.value)} bytes`,
  /** A small count in words ("three"). */
  word: (n: MeasuredNumber): string => WORDS[n.value] ?? grouped(n.value),
} as const;
export type Variant = keyof typeof VARIANTS;

/** The placeholders every guide may use besides its numbers: the date and the browsers of the measurement. */
export function globals(file: MeasuredFile = MEASURED): Record<string, string> {
  return {
    date: longDate(file.measuredOn),
    chromiumVersion: file.environment.browsers.chromium.split('.')[0] ?? '',
    webkitVersion: file.environment.browsers.webkit,
    system: file.environment.os.split(' ')[0] ?? '',
  };
}

/** The measured number a placeholder stands for, and how it is written; null when it is not a measured placeholder. */
export function resolvePlaceholder(id: FileGuideId, name: string, file: MeasuredFile = MEASURED): { number: MeasuredNumber; variant: Variant } | null {
  const numbers = file.guides[id].numbers;
  if (numbers[name]) return { number: numbers[name], variant: '' };
  const cut = name.lastIndexOf('_');
  if (cut <= 0) return null;
  const base = name.slice(0, cut);
  const variant = name.slice(cut + 1);
  const number = numbers[base];
  if (!number || !Object.hasOwn(VARIANTS, variant) || variant === '') return null;
  return { number, variant: variant as Variant };
}

/** Every value a guide text can name: globals, the official facts of the guide and each placeholder it uses. */
export function fillValues(id: FileGuideId, texts: FileGuideTexts, used: readonly string[], file: MeasuredFile = MEASURED): Record<string, string> {
  const values: Record<string, string> = { ...globals(file) };
  for (const [name, fact] of Object.entries(texts.facts)) values[name] = fact.text;
  for (const name of used) {
    if (name in values) continue;
    const found = resolvePlaceholder(id, name, file);
    if (found) values[name] = VARIANTS[found.variant](found.number);
  }
  return values;
}

/** Every {placeholder} name in the strings of a value. */
export function placeholdersIn(value: unknown, out: Set<string> = new Set()): Set<string> {
  if (typeof value === 'string') for (const match of value.matchAll(/\{(\w+)\}/g)) out.add(match[1] as string);
  else if (Array.isArray(value)) for (const item of value) placeholdersIn(item, out);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) placeholdersIn(item, out);
  return out;
}

// ---- the tables ----------------------------------------------------------------------------------------------------

export type TableRows = string[][];

const size = (value: Cell): string => (typeof value === 'number' ? fileSize(value, 'en') : '');
const share = (part: Cell, whole: Cell): string => (typeof part === 'number' && typeof whole === 'number' && whole > 0 ? `${Math.round((part / whole) * 100)}%` : '');
const change = (after: Cell, before: Cell): string => (typeof after === 'number' && typeof before === 'number' && before > 0 ? signed(Math.round((after / before - 1) * 100)) : '');
/** A part of a whole, with its share: "2.9 MB (99%)", or the word for nothing. */
const part = (shared: FileGuidesSharedTexts, bytes: Cell, whole: Cell): string => (bytes === 0 ? shared.none : `${size(bytes)} (${share(bytes, whole)})`);
const pixels = (width: Cell, height: Cell): string => `${grouped(Number(width))} × ${grouped(Number(height))}`;

function measuredTable(id: FileGuideId, name: string, file: MeasuredFile): MeasuredTable {
  const found = file.guides[id].tables[name];
  if (!found) throw new Error(`${id} has no measured table ${name}`);
  return found;
}

/** Column by name: the tables keep their own order. */
function col(table: MeasuredTable, row: Cell[], column: string): Cell {
  const at = table.columns.indexOf(column);
  if (at < 0) throw new Error(`no column ${column}`);
  return row[at] ?? null;
}

type Builder = (shared: FileGuidesSharedTexts, texts: FileGuideTexts, file: MeasuredFile) => TableRows[];

const label = (shared: FileGuidesSharedTexts, fixture: string): string => shared.fixtures[fixture] ?? fixture;
const gpsLabel = (shared: FileGuidesSharedTexts, kind: Cell): string => shared.gps[(String(kind) as keyof FileGuidesSharedTexts['gps'])] ?? String(kind);
const toolName = (tool: string): string => (enCommon.tools as Record<string, { name: string }>)[tool]?.name ?? (enCommon.pdf as Record<string, { name: string }>)[tool]?.name ?? tool;

const BUILDERS: Record<FileGuideId, Builder> = {
  'guides-heic-to-jpg-on-windows': (shared, _texts, file) => {
    const t = measuredTable('guides-heic-to-jpg-on-windows', 'files', file);
    return [t.rows.map((row) => [
      String(col(t, row, 'camera') ?? ''),
      size(col(t, row, 'heicBytes')),
      size(col(t, row, 'jpgBytesChromium')),
      change(col(t, row, 'jpgBytesChromium'), col(t, row, 'heicBytes')),
      pixels(col(t, row, 'width'), col(t, row, 'height')),
      gpsLabel(shared, col(t, row, 'gpsBefore')),
      gpsLabel(shared, col(t, row, 'gpsAfter')),
    ])];
  },
  'guides-why-is-my-pdf-so-large': (shared, _texts, file) => {
    const space = measuredTable('guides-why-is-my-pdf-so-large', 'space', file);
    const modes = measuredTable('guides-why-is-my-pdf-so-large', 'compress', file);
    const after = (value: Cell, before: Cell): string => (value === before ? shared.sameFile : `${size(value)} (${share(value, before)})`);
    return [
      space.rows.map((row) => [
        label(shared, String(col(space, row, 'file'))),
        grouped(Number(col(space, row, 'pages'))),
        size(col(space, row, 'totalBytes')),
        part(shared, col(space, row, 'imageBytes'), col(space, row, 'totalBytes')),
        part(shared, col(space, row, 'fontBytes'), col(space, row, 'totalBytes')),
        part(shared, col(space, row, 'otherBytes'), col(space, row, 'totalBytes')),
      ]),
      modes.rows.map((row) => {
        const before = col(modes, row, 'beforeBytes');
        return [label(shared, String(col(modes, row, 'file'))), size(before), after(col(modes, row, 'losslessBytes'), before), after(col(modes, row, 'recommendedBytes'), before), after(col(modes, row, 'strongBytesChromium'), before)];
      }),
    ];
  },
  'guides-social-media-image-sizes': (shared, _texts, file) => {
    const measure = file.guides['guides-social-media-image-sizes'];
    const resized = measuredTable('guides-social-media-image-sizes', 'resized', file);
    const thumbnail = measuredTable('guides-social-media-image-sizes', 'thumbnail', file);
    const rows: TableRows = [];
    for (const official of measure.official ?? []) {
      const own = official.id === 'youtube-thumbnail'
        ? thumbnail.rows.filter((row) => col(thumbnail, row, 'browser') === 'chromium')
        : resized.rows.filter((row) => col(resized, row, 'size') === official.id && col(resized, row, 'browser') === 'chromium');
      const table = official.id === 'youtube-thumbnail' ? thumbnail : resized;
      const shapes = [...new Set(own.map((row) => pixels(col(table, row, 'width'), col(table, row, 'height'))))];
      const largest = Math.max(...own.map((row) => Number(col(table, row, 'bytes'))));
      rows.push([
        official.network,
        official.ad ? `${official.use} ${shared.adSpec}` : official.use,
        pixels(official.width, official.height),
        shapes.join(', '),
        fileSize(largest, 'en'),
        official.limit === null ? shared.notStated : fileSize(official.limit, 'en'),
      ]);
    }
    return [rows];
  },
  'guides-open-webp-save-as-jpg': (shared, _texts, file) => {
    const t = measuredTable('guides-open-webp-save-as-jpg', 'copies', file);
    return [t.rows.filter((row) => col(t, row, 'browser') === 'chromium').map((row) => [
      label(shared, String(col(t, row, 'photo'))),
      size(col(t, row, 'originalJpgBytes')),
      `${size(col(t, row, 'webpBytes'))} (${share(col(t, row, 'webpBytes'), col(t, row, 'originalJpgBytes'))})`,
      `${size(col(t, row, 'jpgFromWebpBytes'))} (${share(col(t, row, 'jpgFromWebpBytes'), col(t, row, 'originalJpgBytes'))})`,
    ])];
  },
  'guides-jpg-vs-png': (shared, _texts, file) => {
    const t = measuredTable('guides-jpg-vs-png', 'roundTrip', file);
    const chromium = t.rows.filter((row) => col(t, row, 'browser') === 'chromium');
    const webkit = (photo: Cell): Cell[] | undefined => t.rows.find((row) => col(t, row, 'browser') === 'webkit' && col(t, row, 'photo') === photo);
    return [chromium.map((row) => {
      const other = webkit(col(t, row, 'photo'));
      const db = col(t, row, 'backPsnrDb');
      return [
        label(shared, String(col(t, row, 'photo'))),
        size(col(t, row, 'jpgBytes')),
        size(col(t, row, 'pngBytes')),
        other ? size(col(t, other, 'pngBytes')) : '',
        size(col(t, row, 'backBytes')),
        typeof db === 'number' ? `${db.toFixed(1)} dB` : shared.samePixels,
      ];
    })];
  },
  'guides-remove-location-from-photos': (shared, _texts, file) => {
    const t = measuredTable('guides-remove-location-from-photos', 'candidates', file);
    return [t.rows.filter((row) => col(t, row, 'browser') === 'chromium').map((row) => {
      const db = col(t, row, 'psnrDb');
      return [
        toolName(String(col(t, row, 'tool'))),
        `${size(col(t, row, 'afterBytes'))} (${share(col(t, row, 'afterBytes'), col(t, row, 'beforeBytes'))})`,
        String(col(t, row, 'format')).toUpperCase(),
        col(t, row, 'sameSize') === true ? shared.yes : shared.no,
        db === 'same pixels' ? shared.samePixels : typeof db === 'number' ? `${db.toFixed(1)} dB` : shared.notComparable,
        col(t, row, 'withGps') === 0 ? shared.none : String(col(t, row, 'withGps')),
      ];
    })];
  },
  'guides-pdf-to-jpg-resolution': (shared, _texts, file) => {
    const t = measuredTable('guides-pdf-to-jpg-resolution', 'images', file);
    const firstPages = t.rows.filter((row) => col(t, row, 'page') === 1 && col(t, row, 'browser') === 'chromium' && col(t, row, 'format') === 'jpg');
    return [firstPages.map((row) => {
      const png = t.rows.find((other) => col(t, other, 'file') === col(t, row, 'file') && col(t, other, 'page') === 1 && col(t, other, 'ppi') === col(t, row, 'ppi') && col(t, other, 'browser') === 'chromium' && col(t, other, 'format') === 'png');
      return [
        label(shared, String(col(t, row, 'file'))),
        `${col(t, row, 'ppi')} ppi`,
        pixels(col(t, row, 'width'), col(t, row, 'height')),
        size(col(t, row, 'bytes')),
        png ? size(col(t, png, 'bytes')) : '',
      ];
    })];
  },
  'guides-split-pdf-file-size': (shared, _texts, file) => {
    const t = measuredTable('guides-split-pdf-file-size', 'parts', file);
    return [t.rows.map((row) => [
      label(shared, String(col(t, row, 'file'))),
      grouped(Number(col(t, row, 'parts'))),
      size(col(t, row, 'originalBytes')),
      size(col(t, row, 'partsBytes')),
      change(col(t, row, 'partsBytes'), col(t, row, 'originalBytes')),
      Number(col(t, row, 'originalFontBytes')) > 0 ? `${size(col(t, row, 'originalFontBytes'))} ${shared.becomes} ${size(col(t, row, 'partsFontBytes'))}` : shared.none,
    ])];
  },
  'guides-combine-pdfs-on-phone': (shared, _texts, file) => {
    const t = measuredTable('guides-combine-pdfs-on-phone', 'pairs', file);
    return [t.rows.map((row) => [
      `${label(shared, String(col(t, row, 'first')))} + ${label(shared, String(col(t, row, 'second')))}`,
      size(col(t, row, 'inputBytes')),
      size(col(t, row, 'mergedBytes')),
      change(col(t, row, 'mergedBytes'), col(t, row, 'inputBytes')),
    ])];
  },
  'guides-photos-to-one-pdf': (_shared, texts, file) => {
    const t = measuredTable('guides-photos-to-one-pdf', 'pdfs', file);
    const row = t.rows.find((candidate) => col(t, candidate, 'browser') === 'chromium');
    if (!row) throw new Error('no Chromium row for guide 10');
    const photos = col(t, row, 'photosBytes');
    const labels = texts.tables[0]?.labels ?? [];
    return [[
      [labels[0] ?? '', size(photos), '100%'],
      [labels[1] ?? '', size(col(t, row, 'pdfBytes')), share(col(t, row, 'pdfBytes'), photos)],
      [labels[2] ?? '', size(col(t, row, 'compressedBytes')), share(col(t, row, 'compressedBytes'), photos)],
      [labels[3] ?? '', size(col(t, row, 'pdfAfterBytes')), share(col(t, row, 'pdfAfterBytes'), photos)],
    ]];
  },
};

/** The rows of each table of a guide, in the order of its texts. */
export function guideTables(id: FileGuideId, shared: FileGuidesSharedTexts, texts: FileGuideTexts, file: MeasuredFile = MEASURED): TableRows[] {
  const tables = BUILDERS[id](shared, texts, file);
  if (tables.length !== texts.tables.length) throw new Error(`${id}: ${tables.length} measured tables for ${texts.tables.length} in the texts`);
  tables.forEach((rows, index) => {
    const width = texts.tables[index]?.head.length ?? 0;
    for (const row of rows) if (row.length !== width) throw new Error(`${id}: a row of ${row.length} cells under ${width} headings`);
  });
  return tables;
}
