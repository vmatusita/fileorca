import { expect, test, type Locator, type Page } from '@playwright/test';
import { LANGS, type Lang } from '../../src/i18n/routes.ts';
import enCommon from '../../src/i18n/en/common.ts';
import ptCommon from '../../src/i18n/pt/common.ts';
import esCommon from '../../src/i18n/es/common.ts';
import { filterEntries, groupEntries, type SearchEntry } from '../../src/search/search.ts';

// The search in two groups (F11, decision 7; DECISOES § 397 and § 399): the tools first, then the guides, each a role="group"
// named by its title inside the listbox; an empty group has no title; the arrows run through both groups as one list; the
// search still loads on first use only. The rows the dialog shows are read from the index the site serves, through the same
// filterEntries the page runs, never written by hand.

const HOME: Record<Lang, string> = { en: '/', pt: '/pt/', es: '/es/' };
/** The search texts of each language (the e2e specs import the common texts directly: TEXTS and ICONS use import.meta.glob). */
const SEARCH = { en: enCommon.search, pt: ptCommon.search, es: esCommon.search } as const;
/** The first path of the file icon (docs/design/assets/Icons/file.svg), which every guide row shows. */
const FILE_ICON = 'M6 3h8l5 5v11';
/** "jpg" finds tools and guides; "compress" only tools; "windows" only the HEIC guide (in the three languages). */
const BOTH = 'jpg';
const TOOLS_ONLY = 'compress';
const GUIDES_ONLY = 'windows';

async function index(page: Page): Promise<SearchEntry[]> {
  return (await (await page.request.get('/search-index.json')).json()) as SearchEntry[];
}

async function openSearch(page: Page, lang: Lang): Promise<{ dialog: Locator; input: Locator }> {
  expect((await page.goto(HOME[lang]))?.status(), HOME[lang]).toBe(200);
  await page.keyboard.press('Control+K');
  const dialog = page.locator('#fo-search-dialog');
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole('combobox');
  await expect(input).toBeFocused();
  return { dialog, input };
}

/** The visible row of an entry: its name, then its category. */
const rowOf = (entry: SearchEntry, lang: Lang): string => `${entry.name[lang] ?? ''}${entry.category[lang] ?? ''}`;

test('the index marks every entry as a tool or a guide, and every guide has the file icon and the category "Guide" of its languages', async ({ page }) => {
  const entries = await index(page);
  expect(entries.length).toBeGreaterThan(60);
  const guides = entries.filter((entry) => entry.kind === 'guide');
  expect(entries.every((entry) => entry.kind === 'tool' || entry.kind === 'guide')).toBe(true);
  expect(guides.map((entry) => entry.id).every((id) => id.startsWith('guides-'))).toBe(true);
  expect(entries.filter((entry) => entry.kind === 'tool').some((entry) => entry.id.startsWith('guides-'))).toBe(false);
  expect(guides).toHaveLength(15);
  for (const guide of guides) {
    expect(guide.icon, guide.id).toContain(FILE_ICON);
    expect(['image', 'pdf', 'money'], guide.id).toContain(guide.cat);
    for (const lang of Object.keys(guide.href) as Lang[]) expect(guide.category[lang], `${guide.id} ${lang}`).toBe(SEARCH[lang].guideCategory);
  }
});

