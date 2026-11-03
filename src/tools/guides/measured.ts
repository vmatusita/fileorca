// Build-time side of the file guides (server only: never import this from an island). Every number a guide shows comes
// from data/guides-measured.json, written by pnpm guias:medir (prompt F5b, decision 3): the {placeholders} of the texts
// and the rows of the "What we measured" tables. This module only formats; it never measures or adds a number. Since the
// languages adjustment it writes them in the language of the guide (en, pt, es; DECISOES § 213): the separators, the
// percent sign, the words of a count with their gender and a no-break space before a unit in Portuguese and Spanish.
import measuredJson from '../../../data/guides-measured.json' with { type: 'json' };
import { fileSize, fmt, groupDigits, percent } from '../../i18n/format.ts';
import { longDate as writtenDate } from '../../i18n/dates.ts';
import type { Lang } from '../../i18n/routes.ts';
import { TEXTS } from '../../i18n/texts.ts';
import enShared from '../../i18n/en/file-guides.ts';
import type { FileGuidesSharedTexts, FileGuideTexts } from '../../i18n/types.ts';
import type { Cell, MeasuredFile, MeasuredNumber, MeasuredTable } from './measured-types.ts';
import type { FileGuideId } from './registry.ts';

export const MEASURED = measuredJson as unknown as MeasuredFile;

/** "November 1, 2026", "1 de novembro de 2026", "1 de noviembre de 2026". */
export function longDate(iso: string, lang: Lang = 'en'): string {
  return writtenDate(iso, lang);
}

/**
 * How a guide writes its numbers: the language, and the words of its shared texts (the counts in words, "times",
 * "bytes"). English is the default, so the English guides come out as before the adjustment.
 */
export interface GuideFormat {
  lang: Lang;
  shared: FileGuidesSharedTexts;
}

export const EN_FORMAT: GuideFormat = { lang: 'en', shared: enShared };

/** Portuguese and Spanish keep a number and its unit on one line ("2,4 MB", docs/i18n); English stays as it was. */
const unit = (text: string, f: GuideFormat): string => (f.lang === 'en' ? text : text.replace(/(\d) (?=\S)/g, '$1 '));
const grouped = (value: number, f: GuideFormat): string => groupDigits(value, f.lang);
const decimal = (value: number, f: GuideFormat): string => (f.lang === 'pt' ? value.toFixed(1).replace('.', ',') : value.toFixed(1));
const size = (bytes: number, f: GuideFormat): string => unit(fileSize(bytes, f.lang), f);
const pct = (value: number, f: GuideFormat): string => percent(value, f.lang);
const signed = (value: number, f: GuideFormat): string => (value > 0 ? `+${pct(value, f)}` : value < 0 ? `−${pct(-value, f)}` : pct(0, f));
const decibels = (value: number, f: GuideFormat): string => unit(`${decimal(value, f)} dB`, f);
/** A small count in words, in the gender of what it counts ("two photos", "duas fotos", "dos fotos"). */
const inWords = (value: number, f: GuideFormat, gender: 'masculine' | 'feminine'): string => f.shared.numbers[gender][value] ?? grouped(value, f);

/**
 * How a measured number can be written, by the suffix of its placeholder: {name} is the default of its unit, and
 * {name_off}, {name_more}, {name_times}, {name_change}, {name_exact}, {name_word} and {name_wordf} are the other ways.
 * {name_wordf} is the count in words before a feminine noun ("duas fotos", "una imagen"); English has no gender.
 */
