// ResultHero (docs/design/components/ResultHero): the calculator's result on the deep background, the big
// number, the sentence that says it with its numbers in bold, and the SplitChart. It changes on every key
// press, but only a hidden polite region speaks, half a second after the last change, so a screen reader
// does not read every digit (DECISOES § 102: one voice for the result). The Oli in `cheer`, holding the
// placard, shows only on the first result of the visit, and never moves (no jump).
import { useEffect, useRef, useState } from 'preact/hooks';
import Oli from '../image/Oli.tsx';
import SplitChart from './SplitChart.tsx';
import type { CalcView, Part } from './types.ts';

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
  ',': 0.215, '.': 0.208, $: 0.441, R: 0.602, ' ': 0.232, '\u00a0': 0.232, '−': 0.539, '-': 0.402, '%': 0.785,
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

interface Props {
  view: CalcView;
  /** The person changed something: the region may speak. */
  touched: boolean;
  cheer: boolean;
  splitName: (view: CalcView) => string;
  money: (cents: number) => string;
  percent: (value: number) => string;
}

export default function ResultHero({ view, touched, cheer, splitName, money, percent }: Props) {
  const [spoken, setSpoken] = useState('');
  const timer = useRef<number | undefined>(undefined);
  const section = useRef<HTMLElement>(null);
  const said = view.problem ?? `${view.hero.label}: ${view.hero.value}${view.hero.unit ?? ''}. ${plain(view.hero.sentence)}`;
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
    <section ref={section} class="fo-rhero fo-deep" aria-label={view.hero.label}>
      <p class="fo-rhero__label">{view.hero.label}</p>
      {/* The width of the number sizes it to its card, so it never breaks in the middle (DECISOES § 246 and § 253). */}
      <p class="fo-rhero__num" style={`--fo-num-em: ${fit.em}; --fo-num-px: ${fit.px}px`}>
        <Value text={view.hero.value} />
        {view.hero.unit && <small>{view.hero.unit}</small>}
      </p>
      <p class="fo-rhero__sentence">{view.problem ?? <Sentence parts={view.hero.sentence} />}</p>
      {view.split && !view.problem && (
        <SplitChart
          name={splitName(view)}
          percent={percent}
          a={{ label: view.split.a.label, cents: view.split.a.cents, text: money(view.split.a.cents) }}
          b={{ label: view.split.b.label, cents: view.split.b.cents, text: money(view.split.b.cents) }}
        />
      )}
      {/* The cheer comes in at the end of the card, under the chart: on the first key press nothing above the
          number moves, and on a phone the number stays above the fold. */}
      {cheer && !view.problem && (
        <div class="fo-rhero__oli" aria-hidden="true">
          <div class="fo-placard fo-pop">
            <span class="fo-placard__n">{view.placard.n}</span>
            <span class="fo-placard__l">{view.placard.l}</span>
          </div>
          <Oli pose="cheer" class="fo-oli fo-rhero__orca" />
        </div>
      )}
      <p class="fo-sr" aria-live="polite">
        {spoken}
      </p>
    </section>
  );
}
