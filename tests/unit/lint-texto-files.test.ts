import { describe, expect, it } from 'vitest';
import { TEXT_FILE, selectTextFiles, textFileLang } from '../../scripts/gates/lint-texto.ts';
import { ROUTES, languagesOf, textFilesFor } from '../../src/i18n/routes.ts';

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
