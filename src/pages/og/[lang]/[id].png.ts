// Open Graph image per indexable page and language, generated at build. A tool or preset page shows its
// tool icon beside the Oli (the registry's icon; Image to PDF in the PDF colour); the image hub shows the
// image icon. A money page (calculator, hub, guide) shows its calculator's icon in the money colour (F4). A PDF tool
// shows its icon in the PDF colour, and the PDF hub the PDF icon (F5a). A file guide shows the icon of the tool it embeds, in
// the colour of its hub (F5b). Every heading is in the language of the page (F6): the Brazilian calculators and hub show
// their own names in Portuguese. The home and health pages (F7) show their icon in the violet of their category, the QR code its
// icon in the lime of the utilities; all of them only in English.
import type { APIRoute, GetStaticPaths } from 'astro';
import { QR_ID, ROUTES, languagesOf, type Lang, type RouteId } from '../../../i18n/routes.ts';
import { TEXTS, type LangTexts } from '../../../i18n/texts.ts';
import { ogPng, type OgTool } from '../../../seo/images.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../../tools/image/registry.ts';
import { imageToolTexts } from '../../../tools/image/texts.ts';
import enCommon from '../../../i18n/en/common.ts';
import {
  BR_CALC_PAGES,
  BR_HUB_ID,
  CALC_PAGES,
  GUIDES,
  HEALTH_HUB_ID,
  HOUSE_HUB_ID,
  LIFE_CALC_PAGES,
  MONEY_HUB_ID,
  isBrCalc,
  isCalcPage,
  isGuide,
  isLifeCalc,
  isMoneyCalc,
  type LifeCalcId,
} from '../../../tools/calc/registry.ts';
import { LIFE_HUB_TEXTS } from '../../../i18n/life-hubs.ts';
import { SHARED_BY_LANG, calcTexts } from '../../../tools/calc/page.ts';
import { PDF_HUB_ID, PDF_PAGES, type PdfToolId } from '../../../tools/pdf/registry.ts';
import { PDF_TOOL_TEXTS } from '../../../tools/pdf/texts.ts';
import { FILE_GUIDES, isFileGuide, type FileGuideId } from '../../../tools/guides/registry.ts';
import { QR_TEXTS } from '../../../tools/qr-code-generator/page.ts';

/** A card title that must exist in the language of the page: an empty title would be an empty card. */
function named(name: string | undefined, id: RouteId, lang: Lang): string {
  if (!name) throw new Error(`no ${lang} name for the card of ${id}`);
  return name;
}

export const getStaticPaths: GetStaticPaths = () =>
  ROUTES.filter((route) => route.indexable).flatMap((route) =>
    languagesOf(route).map((lang) => ({ params: { lang, id: route.id } })),
  );

const isImagePage = (id: string): id is ImagePageId => Object.hasOwn(IMAGE_PAGES, id);

const isPdfPage = (id: string): id is PdfToolId => Object.hasOwn(PDF_PAGES, id);

type PlainId = Exclude<
  RouteId,
  | ImagePageId
  | 'image-tools'
  | typeof MONEY_HUB_ID
  | typeof BR_HUB_ID
  | keyof typeof CALC_PAGES
  | keyof typeof BR_CALC_PAGES
  | keyof typeof GUIDES
  | PdfToolId
  | typeof PDF_HUB_ID
  | FileGuideId
  | LifeCalcId
  | typeof HOUSE_HUB_ID
  | typeof HEALTH_HUB_ID
  | typeof QR_ID
>;

function heading(lang: Lang, id: RouteId): [string, string] {
  const texts: LangTexts = TEXTS[lang];
  const seal = texts.common.seal;
  const moneySeal = SHARED_BY_LANG[lang].page.seal;
  if (isImagePage(id)) return [imageToolTexts(id, lang).h1, seal];
  if (id === 'image-tools') return [texts['image-tools'].h1, seal];
  if (isMoneyCalc(id) || isLifeCalc(id)) return [calcTexts(id, lang).h1, moneySeal];
  if (id === HOUSE_HUB_ID) return [LIFE_HUB_TEXTS.house.h1, moneySeal];
  if (id === HEALTH_HUB_ID) return [LIFE_HUB_TEXTS.health.h1, moneySeal];
  // The QR code page keeps no file, so its card carries the seal of the page (in pt and es since the languages adjustment).
  if (id === QR_ID) return lang === 'en' ? [enCommon.qr.name, seal] : [named(texts.common.qr?.name, id, lang), QR_TEXTS[lang].seal];
  if (isGuide(id)) return [named(texts.common.guides?.[id]?.name, id, lang), moneySeal];
  if (id === MONEY_HUB_ID || id === BR_HUB_ID) return [texts['money-calculators'].h1, moneySeal];
  if (isPdfPage(id)) return [PDF_TOOL_TEXTS[lang][id].h1, seal];
  if (id === PDF_HUB_ID) return [texts['pdf-tools'].h1, seal];
  if (isFileGuide(id)) return [named(texts.common.fileGuides?.[id]?.name, id, lang), seal];
  return [texts[id as PlainId].h1, seal];
}

function toolOf(id: RouteId): OgTool | undefined {
  if (isImagePage(id)) return { icon: IMAGE_PAGES[id].icon, category: IMAGE_PAGES[id].pdf ? 'pdf' : 'image' };
  if (id === 'image-tools') return { icon: 'image', category: 'image' };
  if (isCalcPage(id)) return { icon: CALC_PAGES[id].icon, category: 'money' };
  if (isBrCalc(id)) return { icon: BR_CALC_PAGES[id].icon, category: 'money' };
  if (isLifeCalc(id)) return { icon: LIFE_CALC_PAGES[id].icon, category: 'home' };
  if (id === HOUSE_HUB_ID) return { icon: 'home', category: 'home' };
  if (id === HEALTH_HUB_ID) return { icon: 'heart', category: 'home' };
  if (id === QR_ID) return { icon: 'qr', category: 'util' };
  if (isGuide(id)) return { icon: CALC_PAGES[GUIDES[id].calc].icon, category: 'money' };
  if (id === MONEY_HUB_ID || id === BR_HUB_ID) return { icon: 'calculator', category: 'money' };
  if (isPdfPage(id)) return { icon: PDF_PAGES[id].icon, category: 'pdf' };
  if (id === PDF_HUB_ID) return { icon: 'pdf', category: 'pdf' };
  if (isFileGuide(id)) {
    const tool = FILE_GUIDES[id].tool;
    return { icon: isPdfPage(tool) ? PDF_PAGES[tool].icon : IMAGE_PAGES[tool].icon, category: FILE_GUIDES[id].hub === 'pdf-tools' ? 'pdf' : 'image' };
  }
  return undefined;
}

export const GET: APIRoute = async ({ params }) => {
  const id = params['id'] as RouteId;
  const [title, subtitle] = heading(params['lang'] as Lang, id);
  const tool = toolOf(id);
  const png = await ogPng(title, subtitle, tool ? { tool } : {});
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