for (const lang of LANGS) {
  const search = SEARCH[lang];

  test(`${lang}: "${BOTH}" shows the tools, then the guides, each group named by its title, and the arrows go from one group to the other`, async ({ page }) => {
    const shown = groupEntries(filterEntries(await index(page), BOTH, lang));
    const tools = shown.filter((entry) => entry.kind === 'tool');
    const guides = shown.filter((entry) => entry.kind === 'guide');
    expect(tools.length, lang).toBeGreaterThan(1);
    expect(guides.length, lang).toBeGreaterThan(1);
    const { dialog, input } = await openSearch(page, lang);
    // The field and the list are named for tools and guides, in the language.
    await expect(input).toHaveAttribute('aria-label', search.inputLabel);
    await expect(input).toHaveAttribute('placeholder', search.placeholder);
    await input.fill(BOTH);
    const listbox = dialog.getByRole('listbox', { name: search.listLabel });
    await expect(listbox.getByRole('option')).toHaveCount(shown.length);
    // Two groups, in this order, each named by the title above it; the titles are not options.
    const groups = listbox.getByRole('group');
    await expect(groups).toHaveCount(2);
    await expect(groups.nth(0)).toHaveAccessibleName(search.toolsGroup);
    await expect(groups.nth(1)).toHaveAccessibleName(search.guidesGroup);
    await expect(listbox.locator('.fo-search__group')).toHaveText([search.toolsGroup, search.guidesGroup]);
    const toolGroup = listbox.getByRole('group', { name: search.toolsGroup, exact: true });
    const guideGroup = listbox.getByRole('group', { name: search.guidesGroup, exact: true });
    await expect(toolGroup.getByRole('option')).toHaveText(tools.map((entry) => rowOf(entry, lang)));
    await expect(guideGroup.getByRole('option')).toHaveText(guides.map((entry) => rowOf(entry, lang)));
    // Every guide row: the circle in the colour of its group with the file icon, and "Guide" beside its name.
    for (const [index, entry] of guides.entries()) {
      const option = guideGroup.getByRole('option').nth(index);
      await expect(option).toHaveClass(new RegExp(`fo-cat--${entry.cat}\\b`));
      await expect(option.locator('small')).toHaveText(search.guideCategory);
      expect(await option.locator('.fo-chip__dot svg').innerHTML(), entry.id).toContain(FILE_ICON);
    }
    // The first option of the guides comes right after the last tool, in the ids the combobox points to.
    const ids = await listbox.getByRole('option').evaluateAll((options) => options.map((option) => option.id));
    expect(ids).toEqual(shown.map((_, i) => `fo-search-list-${i}`));
    await expect(guideGroup.getByRole('option').first()).toHaveId(`fo-search-list-${tools.length}`);
    // The arrows: the first tool is marked; down past the last tool marks the first guide (the title is skipped); up goes
    // back; down from the last guide wraps to the first tool.
    await expect(listbox.getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
    for (let step = 0; step < tools.length; step += 1) await input.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-activedescendant', `fo-search-list-${tools.length}`);
    await expect(guideGroup.getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
    await expect(listbox.locator('[aria-selected="true"]')).toHaveCount(1);
    await input.press('ArrowUp');
    await expect(input).toHaveAttribute('aria-activedescendant', `fo-search-list-${tools.length - 1}`);
    await expect(toolGroup.getByRole('option').last()).toHaveAttribute('aria-selected', 'true');
    await input.press('ArrowDown');
    for (let step = 0; step < guides.length; step += 1) await input.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-activedescendant', 'fo-search-list-0');
    // Enter on a guide opens it, in the language of the page.
    await input.press('ArrowUp');
    await expect(guideGroup.getByRole('option').last()).toHaveAttribute('aria-selected', 'true');
    await input.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${guides.at(-1)?.href[lang] ?? '-'}$`));
  });

  test(`${lang}: a group with no result has no title, and the search still loads on first use only`, async ({ page }) => {
    const lazy: string[] = [];
    page.on('request', (request) => {
      if (/search-index\.json|\/entry-/.test(request.url())) lazy.push(request.url());
    });
    expect((await page.goto(HOME[lang]))?.status()).toBe(200);
    await page.waitForLoadState('load');
    expect(lazy, 'nada da busca antes do primeiro uso').toEqual([]);
    await page.keyboard.press('Control+K');
    const dialog = page.locator('#fo-search-dialog');
    const input = dialog.getByRole('combobox');
    await expect(input).toBeFocused();
    expect(lazy.length).toBe(2);
    const listbox = dialog.getByRole('listbox');
    // Only tools: one group, "Tools", and no title of the guides.
    await input.fill(TOOLS_ONLY);
    await expect(listbox.getByRole('group')).toHaveCount(1);
    await expect(listbox.locator('.fo-search__group')).toHaveText([search.toolsGroup]);
    await expect(listbox.getByRole('group', { name: search.toolsGroup, exact: true }).getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
    // Only guides: one group, "Guides", whose first row is the one Enter opens.
    await input.fill(GUIDES_ONLY);
    await expect(listbox.getByRole('group')).toHaveCount(1);
    await expect(listbox.locator('.fo-search__group')).toHaveText([search.guidesGroup]);
    await expect(listbox.getByRole('option')).toHaveCount(1);
    await expect(listbox.getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
    // Nothing: no group, no title, the empty state that names tools and guides.
    await input.fill('youtube downloader');
    await expect(listbox).toBeHidden();
    await expect(dialog.locator('.fo-search__group')).toHaveCount(0);
    await expect(dialog.getByRole('status')).toHaveText(search.emptyTitle.replace('{query}', 'youtube downloader'));
    // Typing again loads nothing more.
    expect(lazy.length).toBe(2);
  });
}
