// The share target without a browser (F8, decisions 1, 9 and 10; DECISOES § 290 and § 291): the tools a shared file
// can open with (only tools, from the registries), the accept of the manifests, the format read from the bytes, how many
// files each tool takes, the order the chosen tool gets them in, the size as each language writes it (the same as
// fileSize() of src/i18n/format.ts, which the page cannot import without the island chunk), and the choice the
// "Open with" page leaves in sessionStorage.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fileSize } from '../../src/i18n/format.ts';
import { LANGS, pathFor } from '../../src/i18n/routes.ts';
import { IMAGE_PAGES, IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { PDF_PAGES, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { SHARE_TOOLS, shareAccept } from '../../src/share/tools.ts';
import { FORMAT_LABEL, deliveryOrder, formatOfBytes, sizeLabel, takes } from '../../src/share/logic.ts';
import { ordered, readChoice } from '../../src/tools/image/inbox.ts';
import { manifestFor } from '../../src/pages/manifest-[lang].webmanifest.ts';
import { SHARE_FIELD } from '../../src/sw/shared.ts';
import { swRegistration, WARM_SELECTOR } from '../../src/platform/sw-register.ts';

describe('the tools of the share target', () => {
  it('are the image and PDF tools of the registries, never presets or guides', () => {
    expect(SHARE_TOOLS.map((tool) => tool.id)).toEqual([...IMAGE_TOOL_IDS, ...PDF_TOOL_IDS]);
    for (const preset of IMAGE_PRESET_IDS) expect(SHARE_TOOLS.map((tool) => tool.id)).not.toContain(preset);
    for (const tool of SHARE_TOOLS) {
      if (tool.kind === 'image') expect(tool.accepts).toEqual(IMAGE_PAGES[tool.id].accepts);
      else expect(tool.single).toBe(PDF_PAGES[tool.id].files === 'single');
    }
  });

  it('accept every type and extension some tool takes, HEIC included, and the PDF', () => {
    expect(shareAccept().sort()).toEqual(
      ['image/jpeg', '.jpg', '.jpeg', 'image/png', '.png', 'image/webp', '.webp', 'image/heic', 'image/heif', '.heic', '.heif', 'application/pdf', '.pdf'].sort(),
    );
  });
});

describe('the manifests', () => {
  it.each(LANGS)('%s: what installing asks for, the id of today and the share target of the language', (lang) => {
    const manifest = manifestFor(lang) as Record<string, unknown> & { icons: { src: string; sizes: string }[]; share_target: Record<string, unknown> };
    const start = lang === 'en' ? '/' : `/${lang}/`;
    expect(manifest).toMatchObject({ name: 'FileOrca', short_name: 'FileOrca', start_url: start, id: start, scope: '/', display: 'standalone' });
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(['192x192', '512x512']);
    // The icons and the action are files of the build: tests/e2e/share-target.spec.ts asks the built site for them.
    expect(manifest.share_target).toEqual({
      action: pathFor('open-with', lang),
      method: 'POST',
      enctype: 'multipart/form-data',
      params: { files: [{ name: SHARE_FIELD, accept: shareAccept() }] },
    });
    expect(JSON.stringify(manifest.share_target)).not.toMatch(/"(?:text|url|title)"/);
  });

  it('drop the share target with the kill switch: without the worker the POST would reach the server', () => {
    for (const lang of LANGS) expect(manifestFor(lang, false)).not.toHaveProperty('share_target');
  });
});

describe('the "Open with" page', () => {
  const bytes = (...values: number[]) => new Uint8Array([...values, ...new Array(64).fill(0)]);

  it('reads the format from the bytes, like the tools', () => {
    expect(formatOfBytes(bytes(0xff, 0xd8, 0xff))).toBe('jpeg');
    expect(formatOfBytes(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe('png');
    expect(formatOfBytes(new TextEncoder().encode('%PDF-1.7\n'))).toBe('pdf');
    expect(formatOfBytes(new TextEncoder().encode('junk%PDF-1.4'))).toBe('pdf');
    expect(formatOfBytes(new TextEncoder().encode('hello'))).toBe('unknown');
    expect(formatOfBytes(new Uint8Array())).toBe('unknown');
    expect(FORMAT_LABEL['jpeg']).toBe('JPG');
  });

  it('counts what each tool takes, one at most for a one-file tool, and gives it those first', () => {
    expect(takes(['jpeg', 'png', 'webp'], false, ['jpeg', 'pdf', 'png'])).toBe(2);
    expect(takes(['pdf'], true, ['jpeg', 'pdf', 'pdf'])).toBe(1);
    expect(takes(['heic'], false, ['jpeg'])).toBe(0);
    expect(deliveryOrder(['pdf'], ['jpeg', 'pdf', 'png', 'pdf'])).toEqual([1, 3, 0, 2]);
  });

  it('writes the size as fileSize() does, in the three languages', () => {
    for (const lang of LANGS) {
      for (const size of [0, 1, 999, 1000, 1049, 1050, 99_949, 99_950, 100_000, 123_456_789, 999_999_999_999, 12_345_678_901_234]) {
        expect(sizeLabel(size, lang), `${size} ${lang}`).toBe(fileSize(size, lang));
      }
    }
  });

  it('leaves the choice of a tool without any file name, read once by the tool in the order given', () => {
    expect(readChoice(JSON.stringify({ tool: 'compress-image', order: [1, 0, 'x', -1] }))).toEqual({ tool: 'compress-image', order: [1, 0] });
    expect(readChoice('not json')).toBeNull();
    expect(readChoice(null)).toBeNull();
    expect(readChoice(JSON.stringify({ order: [0] }))).toBeNull();
    const entries = [0, 1, 2].map((index) => ({ index }));
    expect(ordered(entries, [2, 0]).map((entry) => entry.index)).toEqual([2, 0, 1]);
  });
});

describe('the registration of the worker', () => {
  it('runs after the load event, never waits on ready, and tells the worker only the page and its own files', () => {
    const script = swRegistration();
    expect(script).toMatch(/^if\('serviceWorker'in navigator\)addEventListener\('load'/);
    expect(script).toContain("register('/sw.js')");
    expect(script).not.toContain('.ready');
    expect(WARM_SELECTOR).not.toMatch(/alternate|canonical|prefetch/);
    expect(() => new Function(script)).not.toThrow();
  });

  it('is in the layout only while SW_ENABLED is on', () => {
    const layout = readFileSync('src/layouts/BaseLayout.astro', 'utf8');
    expect(layout).toContain('{SW_ENABLED && <script is:inline set:html={swRegistration()} />}');
  });
});
