// Pure validators of the design system rules. scripts/gates/design.ts runs them on the built site and
// tests/unit/design-checks.test.ts proves each one on small inputs. They return Portuguese problem
// messages; an empty list means ok. The CSS ones also work on minified CSS (Lightning CSS output).
import { parse, type HTMLElement } from 'node-html-parser';

/** The closed list of Oli poses (DECISOES § 19 and the F1b prompt, decision 4). */
export const OLI_POSES: readonly string[] = ['wave', 'gulp', 'swim', 'cheer', 'oops', 'buoy', 'lost', 'coffee', 'peek'];

/** Colour tokens a `color:` declaration may use. `on-*` only on the fill they name (contrast.test.ts). */
export const TEXT_COLOR_TOKENS: readonly string[] = ['ink', 'ink-muted', 'brand', 'danger', 'success', 'on-brand', 'on-sun', 'on-deep', 'on-deep-muted', 'on-cat', 'on-violeta'];

const MOTION_PROPERTIES: ReadonlySet<string> = new Set(['transform', 'opacity', 'translate', 'scale', 'rotate']);
const KEYFRAME_PROPERTIES: ReadonlySet<string> = new Set([...MOTION_PROPERTIES, 'animation-timing-function']);

// ---------------------------------------------------------------------------------------------
// CSS helpers

/** Comments become spaces (newlines stay) so line numbers and offsets of the original are kept. */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
}

/** url(...) can hold `;` and `{` (data: URIs); its content never matters to these checks. */
function stripUrls(css: string): string {
  return css.replace(/url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\)/gi, 'url()');
}

function withoutImportant(value: string): string {
  return value.replace(/\s*!important\s*$/i, '').trim();
}

/** The `-webkit-`, `-moz-`, `-ms-` and `-o-` prefix is dropped: `-webkit-transform` is `transform`. */
function unprefixed(name: string): string {
  return name.trim().toLowerCase().replace(/^-(?:webkit|moz|ms|o)-/, '');
}

/** Splits at a top-level separator: commas inside parentheses or quotes (cubic-bezier(...), var(a, b)) stay. */
function splitTop(value: string, separator: ',' | ' '): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote = '';
  let current = '';
  for (const char of value) {
    if (quote) {
      if (char === quote) quote = '';
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '(') depth += 1;
    else if (char === ')') depth = Math.max(0, depth - 1);
    const isSeparator = depth === 0 && !quote && (separator === ',' ? char === ',' : /\s/.test(char));
    if (isSeparator) {
      if (current.trim()) parts.push(current.trim());
      current = '';
    } else current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

interface Declaration {
  property: string;
  value: string;
  index: number;
}

/** Declarations whose property matches `propertyPattern` exactly (a regex source, case-insensitive). */
function declarations(css: string, propertyPattern: string): Declaration[] {
  const pattern = new RegExp(`(?:^|[{};])\\s*(${propertyPattern})\\s*:\\s*([^;{}]*)`, 'gi');
  return [...css.matchAll(pattern)].map((match) => ({ property: match[1] ?? '', value: (match[2] ?? '').trim(), index: match.index ?? 0 }));
}

/** The selector of the rule that holds the declaration at `index`, shortened for a message. */
function selectorAt(css: string, index: number): string {
  const open = css.lastIndexOf('{', index);
  if (open < 0) return '(fora de regra)';
  const start = Math.max(css.lastIndexOf('}', open), css.lastIndexOf(';', open), css.lastIndexOf('{', open - 1)) + 1;
  const selector = css.slice(start, open).replace(/\s+/g, ' ').trim();
  return selector.length > 70 ? `${selector.slice(0, 67)}...` : selector || '(sem seletor)';
}

// ---------------------------------------------------------------------------------------------
// a) theme variables

/**
 * Every custom property the theme namespaces (--color-*, --radius-*, --shadow-*, --font-*) declare
 * must be var(--token) of a design token, or be itself a token (the definition in tokens.css).
 */
export function checkThemeVars(css: string, tokenNames: ReadonlySet<string>): string[] {
  const problems: string[] = [];
  const clean = stripComments(css);
  for (const { property, value } of declarations(clean, '--(?:color|radius|shadow|font)-[\\w-]+')) {
    const name = property.slice(2);
    if (tokenNames.has(name)) continue;
    const reference = /^var\(\s*--([\w-]+)\s*\)$/.exec(withoutImportant(value));
    if (reference?.[1] && tokenNames.has(reference[1])) continue;
    problems.push(`variável de tema ${property}: ${value || '(vazio)'} não é var(--token) de um token do design system`);
  }
  return problems;
}

// ---------------------------------------------------------------------------------------------
// b) text colours

/** `color:` only with a text token, inherit or currentColor (not background-color, border-color...). */
export function checkTextColors(css: string): string[] {
  const clean = stripUrls(stripComments(css));
  const problems: string[] = [];
  for (const { value, index } of declarations(clean, 'color')) {
    const bare = withoutImportant(value);
    const token = /^var\(\s*--([\w-]+)\s*\)$/.exec(bare)?.[1];
    const ok = token ? TEXT_COLOR_TOKENS.includes(token) : /^(?:inherit|currentcolor)$/i.test(bare);
    if (!ok) problems.push(`color: ${bare || '(vazio)'} em ${selectorAt(clean, index)} não é um token de texto (${TEXT_COLOR_TOKENS.join(', ')}), inherit nem currentColor`);
  }
  return problems;
}

// ---------------------------------------------------------------------------------------------
// c) motion

const TIME = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:ms|s)$/i;
const EASING_KEYWORDS: ReadonlySet<string> = new Set(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'step-start', 'step-end']);

