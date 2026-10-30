import type { APIRoute, GetStaticPaths } from 'astro';
import { LANGS, type Lang } from '../i18n/routes.ts';
import { sitemapXml } from '../seo/sitemap.ts';

export const getStaticPaths: GetStaticPaths = () => LANGS.map((lang) => ({ params: { lang } }));

export const GET: APIRoute = ({ params }) =>
  new Response(sitemapXml(params['lang'] as Lang), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
