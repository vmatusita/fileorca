// ResultHero (docs/design/components/ResultHero): the calculator's result on the deep background, the big number, the
// Download PDF right under it, the sentence that says it with its numbers in bold, and the SplitChart. It changes on every
// key press, but only a hidden polite region speaks, half a second after the last change, so a screen reader does not read
// every digit (DECISOES § 102: one voice for the result).
// F13b (UX-12 A, decision 4; DECISOES § 545): the card is the one place of the result, of its Download and of its error. The
// Oli sits on its top edge from the first paint (wave on the example, cheer once on the first result of the visit, oops on
// an error), and her pose changes in the same box. While a field is wrong (or the account cannot be done), the card keeps
// the number of the last result in on-deep-muted, the message takes the place of the Download, and "Last result that
// worked: Rate 6.5%." takes the place of the sentence, in the same cell of the grid: the card never changes its height and
// nothing moves under it. The region says the error too, as the one voice of the result.
import { useEffect, useRef, useState } from 'preact/hooks';
import Icon from '../../icons/Icon.tsx';
import Oli from '../image/Oli.tsx';
import type { Pose } from '../../oli/poses.ts';
import { HERO_ERROR_ID } from './CalcField.tsx';
import SplitChart, { PairChart } from './SplitChart.tsx';
import type { CalcView, Part } from './types.ts';
import type { HeroReserves } from './CalcPanel.tsx';

export const SPEAK_AFTER_MS = 500;

export function plain(parts: readonly Part[]): string {
  return parts.map((part) => (typeof part === 'string' ? part : part.b)).join('');
}

export function Sentence({ parts }: { parts: readonly Part[] }) {
  return <>{parts.map((part, index) => (typeof part === 'string' ? part : <b key={index}>{part.b}</b>))}</>;
}

/** The pieces of the big number: its numbers, drawn big, and its words, at the size of the unit. */
function piecesOf(text: string): { text: string; number: boolean }[] {
  if (!/[a-z]/i.test(text.replace(/^−?R\$\s?/, ''))) return [{ text, number: true }];
  return text
    .split(/(\d[\d,.]*)/)
    .map((piece) => piece.trim())
    .filter(Boolean)
    .map((piece) => ({ text: piece, number: /^\d/.test(piece) }));
}

/** The big number. A value with words ("2 years 9 months", "Year 7") keeps its numbers big and its words at the
 * size of the unit, so it stays on one line on a phone; an amount ("$2,613.32", "R$ 2.613,32") is one piece. Each number
 * is a span the CSS never breaks (DECISOES § 246 and § 253). */
export function Value({ text }: { text: string }) {
  return <>{piecesOf(text).map((piece, index) => (piece.number ? <span key={index}>{piece.text}</span> : <small key={index}>{piece.text}</small>))}</>;
}

/** Width of each character of the big number in Fredoka 600, in em, with the number's letter-spacing (measured, § 253). */
const GLYPH_EM: Record<string, number> = {
  '0': 0.563, '1': 0.374, '2': 0.568, '3': 0.563, '4': 0.54, '5': 0.492, '6': 0.517, '7': 0.524, '8': 0.538, '9': 0.517,
  ',': 0.215, '.': 0.208, $: 0.441, R: 0.602, ' ': 0.232, ' ': 0.232, '−': 0.539, '-': 0.402, '%': 0.785,
};
/** A character of the words and the unit, in their 20px type (9.87px on average, 15px for an "m"), and the gap between the pieces. */
const SMALL_PX = 11;
const GAP_PX = 8;

/**
 * How wide the big number is: its numbers in em of its own size and its words, unit and gaps in px. The glyph widths add up a
 * little wider than the text (kerning takes about 1% off), which is the margin.
 * The CSS sizes the number to (width of the card − px) / em, never above 48px (60px from 768px), so it stays on one line
 * at its full size whenever it fits (review F6, second pass; DECISOES § 253).
 */
export function numberFit(value: string, unit?: string): { em: number; px: number } {
  const pieces = piecesOf(value);
  const em = pieces.filter((piece) => piece.number).reduce((sum, piece) => sum + [...piece.text].reduce((width, char) => width + (GLYPH_EM[char] ?? 0.6), 0), 0);
  const words = pieces.filter((piece) => !piece.number).reduce((sum, piece) => sum + [...piece.text].length * SMALL_PX, 0);
  const items = pieces.length + (unit ? 1 : 0);
  return { em: Math.round(em * 1000) / 1000, px: Math.round(words + (unit ? [...unit].length * SMALL_PX : 0) + GAP_PX * Math.max(0, items - 1)) };
}

export interface HeroDownload {
  label: string;
  /** Inner markup of the pdf icon, read at build. */
  icon: string;
  busy: boolean;
  onClick: () => void;
}

