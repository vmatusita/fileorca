// NumberField of the calculators (docs/design/components/NumberField): a decimal field with its unit as an
// affix. Never type="number" (it breaks the Portuguese comma and hides what the person typed);
// inputmode="decimal" opens the right keyboard (the one field that takes a minus gets the text keyboard: the
// decimal one of the iPhone has no minus sign). Every valid key press reaches the account at once (no
// half-second pause, unlike the image tools' field); a value outside the field's fixed range shows the
// range in words (aria-invalid, aria-describedby, the alert icon) and the last result stays. Leaving the
// field writes the number back in the page's format. The typed number never goes to the URL or an event.
// The label and the body (the box, the help, the error) are the two rows the calculator grid shares between
// two fields side by side, so their boxes line up whatever is above or under them (DECISOES § 137).
import { useEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import Icon from '../../icons/Icon.tsx';
import alertIcon from '../../../docs/design/assets/Icons/alert.svg?raw';
import { parseScaled, type NumberLang } from '../../calc/parse.ts';
import { SETTLE_MS, decimalsOf, display, inRange } from './form.ts';
import type { NumberSpec } from './types.ts';

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
  /** The range in words. */
  error: string;
  /** The value passes the field it depends on: this text is shown while it does. */
  over?: string | undefined;
  /** How the page writes decimals, added to the error when the text is not a number of its language. */
  hint?: string | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
  /** The "example" tag of a typed rate. */
  tag?: string | undefined;
  half?: boolean | undefined;
  /** Replaces the suffix: the unit menu of the down payment. */
  unit?: ComponentChildren;
  /** Tells the calculator whether the field shows its range error: the result on screen is then stale (§ 116). */
  report?: ((id: string, wrong: boolean) => void) | undefined;
}

export default function CalcField(props: CalcFieldProps) {
  const { id, kind, decimals, min, max, negative = false, value, onValue, lang, label, help, error, over, hint, prefix, suffix, tag, half, unit, report } = props;
  const places = decimalsOf(kind, decimals);
  const [draft, setDraft] = useState(() => display(kind, value, lang, decimals));
  const [wrong, setWrong] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const settle = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(settle.current), []);

  // A value that changes from outside (the scenario link, the unit of the down payment) shows in the
  // field, unless the person is typing in it right now.
  useEffect(() => {
    if (document.activeElement !== input.current) {
      setDraft(display(kind, value, lang, decimals));
      setWrong(false);
    }
  }, [value, kind, lang, decimals]);

  // A range error marks the result as the last one, with the line under it and the PDF and the CSV off (DECISOES § 116;
  // review F7, g-1: an age under the minimum kept an adult's result and printed the example's age in the PDF; DECISOES § 276).
  useEffect(() => {
    report?.(id, wrong);
    return () => report?.(id, false);
  }, [report, id, wrong]);

  const read = (text: string): number | null => {
    const parsed = parseScaled(text, lang, places, negative);
    return parsed !== null && inRange({ min, max }, parsed) ? parsed : null;
  };

  // A number written with the other separators ("11.5" in Portuguese, "6,5" in Spanish) gets the range and how to write the
  // decimals; anything else (a number out of the range, an empty field, letters, a whole-number field) gets the range alone
  // (review F6, d-1; DECISOES § 251 and § 254).
  const swapped = draft.replace(/[.,]/g, (mark) => (mark === '.' ? ',' : '.'));
  const unreadable =
    wrong && hint !== undefined && places > 0 && parseScaled(draft, lang, places, negative) === null && parseScaled(swapped, lang, places, negative) !== null;
  const message = wrong ? (unreadable ? `${error} ${hint}` : error) : over;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  // The unit is part of what the field is: a screen reader says "Thickness, in" and not only "Thickness" (review F7, d-1; DECISOES § 279).
  const prefixId = `${id}-prefix`;
  const suffixId = `${id}-unit`;
  const affix = !unit && suffix ? suffixId : null;
  const described = [prefix ? prefixId : null, affix, message ? errorId : null, help ? helpId : null].filter(Boolean).join(' ');
  return (
    <div class={half ? 'fo-field fo-field--half' : 'fo-field'} data-state={message ? 'error' : undefined}>
      <label class="fo-field__label" for={id}>
        <span>{label}</span>
        {tag && <span class="fo-tag">{tag}</span>}
      </label>
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
            aria-invalid={message ? 'true' : undefined}
            aria-describedby={described || undefined}
            onInput={(event) => {
              const text = event.currentTarget.value;
              setDraft(text);
              const parsed = read(text);
              // A value out of the range is said after a pause, not on the way to a valid one (DECISOES § 305).
              window.clearTimeout(settle.current);
              if (parsed === null) settle.current = window.setTimeout(() => setWrong(true), SETTLE_MS);
              else setWrong(false);
              if (parsed !== null && parsed !== value) onValue(parsed);
            }}
            onBlur={(event) => {
              const parsed = read(event.currentTarget.value);
              window.clearTimeout(settle.current);
              setWrong(parsed === null);
              if (parsed !== null) setDraft(display(kind, parsed, lang, decimals));
            }}
          />
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
        {message && (
          <p class="fo-field__error" id={errorId} role="alert">
            <Icon raw={alertIcon} />
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
