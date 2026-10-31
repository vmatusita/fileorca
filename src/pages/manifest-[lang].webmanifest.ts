// Web app manifest per language, with the app icon of docs/design/assets/Logo (DECISOES § 45).
import type { APIRoute, GetStaticPaths } from 'astro';
import { LANGS, LANG_TAG, type Lang } from '../i18n/routes.ts';
import { TEXTS } from '../i18n/texts.ts';
import { homePath } from '../seo/meta.ts';

export const getStaticPaths: GetStaticPaths = () => LANGS.map((lang) => ({ params: { lang } }));

export const GET: APIRoute = ({ params }) => {
  const lang = params['lang'] as Lang;
  const manifest = {
    name: 'FileOrca',
    short_name: 'FileOrca',
    description: TEXTS[lang].home.description,
    lang: LANG_TAG[lang],
    start_url: homePath(lang),
    scope: '/',
    display: 'standalone',
    background_color: '#F7FAFD',
    theme_color: '#0C2B5E',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
  return new Response(JSON.stringify(manifest), { headers: { 'Content-Type': 'application/manifest+json' } });
};
