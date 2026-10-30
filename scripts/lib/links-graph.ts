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
