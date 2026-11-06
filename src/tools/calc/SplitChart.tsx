// SplitChart (docs/design/components/SplitChart): principal against interest as one stacked bar, an SVG of
// its own with no library. Principal in brand (brand-on-deep inside the ResultHero), interest in coral with
// a diagonal hatch, so the two parts read apart without colour and in black and white. The bar is
// role="img" with both values and shares in its name, and the legend repeats them in text. No axis, no
// grid, no entrance animation. One chart per page, so its pattern and clip ids are fixed.
import type { ComponentChildren } from 'preact';

export interface SplitPart {
  label: string;
  cents: number;
  /** The amount as the legend writes it. */
  text: string;
}

/**
 * The room each line of the legend keeps in the card, drawn hidden (review F13b a-1; DECISOES § 595): the line with the widest
 * numbers the card may show, so other numbers never wrap it again.
 */
export type Reserve = readonly [string, string];

/** Whole-percent shares of a and b that add up to 100 (b gets the remainder). */
export function shares(a: number, b: number): [number, number] {
  const total = a + b;
  if (total <= 0) return [100, 0];
  const first = Math.round((a / total) * 100);
  return [first, 100 - first];
}

/**
 * The pair variant (F13b, D-38; DECISOES § 549): where the account compares two systems on the same loan (the SAC × PRICE),
 * one bar per system on one scale, so the longer bar is the one that pays more interest. Each bar is the same principal (in
 * brand-on-deep) and the interest of its system (coral with the hatch); the widest is the whole width. The pair is role="img"
 * with both totals in its name, and the legend says them in text. Each bar has its own clip and pattern ids.
 */
export function PairChart({ name, principal, interest, rows, reserve }: { name: string; principal: SplitPart; interest: ComponentChildren; rows: { name: string; cents: number }[]; reserve?: Reserve | undefined }) {
  const widest = Math.max(1, ...rows.map((row) => principal.cents + row.cents));
  return (
    <div class="fo-split fo-split--pair">
      <div class="fo-split__pair" role="img" aria-label={name}>
        {rows.map((row, index) => {
          const total = principal.cents + row.cents;
          const [pa, pb] = shares(principal.cents, row.cents);
          return (
            <div class="fo-split__row" key={row.name}>
              <span class="fo-split__name" aria-hidden="true">
                {row.name}
              </span>
              <svg class="fo-split__bar" width={`${Math.round((total / widest) * 1000) / 10}%`} height="20" aria-hidden="true">
                <defs>
                  <clipPath id={`fo-split-clip-${index}`}>
                    <rect width="100%" height="20" rx="10" />
                  </clipPath>
                  <pattern id={`fo-split-hatch-${index}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect class="fo-split__coral" width="8" height="8" />
                    <rect class="fo-split__hatch" width="2" height="8" />
                  </pattern>
                </defs>
                <g clip-path={`url(#fo-split-clip-${index})`}>
                  <rect class="fo-split__principal" width={`${pa}%`} height="20" />
                  <rect x={`${pa}%`} width={`${pb}%`} height="20" fill={`url(#fo-split-hatch-${index})`} />
                  {pa > 0 && pb > 0 && <line class="fo-split__gap" x1={`${pa}%`} x2={`${pa}%`} y1="0" y2="20" />}
                </g>
              </svg>
            </div>
          );
        })}
      </div>
      <ul class="fo-split__legend">
        <li>
          <i class="fo-split__key fo-split__key--a" />
          <span data-reserve={reserve?.[0]}>
            <span>
              {principal.label} <b>{principal.text}</b>
            </span>
          </span>
        </li>
        <li>
          <i class="fo-split__key fo-split__key--b" />
          <span data-reserve={reserve?.[1]}>
            <span>{interest}</span>
          </span>
        </li>
      </ul>
    </div>
  );
}

/** `percent` writes a share as the page's language does: 68% (en, pt), 68 % (es). */
export default function SplitChart({ a, b, name, percent, reserve }: { a: SplitPart; b: SplitPart; name: string; percent: (value: number) => string; reserve?: Reserve | undefined }) {
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
          <span data-reserve={reserve?.[0]}>
            <span>
              {a.label} <b>{a.text}</b>{` · ${percent(pa)}`}
            </span>
          </span>
        </li>
        <li>
          <i class="fo-split__key fo-split__key--b" />
          <span data-reserve={reserve?.[1]}>
            <span>
              {b.label} <b>{b.text}</b>{` · ${percent(pb)}`}
            </span>
          </span>
        </li>
      </ul>
    </div>
  );
}
