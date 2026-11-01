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

/** The big number. A value with words ("2 years 9 months", "Year 7") keeps its numbers big and its words at the
 * size of the unit, so it stays on one line on a phone; an amount ("$2,613.32") is drawn as it is. */
export function Value({ text }: { text: string }) {
  if (!/[a-z]/i.test(text)) return <>{text}</>;
  return (
    <>
      {text
        .split(/(\d[\d,.]*)/)
        .map((piece) => piece.trim())
        .filter(Boolean)
        .map((piece, index) => (/^\d/.test(piece) ? <span key={index}>{piece}</span> : <small key={index}>{piece}</small>))}
    </>
  );
}

interface Props {
  view: CalcView;
  /** The person changed something: the region may speak. */
  touched: boolean;
  cheer: boolean;
  splitName: (view: CalcView) => string;
  money: (cents: number) => string;
}

export default function ResultHero({ view, touched, cheer, splitName, money }: Props) {
  const [spoken, setSpoken] = useState('');
  const timer = useRef<number | undefined>(undefined);
  const said = view.problem ?? `${view.hero.label}: ${view.hero.value}${view.hero.unit ?? ''}. ${plain(view.hero.sentence)}`;

  useEffect(() => {
    if (!touched) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSpoken(said), SPEAK_AFTER_MS);
    return () => window.clearTimeout(timer.current);
  }, [said, touched]);

  return (
    <section class="fo-rhero fo-deep" aria-label={view.hero.label}>
      <p class="fo-rhero__label">{view.hero.label}</p>
      <p class="fo-rhero__num">
        <Value text={view.hero.value} />
        {view.hero.unit && <small>{view.hero.unit}</small>}
      </p>
      <p class="fo-rhero__sentence">{view.problem ?? <Sentence parts={view.hero.sentence} />}</p>
      {view.split && !view.problem && (
        <SplitChart
          name={splitName(view)}
          a={{ label: view.split.a.label, cents: view.split.a.cents, text: money(view.split.a.cents) }}
          b={{ label: view.split.b.label, cents: view.split.b.cents, text: money(view.split.b.cents) }}
        />
      )}
      {/* The cheer comes in at the end of the card, under the chart: on the first key press nothing above the
          number moves, and on a phone the number stays above the fold. */}
      {cheer && (
        <div class="fo-rhero__oli" aria-hidden="true">
          <div class="fo-placard">
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
