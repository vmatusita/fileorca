// NumberField (docs/design/components/NumberField): a whole-number field with its unit as an affix,
// for the pixels and the percentage of Resize and the box of Crop. Never type="number" (it breaks
// the comma of Portuguese and hides the text the person typed); inputmode="decimal" opens the right
// keyboard on a phone. The tool is told about a value only when it is valid: a half-typed or wrong
// number shows the error in words (aria-invalid, aria-describedby, the alert icon) and the result of
// the last valid value stays on screen. Typing waits until the person pauses (about half a second)
// before the batch is processed again; leaving the field commits at once. The typed number is never
// written to the URL or to an event.
import { useEffect, useRef, useState } from 'preact/hooks';
import Icon from '../../icons/Icon.tsx';
import alertIcon from '../../../docs/design/assets/Icons/alert.svg?raw';

export const TYPING_PAUSE_MS = 500;

/** The whole number in `text` when it is one inside [min, max], else null. Spaces around it are ignored. */
export function parseWhole(text: string, min: number, max: number): number | null {
  const clean = text.trim();
  if (!/^\d{1,7}$/.test(clean)) return null;
  const value = Number(clean);
  return value >= min && value <= max ? value : null;
}

export interface NumberFieldProps {
  id: string;
  label: string;
  /** The last valid value: what the tool is using right now. */
  value: number;
  /** Called with a valid value, after the typing pause or when the field loses focus. */
  onCommit: (value: number) => void;
  min: number;
  max: number;
  /** Shown in words when the text is not a whole number from min to max. */
  error: string;
  /** Unit after the number ("px", "%"). */
  suffix?: string;
  /** Id of a help line that also describes the field. */
  describedBy?: string;
  pause?: number;
}

export default function NumberField({ id, label, value, onCommit, min, max, error, suffix, describedBy, pause = TYPING_PAUSE_MS }: NumberFieldProps) {
  const [draft, setDraft] = useState(String(value));
  const [wrong, setWrong] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const committed = useRef(onCommit);
  committed.current = onCommit;

  // A value that changes from outside (the other side of a locked ratio, another file picked) shows
  // in the field, unless the person is typing in it right now.
  useEffect(() => {
    if (document.activeElement !== input.current) {
      setDraft(String(value));
      setWrong(false);
    }
  }, [value]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function commit(text: string): boolean {
    const parsed = parseWhole(text, min, max);
    setWrong(parsed === null);
    if (parsed === null) return false;
    if (parsed !== value) committed.current(parsed);
    return true;
  }

  const errorId = `${id}-error`;
  const described = [wrong ? errorId : null, describedBy ?? null].filter(Boolean).join(' ');
  return (
    <div class="fo-field" data-state={wrong ? 'error' : undefined}>
      <label class="fo-field__label" for={id}>
        {label}
      </label>
      <div class="fo-input">
        <input
          ref={input}
          id={id}
          type="text"
          inputmode="decimal"
          autocomplete="off"
          spellcheck={false}
          value={draft}
          aria-invalid={wrong ? 'true' : undefined}
          aria-describedby={described || undefined}
          onInput={(event) => {
            const text = event.currentTarget.value;
            setDraft(text);
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => commit(text), pause);
          }}
          onBlur={(event) => {
            window.clearTimeout(timer.current);
            const text = event.currentTarget.value;
            if (commit(text)) setDraft(String(parseWhole(text, min, max)));
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              window.clearTimeout(timer.current);
              commit(event.currentTarget.value);
            }
          }}
        />
        {suffix && <span class="fo-input__affix">{suffix}</span>}
      </div>
      {wrong && (
        <p class="fo-field__error" id={errorId} role="alert">
          <Icon raw={alertIcon} />
          {error}
        </p>
      )}
    </div>
  );
}
