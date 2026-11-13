// One fact, one place (prompt F19a, decision 8; DECISOES § 764 and § 765). On a tool, preset, calculator or QR code page,
// in each language, a recurring fact is said in one block of the page only, and no sentence is copied, near word for word,
// into a second block. Pure functions over the HTML of a page, with problem strings in Portuguese, in the style of
// scripts/lib/conteudo.ts; scripts/gates/conteudo.ts runs them on every page of the four molds (ImageToolPage, PdfToolPage,
// QrTool and CalcTool), and tests/unit/repeticao.test.ts holds the mutants.
//
// What counts (the "units" of a page): the text blocks of the <main> outside the island. The introduction (the lead of a
// calculator), "How to", the specs table with its text, the presets (the #presets part of the specs, or the presets table of
// a calculator), each question of the FAQ (question and answer are one unit, so a fact in two answers is a repetition),
// the privacy note with its "How to check" link, each own block and "How it works" of a calculator, the lead of the related
// tools, and any other text a mold may add. What never counts: the <title> and the meta description (they are in the
// <head>), the H1, the PrivacySeal, the island (#fo-tool-root: the panel and what the Oli says), the breadcrumb, the cards
// (ToolCard and GuideCard), the ads, the footer (it is out of the <main>), the line "Updated" and the signature lines
// ("Reviewed by", "First published").
import { parse, NodeType, type HTMLElement } from 'node-html-parser';
import { QR_ID, type Lang } from '../../src/i18n/routes.ts';
import { IMAGE_PAGES } from '../../src/tools/image/registry.ts';
import { PDF_PAGES } from '../../src/tools/pdf/registry.ts';
import { CALC_PAGES, isBrCalc, isLifeCalc } from '../../src/tools/calc/registry.ts';

/** The kinds of page the rule holds on (decision 8), by the registries: never a hand list. */
export const PAGE_KINDS = ['image-tool', 'image-preset', 'pdf-tool', 'pdf-preset', 'qr', 'calc-money', 'calc-preset', 'calc-br', 'calc-life'] as const;
export type PageKind = (typeof PAGE_KINDS)[number];

/** The kind of a route id, or null for a page out of the rule (a hub, a guide, the home, a legal page). */
export function pageKind(id: string): PageKind | null {
  if (id === QR_ID) return 'qr';
  if (Object.hasOwn(IMAGE_PAGES, id)) return IMAGE_PAGES[id as keyof typeof IMAGE_PAGES].parent ? 'image-preset' : 'image-tool';
  if (Object.hasOwn(PDF_PAGES, id)) return PDF_PAGES[id as keyof typeof PDF_PAGES].parent ? 'pdf-preset' : 'pdf-tool';
  if (Object.hasOwn(CALC_PAGES, id)) return CALC_PAGES[id as keyof typeof CALC_PAGES].parent ? 'calc-preset' : 'calc-money';
  if (isBrCalc(id)) return 'calc-br';
  if (isLifeCalc(id)) return 'calc-life';
  return null;
}

/** What never counts, inside the <main> (decision 8): removed before the units are read. */
export const NEVER_COUNTED = [
  'script',
  'style',
  'noscript',
  'template',
  'svg',
  'nav',
  'h1',
  '.fo-seal',
  '#fo-tool-root',
  '.fo-ad',
  '.fo-updated',
  '[data-updated]',
  '.fo-reviewed',
  'a.fo-tool',
  'a.fo-guidecard',
  '.fo-guidehere',
  '[data-content="author"]',
] as const;

/** A text block of a page that counts. */
export interface Unit {
  /** Where it is: "intro", "how", "specs", "presets", "faq 3", "privacy", "related", "own 1", "works", "other". */
  name: string;
  /** The question, on a unit of the FAQ (the messages quote it). */
  question?: string;
  /** One line per block element (a paragraph, a step, a cell, the question), whitespace collapsed inside each line. */
  lines: string[];
  /**
   * The same text without the labels (headings, the question of the FAQ, table captions and headers): the statements, whose
   * sentences are compared for near duplicates. A heading or a question shares the topic words of the answer, not a fact.
   */
  prose: string[];
}

/** The labels of a block: they name a part or ask, they do not state (left out of `prose`). */
const LABELS = 'h2, h3, h4, h5, h6, summary, caption, thead, th';

const clean = (text: string): string => text.replace(/\s+/g, ' ').trim();
const linesOf = (element: HTMLElement): string[] => element.structuredText.split('\n').map(clean).filter((line) => line !== '');

