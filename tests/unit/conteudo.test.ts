import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  CALC_BLOCKS,
  CALC_PRIVACY_PHRASE,
  CALC_PRIVACY_PHRASES,
  CLAIMS,
  CLAIMS_BY_LANG,
  CONTENT_BLOCKS,
  PDF_RULES,
  MAX_RELATED_CARDS,
  MIN_ANSWER_CHARS,
  PDF_MODES,
  PDF_SECRETS,
  PLACEHOLDERS,
  calcComparisonPaths,
  checkCalcPage,
  checkPdfHub,
  checkPdfPage,
  checkPresetPage,
  checkSite,
  checkToolPage,
  comparisonPaths,
  findClaims,
  findPlaceholders,
  isCalcPage,
  isImagePage,
  isNotFoundPath,
  isPdfPage,
  normalizeText,
  pathOfFile,
  type ContentBlock,
} from '../../scripts/lib/conteudo.ts';
import { allPages, fileForPath } from '../../scripts/lib/dist.ts';
import { LANGS, ROUTES, languagesOf, routeById, type Lang } from '../../src/i18n/routes.ts';
import enCommon from '../../src/i18n/en/common.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { IMAGE_PAGES, IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { CALC_PAGES, CALC_PRESET_IDS, isBrCalc, isLifeCalc } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_PAGES, PDF_TOOL_IDS, type PdfToolId } from '../../src/tools/pdf/registry.ts';
import { FILE_GUIDES, isFileGuide } from '../../src/tools/guides/registry.ts';
import { FILLER, MAX_GUIDE_WORDS, MIN_GUIDE_WORDS, checkFileGuide, findFiller, guideWords } from '../../scripts/lib/file-guides.ts';

// The checker is proven on small pages built here: one that passes, then one break at a time.
const faq = (count: number, tag = 'Q'): string =>
  Array.from({ length: count }, (_, i) => `<details><summary>${tag} ${i + 1}?</summary><div><p>Answer ${tag} ${i + 1}.</p></div></details>`).join('');

const BLOCKS: Record<ContentBlock, string> = {
  how: '<section data-content="how"><h2>How to</h2><ol><li>Drop the photos</li><li>Pick an option</li><li>Download the result</li></ol></section>',
  specs:
    '<section data-content="specs"><table><thead><tr><th>Setting</th><th>Value</th></tr></thead><tbody><tr><td>Output</td><td>Same format</td></tr></tbody></table></section>',
  faq: `<section data-content="faq"><div class="fo-faq">${faq(4)}</div></section>`,
  privacy: '<section data-content="privacy"><p>Your files never leave your device. Nothing is uploaded.</p></section>',
  related: '<section data-content="related"><ul><li><a href="/resize-image/">Resize image</a></li></ul></section>',
};

function page(blocks: Partial<Record<ContentBlock, string>> = {}, head = '<title>Compress image | FileOrca</title>'): string {
  const all = { ...BLOCKS, ...blocks };
  return `<!doctype html><html><head>${head}</head><body><main><h1>Compress image</h1>${CONTENT_BLOCKS.map((name) => all[name]).join('')}</main></body></html>`;
}

const without = (name: ContentBlock): string => page().replace(`data-content="${name}"`, 'data-x="y"');

// A file guide (F5b), built the way FileGuideView renders one: the blocks in order and `words` words of its own text.
const GUIDE_SENTENCE = 'The photo goes into the tool and comes back lighter than it was.';
function guidePage(options: { words?: number; tool?: string; toolPath?: string; extra?: string; edit?: (html: string) => string } = {}): string {
  const sentences = Math.ceil((options.words ?? 900) / 13);
  const text = Array.from({ length: sentences }, () => GUIDE_SENTENCE).join(' ');
  const html = `<!doctype html><html><head><title>A guide | FileOrca</title><meta name="description" content="A guide to a tool."></head><body><main>
    <nav aria-label="Breadcrumb"><ol class="fo-crumbs"><li><a href="/">Home</a></li><li><span aria-current="page">A guide</span></li></ol></nav>
    <div class="fo-top fo-top--calc" data-guide-text><h1 class="fo-h1">A guide</h1><p class="fo-lead">What does the tool do?</p>
    <p class="fo-reviewed">Reviewed by Victor on <time datetime="2026-11-01">November 1, 2026</time>. First published <time datetime="2026-11-01">November 1, 2026</time>.</p></div>
    <div class="fo-prose fo-guide" data-guide-text><p>${text}</p></div>
    ${options.tool ?? '<div id="fo-tool-root" data-props="{}"><div class="fo-tool-island"></div></div>'}
    <p class="fo-guide__open"><a href="${options.toolPath ?? '/heic-to-jpg/'}">Open the HEIC to JPG tool</a></p>
    <section data-guide-text><h2>More</h2><p>${options.extra ?? 'More text.'}</p></section>
    <div class="fo-ad fo-ad--content"><span class="fo-ad__label">Advertisements</span></div>
    <section data-content="measured"><h2>What we measured</h2><div class="fo-table-wrap"><table><tbody><tr><th>Photo</th><td>1 MB</td></tr></tbody></table></div>
    <p class="fo-reviewed">Measured on November 1, 2026.</p></section>
    <section data-content="sources"><h2>Sources</h2><ul><li><a href="https://support.apple.com/en-us/116944">Apple</a>. Read on <time datetime="2026-11-01">November 1, 2026</time>.</li></ul></section>
    <section data-content="related"><h2>Related</h2><ul class="fo-grid"><li><a class="fo-tool" href="/compress-image/">Compress image</a></li></ul></section>
  </main></body></html>`;
  return options.edit ? options.edit(html) : html;
}

describe('portão de conteúdo: blocos das páginas de ferramenta', () => {
  it('accepts a complete page', () => {
    expect(checkToolPage(page())).toEqual([]);
  });

  it('requires each of the five blocks', () => {
    for (const name of CONTENT_BLOCKS) expect(checkToolPage(without(name)).join('\n'), name).toMatch(new RegExp(`sem o bloco ${name}`));
  });

  it('how: needs an ordered list with at least 3 steps', () => {
    const two = '<section data-content="how"><ol><li>Drop</li><li>Download</li></ol></section>';
    expect(checkToolPage(page({ how: two })).join()).toMatch(/how tem 2 passo/);
    const bullets = '<section data-content="how"><ul><li>Drop</li><li>Pick</li><li>Download</li></ul></section>';
    expect(checkToolPage(page({ how: bullets })).join()).toMatch(/how não tem lista ordenada/);
    const empty = '<section data-content="how"><ol><li>Drop</li><li>Pick</li><li> </li></ol></section>';
    expect(checkToolPage(page({ how: empty })).join()).toMatch(/how tem 2 passo/);
    const nested = '<section data-content="how"><ol><li>Drop<ol><li>a</li><li>b</li></ol></li></ol></section>';
    expect(checkToolPage(page({ how: nested })).join()).toMatch(/how tem 2 passo/);
  });

  it('how: the attribute can sit on the list itself', () => {
    const onList = '<ol data-content="how"><li>Drop</li><li>Pick</li><li>Download</li></ol>';
    expect(checkToolPage(page({ how: onList }))).toEqual([]);
  });

  it('specs: needs a table with at least one body row', () => {
    expect(checkToolPage(page({ specs: '<section data-content="specs"><p>Same format.</p></section>' })).join()).toMatch(/specs não tem tabela/);
    const headerOnly = '<section data-content="specs"><table><thead><tr><th>Setting</th><th>Value</th></tr></thead></table></section>';
    expect(checkToolPage(page({ specs: headerOnly })).join()).toMatch(/specs não tem linha de corpo/);
    const emptyRow = '<section data-content="specs"><table><tbody><tr><td></td><td> </td></tr></tbody></table></section>';
    expect(checkToolPage(page({ specs: emptyRow })).join()).toMatch(/specs não tem linha de corpo/);
  });

  it('specs: the attribute can sit on a table whose rows have no <tbody>', () => {
    const onTable = '<table data-content="specs"><tr><th>Output</th></tr><tr><td>Same format</td></tr></table>';
    expect(checkToolPage(page({ specs: onTable }))).toEqual([]);
  });

  it('faq: needs at least 4 questions with an answer', () => {
    const three = `<section data-content="faq">${faq(3)}</section>`;
    expect(checkToolPage(page({ faq: three })).join()).toMatch(/faq tem 3 pergunta/);
    const noSummary = `<section data-content="faq">${faq(3)}<details><div><p>An answer without a question.</p></div></details></section>`;
    expect(checkToolPage(page({ faq: noSummary })).join()).toMatch(/faq tem 3 pergunta/);
    const noAnswer = `<section data-content="faq">${faq(3)}<details><summary>Is there an answer?</summary></details></section>`;
    expect(checkToolPage(page({ faq: noAnswer })).join()).toMatch(/faq tem 3 pergunta/);
    const five = `<section data-content="faq">${faq(5)}</section>`;
    expect(checkToolPage(page({ faq: five }))).toEqual([]);
  });

  it('privacy: needs real text', () => {
    expect(checkToolPage(page({ privacy: '<section data-content="privacy"></section>' })).join()).toMatch(/privacy tem 0 caractere/);
    expect(checkToolPage(page({ privacy: '<section data-content="privacy"><p>Private.</p></section>' })).join()).toMatch(/privacy tem 8 caractere/);
  });

  it('related: needs at least one link', () => {
    expect(checkToolPage(page({ related: '<section data-content="related"><p>Resize image</p></section>' })).join()).toMatch(/related não tem nenhum link/);
    expect(checkToolPage(page({ related: '<section data-content="related"><a>Resize image</a></section>' })).join()).toMatch(/related não tem nenhum link/);
    expect(checkToolPage(page({ related: '<section data-content="related"><a href="#top">Top</a></section>' })).join()).toMatch(/related não tem nenhum link/);
  });

  it('reads the visible text only: scripts do not count as a block', () => {
    const hidden = page().replace(BLOCKS.privacy, '<section data-content="privacy"><script>var note = "Your files never leave your device. Nothing is uploaded.";</script></section>');
    expect(checkToolPage(hidden).join()).toMatch(/privacy tem 0 caractere/);
  });
});

