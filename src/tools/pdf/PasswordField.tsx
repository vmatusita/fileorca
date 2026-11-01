// The password field (F5a, decision 6; DECISOES § 152): the NumberField's box with a "Show" toggle button
// (aria-pressed, aria-controls) that switches the input between password and text. The label is visible, the rule is
// a help line, and the error says the rule again, tied by aria-describedby with aria-invalid, in an alert so it is
// said when it shows (DECISOES § 177). `autocomplete` is new-password in Protect PDF and current-password in Unlock
// PDF. Nothing typed here is kept or sent anywhere: it lives in the panel's state until the page closes.
import { useState } from 'preact/hooks';
import FieldError from './FieldError.tsx';

export interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onInput: (value: string) => void;
  autocomplete: 'new-password' | 'current-password';
  /** The rule, shown under the field. */
  help?: string;
  /** Shown instead of nothing when the value breaks the rule. */
  error?: string | null;
  /** The visible text of the toggle ("Show"), the same in both states. */
  show: string;
  /** The toggle's name, which starts with `show` and names the field ("Show password"); aria-pressed says the state. */
  showName: string;
  onEnter?: () => void;
}

export default function PasswordField({ id, label, value, onInput, autocomplete, help, error, show, showName, onEnter }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const described = [error ? errorId : null, help ? helpId : null].filter(Boolean).join(' ');
  return (
    <div class="fo-field fo-pass" data-state={error ? 'error' : undefined}>
      <label class="fo-field__label" for={id}>
        {label}
      </label>
      <div class="fo-input">
        <input
          id={id}
          type={(visible ? 'text' : 'password') as 'text'}
          autocomplete={autocomplete}
          autocapitalize="off"
          spellcheck={false}
          value={value}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={described || undefined}
          onInput={(event) => onInput(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && onEnter) {
              event.preventDefault();
              onEnter();
            }
          }}
        />
        {/* One name in both states, with the field in it (two toggles on Protect PDF), and the state in aria-pressed:
            a label that flipped to "Hide" while pressed said the opposite of the state (DECISOES § 177). */}
        <button type="button" class="fo-pass__toggle" aria-label={showName} aria-pressed={visible} aria-controls={id} onClick={() => setVisible(!visible)}>
          {show}
        </button>
      </div>
      {error && <FieldError id={errorId}>{error}</FieldError>}
      {help && (
        <p class="fo-field__help" id={helpId}>
          {help}
        </p>
      )}
    </div>
  );
}