function unit(name: string, elements: readonly HTMLElement[], question?: string): Unit {
  const prose = elements.flatMap((element) => {
    const copy = parse(element.outerHTML);
    for (const label of copy.querySelectorAll(LABELS)) label.remove();
    return linesOf(copy);
  });
  return { name, ...(question === undefined ? {} : { question }), lines: elements.flatMap(linesOf), prose };
}

/** The roots of the units: a block with data-content (not inside another), the top band and the presets of a calculator. */
function isRoot(element: HTMLElement): boolean {
  return (
    element.hasAttribute('data-content') ||
    (element.classList?.contains('fo-top') ?? false) ||
    (element.tagName === 'SECTION' && element.getAttribute('aria-labelledby') === 'presets')
  );
}

function rootsOf(element: HTMLElement, out: HTMLElement[] = []): HTMLElement[] {
  for (const child of element.childNodes) {
    if (child.nodeType !== NodeType.ELEMENT_NODE) continue;
    const node = child as HTMLElement;
    if (isRoot(node)) out.push(node);
    else rootsOf(node, out);
  }
  return out;
}

/** The units of one root, by its kind. */
function unitsOfRoot(root: HTMLElement, own: { count: number }): Unit[] {
  const block = root.getAttribute('data-content');
  if (block === 'faq') {
    const questions = root.querySelectorAll('details').map((details, index) =>
      unit(`faq ${index + 1}`, [details], clean(details.querySelector('summary')?.structuredText ?? '')),
    );
    for (const details of root.querySelectorAll('details')) details.remove();
    return [...questions, unit('faq', [root])];
  }
  if (block === 'specs') {
    const mark = root.querySelector('#presets');
    if (!mark) return [unit('specs', [root])];
    // The presets part: the #presets heading and everything after it, in the same section.
    const siblings = (mark.parentNode?.childNodes ?? []).filter((node) => node.nodeType === NodeType.ELEMENT_NODE) as HTMLElement[];
    const after = siblings.slice(siblings.indexOf(mark));
    const presets = unit('presets', after);
    for (const element of after) element.remove();
    return [unit('specs', [root]), presets];
  }
  if (block === 'own') {
    own.count += 1;
    return [unit(`own ${own.count}`, [root])];
  }
  if (block) return [unit(block, [root])];
  if (root.classList?.contains('fo-top')) return [unit('intro', [root])];
  return [unit('presets', [root])];
}

/**
 * The units of a page (decision 8): the text blocks of its <main> that count, in the order of the page, with what never
 * counts taken out. A FAQ heading or a related heading alone is a unit too (it says no fact). Text of the <main> out of every
 * known block is the unit "other", so a mold that grows a paragraph is still read.
 */
export function unitsOf(html: string): Unit[] {
  const main = parse(html).querySelector('main');
  if (!main) return [];
  for (const element of main.querySelectorAll(NEVER_COUNTED.join(', '))) element.remove();
  const own = { count: 0 };
  const units: Unit[] = [];
  for (const root of rootsOf(main)) {
    units.push(...unitsOfRoot(root, own));
    root.remove();
  }
  units.push(unit('other', [main]));
  return units.filter((each) => each.lines.length > 0);
}

// ---- The recurring facts (DECISOES § 765) --------------------------------------------------------------------------------

/**
 * Word boundaries that know accents (JavaScript's \b sees ASCII letters only): `<` and `>` in a source stand before and after
 * a word, as in the Portuguese and Spanish rules of scripts/lib/conteudo.ts.
 */
const L = '(?<![\\p{L}\\p{N}])';
const R = '(?![\\p{L}\\p{N}])';
const rx = (source: string): RegExp => new RegExp(source.replaceAll('<', L).replaceAll('>', R), 'iu');

/** A recurring fact: an id, what it says (for the messages) and the patterns that find it, per language. */
export interface Fact {
  id: string;
  /** What the fact says, in Portuguese (the messages of the gate). */
  label: string;
  patterns: Record<Lang, readonly RegExp[]>;
}

/** The same sources for the three languages (numbers, names of formats and of libraries). */
const all = (...sources: string[]): Record<Lang, readonly RegExp[]> => {
  const patterns = sources.map(rx);
  return { en: patterns, pt: patterns, es: patterns };
};
const of = (en: readonly string[], pt: readonly string[], es: readonly string[]): Record<Lang, readonly RegExp[]> => ({
  en: en.map(rx),
  pt: pt.map(rx),
  es: es.map(rx),
});

