// The category sections of the home (F13b, decision 6; DECISOES § 567 and § 570; ajuste-home-cards, § 602 to § 605):
// one section per category of the language, in the order of the page, each with one ToolCard per tool (its name, its
// description and its icon), read from the registries at build time. A page with no path in the language gets no card.
// The lists are the F13b bands' (the module keeps the word "band" for a category section). Node only (the home has no
// island): HomeView.astro renders the sections, gate:prontidao (scripts/lib/prontidao.ts) and the tests read the same lists.
//   - image: the 11 image tools (Image to PDF in the colour of PDF, as on the image hub);
//   - PDF: the 13 PDF tools (the PDF presets never);
//   - money: in English and Spanish the 6 most used credit calculators (the 5 of HOME_MONEY_IDS and Credit card payoff,
//     as the specification asks; § 570), in Portuguese the 8 made for Brazil;
//   - home and health (English only): the 6 home and the 5 health calculators;
//   - QR code: the generator.
import { QR_ID, moneyHubId, pagePath, routeById, type Lang } from '../i18n/routes.ts';
import type { CommonTexts, ToolBlurb } from '../i18n/types.ts';
import type { IconName } from '../icons/svg.ts';
import { BR_CALC_IDS, HOME_MONEY_IDS, LIFE_HUB_IDS, LIFE_HUB_ROUTE, moneyPage, type MoneyPageId } from '../tools/calc/registry.ts';
import { IMAGE_PAGES, IMAGE_TOOL_IDS } from '../tools/image/registry.ts';
import { PDF_HUB_ID, PDF_PAGES, PDF_TOOL_IDS } from '../tools/pdf/registry.ts';

export type BandId = 'image' | 'pdf' | 'money' | 'life' | 'qr';
export type CardCategory = 'image' | 'pdf' | 'money' | 'home' | 'util';

/** The money calculators of the home's money section, per language (§ 570): the specification's 6 in en and es, the 8 in pt. */
export const HOME_BAND_MONEY_IDS: Record<Lang, readonly MoneyPageId[]> = {
  en: [...HOME_MONEY_IDS.en, 'credit-card-payoff-calculator'],
  pt: BR_CALC_IDS,
  es: [...HOME_MONEY_IDS.es, 'credit-card-payoff-calculator'],
};

/** One ToolCard of the home: what the card says and where it leads. */
export interface HomeCard {
  href: string;
  name: string;
  description: string;
  icon: IconName;
  category: CardCategory;
}

export interface HomeBand {
  id: BandId;
  /** The id of the section's H2 (the image section keeps "tools", the id of the first section since the F1b). */
  headingId: string;
  category: CardCategory;
  cards: HomeCard[];
  /** The links under the cards: the hub of the section (two in the home and health section). */
  hubs: string[];
}

/** The cards of a section: one for each id that gives one (a page with a path in the language). */
const cardsOf = <T extends string>(ids: readonly T[], one: (id: T) => HomeCard | null): HomeCard[] => ids.flatMap((id) => one(id) ?? []);

/**
 * Every category section of the home in a language, in the order of the page; a section with no card is left out. The
 * names and the descriptions come from the common texts of the language; without them (gate:prontidao, which reads no
 * text module) a card has its path and empty words.
 */
export function homeBands(lang: Lang, common: CommonTexts | null = null): HomeBand[] {
  /** The words of a card: the blurb of the common texts, null when the language lacks it, empty without the texts. */
  const words = (blurb: ToolBlurb | undefined): { name: string; description: string } | null =>
    common ? (blurb ? { name: blurb.name, description: blurb.description } : null) : { name: '', description: '' };
  const bands: HomeBand[] = [];
  const imageHub = routeById('image-tools').paths[lang];
  const image = cardsOf(IMAGE_TOOL_IDS, (id) => {
    const href = routeById(id).paths[lang];
    const said = words(common?.tools[id]);
    return href && said ? { href, ...said, icon: IMAGE_PAGES[id].icon, category: IMAGE_PAGES[id].pdf ? 'pdf' : 'image' } : null;
  });
  if (image.length) bands.push({ id: 'image', headingId: 'tools', category: 'image', cards: image, hubs: imageHub ? [imageHub] : [] });
  const pdfHub = pagePath(PDF_HUB_ID, lang);
  const pdf = cardsOf(PDF_TOOL_IDS, (id) => {
    const href = pagePath(id, lang);
    const said = words(common?.pdf?.[id]);
    return href && said ? { href, ...said, icon: PDF_PAGES[id].icon, category: 'pdf' } : null;
  });
  if (pdf.length) bands.push({ id: 'pdf', headingId: 'pdf-home', category: 'pdf', cards: pdf, hubs: pdfHub ? [pdfHub] : [] });
  const moneyHub = pagePath(moneyHubId(lang), lang);
  const money = moneyHub
    ? cardsOf(HOME_BAND_MONEY_IDS[lang], (id) => {
        const page = moneyPage(id, lang);
        const href = pagePath(id, lang);
        const said = words(common?.calcs[id]);
        return page && href && said ? { href, ...said, icon: page.icon, category: 'money' } : null;
      })
    : [];
  if (moneyHub && money.length) bands.push({ id: 'money', headingId: 'money-home', category: 'money', cards: money, hubs: [moneyHub] });
  const lifeHubs = (['house', 'health'] as const).flatMap((hub) => pagePath(LIFE_HUB_ROUTE[hub], lang) ?? []);
  const life = (['house', 'health'] as const).flatMap((hub) =>
    pagePath(LIFE_HUB_ROUTE[hub], lang)
      ? cardsOf(LIFE_HUB_IDS[hub], (id) => {
          const page = moneyPage(id, lang);
          const said = words(common?.calcs[id]);
          return page && said ? { href: page.path, ...said, icon: page.icon, category: 'home' } : null;
        })
      : [],
  );
  if (life.length) bands.push({ id: 'life', headingId: 'life-home', category: 'home', cards: life, hubs: lifeHubs });
  const qrPath = pagePath(QR_ID, lang);
  const qrSaid = words(common?.qr);
  if (qrPath && qrSaid) bands.push({ id: 'qr', headingId: 'qr-home', category: 'util', cards: [{ href: qrPath, ...qrSaid, icon: 'qr', category: 'util' }], hubs: [] });
  return bands;
}

/** The paths every card of the home leads to, in the order of the page (gate:prontidao and the tests). */
export function homeCardPaths(lang: Lang): string[] {
  return homeBands(lang).flatMap((band) => band.cards.map((card) => card.href));
}
