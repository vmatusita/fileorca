// SEO checks that depend on what a page is: the image tools, their presets and the /image-tools/ hub (prompt F2,
// decision 9). They live apart from scripts/gates/seo.ts so Vitest can prove each one; the tool and preset ids come
// from the registry the pages themselves are built from, so a new tool is covered the day it is declared.
import { IMAGE_PAGES } from '../../src/tools/image/registry.ts';
import { BR_CALC_IDS, BR_HUB_ID, CALC_PAGES, GUIDES, MONEY_HUB_ID, isBrCalc } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { FILE_GUIDE_IDS, isFileGuide } from '../../src/tools/guides/registry.ts';
import { QR_ID, type Lang } from '../../src/i18n/routes.ts';

/** Route id of the hub of the image tools. */
export const HUB_ID = 'image-tools';

/**
 * Route ids of the Brazilian money pages (prompt F6, decision 5): the hub and the eight calculators, in Portuguese only.
 * They are not in MONEY_PAGE_IDS, whose pages all have an English version that the English sitemap must list.
 */
export const BR_PAGE_IDS: readonly string[] = [BR_HUB_ID, ...BR_CALC_IDS];

/** The length of every meta description, in characters (F1a). */
export const DESCRIPTION_RANGE = { min: 50, max: 170 } as const;
/**
 * The image and PDF pages in Portuguese and Spanish (tools, presets and both hubs) have a description of 120 to 160
 * characters (prompt F6, decision 4). English and the other pages keep DESCRIPTION_RANGE.
 */
export const TRANSLATED_DESCRIPTION_RANGE = { min: 120, max: 160 } as const;

/** A problem with the length of a page's description, or null. */
export function descriptionProblem(routeId: string, lang: Lang, description: string): string | null {
  const length = description.length;
  const translated = lang !== 'en' && (isImagePage(routeId) || routeId === HUB_ID || routeId === PDF_HUB_ID || isPdfPage(routeId));
  // The QR code generator asks the same 120 to 160 characters in English (prompt F7, decision 8).
  if (isQrPage(routeId)) {
    const { min, max } = TRANSLATED_DESCRIPTION_RANGE;
    return length >= min && length <= max ? null : `descrição com ${length} caracteres (pede de ${min} a ${max} no gerador de QR code)`;
  }
  const range = translated ? TRANSLATED_DESCRIPTION_RANGE : DESCRIPTION_RANGE;
  if (length >= range.min && length <= range.max) return null;
  return translated ? `descrição com ${length} caracteres (pede de ${range.min} a ${range.max} nas páginas de imagem e de PDF em pt e es)` : `descrição com ${length} caracteres`;
}

/** The QR code generator (prompt F7, decision 8): a tool page of its own kind, with no hub and no registry. */
export function isQrPage(routeId: string): boolean {
  return routeId === QR_ID;
}

/** A money calculator page of any language: the English registry (and its Spanish pages) or a Brazilian one. */
function isAnyCalcPage(routeId: string): boolean {
  return isCalcPage(routeId) || isBrCalc(routeId);
}

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

/** Route ids of the ten file guides of the F5b (src/tools/guides/registry.ts). */
export const FILE_GUIDE_PAGE_IDS: readonly string[] = [...FILE_GUIDE_IDS];

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
  // The QR code generator (F7): a WebApplication (UtilitiesApplication) and the BreadcrumbList Home › QR code generator.
  if (isQrPage(routeId)) return ['Organization', 'BreadcrumbList', 'WebApplication'];
  if (routeId === HUB_ID) return ['Organization', 'BreadcrumbList'];
  // PDF pages (F5a, decision 7): the tools are the image tools' kind of page (WebApplication with no rating and a
  // BreadcrumbList); the hub is a CollectionPage like the money hub, with no author node.
  if (isPdfPage(routeId)) return ['Organization', 'BreadcrumbList', 'WebApplication'];
  if (routeId === PDF_HUB_ID) return ['Organization', 'BreadcrumbList', 'CollectionPage'];
  // Money pages (F4, decision 8): WebApplication with no rating, BreadcrumbList and the author; the hub is a
  // CollectionPage; a guide is an Article by the author. F6: the Brazilian calculators and hub are the same kind of page.
  if (isAnyCalcPage(routeId)) return ['Organization', 'BreadcrumbList', 'WebApplication', 'Person'];
  if (routeId === MONEY_HUB_ID || routeId === BR_HUB_ID) return ['Organization', 'BreadcrumbList', 'CollectionPage', 'Person'];
  if (Object.hasOwn(GUIDES, routeId)) return ['Organization', 'BreadcrumbList', 'Article', 'Person'];
  // A file guide (F5b, decision 4) is an Article by the author, like a money guide.
  if (isFileGuide(routeId)) return ['Organization', 'BreadcrumbList', 'Article', 'Person'];
  return ['Organization'];
}