/**
 * The recurring facts of the baseline sweep (.cache/f19a/scan, 1,153 repetitions on 148 pages), one entry per fact, each
 * with patterns precise enough to fire on the fact and not on the words around it (the list and what was left out are in
 * DECISOES § 765). A pattern is tested on one line of a unit at a time (a paragraph, a step, a cell, a question), so the
 * `[^.]{0,n}` windows stay inside a sentence.
 */
export const FACTS: readonly Fact[] = [
  // The file and the device: where the work happens, and that nothing is sent (the house: the privacy note).
  {
    id: 'not-sent',
    label: 'nada é enviado (o arquivo não sai do aparelho)',
    patterns: of(
      [
        String.raw`<(?:never|not) (?:be )?(?:sent|uploaded)>`,
        String.raw`<nothing (?:you type )?is (?:ever )?(?:sent|uploaded)>`,
        String.raw`<sent (?:to a server|anywhere)>`,
        String.raw`<(?:go|goes) (?:to a server|anywhere)>`,
        String.raw`<no request carries>`,
        String.raw`<(?:does not|never) leaves? (?:your device|the device|it)>`,
        String.raw`<(?:saved|kept|stored) (?:or|nor) sent>`,
      ],
      [
        String.raw`<nunca (?:(?:é|são|foi|foram|será|serão) )?enviad[oa]s?>`,
        String.raw`<(?:não|nem) (?:(?:é|são) )?enviad[oa]s?>`,
        String.raw`<nada (?:do que você digita )?(?:é enviado|vai para)>`,
        String.raw`<(?:vai|vão) para (?:um servidor|lugar nenhum)>`,
        String.raw`<nenhuma requisição leva>`,
        String.raw`<(?:não|nunca) (?:sai|saem) (?:do seu aparelho|do aparelho|dele|dela)>`,
      ],
      [
        String.raw`<(?:nunca|no|ni) se env[ií]an?>`,
        String.raw`<nada (?:de lo que escribes )?se env[ií]a>`,
        String.raw`<(?:ni )?llegan? a (?:un|ning[uú]n) servidor>`,
        String.raw`<(?:va|van) a (?:un servidor|ning[uú]n lado|ninguna parte)>`,
        String.raw`<ninguna solicitud lleva>`,
        String.raw`<(?:no|nunca) salen? (?:de tu dispositivo|del dispositivo|de él|de ella)>`,
        String.raw`<se env[ií]an? a ning[uú]n lugar>`,
      ],
    ),
  },
  {
    id: 'on-device',
    label: 'o trabalho é feito no aparelho, no navegador',
    patterns: of(
      [String.raw`^(?!.*<sav\w*>[^.]*<on your device>).*<(?:on (?:your|the) device|(?:in|inside) (?:your|the) browser)>`, String.raw`<inside the page>`],
      [String.raw`^(?!.*<salv\w*>[^.]*<no seu aparelho>).*<(?:no|dentro do) (?:seu )?(?:aparelho|navegador)>`],
      [String.raw`^(?!.*<guard\w*>[^.]*<en tu dispositivo>).*<(?:en|dentro del?) (?:tu |el )?(?:dispositivo|navegador)>`],
    ),
  },
  // What happens to the photo metadata (the house: the specs table).
  {
    id: 'metadata-gps',
    label: 'os metadados da foto (Exif, GPS) saem do arquivo novo',
    patterns: of(
      [String.raw`<gps>`, String.raw`<exif>`, String.raw`<photo metadata>`, String.raw`<(?:no|without) (?:photo )?metadata>`, String.raw`<leaves? (?:the )?(?:photo )?metadata out>`],
      [String.raw`<gps>`, String.raw`<exif>`, String.raw`<metadados da foto>`, String.raw`<sem (?:os )?metadados>`, String.raw`<metadados de fora>`],
      [String.raw`<gps>`, String.raw`<exif>`, String.raw`<metadatos de la foto>`, String.raw`<sin (?:los )?metadatos>`, String.raw`<omite\w* los metadatos>`, String.raw`<salvo los metadatos>`, String.raw`<no lleva metadatos>`],
    ),
  },
  {
    id: 'kb-1000-bytes',
    label: '1 KB = 1.000 bytes (a leitura menor)',
    patterns: all(
      String.raw`<(?:1|10|100|1[.,]000)(?:[.,]000)+ (?:de )?bytes>`,
      String.raw`<1[.,]024 (?:bytes|kb)>`,
      String.raw`<1[.,]048[.,]576>`,
      String.raw`<[km]b (?:is read as|é lido como|se cuenta como)>`,
    ),
  },
  {
    id: 'already-small',
    label: 'já pequeno, volta o original',
    patterns: of(
      [
        String.raw`<original back>`,
        String.raw`<gives? you back the original>`,
        String.raw`<original comes back>`,
        String.raw`<comes back (?:as it was|unchanged|in its own format)>`,
        String.raw`<already (?:small|fits|under)>`,
        String.raw`<would not be smaller>`,
        String.raw`<(?:never gives? you|instead of) a bigger file>`,
      ],
      [
        String.raw`<(?:o|seu) original de volta>`,
        String.raw`<devolve o original>`,
        String.raw`<volta (?:como estava|sem mudança)>`,
        String.raw`<já (?:cabe|está pequen[oa]|estar pequen[oa])>`,
        String.raw`<não (?:ficar|ficaria) menor>`,
        String.raw`<(?:nunca entrega|em vez de) um arquivo maior>`,
      ],
      [
        String.raw`<(?:tu|el) original de vuelta>`,
        String.raw`<devuelve el original>`,
        String.raw`<vuelve (?:tal como estaba|sin cambios)>`,
        String.raw`<ya (?:cabe|era pequeñ[oa]|pesa menos)>`,
        String.raw`<no (?:queda|quedara|sería|fuera) más pequeñ[oa]>`,
        String.raw`<(?:nunca te da|en lugar de) un archivo más grande>`,
      ],
    ),
  },
  // How the formats are saved (the house: the specs table).
  {
    id: 'png-lossless',
    label: 'o PNG é salvo sem perda',
    patterns: of(
      [String.raw`png[^.]{0,60}<(?:without loss|no loss|loses nothing|lossless)>`],
      [String.raw`png[^.]{0,60}<(?:sem perda|sem perder|não perde|não perder)>`],
      [String.raw`png[^.]{0,60}<(?:sin pérdida|sin perder|no pierde)>`],
    ),
  },
  {
    id: 'jpg-webp-resaved',
    label: 'o JPG e o WebP são salvos de novo',
    patterns: of(
      [String.raw`<jpg and webp (?:are saved again|lose)>`, String.raw`<jpg or (?:a )?webp is saved again>`],
      [String.raw`<jpg e (?:o )?webp (?:são salvos de novo|perdem)>`, String.raw`<jpg ou (?:um )?webp é salvo de novo>`, String.raw`<no jpg e no webp>[^.]{0,40}<se perde>`],
      [String.raw`<jpg y (?:el )?webp (?:se guardan de nuevo|pierden)>`, String.raw`<jpg o (?:un )?webp se guarda de nuevo>`, String.raw`<en jpg y webp se pierde>`],
    ),
  },
  {
    id: 'transparency-white',
    label: 'a transparência vira branco no JPG',
    patterns: of(
      [String.raw`transparen[^.]{0,60}<white>`, String.raw`<(?:jpg has no|jpg cannot store|cannot store) transparency>`, String.raw`<fills? (?:those areas|it) with white>`, String.raw`<(?:it|that) turns white>`],
      [String.raw`transpar[êe]n[^.]{0,60}<branc[oa]s?>`, String.raw`<jpg não (?:tem|guarda) transparência>`, String.raw`<preenche[^.]{0,40}com branco>`],
      [String.raw`transparen[^.]{0,60}<blanc[oa]s?>`, String.raw`<jpg no (?:tiene|puede guardar) transparencia>`, String.raw`<rellena[^.]{0,40}(?:de|con) blanco>`],
    ),
  },
  {
    id: 'transparency-kept',
    label: 'o PNG e o WebP mantêm a transparência',
    patterns: of(
      [String.raw`<keeps? (?:their |its |the )?transparen`, String.raw`<png keeps it>`, String.raw`<to keep the transparen`, String.raw`<transparency you want to keep>`],
      [String.raw`<mant(?:ém|êm|er) a transpar`, String.raw`<transparência que (?:você )?quer manter>`],
      [String.raw`<conserva(?:n|r)? (?:su |la )?transparencia>`, String.raw`<png la conserva>`, String.raw`<transparencia que quieres conservar>`],
    ),
  },
  // The batch and the download (the house: the specs table).
  {
    id: 'batch-zip',
    label: 'vários arquivos vêm juntos num ZIP',
    patterns: all(String.raw`<zip>`),
  },
  {
    id: 'batch-no-limit',
    label: 'sem limite de arquivos no lote',
    patterns: of(
      [String.raw`<no limit on the number>`, String.raw`<as many as you like>`, String.raw`<sets no limit>`],
      [String.raw`<sem limite de (?:arquivos|imagens|fotos|pdfs)>`, String.raw`<quant[oa]s (?:você )?quiser>`, String.raw`<não (?:põe|tem|coloca) limite>`],
      [String.raw`<sin l[ií]mite de (?:archivos|imágenes|fotos|pdf)>`, String.raw`<(?:tod[oa]s )?(?:los|las) que quieras>`, String.raw`<cuant[oa]s quieras>`, String.raw`<no pone l[ií]mite>`],
    ),
  },
  {
    id: 'original-untouched',
    label: 'o original não muda',
    patterns: of(
      [String.raw`<original(?: files?)? (?:stays? untouched|is never changed|are never changed|is not changed|stays as it was|keeps all|keeps every)>`, String.raw`<never changes yours>`],
      [String.raw`<original (?:continua intacto|fica como era|fica com todas)>`, String.raw`<originais continuam intactos>`, String.raw`<origina(?:l|is) (?:não|nunca) (?:muda|mudam|é alterado|são alterados)>`],
      [String.raw`<original(?:es)? no se tocan?>`, String.raw`<original(?:es)? (?:no|nunca) (?:se modifican?|cambian?)>`, String.raw`<original queda como estaba>`, String.raw`<original (?:conserva todas|las conserva)>`],
    ),
  },
  {
    id: 'heic-avif-converters',
    label: 'HEIC e AVIF passam antes pelos conversores',
    patterns: of(
      [String.raw`<heic to jpg (?:first|or avif to jpg|and avif to jpg)>`, String.raw`<avif to jpg first>`, String.raw`<(?:a|the) heic into a jpg>`],
      [String.raw`<heic para jpg (?:primeiro|ou (?:a )?avif para jpg|e (?:a )?avif para jpg)>`, String.raw`<passam antes pela ferramenta heic>`, String.raw`<transforme o heic em jpg>`, String.raw`<(?:antes|primeiro)>[^.]{0,40}<heic para jpg>`],
      [String.raw`<heic a jpg (?:primero|o (?:a )?avif a jpg|y (?:a )?avif a jpg)>`, String.raw`<pasan antes por heic a jpg>`, String.raw`<convierte el heic en jpg>`, String.raw`<(?:antes|primero)>[^.]{0,40}<heic a jpg>`],
    ),
  },
  {
    id: 'orientation',
    label: 'a orientação da foto é aplicada',
    patterns: of(
      [String.raw`<orientation (?:is )?applied>`, String.raw`<no orientation tag>`, String.raw`<photo orientation>`],
      [String.raw`<orientação da foto>`, String.raw`<marcação de orientação>`],
      [String.raw`<orientación de la foto>`, String.raw`<etiqueta de orientación>`],
    ),
  },
  {
    id: 'free-no-account',
    label: 'grátis e sem conta',
    patterns: of(
      [String.raw`<for free>`, String.raw`<free to use>`, String.raw`<free of charge>`, String.raw`<no account>`, String.raw`<without (?:an |creating an )?account>`, String.raw`<no sign-?ups?>`, String.raw`<no registration>`],
      [String.raw`<de graça>`, String.raw`<grátis>`, String.raw`<gratuit[oa]s?>`, String.raw`<sem (?:criar )?(?:conta|cadastro)>`],
      [String.raw`<gratis>(?!\s*\?)`, String.raw`<gratuit[oa]s?>`, String.raw`<sin (?:crear una )?(?:cuenta|registro)>`],
    ),
  },
  // The PDF tools (the house: the specs table).
  {
    id: 'pdf-kept',
    label: 'campos de formulário, links e marcadores continuam',
    patterns: of(
      [
        String.raw`<(?:form fields|forms|bookmarks|links)>[^.]{0,80}<(?:stay|stays|are kept|kept|keep working|still work|still lead|keep their place|survive)>`,
        String.raw`<keeps? (?:the )?(?:form fields|bookmarks)>`,
      ],
      [
        String.raw`<(?:campos de formulário|formulários|marcadores|links)>[^.]{0,80}<(?:ficam|continuam (?:funcionando|levando|apontando|no lugar|como estavam)|se mantêm|funcionam)>`,
        String.raw`<(?:mantém|fica com) (?:os )?(?:campos de formulário|marcadores)>`,
      ],
      [String.raw`<(?:campos de formulario|formularios|marcadores|enlaces)>[^.]{0,80}<(?:se conservan|se quedan|quedan como|siguen)>`, String.raw`<conserva (?:los )?(?:campos de formulario|marcadores)>`],
    ),
  },
  {
    id: 'one-pdf-at-a-time',
    label: 'um PDF por vez',
    patterns: of([String.raw`<one pdf at a time>`], [String.raw`<um pdf (?:por|de cada) vez>`], [String.raw`<un (?:solo )?pdf (?:a la|cada) vez>`]),
  },
  {
    id: 'unlock-link',
    label: 'PDF com senha ou restrição recusado, com link para Desbloquear PDF',
    patterns: of([String.raw`<link to unlock pdf>`], [String.raw`<link para (?:o )?desbloquear pdf>`], [String.raw`<enlace a desbloquear pdf>`]),
  },
  {
    id: 'xfa',
    label: 'a camada XFA sai',
    patterns: all(String.raw`<xfa>`),
  },
  {
    id: 'no-data-added',
    label: 'a Oli não acrescenta data, produtor nem nada do aparelho',
    patterns: of(
      [String.raw`<adds no (?:date|producer)>`, String.raw`<(?:nothing|anything|none) from your device>`, String.raw`<no date or device information>`],
      [String.raw`<não acrescenta (?:data|nada)>`, String.raw`<nada do seu aparelho>`],
      [String.raw`<no agrega (?:fecha|nada)>`, String.raw`<(?:nada|ninguno|ninguna) de tu dispositivo>`],
    ),
  },
  {
    id: 'pdfjs',
    label: 'o PDF.js desenha as páginas',
    patterns: all(String.raw`<pdf\.js>`),
  },
  {
    id: 'page-ranges',
    label: 'os intervalos de páginas como 1-3, 5',
    patterns: all(String.raw`<\d+-\d+, \d+>`),
  },
  {
    id: 'resolution-ppi',
    label: '72, 150 ou 300 ppi',
    patterns: all(String.raw`<72 pp[ip]>`),
  },
  {
    id: 'megapixels',
    label: 'página acima de 16,7 megapixels sai numa resolução menor',
    patterns: all(String.raw`<16[.,]7 megap`),
  },
  // The QR code generator (the house: the specs table, and the privacy note for the text and the link).
  {
    id: 'qr-static',
    label: 'o código guarda o texto: sem link curto, sem validade',
    patterns: of(
      // "A short link like fileorca.com/" (the size of the grid) is not this fact: only "no short link", "not a short link".
      [String.raw`<(?:no|not a) short link>`, String.raw`<expir`, String.raw`<holds? (?:your|the) (?:link|text)(?: or text)? itself>`],
      [String.raw`<link encurtado>`, String.raw`<(?:sem|não(?: é)? um|nenhum) link curto>`, String.raw`<expira`, String.raw`<validade>`, String.raw`<guarda (?:o próprio|o seu) (?:link|texto)>`],
      [String.raw`<enlace acortado>`, String.raw`<(?:sin|no(?: es)? un|ningún) enlace corto>`, String.raw`<(?:caducan?|vencen)>`, String.raw`<vencimiento>`, String.raw`<guarda (?:el propio|tu) (?:enlace|texto)>`, String.raw`<(?:enlace|texto) tal cual>`],
    ),
  },
  {
    id: 'qr-error-correction',
    label: 'a correção de erros H deixa lugar para a Oli',
    patterns: of([String.raw`<error correction>`], [String.raw`<correção de erros?>`], [String.raw`<corrección de errores>`]),
  },
  {
    id: 'qr-any-size',
    label: 'o SVG fica nítido em qualquer tamanho',
    patterns: of([String.raw`<at any size>`], [String.raw`<em qualquer tamanho>`], [String.raw`<(?:a|en) cualquier tamaño>`]),
  },
  {
    id: 'qr-scan-first',
    label: 'escaneie o código antes de imprimir',
    patterns: of([String.raw`<scan[^.]{0,40}<before (?:you )?(?:share or )?print`], [String.raw`<escaneie[^.]{0,60}<antes de (?:compartilhar ou )?imprimir`], [String.raw`<escanea[^.]{0,60}<antes de (?:compartirlo o )?imprimir`]),
  },
  {
    id: 'qr-text-private',
    label: 'o texto não vai para o endereço, para eventos, cookies nem armazenamento',
    patterns: of([String.raw`<analytics event>`], [String.raw`<evento de (?:medição|análise|analytics)>`], [String.raw`<evento de (?:analítica|medición|análisis)>`]),
  },
  {
    id: 'qr-never-opens',
    label: 'o FileOrca nunca abre o link digitado',
    patterns: of([String.raw`<never opens>`], [String.raw`<nunca abre>`], [String.raw`<nunca abre>`]),
  },
  // The calculators (the house: the privacy note for the numbers, "How it works" for the method).
  {
    id: 'calc-numbers',
    label: 'os números ficam no aparelho (depois do #)',
    patterns: of(
      [String.raw`<numbers stay on your device>`, String.raw`<nothing you type is sent>`, String.raw`<(?:after|behind) the #`, String.raw`<part of the address your browser never sends>`],
      [String.raw`<seus números ficam no seu aparelho>`, String.raw`<nada do que você digita>`, String.raw`<depois d[oa] #`],
      [String.raw`<tus números se quedan en tu dispositivo>`, String.raw`<nada de lo que escribes>`, String.raw`<después del #`],
    ),
  },
  {
    id: 'rounded-to-cent',
    label: 'os juros e a parcela são arredondados ao centavo',
    patterns: of([String.raw`<rounded (?:up )?to the (?:nearest )?cent>`], [String.raw`<arredondad[oa]s? (?:para cima )?(?:ao|para o) centavo>`], [String.raw`<redondead[oa]s? (?:hacia arriba )?al centavo>`]),
  },
  {
    id: 'pmi-78-80',
    label: 'o PMI cai a 80 % e termina a 78 %',
    patterns: all(String.raw`<78 ?%`),
  },
  {
    id: 'rules-28-36',
    label: 'as regras de 28 % e 36 %',
    patterns: all(String.raw`<28 ?%[^.]{0,40}<36 ?%`),
  },
  {
    id: 'year-365',
    label: 'o ano de 365 dias',
    patterns: of([String.raw`<365 days>`, String.raw`<365-day>`], [String.raw`<365 dias>`], [String.raw`<365 días>`]),
  },
  {
    id: 'talk-to-professional',
    label: 'fale com um médico ou profissional de saúde',
    patterns: of(
      [String.raw`<(?:talk|speak) (?:with|to) (?:a |your )?(?:doctor|health professional|nurse|midwife|health care provider)>`],
      [String.raw`<(?:fale|converse) com (?:um |o seu |seu )?(?:médico|profissional de saúde)>`],
      [String.raw`<(?:habla|consulta) con (?:un |tu )?(?:médico|profesional de (?:la )?salud)>`],
    ),
  },
];

