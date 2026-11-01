// The files of the privacy test of the PDF tools (F5a, decision 8), made in Node at the time of the test so that nothing
// of them is a fixture to keep in step with fixtures/ORIGEM.md: a 12-page PDF whose every page holds the text marker of
// the sentinels, the same file locked with the sentinel password, and a reader of the active content a PDF can carry.
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib';
import { qpdfTransform } from '../../../scripts/lib/qpdf.ts';
import { SENTINELS } from './sentinels.ts';

export const PAGES = 12;

/** The label of the button a tool waits for. The type of the page texts leaves it optional (Compress and PDF to JPG have none). */
export function actionOf(texts: { panel: { action?: string | undefined } }): string {
  const label = texts.panel.action;
  if (!label) throw new Error('this tool has no action button');
  return label;
}

let plain: Promise<Buffer> | null = null;

/** 12 Letter pages: "Page N" (the marker the readers know) and, under it, the text marker of the sentinels. */
export function markerPdf(): Promise<Buffer> {
  plain ??= (async () => {
    const doc = await PDFDocument.create({ updateMetadata: false });
    const font = await doc.embedFont(StandardFonts.Helvetica);
    for (let n = 1; n <= PAGES; n += 1) {
      const page = doc.addPage([612, 792]);
      page.drawText(`Page ${n}`, { x: 72, y: 700, size: 24, font });
      page.drawText(SENTINELS.marker, { x: 72, y: 660, size: 14, font });
    }
    return Buffer.from(await doc.save({ useObjectStreams: false }));
  })();
  return plain;
}

/** The same pages, locked with `password` (AES-256, R6, the strength the Protect PDF page gives). */
export async function lockedMarkerPdf(password: string): Promise<Buffer> {
  const run = await qpdfTransform(await markerPdf(), ['--encrypt', password, password, '256', '--']);
  if (run.code !== 0 || !run.bytes) throw new Error(`qpdf could not lock the fixture: ${run.out.join(' | ')}`);
  return Buffer.from(run.bytes);
}

/** What a PDF carries that can act by itself or when a link is clicked (ISO 32000, 12.6 Actions). */
export interface ActiveContent {
  /** A catalog /OpenAction: the document runs it when it opens. */
  openAction: boolean;
  /** A JavaScript action or script, anywhere: /S /JavaScript, /JS and the /Names /JavaScript tree. */
  javascript: boolean;
  /** A Launch action: a program or file the viewer is asked to open. */
  launch: boolean;
  /** An additional-actions dictionary (/AA) on a page, a field or the catalog. */
  additionalActions: boolean;
  /** A link to a web address (a URI action): a link, not a script. */
  uri: boolean;
}

/**
 * The active content of a PDF, read from qpdf's QDF form (every object in the clear, no object streams) so that it does
 * not depend on how the file was compressed. Not the engine: qpdf is the independent reader here.
 */
export async function activeContent(bytes: Uint8Array): Promise<ActiveContent> {
  const run = await qpdfTransform(bytes, ['--qdf', '--object-streams=disable']);
  if (!run.bytes) throw new Error(`qpdf could not expand the file: ${run.out.join(' | ')}`);
  const text = Buffer.from(run.bytes).toString('latin1');
  return {
    openAction: /\/OpenAction\b/.test(text),
    javascript: /\/(JavaScript|JS)\b/.test(text),
    launch: /\/Launch\b/.test(text),
    additionalActions: /\/AA\b/.test(text),
    uri: /\/URI\b/.test(text),
  };
}

/** The kinds of active content `after` has that `before` did not: what a tool put in a file, which it must never do. */
export function addedActive(before: ActiveContent, after: ActiveContent): string[] {
  return (Object.keys(after) as (keyof ActiveContent)[]).filter((key) => after[key] && !before[key]);
}
