import { describe, expect, it } from 'vitest';
import type { Operation } from '../../src/engine/image/types.ts';
import type { FileInfo } from '../../src/tools/image/types.ts';
import { IMAGE_PAGES } from '../../src/tools/image/registry.ts';
import { TOOL as crop } from '../../src/tools/crop-image/Panel.tsx';
import { TOOL as heic } from '../../src/tools/heic-to-jpg/Panel.tsx';
import { TOOL as pdf } from '../../src/tools/image-to-pdf/Panel.tsx';
import { TOOL as png } from '../../src/tools/png-to-jpg/Panel.tsx';
import { TOOL as resize, shownBox } from '../../src/tools/resize-image/Panel.tsx';
import { TOOL as youtube } from '../../src/tools/resize-image/presets/youtube-thumbnail/Panel.tsx';
import { TOOL as rotate } from '../../src/tools/rotate-image/Panel.tsx';
import { TOOL as webp } from '../../src/tools/webp-to-jpg/Panel.tsx';

// What each tool of the Tools phase asks the engine for, for its options. The engine itself is proven by
// its own tests; this pins the wiring between a choice on the page and the operation.

const file = (id: number, width: number | null = null, height: number | null = null): FileInfo => ({ id, name: `photo-${id}.jpg`, size: 1000, width, height });
const opOf = <S extends object>(tool: { initial: S; operation: (state: S, file: FileInfo) => Operation }, patch: Partial<S> = {}, target: FileInfo = file(1)): Operation =>
  tool.operation({ ...tool.initial, ...patch }, target);

describe('Resize image', () => {
  it('starts as a 50% resize, so a result shows before the person chooses anything', () => {
    expect(opOf(resize)).toEqual({ kind: 'resize', mode: 'percent', percent: 50 });
  });

  it('turns into a box once a width and a height are chosen', () => {
    expect(opOf(resize, { width: 800, height: 600 })).toEqual({ kind: 'resize', mode: 'size', width: 800, height: 600 });
  });

  it('By percentage uses the percentage whatever the box says', () => {
    expect(opOf(resize, { mode: 'percent', percent: 25, width: 800, height: 600 })).toEqual({ kind: 'resize', mode: 'percent', percent: 25 });
  });

  it('shows half of the first measured picture in the fields, and the box once it is chosen', () => {
    expect(shownBox({ width: null, height: null }, [])).toEqual({ width: 1920, height: 1080 });
    expect(shownBox({ width: null, height: null }, [file(1), file(2, 3264, 2448), file(3, 800, 600)])).toEqual({ width: 1632, height: 1224 });
    expect(shownBox({ width: null, height: null }, [file(1, 1, 1)])).toEqual({ width: 1, height: 1 });
    expect(shownBox({ width: 640, height: 480 }, [file(1, 3264, 2448)])).toEqual({ width: 640, height: 480 });
  });
});

describe('Resize image for a YouTube thumbnail', () => {
  it('cuts a 1280 × 720 JPG of at most 2,000,000 bytes', () => {
    expect(opOf(youtube)).toEqual({ kind: 'cover', width: 1280, height: 720, format: 'jpeg', maxBytes: 2_000_000 });
    expect(youtube.success).toBe('resized');
  });
});

describe('Crop image', () => {
  it('opens on Square, centred: no box, the ratio alone', () => {
    expect(opOf(crop)).toEqual({ kind: 'crop', ratio: 1 });
    expect(crop.selectable).toBe(true);
  });

  it('turns each choice into its ratio, and Free into none', () => {
    expect(opOf(crop, { ratio: 'portrait' })).toEqual({ kind: 'crop', ratio: 0.8 });
    expect(opOf(crop, { ratio: 'wide' })).toEqual({ kind: 'crop', ratio: 16 / 9 });
    expect(opOf(crop, { ratio: 'free' })).toEqual({ kind: 'crop', ratio: null });
  });

  it('gives an adjusted box to its own photo only', () => {
    const box = { x: 10, y: 20, width: 300, height: 300 };
    const state = { boxes: { 2: box } };
    expect(opOf(crop, state, file(2))).toEqual({ kind: 'crop', ratio: 1, box });
    expect(opOf(crop, state, file(1))).toEqual({ kind: 'crop', ratio: 1 });
    expect(opOf(crop, state, file(3))).toEqual({ kind: 'crop', ratio: 1 });
  });
});

describe('Rotate image', () => {
  it('turns right by default and combines the turn with the mirror', () => {
    expect(opOf(rotate)).toEqual({ kind: 'rotate', turn: 'right', flip: 'none' });
    expect(opOf(rotate, { turn: 'half', flip: 'vertical' })).toEqual({ kind: 'rotate', turn: 'half', flip: 'vertical' });
  });
});

describe('the converters', () => {
  it('HEIC and WebP to JPG save as JPG, or PNG when asked', () => {
    for (const tool of [heic, webp]) {
      expect(opOf(tool)).toEqual({ kind: 'convert', to: 'jpeg' });
      expect(opOf(tool, { to: 'png' })).toEqual({ kind: 'convert', to: 'png' });
    }
    expect(heic.warm).toEqual(['heic']);
  });

  it('PNG to JPG lets the file decide the direction', () => {
    expect(opOf(png)).toEqual({ kind: 'convert', to: 'swap' });
  });

  it('every converter calls its success "converted"', () => {
    for (const tool of [heic, webp, png]) expect(tool.success).toBe('converted');
  });
});

describe('Image to PDF', () => {
  it('asks the engine for one page per file and keeps the sheet outside the operation', () => {
    expect(opOf(pdf)).toEqual({ kind: 'pdf-page' });
    expect(opOf(pdf, { size: 'a4' })).toEqual({ kind: 'pdf-page' });
    expect(pdf.pdfSize?.({ size: 'letter' })).toBe('letter');
    expect(pdf.pdfSize?.(pdf.initial)).toBe('image');
    expect(pdf.success).toBe('pdf');
  });
});

describe('the registry and the tools agree', () => {
  it('Image to PDF is the only page that builds a PDF', () => {
    expect(Object.values(IMAGE_PAGES).filter((page) => page.pdf).map((page) => page.id)).toEqual(['image-to-pdf']);
  });
});