/**
 * A fact that is the page's own subject is not a repetition: the Remove EXIF data page is about the photo metadata, as the
 * Compress image page is about compressing (DECISOES § 765). Keyed by route id.
 */
export const OWN_SUBJECT: Readonly<Record<string, readonly string[]>> = {
  'remove-exif-data': ['metadata-gps'],
};

/** The facts a line says, by id, in the language of the page. */
export function factsInLine(line: string, lang: Lang, facts: readonly Fact[] = FACTS): string[] {
  return facts.filter((fact) => fact.patterns[lang].some((pattern) => pattern.test(line))).map((fact) => fact.id);
}

/** Where each fact is said: fact id -> the names of the units, in the order of the page. */
export function factPlaces(units: readonly Unit[], lang: Lang, facts: readonly Fact[] = FACTS): Map<string, string[]> {
  const places = new Map<string, string[]>();
  for (const unit of units) {
    const found = new Set(unit.lines.flatMap((line) => factsInLine(line, lang, facts)));
    for (const id of found) places.set(id, [...(places.get(id) ?? []), unit.name]);
  }
  return places;
}

// ---- Near-identical sentences ------------------------------------------------------------------------------------------

/** A sentence shorter than this (in normalized words) is never a near duplicate: short lines repeat by chance. */
export const MIN_SENTENCE_WORDS = 8;
/**
 * Dice coefficient of the word bigrams of two sentences at or above which they are near identical (DECISOES § 765). Measured
 * on the baseline (148 pages, 4,846 sentences of 8 words or more): every pair from 0.45 up is the same statement said twice
 * (often a short sentence copied inside a longer one, which the bigrams score at about half); below, pairs that only share the
 * topic words appear ("La tasa que paga una cuenta puede cambiar" and "La tasa que paga tu cuenta de ahorros", 0.43), and
 * under 0.4 unrelated sentences of the same page.
 */