interface Props {
  /** The result the card shows: the last one that worked while a field is wrong or the account cannot be done. */
  view: CalcView;
  /** The message in the place of the Download: the field in error, or the problem of the account. */
  error?: string | undefined;
  /** In the place of the sentence while there is an error: "Last result that worked: Rate 6.5%. Fix the highlighted field…" */
  last?: string | undefined;
  /**
   * The room the card keeps from the first paint (CalcPanel's heroReserves; DECISOES § 545 and § 595), each an attribute
   * drawn by a hidden pseudo-element, never text of the page: the longest message in the place of the Download (`get`), the
   * sentence as wide as another value may make it (`sentence`), and the longest "Last result that worked" (`stale`). Without
   * them a short sentence under a three-line error grew the card 26 px, a four-line problem 16 px, and a sentence of other
   * numbers a line.
   */
  reserves: HeroReserves;
  /** The person changed something: the region may speak. */
  touched: boolean;
  pose: Pose;
  download: HeroDownload;
  /** Inner markup of the alert icon, read at build. */
  alert: string;
  splitName: (view: CalcView) => string;
  money: (cents: number) => string;
  percent: (value: number) => string;
}

export default function ResultHero({ view, error, last, reserves, touched, pose, download, alert, splitName, money, percent }: Props) {
  const [spoken, setSpoken] = useState('');
  const timer = useRef<number | undefined>(undefined);
  const section = useRef<HTMLElement>(null);
  const said = error !== undefined ? `${error} ${last ?? ''}`.trim() : `${view.hero.label}: ${view.hero.value}${view.hero.unit ?? ''}. ${plain(view.hero.sentence)}`;
  const latest = useRef(said);
  latest.current = said;

  const speakLater = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      setSpoken(latest.current);
    }, SPEAK_AFTER_MS);
  };

  useEffect(() => {
    if (touched) speakLater();
  }, [said, touched]);

  // The half second counts from the last key press, not from the last change of the result: a key that leaves
  // the number as it was ("6." or a thousands comma) also restarts a wait that is running (review F4, ACE-1).
  useEffect(() => {
    const island = section.current?.closest('.fo-calc');
    const onInput = () => {
      if (timer.current !== undefined) speakLater();
    };
    island?.addEventListener('input', onInput);
    return () => {
      island?.removeEventListener('input', onInput);
      window.clearTimeout(timer.current);
    };
  }, []);

  const fit = numberFit(view.hero.value, view.hero.unit);
  return (
    <section ref={section} class="fo-rhero fo-deep fo-sea-top" aria-labelledby="fo-rhero-label" data-state={error !== undefined ? 'error' : undefined}>
      {/* The same box in every state: only data-oli and the symbol change, so nothing moves (DECISOES § 545). */}
      <Oli pose={pose} class="fo-rhero__oli" />
      <p class="fo-rhero__label" id="fo-rhero-label" data-reserve={reserves.label}>
        <span>{view.hero.label}</span>
      </p>
      {/* The width of the number sizes it to its card, so it never breaks in the middle (DECISOES § 246 and § 253). */}
      <p class="fo-rhero__num" style={`--fo-num-em: ${fit.em}; --fo-num-px: ${fit.px}px`}>
        <Value text={view.hero.value} />
        {view.hero.unit && <small>{view.hero.unit}</small>}
      </p>
      {/* The slot keeps the height of the Download: with no result to save, the message stands in its place (F7 f-10, § 139). */}
      <div class="fo-rhero__get" data-reserve={reserves.get}>
        {error !== undefined ? (
          <p class="fo-rhero__error" id={HERO_ERROR_ID} key="error">
            <span class="fo-rhero__alert">
              <Icon inner={alert} />
            </span>
            <span>{error}</span>
          </p>
        ) : (
          <button type="button" class="fo-btn fo-btn--download fo-btn--lg" key="pdf" aria-busy={download.busy ? 'true' : undefined} onClick={download.onClick}>
            <Icon inner={download.icon} />
            {download.label}
          </button>
        )}
      </div>
      {/* The other system of the account, under the Download (the SAC × PRICE; DECISOES § 549). */}
      {view.versus && (
        <p class="fo-rhero__versus">
          <Sentence parts={view.versus} />
        </p>
      )}
      {/* The sentence and the last result share one cell: the sentence keeps its height, hidden, while there is an error. */}
      <div class="fo-rhero__said" data-reserve={reserves.stale} data-sentence={reserves.sentence}>
        <p class="fo-rhero__sentence">
          <Sentence parts={view.hero.sentence} />
        </p>
        {error !== undefined && <p class="fo-rhero__stale">{last}</p>}
      </div>
      {view.pair && (
        <PairChart
          name={view.pair.name}
          principal={{ label: view.pair.principal.label, cents: view.pair.principal.cents, text: money(view.pair.principal.cents) }}
          interest={<Sentence parts={view.pair.interest} />}
          rows={view.pair.rows}
          reserve={reserves.legend}
        />
      )}
      {view.split && !view.pair && (
        <SplitChart
          name={splitName(view)}
          percent={percent}
          a={{ label: view.split.a.label, cents: view.split.a.cents, text: money(view.split.a.cents) }}
          b={{ label: view.split.b.label, cents: view.split.b.cents, text: money(view.split.b.cents) }}
          reserve={reserves.legend}
        />
      )}
      <p class="fo-sr" aria-live="polite">
        {spoken}
      </p>
    </section>
  );
}
