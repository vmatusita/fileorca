// Open Graph image per indexable page and language, generated at build. A tool or preset page shows its
// tool icon beside the Oli (the registry's icon; Image to PDF in the PDF colour); the image hub shows the
// image icon.
import type { APIRoute, GetStaticPaths } from 'astro';
import { ROUTES, languagesOf, type Lang, type RouteId } from '../../../i18n/routes.ts';
import { TEXTS, type LangTexts } from '../../../i18n/texts.ts';
import enImageTools from '../../../i18n/en/image-tools.ts';
import { ogPng, type OgTool } from '../../../seo/images.ts';
import { IMAGE_PAGES, type ImagePageId } from '../../../tools/image/registry.ts';
import { imageToolTexts } from '../../../tools/image/texts.ts';

export const getStaticPaths: GetStaticPaths = () =>
  ROUTES.filter((route) => route.indexable).flatMap((route) =>
    languagesOf(route).map((lang) => ({ params: { lang, id: route.id } })),
  );

const isImagePage = (id: string): id is ImagePageId => Object.hasOwn(IMAGE_PAGES, id);

type PlainId = Exclude<RouteId, ImagePageId | 'image-tools'>;

function heading(lang: Lang, id: RouteId): [string, string] {
  const texts: LangTexts = TEXTS[lang];
  const seal = texts.common.seal;
  if (isImagePage(id)) return [imageToolTexts(id, lang).h1, seal];
  if (id === 'image-tools') return [enImageTools.h1, seal];
  return [texts[id as PlainId].h1, seal];
}

function toolOf(id: RouteId): OgTool | undefined {
  if (isImagePage(id)) return { icon: IMAGE_PAGES[id].icon, category: IMAGE_PAGES[id].pdf ? 'pdf' : 'image' };
  if (id === 'image-tools') return { icon: 'image', category: 'image' };
  return undefined;
}

export const GET: APIRoute = async ({ params }) => {
  const id = params['id'] as RouteId;
  const [title, subtitle] = heading(params['lang'] as Lang, id);
  const tool = toolOf(id);
  const png = await ogPng(title, subtitle, tool ? { tool } : {});
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
