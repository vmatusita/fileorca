// F16 (item 8; F15 R-b-1; DECISOES § 692): where the focus goes after a render of the image island when Tab left a number
// field of the options for a control of a row of the list, in a batch, after the result. The field commits its value on
// blur and the batch is made again at once: in the render that follows, before the focus lands, the row swaps its controls
// (Download gives way to Cancel, and back; the pick button of Compress and Crop goes while the row waits), and the browser
// leaves the focus on the page. The island notes the row and the kind of control (its tag and classes) in the capture phase
// of the blur, and after each render asks this module what to do with that mark.
// Plain decisions, no browser API (unit-tested in tests/unit/image-landing.test.ts), imported statically by the island.

/** What the island sees after a render, for the mark of the control the focus was going to. */
export interface LandingSeen {
  /** The page has the focus (the body, or nothing). */
  lost: boolean;
  /** The focus is on the place the mark holds: the control it was going to, or the place the island gave it since. */
  onHere: boolean;
  /** That place is still in the document. */
  hereConnected: boolean;
  /** The row of the mark is on screen. */
  row: boolean;
  /** The row has the control the focus was going to, or one of the same kind (the same tag and the same classes). */
  control: boolean;
  /** The batch is being made again: the row may swap its controls once more. */
  busy: boolean;
}

/**
 * - `drop`: the mark goes and the focus stays where it is. The person put it somewhere (another Tab, Shift+Tab back to the
 *   field, a click on the page: the place the mark holds is still there, so the island did not lose it), or the row went
 *   away (the rows after and before it take the focus, as they already did).
 * - `control`: the control of that kind in the row takes the focus.
 * - `row`: the row itself takes it (tabindex -1, named after its file) while it waits without that control.
 * - `first`: the batch is done and the row has no control of that kind (a Cancel gave way to a Download): its first control.
 */
export type LandingMove = 'drop' | 'control' | 'row' | 'first';

export function landingMove(seen: LandingSeen): LandingMove {
  if (seen.lost ? seen.hereConnected : !seen.onHere) return 'drop';
  if (!seen.row) return 'drop';
  if (seen.control) return 'control';
  return seen.busy ? 'row' : 'first';
}

/**
 * The mark is spent when it is dropped or once the batch is done (§ 510: only with its target on screen): while the batch
 * is being made again, the row may swap the control once more, and the mark brings the focus back to it.
 */
export function landingSpent(seen: LandingSeen, move: LandingMove): boolean {
  return move === 'drop' || !seen.busy;
}
