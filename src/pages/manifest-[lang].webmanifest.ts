// Web app manifest per language, with the app icon of docs/design/assets/Logo (DECISOES § 45). F8: the `id` is the
// start_url, written out so the identity of an installed app never changes (decision 9; DECISOES § 291), and the
// share_target opens the "Open with" page of the language with the images and PDFs shared from Android, while the
// service worker that receives them is on (SW_ENABLED; DECISOES § 288 and § 290).
import type { APIRoute, GetStaticPaths } from 'astro';
import { LANGS, LANG_TAG, pathFor, type Lang } from '../i18n/routes.ts';
import { TEXTS } from '../i18n/texts.ts';
import { homePath } from '../seo/meta.ts';
import { SW_ENABLED } from '../platform/site.ts';
import { SHARE_FIELD } from '../sw/shared.ts';
import { shareAccept } from '../share/tools.ts';

export const getStaticPaths: GetStaticPaths = () => LANGS.map((lang) => ({ params: { lang } }));

export function manifestFor(lang: Lang, shareOn: boolean = SW_ENABLED): Record<string, unknown> {
  const start = homePath(lang);
  return {
    id: start,
    name: 'FileOrca',
    short_name: 'FileOrca',
    description: TEXTS[lang].home.description,
    lang: LANG_TAG[lang],
    start_url: start,
    scope: '/',
    display: 'standalone',
    background_color: '#F7FAFD',
    theme_color: '#0C2B5E',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    ...(shareOn
      ? {
          share_target: {
            action: pathFor('open-with', lang),
            method: 'POST',
            enctype: 'multipart/form-data',
            params: { files: [{ name: SHARE_FIELD, accept: shareAccept() }] },
          },
        }
      : {}),
  };
}

export const GET: APIRoute = ({ params }) => {
  const lang = params['lang'] as Lang;
  return new Response(JSON.stringify(manifestFor(lang)), { headers: { 'Content-Type': 'application/manifest+json' } });
};
