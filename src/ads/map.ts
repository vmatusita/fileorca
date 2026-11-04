// The ad map in the page (F12, decisions 3 and 4; UX-07 A; DECISOES § 419 to § 421). The build places every ad box:
// the view renders <main> with marks between its blocks (AdBreak.astro): one "first" mark where the first content ad of
// the mold goes, and "break" marks at the other block boundaries where a content ad may go. The layout renders <main> to
// text, and this module
//   1. checks every mark against the rules of the map (never inside a grid, a table, a list, a question, a form, the
//      panel, the schedule, a heading or a band; never right after a heading; never against a table; never beside the
//      "What we measured" section of a guide), so a view that marks a wrong place fails the build;
//   2. puts the first content ad at the first mark and, from it, each next one at the first break mark that the estimate
//      at 360 px (estimate.ts) puts 1,110 px × 1.15 or more from the previous one, edge to edge;
//   3. writes each position as a box with the unit of the area (conteudo, conteudo-2…, contentUnit), and none where the
//      unit has no id (Mudança 10); the multiplex at the end of <main>; the rail with the lateral and, on a page with 600
//      words or more in <main>, the lateral-2.
// Plan B of the help of Google (DECISOES § 415): no box has an <ins>. Each box says the width it is for (data-ad-media),
// the CSS shows it only there, and one inline script per page (pushScript), on fileorca.com only, walks the boxes on load:
// the box whose width matches gets the <ins>, one push and loses its width rule; the one that does not match leaves the
// DOM. Turning the phone or resizing the window later creates or removes no ad, and nothing is pushed again.
import type { AdArea } from '../i18n/routes.ts';
import { PRODUCTION_HOSTNAME } from '../platform/site.ts';
import { contentUnit, unitFor, type AdUnit, type AdsConfig } from './config.ts';
import { placeMarks } from './estimate.ts';
import { AD_MARKS, MARK_TAG, classesOf, isElement, isInvisible, parseHtml, wordsOf, type Element } from './html.ts';

/** The least room between two content ads, edge to edge, at 360 × 740 (the box margins of 150 px inside it; § 351). */
export const AD_DISTANCE = 1110;
/** The estimate has to pass the distance by 15 %, so a wrong estimate errs toward one ad less. */
export const AD_DISTANCE_SLACK = 1.15;
/** The margin of a box (--ad-clearance) and the height a content box reserves. */
export const AD_CLEARANCE = 150;
export const CONTENT_BOX = 300;
/** A paragraph keeps 12 px under it, which the 150 px of a box swallows (the margins collapse in the text). */
const COLLAPSED = 12;
/** The lateral-2 only on a page with this many words in <main> (decision 3; the gate counts 150 per box). */
export const RAIL2_WORDS = 600;
/** The column the two rails need: 150 under the header, 644 of the 1st, 1,200 between them and 644 of the 2nd. */
export const RAIL_GAP = 1200;
export const RAIL_BOX = 644;
export const RAIL2_COLUMN = AD_CLEARANCE + RAIL_BOX + RAIL_GAP + RAIL_BOX;

/** The widths a box is for: the 2nd content ad on only under 768 px, the multiplex from 768 px, the rails from 1280 px. */
export const AD_MEDIA = {
  phone: '(max-width: 767px)',
  wide: '(min-width: 768px)',
  rail: '(min-width: 1280px)',
} as const;

export type BoxKind = 'content' | 'multiplex' | 'rail';

export interface AdBox {
  area: AdArea;
  unit: AdUnit;
  id: string;
  label: string;
}

const kindOf = (unit: AdUnit): BoxKind => (unit === 'multiplex' ? 'multiplex' : unit.startsWith('lateral') ? 'rail' : 'content');

/** The media query a unit is for; the first content ad is for every width. */
export function mediaOf(unit: AdUnit): string | null {
  if (unit === 'conteudo') return null;
  if (unit === 'multiplex') return AD_MEDIA.wide;
  if (unit === 'lateral' || unit === 'lateral-2') return AD_MEDIA.rail;
  return AD_MEDIA.phone;
}

const attr = (value: string): string => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

/**
 * One ad box: the reserved room with the label AdSense accepts, and what the push script needs to make the unit (area,
 * unit, id, format and media query). No <ins> in the HTML (plan B), no role, no focus.
 */
export function adBoxHtml({ area, unit, id, label }: AdBox): string {
  const kind = kindOf(unit);
  const media = mediaOf(unit);
  const classes = ['fo-ad', `fo-ad--${kind}`, ...(media === AD_MEDIA.phone ? ['fo-ad--phone'] : []), ...(unit === 'lateral-2' ? ['fo-ad--rail2'] : [])];
  const format = kind === 'content' ? 'auto' : kind === 'multiplex' ? 'autorelaxed' : null;
  const attrs = [
    `class="${classes.join(' ')}"`,
    `data-ad-area="${area}"`,
    `data-ad-unit="${unit}"`,
    `data-ad-id="${attr(id)}"`,
    ...(format ? [`data-ad-format="${format}"`] : []),
    ...(media ? [`data-ad-media="${media}"`] : []),
    // The lateral-2 shows only where the rail column has the room of both (the script checks it on load).
    ...(unit === 'lateral-2' ? [`data-ad-fit="${RAIL2_COLUMN}"`, 'hidden'] : []),
  ];
  return `<div ${attrs.join(' ')}><span class="fo-ad__label">${attr(label)}</span></div>`;
}

