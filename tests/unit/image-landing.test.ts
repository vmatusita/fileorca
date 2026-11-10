import { describe, expect, it } from 'vitest';
import { landingMove, landingSpent, type LandingSeen } from '../../src/tools/image/landing.ts';

// F16 (item 8; F15 R-b-1; DECISOES § 692): what the image island does with the mark of a number field after a render. Tab
// left the field for a control of a row; the blur made the batch again, and the render swapped that control. The answers
// are written by hand, one per state the island goes through (measured in Chromium and WebKit, see image-focus.spec.ts).

const seen = (over: Partial<LandingSeen>): LandingSeen => ({
  lost: false,
  onHere: false,
  hereConnected: true,
  row: true,
  control: false,
  busy: true,
  ...over,
});

describe('the focus after Tab out of a number field, while the batch is made again', () => {
  it('the control gave way before the focus landed, and the row waits without it: the row itself, and the mark stays', () => {
    const now = seen({ lost: true, hereConnected: false });
    expect(landingMove(now)).toBe('row');
    expect(landingSpent(now, 'row')).toBe(false);
  });

  it('the row already has a control of that kind again (the pick button of a row that works): that control', () => {
    expect(landingMove(seen({ lost: true, hereConnected: false, control: true }))).toBe('control');
  });

  it('from the row, the control comes back: the focus goes to it, and the mark stays while the batch runs', () => {
    const now = seen({ onHere: true, control: true });
    expect(landingMove(now)).toBe('control');
    expect(landingSpent(now, 'control')).toBe(false);
  });

  it('the row keeps the focus while the control is not back', () => {
    expect(landingMove(seen({ onHere: true }))).toBe('row');
  });

  it('the control that the focus is on gives way again: back to the row', () => {
    expect(landingMove(seen({ lost: true, hereConnected: false }))).toBe('row');
  });
});

describe('the mark is spent when the batch is done', () => {
  it('with the focus on its control', () => {
    const now = seen({ onHere: true, control: true, busy: false });
    expect(landingMove(now)).toBe('control');
    expect(landingSpent(now, 'control')).toBe(true);
  });

  it('with the row and no control of that kind (a Cancel gave way to a Download): the first control of the row', () => {
    const now = seen({ onHere: true, busy: false });
    expect(landingMove(now)).toBe('first');
    expect(landingSpent(now, 'first')).toBe(true);
  });
});

describe('the focus is never held: the mark drops', () => {
  it('when the person puts the focus elsewhere (another Tab, Shift+Tab back to the field)', () => {
    const now = seen({ onHere: false });
    expect(landingMove(now)).toBe('drop');
    expect(landingSpent(now, 'drop')).toBe(true);
  });

  it('when the page has the focus but the place of the mark is still there (a click on the page, or a field that stays)', () => {
    expect(landingMove(seen({ lost: true, hereConnected: true }))).toBe('drop');
    expect(landingMove(seen({ lost: true, hereConnected: true, busy: false }))).toBe('drop');
  });

  it('when the row went away: the rows after and before it take the focus, as before', () => {
    expect(landingMove(seen({ lost: true, hereConnected: false, row: false }))).toBe('drop');
    expect(landingMove(seen({ onHere: true, row: false }))).toBe('drop');
  });
});
