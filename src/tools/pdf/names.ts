// Names of what a PDF tool gives back (F5a, decision 6): the name the file came with and a suffix, unique inside the
// batch and the ZIP, the way src/tools/image/names.ts does it. Nothing the person typed goes in a name (DECISOES § 150):
// a split by ranges is "-part-1", "-part-2" in order, never the typed range; a page image carries the page number of
// the document.
import { baseName, uniqueNames } from '../image/names.ts';

/** Name of the ZIP of a batch of PDFs, and of the ZIP of page images (English on every page, like the images). */
export const PDF_ZIP_NAME = 'fileorca-pdfs.zip';
export const IMAGES_ZIP_NAME = 'fileorca-pdf-images.zip';

export interface PdfNameEntry {
  /** The name the source file came with. */
  source: string;
  /** What this output is: the tool's suffix ("merged"), "page-3", "part-2". */
  tag: string;
  extension: 'pdf' | 'jpg' | 'png';
}

/** One name per output, in order, unique without regard to case. */
export function pdfOutputNames(entries: readonly PdfNameEntry[], fallback: string): string[] {
  return uniqueNames(
    entries.map((entry) => ({ name: `${baseName(entry.source) || fallback}-${entry.tag}.x`, extension: entry.extension })),
    fallback,
  );
}
