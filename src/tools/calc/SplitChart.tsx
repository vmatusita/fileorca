// SplitChart (docs/design/components/SplitChart): principal against interest as one stacked bar, an SVG of
// its own with no library. Principal in brand (brand-on-deep inside the ResultHero), interest in coral with
// a diagonal hatch, so the two parts read apart without colour and in black and white. The bar is
// role="img" with both values and shares in its name, and the legend repeats them in text. No axis, no
// grid, no entrance animation. One chart per page, so its pattern and clip ids are fixed.
export interface SplitPart {
  label: string;
  cents: number;
  /** The amount as the legend writes it. */
  text: string;
}

/** Whole-percent shares of a and b that add up to 100 (b gets the remainder). */
export function shares(a: number, b: number): [number, number] {
  const total = a + b;
  if (total <= 0) return [100, 0];
  const first = Math.round((a / total) * 100);
  return [first, 100 - first];
}

export default function SplitChart({ a, b, name }: { a: SplitPart; b: SplitPart; name: string }) {
  const [pa, pb] = shares(a.cents, b.cents);
  return (
    <div class="fo-split">
      <svg class="fo-split__bar" width="100%" height="20" role="img" aria-label={name}>
        <defs>
          <clipPath id="fo-split-clip">
            <rect width="100%" height="20" rx="10" />
          </clipPath>
          <pattern id="fo-split-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect class="fo-split__coral" width="8" height="8" />
            <rect class="fo-split__hatch" width="2" height="8" />
          </pattern>
        </defs>
        <g clip-path="url(#fo-split-clip)">
          <rect class="fo-split__principal" width={`${pa}%`} height="20" />
          <rect x={`${pa}%`} width={`${pb}%`} height="20" fill="url(#fo-split-hatch)" />
          {pa > 0 && pb > 0 && <line class="fo-split__gap" x1={`${pa}%`} x2={`${pa}%`} y1="0" y2="20" />}
        </g>
      </svg>
      {/* The words of each item flow as one text, so a long label wraps like a sentence, the share stays with
          its amount, and a long amount never widens the page. */}
      <ul class="fo-split__legend">
        <li>
          <i class="fo-split__key fo-split__key--a" />
          <span>
            {a.label} <b>{a.text}</b>{` · ${pa}%`}
          </span>
        </li>
        <li>
          <i class="fo-split__key fo-split__key--b" />
          <span>
            {b.label} <b>{b.text}</b>{` · ${pb}%`}
          </span>
        </li>
      </ul>
    </div>
  );
}
