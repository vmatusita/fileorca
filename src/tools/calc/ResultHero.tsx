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
// F16 (items 3 and 4; DECISOES § 685 and § 686): the region waits while a field's text does not read, and says once what
// holds when it reads again or becomes an error; and when the Download leaves the page with the focus on it or on its way to
// it, the focus goes on to the next control of the order of the page, never to the body.
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import Icon from '../../icons/Icon.tsx';
import Oli from '../image/Oli.tsx';
import type { Pose } from '../../oli/poses.ts';
import { HERO_ERROR_ID } from './CalcField.tsx';
import SplitChart, { PairChart } from './SplitChart.tsx';
import type { CalcView, Part } from './types.ts';
import type { HeroReserves } from './CalcPanel.tsx';
import type { CalcStore } from './store.ts';

export const SPEAK_AFTER_MS = 500;

/** A control the Tab may reach, as the page draws it (F16, item 4). */
export interface Control {
  /** A disabled button or field is out of the order of the Tab (the CSV while the result is stale, § 139). */
  disabled: boolean;
  /** -1 takes it out of the order of the Tab. */
  tabIndex: number;
  /** It has a box on the page: not display: none, not in a closed block. */
  drawn: boolean;
}

/**
 * The control the focus goes to when the Download leaves the page with the focus on it or on its way to it: the first of the
 * controls after the Download's place, in the order of the page, that the Tab reaches (today the Copy link, since the CSV is
 * off while the result is stale). The order of the page is the order of the Tab (DECISOES § 555), so the Shift+Tab from it
 * goes back to the field the person left.
 */
export function nextControl<T extends Control>(controls: Iterable<T>): T | undefined {
  for (const control of controls) if (!control.disabled && control.tabIndex >= 0 && control.drawn) return control;
  return undefined;
}

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';

/** The controls of the page after a place, in the order of the page, as the Tab sees them. */
function* controlsAfter(place: Element): Generator<Control & { node: HTMLElement }> {
  for (const node of document.querySelectorAll<HTMLElement>(FOCUSABLE)) {
    if (place.contains(node) || !(place.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
    yield { node, disabled: 'disabled' in node && node.disabled === true, tabIndex: node.tabIndex, drawn: node.getClientRects().length > 0 };
  }
}

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
  /** The fields whose text does not read now (the store): the region waits while there is one (F16; DECISOES § 685). */
  drafts: Pick<CalcStore, 'drafting' | 'onDraft'>;
  pose: Pose;
  download: HeroDownload;
  /** Inner markup of the alert icon, read at build. */
  alert: string;
  splitName: (view: CalcView) => string;
  money: (cents: number) => string;
  percent: (value: number) => string;
}

export default function ResultHero({ view, error, last, reserves, touched, drafts, pose, download, alert, splitName, money, percent }: Props) {
  const [spoken, setSpoken] = useState('');
  const timer = useRef<number | undefined>(undefined);
  /** A wait was stopped by a field's text that does not read: the region says once what holds when the draft ends. */
  const held = useRef(false);
  const section = useRef<HTMLElement>(null);
  /** The Download, its place, and whether the focus is on it or on its way to it (F16, item 4). */
  const button = useRef<HTMLButtonElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const bound = useRef(false);
  /** The Download leaves the page in this render with the focus on it or on its way to it. */
  const leaving = useRef(false);
  const said = error !== undefined ? `${error} ${last ?? ''}`.trim() : `${view.hero.label}: ${view.hero.value}${view.hero.unit ?? ''}. ${plain(view.hero.sentence)}`;
  const latest = useRef(said);
  latest.current = said;

  const speakLater = () => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
    // While a field's text does not read, the region waits: the result of a prefix is never said (F16, item 3; review F13b b-3).
    if (drafts.drafting()) {
      held.current = true;
      return;
    }
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      setSpoken(latest.current);
    }, SPEAK_AFTER_MS);
  };

  useEffect(() => {
    if (touched) speakLater();
  }, [said, touched]);

  // A draft that does not read stops the wait that runs; when it reads again or becomes an error, the region says once what
  // holds then, half a second after (DECISOES § 685). Nothing repaints for it.
  useEffect(
    () =>
      drafts.onDraft(() => {
        if (drafts.drafting()) {
          if (timer.current === undefined) return;
          window.clearTimeout(timer.current);
          timer.current = undefined;
          held.current = true;
        } else if (held.current) {
          held.current = false;
          speakLater();
        }
      }),
    [drafts],
  );

  // The half second counts from the last key press, not from the last change of the result: a key that leaves
  // the number as it was ("6." or a thousands comma) also restarts a wait that is running (review F4, ACE-1).
  useEffect(() => {
    const island = section.current?.closest('.fo-calc');
    const onInput = () => {
      if (timer.current !== undefined) speakLater();
    };
    // Where the focus is going (F16, item 4): the Download, or on its way to it (the relatedTarget of the field's blur).
    const onFocusIn = (event: Event) => {
      bound.current = event.target === button.current;
    };
    const onFocusOut = (event: Event) => {
      bound.current = (event as FocusEvent).relatedTarget === button.current && button.current !== null;
    };
    island?.addEventListener('input', onInput);
    island?.addEventListener('focusin', onFocusIn);
    island?.addEventListener('focusout', onFocusOut);
    return () => {
      island?.removeEventListener('input', onInput);
      island?.removeEventListener('focusin', onFocusIn);
      island?.removeEventListener('focusout', onFocusOut);
      window.clearTimeout(timer.current);
    };
  }, []);

  // F16, item 4 (review F13b b-1; DECISOES § 686): the Download leaves the page when the field the person leaves shows its
  // error, with the focus on it or on its way to it, and the focus fell to the body. Read before the commit takes the button
  // out; after it, the focus goes on to the next control in the order of the page (the Copy link while the CSV is off),
  // before the paint (§ 510: an effect would run after it). The field keeps no hold of the focus, and the Tab is never stopped.
  if (error !== undefined && button.current !== null && (bound.current || document.activeElement === button.current)) leaving.current = true;
  useLayoutEffect(() => {
    if (!leaving.current || !slot.current) return;
    leaving.current = false;
    bound.current = false;
    if (button.current?.isConnected) return;
    nextControl(controlsAfter(slot.current))?.node.focus();
  });

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
      <div class="fo-rhero__get" ref={slot} data-reserve={reserves.get}>
        {error !== undefined ? (
          <p class="fo-rhero__error" id={HERO_ERROR_ID} key="error">
            <span class="fo-rhero__alert">
              <Icon inner={alert} />
            </span>
            <span>{error}</span>
          </p>
        ) : (
          <button ref={button} type="button" class="fo-btn fo-btn--download fo-btn--lg" key="pdf" aria-busy={download.busy ? 'true' : undefined} onClick={download.onClick}>
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
