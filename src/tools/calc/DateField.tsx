// The date field of the pregnancy and cycle calculators (F7, decision 6; DECISOES § 262): the browser's own
// <input type="date">, which gives a calendar on the phone and the day as "2026-09-07" whatever the language of the
// device, with the min and max of the field's fixed range. It is built like the NumberField (label, box, the FieldError
// with the alert icon and role="alert") and only from tokens. An empty, half-typed or out-of-range day shows the
// range in words and the last result stays; nothing typed here ever reaches the URL or an event.
import { useEffect, useRef, useState } from 'preact/hooks';
import Icon from '../../icons/Icon.tsx';
import alertIcon from '../../../docs/design/assets/Icons/alert.svg?raw';
import { dayInRange } from './form.ts';

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
  /** Tells the calculator whether the field shows its range error (§ 116, as in the CalcField). */
  report?: ((id: string, wrong: boolean) => void) | undefined;
}

export default function DateField({ id, value, min, max, onValue, label, error, half, report }: DateFieldProps) {
  const [draft, setDraft] = useState(value);
  const [wrong, setWrong] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // A day that changes from outside (the scenario link) shows in the field, unless the person is typing in it.
  useEffect(() => {
    if (document.activeElement !== input.current) {
      setDraft(value);
      setWrong(false);
    }
  }, [value]);

  useEffect(() => {
    report?.(id, wrong);
    return () => report?.(id, false);
  }, [report, id, wrong]);

  const read = (text: string) => {
    setDraft(text);
    const ok = dayInRange({ min, max }, text);
    setWrong(!ok);
    if (ok && text !== value) onValue(text);
  };
  const errorId = `${id}-error`;
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
            aria-describedby={wrong ? errorId : undefined}
            onInput={(event) => read(event.currentTarget.value)}
            onChange={(event) => read(event.currentTarget.value)}
          />
        </div>
        {wrong && (
          <p class="fo-field__error" id={errorId} role="alert">
            <Icon raw={alertIcon} />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
