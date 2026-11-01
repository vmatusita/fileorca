// SEO checks that depend on what a page is: the image tools, their presets and the /image-tools/ hub (prompt F2,
// decision 9). They live apart from scripts/gates/seo.ts so Vitest can prove each one; the tool and preset ids come
// from the registry the pages themselves are built from, so a new tool is covered the day it is declared.
import { IMAGE_PAGES } from '../../src/tools/image/registry.ts';
import { CALC_PAGES, GUIDES, MONEY_HUB_ID } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';

/** Route id of the hub of the image tools. */
export const HUB_ID = 'image-tools';

/** Route ids of every page of the F5a: the PDF hub and the 12 PDF tools (src/tools/pdf/registry.ts). */
export const PDF_PAGE_IDS: readonly string[] = [PDF_HUB_ID, ...PDF_TOOL_IDS];

/** One of the 12 PDF tools (the hub is not a tool). */
export function isPdfPage(routeId: string): boolean {
  return (PDF_TOOL_IDS as readonly string[]).includes(routeId);
}

/** Route ids of every image tool and preset (src/tools/image/registry.ts). */
export const IMAGE_PAGE_IDS: readonly string[] = Object.keys(IMAGE_PAGES);

/** Route ids of every money page of the F4: the hub, the calculators and presets, the guides (src/tools/calc/registry.ts). */
export const MONEY_PAGE_IDS: readonly string[] = [MONEY_HUB_ID, ...Object.keys(CALC_PAGES), ...Object.keys(GUIDES)];

/** A tool page or a preset page of the image tools. */
export function isImagePage(routeId: string): boolean {
  return Object.hasOwn(IMAGE_PAGES, routeId);
}

/** A money calculator or calculator preset. */
export function isCalcPage(routeId: string): boolean {
  return Object.hasOwn(CALC_PAGES, routeId);
}

/** The schema types a page must carry (Organization is on every page; a page not listed needs only that). */
export function requiredSchemaTypes(routeId: string): string[] {
  if (routeId === 'home') return ['Organization', 'WebSite'];
  if (routeId === 'about') return ['Organization', 'BreadcrumbList', 'Person', 'AboutPage'];
  if (isImagePage(routeId)) return ['Organization', 'BreadcrumbList', 'WebApplication'];
  if (routeId === HUB_ID) return ['Organization', 'BreadcrumbList'];
  // PDF pages (F5a, decision 7): the tools are the image tools' kind of page (WebApplication with no rating and a
  // BreadcrumbList); the hub is a CollectionPage like the money hub, with no author node.
  if (isPdfPage(routeId)) return ['Organization', 'BreadcrumbList', 'WebApplication'];
  if (routeId === PDF_HUB_ID) return ['Organization', 'BreadcrumbList', 'CollectionPage'];
  // Money pages (F4, decision 8): WebApplication with no rating, BreadcrumbList and the author; the hub is a
  // CollectionPage; a guide is an Article by the author.
  if (isCalcPage(routeId)) return ['Organization', 'BreadcrumbList', 'WebApplication', 'Person'];
  if (routeId === MONEY_HUB_ID) return ['Organization', 'BreadcrumbList', 'CollectionPage', 'Person'];
  if (Object.hasOwn(GUIDES, routeId)) return ['Organization', 'BreadcrumbList', 'Article', 'Person'];
  return ['Organization'];
}

/**
 * The title of a tool or preset page starts with its H1, which is the name of the tool (decision 9). A money
 * calculator's title is in Title Case ("Mortgage Calculator with Extra Payments | FileOrca") and its H1 in
 * sentence case, so for those the comparison ignores case (DECISOES § 122).
 */
export function titleProblem(routeId: string, title: string, h1: string): string | null {
  if (isCalcPage(routeId)) return h1 !== '' && title.toLowerCase().startsWith(h1.toLowerCase()) ? null : `título não começa pelo nome da calculadora (${h1})`;
  if (!isImagePage(routeId) && !isPdfPage(routeId)) return null;
  return h1 !== '' && title.startsWith(h1) ? null : `título não começa pelo nome da ferramenta (${h1})`;
}

export interface LdNode {
  '@type'?: string;
  url?: string;
  itemListElement?: { position?: number; item?: string }[];
}

/** The WebApplication of a tool or preset and the BreadcrumbList of a tool, preset or hub end at the page itself (its canonical). */
export function schemaProblems(routeId: string, nodes: readonly LdNode[], canonical: string): string[] {
  const tool = isImagePage(routeId) || isCalcPage(routeId) || isPdfPage(routeId);
  if (!tool && routeId !== HUB_ID && !MONEY_PAGE_IDS.includes(routeId) && routeId !== PDF_HUB_ID) return [];
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
