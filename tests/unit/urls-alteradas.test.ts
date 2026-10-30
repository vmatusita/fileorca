import { describe, expect, it } from 'vitest';
import { changedUrls } from '../../scripts/ci/urls-alteradas.ts';

const o = 'https://fileorca.com';

describe('urls-alteradas', () => {
  it('maps a page file to its URL', () => {
    expect(changedUrls(['src/pages/pt/privacidade/index.astro'])).toEqual([`${o}/pt/privacidade/`]);
    expect(changedUrls(['src/pages/index.astro'])).toEqual([`${o}/`]);
    expect(changedUrls(['src/pages/es/comprimir-imagen/index.astro'])).toEqual([`${o}/es/comprimir-imagen/`]);
  });

  it('maps a language text file only to that language', () => {
    expect(changedUrls(['src/i18n/es/terms.ts'])).toEqual([`${o}/es/terminos/`]);
    expect(changedUrls(['src/tools/compress-image/i18n/pt.ts'])).toEqual([`${o}/pt/comprimir-imagem/`]);
  });

  it('maps a shared view to every language of every route using it', () => {
    expect(changedUrls(['src/views/LegalView.astro'])).toEqual([
      `${o}/privacy/`, `${o}/pt/privacidade/`, `${o}/es/privacidad/`,
      `${o}/terms/`, `${o}/pt/termos/`, `${o}/es/terminos/`,
    ]);
    expect(changedUrls(['src/tools/compress-image/ToolPanel.tsx'])).toEqual([
      `${o}/compress-image/`, `${o}/pt/comprimir-imagem/`, `${o}/es/comprimir-imagen/`,
    ]);
  });

  it('ignores tests inside a view folder', () => {
    expect(changedUrls(['src/tools/compress-image/engine.test.ts'])).toEqual([]);
  });

  it('never returns the 404 pages', () => {
    expect(changedUrls(['src/pages/404.astro', 'src/pages/pt/404.astro', 'src/views/NotFoundView.astro'])).toEqual([]);
  });

  it('returns nothing for a dependency-only PR', () => {
    expect(changedUrls(['package.json', 'pnpm-lock.yaml'])).toEqual([]);
  });

  it('returns nothing for a CI-only PR', () => {
    expect(changedUrls(['.github/workflows/ci.yml', 'scripts/ci/pode-mesclar.ts', '.github/dependabot.yml'])).toEqual([]);
  });

  it('returns nothing for shared components, styles and platform files', () => {
    expect(changedUrls(['src/components/Header.astro', 'src/styles/global.css', 'src/platform/headers.ts'])).toEqual([]);
  });

  it('accepts Windows separators and dedupes', () => {
    expect(changedUrls(['src\\pages\\about\\index.astro', 'src/i18n/en/about.ts'])).toEqual([`${o}/about/`]);
  });
});
