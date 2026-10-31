// Build-time Oli sprite (F1b, decision 4). Assembles one <symbol> per pose from
// docs/design/assets/Oli/*.svg, plus the inline logo from Logo/logo-light.svg. A drawing that is the
// same in two or more poses becomes ONE part (id oli-pN) referenced by <use>; oli-clip is declared
// once and serves the poses and the logo; the unused clipPath "ic" of the peek is dropped. Path data
// and attributes stay byte-faithful (only empty wrapper groups go). Not client-safe: node:fs.
// The structure of the sources is asserted, so a redesign (run 1c) that changes it fails here, loudly,
// naming the file.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { POSES, isPose, type Pose } from './poses.ts';

export interface Sprite {
  /** <clipPath id="oli-clip">: declared once per page. */
  clip: string;
  /** Shared drawings by id (oli-p1, oli-p2, ...), as <tag id="oli-pN" ...>. */
  parts: ReadonlyMap<string, string>;
  symbols: ReadonlyMap<Pose, { markup: string; parts: readonly string[] }>;
  /** The mirrored Oli plus the two text paths, with no wrapper <svg>. */
  logo: { inner: string; viewBox: string; parts: readonly string[] };
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const WRAP = 'translate(64 64) scale(0.9) translate(-69.5 -60)';
const BODY_VIEWBOX = '0 0 128 128';
const PEEK_VIEWBOX = '0 18 128 80';
const LOGO_VIEWBOX = '0 0 426 128';
const LOGO_MIRROR = 'translate(128 4) scale(-1 1)';
const CLIP_ID = 'oli-clip';
const PEEK_CLIP_ID = 'ic';
const PART_PREFIX = 'oli-p';
const FILE_FILL = '#0F1B2D';
const ORCA_FILL = '#0B63F6';

// ---- minimal XML (the sources have no comments, CDATA, entities or text) ----

interface XmlNode {
  tag: string;
  attrs: Array<[string, string]>;
  children: XmlNode[];
}

const OPEN_TAG = /<([A-Za-z][\w:.-]*)((?:\s+[A-Za-z][\w:.-]*="[^"]*")*)\s*(\/?)>/y;
const CLOSE_TAG = /<\/([A-Za-z][\w:.-]*)\s*>/y;
const ATTRIBUTE = /\s+([A-Za-z][\w:.-]*)="([^"]*)"/g;

function parseXml(source: string, file: string): XmlNode {
  const problem = (message: string, at: number) => new Error(`${file}:${source.slice(0, at).split('\n').length}: ${message}`);
  const stack: XmlNode[] = [];
  let root: XmlNode | undefined;
  let pos = source.charCodeAt(0) === 0xfeff ? 1 : 0;
  while (pos < source.length) {
    const lt = source.indexOf('<', pos);
    const text = source.slice(pos, lt === -1 ? source.length : lt);
    if (text.trim() !== '') throw problem(`unexpected text "${text.trim().slice(0, 24)}"`, pos);
    if (lt === -1) break;
    pos = lt;
    if (source.startsWith('</', pos)) {
      CLOSE_TAG.lastIndex = pos;
      const close = CLOSE_TAG.exec(source);
      if (!close) throw problem('malformed closing tag', pos);
      if (stack.pop()?.tag !== close[1]) throw problem(`unbalanced </${close[1] ?? ''}>`, pos);
      pos = CLOSE_TAG.lastIndex;
      continue;
    }
    OPEN_TAG.lastIndex = pos;
    const open = OPEN_TAG.exec(source);
    if (!open) throw problem('unsupported markup (comment, CDATA, processing instruction or single-quoted attribute)', pos);
    const attrs: Array<[string, string]> = [];
    for (const attr of (open[2] ?? '').matchAll(ATTRIBUTE)) attrs.push([attr[1] ?? '', attr[2] ?? '']);
    const node: XmlNode = { tag: open[1] ?? '', attrs, children: [] };
    const parent = stack[stack.length - 1];
    if (parent) parent.children.push(node);
    else if (root) throw problem('more than one root element', pos);
    else root = node;
    if (open[3] !== '/') stack.push(node);
    pos = OPEN_TAG.lastIndex;
  }
  if (stack.length > 0) throw problem(`unclosed <${stack[stack.length - 1]?.tag ?? ''}>`, source.length);
  if (!root) throw problem('no root element', 0);
  return root;
}

