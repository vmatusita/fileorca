// The measures of the ad map (F12, decisions 3 and 11; DECISOES § 419 to § 422), read in the page of the test build:
// every ad box that shows at the width of the window, the blocks of <main>, the targets that must stay 150 px from an ad,
// and the cookie notice. The rules of the map are asserted by tests/e2e/fo-ad-map.spec.ts, on top of these numbers.
import type { Page } from '@playwright/test';
import { ROUTES, LANGS, QR_ID, type AdArea, type Lang, type RouteDef } from '../../../src/i18n/routes.ts';
import { PDF_HUB_ID, PDF_PAGES } from '../../../src/tools/pdf/registry.ts';

/** The molds of the map (ad-map.html "O mapa, molde a molde"), with the hubs and the tools split as the table of § 351. */
export type Mold =
  | 'home'
  | 'hub-arquivos'
  | 'hub-dinheiro'
  | 'hub-casa-saude'
  | 'guides-hub'
  | 'tool-image'
  | 'tool-pdf'
  | 'tool-qr'
  | 'calc-dinheiro'
  | 'calc-casa-saude'
  | 'guide-arquivos'
  | 'guide-dinheiro';

export interface AdPage {
  path: string;
  id: string;
  lang: Lang;
  area: AdArea;
  mold: Mold;
}

export function moldOf(route: RouteDef): Mold {
  const view = route.view;
  if (view.endsWith('HomeView.astro')) return 'home';
  if (view.endsWith('GuidesHubView.astro')) return 'guides-hub';
  if (view.endsWith('ImageToolsView.astro') || view.endsWith('PdfToolsView.astro') || route.id === PDF_HUB_ID) return 'hub-arquivos';
  if (view.endsWith('MoneyCalculatorsView.astro')) return 'hub-dinheiro';
  if (view.endsWith('LifeCalculatorsView.astro')) return 'hub-casa-saude';
  if (view.endsWith('FileGuideView.astro')) return 'guide-arquivos';
  if (view.endsWith('GuideView.astro')) return 'guide-dinheiro';
  if (route.id === QR_ID) return 'tool-qr';
  if (Object.hasOwn(PDF_PAGES, route.id)) return 'tool-pdf';
  if (route.adArea === 'arquivos') return 'tool-image';
  return route.adArea === 'dinheiro' ? 'calc-dinheiro' : 'calc-casa-saude';
}

/** Every page with ads, in the three languages, from the route map (184 since the F12: the 178 of before, the homes and the guides hubs). */
export const AD_PAGES: AdPage[] = ROUTES.filter((route) => route.adArea).flatMap((route) =>
  LANGS.flatMap((lang) => {
    const path = route.paths[lang];
    return path && route.adArea ? [{ path, id: route.id, lang, area: route.adArea, mold: moldOf(route) }] : [];
  }),
);

/** The 27 pages with no ad: Privacy, Terms, About, Contact, Licenses, Support, 404, offline and "Open with", in the three languages. */
export const FREE_PAGES: string[] = ROUTES.filter((route) => !route.adArea).flatMap((route) => LANGS.flatMap((lang) => route.paths[lang] ?? []));

/** What must stay 150 px from every ad: the targets of ads.spec.ts, the coffee lines, the header and the guide card. */
export const MAP_TARGETS = [
  '.fo-btn--download', 'input:not([type="file"])', 'select', 'textarea', '.fo-seg', 'fieldset',
  '.fo-tool-island', '.fo-slot', '.fo-drop', '.fo-level', '.fo-result', '[data-oli]',
  '.fo-queue', '.fo-filelist', '.fo-file', '.fo-queue__more', '.fo-fields', '.fo-field', '.fo-input', '.fo-field__help',
  '.fo-ba', '.fo-crop', '.fo-crop__stage', '.fo-crop__box', '.fo-crop__handle', '.fo-next',
  // F13a (UX-04 A, decision 10; DECISOES § F13A-I-10): the band under the rectangle, "Adjust", the chips (the chip of PNG to
  // JPG in the error of a PNG on HEIC to JPG too) and the row of Start over and "Before and after".
  '.fo-band', '.fo-adjust', '.fo-chip', '.fo-result__more',
  '.fo-rhero', '.fo-export .fo-btn', '.fo-compare', '.fo-calc-schedule', '.fo-amort-wrap', '.fo-debt',
  '.fo-qr', '.fo-qr__form', '.fo-qr__preview', '.fo-qr__actions',
  '.fo-pdf-island', '.fo-ready', '.fo-options-stack', '.fo-pages',
  '.fo-result__support', '.fo-footer__coffee', '.fo-guidecard--here',
  '.fo-header > a', '.fo-header > button',
].join(', ');
/** The groups of targets of the report's table of the shortest distances. */
export const TARGET_GROUPS: Record<string, string> = {
  baixar: '.fo-btn--download',
  campos: 'input:not([type="file"]), select, textarea, .fo-seg, fieldset, .fo-field, .fo-input',
  menus: '.fo-header > a, .fo-header > button',
  painel: '#fo-tool-root, .fo-drop, .fo-tool-island, .fo-pdf-island, .fo-calc-island',
  oli: '[data-oli]',
  cafe: '.fo-result__support, .fo-footer__coffee',
  cronograma: '.fo-calc-schedule, .fo-amort-wrap',
  grade: '.fo-grid, .fo-guidecards',
};

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BoxInfo extends Rect {
  unit: string;
  kind: 'content' | 'multiplex' | 'rail';
  inMain: boolean;
  /** The first forbidden container around the box, if any. */
  inside: string | null;
  /** The block before and after it in its parent (scripts and other boxes aside), and what touches it. */
  before: string;
  after: string;
  headingBefore: boolean;
  tableBefore: boolean;
  tableAfter: boolean;
  measuredBeside: boolean;
  position: string;
}

