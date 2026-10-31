// Open Graph image per indexable page and language, generated at build.
import type { APIRoute, GetStaticPaths } from 'astro';
import { ROUTES, languagesOf, type Lang, type RouteId } from '../../../i18n/routes.ts';
import { TEXTS, type LangTexts } from '../../../i18n/texts.ts';
import { ogPng } from '../../../seo/images.ts';

export const getStaticPaths: GetStaticPaths = () =>
  ROUTES.filter((route) => route.indexable).flatMap((route) =>
    languagesOf(route).map((lang) => ({ params: { lang, id: route.id } })),
  );

function heading(lang: Lang, id: RouteId): [string, string] {
  const texts: LangTexts = TEXTS[lang];
  const seal = texts.common.seal;
  switch (id) {
    case 'compress-image':
      return [texts['compress-image'].h1, seal];
    case 'home':
      return [texts.home.h1, seal];
    case 'not-found':
      return [texts['not-found'].h1, seal];
    default:
      return [texts[id].h1, seal];
  }
}

export const GET: APIRoute = async ({ params }) => {
  const [title, subtitle] = heading(params['lang'] as Lang, params['id'] as RouteId);
  // The tool page shows its tool icon beside the Oli.
  const png = await ogPng(title, subtitle, params['id'] === 'compress-image' ? { tool: 'compress-image' } : {});
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
