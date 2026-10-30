// Provisional app icons for the manifest and the Organization logo (the F1b brings the Oli icon).
import type { APIRoute, GetStaticPaths } from 'astro';
import { iconPng } from '../seo/images.ts';

export const SIZES = ['192', '512'] as const;

export const getStaticPaths: GetStaticPaths = () => SIZES.map((size) => ({ params: { size } }));

export const GET: APIRoute = ({ params }) =>
  new Response(new Uint8Array(iconPng(Number(params['size']))), { headers: { 'Content-Type': 'image/png' } });
