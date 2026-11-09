// Compress image, "Up to a size" (F15; PLANO-UX-QV, section D; DECISOES § 656 and § 657): the limits of the field
// "Maximum size", the operation and the words the panel builds from them. Pure: no DOM, no texts imported, so the unit
// tests and the specs read the same numbers the page uses (the panel imports it statically: no file of its own in dist/).
import type { Level, Operation } from '../../engine/image/types.ts';
import type { CompressOptionsTexts } from '../../i18n/types.ts';
import type { Lang } from '../../i18n/routes.ts';
import { fmt, groupDigits } from '../../i18n/format.ts';

/** The choice of the segment: the two levels of the engine, or a size in KB (the engine's Level does not change). */
export type Choice = Level | 'size';

export interface CompressState {
  level: Choice;
  /** The limit of "Up to a size", in KB of 1,000 bytes: only a valid number ever reaches it. */
  kb: number;
}

/**
 * The smallest limit the field takes: 20 KB, because the engine brings a 12 MP photo (3024 × 4032) and a 16.8 MP one
 * (4100 × 4100) under 20,000 bytes in Chromium and in WebKit (§ 657; tests/e2e/image-target.spec.ts proves it).
 */
export const MIN_KB = 20;
export const MAX_KB = 10_000;
export const START_KB = 200;

/** The three choices of the segment, in order (PLANO-UX-QV, section D). */
export const CHOICES: readonly Choice[] = ['recommended', 'strong', 'size'];

/** What every file goes through for this choice: a level, or the target of the size presets (1 KB = 1,000 bytes). */
export function operationOf(state: CompressState): Operation {
  return state.level === 'size' ? { kind: 'target', maxBytes: state.kb * 1000 } : { kind: 'compress', level: state.level };
}

/** What "Adjust ·" says: the level, or "Up to 200 KB" with the number in the format of the language. */
export function nowOf(state: CompressState, texts: CompressOptionsTexts, lang: Lang): string {
  return state.level === 'size' ? fmt(texts.upTo, { n: groupDigits(state.kb, lang) }) : texts[state.level];
}

/** The error of the field: the range in the format of the language ("from 20 to 10,000"; "de 20 a 10.000" in Portuguese). */
export function maxInvalidOf(texts: CompressOptionsTexts, lang: Lang): string {
  return fmt(texts.maxInvalid, { min: groupDigits(MIN_KB, lang), max: groupDigits(MAX_KB, lang) });
}

/** The short line under each choice ("best balance", "smallest", "limit in KB"). */
export function helpOf(texts: CompressOptionsTexts, value: Choice): string {
  return value === 'recommended' ? texts.recommendedHelp : value === 'strong' ? texts.strongHelp : texts.sizeHelp;
}

/** The label of each choice ("Recommended", "Strong", "Up to a size"). */
export function labelOf(texts: CompressOptionsTexts, value: Choice): string {
  return value === 'size' ? texts.size : texts[value];
}