/** Normalized serialization: attributes in source order, double quotes, no whitespace between elements. */
function ser(node: XmlNode): string {
  const attrs = node.attrs.map(([key, value]) => ` ${key}="${value}"`).join('');
  if (node.children.length === 0) return `<${node.tag}${attrs}/>`;
  return `<${node.tag}${attrs}>${node.children.map(ser).join('')}</${node.tag}>`;
}

// ---- structure assertions ----

function expectAttrs(node: XmlNode, expected: ReadonlyArray<readonly [string, string]>, where: string): void {
  const found = JSON.stringify(node.attrs);
  const wanted = JSON.stringify(expected);
  if (found !== wanted) throw new Error(`${where}: expected attributes ${wanted} on <${node.tag}>, found ${found}`);
}

function expectTag(node: XmlNode | undefined, tag: string, where: string): XmlNode {
  if (!node || node.tag !== tag) throw new Error(`${where}: expected <${tag}>, found <${node?.tag ?? 'nothing'}>`);
  return node;
}

function onlyChild(node: XmlNode, tag: string, where: string): XmlNode {
  if (node.children.length !== 1) throw new Error(`${where}: <${node.tag}> must have exactly one child, found ${node.children.length}`);
  return expectTag(node.children[0], tag, where);
}

function readRoot(source: string, file: string, viewBox: string, childCount: number): XmlNode {
  const svg = expectTag(parseXml(source, file), 'svg', file);
  expectAttrs(svg, [['xmlns', SVG_NS], ['viewBox', viewBox]], file);
  if (svg.children.length !== childCount) throw new Error(`${file}: <svg> must have ${childCount} children, found ${svg.children.length}`);
  return svg;
}

/** <defs> with a single <clipPath id=...>; returns the clipPath. */
function readClip(svg: XmlNode, id: string, file: string): XmlNode {
  const defs = expectTag(svg.children[0], 'defs', file);
  expectAttrs(defs, [], file);
  const clip = onlyChild(defs, 'clipPath', file);
  expectAttrs(clip, [['id', id]], file);
  return clip;
}

function references(node: XmlNode, id: string): boolean {
  const hit = (value: string) => value === `#${id}` || value.includes(`url(#${id})`);
  return node.attrs.some(([, value]) => hit(value)) || node.children.some((child) => references(child, id));
}

interface Body {
  clip: XmlNode;
  /** The rotation group around the children; '' when the pose has none. */
  rot: string;
  children: XmlNode[];
}

/** A full-body pose: <svg><defs>clip</defs><g WRAP><g ROT>children</g></g></svg>. */
function parseBody(source: string, file: string): Body {
  const svg = readRoot(source, file, BODY_VIEWBOX, 2);
  const clip = readClip(svg, CLIP_ID, file);
  const wrap = expectTag(svg.children[1], 'g', file);
  expectAttrs(wrap, [['transform', WRAP]], file);
  const inner = onlyChild(wrap, 'g', file);
  const rotAttr = inner.attrs[0];
  if (inner.attrs.length !== 1 || rotAttr?.[0] !== 'transform') {
    throw new Error(`${file}: the group around the pose must have only a transform, found ${JSON.stringify(inner.attrs)}`);
  }
  return { clip, rot: rotAttr[1], children: inner.children };
}

/** The peek: its own viewBox, an unreferenced clipPath "ic", one attribute-less <g>. */
function parsePeek(source: string, file: string): XmlNode[] {
  const svg = readRoot(source, file, PEEK_VIEWBOX, 2);
  readClip(svg, PEEK_CLIP_ID, file);
  const group = expectTag(svg.children[1], 'g', file);
  expectAttrs(group, [], file);
  if (references(group, PEEK_CLIP_ID)) throw new Error(`${file}: clipPath "${PEEK_CLIP_ID}" is referenced, so it cannot be dropped`);
  return group.children;
}

interface LogoSource {
  clip: XmlNode;
  oli: XmlNode[];
  /** `d` of the "File" and "Orca" text paths. */
  fileD: string;
  orcaD: string;
}

