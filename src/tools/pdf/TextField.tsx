// A free-text field in the NumberField's style (F5a): the watermark text, the typed signature and the page ranges.
// The value is committed after a short pause or on blur, like the NumberField; the error says the rule, tied by
// aria-describedby. What is typed stays in the panel: it never goes to a URL, a name or an event (decision 8).
import { useEffect, useRef, useState } from 'preact/hooks';
import Icon from '../../icons/Icon.tsx';
import alertIcon from '../../../docs/design/assets/Icons/alert.svg?raw';
import { TYPING_PAUSE_MS } from '../image/NumberField.tsx';

export interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onCommit: (value: string) => void;
  help?: string;
  error?: string | null;
  inputmode?: 'text' | 'numeric';
  maxLength?: number;
  /** A button inside the box, after the text (the "Pick these" of a page range). */
  action?: { label: string; onClick: (text: string) => void };
}

export default function TextField({ id, label, value, onCommit, help, error, inputmode = 'text', maxLength, action }: TextFieldProps) {
  const [draft, setDraft] = useState(value);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (document.activeElement !== input.current) setDraft(value);
  }, [value]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const described = [error ? errorId : null, help ? helpId : null].filter(Boolean).join(' ');
  const commit = (text: string) => {
    window.clearTimeout(timer.current);
    if (text !== value) onCommit(text);
  };
  return (
    <div class="fo-field" data-state={error ? 'error' : undefined}>
      <label class="fo-field__label" for={id}>
        {label}
      </label>
      <div class="fo-input">
        <input
          ref={input}
          id={id}
          type="text"
          inputmode={inputmode}
          autocomplete="off"
          spellcheck={false}
          value={draft}
          {...(maxLength ? { maxLength } : {})}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={described || undefined}
          onInput={(event) => {
            const text = event.currentTarget.value;
            setDraft(text);
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => commit(text), TYPING_PAUSE_MS);
          }}
          onBlur={(event) => commit(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            commit(event.currentTarget.value);
            action?.onClick(event.currentTarget.value);
          }}
        />
        {action && (
          <button type="button" class="fo-pass__toggle" onClick={() => {
            const text = input.current?.value ?? draft;
            commit(text);
            action.onClick(text);
          }}>
            {action.label}
          </button>
        )}
      </div>
      {error && (
        <p class="fo-field__error" id={errorId}>
          <Icon raw={alertIcon} />
          {error}
        </p>
      )}
      {help && (
        <p class="fo-field__help" id={helpId}>
          {help}
        </p>
      )}
    </div>
  );
}
