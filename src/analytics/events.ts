// GA4 events with a closed list of parameters (PLANO, eventos do GA4; DECISOES § 10).
// No event carries a file name, file content or a number the person typed.
import type { Lang } from '../i18n/routes.ts';
import type { ImagePageId, ImageToolId } from '../tools/image/registry.ts';
import type { AnyCalcId } from '../tools/calc/registry.ts';
import type { ImageNeighbour, PdfToolId } from '../tools/pdf/registry.ts';
import { EVENT_TOOLS } from './tool-ids.ts';

export const EVENT_PARAMS = {
  tool_start: ['tool', 'lang'],
  tool_complete: ['tool', 'lang', 'outcome'],
  download: ['tool', 'lang'],
  next_step_click: ['tool', 'lang', 'target'],
  tool_error: ['tool', 'lang', 'browser', 'codec', 'reason'],
  donate_click: ['place', 'lang'],
  calc_complete: ['tool', 'lang'],
  export_click: ['tool', 'lang', 'format'],
  share_click: ['tool', 'lang'],
} as const;

export type EventName = keyof typeof EVENT_PARAMS;

/** Every image, calculator and PDF page and the QR code (the registries); the id is a page name, never a file name or a number. */
export type ToolId = ImagePageId | AnyCalcId | PdfToolId | 'qr-code-generator';
/** What a batch ended with: the tool's own success word, 'unchanged' when nothing got better, 'failed' when no file came out. */
export const OUTCOMES = [
  'smaller', 'unchanged', 'converted', 'resized', 'cropped', 'rotated', 'pdf', 'failed',
  // The PDF tools (F5a, DECISOES § 151).
  'merged', 'split', 'deleted', 'numbered', 'reordered', 'watermarked', 'signed', 'protected', 'unlocked',
] as const;
export type Outcome = (typeof OUTCOMES)[number];
/**
 * Why one file did not come out: the image engine's FailureReason (src/engine/image/types.ts), the PDF engine's
 * PdfReason (src/engine/pdf/types.ts), or 'load' when the panel could not load the engine or the PDF worker (offline,
 * or a chunk gone after a deploy; DECISOES § 102).
 */
export const ERROR_REASONS = [
  'empty', 'unsupported', 'wrong-tool', 'truncated', 'decode', 'encode', 'too-large', 'load',
  'not-pdf', 'corrupted', 'needs-password', 'wrong-password', 'restricted', 'not-encrypted',
] as const;
export type ErrorReason = (typeof ERROR_REASONS)[number];
/** The real format of the file as the engine read it from the bytes: a closed list, never a file type string. */
export const CODECS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif', 'image/gif', 'application/pdf', 'unknown', 'empty'] as const;
export type Codec = (typeof CODECS)[number];
/** Where a donation link was clicked: a closed list (DECISOES § 10); `pix` is the Copy code of the Pix (F6, § 216). */
export const DONATE_PLACES = ['result', 'footer', 'support_page', 'pix'] as const;
export type DonatePlace = (typeof DONATE_PLACES)[number];
/** What a calculator exported, and since the F7 what the QR code generator saved: a closed list (DECISOES § 113 and § 263). */
export const EXPORT_FORMATS = ['pdf', 'csv', 'png', 'svg'] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export interface EventMap {
  tool_start: { tool: ToolId; lang: Lang };
  tool_complete: { tool: ToolId; lang: Lang; outcome: Outcome };
  download: { tool: ToolId; lang: Lang };
  next_step_click: { tool: ToolId; lang: Lang; target: ImageToolId | AnyCalcId | PdfToolId | ImageNeighbour | 'home' };
  tool_error: { tool: ToolId; lang: Lang; browser: string; codec: Codec; reason: ErrorReason };
  donate_click: { place: DonatePlace; lang: Lang };
  /** Once per page load, on the first valid change the person makes (never on load, never from the # link). */
  calc_complete: { tool: AnyCalcId; lang: Lang };
  export_click: { tool: AnyCalcId | 'qr-code-generator'; lang: Lang; format: ExportFormat };
  share_click: { tool: AnyCalcId; lang: Lang };
}

/** Parameters whose value comes from a closed list: anything else (a file type, a free string) is dropped. */
const CLOSED_VALUES: Record<string, readonly string[]> = {
  outcome: OUTCOMES,
  reason: ERROR_REASONS,
  codec: CODECS,
  format: EXPORT_FORMATS,
  place: DONATE_PLACES,
  tool: EVENT_TOOLS,
  target: [...EVENT_TOOLS, 'home'],
};

/** Drops any parameter outside the list, and any value outside a closed list (defence in depth: the types already forbid them). */
export function cleanParams<N extends EventName>(name: N, params: Record<string, unknown>): Partial<EventMap[N]> {
  const allowed: readonly string[] = EVENT_PARAMS[name];
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (!allowed.includes(key) || (typeof value !== 'string' && typeof value !== 'number')) continue;
    const closed = CLOSED_VALUES[key];
    if (closed && !closed.includes(String(value))) continue;
    out[key] = value;
  }
  return out as Partial<EventMap[N]>;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    foTrack?: (name: string, params: Record<string, unknown>) => void;
    dataLayer?: unknown[];
  }
}

export function track<N extends EventName>(name: N, params: EventMap[N]): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, cleanParams(name, params as unknown as Record<string, unknown>));
}

/** Short browser label for tool_error, e.g. "safari-18" or "chrome-131". */
export function browserLabel(userAgent: string): string {
  const rules: [string, RegExp][] = [
    ['edge', /Edg\/(\d+)/],
    ['firefox', /Firefox\/(\d+)/],
    ['chrome', /Chrome\/(\d+)/],
    ['safari', /Version\/(\d+)[^ ]* (?:Mobile\/\S+ )?Safari/],
  ];
  for (const [name, pattern] of rules) {
    const match = pattern.exec(userAgent);
    if (match) return `${name}-${match[1]}`;
  }
  return 'other';
}
