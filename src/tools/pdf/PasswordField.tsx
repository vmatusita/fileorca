// The password field (F5a, decision 6; DECISOES § 152): the NumberField's box with a "Show" toggle button
// (aria-pressed, aria-controls) that switches the input between password and text. The label is visible, the rule is
// a help line, and the error says the rule again, tied by aria-describedby with aria-invalid. `autocomplete` is
// new-password in Protect PDF and current-password in Unlock PDF. Nothing typed here is kept or sent anywhere: it lives
// in the panel's state until the page closes.
import { useState } from 'preact/hooks';
import Icon from '../../icons/Icon.tsx';
import alertIcon from '../../../docs/design/assets/Icons/alert.svg?raw';

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
  show: string;
  hide: string;
  onEnter?: () => void;
}

export default function PasswordField({ id, label, value, onInput, autocomplete, help, error, show, hide, onEnter }: PasswordFieldProps) {
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
        <button type="button" class="fo-pass__toggle" aria-pressed={visible} aria-controls={id} onClick={() => setVisible(!visible)}>
          {visible ? hide : show}
        </button>
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