/**
 * The one push script of a page (decision 3; no script per box). Only on fileorca.com, on load: a box whose media query
 * does not match (or the lateral-2 without the room) leaves the DOM; one that matches gets the <ins> of its unit (the
 * content one responsive and full width, the multiplex autorelaxed, the rail 300 × 600), loses its width rule (it stays
 * visible at any width from then on) and is pushed once. An emptied rail leaves too, so no empty region keeps the name.
 */
export function pushScript(client: string): string {
  return (
    `if(location.hostname===${JSON.stringify(PRODUCTION_HOSTNAME)}){document.querySelectorAll(".fo-ad[data-ad-id]").forEach(function(b){` +
    `var m=b.getAttribute("data-ad-media"),f=Number(b.getAttribute("data-ad-fit")),t=b.getAttribute("data-ad-format"),i;` +
    `if(m&&!matchMedia(m).matches||f&&b.parentElement.offsetHeight<f){b.remove();return}` +
    `i=document.createElement("ins");i.className="adsbygoogle";i.setAttribute("data-ad-client",${JSON.stringify(client)});i.setAttribute("data-ad-slot",b.getAttribute("data-ad-id"));` +
    `if(t){i.style.display="block";i.setAttribute("data-ad-format",t);if(t==="auto")i.setAttribute("data-full-width-responsive","true")}else i.style.cssText="display:inline-block;width:300px;height:600px";` +
    `b.removeAttribute("data-ad-media");b.hidden=false;b.appendChild(i);(window.adsbygoogle=window.adsbygoogle||[]).push({})});` +
    `var r=document.querySelector("aside.fo-rail");if(r&&!r.querySelector(".fo-ad"))r.remove()}`
  );
}

// ---- The rules of a mark --------------------------------------------------------------------------------------------

/** Where no ad may go: inside these (decision 3; ad-map.html "Onde um anúncio pode entrar"). */
const NEVER_INSIDE_TAGS = new Set(['ul', 'ol', 'li', 'table', 'details', 'summary', 'form', 'fieldset', 'nav', 'header', 'footer', 'p', 'a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figure', 'blockquote', 'dl']);
const NEVER_INSIDE_IDS = new Set(['fo-tool-root', 'fo-calc-schedule']);
const NEVER_INSIDE_CLASSES = new Set(['fo-grid', 'fo-guidecards', 'fo-guidehere', 'fo-hubband', 'fo-hero', 'fo-top', 'fo-table-wrap', 'fo-crumbs', 'fo-jump', 'fo-example', 'fo-guide__tool', 'fo-steps']);
const HEADING = /^h[1-6]$/;
const isTable = (element: Element): boolean => element.tag === 'table' || classesOf(element).includes('fo-table-wrap');
const isMeasured = (element: Element): boolean => element.attrs['data-content'] === 'measured' || element.attrs['aria-labelledby'] === 'measured';
const shown = (element: Element): Element[] => element.kids.filter(isElement).filter((kid) => kid.tag !== MARK_TAG && !isInvisible(kid));

function describe(element: Element): string {
  const id = element.attrs['id'] ? `#${element.attrs['id']}` : '';
  const classes = classesOf(element).map((name) => `.${name}`).join('');
  const label = element.attrs['aria-labelledby'] ? `[aria-labelledby=${element.attrs['aria-labelledby']}]` : '';
  return `${element.tag}${id}${classes}${label}`;
}

/** The last (or first) visible element of a block, all the way down. */
function edge(element: Element, side: 'first' | 'last'): Element[] {
  const chain: Element[] = [element];
  for (let at = element; ; ) {
    const kids = shown(at);
    const next = side === 'first' ? kids[0] : kids.at(-1);
    if (!next) return chain;
    chain.push(next);
    at = next;
  }
}

/**
 * What is wrong with the marks of a <main>, by the rules of the map; empty when every mark is in an allowed place. A page
 * with ads (`withAds`) needs its one "first" mark; a page without may have none.
 */
