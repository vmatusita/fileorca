// ads.txt only exists when PUBLIC_ADSENSE_CLIENT is set (PLANO "Como o anúncio liga", passo 2).
import type { APIRoute, GetStaticPaths } from 'astro';
import { adsTxt, buildAdsConfig } from '../ads/config.ts';

export const getStaticPaths: GetStaticPaths = () => (buildAdsConfig().client ? [{ params: { adsfile: 'ads' } }] : []);

export const GET: APIRoute = () => {
  const { client } = buildAdsConfig();
  return new Response(client ? adsTxt(client) : '', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
