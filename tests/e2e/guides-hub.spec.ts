import { expect, test } from '@playwright/test';
import { LANGS, routeById, type Lang } from '../../src/i18n/routes.ts';
import enCommon from '../../src/i18n/en/common.ts';
import ptCommon from '../../src/i18n/pt/common.ts';
import esCommon from '../../src/i18n/es/common.ts';
import enGuides from '../../src/i18n/en/guides.ts';
import ptGuides from '../../src/i18n/pt/guides.ts';
import esGuides from '../../src/i18n/es/guides.ts';
import { GUIDE_IDS, guidePathIn } from '../../src/tools/calc/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS, GUIDES_HUB_ID } from '../../src/tools/guides/registry.ts';
import { dismissCookies } from './lib/page.ts';

// The guides hub rendered (F11, decision 5; DECISOES § 393 and § 399), in both browsers and the three languages: every guide
// of the language once, read from the registries; the three groups with their anchors; the GuideCard, one link whose name
// starts with "Guide", "Guia" or "Guía", under the heading order H1, H2, H3; no AdSlot; the first card above the fold on the
// phone; "All guides" as the current page in the footer. The axe of the hub, in both themes, is in a11y.spec.ts (it reads
// the route map). The e2e specs import the texts of each language directly (TEXTS reads files through import.meta.glob).

const COMMON = { en: enCommon, pt: ptCommon, es: esCommon } as const;
const HUB_TEXTS = { en: enGuides, pt: ptGuides, es: esGuides } as const;
const KIND: Record<Lang, string> = { en: 'Guide', pt: 'Guia', es: 'Guía' };
/** The guides of each group in a language, by the registries alone: the file guides by their hub, the money ones where they exist. */
const groupsOf = (lang: Lang): Record<'image' | 'pdf' | 'money', string[]> => ({
  image: FILE_GUIDE_IDS.filter((id) => FILE_GUIDES[id].hub === 'image-tools').map((id) => FILE_GUIDES[id].paths[lang]),
  pdf: FILE_GUIDE_IDS.filter((id) => FILE_GUIDES[id].hub === 'pdf-tools').map((id) => FILE_GUIDES[id].paths[lang]),
  money: GUIDE_IDS.flatMap((id) => guidePathIn(id, lang) ?? []),
});

for (const lang of LANGS) {
  const path = routeById(GUIDES_HUB_ID).paths[lang] ?? '/guides/';
  const t = HUB_TEXTS[lang];

  test(`${lang}: the hub ${path} lists every guide of the language once, in its group, as a GuideCard, with no AdSlot`, async ({ page }) => {
    expect((await page.goto(path))?.status(), path).toBe(200);
    const main = page.locator('main');
    const groups = groupsOf(lang);
    const all = [...groups.image, ...groups.pdf, ...groups.money];
    expect(all.length, lang).toBe(lang === 'pt' ? 10 : 15);
    await expect(main.locator('a.fo-guidecard')).toHaveCount(all.length);
    for (const [group, paths] of Object.entries(groups)) {
      const cards = main.locator(`section#${group} a.fo-guidecard`);
      expect(await cards.evaluateAll((links) => links.map((link) => link.getAttribute('href'))), `${lang} ${group}`).toEqual(paths);
    }
    // In pt the money group is the note that leads to the Brazilian money calculators.
    if (lang === 'pt') await expect(main.locator('section#money .fo-section__note a')).toHaveAttribute('href', '/pt/calculadoras-financeiras/');
    // Every card is one link, whose accessible name starts with the kind and then the guide's name.
    const named = main.getByRole('link', { name: new RegExp(`^${KIND[lang]} `) });
    await expect(named).toHaveCount(all.length);
    for (const card of await main.locator('a.fo-guidecard').all()) {
      await expect(card.locator('a')).toHaveCount(0);
      const name = (await card.locator('.fo-guidecard__name').textContent()) ?? '';
      await expect(card).toHaveAccessibleName(new RegExp(`^${KIND[lang]} ${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} `));
    }
    // No AdSlot, no rail, no ad code (the hub has no ad area in the F11).
    await expect(page.locator('.fo-ad, ins.adsbygoogle, aside.fo-rail, script[src*="adsbygoogle"]')).toHaveCount(0);
    // The headings go H1, H2, H3 with no level skipped.
    const levels = await main.locator('h1, h2, h3, h4, h5, h6').evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) expect((levels[i] ?? 0) - (levels[i - 1] ?? 0), `${lang}: ${levels.join(' ')}`).toBeLessThanOrEqual(1);
    expect(levels.filter((level) => level === 3)).toHaveLength(all.length);
    // In the footer, "All guides" is the current page.
    await expect(page.locator('footer .fo-footer__more a[aria-current="page"]')).toHaveText(COMMON[lang].footer.guidesAll);
    await expect(page.locator('footer .fo-footer__more a[aria-current="page"]')).toHaveAttribute('href', path);
  });

  test(`${lang}: the shortcuts lead to the three groups, with 48 px targets, and the cards keep their size at 360 and 1280 px`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    expect((await page.goto(path))?.status(), path).toBe(200);
    await dismissCookies(page);
    const jump = page.getByRole('navigation', { name: t.jumpLabel });
    const chips = jump.getByRole('link');
    await expect(chips).toHaveText([t.groups.image.jump, t.groups.pdf.jump, t.groups.money.jump]);
    expect(await chips.evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual(['#image', '#pdf', '#money']);
    for (const chip of await chips.all()) expect((await chip.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);
    // The first card's name is above the fold of a phone (360 × 740), in the three languages (§ 364).
    const first = page.locator('main a.fo-guidecard .fo-guidecard__name').first();
    const box = await first.boundingBox();
    expect((box?.y ?? 9999) + (box?.height ?? 0), `${lang}: o título do primeiro cartão acima da dobra`).toBeLessThanOrEqual(740);
    // And with one more line in the H1: the Spanish title fills 278.5 of its 280 px in the Chromium of Windows and took a
    // third line in the Chromium of the CI's Linux (DECISOES § 408), so the fold holds for a title one line longer too.
    const extra = await page.addStyleTag({ content: '.fo-hubband .fo-h1::after { content: ""; display: block; height: 34px; }' });
    const taller = await first.boundingBox();
    expect((taller?.y ?? 9999) + (taller?.height ?? 0), `${lang}: o título do primeiro cartão acima da dobra, com uma linha a mais no H1`).toBeLessThanOrEqual(740);
    await extra.evaluate((style) => style.remove());
    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      for (const card of await page.locator('main a.fo-guidecard').all()) {
        const size = await card.boundingBox();
        expect(size?.width ?? 0, `${lang} a ${width} px`).toBeGreaterThanOrEqual(300);
        expect(size?.height ?? 0, `${lang} a ${width} px`).toBeGreaterThanOrEqual(200);
      }
    }
    // A shortcut takes the page to its group.
    await page.setViewportSize({ width: 360, height: 740 });
    await chips.nth(1).click();
    await expect(page).toHaveURL(new RegExp(`${path}#pdf$`));
    await expect(page.locator('section#pdf h2')).toBeInViewport();
  });
}