export const NEAR_DUPLICATE = 0.45;

/** Lower case, no accents, no punctuation, one space between words. */
export function normalizeWords(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(' ')
    .filter((word) => word !== '');
}

/** The sentences of a line: split after . ! ? or : followed by a space and a capital (or ¿ ¡ and an opening quote). */
export function sentencesOf(line: string): string[] {
  return line
    .split(/(?<=[.!?])\s+(?=[\p{Lu}\p{N}¿¡"“(])/u)
    .map(clean)
    .filter((sentence) => sentence !== '');
}

function bigrams(words: readonly string[]): Map<string, number> {
  const out = new Map<string, number>();
  for (let index = 1; index < words.length; index += 1) {
    const key = `${words[index - 1]} ${words[index]}`;
    out.set(key, (out.get(key) ?? 0) + 1);
  }
  return out;
}

/** Dice coefficient of the word bigrams (as multisets) of two normalized sentences: 1 for the same words in the same order. */
export function similarity(a: readonly string[], b: readonly string[]): number {
  const left = bigrams(a);
  const right = bigrams(b);
  let shared = 0;
  for (const [key, count] of left) shared += Math.min(count, right.get(key) ?? 0);
  const total = Math.max(a.length - 1, 0) + Math.max(b.length - 1, 0);
  return total === 0 ? 0 : (2 * shared) / total;
}

/** Two sentences in different units of a page that say the same thing in nearly the same words. */
export interface NearDuplicate {
  units: [string, string];
  sentences: [string, string];
  score: number;
}

export function nearDuplicates(units: readonly Unit[], threshold = NEAR_DUPLICATE): NearDuplicate[] {
  const sentences = units.flatMap((each) =>
    each.prose
      .flatMap(sentencesOf)
      .map((text) => ({ unit: each.name, text, words: normalizeWords(text) }))
      .filter((sentence) => sentence.words.length >= MIN_SENTENCE_WORDS),
  );
  const out: NearDuplicate[] = [];
  for (let i = 0; i < sentences.length; i += 1) {
    for (let j = i + 1; j < sentences.length; j += 1) {
      const a = sentences[i];
      const b = sentences[j];
      if (!a || !b || a.unit === b.unit) continue;
      const score = similarity(a.words, b.words);
      if (score >= threshold) out.push({ units: [a.unit, b.unit], sentences: [a.text, b.text], score });
    }
  }
  return out;
}

// ---- The rule ------------------------------------------------------------------------------------------------------------

/** A unit as the messages name it: the FAQ units carry their question. */
function unitLabel(unit: Unit): string {
  return unit.question ? `${unit.name} ("${unit.question}")` : unit.name;
}

/** The facts said in more than one unit of a page: fact id -> the units (the page's own subject left out). */
export function repeatedFacts(units: readonly Unit[], lang: Lang, id = '', facts: readonly Fact[] = FACTS): Map<string, string[]> {
  const own = OWN_SUBJECT[id] ?? [];
  const out = new Map<string, string[]>();
  for (const [fact, places] of factPlaces(units, lang, facts)) {
    if (places.length > 1 && !own.includes(fact)) out.set(fact, places);
  }
  return out;
}

/**
 * Rule 8 (F19a, decision 8): one fact, one place. A recurring fact (FACTS) in more than one unit of the page fails, and so do
 * two sentences of different units whose words are near identical (NEAR_DUPLICATE). The problems are in Portuguese, without
 * the path (the gate adds it): one per fact and one per pair of sentences. `id` is the route id of the page (OWN_SUBJECT).
 */
export function checkRepetition(html: string, lang: Lang, id = '', facts: readonly Fact[] = FACTS): string[] {
  const units = unitsOf(html);
  const byName = new Map(units.map((unit) => [unit.name, unit]));
  const named = (name: string): string => {
    const unit = byName.get(name);
    return unit ? unitLabel(unit) : name;
  };
  const problems: string[] = [];
  for (const [factId, places] of repeatedFacts(units, lang, id, facts)) {
    const fact = facts.find((candidate) => candidate.id === factId);
    problems.push(`o fato "${fact?.label ?? factId}" (${factId}) aparece em ${places.length} blocos: ${places.map(named).join(', ')}`);
  }
  for (const pair of nearDuplicates(units)) {
    problems.push(`frase quase igual (${Math.round(pair.score * 100)}%) em ${named(pair.units[0])} e ${named(pair.units[1])}: "${pair.sentences[0]}" / "${pair.sentences[1]}"`);
  }
  return problems;
}
