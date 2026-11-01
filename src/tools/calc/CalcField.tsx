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
import { DECIMALS, display, inRange } from './form.ts';
import type { NumberSpec } from './types.ts';

export interface CalcFieldProps {
  id: string;
  kind: NumberSpec['kind'];
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
  prefix?: string | undefined;
  suffix?: string | undefined;
  /** The "example" tag of a typed rate. */
  tag?: string | undefined;
  half?: boolean | undefined;
  /** Replaces the suffix: the unit menu of the down payment. */
  unit?: ComponentChildren;
}

export default function CalcField(props: CalcFieldProps) {
  const { id, kind, min, max, negative = false, value, onValue, lang, label, help, error, over, prefix, suffix, tag, half, unit } = props;
  const [draft, setDraft] = useState(() => display(kind, value, lang));
  const [wrong, setWrong] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // A value that changes from outside (the scenario link, the unit of the down payment) shows in the
  // field, unless the person is typing in it right now.
  useEffect(() => {
    if (document.activeElement !== input.current) {
      setDraft(display(kind, value, lang));
      setWrong(false);
    }
  }, [value, kind, lang]);

  const read = (text: string): number | null => {
    const parsed = parseScaled(text, lang, DECIMALS[kind], negative);
    return parsed !== null && inRange({ min, max }, parsed) ? parsed : null;
  };

  const message = wrong ? error : over;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const described = [message ? errorId : null, help ? helpId : null].filter(Boolean).join(' ');
  return (
    <div class={half ? 'fo-field fo-field--half' : 'fo-field'} data-state={message ? 'error' : undefined}>
      <label class="fo-field__label" for={id}>
        <span>{label}</span>
        {tag && <span class="fo-tag">{tag}</span>}
      </label>
      <div class="fo-field__body">
        <div class="fo-input">
          {prefix && <span class="fo-input__affix">{prefix}</span>}
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
              setWrong(parsed === null);
              if (parsed !== null && parsed !== value) onValue(parsed);
            }}
            onBlur={(event) => {
              const parsed = read(event.currentTarget.value);
              if (parsed !== null) setDraft(display(kind, parsed, lang));
            }}
          />
          {unit ?? (suffix && <span class="fo-input__affix">{suffix}</span>)}
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