/**
 * The title of a tool or preset page starts with its H1, which is the name of the tool (decision 9). A money
 * calculator's title is in Title Case ("Mortgage Calculator with Extra Payments | FileOrca") and its H1 in
 * sentence case, so for those the comparison ignores case (DECISOES § 122).
 */
export function titleProblem(routeId: string, title: string, h1: string): string | null {
  if (isAnyCalcPage(routeId)) return h1 !== '' && title.toLowerCase().startsWith(h1.toLowerCase()) ? null : `título não começa pelo nome da calculadora (${h1})`;
  if (!isImagePage(routeId) && !isPdfPage(routeId) && !isQrPage(routeId)) return null;
  return h1 !== '' && title.startsWith(h1) ? null : `título não começa pelo nome da ferramenta (${h1})`;
}

export interface LdNode {
  '@type'?: string;
  url?: string;
  itemListElement?: { position?: number; item?: string }[];
}

/** The WebApplication of a tool or preset and the BreadcrumbList of a tool, preset or hub end at the page itself (its canonical). */
export function schemaProblems(routeId: string, nodes: readonly LdNode[], canonical: string): string[] {
  const tool = isImagePage(routeId) || isAnyCalcPage(routeId) || isPdfPage(routeId) || isQrPage(routeId);
  if (!tool && routeId !== HUB_ID && !MONEY_PAGE_IDS.includes(routeId) && routeId !== BR_HUB_ID && routeId !== PDF_HUB_ID && !isFileGuide(routeId)) return [];
  const problems: string[] = [];
  const app = nodes.find((node) => node['@type'] === 'WebApplication');
  if (tool && app && app.url !== canonical) problems.push(`WebApplication aponta ${app.url ?? 'para nada'} em vez de ${canonical}`);
  const crumbs = nodes.find((node) => node['@type'] === 'BreadcrumbList')?.itemListElement ?? [];
  if (crumbs.some((crumb, index) => crumb.position !== index + 1)) problems.push('BreadcrumbList com posições fora de ordem');
  const last = crumbs.at(-1)?.item;
  if (crumbs.length > 0 && last !== canonical) problems.push(`BreadcrumbList termina em ${last ?? 'nada'} em vez de ${canonical}`);
  return problems;
}

const YEAR = /\b(?:19|20)\d{2}\b/;

/**
 * A file guide (F5b, decisions 1 and 5): the title starts with the name of the guide in Title Case (compared without case,
 * as for the money pages, DECISOES § 122), neither the title nor the H1 has a year, and neither starts with the H1 of the
 * tool the guide embeds, so the guide does not compete with the tool page for the tool's own search.
 */
export function fileGuideTitleProblems(name: string, title: string, h1: string, toolH1: string): string[] {
  const problems: string[] = [];
  const plain = title.replace(/ \| FileOrca$/, '');
  if (!plain.toLowerCase().startsWith(name.toLowerCase())) problems.push(`título não começa pelo nome do guia (${name})`);
  if (YEAR.test(plain)) problems.push('título com ano');
  if (YEAR.test(h1)) problems.push('H1 com ano');
  const tool = toolH1.toLowerCase();
  if (tool && plain.toLowerCase().startsWith(tool)) problems.push(`título começa pelo H1 da ferramenta (${toolH1})`);
  if (tool && h1.toLowerCase().startsWith(tool)) problems.push(`H1 começa pelo H1 da ferramenta (${toolH1})`);
  return problems;
}

/** The URLs that a sitemap does not list. */
export function missingFromSitemap(xml: string, urls: readonly string[]): string[] {
  const listed = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
  return urls.filter((url) => !listed.has(url));
}