type TransitionPart = 'time' | 'easing' | 'behavior' | 'unknown' | 'property';

function classify(part: string): TransitionPart {
  const lower = part.toLowerCase();
  if (TIME.test(lower) || lower.startsWith('calc(') || /^var\(\s*--dur-/.test(lower)) return 'time';
  if (EASING_KEYWORDS.has(lower) || /^(?:cubic-bezier|steps|linear)\(/.test(lower) || /^var\(\s*--ease-/.test(lower)) return 'easing';
  if (lower === 'normal' || lower === 'allow-discrete') return 'behavior';
  if (lower.includes('(')) return 'unknown';
  return 'property';
}

function checkTransitionProperty(name: string, where: string, problems: string[]): void {
  const property = unprefixed(name);
  if (property === 'none' || MOTION_PROPERTIES.has(property)) return;
  problems.push(`transition em ${where}: ${property === 'all' ? '"all" anima qualquer propriedade' : `"${property}" não é uma propriedade de movimento`} (só transform, opacity, translate, scale e rotate)`);
}

/**
 * Movement is cheap on the compositor and nothing else is: @keyframes may touch only transform,
 * opacity, translate, scale and rotate (and animation-timing-function), and transition may name
 * only those (or none). `all`, or a shorthand item without a property name (which means all), fails.
 */
export function checkMotion(css: string): string[] {
  const clean = stripUrls(stripComments(css));
  const problems: string[] = [];

  for (const start of clean.matchAll(/@(?:-[a-z]+-)?keyframes\s+([^\s{]+)\s*\{/gi)) {
    const name = start[1] ?? '?';
    const bodyStart = (start.index ?? 0) + start[0].length;
    let depth = 1;
    let cursor = bodyStart;
    for (; cursor < clean.length && depth > 0; cursor += 1) {
      if (clean[cursor] === '{') depth += 1;
      else if (clean[cursor] === '}') depth -= 1;
    }
    const body = clean.slice(bodyStart, cursor - 1);
    for (const frame of body.matchAll(/\{([^{}]*)\}/g)) {
      for (const declaration of (frame[1] ?? '').split(';')) {
        const colon = declaration.indexOf(':');
        if (colon < 0) continue;
        const property = unprefixed(declaration.slice(0, colon));
        if (!KEYFRAME_PROPERTIES.has(property)) problems.push(`@keyframes ${name}: "${property}" não é uma propriedade de movimento (só transform, opacity, translate, scale e rotate)`);
      }
    }
  }

  for (const { property, value, index } of declarations(clean, '(?:-[a-z]+-)?transition(?:-property)?')) {
    const where = selectorAt(clean, index);
    const items = splitTop(withoutImportant(value), ',');
    if (!items.length) problems.push(`transition em ${where}: valor vazio`);
    if (unprefixed(property) === 'transition-property') {
      for (const item of items) checkTransitionProperty(item, where, problems);
      continue;
    }
    for (const item of items) {
      const parts = splitTop(item, ' ').map((part) => ({ part, kind: classify(part) }));
      const unknown = parts.find((entry) => entry.kind === 'unknown');
      if (unknown) {
        problems.push(`transition em ${where}: "${unknown.part}" não dá para conferir (use var(--dur-*) e var(--ease-*))`);
        continue;
      }
      const named = parts.filter((entry) => entry.kind === 'property');
      if (!named.length) problems.push(`transition em ${where}: "${item}" sem nome de propriedade (equivale a "all")`);
      for (const entry of named) checkTransitionProperty(entry.part, where, problems);
    }
  }
  return problems;
}

// ---------------------------------------------------------------------------------------------
// d) fonts

const FONT_FILES: Readonly<Record<string, RegExp>> = {
  Fredoka: /^\/_astro\/fredoka-latin-wght-normal\.[\w-]+\.woff2$/,
  Figtree: /^\/_astro\/figtree-latin-wght-normal\.[\w-]+\.woff2$/,
};

/** A dist path ('dist\_astro\a.woff2', 'dist/_astro/a.woff2') or a URL path as a '/_astro/a.woff2' URL path. */
function asUrlPath(path: string): string {
  const slashed = path.replace(/\\/g, '/').replace(/^\.?\/?dist\//, '/');
  return slashed.startsWith('/') ? slashed : `/${slashed}`;
}

export interface FontsInput {
  css: string;
  pages: { path: string; html: string }[];
  /** Every .woff2 in dist. */
  woff2Files: string[];
}

/**
 * Only the two latin variable fonts reach the browser, each once; the @font-face URLs are the hashed
 * files in /_astro/; and each page preloads the Fredoka file alone, with the exact URL of the CSS
 * (a different URL would download the font twice).
 */
export function checkFonts(input: FontsInput): string[] {
  const problems: string[] = [];
  const clean = stripComments(input.css);
  const urlFaces: { family: string; urls: string[] }[] = [];
  for (const face of clean.matchAll(/@font-face\s*\{([^}]*)\}/gi)) {
    const body = face[1] ?? '';
    const family = /font-family\s*:\s*([^;]+)/i.exec(body)?.[1]?.trim().replace(/^["']|["']$/g, '') ?? '(sem família)';
    const src = /(?:^|[;\s])src\s*:\s*([^;]+)/i.exec(body)?.[1] ?? '';
    const urls = [...src.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi)].map((match) => match[2] ?? '');
    if (urls.length) urlFaces.push({ family, urls });
    else if (!/local\(/i.test(src)) problems.push(`@font-face ${family} sem url() nem local()`);
  }

  if (urlFaces.length !== 2) problems.push(`${urlFaces.length} @font-face com url() (esperado 2: Fredoka e Figtree)`);
  const urlOf = new Map<string, string>();
  for (const face of urlFaces) {
    const pattern = FONT_FILES[face.family];
    if (!pattern) {
      problems.push(`@font-face com url() para a família ${face.family} (só Fredoka e Figtree)`);
      continue;
    }
    if (urlOf.has(face.family)) problems.push(`mais de um @font-face com url() para ${face.family}`);
    if (face.urls.length !== 1) problems.push(`@font-face ${face.family} com ${face.urls.length} url() (esperado só o woff2 latino)`);
    const url = face.urls[0] ?? '';
    if (!pattern.test(url)) problems.push(`@font-face ${face.family} usa ${url} (esperado /_astro/${face.family.toLowerCase()}-latin-wght-normal.<hash>.woff2)`);
    else urlOf.set(face.family, url);
  }
  for (const family of Object.keys(FONT_FILES)) if (!urlFaces.some((face) => face.family === family)) problems.push(`falta o @font-face com url() de ${family}`);

  const shipped = input.woff2Files.map(asUrlPath).sort();
  const expected = [...urlOf.values()].sort();
  if (urlOf.size === Object.keys(FONT_FILES).length && JSON.stringify(shipped) !== JSON.stringify(expected)) {
    problems.push(`dist tem ${shipped.length} arquivo(s) .woff2 (${shipped.join(', ') || 'nenhum'}) e o CSS usa só ${expected.join(' e ')}`);
  } else if (urlOf.size < Object.keys(FONT_FILES).length && shipped.length !== 2) {
    problems.push(`dist tem ${shipped.length} arquivo(s) .woff2 (esperado 2)`);
  }

  const fredoka = urlOf.get('Fredoka');
  for (const page of input.pages) {
    const preloads = parse(page.html).querySelectorAll('link[rel="preload"][as="font"]');
    if (preloads.length !== 1) {
      problems.push(`${page.path}: ${preloads.length} <link rel="preload" as="font"> (esperado 1, o da Fredoka)`);
      continue;
    }
    const link = preloads[0] as HTMLElement;
    if (link.getAttribute('type') !== 'font/woff2') problems.push(`${page.path}: preload da fonte sem type="font/woff2"`);
    if (!link.hasAttribute('crossorigin')) problems.push(`${page.path}: preload da fonte sem crossorigin (o navegador baixaria a fonte duas vezes)`);
    const href = link.getAttribute('href');
    if (fredoka && href !== fredoka) problems.push(`${page.path}: preload aponta ${href ?? '(sem href)'} e o CSS usa ${fredoka}`);
  }
  return problems;
}

// ---------------------------------------------------------------------------------------------
// e) Oli sprite

const PART = /^oli-p\d+$/;

/**
 * The Oli sprite of one page: unique ids, a single oli-clip clipPath and no `ic`, one hidden (but not
 * display:none) svg.fo-sprite, symbols named by the closed pose list, every [data-oli] box holding one
 * <use> of its own pose, no dangling reference, and a symbol for each pose the page shows or needs.
 */
export function checkSprite(html: string, options: { requiredPoses: readonly string[] }): string[] {
  const root = parse(html);
  const problems: string[] = [];

  const byId = new Map<string, HTMLElement[]>();
  for (const element of root.querySelectorAll('[id]')) {
    const id = element.getAttribute('id') ?? '';
    byId.set(id, [...(byId.get(id) ?? []), element]);
  }
  for (const [id, elements] of byId) if (elements.length > 1) problems.push(`id "${id}" repetido ${elements.length} vezes na página`);

  const clip = byId.get('oli-clip');
  if (!clip) problems.push('falta o clipPath oli-clip');
  else if (clip[0] && clip[0].tagName.toLowerCase() !== 'clippath') problems.push(`oli-clip é <${clip[0].rawTagName}>, deveria ser <clipPath>`);
  if (byId.has('ic')) problems.push('id "ic" no sprite (o clipPath da peek não entra)');

  const sprites = root.querySelectorAll('svg.fo-sprite');
  if (sprites.length !== 1) problems.push(`${sprites.length} svg.fo-sprite (esperado 1)`);
  const sprite = sprites[0];
  if (sprite) {
    if (sprite.getAttribute('aria-hidden') !== 'true') problems.push('svg.fo-sprite sem aria-hidden="true"');
    if (sprite.hasAttribute('hidden')) problems.push('svg.fo-sprite com o atributo hidden (o clipPath deixa de funcionar)');
    if (/display\s*:\s*none/i.test(sprite.getAttribute('style') ?? '')) problems.push('svg.fo-sprite com display:none (o clipPath deixa de funcionar)');
  }

  const symbolPoses = new Set<string>();
  for (const symbol of root.querySelectorAll('symbol')) {
    const id = symbol.getAttribute('id') ?? '';
    if (!id.startsWith('oli-') || PART.test(id)) continue;
    const pose = id.slice('oli-'.length);
    if (OLI_POSES.includes(pose)) symbolPoses.add(pose);
    else problems.push(`símbolo ${id} fora da lista de poses (${OLI_POSES.join(', ')}) e não é uma peça oli-p<N>`);
  }

  const shown = new Set<string>();
  for (const box of root.querySelectorAll('[data-oli]')) {
    const pose = box.getAttribute('data-oli') ?? '';
    const name = `[data-oli="${pose}"]`;
    if (OLI_POSES.includes(pose)) shown.add(pose);
    else problems.push(`${name} com pose fora da lista (${OLI_POSES.join(', ')})`);
    if (box.getAttribute('aria-hidden') !== 'true') problems.push(`${name} sem aria-hidden="true"`);
    const svgs = box.children.filter((child) => child.tagName === 'SVG');
    const svg = svgs[0];
    if (svgs.length !== 1 || !svg) {
      problems.push(`${name} com ${svgs.length} <svg> filho (esperado 1)`);
      continue;
    }
    if (svg.getAttribute('aria-hidden') !== 'true') problems.push(`${name}: o <svg> filho está sem aria-hidden="true"`);
    const uses = svg.querySelectorAll('use');
    if (uses.length !== 1) problems.push(`${name}: o <svg> tem ${uses.length} <use> (esperado 1)`);
    else if (uses[0]?.getAttribute('href') !== `#oli-${pose}`) problems.push(`${name}: <use href="${uses[0]?.getAttribute('href') ?? ''}"> em vez de #oli-${pose}`);
  }

  for (const use of root.querySelectorAll('use')) {
    const href = use.getAttribute('href') ?? '';
    if (href.startsWith('#') && !byId.has(href.slice(1))) problems.push(`<use href="${href}"> aponta um id que não existe na página`);
  }
  for (const element of root.querySelectorAll('[clip-path],[mask],[filter],[fill],[stroke]')) {
    for (const attribute of ['clip-path', 'mask', 'filter', 'fill', 'stroke']) {
      const target = /url\(\s*["']?#([^)"'\s]+)/.exec(element.getAttribute(attribute) ?? '')?.[1];
      if (target && !byId.has(target)) problems.push(`${attribute}="url(#${target})" aponta um id que não existe na página`);
    }
  }

  for (const pose of new Set([...shown, ...options.requiredPoses])) {
    if (!symbolPoses.has(pose)) problems.push(`falta o símbolo oli-${pose} no sprite`);
  }
  return problems;
}

// ---------------------------------------------------------------------------------------------
// f) arrows

/** The Latin subset of Fredoka and Figtree has no → or ↔: the site uses the arrow-right icon (v1.1, item 12). */
export function checkArrows(html: string): string[] {
  const root = parse(html);
  for (const node of root.querySelectorAll('script, style')) node.remove();
  const text = root.text;
  const problems: string[] = [];
  const found = [...text.matchAll(/[→↔]/g)];
  for (const match of found.slice(0, 3)) {
    const at = match.index ?? 0;
    const around = text.slice(Math.max(0, at - 20), at + 21).replace(/\s+/g, ' ').trim();
    problems.push(`seta ${match[0]} (U+${match[0].codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')}) no texto: "${around}"; use o ícone arrow-right`);
  }
  if (found.length > 3) problems.push(`mais ${found.length - 3} seta(s) → ou ↔ no texto`);
  return problems;
}

// ---------------------------------------------------------------------------------------------
// g) one stylesheet

/** One CSS request per page: exactly one <link rel="stylesheet"> and no <style>. */
export function checkSingleStylesheet(html: string): string[] {
  const root = parse(html);
  const problems: string[] = [];
  const links = root.querySelectorAll('link[rel="stylesheet"]').length;
  const styles = root.querySelectorAll('style').length;
  if (links !== 1) problems.push(`${links} <link rel="stylesheet"> (esperado 1)`);
  if (styles > 0) problems.push(`${styles} elemento(s) <style> na página (o CSS fica só no arquivo)`);
  return problems;
}