function parseLogo(source: string, file: string): LogoSource {
  const svg = readRoot(source, file, LOGO_VIEWBOX, 4);
  const clip = readClip(svg, CLIP_ID, file);
  const mirror = expectTag(svg.children[1], 'g', file);
  expectAttrs(mirror, [['transform', LOGO_MIRROR]], file);
  const wrap = onlyChild(mirror, 'g', file);
  expectAttrs(wrap, [['transform', WRAP]], file);
  const inner = onlyChild(wrap, 'g', file);
  expectAttrs(inner, [['transform', '']], file);
  const textPath = (node: XmlNode | undefined, fill: string, word: string): string => {
    const path = expectTag(node, 'path', `${file} (${word})`);
    const [d, paint] = path.attrs;
    if (path.attrs.length !== 2 || d?.[0] !== 'd' || paint?.[0] !== 'fill' || paint[1] !== fill) {
      throw new Error(`${file}: the "${word}" path must be <path d=... fill="${fill}"/>, found ${ser(path).slice(0, 40)}...`);
    }
    return d[1];
  };
  return {
    clip,
    oli: inner.children,
    fileD: textPath(svg.children[2], FILE_FILL, 'File'),
    orcaD: textPath(svg.children[3], ORCA_FILL, 'Orca'),
  };
}

// ---- assembly ----

const partNumber = (id: string) => Number(id.slice(PART_PREFIX.length));
const byPartNumber = (a: string, b: string) => partNumber(a) - partNumber(b);
const poseFile = (pose: Pose) => `oli-${pose}.svg`;
const LOGO_FILE = 'logo-light.svg';

export function buildSprite(sources: { poses: Record<Pose, string>; logo: string }): Sprite {
  const bodies = new Map<Pose, Body>();
  for (const pose of POSES) {
    if (pose !== 'peek') bodies.set(pose, parseBody(sources.poses[pose], poseFile(pose)));
  }

  // oli-clip is one drawing, in the 8 poses and in the logo.
  let clip = '';
  let clipFile = '';
  const sameClip = (node: XmlNode, file: string) => {
    const markup = ser(node);
    if (clip === '') {
      clip = markup;
      clipFile = file;
    } else if (markup !== clip) {
      throw new Error(`${file}: oli-clip differs from the one in ${clipFile}`);
    }
  };
  for (const [pose, body] of bodies) sameClip(body.clip, poseFile(pose));
  const logo = parseLogo(sources.logo, LOGO_FILE);
  sameClip(logo.clip, LOGO_FILE);

  // A direct child of the pose container drawn the same in >= 2 full-body poses is a part.
  const presence = new Map<string, Set<Pose>>();
  for (const [pose, body] of bodies) {
    for (const child of body.children) {
      const key = ser(child);
      let poses = presence.get(key);
      if (!poses) presence.set(key, (poses = new Set()));
      poses.add(pose);
    }
  }
  const partIdByMarkup = new Map<string, string>();
  const parts = new Map<string, string>();
  for (const [pose, body] of bodies) {
    for (const child of body.children) {
      const key = ser(child);
      if (partIdByMarkup.has(key) || (presence.get(key)?.size ?? 0) < 2) continue;
      if (child.attrs.some(([name]) => name === 'id')) throw new Error(`${poseFile(pose)}: shared <${child.tag}> already has an id`);
      const id = `${PART_PREFIX}${partIdByMarkup.size + 1}`;
      partIdByMarkup.set(key, id);
      parts.set(id, ser({ ...child, attrs: [['id', id], ...child.attrs] }));
    }
  }

  const refine = (children: readonly XmlNode[]): { markup: string; used: Set<string> } => {
    const used = new Set<string>();
    const markup = children
      .map((child) => {
        const id = partIdByMarkup.get(ser(child));
        if (id === undefined) return ser(child);
        used.add(id);
        return `<use href="#${id}"/>`;
      })
      .join('');
    return { markup, used };
  };

  const symbols = new Map<Pose, { markup: string; parts: readonly string[] }>();
  for (const pose of POSES) {
    const body = bodies.get(pose);
    if (body) {
      const { markup, used } = refine(body.children);
      const inner = body.rot === '' ? markup : `<g transform="${body.rot}">${markup}</g>`;
      symbols.set(pose, {
        markup: `<symbol id="oli-${pose}" viewBox="${BODY_VIEWBOX}"><g transform="${WRAP}">${inner}</g></symbol>`,
        parts: [...used].sort(byPartNumber),
      });
    } else {
      const children = parsePeek(sources.poses[pose], poseFile(pose));
      symbols.set(pose, {
        markup: `<symbol id="oli-${pose}" viewBox="${PEEK_VIEWBOX}">${children.map(ser).join('')}</symbol>`,
        parts: [],
      });
    }
  }

  const oli = refine(logo.oli);
  const words = `<path class="fo-logo__file" d="${logo.fileD}"/><path class="fo-logo__orca" d="${logo.orcaD}"/>`;
  const sprite: Sprite = {
    clip,
    parts,
    symbols,
    logo: {
      inner: `<g transform="${LOGO_MIRROR}"><g transform="${WRAP}">${oli.markup}</g></g>${words}`,
      viewBox: LOGO_VIEWBOX,
      parts: [...oli.used].sort(byPartNumber),
    },
  };
  assertConsistent(sprite);
  return sprite;
}

