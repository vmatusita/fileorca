// The name of a page as the site already calls it in a language (F19a, decision 2; DECISOES § 756): the name of its card
// for a tool, a preset, a calculator, a guide or the QR code (common.tools, common.pdf, common.calcs, common.guides,
// common.fileGuides, common.qr: the names of the cards, the menus, the search and the footer); the name of its hub for a
// hub (common.imageTools…); the word of the breadcrumb for the home; the link of the footer for the pages of the site
// (About, What's new, How it works, Privacy, Terms, Licenses, Contact) and the row of the Menu for the support page. The
// What's new page links each entry to the pages it touched with these names. Plain data, no new text: a page with no name
// in the language returns undefined (the caller drops the link).
import type { Lang, RouteId } from '../i18n/routes.ts';
import { TEXTS } from '../i18n/texts.ts';
import type { CommonTexts, ToolBlurb } from '../i18n/types.ts';
import { BR_HUB_ID, HEALTH_HUB_ID, HOUSE_HUB_ID, MONEY_HUB_ID } from '../tools/calc/registry.ts';
import { PDF_HUB_ID } from '../tools/pdf/registry.ts';
import { GUIDES_HUB_ID } from '../tools/guides/registry.ts';

/** The pages with a name of their own (not a card): the hubs, the home and the pages of the site. */
function fixedName(id: RouteId, t: CommonTexts): string | undefined {
  switch (id) {
    case 'home':
      return t.breadcrumb.home;
    case 'image-tools':
      return t.imageTools;
    case PDF_HUB_ID:
      return t.pdfTools;
    case MONEY_HUB_ID:
    case BR_HUB_ID:
      return t.moneyCalculators;
    case HOUSE_HUB_ID:
      return t.homeCalculators;
    case HEALTH_HUB_ID:
      return t.healthCalculators;
    case GUIDES_HUB_ID:
      return t.guidesHub;
    case 'about':
      return t.footer.about;
    case 'whats-new':
      return t.footer.whatsNew;
    case 'how-it-works':
      return t.footer.howItWorks;
    case 'privacy':
      return t.footer.privacy;
    case 'terms':
      return t.footer.terms;
    case 'licenses':
      return t.footer.licenses;
    case 'contact':
      return t.footer.contact;
    case 'support':
      return t.header.support;
    default:
      return undefined;
  }
}

/** The card of a tool, preset, calculator, guide or the QR code, in the maps of common.ts. */
function card(id: RouteId, t: CommonTexts): ToolBlurb | undefined {
  const maps: readonly (Partial<Record<string, ToolBlurb>> | undefined)[] = [t.tools, t.pdf, t.calcs, t.guides, t.fileGuides];
  for (const map of maps) {
    const found = map?.[id];
    if (found) return found;
  }
  return id === 'qr-code-generator' ? t.qr : undefined;
}

/** The name of a page in a language, as its card, hub, breadcrumb, footer or Menu calls it; undefined if it has none there. */
export function pageName(id: RouteId, lang: Lang): string | undefined {
  const t = TEXTS[lang].common;
  return fixedName(id, t) ?? card(id, t)?.name;
}
