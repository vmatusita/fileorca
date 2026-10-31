// SEO checks that depend on what a page is: the image tools, their presets and the /image-tools/ hub (prompt F2,
// decision 9). They live apart from scripts/gates/seo.ts so Vitest can prove each one; the tool and preset ids come
// from the registry the pages themselves are built from, so a new tool is covered the day it is declared.
import { IMAGE_PAGES } from '../../src/tools/image/registry.ts';

/** Route id of the hub of the image tools. */
export const HUB_ID = 'image-tools';

/** Route ids of every image tool and preset (src/tools/image/registry.ts). */
export const IMAGE_PAGE_IDS: readonly string[] = Object.keys(IMAGE_PAGES);

/** A tool page or a preset page of the image tools. */
export function isImagePage(routeId: string): boolean {
  return Object.hasOwn(IMAGE_PAGES, routeId);
}

/** The schema types a page must carry (Organization is on every page; a page not listed needs only that). */
export function requiredSchemaTypes(routeId: string): string[] {
  if (routeId === 'home') return ['Organization', 'WebSite'];
  if (routeId === 'about') return ['Organization', 'BreadcrumbList', 'Person', 'AboutPage'];
  if (isImagePage(routeId)) return ['Organization', 'BreadcrumbList', 'WebApplication'];
  if (routeId === HUB_ID) return ['Organization', 'BreadcrumbList'];
  return ['Organization'];
}

/** The title of a tool or preset page starts with its H1, which is the name of the tool (decision 9). */
export function titleProblem(routeId: string, title: string, h1: string): string | null {
  if (!isImagePage(routeId)) return null;
  return h1 !== '' && title.startsWith(h1) ? null : `título não começa pelo nome da ferramenta (${h1})`;
}

export interface LdNode {
  '@type'?: string;
  url?: string;
  itemListElement?: { position?: number; item?: string }[];
}

/** The WebApplication of a tool or preset and the BreadcrumbList of a tool, preset or hub end at the page itself (its canonical). */
export function schemaProblems(routeId: string, nodes: readonly LdNode[], canonical: string): string[] {
  const tool = isImagePage(routeId);
  if (!tool && routeId !== HUB_ID) return [];
  const problems: string[] = [];
  const app = nodes.find((node) => node['@type'] === 'WebApplication');
  if (tool && app && app.url !== canonical) problems.push(`WebApplication aponta ${app.url ?? 'para nada'} em vez de ${canonical}`);
  const crumbs = nodes.find((node) => node['@type'] === 'BreadcrumbList')?.itemListElement ?? [];
  if (crumbs.some((crumb, index) => crumb.position !== index + 1)) problems.push('BreadcrumbList com posições fora de ordem');
  const last = crumbs.at(-1)?.item;
  if (crumbs.length > 0 && last !== canonical) problems.push(`BreadcrumbList termina em ${last ?? 'nada'} em vez de ${canonical}`);
  return problems;
}

/** The URLs that a sitemap does not list. */
export function missingFromSitemap(xml: string, urls: readonly string[]): string[] {
  const listed = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
  return urls.filter((url) => !listed.has(url));
}