/** No duplicate id across clip + parts + symbols + logo, and every reference resolves. */
function assertConsistent(sprite: Sprite): void {
  const markups = [sprite.clip, ...sprite.parts.values(), ...[...sprite.symbols.values()].map((symbol) => symbol.markup), sprite.logo.inner];
  const ids = new Set<string>();
  for (const markup of markups) {
    for (const match of markup.matchAll(/\sid="([^"]*)"/g)) {
      const id = match[1] ?? '';
      if (ids.has(id)) throw new Error(`Oli sprite: duplicate id "${id}"`);
      ids.add(id);
    }
  }
  for (const markup of markups) {
    for (const match of markup.matchAll(/href="#([^"]*)"|url\(#([^)]*)\)/g)) {
      const target = match[1] ?? match[2] ?? '';
      if (!ids.has(target)) throw new Error(`Oli sprite: reference to missing id "${target}"`);
    }
  }
}

// ---- reading ----

const cache = new Map<string, Sprite>();

/** Reads docs/design/assets under `root` (default: the working directory). Memoized per root. */
export function loadSprite(root: string = process.cwd()): Sprite {
  const key = resolve(root);
  const cached = cache.get(key);
  if (cached) return cached;
  const assets = join(key, 'docs', 'design', 'assets');
  const poses = {} as Record<Pose, string>;
  for (const pose of POSES) poses[pose] = readFileSync(join(assets, 'Oli', poseFile(pose)), 'utf8');
  const sprite = buildSprite({ poses, logo: readFileSync(join(assets, 'Logo', LOGO_FILE), 'utf8') });
  cache.set(key, sprite);
  return sprite;
}

// ---- output ----

const utf8 = (text: string) => Buffer.byteLength(text, 'utf8');

function symbolOf(sprite: Sprite, pose: Pose): { markup: string; parts: readonly string[] } {
  const symbol = isPose(pose) ? sprite.symbols.get(pose) : undefined;
  if (!symbol) throw new Error(`unknown Oli pose "${String(pose)}"`);
  return symbol;
}

/** UTF-8 bytes of the <symbol>, the parts it references and oli-clip, uncompressed (limit 4096). */
export function poseBytes(sprite: Sprite, pose: Pose): number {
  const symbol = symbolOf(sprite, pose);
  const partBytes = symbol.parts.reduce((sum, id) => sum + utf8(sprite.parts.get(id) ?? ''), 0);
  return utf8(symbol.markup) + partBytes + utf8(sprite.clip);
}

/** The hidden sprite for a page: oli-clip, the parts the poses and the logo use, then the poses. */
export function spriteMarkup(sprite: Sprite, poses: readonly Pose[]): string {
  const wanted = new Set(poses);
  for (const pose of wanted) symbolOf(sprite, pose);
  const chosen = POSES.filter((pose) => wanted.has(pose));
  const partIds = new Set(sprite.logo.parts);
  for (const pose of chosen) for (const id of symbolOf(sprite, pose).parts) partIds.add(id);
  const partMarkup = [...partIds].sort(byPartNumber).map((id) => sprite.parts.get(id) ?? '');
  const symbolMarkup = chosen.map((pose) => symbolOf(sprite, pose).markup);
  return `<svg class="fo-sprite" aria-hidden="true" focusable="false" width="0" height="0"><defs>${sprite.clip}${partMarkup.join('')}${symbolMarkup.join('')}</defs></svg>`;
}

const escapeAttr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** The inline logo; needs the sprite on the page (its parts and oli-clip). */
export function logoMarkup(sprite: Sprite, options: { className: string; label: string }): string {
  return `<svg class="${escapeAttr(options.className)}" viewBox="${sprite.logo.viewBox}" role="img" aria-label="${escapeAttr(options.label)}">${sprite.logo.inner}</svg>`;
}
