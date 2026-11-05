import { expect, test } from '@playwright/test';
import { routeById } from '../../src/i18n/routes.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { violationsEverywhere } from './lib/axe.ts';
import { PDF_WALKS, walkPdfTool, type PdfState } from './lib/pdf-states.ts';

// F5a (prompt decision 12; DECISOES § 170): the states of the PDF pages the page-by-page pass of a11y.spec.ts does not
// reach (it reads each page as loaded, with the cookie notice open and before anything is chosen). Each PDF page is reached
// once per browser (§ 76) and walked through its states by tests/e2e/lib/pdf-states.ts: at rest with the island hydrated,
// the Merge list, the page grid with a selection (a page turned, moved or picked), the password field with its error
// (Protect: the two passwords do not match; Unlock: the password is wrong), the signature area in its three ways to sign
// (draw, upload, type, with the box on the preview of the page) and the result. axe runs at both widths and in both themes
// on each of them. F6 (decision 9): the same states in Portuguese and Spanish, where the words are longer and other.
// F8 (DECISOES § 307): these 36 walks are the heaviest tests of the axe pass (10 to 21 s each on the CI runner). In
// a11y.spec.ts they all fell in the first part of each browser, which went over the 700 s target; in a file of their own,
// right after ads.spec.ts, the split by count puts them in the lighter parts.
// F13a (UX-04 A, D-21): the Merge list with a row taken out, the Undo in its place.
const PDF_AXE_STATES: ReadonlySet<PdfState> = new Set<PdfState>(['rest', 'list', 'removed', 'grid', 'password', 'signature', 'result']);
const TRANSLATED = ['pt', 'es'] as const;

test.describe('axe nos estados das ferramentas de PDF, a 360 e 1280px, nos temas escuro e claro', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const { id, path } of PDF_WALKS) {
    test(`${path}: at rest, with its options and with the result`, async ({ page }) => {
      const found: string[] = [];
      await walkPdfTool(
        page,
        id,
        async (state, note) => {
          if (!PDF_AXE_STATES.has(state)) return;
          for (const violation of await violationsEverywhere(page)) found.push(`${state} (${note}): ${violation}`);
        },
        { hold: false },
      );
      expect(found).toEqual([]);
    });
  }
});

test.describe('axe nos estados das ferramentas de PDF em pt e es, a 360 e 1280px, nos temas escuro e claro', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const lang of TRANSLATED) {
    for (const id of PDF_TOOL_IDS) {
      test(`${routeById(id).paths[lang] ?? ''}: at rest, with its options and with the result`, async ({ page }) => {
        const found: string[] = [];
        await walkPdfTool(
          page,
          id,
          async (state, note) => {
            if (!PDF_AXE_STATES.has(state)) return;
            for (const violation of await violationsEverywhere(page)) found.push(`${state} (${note}): ${violation}`);
          },
          { hold: false, lang },
        );
        expect(found).toEqual([]);
      });
    }
  }
});
