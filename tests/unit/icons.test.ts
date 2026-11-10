import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ICONS } from '../../src/icons/icons.ts';
import { ICON_FILE_ROOT, ICON_NAMES, iconInner, iconMarkup } from '../../src/icons/svg.ts';

const DIR = 'docs/design/assets/Icons';

describe('ícones inline (DECISOES § 46)', () => {
  it('lists exactly the 74 icons of docs/design/assets/Icons (35 of the design system, 4 drawn in the F5a, DECISOES § 149, 5 of the header drawn in the F10 and moved in the F11, DECISOES § 384, 27 drawn in the F10 for the tools and the DropZone and moved in the F13a, DECISOES § 490, the zoom of the F14, DECISOES § 621, and the image-stack and image-fast of AVIF to JPG and Convert to WebP, drawn in the F17, DECISOES § 706)', () => {
    const files = readdirSync(DIR).filter((file) => file.endsWith('.svg')).map((file) => file.replace(/\.svg$/, '')).sort();
    expect([...ICON_NAMES].sort()).toEqual(files);
    expect(files).toHaveLength(74);
  });

  it('keeps ICON_NAMES in alphabetical order (DECISOES § 490)', () => {
    expect([...ICON_NAMES]).toEqual([...ICON_NAMES].sort());
  });

  it('every file ends in a single LF, with no CR (the copy keeps the bytes of the proposal, DECISOES § 490)', () => {
    for (const name of ICON_NAMES) {
      const raw = readFileSync(`${DIR}/${name}.svg`, 'utf8');
      expect(raw, name).not.toContain('\r');
      expect(raw.endsWith('</svg>\n') && !raw.endsWith('\n\n'), name).toBe(true);
    }
  });

  it('every file has the root the inline markup replaces, and no id or colour of its own inside', () => {
    for (const name of ICON_NAMES) {
      const raw = readFileSync(`${DIR}/${name}.svg`, 'utf8');
      expect(raw.startsWith(`<svg ${ICON_FILE_ROOT}>`), name).toBe(true);
      const inner = iconInner(raw);
      expect(inner, name).not.toMatch(/\bid=|#[0-9A-Fa-f]{3,6}\b|<svg/);
      expect(ICONS[name]).toBe(inner);
    }
  });

  it('draws in currentColor, decorative', () => {
    const markup = iconMarkup(ICONS.download);
    expect(markup).toMatch(/^<svg class="fo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">/);
    expect(markup).not.toContain('#0F1B2D');
  });
});
