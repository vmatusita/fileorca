// The texts of the PDF tools, by language and page id (the three languages since the F6, decision 4).
// tests/unit/pdf-texts.test.ts checks this map against the registry, the route map and the voice of docs/design/README.
import type { Lang } from '../../i18n/routes.ts';
import type { PdfPanelTexts, PdfToolTexts } from '../../i18n/types.ts';
import type { PdfToolId } from './registry.ts';
import enPanel from './i18n/en.ts';
import ptPanel from './i18n/pt.ts';
import esPanel from './i18n/es.ts';
import enMerge from '../merge-pdf/i18n/en.ts';
import ptMerge from '../merge-pdf/i18n/pt.ts';
import esMerge from '../merge-pdf/i18n/es.ts';
import enSplit from '../split-pdf/i18n/en.ts';
import ptSplit from '../split-pdf/i18n/pt.ts';
import esSplit from '../split-pdf/i18n/es.ts';
import enPdfToJpg from '../pdf-to-jpg/i18n/en.ts';
import ptPdfToJpg from '../pdf-to-jpg/i18n/pt.ts';
import esPdfToJpg from '../pdf-to-jpg/i18n/es.ts';
import enCompress from '../compress-pdf/i18n/en.ts';
import ptCompress from '../compress-pdf/i18n/pt.ts';
import esCompress from '../compress-pdf/i18n/es.ts';
import enRotate from '../rotate-pdf/i18n/en.ts';
import ptRotate from '../rotate-pdf/i18n/pt.ts';
import esRotate from '../rotate-pdf/i18n/es.ts';
import enDelete from '../delete-pdf-pages/i18n/en.ts';
import ptDelete from '../delete-pdf-pages/i18n/pt.ts';
import esDelete from '../delete-pdf-pages/i18n/es.ts';
import enNumbers from '../add-page-numbers-to-pdf/i18n/en.ts';
import ptNumbers from '../add-page-numbers-to-pdf/i18n/pt.ts';
import esNumbers from '../add-page-numbers-to-pdf/i18n/es.ts';
import enSign from '../sign-pdf/i18n/en.ts';
import ptSign from '../sign-pdf/i18n/pt.ts';
import esSign from '../sign-pdf/i18n/es.ts';
import enProtect from '../protect-pdf/i18n/en.ts';
import ptProtect from '../protect-pdf/i18n/pt.ts';
import esProtect from '../protect-pdf/i18n/es.ts';
import enUnlock from '../unlock-pdf/i18n/en.ts';
import ptUnlock from '../unlock-pdf/i18n/pt.ts';
import esUnlock from '../unlock-pdf/i18n/es.ts';
import enReorder from '../reorder-pdf-pages/i18n/en.ts';
import ptReorder from '../reorder-pdf-pages/i18n/pt.ts';
import esReorder from '../reorder-pdf-pages/i18n/es.ts';
import enWatermark from '../watermark-pdf/i18n/en.ts';
import ptWatermark from '../watermark-pdf/i18n/pt.ts';
import esWatermark from '../watermark-pdf/i18n/es.ts';

/** Page blocks and panel bits of any PDF tool: the option texts are each tool's own shape. */
export type AnyPdfTexts = PdfToolTexts<object>;

const all = (texts: Record<PdfToolId, unknown>): Record<PdfToolId, AnyPdfTexts> => texts as Record<PdfToolId, AnyPdfTexts>;

export const PDF_TOOL_TEXTS: Record<Lang, Record<PdfToolId, AnyPdfTexts>> = {
  en: all({
    'merge-pdf': enMerge,
    'split-pdf': enSplit,
    'pdf-to-jpg': enPdfToJpg,
    'compress-pdf': enCompress,
    'rotate-pdf': enRotate,
    'delete-pdf-pages': enDelete,
    'add-page-numbers-to-pdf': enNumbers,
    'sign-pdf': enSign,
    'protect-pdf': enProtect,
    'unlock-pdf': enUnlock,
    'reorder-pdf-pages': enReorder,
    'watermark-pdf': enWatermark,
  }),
  pt: all({
    'merge-pdf': ptMerge,
    'split-pdf': ptSplit,
    'pdf-to-jpg': ptPdfToJpg,
    'compress-pdf': ptCompress,
    'rotate-pdf': ptRotate,
    'delete-pdf-pages': ptDelete,
    'add-page-numbers-to-pdf': ptNumbers,
    'sign-pdf': ptSign,
    'protect-pdf': ptProtect,
    'unlock-pdf': ptUnlock,
    'reorder-pdf-pages': ptReorder,
    'watermark-pdf': ptWatermark,
  }),
  es: all({
    'merge-pdf': esMerge,
    'split-pdf': esSplit,
    'pdf-to-jpg': esPdfToJpg,
    'compress-pdf': esCompress,
    'rotate-pdf': esRotate,
    'delete-pdf-pages': esDelete,
    'add-page-numbers-to-pdf': esNumbers,
    'sign-pdf': esSign,
    'protect-pdf': esProtect,
    'unlock-pdf': esUnlock,
    'reorder-pdf-pages': esReorder,
    'watermark-pdf': esWatermark,
  }),
};

export const PDF_PANEL_TEXTS: Record<Lang, PdfPanelTexts> = { en: enPanel, pt: ptPanel, es: esPanel };
