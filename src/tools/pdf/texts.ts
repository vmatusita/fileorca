// The texts of the PDF tools, by page id (English only until the F6, DECISOES § 58). tests/unit/pdf-texts.test.ts
// checks this map against the registry, the route map and the voice of docs/design/README.
import type { PdfPanelTexts, PdfToolTexts } from '../../i18n/types.ts';
import type { PdfToolId } from './registry.ts';
import panel from './i18n/en.ts';
import mergePdf from '../merge-pdf/i18n/en.ts';
import splitPdf from '../split-pdf/i18n/en.ts';
import pdfToJpg from '../pdf-to-jpg/i18n/en.ts';
import compressPdf from '../compress-pdf/i18n/en.ts';
import rotatePdf from '../rotate-pdf/i18n/en.ts';
import deletePdfPages from '../delete-pdf-pages/i18n/en.ts';
import addPageNumbersToPdf from '../add-page-numbers-to-pdf/i18n/en.ts';
import signPdf from '../sign-pdf/i18n/en.ts';
import protectPdf from '../protect-pdf/i18n/en.ts';
import unlockPdf from '../unlock-pdf/i18n/en.ts';
import reorderPdfPages from '../reorder-pdf-pages/i18n/en.ts';
import watermarkPdf from '../watermark-pdf/i18n/en.ts';

/** Page blocks and panel bits of any PDF tool: the option texts are each tool's own shape. */
export type AnyPdfTexts = PdfToolTexts<object>;

export const PDF_TOOL_TEXTS: Record<PdfToolId, AnyPdfTexts> = {
  'merge-pdf': mergePdf as AnyPdfTexts,
  'split-pdf': splitPdf as AnyPdfTexts,
  'pdf-to-jpg': pdfToJpg as AnyPdfTexts,
  'compress-pdf': compressPdf as AnyPdfTexts,
  'rotate-pdf': rotatePdf as AnyPdfTexts,
  'delete-pdf-pages': deletePdfPages as AnyPdfTexts,
  'add-page-numbers-to-pdf': addPageNumbersToPdf as AnyPdfTexts,
  'sign-pdf': signPdf as AnyPdfTexts,
  'protect-pdf': protectPdf as AnyPdfTexts,
  'unlock-pdf': unlockPdf as AnyPdfTexts,
  'reorder-pdf-pages': reorderPdfPages as AnyPdfTexts,
  'watermark-pdf': watermarkPdf as AnyPdfTexts,
};

export const PDF_PANEL_TEXTS: PdfPanelTexts = panel;
