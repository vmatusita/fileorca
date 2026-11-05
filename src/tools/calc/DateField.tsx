// The date field of the pregnancy and cycle calculators (F7, decision 6; DECISOES § 262): the browser's own
// <input type="date">, which gives a calendar on the phone and the day as "2026-09-07" whatever the language of the
// device, with the min and max of the field's fixed range. It is built like the NumberField (label, box, the FieldError
// with the alert icon) and only from tokens. An empty, half-typed or out-of-range day shows the range in words and the last
// result stays; nothing typed here ever reaches the URL or an event. F13b (DECISOES § 545): the words are said in the card, as
// for the NumberField; the field keeps its stroke and shows the alert icon inside its box.
import { useEffect, useRef, useState } from 'preact/hooks';
import Icon from '../../icons/Icon.tsx';
import alertIcon from '../../../docs/design/assets/Icons/alert.svg?raw';
import { HERO_ERROR_ID } from './CalcField.tsx';
import { SETTLE_MS, dayInRange } from './form.ts';
import type { FieldError } from './store.ts';

export interface DateFieldProps {
  id: string;
  /** "2026-09-07". */
  value: string;
  min: string;
  max: string;
  onValue: (value: string) => void;
  label: string;
  /** The range in words. */
  error: string;
  half?: boolean | undefined;
  /** Tells the calculator the error the field shows, or null (§ 116, as in the CalcField). */
  report?: ((id: string, error: FieldError | null) => void) | undefined;
}

export default function DateField({ id, value, min, max, onValue, label, error, half, report }: DateFieldProps) {
  const [draft, setDraft] = useState(value);
  const [wrong, setWrong] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const settle = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(settle.current), []);

  // A day that changes from outside (the scenario link) shows in the field, unless the person is typing in it.
  useEffect(() => {
    if (document.activeElement !== input.current) {
      setDraft(value);
      setWrong(false);
    }
  }, [value]);

  useEffect(() => {
    report?.(id, wrong ? { message: error, label } : null);
    return () => report?.(id, null);
  }, [report, id, wrong, error, label]);

  // As in the CalcField: a day out of the range (or half typed) is said after a pause or on leaving (DECISOES § 305).
  const read = (text: string, now = false) => {
    setDraft(text);
    const ok = dayInRange({ min, max }, text);
    window.clearTimeout(settle.current);
    if (ok || now) setWrong(!ok);
    else settle.current = window.setTimeout(() => setWrong(true), SETTLE_MS);
    if (ok && text !== value) onValue(text);
  };
  return (
    <div class={half ? 'fo-field fo-field--half' : 'fo-field'} data-state={wrong ? 'error' : undefined}>
      <label class="fo-field__label" for={id}>
        <span>{label}</span>
      </label>
      <div class="fo-field__body">
        <div class="fo-input fo-input--date">
          <input
            ref={input}
            id={id}
            type="date"
            min={min}
            max={max}
            autocomplete="off"
            value={draft}
            aria-invalid={wrong ? 'true' : undefined}
            aria-describedby={wrong ? HERO_ERROR_ID : undefined}
            onInput={(event) => read(event.currentTarget.value)}
            onChange={(event) => read(event.currentTarget.value)}
            onBlur={(event) => read(event.currentTarget.value, true)}
          />
          {wrong && (
            <span class="fo-input__flag" aria-hidden="true">
              <Icon raw={alertIcon} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
