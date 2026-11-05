// The "On this page" index of the legal pages and of the Licenses (F13b, decision 8; UX-17 A, pages.html; DECISOES § I-3):
// each H2 gets an id made from its own text at build time, and the index in the right column links to it. The text of the
// heading never changes (the Privacy keeps every word and its date): only the id is new. Node only, like header-menu.ts
// and tool-count.ts (the views render it in the build, and the tests read it in Node): no island ever imports it.

/** The id of a heading, from its text: no accents, lowercase, every run of other characters one hyphen ("Who is responsible" → "who-is-responsible"). */
export function headingSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * One id per heading, in order, from the text, and unique in the page: a repeated slug takes "-2", "-3"… and a slug that
 * would be empty (a heading of symbols only) becomes "section-<n>". `taken` holds the ids the page already has.
 */
export function headingIds(headings: readonly string[], taken: Iterable<string> = []): string[] {
  const used = new Set(taken);
  return headings.map((heading, index) => {
    const slug = headingSlug(heading) || `section-${index + 1}`;
    let id = slug;
    for (let n = 2; used.has(id); n += 1) id = `${slug}-${n}`;
    used.add(id);
    return id;
  });
}

/** An entry of the index: the id of the H2 and its text. */
export interface PageIndexEntry {
  id: string;
  text: string;
}

/** The entries of the index of a page, from its H2 texts (the ids are the ones headingIds gives the headings). */
export function pageIndex(headings: readonly string[], taken: Iterable<string> = []): PageIndexEntry[] {
  const ids = headingIds(headings, taken);
  return headings.map((text, index) => ({ id: ids[index] ?? '', text }));
}
