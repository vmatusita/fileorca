// The arithmetic and the small decisions of the image island that need no browser: the batch
// percentage, the totals of the result card, the notes to say, the event values of a batch and the
// file picker filter. Kept apart from the component so Vitest can prove them.
import type { Codec, Outcome } from '../../analytics/events.ts';
import type { EngineOutput, ImageFormat, Note, OutputFormat, Sniffed } from '../../engine/image/types.ts';

/** What a tool counts as its success, for tool_complete and the coffee line. */
export type Success = Exclude<Outcome, 'unchanged' | 'failed'>;

/** Percentage of the whole batch: files already finished, plus the share of the one in progress (0 to 1). */
export function batchPercent(finished: number, total: number, current: number): number {
  if (total <= 0) return 0;
  const share = Math.min(1, Math.max(0, current));
  return Math.min(100, Math.max(0, Math.round(((finished + share) / total) * 100)));
}

const ACCEPT: Record<ImageFormat, string> = {
  jpeg: 'image/jpeg,.jpg,.jpeg',
  png: 'image/png,.png',
  webp: 'image/webp,.webp',
  heic: 'image/heic,image/heif,.heic,.heif',
  avif: 'image/avif,.avif',
};

/** Value of the file input's accept attribute: the formats the tool takes, by type and by extension. */
export function acceptAttribute(formats: readonly ImageFormat[]): string {
  return formats.map((format) => ACCEPT[format]).join(',');
}

/** JPG, WebP and AVIF lose detail when written; PNG does not. */
export function isLossy(format: OutputFormat): boolean {
  return format !== 'png';
}

const CODEC: Record<Exclude<Sniffed, 'empty' | 'unknown'>, Codec> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  avif: 'image/avif',
  gif: 'image/gif',
};

/** The closed codec value of an event, from what the engine read in the bytes (never from the file type). */
export function codecOf(source: Sniffed | undefined): Codec {
  if (source === 'empty') return 'empty';
  if (source === undefined || source === 'unknown') return 'unknown';
  return CODEC[source];
}

const NOTE_ORDER: readonly Note[] = ['flattened', 'first-frame', 'not-enlarged', 'downscaled', 'center-cropped', 'enlarged'];

export interface Ready {
  /** Bytes of the file that went in. */
  inputSize: number;
  output: EngineOutput;
}

export interface Totals {
  count: number;
  before: number;
  after: number;
  /** Share of the bytes saved over the whole batch, in percent (negative when it grew). */
  saved: number;
  /** At least one file was written anew (a real output), not handed back unchanged. */
  anyNew: boolean;
  /** Every file came back as it was (no gain, or it already fit). */
  allKept: boolean;
  /** Format of a file this browser could not save: it came back as it was (null when none). */
  cannotEncode: OutputFormat | null;
  /** Each note once, in a fixed order. */
  notes: Note[];
}

export function totals(rows: readonly Ready[]): Totals {
  let before = 0;
  let after = 0;
  let anyNew = false;
  let cannotEncode: Totals['cannotEncode'] = null;
  const seen = new Set<Note>();
  for (const { inputSize, output } of rows) {
    before += inputSize;
    after += output.blob.size;
    if (output.outcome === 'new') anyNew = true;
    if (output.outcome === 'cannot-encode') cannotEncode ??= output.format;
    for (const note of output.notes) seen.add(note);
  }
  return {
    count: rows.length,
    before,
    after,
    saved: before > 0 ? (1 - after / before) * 100 : 0,
    anyNew,
    allKept: rows.length > 0 && !anyNew,
    cannotEncode,
    notes: NOTE_ORDER.filter((note) => seen.has(note)),
  };
}

/** The value of tool_complete: the tool's own success word, 'unchanged' when nothing was written, 'failed' when nothing came out. */
export function batchOutcome(success: Success, rows: readonly Ready[]): Outcome {
  if (rows.length === 0) return 'failed';
  return rows.some((row) => row.output.outcome === 'new') ? success : 'unchanged';
}

/** Whether a gain is worth a Placard: at least a whole percent, so the card never says "−0%". */
export function worthSaying(saved: number): boolean {
  return Math.round(saved) >= 1;
}
