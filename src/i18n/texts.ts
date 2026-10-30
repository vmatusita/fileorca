// Every text of the site, per language. A language that misses a file or a key fails `pnpm tipos`.
import type { Lang } from './routes.ts';
import type {
  AboutTexts,
  CommonTexts,
  CompressImageTexts,
  ContactTexts,
  HomeTexts,
  LegalTexts,
  LicensesTexts,
  NotFoundTexts,
  SupportTexts,
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
import enCompress from '../tools/compress-image/i18n/en.ts';
import ptCompress from '../tools/compress-image/i18n/pt.ts';
import esCompress from '../tools/compress-image/i18n/es.ts';

export interface LangTexts {
  common: CommonTexts;
  home: HomeTexts;
  privacy: LegalTexts;
  terms: LegalTexts;
  about: AboutTexts;
  contact: ContactTexts;
  licenses: LicensesTexts;
  support: SupportTexts;
  'not-found': NotFoundTexts;
  'compress-image': CompressImageTexts;
}

export const TEXTS: Record<Lang, LangTexts> = {
  en: {
    common: enCommon, home: enHome, privacy: enPrivacy, terms: enTerms, about: enAbout, contact: enContact,
    licenses: enLicenses, support: enSupport, 'not-found': enNotFound, 'compress-image': enCompress,
  },
  pt: {
    common: ptCommon, home: ptHome, privacy: ptPrivacy, terms: ptTerms, about: ptAbout, contact: ptContact,
    licenses: ptLicenses, support: ptSupport, 'not-found': ptNotFound, 'compress-image': ptCompress,
  },
  es: {
    common: esCommon, home: esHome, privacy: esPrivacy, terms: esTerms, about: esAbout, contact: esContact,
    licenses: esLicenses, support: esSupport, 'not-found': esNotFound, 'compress-image': esCompress,
  },
};
