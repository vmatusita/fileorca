// Every text of the site, per language. A language that misses a file or a key fails `pnpm tipos`.
// The texts of the image tools and presets are in src/tools/image/texts.ts, those of the PDF tools in
// src/tools/pdf/texts.ts and those of the calculators next to each calculator.
import type { Lang } from './routes.ts';
import type {
  AboutTexts,
  CommonTexts,
  ContactTexts,
  EnCommonTexts,
  EsCommonTexts,
  EsMoneyHubTexts,
  GuidesHubTexts,
  HomeTexts,
  ImageToolsTexts,
  LegalTexts,
  LicensesTexts,
  MoneyHubTexts,
  NotFoundTexts,
  OfflineTexts,
  OpenWithTexts,
  PdfToolsTexts,
  PtCommonTexts,
  SupportTexts,
  TranslatedHomeTexts,
} from './types.ts';
import enCommon from './en/common.ts';
import ptCommon from './pt/common.ts';
import esCommon from './es/common.ts';
import enHome from './en/home.ts';
import ptHome from './pt/home.ts';
import esHome from './es/home.ts';
import enPrivacy from './en/privacy.ts';
import ptPrivacy from './pt/privacy.ts';
import esPrivacy from './es/privacy.ts';
import enTerms from './en/terms.ts';
import ptTerms from './pt/terms.ts';
import esTerms from './es/terms.ts';
import enAbout from './en/about.ts';
import ptAbout from './pt/about.ts';
import esAbout from './es/about.ts';
import enContact from './en/contact.ts';
import ptContact from './pt/contact.ts';
import esContact from './es/contact.ts';
import enLicenses from './en/licenses.ts';
import ptLicenses from './pt/licenses.ts';
import esLicenses from './es/licenses.ts';
import enSupport from './en/support.ts';
import ptSupport from './pt/support.ts';
import esSupport from './es/support.ts';
import enNotFound from './en/not-found.ts';
import ptNotFound from './pt/not-found.ts';
import esNotFound from './es/not-found.ts';
import enOffline from './en/offline.ts';
import ptOffline from './pt/offline.ts';
import esOffline from './es/offline.ts';
import enOpenWith from './en/open-with.ts';
import ptOpenWith from './pt/open-with.ts';
import esOpenWith from './es/open-with.ts';
import enImageTools from './en/image-tools.ts';
import ptImageTools from './pt/image-tools.ts';
import esImageTools from './es/image-tools.ts';
import enPdfTools from './en/pdf-tools.ts';
import ptPdfTools from './pt/pdf-tools.ts';
import esPdfTools from './es/pdf-tools.ts';
import enMoney from './en/money-calculators.ts';
import ptMoney from './pt/money-calculators.ts';
import esMoney from './es/money-calculators.ts';
import enGuides from './en/guides.ts';
import ptGuides from './pt/guides.ts';
import esGuides from './es/guides.ts';

export interface LangTexts {
  common: CommonTexts;
  'image-tools': ImageToolsTexts;
  'pdf-tools': PdfToolsTexts;
  /** The money hub of the language: the English hub, its Spanish version, the Brazilian hub in Portuguese. */
  'money-calculators': MoneyHubTexts;
  /** The guides hub (F11): the key is its route id, like the other hubs. */
  guides: GuidesHubTexts;
  home: HomeTexts;
  privacy: LegalTexts;
  terms: LegalTexts;
  about: AboutTexts;
  contact: ContactTexts;
  licenses: LicensesTexts;
  support: SupportTexts;
  'not-found': NotFoundTexts;
  offline: OfflineTexts;
  'open-with': OpenWithTexts;
}

export const TEXTS: Record<Lang, LangTexts> = {
  en: {
    common: enCommon satisfies EnCommonTexts, 'image-tools': enImageTools, 'pdf-tools': enPdfTools, 'money-calculators': enMoney, guides: enGuides, home: enHome, privacy: enPrivacy, terms: enTerms, about: enAbout, contact: enContact,
    licenses: enLicenses, support: enSupport, 'not-found': enNotFound, offline: enOffline, 'open-with': enOpenWith,
  },
  pt: {
    common: ptCommon satisfies PtCommonTexts, 'image-tools': ptImageTools, 'pdf-tools': ptPdfTools, 'money-calculators': ptMoney, guides: ptGuides, home: ptHome satisfies TranslatedHomeTexts, privacy: ptPrivacy, terms: ptTerms, about: ptAbout, contact: ptContact,
    licenses: ptLicenses, support: ptSupport, 'not-found': ptNotFound, offline: ptOffline, 'open-with': ptOpenWith,
  },
  es: {
    common: esCommon satisfies EsCommonTexts, 'image-tools': esImageTools, 'pdf-tools': esPdfTools, 'money-calculators': esMoney satisfies EsMoneyHubTexts, guides: esGuides, home: esHome satisfies TranslatedHomeTexts, privacy: esPrivacy, terms: esTerms, about: esAbout, contact: esContact,
    licenses: esLicenses, support: esSupport, 'not-found': esNotFound, offline: esOffline, 'open-with': esOpenWith,
  },
};

// The image tools and presets keep their texts next to their code; English has all of them, Portuguese and Spanish
// only the pages that exist there (tests/unit/image-texts.test.ts checks the map against the route map).
export { IMAGE_PANEL_TEXTS, IMAGE_TOOL_TEXTS, imageToolTexts } from '../tools/image/texts.ts';
