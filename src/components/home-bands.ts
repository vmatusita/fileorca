// The bands of the home (F13b, decision 6; UX-03 B, home-b.html; DECISOES § H-1 and § H-4): one band per category of the
// language, in the order of the page, each with its tools as chips, read from the registries at build time. A page with no
// path in the language gets no chip. Node only (the home has no island): HomeView.astro renders the bands, gate:prontidao
// (scripts/lib/prontidao.ts) and the tests read the same lists.
//   - image: the 8 image tools (Image to PDF in the colour of PDF, as on the image hub);
//   - PDF: the 12 PDF tools;
//   - money: in English and Spanish the 6 most used credit calculators (the 5 of HOME_MONEY_IDS and Credit card payoff,
//     as the specification asks; § H-4), in Portuguese the 8 made for Brazil;
//   - home and health (English only): the 6 home and the 5 health calculators;
//   - QR code: the generator.
import { QR_ID, moneyHubId, pagePath, routeById, type Lang } from '../i18n/routes.ts';
import type { CommonTexts } from '../i18n/types.ts';
import type { IconName } from '../icons/svg.ts';
import { BR_CALC_IDS, HOME_MONEY_IDS, LIFE_HUB_IDS, LIFE_HUB_ROUTE, moneyPage, type MoneyPageId } from '../tools/calc/registry.ts';
import { IMAGE_PAGES, IMAGE_TOOL_IDS } from '../tools/image/registry.ts';
import { PDF_HUB_ID, PDF_PAGES, PDF_TOOL_IDS } from '../tools/pdf/registry.ts';

export type BandId = 'image' | 'pdf' | 'money' | 'life' | 'qr';
export type ChipCategory = 'image' | 'pdf' | 'money' | 'home' | 'util';

/** The money calculators of the home's money band, per language (§ H-4): the specification's 6 in en and es, the 8 in pt. */
export const HOME_BAND_MONEY_IDS: Record<Lang, readonly MoneyPageId[]> = {
  en: [...HOME_MONEY_IDS.en, 'credit-card-payoff-calculator'],
  pt: BR_CALC_IDS,
  es: [...HOME_MONEY_IDS.es, 'credit-card-payoff-calculator'],
};

export interface HomeChip {
  href: string;
  name: string;
  icon: IconName;
  category: ChipCategory;
}

export interface HomeBand {
  id: BandId;
  /** The id of the band's H2 (the image band keeps "tools", the id of the first section since the F1b). */
  headingId: string;
  category: ChipCategory;
  chips: HomeChip[];
  /** The links under the chips: the hub of the band (two in the home and health band). */
  hubs: string[];
}

/** The chips of a band: one for each id that gives one (a page with a path in the language). */
const chipsOf = <T extends string>(ids: readonly T[], one: (id: T) => HomeChip | null): HomeChip[] => ids.flatMap((id) => one(id) ?? []);

/**
 * Every band of the home in a language, in the order of the page; a band with no chip is left out. The names come from the
 * common texts of the language; without them (gate:prontidao, which reads no text module) a chip has its path and no name.
 */
export function homeBands(lang: Lang, common: CommonTexts | null = null): HomeBand[] {
  const named = (name: string | undefined): string | null => (common ? (name ?? null) : '');
  const bands: HomeBand[] = [];
  const imageHub = routeById('image-tools').paths[lang];
  const image = chipsOf(IMAGE_TOOL_IDS, (id) => {
    const href = routeById(id).paths[lang];
    const name = named(common?.tools[id]?.name);
    return href && name !== null ? { href, name, icon: IMAGE_PAGES[id].icon, category: IMAGE_PAGES[id].pdf ? 'pdf' : 'image' } : null;
  });
  if (image.length) bands.push({ id: 'image', headingId: 'tools', category: 'image', chips: image, hubs: imageHub ? [imageHub] : [] });
  const pdfHub = pagePath(PDF_HUB_ID, lang);
  const pdf = chipsOf(PDF_TOOL_IDS, (id) => {
    const href = pagePath(id, lang);
    const name = named(common?.pdf?.[id]?.name);
    return href && name !== null ? { href, name, icon: PDF_PAGES[id].icon, category: 'pdf' } : null;
  });
  if (pdf.length) bands.push({ id: 'pdf', headingId: 'pdf-home', category: 'pdf', chips: pdf, hubs: pdfHub ? [pdfHub] : [] });
  const moneyHub = pagePath(moneyHubId(lang), lang);
  const money = moneyHub
    ? chipsOf(HOME_BAND_MONEY_IDS[lang], (id) => {
        const page = moneyPage(id, lang);
        const href = pagePath(id, lang);
        const name = named(common?.calcs[id]?.name);
        return page && href && name !== null ? { href, name, icon: page.icon, category: 'money' } : null;
      })
    : [];
  if (moneyHub && money.length) bands.push({ id: 'money', headingId: 'money-home', category: 'money', chips: money, hubs: [moneyHub] });
  const lifeHubs = (['house', 'health'] as const).flatMap((hub) => pagePath(LIFE_HUB_ROUTE[hub], lang) ?? []);
  const life = (['house', 'health'] as const).flatMap((hub) =>
    pagePath(LIFE_HUB_ROUTE[hub], lang)
      ? chipsOf(LIFE_HUB_IDS[hub], (id) => {
          const page = moneyPage(id, lang);
          const name = named(common?.calcs[id]?.name);
          return page && name !== null ? { href: page.path, name, icon: page.icon, category: 'home' } : null;
        })
      : [],
  );
  if (life.length) bands.push({ id: 'life', headingId: 'life-home', category: 'home', chips: life, hubs: lifeHubs });
  const qrPath = pagePath(QR_ID, lang);
  const qrName = named(common?.qr?.name);
  if (qrPath && qrName !== null) bands.push({ id: 'qr', headingId: 'qr-home', category: 'util', chips: [{ href: qrPath, name: qrName, icon: 'qr', category: 'util' }], hubs: [] });
  return bands;
}

/** The paths every chip of the home leads to, in the order of the page (gate:prontidao and the tests). */
export function homeChipPaths(lang: Lang): string[] {
  return homeBands(lang).flatMap((band) => band.chips.map((chip) => chip.href));
}