export const VARIANTS = {
  '': (n: MeasuredNumber, f: GuideFormat = EN_FORMAT): string => {
    switch (n.unit) {
      case 'bytes':
        return size(n.value, f);
      case 'ratio':
        return pct(n.value * 100, f);
      case 'px':
        return grouped(n.value, f);
      case 'db':
        return decibels(n.value, f);
      case 'ppi':
        return unit(`${grouped(n.value, f)} ppi`, f);
      case 'count':
        return grouped(n.value, f);
    }
  },
  /** A ratio as what it takes off: 0.33 is "67%". */
  off: (n: MeasuredNumber, f: GuideFormat = EN_FORMAT): string => pct((1 - n.value) * 100, f),
  /** A ratio as what it adds: 1.25 is "25%". */
  more: (n: MeasuredNumber, f: GuideFormat = EN_FORMAT): string => pct((n.value - 1) * 100, f),
  /** A ratio as a multiple: 5.23 is "5.2 times" ("0,5 vez" in Portuguese, where a number below 2 takes the singular). */
  times: (n: MeasuredNumber, f: GuideFormat = EN_FORMAT): string => {
    const value = Math.round(n.value * 10) / 10;
    const one = f.lang === 'pt' ? value < 2 : f.lang === 'es' ? value === 1 : false;
    return fmt(one ? f.shared.timesOne : f.shared.times, { n: decimal(value, f) });
  },
  /** A ratio as a signed change: 1.25 is "+25%", 0.93 is "−7%". */
  change: (n: MeasuredNumber, f: GuideFormat = EN_FORMAT): string => signed(Math.round((n.value - 1) * 100), f),
  /** Bytes to the byte. */
  exact: (n: MeasuredNumber, f: GuideFormat = EN_FORMAT): string => unit(fmt(f.shared.bytes, { n: grouped(n.value, f) }), f),
  /** A small count in words ("three"), masculine where the language has gender. */
  word: (n: MeasuredNumber, f: GuideFormat = EN_FORMAT): string => inWords(n.value, f, 'masculine'),
  /** The same before a feminine noun. */
  wordf: (n: MeasuredNumber, f: GuideFormat = EN_FORMAT): string => inWords(n.value, f, 'feminine'),
} as const;
export type Variant = keyof typeof VARIANTS;

