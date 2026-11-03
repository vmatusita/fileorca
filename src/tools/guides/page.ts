// Build-time side of the file guides (server only: never import this from an island): the texts of a guide, the tool it
// embeds as the page links to it, the crumbs and the related cards, in the language of the page. A related card or a
// link goes only to a page that exists in that language (DECISOES § 6); every guide exists in English, Portuguese and
// Spanish since the languages adjustment, and so does every tool, preset and guide they link to.
import { pathFor, type Lang } from '../../i18n/routes.ts';
import { TEXTS } from '../../i18n/texts.ts';
import enShared from '../../i18n/en/file-guides.ts';
import ptShared from '../../i18n/pt/file-guides.ts';
import esShared from '../../i18n/es/file-guides.ts';
import type { FileGuidesSharedTexts, FileGuideTexts } from '../../i18n/types.ts';
import { homePath, type Crumb } from '../../seo/meta.ts';
import type { IconName } from '../../icons/svg.ts';
import { IMAGE_PAGES, type ImagePageId } from '../image/registry.ts';
import { imageToolTexts } from '../image/texts.ts';
import { PDF_PAGES, type PdfToolId } from '../pdf/registry.ts';
import { PDF_TOOL_TEXTS } from '../pdf/texts.ts';
import { FILE_GUIDES, isFileGuide, type FileGuideId, type FileGuideRelated, type FileGuideTool } from './registry.ts';

/**
 * The day the ten English guides were reviewed, and when they were first published (prompt F5b). In UTC, like the date
 * pnpm guias:medir stamps, and never before it (DECISOES § 207): the last measurement and the merge fall on this day.
 */
export const GUIDE_REVIEWED = '2026-11-02';
export const GUIDE_PUBLISHED = '2026-11-02';

/**
 * Per language: the day the guides were reviewed and first published. The Portuguese and Spanish guides were written in
 * the languages adjustment, on the day in Brasília of the run (DECISOES § 223), never before the measurement (§ 207).
 */
export const GUIDE_REVIEWED_ON: Record<Lang, string> = { en: GUIDE_REVIEWED, pt: '2026-11-03', es: '2026-11-03' };
export const GUIDE_PUBLISHED_ON: Record<Lang, string> = { en: GUIDE_PUBLISHED, pt: '2026-11-03', es: '2026-11-03' };

/** What every guide of a language shares: the "Reviewed" line, the table words, the fixture names, the counts in words. */
export const GUIDE_SHARED: Record<Lang, FileGuidesSharedTexts> = { en: enShared, pt: ptShared, es: esShared };

const texts = import.meta.glob<FileGuideTexts>(['/src/i18n/en/guide-*.ts', '/src/i18n/pt/guide-*.ts', '/src/i18n/es/guide-*.ts'], { import: 'default', eager: true });

export function guideTexts(id: FileGuideId, lang: Lang = 'en'): FileGuideTexts {
  const found = texts[`/src/i18n/${lang}/guide-${id.replace(/^guides-/, '')}.ts`];
  if (!found) throw new Error(`no ${lang} texts for ${id}`);
  return found;
}

/** The path of a guide in a language. */
export function guidePath(id: FileGuideId, lang: Lang = 'en'): string {
  return FILE_GUIDES[id].paths[lang];
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

export function toolInfo(tool: FileGuideTool, lang: Lang = 'en'): ToolInfo {
  const common = TEXTS[lang].common;
  if (isPdfTool(tool)) {
    return { name: common.pdf[tool].name, h1: PDF_TOOL_TEXTS[lang][tool].h1, path: pathFor(tool, lang), icon: PDF_PAGES[tool].icon, category: 'pdf', pdf: true };
  }
  const def = IMAGE_PAGES[tool];
  return { name: common.tools[tool].name, h1: imageToolTexts(tool, lang).h1, path: pathFor(tool, lang), icon: def.icon, category: def.pdf ? 'pdf' : 'image', pdf: false };
}

/** Home › Image tools (or PDF tools) › the guide's H1, in the language. */
export function crumbsFor(id: FileGuideId, lang: Lang = 'en'): Crumb[] {
  const def = FILE_GUIDES[id];
  const common = TEXTS[lang].common;
  return [
    { name: common.breadcrumb.home, path: homePath(lang) },
    def.hub === 'pdf-tools' ? { name: common.pdfTools, path: pathFor('pdf-tools', lang) } : { name: common.imageTools, path: pathFor('image-tools', lang) },
    { name: guideTexts(id, lang).h1, path: guidePath(id, lang) },
  ];
}

export interface GuideCard {
  href: string;
  name: string;
  description: string;
  icon: IconName;
  category: 'image' | 'pdf';
}

/** The card of a guide's blurb in the language (common.fileGuides). */
function blurbOf(id: FileGuideId, lang: Lang): { name: string; description: string } {
  const blurb = TEXTS[lang].common.fileGuides?.[id];
  if (!blurb) throw new Error(`no ${lang} card for ${id}`);
  return blurb;
}

/** The card of a guide: its tool's icon, in the colour of its hub. */
export function guideCard(id: FileGuideId, lang: Lang = 'en'): GuideCard {
  const def = FILE_GUIDES[id];
  const blurb = blurbOf(id, lang);
  return { href: guidePath(id, lang), name: blurb.name, description: blurb.description, icon: toolInfo(def.tool, lang).icon, category: def.hub === 'pdf-tools' ? 'pdf' : 'image' };
}

function cardOf(target: FileGuideRelated, lang: Lang): GuideCard {
  const common = TEXTS[lang].common;
  if (isFileGuide(target)) return guideCard(target, lang);
  if (isPdfTool(target)) return { href: pathFor(target, lang), name: common.pdf[target].name, description: common.pdf[target].description, icon: PDF_PAGES[target].icon, category: 'pdf' };
  if (!isImagePage(target)) throw new Error(`unknown page ${String(target)}`);
  const def = IMAGE_PAGES[target];
  return { href: pathFor(target, lang), name: common.tools[target].name, description: common.tools[target].description, icon: def.icon, category: def.pdf ? 'pdf' : 'image' };
}

export function relatedFor(id: FileGuideId, lang: Lang = 'en'): GuideCard[] {
  return FILE_GUIDES[id].related.slice(0, 6).map((target) => cardOf(target, lang));
}

/** The guides of a hub or under a tool, as links in the language: name, description and path. */
export function guideLinks(ids: readonly FileGuideId[], lang: Lang): { href: string; name: string; description: string }[] {
  return ids.map((id) => ({ href: guidePath(id, lang), ...blurbOf(id, lang) }));
}
