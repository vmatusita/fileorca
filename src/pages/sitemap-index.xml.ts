import type { APIRoute } from 'astro';
import { sitemapIndexXml } from '../seo/sitemap.ts';

export const GET: APIRoute = () =>
  new Response(sitemapIndexXml(), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
