// F15 (DECISOES § 651, § 652 and § 667): the list of an image batch as plain data. A row moves one place (the arrows) or
// to any place (a drag), a ready row goes out with its place kept for Undo, Undo puts it back at that place, and the
// bundle (the PDF of Image to PDF, the ZIP of the other tools) has a key that says what it was made from: the sheet and
// the order of the ids of the ready rows (PDF), the order of the ids (ZIP). The island compares the key of the bundle it
// has with the key of the list it shows, and packs the outputs again when they differ, without encoding any photo again.
// Plain array work, no browser API (unit-tested in tests/unit/image-batch.test.ts), imported statically by the island.

/** The list with the entry at `from` moved to `to`; null when the move does nothing (an end, or the same place). */
export function moved<T>(list: readonly T[], from: number, to: number): T[] | null {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return null;
  const next = list.slice();
  const [entry] = next.splice(from, 1) as [T];
  next.splice(to, 0, entry);
  return next;
}

/** The list with `entry` put back at `position`, or at the end when the list got shorter since it went out. */
export function putBack<T>(list: readonly T[], entry: T, position: number): T[] {
  const next = list.slice();
  next.splice(Math.max(0, Math.min(position, next.length)), 0, entry);
  return next;
}

/**
 * The id that takes over from the one at `at` when it leaves: the next one, or the one before when it was the last; null
 * when it was the only one. The file picked in Crop passes this way (DECISOES § 652).
 */
export function successor(ids: readonly number[], at: number): number | null {
  return ids[at + 1] ?? ids[at - 1] ?? null;
}

/**
 * The key of the bundle the ready rows make, in their order: `<sheet>|<id>,<id>,…` for the PDF (one page per ready row,
 * so one row is a PDF too), `<id>,<id>,…` for the ZIP (two rows or more: one file downloads as it is). Null when no
 * bundle is due.
 */
export function bundleKey(kind: 'pdf' | 'zip', ids: readonly number[], sheet: string): string | null {
  if (kind === 'pdf') return ids.length > 0 ? `${sheet}|${ids.join(',')}` : null;
  return ids.length >= 2 ? ids.join(',') : null;
}
