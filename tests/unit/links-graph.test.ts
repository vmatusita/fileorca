import { describe, expect, it } from 'vitest';
import { missingFragments, orphanPaths, type PageLinks } from '../../scripts/lib/links-graph.ts';

// F13b (DECISOES § I-3): the gate also checks the links to a part of a page (the index "On this page" of the legal pages,
// the groups of the guides hub in the footer).
describe('links to a part of a page', () => {
  const ids = new Map([
    ['/privacy/', new Set(['main', 'toc-title', 'who-is-responsible'])],
    ['/guides/', new Set(['main', 'image', 'pdf'])],
  ]);

  it('accept an id the page has, on the same page or on another', () => {
    expect(missingFragments('/privacy/', ['#who-is-responsible', '#main', '/guides/#image', '/guides/#pdf', '/guides/', '#'], ids)).toEqual([]);
  });

  it('flag an id the page does not have', () => {
    expect(missingFragments('/privacy/', ['#who-is-in-charge', '/guides/#money'], ids)).toEqual(['#who-is-in-charge', '/guides/#money']);
  });

  it('leave a page the map does not know to the check of the paths', () => {
    expect(missingFragments('/privacy/', ['/missing/#x'], ids)).toEqual([]);
  });
});

const page = (path: string, routeId: string, anchors: string[]): PageLinks => ({ path, routeId, anchors });

describe('portão de páginas órfãs', () => {
  const home = page('/', 'home', ['/support/', '/pt/', '/es/']);
  const support = page('/support/', 'support', ['/', '/pt/apoie/', '/es/apoyo/']);
  const ptSupport = page('/pt/apoie/', 'support', ['/pt/', '/support/', '/es/apoyo/']);
  const esSupport = page('/es/apoyo/', 'support', ['/es/', '/support/', '/pt/apoie/']);
  const ptHome = page('/pt/', 'home', ['/', '/es/', '/pt/apoie/']);
  const esHome = page('/es/', 'home', ['/', '/pt/', '/es/apoyo/']);
  const all = new Set(['/', '/pt/', '/es/', '/support/', '/pt/apoie/', '/es/apoyo/']);

  it('accepts pages linked from another route', () => {
    expect(orphanPaths([home, ptHome, esHome, support, ptSupport, esSupport], all)).toEqual([]);
  });

  it('flags a page linked only by its own translations (language menu and hreflang)', () => {
    const lonelyHome = page('/', 'home', ['/pt/', '/es/']);
    const lonelyPt = page('/pt/', 'home', ['/', '/es/']);
    const lonelyEs = page('/es/', 'home', ['/', '/pt/']);
    expect(orphanPaths([lonelyHome, lonelyPt, lonelyEs, support, ptSupport, esSupport], all)).toEqual(['/support/', '/pt/apoie/', '/es/apoyo/']);
  });

  it('ignores non-indexable pages and links to unknown paths', () => {
    const notFound = page('/404.html', 'not-found', ['/']);
    expect(orphanPaths([home, ptHome, esHome, support, ptSupport, esSupport, notFound], all)).toEqual([]);
    expect(orphanPaths([page('/', 'home', ['/missing/'])], new Set(['/']))).toEqual(['/']);
  });
});
