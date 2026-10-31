// An inline icon inside the Preact island: the same markup on the server and after hydration
// (Preact keeps innerHTML while hydrating). `raw` is the icon file imported with `?raw`; `inner` is
// the already-extracted children of the icon (what the page computes at build and hands to the
// island in its props, so the island does not carry the icon).
import { iconInner } from './svg.ts';

export type IconProps = { class?: string } & ({ raw: string; inner?: undefined } | { inner: string; raw?: undefined });

export default function Icon({ raw, inner, class: extra }: IconProps) {
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
      dangerouslySetInnerHTML={{ __html: inner ?? iconInner(raw as string) }}
    />
  );
}