export function markProblems(mainHtml: string, withAds = true): string[] {
  const problems: string[] = [];
  let firsts = 0;
  let breaksBeforeFirst = 0;
  const walk = (element: Element, ancestors: Element[]): void => {
    const kids = element.kids.filter(isElement);
    kids.forEach((kid, index) => {
      if (kid.tag !== MARK_TAG) {
        walk(kid, [...ancestors, kid]);
        return;
      }
      const kind = kid.attrs['kind'] ?? 'break';
      if (kind === 'first') firsts += 1;
      else if (firsts === 0) breaksBeforeFirst += 1;
      const where = ancestors.map(describe).join(' > ') || 'main';
      const inside = ancestors.find((ancestor) => NEVER_INSIDE_TAGS.has(ancestor.tag) || NEVER_INSIDE_IDS.has(ancestor.attrs['id'] ?? '') || classesOf(ancestor).some((name) => NEVER_INSIDE_CLASSES.has(name)));
      if (inside) problems.push(`marca ${kind} dentro de ${describe(inside)} (${where})`);
      const before = kids.slice(0, index).filter((node) => node.tag !== MARK_TAG && !isInvisible(node)).at(-1);
      const after = kids.slice(index + 1).find((node) => node.tag !== MARK_TAG && !isInvisible(node));
      if (!before) problems.push(`marca ${kind} no começo de ${where}`);
      if (!after) problems.push(`marca ${kind} no fim de ${where}`);
      if (before && HEADING.test(before.tag)) problems.push(`marca ${kind} logo depois de um título (${describe(before)}, em ${where})`);
      if (before && edge(before, 'last').some(isTable)) problems.push(`marca ${kind} colada no fim de uma tabela (${describe(before)}, em ${where})`);
      if (after && edge(after, 'first').some(isTable)) problems.push(`marca ${kind} colada no começo de uma tabela (${describe(after)}, em ${where})`);
      if ((before && isMeasured(before)) || (after && isMeasured(after)) || ancestors.some(isMeasured)) problems.push(`marca ${kind} ao lado da seção "O que medimos" (${where})`);
    });
  };
  walk(parseHtml(mainHtml), []);
  if (firsts > 1) problems.push(`${firsts} marcas do 1º anúncio (pede uma)`);
  if (breaksBeforeFirst > 0 && (firsts > 0 || withAds)) problems.push(`${breaksBeforeFirst} marca(s) antes da do 1º anúncio`);
  if (firsts === 0 && withAds) problems.push('nenhuma marca do 1º anúncio');
  return problems;
}

// ---- The placement ------------------------------------------------------------------------------------------------

/**
 * The marks that get a content ad, by their order in the page (0 is the first mark): the first mark, then each break that
 * the estimate puts AD_DISTANCE × AD_DISTANCE_SLACK or more from the box before, edge to edge. A position past
 * conteudo-9 has no unit, so the map stops there.
 */
export function chooseMarks(mainHtml: string): number[] {
  const { marks } = placeMarks(mainHtml);
  const first = marks.findIndex((mark) => mark.kind === 'first');
  if (first < 0) return [];
  const chosen = [first];
  let last = marks[first]?.y ?? 0;
  for (let index = first + 1; index < marks.length; index += 1) {
    const y = marks[index]?.y ?? 0;
    if (2 * AD_CLEARANCE - COLLAPSED + (y - last) < AD_DISTANCE * AD_DISTANCE_SLACK) continue;
    if (!contentUnit(chosen.length + 1)) break;
    chosen.push(index);
    last = y;
  }
  return chosen;
}

export interface AdLayout {
  /** <main> with the boxes in place and no mark left. */
  main: string;
  /** The boxes of the rail column, or nothing. */
  rail: string;
  /** The push script of the page, or null when the page has no box. */
  push: string | null;
  /** The units of the boxes the page carries, in order (the content ones, the multiplex and the rails). */
  units: AdUnit[];
  /** The words of <main>, as gate:prontidao counts them. */
  words: number;
}

/** <main> with no mark (a page without ads, or a build without the variables). */
export function withoutMarks(mainHtml: string): string {
  return mainHtml.replace(AD_MARKS, '');
}

/**
 * The ad boxes of a page with an ad area: the content ones at the chosen marks, the multiplex as the last block of <main>
 * and the rails, each only with the id of its unit (none in the default build), and the push script when any box exists.
 * A mark in a wrong place fails the build, with or without the variables.
 */
export function layOutAds(mainHtml: string, options: { area: AdArea; label: string; config: AdsConfig }): AdLayout {
  const problems = markProblems(mainHtml);
  if (problems.length) throw new Error(`mapa de anúncios: ${problems.join('; ')}`);
  const { area, label, config } = options;
  const words = wordsOf(mainHtml);
  const units: AdUnit[] = [];
  const box = (unit: AdUnit): string => {
    const id = unitFor(config, area, unit);
    if (!id) return '';
    units.push(unit);
    return adBoxHtml({ area, unit, id, label });
  };
  const chosen = new Map(chooseMarks(mainHtml).map((mark, position) => [mark, contentUnit(position + 1)]));
  let index = -1;
  const main = mainHtml.replace(AD_MARKS, () => {
    index += 1;
    const unit = chosen.get(index);
    return unit ? box(unit) : '';
  });
  const multiplex = box('multiplex');
  const rail = box('lateral') + (words >= RAIL2_WORDS ? box('lateral-2') : '');
  return { main: main + multiplex, rail, push: units.length > 0 && config.client ? pushScript(config.client) : null, units, words };
}
