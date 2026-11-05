// BeforeAfter (docs/design/components/BeforeAfter): the proof that the image got lighter without
// getting ugly. Two stacked images, the one on top (the result) clipped by --pos; an invisible
// range input over everything takes the pointer, touch and the arrow keys. The box takes the shape
// of the real image (--ba-ratio), so it never changes size when the pictures finish loading and the
// Download above it never moves. It starts at 50 %. F13a (UX-04 A): it only opens when the person asks, behind the
// "Before and after" button of the result card, and its handle has the two arrows (D-09): it drags both ways.
import { useState } from 'preact/hooks';

export interface BeforeAfterProps {
  /** Name of the range: "Compare before and after". */
  label: string;
  /** Displayable pictures: the original (or a decoded preview of it) and the result. */
  beforeUrl: string;
  afterUrl: string;
  /** "Before · 2.4 MB" and "After · 780 KB". */
  beforeTag: string;
  afterTag: string;
  /** Display size of the picture, for the shape of the box. */
  width: number;
  height: number;
  /** The result picture cannot be shown in this browser (AVIF in a WebKit that cannot read it). */
  onBroken?: () => void;
}

export default function BeforeAfter({ label, beforeUrl, afterUrl, beforeTag, afterTag, width, height, onBroken }: BeforeAfterProps) {
  const [position, setPosition] = useState(50);
  const ratio = width > 0 && height > 0 ? (width / height).toFixed(4) : '1.3333';
  return (
    <div class="fo-ba" style={`--pos:${position}%;--ba-ratio:${ratio}`}>
      <img src={beforeUrl} alt="" decoding="async" />
      <img class="fo-ba__after" src={afterUrl} alt="" decoding="async" onError={onBroken} />
      <span class="fo-ba__tag fo-ba__tag--l">{beforeTag}</span>
      <span class="fo-ba__tag fo-ba__tag--r">{afterTag}</span>
      <input
        class="fo-ba__range"
        type="range"
        min={0}
        max={100}
        value={position}
        aria-label={label}
        onInput={(event) => setPosition(Number(event.currentTarget.value))}
      />
      <span class="fo-ba__line" />
      <span class="fo-ba__knob">
        {/* The two arrows of the handle (D-09; DECISOES § 471): no icon file draws them, so they are inline. */}
        <svg class="fo-icon fo-icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m9 7-4 5 4 5" />
          <path d="m15 7 4 5-4 5" />
        </svg>
      </span>
    </div>
  );
}
