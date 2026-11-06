// Orphan detection for the links gate (tested in tests/unit/links-graph.test.ts).
// A page is linked when an <a href> on a page of ANOTHER route points to it. The language menu
// and the hreflang links of a page's own translations do not count.

export interface PageLinks {
  path: string;
  routeId: string;
  /** Same-site paths of the <a href> elements of the page. */
  anchors: string[];
}

export function orphanPaths(pages: PageLinks[], indexable: Set<string>): string[] {
  const routeOf = new Map(pages.map((page) => [page.path, page.routeId]));
  const linked = new Set<string>();
  for (const page of pages) {
    for (const target of page.anchors) {
      const targetRoute = routeOf.get(target);
      if (targetRoute !== undefined && targetRoute !== page.routeId) linked.add(target);
    }
  }
  return pages.filter((page) => indexable.has(page.path) && !linked.has(page.path)).map((page) => page.path);
}

/**
 * F13b (DECISOES § 585): the links to a part of a page ("#id" on the same page, "/guides/#image" on another) whose page
 * has no element with that id. `ids` holds the ids of every page of the dist by path; a target page the map does not know
 * is left to the check of the paths. Returns the href of each link that misses.
 */
export function missingFragments(from: string, hrefs: readonly string[], ids: ReadonlyMap<string, ReadonlySet<string>>): string[] {
  return hrefs.filter((href) => {
    const hash = href.indexOf('#');
    if (hash < 0 || hash === href.length - 1) return false;
    const target = ids.get(hash === 0 ? from : href.slice(0, hash));
    return target !== undefined && !target.has(decodeURIComponent(href.slice(hash + 1)));
  });
}