export interface MapMeasure {
  width: number;
  height: number;
  /** Every box in the DOM, and the ones that show at this width (width and height above 0), in document order. */
  inDom: number;
  boxes: BoxInfo[];
  main: Rect;
  /** The room of the related section at the end of <main> (its height, its margin and the gap of the grid). */
  related: number;
  tool: Rect | null;
  header: Rect | null;
  /** The cookie notice where it shows (fixed, so its rect at scroll 0 is the one of the page). */
  notice: Rect | null;
  targets: (Rect & { kind: string })[];
  grids: Rect[];
  groups: Record<string, Rect[]>;
  /** The first content box of the page (in the DOM, whatever the width): what is before it, and the paragraphs of text
   * between the tool and it. */
  first: { before: string; after: string; textBetweenToolAndIt: number; afterTool: boolean } | null;
  /** The descriptor of the first section with a grid of cards in <main>, and of the money hub's credit grid. */
  firstGridBlock: string | null;
}

/** Reads the map at the current width; the page is scrolled to the top first. */
export async function measureMap(page: Page, targets: string = MAP_TARGETS, groups: Record<string, string> = TARGET_GROUPS): Promise<MapMeasure> {
  return page.evaluate(
    ({ targets, groups }) => {
      scrollTo(0, 0);
      const rect = (element: Element) => {
        const box = element.getBoundingClientRect();
        return { x: box.left + scrollX, y: box.top + scrollY, w: box.width, h: box.height };
      };
      const shown = (element: Element) => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      };
      const describe = (element: Element | null): string => {
        if (!element) return '';
        const id = element.id ? `#${element.id}` : '';
        const classes = [...element.classList].map((name) => `.${name}`).join('');
        const labelled = element.getAttribute('aria-labelledby');
        const content = element.getAttribute('data-content');
        return `${element.tagName.toLowerCase()}${id}${classes}${labelled ? `[aria-labelledby=${labelled}]` : ''}${content ? `[data-content=${content}]` : ''}`;
      };
      const skip = (element: Element | null) => !element || ['SCRIPT', 'TEMPLATE', 'STYLE'].includes(element.tagName) || element.classList.contains('fo-ad');
      const sibling = (element: Element, side: 'previousElementSibling' | 'nextElementSibling') => {
        let at = element[side];
        while (at && skip(at)) at = at[side];
        return at;
      };
      const isTable = (element: Element) => element.tagName === 'TABLE' || element.classList.contains('fo-table-wrap');
      const chain = (element: Element | null, side: 'firstElementChild' | 'lastElementChild') => {
        const found: Element[] = [];
        for (let at = element; at; at = at[side]) {
          found.push(at);
          if (found.length > 12) break;
        }
        return found;
      };
      const measured = (element: Element | null) => Boolean(element && (element.getAttribute('data-content') === 'measured' || element.getAttribute('aria-labelledby') === 'measured'));
      const FORBIDDEN = '#fo-tool-root, #fo-calc-schedule, .fo-grid, .fo-guidecards, .fo-guidehere, table, .fo-table-wrap, ul, ol, li, details, summary, form, fieldset, nav, h1, h2, h3, h4, h5, h6, p, .fo-hubband, .fo-hero, .fo-top, .fo-example, [data-content="measured"], [aria-labelledby="measured"]';
      const main = document.querySelector('main');
      const all = [...document.querySelectorAll('.fo-ad')];
      const boxes = all.filter(shown).map((box) => {
        const before = sibling(box, 'previousElementSibling');
        const after = sibling(box, 'nextElementSibling');
        const kind = box.classList.contains('fo-ad--rail') ? 'rail' : box.classList.contains('fo-ad--multiplex') ? 'multiplex' : 'content';
        return {
          ...rect(box),
          unit: box.getAttribute('data-ad-unit') ?? '',
          kind: kind as 'content' | 'multiplex' | 'rail',
          inMain: Boolean(main?.contains(box)),
          inside: describe(box.parentElement?.closest(FORBIDDEN) ?? null) || null,
          before: describe(before),
          after: describe(after),
          headingBefore: Boolean(before && /^H[1-6]$/.test(before.tagName)),
          tableBefore: chain(before, 'lastElementChild').some(isTable),
          tableAfter: chain(after, 'firstElementChild').some(isTable),
          measuredBeside: measured(before) || measured(after),
          position: getComputedStyle(box).position + '/' + getComputedStyle(box.parentElement ?? box).position,
        };
      });
      const related = main?.querySelector(':scope > section[data-content="related"], :scope > section[aria-labelledby="related"]');
      const relatedRoom = related && shown(related) ? rect(related).h + parseFloat(getComputedStyle(related).marginTop) + parseFloat(getComputedStyle(main as Element).rowGap || '0') : 0;
      const tool = document.querySelector('#fo-tool-root');
      const header = document.querySelector('.fo-header');
      const notice = document.getElementById('fo-cookie');
      const firstBox = main?.querySelector('.fo-ad--content') ?? null;
      let first = null;
      if (firstBox) {
        const texts = [...(main?.querySelectorAll('p') ?? [])].filter((p) => {
          if (!tool || p.closest('#fo-tool-root, #fo-calc-schedule') || p.classList.contains('fo-guide__open') || p.closest('.fo-ad')) return false;
          return Boolean(tool.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING) && Boolean(p.compareDocumentPosition(firstBox) & Node.DOCUMENT_POSITION_FOLLOWING);
        });
        first = {
          before: describe(sibling(firstBox, 'previousElementSibling')),
          after: describe(sibling(firstBox, 'nextElementSibling')),
          textBetweenToolAndIt: texts.length,
          afterTool: tool ? Boolean(tool.compareDocumentPosition(firstBox) & Node.DOCUMENT_POSITION_FOLLOWING) : true,
        };
      }
      const firstGrid = main?.querySelector('.fo-grid, .fo-guidecards');
      let gridBlock: Element | null | undefined = firstGrid;
      while (gridBlock && gridBlock.parentElement !== main) gridBlock = gridBlock.parentElement;
      const groupRects: Record<string, { x: number; y: number; w: number; h: number }[]> = {};
      for (const [name, selector] of Object.entries(groups)) groupRects[name] = [...document.querySelectorAll(selector)].filter((element) => shown(element) && !element.closest('.fo-ad')).map(rect);
      return {
        width: innerWidth,
        height: innerHeight,
        inDom: all.length,
        boxes,
        main: main ? rect(main) : { x: 0, y: 0, w: 0, h: 0 },
        related: relatedRoom,
        tool: tool && shown(tool) ? rect(tool) : null,
        header: header ? rect(header) : null,
        notice: notice && !notice.hidden && shown(notice) ? rect(notice) : null,
        targets: [...document.querySelectorAll(targets)].filter((element) => shown(element) && !element.closest('.fo-ad')).map((element) => ({ ...rect(element), kind: describe(element) })),
        grids: [...(main?.querySelectorAll('.fo-grid, .fo-guidecards') ?? [])].filter(shown).map(rect),
        groups: groupRects,
        first,
        firstGridBlock: describe(gridBlock ?? null) || null,
      };
    },
    { targets, groups },
  );
}

/** The distance between two boxes, edge to edge (0 when they touch or overlap). */
export function distance(a: Rect, b: Rect): number {
  const dx = Math.max(0, b.x - (a.x + a.w), a.x - (b.x + b.w));
  const dy = Math.max(0, b.y - (a.y + a.h), a.y - (b.y + b.h));
  return Math.hypot(dx, dy);
}

/** The conservative density of § 351: the content boxes of the column (and the multiplex) plus 100 px of anchor, counted
 * once, over <main> without the related section. */
export function densityOf(measure: MapMeasure): number {
  const column = measure.boxes.filter((box) => box.inMain).reduce((sum, box) => sum + box.h, 0);
  return (column + 100) / (measure.main.h - measure.related);
}

/** The content boxes of the column, top to bottom, and the room between each two, edge to edge. */
export function contentGaps(measure: MapMeasure): number[] {
  const content = measure.boxes.filter((box) => box.inMain && box.kind === 'content').sort((a, b) => a.y - b.y);
  return content.slice(1).map((box, index) => box.y - ((content[index]?.y ?? 0) + (content[index]?.h ?? 0)));
}

/** Two animation frames: the layout after a resize has settled. */
export async function frames(page: Page): Promise<void> {
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
}
