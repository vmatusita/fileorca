// App icon PNGs for the manifest (192, 512), the Organization logo (512) and the apple-touch-icon (180, opaque).
import type { APIRoute, GetStaticPaths } from 'astro';
import { iconPng } from '../seo/images.ts';

export const SIZES = ['180', '192', '512'] as const;

export const getStaticPaths: GetStaticPaths = () => SIZES.map((size) => ({ params: { size } }));

// iOS fills transparency with black, so the apple-touch-icon carries its own ground.
export const GET: APIRoute = ({ params }) =>
  new Response(new Uint8Array(iconPng(Number(params['size']), { opaque: params['size'] === '180' })), {
    headers: { 'Content-Type': 'image/png' },
  });
