// Victor's photo on the About page, in the author box of the guides and in the Person of the JSON-LD (F19a, decision 5;
// DECISOES § 762). Victor has no photo yet, and no stand-in image ever enters: the photo shows only when the files that
// `pnpm sobre:foto <file>` writes (scripts/sobre/foto.ts) are in public/about/ when the site is built. With no files the
// pages have no photo, no empty <img> and no box kept for one, and the Person has no `image`.
// Node only, read at build time by the views and src/seo/meta.ts: never import it from an island.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** Where the files go, inside the project (the script can write elsewhere with --out, as its test does). */
export const PHOTO_DIR = 'public/about';

/**
 * The two sizes the pages use, a square each, in pixels of the file: twice the size each is shown at, for screens of two
 * pixels per point. The About shows it at 160 × 160 and the author box at 64 × 64 (DECISOES § 762).
 */
export const PHOTO_SIZES = { about: 320, author: 128 } as const;
export const PHOTO_SHOWN = { about: 160, author: 64 } as const;
export type PhotoPlace = keyof typeof PHOTO_SIZES;

/** The file name of one size and format: victor-320.webp, victor-320.jpg, victor-128.webp, victor-128.jpg. */
export function photoName(size: number, format: 'webp' | 'jpg'): string {
  return `victor-${size}.${format}`;
}

/** Every file the script writes and the pages need. */
export function photoFiles(): string[] {
  return Object.values(PHOTO_SIZES).flatMap((size) => [photoName(size, 'webp'), photoName(size, 'jpg')]);
}

/** One place of the photo: the addresses of its two formats on the site and the size it is shown at. */
export interface PhotoSource {
  webp: string;
  jpg: string;
  width: number;
  height: number;
}

export type AboutPhoto = Record<PhotoPlace, PhotoSource>;

/** The photo when every file is in `dir`, or null: with one file missing the pages show none (never half a photo). */
export function findAboutPhoto(dir: string = join(process.cwd(), PHOTO_DIR)): AboutPhoto | null {
  if (!photoFiles().every((name) => existsSync(join(dir, name)))) return null;
  const place = (where: PhotoPlace): PhotoSource => ({
    webp: `/about/${photoName(PHOTO_SIZES[where], 'webp')}`,
    jpg: `/about/${photoName(PHOTO_SIZES[where], 'jpg')}`,
    width: PHOTO_SHOWN[where],
    height: PHOTO_SHOWN[where],
  });
  return { about: place('about'), author: place('author') };
}

/** The photo of this build: the files in public/about/ of the project, looked up when a page is made. */
export function aboutPhoto(): AboutPhoto | null {
  return findAboutPhoto();
}
