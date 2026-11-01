// The error line of a field of the PDF tools, in the design system's error pattern (docs/design/README, "Cor": danger
// with the alert icon and the sentence, never only the colour) and said when it shows (role="alert", WCAG 4.1.3). One
// piece for every field error of the PDF panel, so none goes without its icon again (DECISOES § 177 and § 181).
import type { ComponentChildren } from 'preact';
import Icon from '../../icons/Icon.tsx';
import alertIcon from '../../../docs/design/assets/Icons/alert.svg?raw';

export default function FieldError({ id, children }: { id?: string; children: ComponentChildren }) {
  return (
    <p class="fo-field__error" id={id} role="alert">
      <Icon raw={alertIcon} />
      {children}
    </p>
  );
}
