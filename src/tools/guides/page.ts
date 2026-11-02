// Build-time side of the file guides (server only: never import this from an island): the texts of a guide, the tool it
// embeds as the page links to it, the crumbs and the related cards. A related card or a link goes only to a page that
// exists (DECISOES § 6); every guide exists in English only.
import { pathFor } from '../../i18n/routes.ts';
import enCommon from '../../i18n/en/common.ts';
import type { FileGuideTexts } from '../../i18n/types.ts';
import { homePath, type Crumb } from '../../seo/meta.ts';
import type { IconName } from '../../icons/svg.ts';
import { IMAGE_PAGES, type ImagePageId } from '../image/registry.ts';
import { imageToolTexts } from '../image/texts.ts';
import { PDF_PAGES, type PdfToolId } from '../pdf/registry.ts';
import { PDF_TOOL_TEXTS } from '../pdf/texts.ts';
import { FILE_GUIDES, isFileGuide, type FileGuideId, type FileGuideRelated, type FileGuideTool } from './registry.ts';

/**
 * The day this run reviewed the ten guides, and when they were first published (prompt F5b). In UTC, like the date
 * pnpm guias:medir stamps, and never before it (DECISOES § 207): the last measurement and the merge fall on this day.
 */
export const GUIDE_REVIEWED = '2026-11-02';
export const GUIDE_PUBLISHED = '2026-11-02';

const texts = import.meta.glob<FileGuideTexts>('/src/i18n/en/guide-*.ts', { import: 'default', eager: true });

export function guideTexts(id: FileGuideId): FileGuideTexts {
  const found = texts[`/src/i18n/en/guide-${id.replace(/^guides-/, '')}.ts`];
  if (!found) throw new Error(`no texts for ${id}`);
  return found;
}

const isPdfTool = (id: string): id is PdfToolId => Object.hasOwn(PDF_PAGES, id);
const isImagePage = (id: string): id is ImagePageId => Object.hasOwn(IMAGE_PAGES, id);

export interface ToolInfo {
  name: string;
  /** The tool page's own H1: the guide's title and H1 must not repeat it (no cannibalisation). */
  h1: string;
  path: string;
  icon: IconName;
  category: 'image' | 'pdf';
  pdf: boolean;
}

export function toolInfo(tool: FileGuideTool): ToolInfo {
  if (isPdfTool(tool)) {
    return { name: enCommon.pdf[tool].name, h1: PDF_TOOL_TEXTS.en[tool].h1, path: PDF_PAGES[tool].path, icon: PDF_PAGES[tool].icon, category: 'pdf', pdf: true };
  }
  const def = IMAGE_PAGES[tool];
  return { name: enCommon.tools[tool].name, h1: imageToolTexts(tool, 'en').h1, path: pathFor(tool, 'en'), icon: def.icon, category: def.pdf ? 'pdf' : 'image', pdf: false };
}

/** Home › Image tools (or PDF tools) › the guide's H1. */
export function crumbsFor(id: FileGuideId): Crumb[] {
  const def = FILE_GUIDES[id];
  return [
    { name: enCommon.breadcrumb.home, path: homePath('en') },
    def.hub === 'pdf-tools' ? { name: enCommon.pdfTools, path: pathFor('pdf-tools', 'en') } : { name: enCommon.imageTools, path: pathFor('image-tools', 'en') },
    { name: guideTexts(id).h1, path: def.path },
  ];
}

export interface GuideCard {
  href: string;
  name: string;
  description: string;
  icon: IconName;
  category: 'image' | 'pdf';
}

/** The card of a guide: its tool's icon, in the colour of its hub. */
export function guideCard(id: FileGuideId): GuideCard {
  const def = FILE_GUIDES[id];
  return { href: def.path, name: enCommon.fileGuides[id].name, description: enCommon.fileGuides[id].description, icon: toolInfo(def.tool).icon, category: def.hub === 'pdf-tools' ? 'pdf' : 'image' };
}

function cardOf(target: FileGuideRelated): GuideCard {
  if (isFileGuide(target)) return guideCard(target);
  if (isPdfTool(target)) return { href: PDF_PAGES[target].path, name: enCommon.pdf[target].name, description: enCommon.pdf[target].description, icon: PDF_PAGES[target].icon, category: 'pdf' };
  if (!isImagePage(target)) throw new Error(`unknown page ${String(target)}`);
  const def = IMAGE_PAGES[target];
  return { href: pathFor(target, 'en'), name: enCommon.tools[target].name, description: enCommon.tools[target].description, icon: def.icon, category: def.pdf ? 'pdf' : 'image' };
}

export function relatedFor(id: FileGuideId): GuideCard[] {
  return FILE_GUIDES[id].related.slice(0, 6).map(cardOf);
}
