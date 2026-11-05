// The footer of the F13b on the phone (decision 8; UX-17 A, pages.html; DECISOES § 587), read in the built home of each
// language: every category keeps its hub out of the disclosure and puts its tools in one <details>, closed in the HTML,
// whose summary says "All 8" when it holds every tool of the category in the language and "6 popular" when some (the
// count of the Menu, src/components/tool-count.ts), and whose name goes on with the category for a screen reader; the
// Guides block does the same with its groups; no link is twice in the footer. FO_PAGES_DIST points the test at another
// build (the proof against the dist of the starting point). The heights and the 48 px are in tests/e2e/footer-phone.spec.ts.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { toolCounts } from '../../src/components/tool-count.ts';
import { fmt, groupDigits } from '../../src/i18n/format.ts';
import { LANGS, pagePath } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { GUIDES_HUB_ID } from '../../src/tools/guides/registry.ts';

const DIST = process.env['FO_PAGES_DIST'] ?? 'dist';
const BUILT = existsSync(join(DIST, 'index.html'));
const page = (path: string) => parse(readFileSync(join(DIST, ...path.split('/').filter(Boolean), 'index.html'), 'utf8'));
/** The text of an element, its spaces folded. */
const text = (element: HTMLElement | null | undefined) => (element?.textContent ?? '').replace(/\s+/g, ' ').trim();

describe.runIf(BUILT)('the footer below 768 px: the hub in sight and the tools in a disclosure (DECISOES § 587)', () => {
  for (const lang of LANGS) {
    it(`${lang}: every category has its hub out of the disclosure, and its summary counts the list it opens`, () => {
      const root = page(pagePath('home', lang) ?? '/');
      const footer = root.querySelector('footer');
      const t = TEXTS[lang].common.footer;
      const counts = toolCounts(lang);
      const totals: Record<string, number> = { [t.imageColumn]: counts.image, [t.pdfColumn]: counts.pdf, [t.moneyColumn]: counts.money, ...(t.homeColumn ? { [t.homeColumn]: counts.house } : {}), ...(t.healthColumn ? { [t.healthColumn]: counts.health } : {}) };
      const nouns: Record<string, string | undefined> = { [t.imageColumn]: t.tools.image, [t.pdfColumn]: t.tools.pdf, [t.moneyColumn]: t.tools.money, ...(t.homeColumn ? { [t.homeColumn]: t.tools.home } : {}), ...(t.healthColumn ? { [t.healthColumn]: t.tools.health } : {}) };
      const columns = footer?.querySelectorAll('.fo-footer__cols > .fo-footer__col').filter((column) => text(column.querySelector('h2')) in totals) ?? [];
      expect(columns.length, lang).toBe(lang === 'en' ? 5 : 3);
      for (const column of columns) {
        const title = text(column.querySelector('h2'));
        const hub = column.querySelector(':scope > a.fo-footer__hub');
        expect(hub, `${lang} ${title} hub`).not.toBeNull();
        const details = column.querySelectorAll(':scope > details.fo-footer__tools');
        expect(details, `${lang} ${title} one disclosure`).toHaveLength(1);
        expect(details[0]?.hasAttribute('open'), `${lang} ${title} closed in the HTML`).toBe(false);
        const tools = details[0]?.querySelectorAll('ul > li > a') ?? [];
        const all = tools.length >= (totals[title] ?? 0);
        const n = groupDigits(tools.length, lang);
        const noun = nouns[title] ?? '';
        const summary = details[0]?.querySelector('summary');
        const visible = text(summary?.querySelector(':scope > span')).replace(text(summary?.querySelector('.fo-sr')), '').trim();
        expect(visible, `${lang} ${title} summary`).toBe(fmt(all ? t.tools.all : t.tools.popular, { n }));
        // The name starts with the visible words (WCAG 2.5.3) and says the category.
        expect(text(summary), `${lang} ${title} name`).toBe(`${visible} ${all ? noun : fmt(t.tools.popularRest, { noun })}`);
      }
      // The image list holds every image tool ("All 8"), the PDF one six of twelve ("6 popular").
      expect(text(columns[0]?.querySelector('summary > span')), lang).toContain(groupDigits(counts.image, lang));
      // The Guides block the same way, and no link twice in the footer.
      const guides = footer?.querySelector('.fo-footer__more');
      expect(guides?.querySelector(':scope > a.fo-footer__hub')?.getAttribute('href'), lang).toBe(pagePath(GUIDES_HUB_ID, lang));
      const groups = guides?.querySelectorAll(':scope > details.fo-footer__tools ul > li > a') ?? [];
      expect(groups.length, lang).toBe(lang === 'pt' ? 2 : 3);
      expect(text(guides?.querySelector('summary')), lang).toBe(`${fmt(t.guidesTopics, { n: groupDigits(groups.length, lang) })} ${t.guidesTopicsRest}`);
      const hrefs = footer?.querySelectorAll('a').map((link) => link.getAttribute('href')) ?? [];
      expect(hrefs.length, lang).toBe(new Set(hrefs).size);
    });
  }
});
