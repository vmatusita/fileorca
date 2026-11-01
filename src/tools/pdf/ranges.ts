// "1-3, 5, 8-10" typed by the person, into 0-based page indices, on the page (the engine only ever gets numbers, and
// the numbers never go to a URL, a name or an event). Plain string work, unit-tested.

/** The ranges of `text` for a document of `total` pages, in the order typed; null when anything is off. */
export function parseRanges(text: string, total: number): number[][] | null {
  const parts = text.split(/[,;]/).map((part) => part.trim()).filter((part) => part.length > 0);
  if (parts.length === 0) return null;
  const out: number[][] = [];
  for (const part of parts) {
    const match = /^(\d{1,5})\s*(?:[-–]\s*(\d{1,5}))?$/.exec(part);
    if (!match) return null;
    const from = Number(match[1]);
    const to = match[2] === undefined ? from : Number(match[2]);
    if (from < 1 || to < 1 || from > total || to > total || to < from) return null;
    out.push(Array.from({ length: to - from + 1 }, (_, i) => from - 1 + i));
  }
  return out;
}

/** Every page of the ranges once, in page order (a selection). */
export function pagesOf(ranges: readonly (readonly number[])[]): number[] {
  return [...new Set(ranges.flat())].sort((a, b) => a - b);
}

/** A selection written back as ranges, "1-3, 5" (the field shows what the grid picked). */
export function formatRanges(pages: readonly number[]): string {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const out: string[] = [];
  let start = sorted[0];
  let previous = start;
  for (const page of [...sorted.slice(1), undefined]) {
    if (page !== undefined && previous !== undefined && page === previous + 1) {
      previous = page;
      continue;
    }
    if (start !== undefined && previous !== undefined) out.push(start === previous ? `${start + 1}` : `${start + 1}-${previous + 1}`);
    start = page;
    previous = page;
  }
  return out.join(', ');
}
