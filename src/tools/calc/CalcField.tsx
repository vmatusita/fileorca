// NumberField of the calculators (docs/design/components/NumberField): a decimal field with its unit as an
// affix. Never type="number" (it breaks the Portuguese comma and hides what the person typed);
// inputmode="decimal" opens the right keyboard (the one field that takes a minus gets the text keyboard: the
// decimal one of the iPhone has no minus sign). Every valid key press reaches the account at once (no
// half-second pause, unlike the image tools' field); a value outside the field's fixed range shows the
// range in words (aria-invalid, aria-describedby, the alert icon) and the last result stays. Leaving the
// field writes the number back in the page's format. The typed number never goes to the URL or an event.
// F13b (UX-12 A; DECISOES § 545): the message no longer sits under the field. The field keeps its stroke (2 px of border
// and 1 px of box-shadow, so it never grows) and the alert icon before its label, and the message is said in the card
// (ResultHero, #fo-rhero-error), which aria-describedby points to; the card's live region is the one voice (§ 102). The alert
// icon is inside the box, before the unit: before the label it took a second line on 40 labels at 360 px and moved the card.
// The label and the body (the box, the help, the error) are the two rows the calculator grid shares between
// two fields side by side, so their boxes line up whatever is above or under them (DECISOES § 137).
import { useEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import Icon from '../../icons/Icon.tsx';
import alertIcon from '../../../docs/design/assets/Icons/alert.svg?raw';
import { parseScaled, type NumberLang } from '../../calc/parse.ts';
import { SETTLE_MS, decimalsOf, display, fieldMessage, inRange, type DecimalsTexts } from './form.ts';
import type { FieldError } from './store.ts';
import type { NumberSpec } from './types.ts';

/** The id of the card's message, which a field in error is described by (ResultHero). */
export const HERO_ERROR_ID = 'fo-rhero-error';

export interface CalcFieldProps {
  id: string;
  kind: NumberSpec['kind'];
  /** The decimals of a measure ('dec', F7). */
  decimals?: number | undefined;
  min: number;
  max: number;
  negative?: boolean;
  /** The value in use (engine units). */
  value: number;
  onValue: (value: number) => void;
  lang: NumberLang;
  label: string;
  help?: string | undefined;
  /** A description for the screen reader only: the words a short label leaves out ("Tasa a 15 años"; Idiomas R2-03). */
  desc?: string | undefined;
  /** The range in words. */
  error: string;
  /** The value passes the field it depends on: this text is shown while it does. */
  over?: string | undefined;
  /** How the page writes decimals, added to the error when the text is not a number of its language. */
  hint?: string | undefined;
  /** The message of a number written right with more decimals than the field keeps (F16, item 2; DECISOES § 684). */
  decimalsTexts: DecimalsTexts;
  prefix?: string | undefined;
  suffix?: string | undefined;
  /** The "example" tag of a typed rate. */
  tag?: string | undefined;
  half?: boolean | undefined;
  /** Takes the whole row below 360 px (FieldBase.wide). */
  wide?: boolean | undefined;
  /** Replaces the suffix: the unit menu of the down payment. */
  unit?: ComponentChildren;
  /** Tells the calculator the error the field shows, or null: the result on screen is then stale (§ 116) and the card says it. */
  report?: ((id: string, error: FieldError | null) => void) | undefined;
  /**
   * Tells the calculator the field's text does not read now (true), from the first such key until the error shows or the
   * person leaves the field, or reads again (false): the card's region waits meanwhile (F16, item 3; DECISOES § 685).
   */
  drafting?: ((id: string, on: boolean) => void) | undefined;
  /** A problem of the account points to this field (F4 ACE-11): marked as in error, with no message of its own. */
  flagged?: boolean | undefined;
  /**
   * The card says this field's error (the first field in error of the form, or the field a problem points to): its
   * aria-describedby points to the card. Another field in error is described by its own message (review F13b b-2).
   */
  named?: boolean | undefined;
  /** The problem of the account the card says, when it points to this field: shown near it on a phone (review F13b f-2). */
  flagMessage?: string | undefined;
  /** The name the card gives the field, when the label alone does not say which: a row of a list, "Debt 2 APR" (review F13b f-4). */
  cardLabel?: string | undefined;
}

export default function CalcField(props: CalcFieldProps) {
  const { id, kind, decimals, min, max, negative = false, value, onValue, lang, label, help, desc, error, over, hint, decimalsTexts, prefix, suffix, tag, half, wide, unit, report, drafting, flagged = false, named = false, flagMessage, cardLabel } = props;
  const places = decimalsOf(kind, decimals);
  const [draft, setDraft] = useState(() => display(kind, value, lang, decimals));
  const [wrong, setWrong] = useState(false);
  // Whether the error shows now, read in the key's handler: the state of the render may be a key behind (F16, item 3).
  const shown = useRef(false);
  const show = (on: boolean) => {
    shown.current = on;
    setWrong(on);
  };
  const input = useRef<HTMLInputElement>(null);
  const settle = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(settle.current), []);
  // A field that leaves the page (a row removed, a block closed) holds no voice of the card.
  useEffect(() => () => drafting?.(id, false), [drafting, id]);

  // A value that changes from outside (the scenario link, the unit of the down payment) shows in the
  // field, unless the person is typing in it right now.
  useEffect(() => {
    if (document.activeElement !== input.current) {
      setDraft(display(kind, value, lang, decimals));
      show(false);
    }
  }, [value, kind, lang, decimals]);

  const read = (text: string): number | null => {
    const parsed = parseScaled(text, lang, places, negative);
    return parsed !== null && inRange({ min, max }, parsed) ? parsed : null;
  };

  // The range in words, the decimals message for a number written right with more decimals than the field keeps (F16, item 2),
  // and, for a number written with the other separators ("11.5" in Portuguese, "6,5" in Spanish), how to write the decimals
  // (review F6, d-1; DECISOES § 251, § 254, § 683 and § 684).
  const message = (wrong ? fieldMessage(draft, lang, { kind, decimals, min, max, negative }, { ...decimalsTexts, error, hint }) : undefined) ?? over;
  // An error marks the result as the last one, with no PDF and the CSV off (DECISOES § 116; review F7, g-1: an age under the
  // minimum kept an adult's result and printed the example's age in the PDF; DECISOES § 276), and the card says it (F13b).
  useEffect(() => {
    report?.(id, message ? { message, label: cardLabel ?? label } : null);
    return () => report?.(id, null);
  }, [report, id, message, label, cardLabel]);
  const marked = message !== undefined || flagged;
  const helpId = `${id}-help`;
  // The unit is part of what the field is: a screen reader says "Thickness, in" and not only "Thickness" (review F7, d-1; DECISOES § 279).
  const prefixId = `${id}-prefix`;
  const suffixId = `${id}-unit`;
  const affix = !unit && suffix ? suffixId : null;
  const descId = `${id}-desc`;
  // Review F13b b-2 and f-2 (DECISOES § 593 and § 594): the card says one field's error, the first of the form. That field is
  // described by the card; another field in error, by its own message, which no role and no live region repeat (the card is
  // the one voice, § 102). On a phone, the message of a field after the card shows under it while it has the focus (f-2), since
  // the card is above the screen there; for the field the card names, it is only drawn (aria-hidden): the card says it.
  const said = message ?? (flagged ? flagMessage : undefined);
  const msgId = `${id}-error`;
  // A field a problem of the account points to has the problem as its message (second pass of the review, s-2; § 600).
  const own = said !== undefined && !named;
  const described = [desc ? descId : null, prefix ? prefixId : null, affix, marked ? (own ? msgId : HERO_ERROR_ID) : null, help ? helpId : null].filter(Boolean).join(' ');
  return (
    <div class={half ? (wide ? 'fo-field fo-field--half fo-field--wide' : 'fo-field fo-field--half') : 'fo-field'} data-state={marked ? 'error' : undefined}>
      <label class="fo-field__label" for={id}>
        <span>{label}</span>
        {tag && <span class="fo-tag">{tag}</span>}
      </label>
      {desc && (
        <span class="fo-sr" id={descId}>
          {desc}
        </span>
      )}
      <div class="fo-field__body">
        <div class="fo-input">
          {prefix && (
            <span class="fo-input__affix" id={prefixId}>
              {prefix}
            </span>
          )}
          <input
            ref={input}
            id={id}
            type="text"
            inputmode={negative ? 'text' : 'decimal'}
            autocomplete="off"
            spellcheck={false}
            value={draft}
            aria-invalid={marked ? 'true' : undefined}
            aria-describedby={described || undefined}
            onInput={(event) => {
              const text = event.currentTarget.value;
              setDraft(text);
              const parsed = read(text);
              // A value out of the range is said after a pause, not on the way to a valid one (DECISOES § 305).
              window.clearTimeout(settle.current);
              if (parsed === null) {
                settle.current = window.setTimeout(() => {
                  show(true);
                  drafting?.(id, false);
                }, SETTLE_MS);
                // The card's region waits while the text does not read, so the result of a prefix ("9" of "99") is never said
                // before the error (F16, item 3; review F13b b-3). Not while the error shows: the card has said it.
                if (!shown.current) drafting?.(id, true);
              } else {
                show(false);
                drafting?.(id, false);
              }
              if (parsed !== null && parsed !== value) onValue(parsed);
            }}
            onBlur={(event) => {
              const parsed = read(event.currentTarget.value);
              window.clearTimeout(settle.current);
              show(parsed === null);
              drafting?.(id, false);
              if (parsed !== null) setDraft(display(kind, parsed, lang, decimals));
            }}
          />
          {/* The alert icon inside the box, before the unit: never the colour alone, and no label goes to a second line (§ 545). */}
          {marked && (
            <span class="fo-input__flag" aria-hidden="true">
              <Icon raw={alertIcon} />
            </span>
          )}
          {unit ??
            (suffix && (
              <span class="fo-input__affix" id={suffixId}>
                {suffix}
              </span>
            ))}
        </div>
        {help && (
          <p class="fo-field__help" id={helpId}>
            {help}
          </p>
        )}
        {said !== undefined && (
          <p class="fo-field__msg" id={msgId} aria-hidden={own ? undefined : 'true'}>
            {said}
          </p>
        )}
      </div>
    </div>
  );
}
