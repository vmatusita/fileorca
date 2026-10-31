// Names of the files a batch gives back: the input name with the extension of the output, unique
// inside the batch (" (2)", " (3)"), so a ZIP never holds two entries with one name and two
// downloads never overwrite each other. Plain string work, no browser API (unit-tested).
import type { OutputFormat } from '../../engine/image/types.ts';

export const EXTENSION: Record<OutputFormat | 'pdf', string> = { jpeg: 'jpg', png: 'png', webp: 'webp', avif: 'avif', pdf: 'pdf' };

/** Name of the ZIP of a batch (English on every page, DECISOES § 58). */
export const ZIP_NAME = 'fileorca-images.zip';
/** Name of the PDF of a batch of several images; one image gives the PDF the name of its file. */
export const PDF_BATCH_NAME = 'fileorca-images.pdf';

// Characters that no file system takes, and the ones that would make a ZIP entry a folder.
const UNSAFE = /[\\/:*?"<>|\u0000-\u001f]/g;

/** The name without its last extension ("photo.final.png" gives "photo.final"; ".hidden" stays whole). */
export function baseName(name: string): string {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  return base.replace(UNSAFE, '_').trim();
}

export interface NameEntry {
  /** The name the file came with (may be empty). */
  name: string;
  /** The extension of what it became, without the dot. */
  extension: string;
}

/**
 * One output name per entry, in order. A name already taken (compared without regard to case, like
 * Windows and macOS) gets " (2)", " (3)" before the extension.
 */
export function uniqueNames(entries: readonly NameEntry[], fallback: string): string[] {
  const taken = new Set<string>();
  return entries.map(({ name, extension }) => {
    const base = baseName(name) || fallback;
    let candidate = `${base}.${extension}`;
    for (let n = 2; taken.has(candidate.toLowerCase()); n += 1) candidate = `${base} (${n}).${extension}`;
    taken.add(candidate.toLowerCase());
    return candidate;
  });
}