/** The placeholders every guide may use besides its numbers: the date and the browsers of the measurement. */
export function globals(file: MeasuredFile = MEASURED, lang: Lang = 'en'): Record<string, string> {
  return {
    date: longDate(file.measuredOn, lang),
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

/**
 * The words of data/guides-measured.json (the facts the measurement settled, the uses of the official sizes) in the
 * language of the guide: as they are in English, and from the guide's `measuredTerms` elsewhere. A word the texts do
 * not translate stops the build, so a new measurement never puts English into a Portuguese or Spanish page.
 */
export function measuredTerm(english: string, texts: FileGuideTexts, f: GuideFormat): string {
  if (f.lang === 'en') return english;
  const found = texts.measuredTerms?.[english];
  if (found === undefined) throw new Error(`the ${f.lang} guide "${texts.h1}" has no measuredTerms entry for "${english}"`);
  return found;
}

/** Every value a guide text can name: globals, the official facts of the guide and each placeholder it uses. */
export function fillValues(id: FileGuideId, texts: FileGuideTexts, used: readonly string[], file: MeasuredFile = MEASURED, f: GuideFormat = EN_FORMAT): Record<string, string> {
  const values: Record<string, string> = { ...globals(file, f.lang) };
  for (const [name, fact] of Object.entries(texts.facts)) values[name] = fact.text;
  // Plain facts the measurement settled (the tool and option guide 6 embeds).
  for (const [name, fact] of Object.entries(file.guides[id].facts)) if (used.includes(name)) values[name] = measuredTerm(fact, texts, f);
  for (const name of used) {
    if (name in values) continue;
    const found = resolvePlaceholder(id, name, file);
    if (found) values[name] = VARIANTS[found.variant](found.number, f);
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

/** What a table builder needs: the shared and the guide's texts, the measurement and the language. */
interface Ctx {
  shared: FileGuidesSharedTexts;
  texts: FileGuideTexts;
  file: MeasuredFile;
  f: GuideFormat;
}

const cellSize = (value: Cell, f: GuideFormat): string => (typeof value === 'number' ? size(value, f) : '');
const share = (part: Cell, whole: Cell, f: GuideFormat): string => (typeof part === 'number' && typeof whole === 'number' && whole > 0 ? pct((part / whole) * 100, f) : '');
const change = (after: Cell, before: Cell, f: GuideFormat): string => (typeof after === 'number' && typeof before === 'number' && before > 0 ? signed(Math.round((after / before - 1) * 100), f) : '');
/** A part of a whole, with its share: "2.9 MB (99%)", or the word for nothing. */
const part = (c: Ctx, bytes: Cell, whole: Cell): string => (bytes === 0 ? c.shared.none : `${cellSize(bytes, c.f)} (${share(bytes, whole, c.f)})`);
const pixels = (width: Cell, height: Cell, f: GuideFormat): string => `${grouped(Number(width), f)} × ${grouped(Number(height), f)}`;

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

type Builder = (c: Ctx) => TableRows[];

const label = (c: Ctx, fixture: string): string => c.shared.fixtures[fixture] ?? fixture;
const gpsLabel = (c: Ctx, kind: Cell): string => c.shared.gps[(String(kind) as keyof FileGuidesSharedTexts['gps'])] ?? String(kind);
const toolName = (tool: string, f: GuideFormat): string => {
  const common = TEXTS[f.lang].common;
  return (common.tools as Record<string, { name: string }>)[tool]?.name ?? (common.pdf as Record<string, { name: string }>)[tool]?.name ?? tool;
};

const BUILDERS: Record<FileGuideId, Builder> = {
  'guides-heic-to-jpg-on-windows': (c) => {
    const t = measuredTable('guides-heic-to-jpg-on-windows', 'files', c.file);
    return [t.rows.map((row) => [
      String(col(t, row, 'camera') ?? ''),
      cellSize(col(t, row, 'heicBytes'), c.f),
      cellSize(col(t, row, 'jpgBytesChromium'), c.f),
      change(col(t, row, 'jpgBytesChromium'), col(t, row, 'heicBytes'), c.f),
      pixels(col(t, row, 'width'), col(t, row, 'height'), c.f),
      gpsLabel(c, col(t, row, 'gpsBefore')),
      gpsLabel(c, col(t, row, 'gpsAfter')),
    ])];
  },
  'guides-why-is-my-pdf-so-large': (c) => {
    const space = measuredTable('guides-why-is-my-pdf-so-large', 'space', c.file);
    const modes = measuredTable('guides-why-is-my-pdf-so-large', 'compress', c.file);
    const after = (value: Cell, before: Cell): string => (value === before ? c.shared.sameFile : `${cellSize(value, c.f)} (${share(value, before, c.f)})`);
    return [
      space.rows.map((row) => [
        label(c, String(col(space, row, 'file'))),
        grouped(Number(col(space, row, 'pages')), c.f),
        cellSize(col(space, row, 'totalBytes'), c.f),
        part(c, col(space, row, 'imageBytes'), col(space, row, 'totalBytes')),
        part(c, col(space, row, 'fontBytes'), col(space, row, 'totalBytes')),
        part(c, col(space, row, 'otherBytes'), col(space, row, 'totalBytes')),
      ]),
      modes.rows.map((row) => {
        const before = col(modes, row, 'beforeBytes');
        return [label(c, String(col(modes, row, 'file'))), cellSize(before, c.f), after(col(modes, row, 'losslessBytes'), before), after(col(modes, row, 'recommendedBytes'), before), after(col(modes, row, 'strongBytesChromium'), before)];
      }),
    ];
  },
  'guides-social-media-image-sizes': (c) => {
    const measure = c.file.guides['guides-social-media-image-sizes'];
    const resized = measuredTable('guides-social-media-image-sizes', 'resized', c.file);
    const thumbnail = measuredTable('guides-social-media-image-sizes', 'thumbnail', c.file);
    const rows: TableRows = [];
    for (const official of measure.official ?? []) {
      const own = official.id === 'youtube-thumbnail'
        ? thumbnail.rows.filter((row) => col(thumbnail, row, 'browser') === 'chromium')
        : resized.rows.filter((row) => col(resized, row, 'size') === official.id && col(resized, row, 'browser') === 'chromium');
      const table = official.id === 'youtube-thumbnail' ? thumbnail : resized;
      const shapes = [...new Set(own.map((row) => pixels(col(table, row, 'width'), col(table, row, 'height'), c.f)))];
      const largest = Math.max(...own.map((row) => Number(col(table, row, 'bytes'))));
      const use = measuredTerm(official.use, c.texts, c.f);
      rows.push([
        official.network,
        official.ad ? `${use} ${c.shared.adSpec}` : use,
        pixels(official.width, official.height, c.f),
        shapes.join(', '),
        size(largest, c.f),
        official.limit === null ? c.shared.notStated : size(official.limit, c.f),
      ]);
    }
    return [rows];
  },
  'guides-open-webp-save-as-jpg': (c) => {
    const t = measuredTable('guides-open-webp-save-as-jpg', 'copies', c.file);
    return [t.rows.filter((row) => col(t, row, 'browser') === 'chromium').map((row) => [
      label(c, String(col(t, row, 'photo'))),
      cellSize(col(t, row, 'originalJpgBytes'), c.f),
      `${cellSize(col(t, row, 'webpBytes'), c.f)} (${share(col(t, row, 'webpBytes'), col(t, row, 'originalJpgBytes'), c.f)})`,
      `${cellSize(col(t, row, 'jpgFromWebpBytes'), c.f)} (${share(col(t, row, 'jpgFromWebpBytes'), col(t, row, 'originalJpgBytes'), c.f)})`,
    ])];
  },
  'guides-jpg-vs-png': (c) => {
    const t = measuredTable('guides-jpg-vs-png', 'roundTrip', c.file);
    const chromium = t.rows.filter((row) => col(t, row, 'browser') === 'chromium');
    const webkit = (photo: Cell): Cell[] | undefined => t.rows.find((row) => col(t, row, 'browser') === 'webkit' && col(t, row, 'photo') === photo);
    return [chromium.map((row) => {
      const other = webkit(col(t, row, 'photo'));
      const db = col(t, row, 'backPsnrDb');
      return [
        label(c, String(col(t, row, 'photo'))),
        cellSize(col(t, row, 'jpgBytes'), c.f),
        cellSize(col(t, row, 'pngBytes'), c.f),
        other ? cellSize(col(t, other, 'pngBytes'), c.f) : '',
        cellSize(col(t, row, 'backBytes'), c.f),
        typeof db === 'number' ? decibels(db, c.f) : c.shared.samePixels,
      ];
    })];
  },
  'guides-remove-location-from-photos': (c) => {
    const t = measuredTable('guides-remove-location-from-photos', 'candidates', c.file);
    return [t.rows.filter((row) => col(t, row, 'browser') === 'chromium').map((row) => {
      const db = col(t, row, 'psnrDb');
      return [
        toolName(String(col(t, row, 'tool')), c.f),
        `${cellSize(col(t, row, 'afterBytes'), c.f)} (${share(col(t, row, 'afterBytes'), col(t, row, 'beforeBytes'), c.f)})`,
        String(col(t, row, 'format')).toUpperCase(),
        col(t, row, 'sameSize') === true ? c.shared.yes : c.shared.no,
        db === 'same pixels' ? c.shared.samePixels : typeof db === 'number' ? decibels(db, c.f) : c.shared.notComparable,
        col(t, row, 'withGps') === 0 ? c.shared.none : grouped(Number(col(t, row, 'withGps')), c.f),
      ];
    })];
  },
  'guides-pdf-to-jpg-resolution': (c) => {
    const t = measuredTable('guides-pdf-to-jpg-resolution', 'images', c.file);
    const firstPages = t.rows.filter((row) => col(t, row, 'page') === 1 && col(t, row, 'browser') === 'chromium' && col(t, row, 'format') === 'jpg');
    return [firstPages.map((row) => {
      const png = t.rows.find((other) => col(t, other, 'file') === col(t, row, 'file') && col(t, other, 'page') === 1 && col(t, other, 'ppi') === col(t, row, 'ppi') && col(t, other, 'browser') === 'chromium' && col(t, other, 'format') === 'png');
      return [
        label(c, String(col(t, row, 'file'))),
        unit(`${grouped(Number(col(t, row, 'ppi')), c.f)} ppi`, c.f),
        pixels(col(t, row, 'width'), col(t, row, 'height'), c.f),
        cellSize(col(t, row, 'bytes'), c.f),
        png ? cellSize(col(t, png, 'bytes'), c.f) : '',
      ];
    })];
  },
  'guides-split-pdf-file-size': (c) => {
    const t = measuredTable('guides-split-pdf-file-size', 'parts', c.file);
    return [t.rows.map((row) => [
      label(c, String(col(t, row, 'file'))),
      grouped(Number(col(t, row, 'parts')), c.f),
      cellSize(col(t, row, 'originalBytes'), c.f),
      cellSize(col(t, row, 'partsBytes'), c.f),
      change(col(t, row, 'partsBytes'), col(t, row, 'originalBytes'), c.f),
      Number(col(t, row, 'originalFontBytes')) > 0 ? `${cellSize(col(t, row, 'originalFontBytes'), c.f)} ${c.shared.becomes} ${cellSize(col(t, row, 'partsFontBytes'), c.f)}` : c.shared.none,
    ])];
  },
  'guides-combine-pdfs-on-phone': (c) => {
    const t = measuredTable('guides-combine-pdfs-on-phone', 'pairs', c.file);
    return [t.rows.map((row) => [
      `${label(c, String(col(t, row, 'first')))} + ${label(c, String(col(t, row, 'second')))}`,
      cellSize(col(t, row, 'inputBytes'), c.f),
      cellSize(col(t, row, 'mergedBytes'), c.f),
      change(col(t, row, 'mergedBytes'), col(t, row, 'inputBytes'), c.f),
    ])];
  },
  'guides-photos-to-one-pdf': (c) => {
    const t = measuredTable('guides-photos-to-one-pdf', 'pdfs', c.file);
    const row = t.rows.find((candidate) => col(t, candidate, 'browser') === 'chromium');
    if (!row) throw new Error('no Chromium row for guide 10');
    const photos = col(t, row, 'photosBytes');
    const labels = c.texts.tables[0]?.labels ?? [];
    return [[
      [labels[0] ?? '', cellSize(photos, c.f), pct(100, c.f)],
      [labels[1] ?? '', cellSize(col(t, row, 'pdfBytes'), c.f), share(col(t, row, 'pdfBytes'), photos, c.f)],
      [labels[2] ?? '', cellSize(col(t, row, 'compressedBytes'), c.f), share(col(t, row, 'compressedBytes'), photos, c.f)],
      [labels[3] ?? '', cellSize(col(t, row, 'pdfAfterBytes'), c.f), share(col(t, row, 'pdfAfterBytes'), photos, c.f)],
    ]];
  },
};

/** The rows of each table of a guide, in the order of its texts. */
export function guideTables(id: FileGuideId, shared: FileGuidesSharedTexts, texts: FileGuideTexts, file: MeasuredFile = MEASURED, lang: Lang = 'en'): TableRows[] {
  const tables = BUILDERS[id]({ shared, texts, file, f: { lang, shared } });
  if (tables.length !== texts.tables.length) throw new Error(`${id}: ${tables.length} measured tables for ${texts.tables.length} in the texts`);
  tables.forEach((rows, index) => {
    const width = texts.tables[index]?.head.length ?? 0;
    for (const row of rows) if (row.length !== width) throw new Error(`${id}: a row of ${row.length} cells under ${width} headings`);
  });
  return tables;
}