describe('portão de conteúdo: blocos próprios de um preset', () => {
  // The parent and a sibling share the privacy note and the related grid; each page has its own steps,
  // specs and questions, the way the preset pages are written.
  const own = (tag: string, size: string): Partial<Record<ContentBlock, string>> => ({
    how: `<section data-content="how"><ol><li>Drop photos for ${tag}</li><li>Wait for the ${size} limit</li><li>Download the ${tag} files</li></ol></section>`,
    specs: `<section data-content="specs"><table><tbody><tr><td>Limit</td><td>${size}</td></tr></tbody></table></section>`,
    faq: `<section data-content="faq">${faq(4, tag)}</section>`,
  });
  const parent = page();
  const sibling = page(own('one megabyte', '1000000 bytes'));
  const others = { '/compress-image/': parent, '/compress-image/to-1mb/': sibling };

  it('accepts a preset with three blocks of its own', () => {
    expect(checkPresetPage(page(own('hundred kilobytes', '100000 bytes')), others)).toEqual([]);
  });

  it('refuses a preset with only two blocks of its own', () => {
    const problems = checkPresetPage(page({ ...own('hundred kilobytes', '100000 bytes'), faq: BLOCKS.faq }), others);
    expect(problems.join()).toMatch(/só 2 bloco\(s\) próprio\(s\) \(how, specs\)/);
    expect(problems.join()).toMatch(/faq \(igual em \/compress-image\/\)/);
  });

  it('refuses a preset that copies its parent or a sibling', () => {
    expect(checkPresetPage(parent, others).join()).toMatch(/só 0 bloco/);
    const problems = checkPresetPage(page({ ...own('hundred kilobytes', '100000 bytes'), how: sibling.match(/<section data-content="how">.*?<\/section>/)?.[0] ?? '' }), others);
    expect(problems.join()).toMatch(/how \(igual em \/compress-image\/to-1mb\/\)/);
  });

  it('compares text without case or spacing, and keeps the digits', () => {
    const loud = '<section data-content="how"><ol><li>DROP   THE PHOTOS</li><li>Pick an  option</li><li>Download the\n result</li></ol></section>';
    expect(checkPresetPage(page({ ...own('hundred kilobytes', '100000 bytes'), how: loud }), others).join()).toMatch(/how \(igual em/);
    expect(normalizeText('  Up TO\n 100 KB ')).toBe('up to 100 kb');
    const digits = checkPresetPage(page(own('one megabyte', '100000 bytes')), others);
    expect(digits.join()).not.toMatch(/specs \(igual/);
  });

  it('counts a block once when blocks are nested', () => {
    const wrapped = `<div data-content="how">${own('hundred kilobytes', '100000 bytes').how}${own('hundred kilobytes', '100000 bytes').specs}</div>`;
    const problems = checkPresetPage(page({ how: wrapped, specs: '', faq: BLOCKS.faq, privacy: BLOCKS.privacy, related: BLOCKS.related }), others);
    expect(problems.join()).toMatch(/só 1 bloco\(s\) próprio\(s\) \(how\)/);
  });
});

describe('portão de conteúdo: o site inteiro', () => {
  const site = (path: string, title: string, description: string, body = '<p>Some text.</p>') => ({
    path,
    html: `<html><head><title>${title}</title><meta name="description" content="${description}"></head><body>${body}</body></html>`,
  });

  it('accepts pages with their own title and description', () => {
    expect(checkSite([site('/a/', 'A | FileOrca', 'About a'), site('/b/', 'B | FileOrca', 'About b')])).toEqual([]);
  });

  it('refuses a title shared by two pages', () => {
    const problems = checkSite([site('/a/', 'Same | FileOrca', 'About a'), site('/b/', 'same |  FileOrca', 'About b')]);
    expect(problems.join()).toMatch(/título repetido em \/a\/, \/b\//);
    expect(problems.join()).not.toMatch(/descrição repetida/);
  });

  it('refuses a description shared by two pages', () => {
    const problems = checkSite([site('/a/', 'A | FileOrca', 'Same text'), site('/b/', 'B | FileOrca', 'Same text')]);
    expect(problems.join()).toMatch(/descrição repetida em \/a\/, \/b\//);
    expect(problems.join()).not.toMatch(/título repetido/);
  });

  it('does not match pages that have no description', () => {
    expect(checkSite([site('/a/', 'A | FileOrca', ''), site('/b/', 'B | FileOrca', '')])).toEqual([]);
  });

  const SAMPLES: Record<string, string> = {
    'coming soon': 'This tool is Coming soon.',
    'em breve': 'Esta ferramenta chega em breve.',
    'próximamente': 'Próximamente tendremos más.',
    lorem: 'Lorem dolor sit amet.',
    ipsum: 'Text ipsum text.',
    TODO: 'TODO: write this answer.',
    TBD: 'Price: TBD',
    'placeholder text': 'This is placeholder text.',
    'más adelante': 'Lo veremos más adelante.',
    'more tools are coming': 'More tools are coming.',
    'mais ferramentas estão a caminho': 'Mais ferramentas estão a caminho.',
    'vienen más en camino': 'Vienen más en camino.',
  };

  it('refuses each placeholder wording in the visible text', () => {
    expect(Object.keys(SAMPLES).sort()).toEqual(PLACEHOLDERS.map((placeholder) => placeholder.label).sort());
    for (const [label, text] of Object.entries(SAMPLES)) {
      const problems = checkSite([site('/a/', 'A | FileOrca', 'About a', `<main><p>${text}</p></main>`)]);
      expect(problems.join('\n'), label).toContain(`/a/: texto provisório "${label}"`);
    }
  });

  it('finds the wording across markup and line breaks', () => {
    expect(findPlaceholders('<body><p>Coming <b>soon</b></p></body>')).toEqual(['coming soon']);
    expect(findPlaceholders('<body><p>Coming\n   soon</p></body>')).toEqual(['coming soon']);
  });

  it('ignores attributes, scripts, styles, comments and ordinary words', () => {
    const quiet = [
      '<input placeholder="Coming soon" aria-label="Em breve">',
      '<img alt="lorem ipsum" src="/a.png">',
      '<script type="application/ld+json">{"description":"Coming soon, TODO"}</script>',
      '<style>/* lorem */ .a { color: red }</style>',
      '<noscript>TODO enable scripts</noscript>',
      '<!-- TODO remove this -->',
      '<p>Todo el sitio funciona en tu navegador. Todo arquivo fica no aparelho.</p>',
      '<p>The todos list, the tbdx column and a dolorem ipsumx mix.</p>',
    ].join('');
    expect(findPlaceholders(`<html><head><title>Coming soon</title></head><body>${quiet}</body></html>`)).toEqual([]);
  });
});

/** The privacy note of a fake calculator page in each language: the phrase of CALC_PRIVACY_PHRASES and one more sentence. */
const CALC_PRIVACY_NOTE: Record<Lang, string> = {
  en: 'Your numbers stay on your device. Nothing you type is sent anywhere.',
  pt: 'Seus números ficam no seu aparelho. Nada do que você digita é enviado.',
  es: 'Tus números se quedan en tu dispositivo. Nada de lo que escribes se envía.',
};

/** A calculator page with the four blocks of the F4 (how, faq, privacy, related), each with the page's own tag. */
function calcPage(tag: string, change: (html: string) => string = (html) => html, lang: Lang = 'en'): string {
  const blocks = [
    `<section data-content="how"><ol><li>Enter for ${tag}</li><li>Type for ${tag}</li><li>Read for ${tag}</li></ol></section>`,
    `<section data-content="faq">${faq(4, tag)}</section>`,
    `<section data-content="privacy"><p>${CALC_PRIVACY_NOTE[lang]}</p></section>`,
    `<section data-content="related"><ul><li><a href="/mortgage-calculator/">Mortgage calculator for ${tag}</a></li></ul></section>`,
  ].join('');
  return change(`<!doctype html><html><head><title>${tag} | FileOrca</title><meta name="description" content="Description of ${tag}"></head><body><main><h1>${tag}</h1>${blocks}</main></body></html>`);
}

describe('portão de conteúdo: blocos das calculadoras (F4)', () => {
  it('accepts a complete calculator page', () => {
    expect(checkCalcPage(calcPage('mortgage'))).toEqual([]);
    expect(CALC_BLOCKS).toEqual(['how', 'faq', 'privacy', 'related']);
  });

  it('requires each of the four blocks', () => {
    for (const name of CALC_BLOCKS)
      expect(checkCalcPage(calcPage('m', (html) => html.replace(`data-content="${name}"`, 'data-x="y"'))).join('\n'), name).toMatch(new RegExp(`sem o bloco ${name}`));
  });

  it('needs 3 steps, 4 questions, a link and the privacy phrase', () => {
    expect(checkCalcPage(calcPage('m', (html) => html.replace('<li>Read for m</li>', ''))).join()).toMatch(/how tem 2 passo/);
    expect(checkCalcPage(calcPage('m', (html) => html.replace(faq(4, 'm'), faq(3, 'm')))).join()).toMatch(/faq tem 3 pergunta/);
    expect(checkCalcPage(calcPage('m', (html) => html.replace('href="/mortgage-calculator/"', 'href="#top"'))).join()).toMatch(/related não tem nenhum link/);
    const files = calcPage('m', (html) => html.replace('Your numbers stay on your device.', 'Your files never leave your device.'));
    expect(checkCalcPage(files).join()).toMatch(/não diz "your numbers stay on your device"/);
  });

  it('knows the 18 calculator pages and compares a preset with its parent and siblings', () => {
    expect(Object.keys(CALC_PAGES)).toHaveLength(18);
    for (const id of Object.keys(CALC_PAGES)) expect(isCalcPage(id), id).toBe(true);
    for (const id of ['home', 'money-calculators', 'compress-image', 'guides-refinance-break-even', 'constructor']) expect(isCalcPage(id), id).toBe(false);
    expect(calcComparisonPaths('mortgage-calculator-biweekly')).toEqual(['/mortgage-calculator/', '/mortgage-calculator/extra-payments/', '/mortgage-calculator/15-vs-30-year/']);
    expect(calcComparisonPaths('loan-amortization-calculator-balloon-payment')).toEqual(['/loan-amortization-calculator/']);
    expect(calcComparisonPaths('mortgage-calculator')).toEqual([]);
    for (const id of CALC_PRESET_IDS) expect(calcComparisonPaths(id), id).not.toContain(CALC_PAGES[id].path);
    // F6: in Spanish a preset would be compared with the Spanish pages only; the presets are English only, and of the
    // mortgage family only the parent has a Spanish page.
    expect(calcComparisonPaths('mortgage-calculator-biweekly', 'es')).toEqual(['/es/calculadora-de-hipoteca/']);
    expect(calcComparisonPaths('mortgage-calculator-biweekly', 'pt')).toEqual([]);
  });

  it('asks each language for its own privacy phrase (F6): the phrase of the language passes, the English one fails there', () => {
    expect(CALC_PRIVACY_PHRASES.en).toBe(CALC_PRIVACY_PHRASE);
    for (const lang of LANGS) {
      // The phrase is the calcSeal of the language, lower case (src/i18n/<lang>/common.ts).
      expect(CALC_PRIVACY_PHRASES[lang], lang).toBe(normalizeText(TEXTS[lang].common.calcSeal));
      // Positive control: a page with the note of its language passes.
      expect(checkCalcPage(calcPage('m', undefined, lang), lang), lang).toEqual([]);
    }
    // Negative controls: a page left in English fails the Portuguese and Spanish rule, and a translated note fails English.
    expect(checkCalcPage(calcPage('m'), 'pt').join()).toContain('o bloco privacy não diz "seus números ficam no seu aparelho"');
    expect(checkCalcPage(calcPage('m'), 'es').join()).toContain('o bloco privacy não diz "tus números se quedan en tu dispositivo"');
    expect(checkCalcPage(calcPage('m', undefined, 'es'), 'pt').join()).toMatch(/não diz "seus números/);
    expect(checkCalcPage(calcPage('m', undefined, 'pt')).join()).toMatch(/não diz "your numbers stay on your device"/);
    // The default stays English, as in the F4.
    expect(checkCalcPage(calcPage('m'))).toEqual([]);
  });
});

// ---- F5a: the PDF tool pages and the PDF hub (prompt F5a, decision 9) -------------------------------------------------

const ANSWER = 'This answer says what the tool does in a few plain words, so a visitor can go on.';
const pdfFaq = (count: number): string =>
  `<div class="fo-faq">${Array.from({ length: count }, (_, i) => `<details><summary>Question ${i + 1} about the tool?</summary><div><p>${ANSWER} (${i + 1})</p></div></details>`).join('')}</div>`;

/** The mode rows a fake page of this tool carries: one row per mode, headed by the mode (F6: in the language of the page). */
const modeRows = (id: PdfToolId, lang: Lang = 'en'): [string, string][] => (PDF_RULES[lang].modes[id] ?? []).map(({ mode }) => [mode, `What the ${mode} does to the file.`]);

const BASE_ROWS: [string, string][] = [
  ['Files it takes', 'PDF files. Oli checks what is inside the file, not its name.'],
  ['How many files', 'No limit on the number of files.'],
  ['Form fields', 'Fields on the pages you keep stay.'],
  ['Bookmarks and links', 'Bookmarks and the links between kept pages stay.'],
];
/**
 * The same rows in Portuguese and Spanish (F6), in the words of docs/i18n/pt.md and es.md, and what a translated page says in
 * its privacy note, its questions, its title and its H1. English is the fake of the F5a, unchanged.
 */
const FAKE_PDF_WORDS: Record<Lang, { rows: [string, string][]; privacy: string; secret: (word: string) => string; question: string; answer: string; title: string; description: string }> = {
  en: {
    rows: BASE_ROWS,
    privacy: 'Your PDF is handled on your device, in your browser, and is never sent to a server.',
    secret: (word) => ` Your ${word} is not kept.`,
    question: 'Question {n} about the tool?',
    answer: ANSWER,
    title: 'do the job in your browser',
    description: 'in your browser, with nothing uploaded.',
  },
  pt: {
    rows: [
      ['Arquivos que aceita', 'Arquivos PDF. A Oli confere o que tem dentro do arquivo, não o nome.'],
      ['Quantos arquivos', 'Sem limite de arquivos.'],
      ['Campos de formulário', 'Os campos das páginas que você mantém ficam.'],
      ['Marcadores e links', 'Os marcadores e os links entre as páginas mantidas ficam.'],
    ],
    privacy: 'Seu PDF é tratado no seu aparelho, no navegador, e nunca é enviado a um servidor.',
    secret: (word) => ` Sua ${word} não fica guardada.`,
    question: 'Pergunta {n} sobre a ferramenta?',
    answer: 'Esta resposta diz o que a ferramenta faz em poucas palavras, para a pessoa seguir em frente.',
    title: 'faça no seu navegador',
    description: 'no seu navegador, sem enviar nada.',
  },
  es: {
    rows: [
      ['Archivos que acepta', 'Archivos PDF. Oli revisa lo que hay dentro del archivo, no su nombre.'],
      ['Cuántos archivos', 'Sin límite de archivos.'],
      ['Campos de formulario', 'Los campos de las páginas que conservas se quedan.'],
      ['Marcadores y enlaces', 'Los marcadores y los enlaces entre las páginas que conservas se quedan.'],
    ],
    privacy: 'Tu PDF se procesa en tu dispositivo, en tu navegador, y nunca se envía a un servidor.',
    secret: (word) => ` Tu ${word} no se guarda.`,
    question: '¿Pregunta {n} sobre la herramienta?',
    answer: 'Esta respuesta dice lo que hace la herramienta en pocas palabras, para que la persona siga adelante.',
    title: 'hazlo en tu navegador',
    description: 'en tu navegador, sin subir nada.',
  },
};
const tableOf = (rows: [string, string][]): string =>
  `<section data-content="specs"><table><thead><tr><th scope="col">Detail</th><th scope="col">What happens</th></tr></thead><tbody>${rows.map(([head, text]) => `<tr><th scope="row">${head}</th><td>${text}</td></tr>`).join('')}</tbody></table></section>`;

interface FakePdf {
  id?: PdfToolId;
  lang?: Lang;
  top?: string;
  head?: string;
  how?: string;
  rows?: [string, string][];
  faq?: string;
  privacy?: string;
  related?: string;
  extra?: string;
}

const pdfFaqIn = (lang: Lang, count = 4): string =>
  lang === 'en'
    ? pdfFaq(count)
    : `<div class="fo-faq">${Array.from({ length: count }, (_, i) => `<details><summary>${FAKE_PDF_WORDS[lang].question.replace('{n}', String(i + 1))}</summary><div><p>${FAKE_PDF_WORDS[lang].answer} (${i + 1})</p></div></details>`).join('')}</div>`;

/** A PDF tool page that passes every rule (F6: in the language asked, English by default); each test changes one thing. */
function pdfPage(fake: FakePdf = {}): string {
  const id = fake.id ?? 'merge-pdf';
  const lang = fake.lang ?? 'en';
  const words = FAKE_PDF_WORDS[lang];
  const common = TEXTS[lang].common;
  const name = common.pdf[id].name;
  const top = fake.top ?? `<div class="fo-top"><h1>${name}</h1><span class="fo-seal"><svg></svg>${common.seal}</span></div>`;
  const head = fake.head ?? `<title>${name}: ${words.title} | FileOrca</title><meta name="description" content="${name} ${words.description}">`;
  const how = fake.how ?? '<section data-content="how"><ol><li>Drop the PDF</li><li>Pick an option</li><li>Download the result</li></ol></section>';
  const specs = tableOf(fake.rows ?? [...words.rows, ...modeRows(id, lang)]);
  const faq = `<section data-content="faq">${fake.faq ?? pdfFaqIn(lang)}</section>`;
  const secret = PDF_RULES[lang].secrets[id];
  const privacyText = `${words.privacy}${secret ? words.secret(secret.source.replace(/\\b/g, '')) : ''}`;
  const privacy = fake.privacy ?? `<section data-content="privacy"><p>${privacyText}</p></section>`;
  const related = fake.related ?? `<section data-content="related"><ul>${PDF_PAGES[id].related.slice(0, 3).map((target) => `<li><a class="fo-tool" href="/${target}/">${target}</a></li>`).join('')}</ul></section>`;
  return `<!doctype html><html><head>${head}</head><body><main>${top}${how}${specs}${faq}${privacy}${related}${fake.extra ?? ''}</main></body></html>`;
}

const wantOf = (id: PdfToolId, lang: Lang = 'en') => ({ id, name: TEXTS[lang].common.pdf[id].name, seal: TEXTS[lang].common.seal, ...(lang === 'en' ? {} : { lang }) });
const problemsOf = (html: string, id: PdfToolId = 'merge-pdf', lang: Lang = 'en'): string => checkPdfPage(html, wantOf(id, lang)).join('\n');

describe('portão de conteúdo: as páginas de PDF (F5a)', () => {
  it('reads the 12 tools from the PDF registry and tells them from every other route', () => {
    expect(PDF_TOOL_IDS).toHaveLength(12);
    for (const id of PDF_TOOL_IDS) expect(isPdfPage(id), id).toBe(true);
    for (const id of [PDF_HUB_ID, 'home', 'image-to-pdf', 'compress-image', 'privacy', 'constructor', 'toString']) expect(isPdfPage(id), id).toBe(false);
    // Every tool of the registry is a page of the route map, in the three languages since the F6 (decision 4; English only
    // before), with the English path of the registry.
    for (const id of PDF_TOOL_IDS) {
      const route = ROUTES.find((candidate) => candidate.id === id);
      expect(route, id).toBeDefined();
      expect(route ? languagesOf(route) : [], id).toEqual([...LANGS]);
      expect(route?.paths.en, id).toBe(PDF_PAGES[id].path);
    }
    // The mode and secret tables name only tools of the registry and only rows of some tool.
    for (const id of [...Object.keys(PDF_MODES), ...Object.keys(PDF_SECRETS)]) expect(isPdfPage(id), id).toBe(true);
  });

  it('accepts a complete page for each of the 12 tools, with the mode rows and the secret word its tool needs', () => {
    for (const id of PDF_TOOL_IDS) expect(checkPdfPage(pdfPage({ id }), wantOf(id)), id).toEqual([]);
  });

  it('keeps the rules of the five blocks (rule 1 runs first)', () => {
    for (const name of CONTENT_BLOCKS) {
      expect(problemsOf(pdfPage().replace(`data-content="${name}"`, 'data-x="y"')), name).toMatch(new RegExp(`sem o bloco ${name}`));
    }
    expect(problemsOf(pdfPage({ how: '<section data-content="how"><ol><li>Drop</li><li>Download</li></ol></section>' }))).toMatch(/how tem 2 passo/);
  });

  it('H1: needs one, and it starts with the tool name', () => {
    const seal = `<span class="fo-seal">${enCommon.seal}</span>`;
    expect(problemsOf(pdfPage({ top: `<div class="fo-top">${seal}</div>` }))).toMatch(/0 H1, pede 1/);
    expect(problemsOf(pdfPage({ top: `<div class="fo-top"><h1>Merge PDF</h1><h1>Again</h1>${seal}</div>` }))).toMatch(/2 H1, pede 1/);
    expect(problemsOf(pdfPage({ top: `<div class="fo-top"><h1>Combine files</h1>${seal}</div>` }))).toMatch(/o H1 "combine files" não começa pelo nome da ferramenta \("Merge PDF"\)/);
    expect(checkPdfPage(pdfPage({ top: `<div class="fo-top"><h1>Merge PDF files</h1>${seal}</div>` }), wantOf('merge-pdf'))).toEqual([]);
  });

  it('PrivacySeal: needs the fixed text next to the H1', () => {
    expect(problemsOf(pdfPage({ top: '<div class="fo-top"><h1>Merge PDF</h1></div>' }))).toMatch(/sem o PrivacySeal \(\.fo-seal\) junto do H1/);
    expect(problemsOf(pdfPage({ top: `<div><h1>Merge PDF</h1></div><span class="fo-seal">${enCommon.seal}</span>` }))).toMatch(/sem o PrivacySeal/);
    expect(problemsOf(pdfPage({ top: '<div class="fo-top"><h1>Merge PDF</h1><span class="fo-seal">Private</span></div>' }))).toMatch(/o PrivacySeal diz "private", o texto fixo é "Your files never leave your device"/);
  });

  it('title and description: the title starts with the tool name and the page has a description', () => {
    expect(problemsOf(pdfPage({ head: '<title>Combine PDF files | FileOrca</title><meta name="description" content="x">' }))).toMatch(/o título "combine pdf files \| fileorca" não começa pelo nome da ferramenta/);
    expect(problemsOf(pdfPage({ head: '<title>Merge PDF: join files | FileOrca</title>' }))).toMatch(/sem meta description/);
    expect(problemsOf(pdfPage({ head: '<title>MERGE   pdf: join files</title><meta name="description" content="x">' }))).toBe('');
  });

  it('specs: say what the tool takes', () => {
    const rows = BASE_ROWS.filter(([head]) => head !== 'Files it takes');
    expect(problemsOf(pdfPage({ rows }))).toMatch(/não diz o que a ferramenta aceita/);
  });

  it('specs: state a limit', () => {
    const rows: [string, string][] = BASE_ROWS.map(([head, text]) => (head === 'How many files' ? [head, 'Oli counts the files.'] : [head, text]));
    expect(problemsOf(pdfPage({ rows }))).toMatch(/não diz um limite/);
    for (const limit of ['One PDF at a time.', 'It must have 4 to 100 characters.', 'A page over 16.7 megapixels is scaled down.', 'Any whole number from 1 to 9999.']) {
      const ok: [string, string][] = BASE_ROWS.map(([head, text]) => (head === 'How many files' ? [head, limit] : [head, text]));
      expect(problemsOf(pdfPage({ rows: ok })), limit).toBe('');
    }
  });

  it('specs: say what stays, form, bookmarks and links, each with its word', () => {
    // The header counts as part of the row: "Form fields | Kept" says it, so the row is replaced whole.
    const swap = (head: string, newHead: string, text: string): [string, string][] => BASE_ROWS.map(([h, t]) => (h === head ? [newHead, text] : [h, t]));
    const noForm = BASE_ROWS.filter(([head]) => head !== 'Form fields');
    expect(problemsOf(pdfPage({ rows: noForm }))).toMatch(/não diz o que acontece com formulário/);
    const noBookmarks = swap('Bookmarks and links', 'Links', 'The links between kept pages stay.');
    expect(problemsOf(pdfPage({ rows: noBookmarks }))).toMatch(/não diz o que acontece com marcadores/);
    expect(problemsOf(pdfPage({ rows: noBookmarks }))).not.toMatch(/links|formulário/);
    const noLinks = swap('Bookmarks and links', 'Bookmarks', 'Bookmarks that point to kept pages stay.');
    expect(problemsOf(pdfPage({ rows: noLinks }))).toMatch(/não diz o que acontece com links/);
    expect(problemsOf(pdfPage({ rows: noLinks }))).not.toMatch(/marcadores|formulário/);
  });

  it('specs: the tool that makes images is not asked what stays in a PDF', () => {
    const rows = BASE_ROWS.filter(([head]) => head === 'Files it takes' || head === 'How many files');
    expect(checkPdfPage(pdfPage({ id: 'pdf-to-jpg', rows: [...rows, ...modeRows('pdf-to-jpg')] }), wantOf('pdf-to-jpg'))).toEqual([]);
    expect(checkPdfPage(pdfPage({ id: 'merge-pdf', rows }), wantOf('merge-pdf')).join()).toMatch(/formulário/);
  });

  it('specs: each mode of a tool has a row of its own', () => {
    for (const id of Object.keys(PDF_MODES) as PdfToolId[]) {
      for (const { mode } of PDF_MODES[id] ?? []) {
        const rows = [...BASE_ROWS, ...modeRows(id).filter(([head]) => head !== mode)];
        expect(problemsOf(pdfPage({ id, rows }), id), `${id}: ${mode}`).toContain(`não tem uma linha para o modo "${mode}"`);
      }
    }
    // The three Compress modes are the ones of the spec, and a tool without modes is never asked for one.
    expect((PDF_MODES['compress-pdf'] ?? []).map(({ mode }) => mode)).toEqual(['lossless', 'recommended', 'strong']);
    expect(PDF_MODES['merge-pdf']).toBeUndefined();
  });

  it('faq: four real questions, each with a question mark, an answer and no repeat', () => {
    expect(problemsOf(pdfPage({ faq: pdfFaq(3) }))).toMatch(/faq tem 3 pergunta/);
    const noMark = `${pdfFaq(4)}<details><summary>Tell me more</summary><div><p>${ANSWER}</p></div></details>`;
    expect(problemsOf(pdfPage({ faq: noMark }))).toMatch(/a pergunta "tell me more" do bloco faq não termina em \?/);
    const thin = `${pdfFaq(4)}<details><summary>Does it work?</summary><div><p>Yes.</p></div></details>`;
    expect(problemsOf(pdfPage({ faq: thin }))).toMatch(new RegExp(`a pergunta "does it work\\?" do bloco faq tem uma resposta de 4 caractere\\(s\\), pede pelo menos ${MIN_ANSWER_CHARS}`));
    const twice = `${pdfFaq(4)}<details><summary>Question 1 about the tool?</summary><div><p>${ANSWER} again</p></div></details>`;
    expect(problemsOf(pdfPage({ faq: twice }))).toMatch(/a pergunta "question 1 about the tool\?" aparece duas vezes/);
    // A poor question is reported even when four others are fine; five real ones pass.
    expect(problemsOf(pdfPage({ faq: pdfFaq(5) }))).toBe('');
  });

  it('privacy: says the work is done on the device and nothing is sent', () => {
    const section = (text: string) => `<section data-content="privacy"><p>${text}</p></section>`;
    expect(problemsOf(pdfPage({ privacy: section('Your PDFs are processed here, and nothing is shared with anyone else.') }))).toMatch(/não diz que o trabalho é feito no aparelho ou no navegador/);
    expect(problemsOf(pdfPage({ privacy: section('Your PDFs are processed on your device, with care and some patience.') }))).toMatch(/não diz que o arquivo não é enviado/);
    expect(problemsOf(pdfPage({ privacy: section('The work happens in your browser and your file does not leave your device.') }))).toBe('');
  });

  it('privacy: a tool that takes a password or a signature says so', () => {
    const section = '<section data-content="privacy"><p>Your PDF is handled on your device, in your browser, and is never sent to a server.</p></section>';
    expect(problemsOf(pdfPage({ id: 'protect-pdf', privacy: section }), 'protect-pdf')).toMatch(/não fala de password, que a ferramenta recebe/);
    expect(problemsOf(pdfPage({ id: 'unlock-pdf', privacy: section }), 'unlock-pdf')).toMatch(/não fala de password/);
    expect(problemsOf(pdfPage({ id: 'sign-pdf', privacy: section }), 'sign-pdf')).toMatch(/não fala de signature/);
    expect(problemsOf(pdfPage({ id: 'merge-pdf', privacy: section }), 'merge-pdf')).toBe('');
  });

  it(`related: at most ${MAX_RELATED_CARDS} cards, counted by link`, () => {
    const cards = (n: number) => `<section data-content="related"><ul>${Array.from({ length: n }, (_, i) => `<li><a href="/tool-${i}/">Tool ${i}</a></li>`).join('')}</ul></section>`;
    expect(problemsOf(pdfPage({ related: cards(7) }))).toMatch(/o bloco related tem 7 cartões, no máximo 6/);
    expect(problemsOf(pdfPage({ related: cards(6) }))).toBe('');
    // A card repeated is one card.
    const twice = '<section data-content="related"><ul><li><a href="/a/">A</a></li><li><a href="/a/">A again</a></li></ul></section>';
    expect(problemsOf(pdfPage({ related: twice }))).toBe('');
  });

  it('claims: no best, #1 or unmeasured number in the title, the description or the text', () => {
    const SAMPLES: Record<string, string> = {
      best: 'The best way to merge PDFs.',
      '#1': 'The #1 PDF tool.',
      fastest: 'The fastest compressor around.',
      'most popular': 'The most popular PDF tool.',
      'economia medida': 'Saves up to 80% of the size.',
      'ganho em %': 'Files come out 70% smaller.',
      'número de usuários': '2 million users merge PDFs here.',
      'tempo prometido': 'Done in 3 seconds.',
    };
    expect(Object.keys(SAMPLES).sort()).toEqual(CLAIMS.map((claim) => claim.label).sort());
    for (const [label, text] of Object.entries(SAMPLES)) {
      expect(findClaims(text), label).toEqual([label]);
      expect(problemsOf(pdfPage({ extra: `<section><p>${text}</p></section>` })), `no texto: ${label}`).toContain(`afirmação sem medida na página: ${label}`);
      expect(problemsOf(pdfPage({ head: `<title>Merge PDF: ${text} | FileOrca</title><meta name="description" content="x">` })), `no título: ${label}`).toContain(`afirmação sem medida na página: ${label}`);
      expect(problemsOf(pdfPage({ head: `<title>Merge PDF | FileOrca</title><meta name="description" content="${text}">` })), `na descrição: ${label}`).toContain(`afirmação sem medida na página: ${label}`);
    }
  });

  it('claims: the numbers the pages give as facts are not claims', () => {
    for (const fact of [
      'The text spans about 35%, 55% or 80% of the page diagonal, or of the page width.',
      'Light is 15%, Medium is 30% (the default) and Strong is 50%.',
      'JPG at quality 92, or PNG. 72 ppi for the screen, 150 ppi for general use or 300 ppi for printing.',
      'It must have 4 to 100 characters. Any whole number from 1 to 9999. Page 1 of 12.',
      'A page over 16.7 megapixels comes out at a lower resolution. AES-256 (revision 6). Diagonal runs at 45° on the screen.',
      'A photo is saved again with MozJPEG at quality 75 and scaled down to 150 ppi. Every page becomes a JPG picture at 100 ppi.',
    ]) expect(findClaims(fact), fact).toEqual([]);
  });

  it('claims: the AdSlot label and the scripts are not part of the text', () => {
    expect(problemsOf(pdfPage({ extra: '<div class="fo-ad fo-ad--content"><span>The best ad</span></div><script>var best = "#1";</script>' }))).toBe('');
  });
});

/** What the hub lists: the 12 tools of the PDF registry and the Image to PDF card. */
const HUB = { name: enCommon.pdfTools, paths: [...PDF_TOOL_IDS.map((id) => PDF_PAGES[id].path), '/image-to-pdf/'] };
/** The same in each language (F6): the paths of the route map in that language and the hub name of its texts. */
const hubWant = (lang: Lang) => ({
  name: TEXTS[lang].common.pdfTools,
  paths: [...PDF_TOOL_IDS.map((id) => routeById(id).paths[lang] ?? ''), routeById('image-to-pdf').paths[lang] ?? ''],
  ...(lang === 'en' ? {} : { lang }),
});
const FAKE_HUB_WORDS: Record<Lang, { title: string; description: string; h1: string; privacy: string }> = {
  en: { title: 'merge, split and more', description: 'Free PDF tools in your browser.', h1: 'Free PDF tools that never upload your files', privacy: 'Every tool works in your browser and no file is ever sent to a server.' },
  pt: { title: 'juntar, dividir e mais', description: 'Ferramentas de PDF grátis no navegador.', h1: 'Ferramentas de PDF que nunca enviam seus arquivos', privacy: 'Toda ferramenta funciona no seu navegador e nenhum arquivo é enviado a um servidor.' },
  es: { title: 'unir, dividir y más', description: 'Herramientas PDF gratis en tu navegador.', h1: 'Herramientas PDF que nunca suben tus archivos', privacy: 'Cada herramienta funciona en tu navegador y ningún archivo se envía a un servidor.' },
};
interface FakeHub {
  lang?: Lang;
  head?: string;
  h1?: string;
  cards?: readonly string[];
  guide?: readonly string[] | null;
  privacy?: string | null;
  extra?: string;
}
/** A PDF hub that passes every rule (F6: in the language asked, English by default); each test changes one thing. */
function pdfHub(fake: FakeHub = {}): string {
  const lang = fake.lang ?? 'en';
  const words = FAKE_HUB_WORDS[lang];
  const want = hubWant(lang);
  const head = fake.head ?? `<title>${want.name}: ${words.title} | FileOrca</title><meta name="description" content="${words.description}">`;
  const cards = (fake.cards ?? want.paths).map((path) => `<li><a class="fo-tool" href="${path}">${path}</a></li>`).join('');
  const guide = fake.guide === null ? '' : `<section aria-labelledby="guide"><h2 id="guide">Which tool?</h2><ul>${(fake.guide ?? want.paths).map((path) => `<li><a href="${path}">${path}</a></li>`).join('')}</ul></section>`;
  const privacy = fake.privacy === null ? '' : `<section aria-labelledby="privacy"><h2 id="privacy">Privacy</h2><p>${fake.privacy ?? words.privacy}</p></section>`;
  return `<!doctype html><html><head>${head}</head><body><main><h1>${fake.h1 ?? words.h1}</h1><ul>${cards}</ul>${guide}${privacy}${fake.extra ?? ''}</main></body></html>`;
}

describe('portão de conteúdo: o hub de PDF (F5a)', () => {
  const hub = pdfHub;
  const hubProblems = (html: string): string => checkPdfHub(html, HUB).join('\n');

  it('accepts a complete hub', () => {
    expect(checkPdfHub(hub(), HUB)).toEqual([]);
  });

  it('H1, title and description', () => {
    expect(hubProblems(hub({ h1: 'Free tools that never upload your files' }))).toMatch(/não fala de PDF/);
    expect(hubProblems(hub().replace(/<h1>.*?<\/h1>/, ''))).toMatch(/0 H1, pede 1/);
    expect(hubProblems(hub({ head: '<title>Merge, split and more | FileOrca</title><meta name="description" content="x">' }))).toMatch(/não começa pelo nome do hub \("PDF tools"\)/);
    expect(hubProblems(hub({ head: '<title>PDF tools: merge | FileOrca</title>' }))).toMatch(/sem meta description/);
  });

  it('cards: one for each tool of the registry and the Image to PDF card, no other and no repeat', () => {
    expect(hubProblems(hub({ cards: HUB.paths.slice(1) }))).toContain(`faltam os cartões de ${HUB.paths[0]}`);
    expect(hubProblems(hub({ cards: [...HUB.paths, '/convert-to-webp/'] }))).toContain('cartões fora do registro: /convert-to-webp/');
    expect(hubProblems(hub({ cards: [...HUB.paths, '/merge-pdf/'] }))).toContain('um cartão aparece duas vezes');
  });

  it('guide: links to every tool', () => {
    expect(hubProblems(hub({ guide: HUB.paths.filter((path) => path !== '/sign-pdf/') }))).toContain('o guia não leva a /sign-pdf/');
    expect(hubProblems(hub({ guide: null }))).toMatch(/sem a seção do guia/);
  });

  it('privacy: a section that says the work is on the device and nothing is sent', () => {
    expect(hubProblems(hub({ privacy: null }))).toMatch(/sem a seção de privacidade/);
    expect(hubProblems(hub({ privacy: 'We take your privacy seriously.' }))).toMatch(/não diz que o trabalho é feito no aparelho e que nada é enviado/);
  });

  it('claims: the hub makes none either', () => {
    expect(hubProblems(hub({ extra: '<p>The best PDF tools, the #1 choice.</p>' }))).toContain('afirmação sem medida na página: best');
  });
});

// ---- F6: the same PDF rules in Portuguese and Spanish (prompt F6, decision 9) -----------------------------------------

describe('portão de conteúdo: as páginas de PDF em português e espanhol (F6)', () => {
  /** A sample of each claim in each language: each one must be caught alone, with the label of the English list. */
  const CLAIM_SAMPLES: Record<'pt' | 'es', Record<string, string>> = {
    pt: {
      best: 'A melhor forma de juntar PDFs.',
      '#1': 'A ferramenta de PDF nº 1.',
      fastest: 'O compressor mais rápido da internet.',
      'most popular': 'A ferramenta de PDF mais popular.',
      'economia medida': 'Economiza até 80% do tamanho.',
      'ganho em %': 'Os arquivos saem 70% menores.',
      'número de usuários': '2 milhões de usuários juntam PDFs aqui.',
      'tempo prometido': 'Pronto em 3 segundos.',
    },
    es: {
      best: 'La mejor forma de unir PDF.',
      '#1': 'La herramienta PDF n.º 1.',
      fastest: 'El compresor más rápido de internet.',
      'most popular': 'La herramienta PDF más popular.',
      'economia medida': 'Ahorra hasta un 80 % del tamaño.',
      'ganho em %': 'Los archivos salen un 70 % más pequeños.',
      'número de usuários': '2 millones de usuarios unen PDF aquí.',
      'tempo prometido': 'Listo en 3 segundos.',
    },
  };
  /** Numbers the translated pages give as facts, and comparatives that are plain sentences: none is a claim. */
  const FACTS: Record<'pt' | 'es', string[]> = {
    pt: [
      'O texto ocupa cerca de 35%, 55% ou 80% da diagonal da página, ou da largura.',
      'Clara é 15%, Média é 30% (o padrão) e Forte é 50%.',
      'JPG com qualidade 92, ou PNG. 72 ppi para a tela, 150 ppi para uso geral ou 300 ppi para imprimir.',
      'Ela precisa ter de 4 a 100 caracteres. Qualquer número inteiro de 1 a 9999. Página 1 de 12.',
      'Uma página acima de 16,7 megapixels sai com resolução menor. AES-256 (revisão 6).',
      'A imagem fica melhor no celular, e o arquivo abre mais rápido.',
      'Comece a numeração no 1 ou em outro número.',
    ],
    es: [
      'El texto ocupa cerca del 35 %, 55 % u 80 % de la diagonal de la página, o del ancho.',
      'Suave es 15 %, Media es 30 % (la predeterminada) y Fuerte es 50 %.',
      'JPG con calidad 92, o PNG. 72 ppi para pantalla, 150 ppi para uso general o 300 ppi para imprimir.',
      'Debe tener de 4 a 100 caracteres. Cualquier número entero del 1 al 9999. Página 1 de 12.',
      'Una página de más de 16.7 megapíxeles sale con menos resolución. AES-256 (revisión 6).',
      'La imagen se ve mejor en el teléfono, y el archivo abre más rápido.',
    ],
  };

  it('has the rules of every language for the same tools: the modes of English, one sample header each, matched by its own rule', () => {
    for (const lang of LANGS) {
      const modes = PDF_RULES[lang].modes;
      expect(Object.keys(modes).sort(), lang).toEqual(Object.keys(PDF_MODES).sort());
      for (const id of Object.keys(PDF_MODES) as PdfToolId[]) {
        expect(modes[id]?.length, `${lang} ${id}`).toBe(PDF_MODES[id]?.length);
        for (const { mode, header } of modes[id] ?? []) expect(header.test(mode), `${lang} ${id} ${mode}`).toBe(true);
      }
      expect(Object.keys(PDF_RULES[lang].secrets).sort(), lang).toEqual(Object.keys(PDF_SECRETS).sort());
      expect(PDF_RULES[lang].kept.map((rule) => rule.label), lang).toEqual(['formulário', 'marcadores', 'links']);
      expect(CLAIMS_BY_LANG[lang].map((claim) => claim.label), lang).toEqual(CLAIMS.map((claim) => claim.label));
    }
    // English is the list of the F5a, the same objects.
    expect(PDF_RULES.en.modes).toBe(PDF_MODES);
    expect(PDF_RULES.en.secrets).toBe(PDF_SECRETS);
    expect(CLAIMS_BY_LANG.en).toBe(CLAIMS);
  });

  for (const lang of ['pt', 'es'] as const) {
    const problems = (html: string, id: PdfToolId = 'merge-pdf'): string => problemsOf(html, id, lang);
    const words = FAKE_PDF_WORDS[lang];

    it(`${lang}: accepts a complete page for each of the 12 tools, in the words of the language (positive control)`, () => {
      for (const id of PDF_TOOL_IDS) expect(checkPdfPage(pdfPage({ id, lang }), wantOf(id, lang)), `${lang} ${id}`).toEqual([]);
    });

    it(`${lang}: fails the page left in English, the name, the seal and the words (negative control: an untranslated stub)`, () => {
      const english = problems(pdfPage({ id: 'merge-pdf' }));
      expect(english).toContain('o H1 "merge pdf" não começa pelo nome da ferramenta');
      expect(english).toContain('o bloco specs não diz o que a ferramenta aceita');
      expect(english).toContain('o bloco privacy não diz que o trabalho é feito no aparelho ou no navegador');
      // And the other way round: the translated page fails the English rules.
      expect(checkPdfPage(pdfPage({ id: 'merge-pdf', lang }), wantOf('merge-pdf')).join('\n')).toMatch(/não diz o que a ferramenta aceita/);
    });

    it(`${lang}: specs say what the tool takes, a limit, what stays and what each mode does`, () => {
      const rows = (filter: (head: string) => boolean): [string, string][] => words.rows.filter(([head]) => filter(head));
      expect(problems(pdfPage({ lang, rows: rows((head) => head !== words.rows[0]?.[0]) }))).toMatch(/não diz o que a ferramenta aceita/);
      const noLimit = words.rows.map(([head, text], index): [string, string] => (index === 1 ? [head, lang === 'pt' ? 'A Oli conta os arquivos.' : 'Oli cuenta los archivos.'] : [head, text]));
      expect(problems(pdfPage({ lang, rows: noLimit }))).toMatch(/não diz um limite/);
      for (const limit of lang === 'pt' ? ['Um PDF por vez.', 'Ela precisa ter de 4 a 100 caracteres.', 'Uma página acima de 16,7 megapixels sai menor.', 'Qualquer número inteiro até 9999.'] : ['Un PDF a la vez.', 'Debe tener de 4 a 100 caracteres.', 'Una página de más de 16.7 megapíxeles sale más pequeña.', 'Cualquier número entero hasta 9999.']) {
        const ok = words.rows.map(([head, text], index): [string, string] => (index === 1 ? [head, limit] : [head, text]));
        expect(problems(pdfPage({ lang, rows: ok })), limit).toBe('');
      }
      expect(problems(pdfPage({ lang, rows: rows((head) => head !== words.rows[2]?.[0]) }))).toMatch(/não diz o que acontece com formulário/);
      const noBookmarks = words.rows.map(([head, text], index): [string, string] => (index === 3 ? [lang === 'pt' ? 'Links' : 'Enlaces', lang === 'pt' ? 'Os links entre as páginas mantidas ficam.' : 'Los enlaces entre las páginas que conservas se quedan.'] : [head, text]));
      expect(problems(pdfPage({ lang, rows: noBookmarks }))).toMatch(/não diz o que acontece com marcadores/);
      const noLinks = words.rows.map(([head, text], index): [string, string] => (index === 3 ? ['Marcadores', lang === 'pt' ? 'Os marcadores das páginas mantidas ficam.' : 'Los marcadores de las páginas que conservas se quedan.'] : [head, text]));
      expect(problems(pdfPage({ lang, rows: noLinks }))).toMatch(/não diz o que acontece com links/);
      for (const id of Object.keys(PDF_MODES) as PdfToolId[]) {
        for (const { mode } of PDF_RULES[lang].modes[id] ?? []) {
          const without = [...words.rows, ...modeRows(id, lang).filter(([head]) => head !== mode)];
          expect(problems(pdfPage({ id, lang, rows: without }), id), `${id}: ${mode}`).toContain(`não tem uma linha para o modo "${mode}"`);
        }
      }
      // An English mode row is not a mode row of the translated page.
      expect(problems(pdfPage({ id: 'compress-pdf', lang, rows: [...words.rows, ...modeRows('compress-pdf')] }), 'compress-pdf')).toMatch(/não tem uma linha para o modo/);
    });

    it(`${lang}: the privacy note says the work is on the device, that nothing is sent, and names the secret`, () => {
      const section = (text: string) => `<section data-content="privacy"><p>${text}</p></section>`;
      const noDevice = lang === 'pt' ? 'Seus PDFs são tratados aqui, e nada é enviado a ninguém.' : 'Tus PDF se procesan aquí, y nada se envía a nadie.';
      const noSent = lang === 'pt' ? 'Seus PDFs são tratados no seu aparelho, com cuidado e paciência.' : 'Tus PDF se procesan en tu dispositivo, con cuidado y paciencia.';
      expect(problems(pdfPage({ lang, privacy: section(noDevice) }))).toMatch(/não diz que o trabalho é feito no aparelho ou no navegador/);
      expect(problems(pdfPage({ lang, privacy: section(noSent) }))).toMatch(/não diz que o arquivo não é enviado/);
      expect(problems(pdfPage({ lang, privacy: section(words.privacy) }))).toBe('');
      const secretWord = lang === 'pt' ? { password: 'senha', signature: 'assinatura' } : { password: 'contraseña', signature: 'firma' };
      expect(problems(pdfPage({ id: 'protect-pdf', lang, privacy: section(words.privacy) }), 'protect-pdf')).toContain(`não fala de ${secretWord.password}, que a ferramenta recebe`);
      expect(problems(pdfPage({ id: 'unlock-pdf', lang, privacy: section(words.privacy) }), 'unlock-pdf')).toContain(`não fala de ${secretWord.password}`);
      expect(problems(pdfPage({ id: 'sign-pdf', lang, privacy: section(words.privacy) }), 'sign-pdf')).toContain(`não fala de ${secretWord.signature}`);
      // The English secret word is not the Portuguese or Spanish one.
      expect(problems(pdfPage({ id: 'protect-pdf', lang, privacy: section(`${words.privacy} Your password is not kept.`) }), 'protect-pdf')).toContain(`não fala de ${secretWord.password}`);
    });

    it(`${lang}: no best, #1 or unmeasured number, each caught alone in the text, the title and the description; the facts pass`, () => {
      const samples = CLAIM_SAMPLES[lang];
      expect(Object.keys(samples).sort()).toEqual(CLAIMS.map((claim) => claim.label).sort());
      const name = TEXTS[lang].common.pdf['merge-pdf'].name;
      for (const [label, text] of Object.entries(samples)) {
        expect(findClaims(text, lang), `${lang} ${label}`).toEqual([label]);
        expect(problems(pdfPage({ lang, extra: `<section><p>${text}</p></section>` })), `no texto: ${label}`).toContain(`afirmação sem medida na página: ${label}`);
        expect(problems(pdfPage({ lang, head: `<title>${name}: ${text} | FileOrca</title><meta name="description" content="x">` })), `no título: ${label}`).toContain(`afirmação sem medida na página: ${label}`);
        expect(problems(pdfPage({ lang, head: `<title>${name} | FileOrca</title><meta name="description" content="${text}">` })), `na descrição: ${label}`).toContain(`afirmação sem medida na página: ${label}`);
      }
      for (const fact of FACTS[lang]) expect(findClaims(fact, lang), fact).toEqual([]);
    });

    it(`${lang}: the hub has the cards, the guide and the privacy section of its language, and no claim`, () => {
      const want = hubWant(lang);
      expect(checkPdfHub(pdfHub({ lang }), want)).toEqual([]);
      // The English hub: the name, the cards of English paths and the privacy in English all fail.
      const english = checkPdfHub(pdfHub(), want).join('\n');
      expect(english).toMatch(/não começa pelo nome do hub/);
      expect(english).toMatch(/faltam os cartões de/);
      expect(english).toMatch(/a seção de privacidade não diz que o trabalho é feito no aparelho e que nada é enviado/);
      expect(checkPdfHub(pdfHub({ lang, privacy: lang === 'pt' ? 'Levamos sua privacidade a sério.' : 'Nos tomamos en serio tu privacidad.' }), want).join()).toMatch(/a seção de privacidade não diz/);
      expect(checkPdfHub(pdfHub({ lang, guide: want.paths.slice(1) }), want).join()).toContain(`o guia não leva a ${want.paths[0]}`);
      expect(checkPdfHub(pdfHub({ lang, extra: `<p>${CLAIM_SAMPLES[lang].best}</p>` }), want).join()).toContain('afirmação sem medida na página: best');
    });
  }
});

describe('portão de conteúdo: páginas lidas do mapa de rotas', () => {
  it('knows the 11 pages of the registry and nothing else', () => {
    expect(IMAGE_TOOL_IDS.length + IMAGE_PRESET_IDS.length).toBe(11);
    for (const id of Object.keys(IMAGE_PAGES)) expect(isImagePage(id), id).toBe(true);
    for (const id of ['home', 'image-tools', 'privacy', 'not-found', 'constructor', 'toString']) expect(isImagePage(id), id).toBe(false);
  });

  it('finds every page of the registry in the route map, each in the three languages (F6; before, only Compress image)', () => {
    // 11 pages × 3 languages: the gate reads 33 image pages (13 before the F6: 11 in English and Compress image in pt and es).
    const found = allPages().filter((entry) => isImagePage(entry.route.id));
    expect(found).toHaveLength(Object.keys(IMAGE_PAGES).length * LANGS.length);
    for (const id of Object.keys(IMAGE_PAGES)) {
      const route = ROUTES.find((candidate) => candidate.id === id);
      expect(route, id).toBeDefined();
      expect(route ? languagesOf(route) : [], id).toEqual([...LANGS]);
    }
    // A preset is compared with the pages of its own language.
    expect(comparisonPaths('compress-image-to-100kb', 'pt')).toEqual(['/pt/comprimir-imagem/', '/pt/comprimir-imagem/para-1mb/']);
  });

  it('compares a preset with its parent and the sibling presets, never with itself', () => {
    expect(comparisonPaths('compress-image-to-100kb')).toEqual(['/compress-image/', '/compress-image/to-1mb/']);
    for (const id of IMAGE_PRESET_IDS) {
      const parent = IMAGE_PAGES[id].parent;
      const siblings = IMAGE_PRESET_IDS.filter((other) => other !== id && IMAGE_PAGES[other].parent === parent);
      const paths = comparisonPaths(id);
      expect(paths, id).toHaveLength(1 + siblings.length);
      expect(paths[0], id).toBe(`/${parent}/`);
      expect(paths, id).not.toContain(`/${parent}/${id.replace(`${parent}-`, '')}/`);
    }
    expect(comparisonPaths('compress-image')).toEqual([]);
  });

  it('turns dist files into page paths and spots the 404 pages', () => {
    expect(pathOfFile('dist/pt/sobre/index.html')).toBe('/pt/sobre/');
    expect(pathOfFile('dist/index.html')).toBe('/');
    expect(pathOfFile('dist/pt/404.html')).toBe('/pt/404.html');
    expect(isNotFoundPath('/404.html')).toBe(true);
    expect(isNotFoundPath('/es/404.html')).toBe(true);
    expect(isNotFoundPath('/es/')).toBe(false);
  });
});

describe('portão de conteúdo: os guias de arquivo (F5b, DECISOES § 188)', () => {
  const want = { toolPath: '/heic-to-jpg/' };

  it('passes a guide with every block in order and 800 to 1,500 words of its own text', () => {
    expect(guideWords(guidePage())).toBeGreaterThanOrEqual(MIN_GUIDE_WORDS);
    expect(checkFileGuide(guidePage(), want)).toEqual([]);
  });

  it('counts only the text of the guide: not the tool, the tables, the sources or the cards', () => {
    const base = guideWords(guidePage());
    const padded = guidePage({ edit: (html) => html.replace('<td>1 MB</td>', `<td>${'cell '.repeat(400)}</td>`) });
    expect(guideWords(padded)).toBe(base);
  });

  it('fails a guide that is too short or too long', () => {
    expect(checkFileGuide(guidePage({ words: 700 }), want).join()).toMatch(/palavras de texto \(pede de 800 a 1500\)/);
    expect(checkFileGuide(guidePage({ words: MAX_GUIDE_WORDS + 200 }), want).join()).toMatch(/palavras de texto/);
  });

  it('fails a guide without the tool, with two tools, or with a link to another tool', () => {
    expect(checkFileGuide(guidePage({ tool: '' }), want)).toContain('sem a ferramenta embutida (#fo-tool-root)');
    const twice = '<div id="fo-tool-root" data-props="{}"></div><div id="fo-tool-root" data-props="{}"></div>';
    expect(checkFileGuide(guidePage({ tool: twice }), want)).toContain('2 raízes de ferramenta (pede 1)');
    expect(checkFileGuide(guidePage({ toolPath: '/png-to-jpg/' }), want).join()).toMatch(/o link da ferramenta leva a \/png-to-jpg\//);
  });

  it('fails a guide whose AdSlot comes before the tool, or that has a third AdSlot', () => {
    const early = guidePage({ edit: (html) => html.replace('<div id="fo-tool-root"', '<div class="fo-ad fo-ad--content"></div><div id="fo-tool-root"').replace(/<div class="fo-ad fo-ad--content"><span class="fo-ad__label">Advertisements<\/span><\/div>/, '') });
    expect(checkFileGuide(early, want).join()).toMatch(/a ferramenta embutida vem antes de o AdSlot de conteúdo|o AdSlot de conteúdo vem antes|vem antes de/);
    const three = guidePage({ edit: (html) => html.replace('<section data-content="sources">', '<div class="fo-ad"></div><div class="fo-ad"></div><section data-content="sources">') });
    expect(checkFileGuide(three, want)).toContain('3 AdSlots (no máximo 2)');
  });

  it('fails a guide whose measured table, date or sources are missing, and one with more than six related cards', () => {
    expect(checkFileGuide(guidePage({ edit: (html) => html.replace(/<div class="fo-table-wrap">.*?<\/div>/s, '') }), want)).toContain('a seção medida sem tabela em .fo-table-wrap');
    expect(checkFileGuide(guidePage({ edit: (html) => html.replace('Measured on November 1, 2026.', 'Measured recently.') }), want)).toContain('a seção medida sem a data da medida');
    expect(checkFileGuide(guidePage({ edit: (html) => html.replace(/<time datetime="2026-11-01">November 1, 2026<\/time>\.<\/li>/, '</li>') }), want).join()).toMatch(/fonte sem a data da leitura/);
    const cards = Array.from({ length: 7 }, (_, i) => `<li><a class="fo-tool" href="/t${i}/">T</a></li>`).join('');
    expect(checkFileGuide(guidePage({ edit: (html) => html.replace(/<ul class="fo-grid">.*?<\/ul>/s, `<ul class="fo-grid">${cards}</ul>`) }), want)).toContain('7 relacionadas (no máximo 6)');
  });

  it('fails a filler phrase in the text of the guide (decision 5.7)', () => {
    for (const phrase of ['In today’s world, photos are big.', 'Let us delve into the formats.', "It's important to note that JPG is lossy.", 'In conclusion, use JPG.']) {
      expect(findFiller(phrase), phrase).not.toEqual([]);
      expect(checkFileGuide(guidePage({ extra: phrase }), want).join(), phrase).toMatch(/frase de enchimento/);
    }
    expect(FILLER.map((entry) => entry.label)).toEqual(expect.arrayContaining(["in today's world", 'delve', "it's important to note", 'in conclusion']));
    expect(findFiller('The conclusion of the measurement is in the table.')).toEqual([]);
  });
});

describe('portão de conteúdo: o script sobre um dist de teste', () => {
  const root = mkdtempSync(join(tmpdir(), 'fileorca-conteudo-'));
  afterAll(() => rmSync(root, { recursive: true, force: true }));
  const gate = resolve('scripts/gates/conteudo.ts');

  function write(dir: string, path: string, html: string): void {
    const file = join(dir, fileForPath(path));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
  }

  /** Blocks that belong to one page only: steps, specs and questions carry the page's own tag. */
  const ownBlocks = (tag: string): Partial<Record<ContentBlock, string>> => ({
    how: `<section data-content="how"><ol><li>Drop for ${tag}</li><li>Pick for ${tag}</li><li>Download for ${tag}</li></ol></section>`,
    specs: `<section data-content="specs"><table><tbody><tr><td>Tool</td><td>${tag}</td></tr></tbody></table></section>`,
    faq: `<section data-content="faq">${faq(4, tag)}</section>`,
  });
  const headOf = (tag: string): string => `<title>${tag} | FileOrca</title><meta name="description" content="Description of ${tag}">`;

  /**
   * A site where every tool page has its own text, so that the only repeats are the shared blocks. F6: each page in the
   * words of its language (the calculators of ES_CALC_IDS in Spanish, the PDF pages and the hub in the three languages).
   */
  function build(dir: string): void {
    for (const entry of allPages()) {
      const id = entry.route.id;
      if (isCalcPage(id) || isBrCalc(id) || isLifeCalc(id)) {
        write(dir, entry.path, calcPage(`${id} ${entry.lang}`, undefined, entry.lang));
        continue;
      }
      if (isPdfPage(id)) {
        write(dir, entry.path, pdfPage({ id, lang: entry.lang }));
        continue;
      }
      if (id === PDF_HUB_ID) {
        write(dir, entry.path, pdfHub({ lang: entry.lang }));
        continue;
      }
      if (isFileGuide(id)) {
        const toolPath = ROUTES.find((route) => route.id === FILE_GUIDES[id].tool)?.paths.en ?? '/';
        write(dir, entry.path, guidePage({ toolPath, edit: (html) => html.replace('<title>A guide | FileOrca</title>', `<title>${id} | FileOrca</title>`).replace('content="A guide to a tool."', `content="Guide ${id}."`) }));
        continue;
      }
      if (!isImagePage(id)) {
        write(dir, entry.path, `<html><head><title>${id} ${entry.lang}</title><meta name="description" content="Page ${id} ${entry.lang}"></head><body><p>${id}</p></body></html>`);
        continue;
      }
      const tag = `${id} ${entry.lang}`;
      write(dir, entry.path, page(ownBlocks(tag), headOf(tag)));
    }
    write(dir, '/404.html', '<html><head><title>Not found</title></head><body><p>Coming soon</p></body></html>');
    write(dir, '/pt/404.html', '<html><head><title>Not found</title></head><body><p>Em breve</p></body></html>');
  }

  function run(dir: string): { status: number | null; output: string } {
    const result = spawnSync(process.execPath, [gate], { cwd: dir, encoding: 'utf8' });
    return { status: result.status, output: `${result.stdout}${result.stderr}` };
  }

  // The counts of the summary line, read from the route map (F6): 33 image pages (11 × 3; 13 before), the calculators in
  // each of their languages (18 in English, 5 in Spanish and the Brazilian ones once their rows are in the map; 18 before)
  // and the PDF pages (13 × 3; 13 before).
  const imageCount = allPages().filter((entry) => isImagePage(entry.route.id)).length;
  // F7: and the 11 home and health calculators, in English (DECISOES § 259).
  const calcCount = allPages().filter((entry) => isCalcPage(entry.route.id) || isBrCalc(entry.route.id) || isLifeCalc(entry.route.id)).length;
  const pdfCount = allPages().filter((entry) => isPdfPage(entry.route.id) || entry.route.id === PDF_HUB_ID).length;

  it('passes on a complete site, whose 404 pages repeat a title and hold placeholder wording', () => {
    expect(imageCount).toBe(11 * 3);
    expect(calcCount).toBeGreaterThanOrEqual(18 + 5);
    expect(pdfCount).toBe(13 * 3);
    const dir = join(root, 'site');
    build(dir);
    const result = run(dir);
    expect(result.output).toMatch(new RegExp(`conteúdo: ok, ${imageCount} página\\(s\\) de ferramenta e de preset, ${calcCount} de calculadora`));
    expect(result.status).toBe(0);
  });

  it('fails a Portuguese or Spanish page that still says the English words (F6: an untranslated stub)', () => {
    const dir = join(root, 'stub');
    build(dir);
    // The Portuguese Merge PDF with the English page, and the Spanish mortgage calculator with the English privacy note.
    const merge = routeById('merge-pdf').paths.pt ?? '';
    const hub = routeById(PDF_HUB_ID).paths.es ?? '';
    const mortgage = routeById('mortgage-calculator').paths.es ?? '';
    write(dir, merge, pdfPage({ id: 'merge-pdf', head: '<title>Juntar PDF: stub | FileOrca</title><meta name="description" content="Stub.">' }).replace(/<h1>Merge PDF<\/h1>/, '<h1>Juntar PDF</h1>').replace(enCommon.seal, TEXTS.pt.common.seal));
    write(dir, mortgage, calcPage('mortgage-calculator es'));
    write(dir, hub, pdfHub({ lang: 'es', privacy: 'Every tool works in your browser and no file is ever sent to a server.' }));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain(`${merge}: o bloco specs não diz o que a ferramenta aceita`);
    expect(result.output).toContain(`${merge}: o bloco privacy não diz que o trabalho é feito no aparelho ou no navegador`);
    expect(result.output).toContain(`${mortgage}: o bloco privacy não diz "tus números se quedan en tu dispositivo"`);
    expect(result.output).toContain(`${hub}: a seção de privacidade não diz que o trabalho é feito no aparelho e que nada é enviado`);
    // The English pages of the same site still pass: no English page is named.
    expect(result.output).not.toContain('/merge-pdf/:');
    expect(result.output).not.toContain('/mortgage-calculator/:');
  });

  it('fails when a calculator loses its privacy phrase or a preset repeats its parent', () => {
    const dir = join(root, 'calc');
    build(dir);
    write(dir, '/auto-loan-calculator/', calcPage('auto-loan-calculator en', (html) => html.replace('Your numbers stay on your device.', 'Private.')));
    write(dir, '/mortgage-calculator/biweekly/', calcPage('mortgage-calculator en'));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain('/auto-loan-calculator/: o bloco privacy não diz');
    expect(result.output).toMatch(/\/mortgage-calculator\/biweekly\/: só \d bloco\(s\) próprio/);
  });

  it('counts the 12 PDF tools and the hub in each of their languages, read from the PDF registry and the route map', () => {
    const dir = join(root, 'pdf-count');
    build(dir);
    expect(run(dir).output).toMatch(new RegExp(`${calcCount} de calculadora, ${pdfCount} de PDF \\(as ferramentas e o hub\\)`));
    // A language the map has but the dist lacks is a missing page, by name.
    rmSync(join(dir, fileForPath(routeById('split-pdf').paths.es ?? '')));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain(`${routeById('split-pdf').paths.es}: a página não existe no dist`);
  });

  it('fails when a PDF page loses its seal or breaks a rule, and when a PDF page or the hub is missing', () => {
    const dir = join(root, 'pdf-rules');
    build(dir);
    write(dir, '/merge-pdf/', pdfPage({ id: 'merge-pdf', top: '<div class="fo-top"><h1>Merge PDF</h1></div>' }));
    write(dir, '/compress-pdf/', pdfPage({ id: 'compress-pdf', rows: BASE_ROWS }));
    write(dir, '/protect-pdf/', pdfPage({ id: 'protect-pdf', extra: '<p>The best way to protect a PDF.</p>' }));
    rmSync(join(dir, fileForPath('/sign-pdf/')));
    rmSync(join(dir, fileForPath(`/${PDF_HUB_ID}/`)));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain('/merge-pdf/: sem o PrivacySeal (.fo-seal) junto do H1');
    expect(result.output).toContain('/compress-pdf/: o bloco specs não tem uma linha para o modo "lossless"');
    expect(result.output).toContain('/protect-pdf/: afirmação sem medida na página: best');
    expect(result.output).toContain('/sign-pdf/: a página não existe no dist');
    expect(result.output).toContain('/pdf-tools/: a página não existe no dist');
  });

  it('fails when the hub drops a card of the registry', () => {
    const dir = join(root, 'pdf-hub');
    build(dir);
    write(dir, `/${PDF_HUB_ID}/`, pdfHub({ cards: HUB.paths.filter((path) => path !== '/unlock-pdf/') }));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain('/pdf-tools/: faltam os cartões de /unlock-pdf/');
  });

  it('checks the ten file guides of the registry, and fails when one loses its tool or is missing (F5b)', () => {
    const dir = join(root, 'guides');
    build(dir);
    expect(run(dir).output).toMatch(new RegExp(`${pdfCount} de PDF \\(as ferramentas e o hub\\), 10 guia\\(s\\) de arquivo`));
    write(dir, '/guides/jpg-vs-png/', guidePage({ toolPath: '/png-to-jpg/', tool: '' }));
    rmSync(join(dir, fileForPath('/guides/split-pdf-file-size/')));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain('/guides/jpg-vs-png/: sem a ferramenta embutida (#fo-tool-root)');
    expect(result.output).toContain('/guides/split-pdf-file-size/: a página não existe no dist');
  });

  it('fails with the page and the block when a tool page loses one', () => {
    const dir = join(root, 'block');
    build(dir);
    write(dir, '/rotate-image/', page(ownBlocks('rotate-image en'), headOf('rotate-image en')).replace(/<section data-content="faq">.*?<\/section>/, ''));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain('/rotate-image/: sem o bloco faq');
  });

  it('fails when a preset repeats its parent', () => {
    const dir = join(root, 'preset');
    build(dir);
    write(dir, '/compress-image/to-100kb/', page(ownBlocks('compress-image en'), headOf('compress-image-to-100kb en')));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain('/compress-image/to-100kb/: só 0 bloco(s) próprio(s)');
  });

  it('fails on a missing page, a shared title and a placeholder anywhere in the site', () => {
    const dir = join(root, 'site-wide');
    build(dir);
    write(dir, '/about/', '<html><head><title>compress-image en | FileOrca</title><meta name="description" content="x"></head><body><p>More tools are coming.</p></body></html>');
    rmSync(join(dir, fileForPath('/heic-to-jpg/')));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain('/heic-to-jpg/: a página não existe no dist');
    expect(result.output).toContain('/about/: texto provisório "more tools are coming"');
    expect(result.output).toMatch(/título repetido em/);
  });
});
