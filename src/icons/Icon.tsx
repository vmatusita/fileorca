// An inline icon inside the Preact island: the same markup on the server and after hydration
// (Preact keeps innerHTML while hydrating). `raw` is the icon file imported with `?raw`.
import { iconInner } from './svg.ts';

export interface IconProps {
  raw: string;
  class?: string;
}

export default function Icon({ raw, class: extra }: IconProps) {
  return (
    <svg
      class={extra ? `fo-icon ${extra}` : 'fo-icon'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: iconInner(raw) }}
    />
  );
}
