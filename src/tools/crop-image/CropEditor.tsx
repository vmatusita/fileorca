// The crop editor: the picture with the crop box over it, the four corners as handles, and the rest of the
// picture dimmed. The box moves and changes size with the pointer (drag inside it to move, drag a corner to
// resize) and with the keyboard (the box takes focus: arrows move it, Shift with the arrows changes its
// size). The four number fields beside it are the accessible way to the same values.
//
// While the pointer or the keys are working the box follows them at once (a local draft); the tool is told
// only when they stop (the pointer is lifted, or a short pause after the last key), so the photo is not
// processed on every step. The CSS (components.css, "Crop editor") reads --x --y --w --h as percentages of
// the picture and --crop-ratio as its shape; the handles are decorative for the pointer (aria-hidden).
import { useEffect, useRef, useState } from 'preact/hooks';
import type { TargetedKeyboardEvent, TargetedPointerEvent } from 'preact';
import type { Box } from '../../engine/image/types.ts';
import { ARROWS, dragCorner, moveBox, nudgeBox, percents, type Arrow, type Corner, type Size } from './box.ts';

/** How long after the last key the tool is told about the new box. */
export const KEY_PAUSE_MS = 350;

const CORNERS: readonly Corner[] = ['nw', 'ne', 'sw', 'se'];
/** Side of a handle on screen (--tap-min in components.css, the crop editor). */
const HANDLE_PX = 48;

export interface CropEditorProps {
  /** The picture to crop (an object URL; it never leaves the device). */
  url: string;
  size: Size;
  /** The box the tool is using for this picture. */
  box: Box;
  /** Width over height, or null for Free. */
  ratio: number | null;
  /** Name of the box for assistive technology ("Crop area"). */
  label: string;
  /** What the box covers, with its name: a group has no value of its own (F2 low 1). */
  value: (box: Box) => string;
  /** Id of the line that tells how to use the keyboard. */
  helpId: string;
  onChange: (box: Box) => void;
}

interface Drag {
  pointerId: number;
  corner: Corner | null;
  start: Box;
  originX: number;
  originY: number;
}

const sameBox = (a: Box, b: Box) => a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

export default function CropEditor({ url, size, box, ratio, label, value, helpId, onChange }: CropEditorProps) {
  const [live, setLive] = useState<Box | null>(null);
  const liveRef = useRef<Box | null>(null);
  const boxRef = useRef(box);
  boxRef.current = box;
  const changed = useRef(onChange);
  changed.current = onChange;
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const shown = live ?? box;
  const share = percents(shown, size);

  function show(next: Box): void {
    liveRef.current = next;
    setLive(next);
  }

  /** Tells the tool about the draft (when it differs from the box in use) and goes back to following the tool. */
  function commit(): void {
    window.clearTimeout(timer.current);
    const next = liveRef.current;
    liveRef.current = null;
    setLive(null);
    if (next && !sameBox(next, boxRef.current)) changed.current(next);
  }

  /** Display pixels per screen pixel of the picture on the page. */
  function scale(): { kx: number; ky: number; left: number; top: number } | null {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    return { kx: size.width / rect.width, ky: size.height / rect.height, left: rect.left, top: rect.top };
  }

  function onPointerDown(event: TargetedPointerEvent<HTMLDivElement>): void {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const handle = (event.target as HTMLElement).closest<HTMLElement>('[data-corner]');
    // The 48 px handles cover a small box: inside its edges the pointer moves it, the outer half of a handle resizes
    // it (F2 low 3, review d-06, DECISOES § 102).
    const rect = event.currentTarget.getBoundingClientRect();
    const small = rect.width < 2 * HANDLE_PX || rect.height < 2 * HANDLE_PX;
    const inside = event.clientX > rect.left && event.clientX < rect.right && event.clientY > rect.top && event.clientY < rect.bottom;
    drag.current = {
      pointerId: event.pointerId,
      corner: small && inside ? null : ((handle?.dataset['corner'] as Corner | undefined) ?? null),
      start: liveRef.current ?? boxRef.current,
      originX: event.clientX,
      originY: event.clientY,
    };
    window.clearTimeout(timer.current);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
  }

  function onPointerMove(event: TargetedPointerEvent<HTMLDivElement>): void {
    const current = drag.current;
    const metrics = scale();
    if (!current || current.pointerId !== event.pointerId || !metrics) return;
    if (current.corner) {
      const point = { x: (event.clientX - metrics.left) * metrics.kx, y: (event.clientY - metrics.top) * metrics.ky };
      show(dragCorner(current.start, current.corner, point, size, ratio));
    } else {
      show(moveBox(current.start, (event.clientX - current.originX) * metrics.kx, (event.clientY - current.originY) * metrics.ky, size));
    }
  }

  function onPointerEnd(event: TargetedPointerEvent<HTMLDivElement>): void {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    commit();
  }

  function onKeyDown(event: TargetedKeyboardEvent<HTMLDivElement>): void {
    if (!(ARROWS as readonly string[]).includes(event.key) || event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault();
    show(nudgeBox(liveRef.current ?? boxRef.current, event.key as Arrow, event.shiftKey, size, ratio));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(commit, KEY_PAUSE_MS);
  }

  return (
    <div
      class="fo-crop"
      ref={frame}
      style={`--crop-ratio:${(size.width / size.height).toFixed(5)};--x:${share.x};--y:${share.y};--w:${share.w};--h:${share.h}`}
    >
      <div class="fo-crop__stage">
        <img class="fo-crop__img" src={url} alt="" draggable={false} width={size.width} height={size.height} />
        {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
          <div class="fo-crop__scrim" data-side={side} key={side} />
        ))}
      </div>
      <div
        class="fo-crop__box"
        role="group"
        tabindex={0}
        aria-label={`${label}, ${value(shown)}`}
        aria-describedby={helpId}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (liveRef.current && !drag.current) commit();
        }}
      >
        {CORNERS.map((corner) => (
          <span class="fo-crop__handle" data-corner={corner} aria-hidden="true" key={corner} />
        ))}
      </div>
    </div>
  );
}
