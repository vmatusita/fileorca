// How many tools the site has in a language (F13b, decision 3; DECISOES § 540): one count for the whole site, without
// the presets, read from the registries at build time. The home H1, the "FileOrca in numbers" card and the text of the
// About and Terms pages read it, and the tests read it in Node, like header-menu.ts (never import it from an island).
// The categories count what the Menu counts (sectionCount): the image and PDF tools with a page in the language, the
// money calculators of the language's hub (14 in English and Spanish, the 8 made for Brazil in Portuguese), the home
// and health calculators where they exist, and the QR code generator. The 3 image presets and the 4 money presets
// never count: 48 tools in English, 31 in Portuguese and 37 in Spanish.
import { groupDigits } from '../i18n/format.ts';
import { LANGS, QR_ID, pagePath, type Lang } from '../i18n/routes.ts';
import { sectionCount } from './header-menu.ts';

export interface ToolCounts {
  image: number;
  pdf: number;
  money: number;
  house: number;
  health: number;
  qr: number;
  /** The home and health calculators together (the "11" of the English About). */
  life: number;
  total: number;
}

export function toolCounts(lang: Lang): ToolCounts {
  const image = sectionCount('image', lang) ?? 0;
  const pdf = sectionCount('pdf', lang) ?? 0;
  const money = sectionCount('money', lang) ?? 0;
  const house = sectionCount('house', lang) ?? 0;
  const health = sectionCount('health', lang) ?? 0;
  const qr = pagePath(QR_ID, lang) === undefined ? 0 : 1;
  return { image, pdf, money, house, health, qr, life: house + health, total: image + pdf + money + house + health + qr };
}

/** The number of tools of the site in a language, without the presets. */
export function toolCount(lang: Lang): number {
  return toolCounts(lang).total;
}

/** A count of the card "FileOrca in numbers" (F13b, decision 8; DECISOES § 586). */
export type StatKind = 'image' | 'pdf' | 'money' | 'life' | 'languages';

/**
 * The four counts of the card "FileOrca in numbers" in a language, in order: the image tools, the PDF tools, the money
 * calculators of the hub, and the home and health calculators where the language has them (10 · 12 · 14 · 11 in English)
 * or the languages of the site where it has none (10 · 12 · 8 · 3 in Portuguese, 10 · 12 · 14 · 3 in Spanish).
 */
export function statsItems(lang: Lang): { kind: StatKind; value: number }[] {
  const here = toolCounts(lang);
  return [
    { kind: 'image', value: here.image },
    { kind: 'pdf', value: here.pdf },
    { kind: 'money', value: here.money },
    here.life > 0 ? { kind: 'life', value: here.life } : { kind: 'languages', value: LANGS.length },
  ];
}

/**
 * The placeholders of the texts that count tools (the About and Terms pages), as the language writes the numbers:
 * {image}, {pdf}, {money}, {life} and {total} of the page's language, {brazil} (the money calculators made for Brazil,
 * in Portuguese), {spanish} (the money calculators in Spanish) and {languages} (the languages of the site; F13b, G-14,
 * DECISOES § 586).
 */
export function countValues(lang: Lang): Record<string, string> {
  const here = toolCounts(lang);
  const n = (value: number) => groupDigits(value, lang);
  return {
    image: n(here.image),
    pdf: n(here.pdf),
    money: n(here.money),
    life: n(here.life),
    total: n(here.total),
    brazil: n(toolCounts('pt').money),
    spanish: n(toolCounts('es').money),
    languages: n(LANGS.length),
  };
}
