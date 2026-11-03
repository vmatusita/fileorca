import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TEXT_FILE, selectTextFiles, textFileLang } from '../../scripts/gates/lint-texto.ts';
import { ROUTES, languagesOf, textFilesFor } from '../../src/i18n/routes.ts';
import { FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';
import { GUIDE_IDS } from '../../src/tools/calc/registry.ts';

// lint:texto reads the site texts that changed against origin/main. Its path filter must not skip
// any text file the route map lists, or a page's copy reaches the site without the grammar check.
describe('lint:texto: arquivos de texto', () => {
  const listed = [...new Set(ROUTES.flatMap((route) => languagesOf(route).flatMap((lang) => textFilesFor(route, lang))))].sort();

  it('selects every text file the route map lists, in every language the page has', () => {
    expect(listed.length).toBeGreaterThan(20);
    expect(selectTextFiles(listed, () => true)).toEqual(listed);
  });

  it('selects the texts of a preset, nested under its tool', () => {
    const presets = [
      'src/tools/compress-image/presets/to-100kb/i18n/en.ts',
      'src/tools/compress-image/presets/to-1mb/i18n/en.ts',
      'src/tools/resize-image/presets/youtube-thumbnail/i18n/en.ts',
    ];
    for (const file of presets) {
      expect(listed, file).toContain(file);
      expect(TEXT_FILE.test(file), file).toBe(true);
      expect(textFileLang(file), file).toBe('en');
    }
  });

  it('selects the texts shared by the image tools and the tool texts, with their language', () => {
    expect(textFileLang('src/tools/image/i18n/pt.ts')).toBe('pt');
    expect(textFileLang('src/tools/compress-image/i18n/es.ts')).toBe('es');
    expect(textFileLang('src/tools/heic-to-jpg/i18n/en.ts')).toBe('en');
    expect(textFileLang('src/i18n/pt/image-tools.ts')).toBe('pt');
    expect(textFileLang('src/i18n/en/home.ts')).toBe('en');
  });

  // The languages adjustment: the 40 pages bring the texts of the file guides in pt and es (with the shared guide texts of
  // each language), the QR code generator in pt and es, and in es the 13 calculator and preset texts and the 5 money guides.
  it('selects the texts of the pages of the languages adjustment, with their language', () => {
    const wanted = [
      ...FILE_GUIDE_IDS.flatMap((id) => (['pt', 'es'] as const).map((lang) => [`src/i18n/${lang}/guide-${id.replace(/^guides-/, '')}.ts`, lang] as const)),
      ...(['pt', 'es'] as const).map((lang) => [`src/i18n/${lang}/file-guides.ts`, lang] as const),
      ...(['pt', 'es'] as const).map((lang) => [`src/tools/qr-code-generator/i18n/${lang}.ts`, lang] as const),
      ...GUIDE_IDS.map((id) => [`src/i18n/es/guide-${id.replace(/^guides-/, '')}.ts`, 'es'] as const),
      ['src/tools/auto-loan-calculator/i18n/es.ts', 'es'] as const,
      ['src/tools/mortgage-calculator/presets/biweekly/i18n/es.ts', 'es'] as const,
      ['src/tools/loan-amortization-calculator/presets/balloon-payment/i18n/es.ts', 'es'] as const,
    ];
    expect(wanted).toHaveLength(FILE_GUIDE_IDS.length * 2 + 2 + 2 + GUIDE_IDS.length + 3);
    for (const [file, lang] of wanted) {
      expect(listed, file).toContain(file);
      expect(existsSync(file), file).toBe(true);
      expect(TEXT_FILE.test(file), file).toBe(true);
      expect(textFileLang(file), file).toBe(lang);
    }
    // The file of a guide keeps the English slug in every language (src/i18n/<lang>/guide-<English slug>.ts).
    expect(listed).not.toContain('src/i18n/pt/guide-jpg-ou-png.ts');
    // No US money guide is a Portuguese text.
    for (const id of GUIDE_IDS) expect(listed, id).not.toContain(`src/i18n/pt/guide-${id.replace(/^guides-/, '')}.ts`);
  });

  it('leaves out files that are not site texts', () => {
    for (const file of [
      'src/tools/compress-image/ToolPanel.tsx',
      'src/tools/image/registry.ts',
      'src/tools/compress-image/presets/to-100kb/Page.astro',
      'src/tools/compress-image/presets/to-100kb/i18n/fr.ts',
      'src/tools/compress-image/presets/i18n/en.ts',
      'src/tools/a/b/c/i18n/en.ts',
      'src/i18n/routes.ts',
      'src/i18n/types.ts',
      'src/i18n/en/nested/page.ts',
      'docs/tools/image/i18n/en.ts',
    ]) {
      expect(TEXT_FILE.test(file), file).toBe(false);
      expect(textFileLang(file), file).toBeUndefined();
    }
  });

  it('keeps the files that exist, once each and sorted', () => {
    const files = ['src/tools/image/i18n/en.ts', 'src/i18n/en/home.ts', ' src/tools/image/i18n/en.ts ', 'src/tools/gone/i18n/en.ts', 'README.md'];
    expect(selectTextFiles(files, (file) => !file.includes('gone'))).toEqual(['src/i18n/en/home.ts', 'src/tools/image/i18n/en.ts']);
  });
});
