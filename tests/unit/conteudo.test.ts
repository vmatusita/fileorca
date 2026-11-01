import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  CALC_BLOCKS,
  CLAIMS,
  CONTENT_BLOCKS,
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
import { ROUTES, languagesOf } from '../../src/i18n/routes.ts';
import enCommon from '../../src/i18n/en/common.ts';
import { IMAGE_PAGES, IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { CALC_PAGES, CALC_PRESET_IDS } from '../../src/tools/calc/registry.ts';
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

/** A calculator page with the four blocks of the F4 (how, faq, privacy, related), each with the page's own tag. */
function calcPage(tag: string, change: (html: string) => string = (html) => html): string {
  const blocks = [
    `<section data-content="how"><ol><li>Enter for ${tag}</li><li>Type for ${tag}</li><li>Read for ${tag}</li></ol></section>`,
    `<section data-content="faq">${faq(4, tag)}</section>`,
    '<section data-content="privacy"><p>Your numbers stay on your device. Nothing you type is sent anywhere.</p></section>',
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
  });
});

// ---- F5a: the PDF tool pages and the PDF hub (prompt F5a, decision 9) -------------------------------------------------

const ANSWER = 'This answer says what the tool does in a few plain words, so a visitor can go on.';
const pdfFaq = (count: number): string =>
  `<div class="fo-faq">${Array.from({ length: count }, (_, i) => `<details><summary>Question ${i + 1} about the tool?</summary><div><p>${ANSWER} (${i + 1})</p></div></details>`).join('')}</div>`;

/** The mode rows a fake page of this tool carries: one row per mode, headed by the mode. */
const modeRows = (id: PdfToolId): [string, string][] => (PDF_MODES[id] ?? []).map(({ mode }) => [mode, `What the ${mode} does to the file.`]);

const BASE_ROWS: [string, string][] = [
  ['Files it takes', 'PDF files. Oli checks what is inside the file, not its name.'],
  ['How many files', 'No limit on the number of files.'],
  ['Form fields', 'Fields on the pages you keep stay.'],
  ['Bookmarks and links', 'Bookmarks and the links between kept pages stay.'],
];
const tableOf = (rows: [string, string][]): string =>
  `<section data-content="specs"><table><thead><tr><th scope="col">Detail</th><th scope="col">What happens</th></tr></thead><tbody>${rows.map(([head, text]) => `<tr><th scope="row">${head}</th><td>${text}</td></tr>`).join('')}</tbody></table></section>`;

interface FakePdf {
  id?: PdfToolId;
  top?: string;
  head?: string;
  how?: string;
  rows?: [string, string][];
  faq?: string;
  privacy?: string;
  related?: string;
  extra?: string;
}

/** A PDF tool page that passes every rule; each test changes one thing. */
function pdfPage(fake: FakePdf = {}): string {
  const id = fake.id ?? 'merge-pdf';
  const name = enCommon.pdf[id].name;
  const top = fake.top ?? `<div class="fo-top"><h1>${name}</h1><span class="fo-seal"><svg></svg>${enCommon.seal}</span></div>`;
  const head = fake.head ?? `<title>${name}: do the job in your browser | FileOrca</title><meta name="description" content="${name} in your browser, with nothing uploaded.">`;
  const how = fake.how ?? '<section data-content="how"><ol><li>Drop the PDF</li><li>Pick an option</li><li>Download the result</li></ol></section>';
  const specs = tableOf(fake.rows ?? [...BASE_ROWS, ...modeRows(id)]);
  const faq = `<section data-content="faq">${fake.faq ?? pdfFaq(4)}</section>`;
  const secret = PDF_SECRETS[id];
  const privacyText = `Your PDF is handled on your device, in your browser, and is never sent to a server.${secret ? ` Your ${secret.source.replace(/\\b/g, '')} is not kept.` : ''}`;
  const privacy = fake.privacy ?? `<section data-content="privacy"><p>${privacyText}</p></section>`;
  const related = fake.related ?? `<section data-content="related"><ul>${PDF_PAGES[id].related.slice(0, 3).map((target) => `<li><a class="fo-tool" href="/${target}/">${target}</a></li>`).join('')}</ul></section>`;
  return `<!doctype html><html><head>${head}</head><body><main>${top}${how}${specs}${faq}${privacy}${related}${fake.extra ?? ''}</main></body></html>`;
}

const wantOf = (id: PdfToolId) => ({ id, name: enCommon.pdf[id].name, seal: enCommon.seal });
const problemsOf = (html: string, id: PdfToolId = 'merge-pdf'): string => checkPdfPage(html, wantOf(id)).join('\n');

describe('portão de conteúdo: as páginas de PDF (F5a)', () => {
  it('reads the 12 tools from the PDF registry and tells them from every other route', () => {
    expect(PDF_TOOL_IDS).toHaveLength(12);
    for (const id of PDF_TOOL_IDS) expect(isPdfPage(id), id).toBe(true);
    for (const id of [PDF_HUB_ID, 'home', 'image-to-pdf', 'compress-image', 'privacy', 'constructor', 'toString']) expect(isPdfPage(id), id).toBe(false);
    // Every tool of the registry is a page of the route map, in English only.
    for (const id of PDF_TOOL_IDS) {
      const route = ROUTES.find((candidate) => candidate.id === id);
      expect(route, id).toBeDefined();
      expect(route ? languagesOf(route) : [], id).toEqual(['en']);
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
interface FakeHub {
  head?: string;
  h1?: string;
  cards?: readonly string[];
  guide?: readonly string[] | null;
  privacy?: string | null;
  extra?: string;
}
/** A PDF hub that passes every rule; each test changes one thing. */
function pdfHub(fake: FakeHub = {}): string {
  const head = fake.head ?? `<title>${enCommon.pdfTools}: merge, split and more | FileOrca</title><meta name="description" content="Free PDF tools in your browser.">`;
  const cards = (fake.cards ?? HUB.paths).map((path) => `<li><a class="fo-tool" href="${path}">${path}</a></li>`).join('');
  const guide = fake.guide === null ? '' : `<section aria-labelledby="guide"><h2 id="guide">Which tool?</h2><ul>${(fake.guide ?? HUB.paths).map((path) => `<li><a href="${path}">${path}</a></li>`).join('')}</ul></section>`;
  const privacy = fake.privacy === null ? '' : `<section aria-labelledby="privacy"><h2 id="privacy">Privacy</h2><p>${fake.privacy ?? 'Every tool works in your browser and no file is ever sent to a server.'}</p></section>`;
  return `<!doctype html><html><head>${head}</head><body><main><h1>${fake.h1 ?? 'Free PDF tools that never upload your files'}</h1><ul>${cards}</ul>${guide}${privacy}${fake.extra ?? ''}</main></body></html>`;
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

describe('portão de conteúdo: páginas lidas do mapa de rotas', () => {
  it('knows the 11 pages of the registry and nothing else', () => {
    expect(IMAGE_TOOL_IDS.length + IMAGE_PRESET_IDS.length).toBe(11);
    for (const id of Object.keys(IMAGE_PAGES)) expect(isImagePage(id), id).toBe(true);
    for (const id of ['home', 'image-tools', 'privacy', 'not-found', 'constructor', 'toString']) expect(isImagePage(id), id).toBe(false);
  });

  it('finds every page of the registry in the route map: Compress image in three languages, the rest in English', () => {
    const found = allPages().filter((entry) => isImagePage(entry.route.id));
    expect(found).toHaveLength(13);
    for (const id of Object.keys(IMAGE_PAGES)) {
      const route = ROUTES.find((candidate) => candidate.id === id);
      expect(route, id).toBeDefined();
      expect(route ? languagesOf(route) : [], id).toEqual(id === 'compress-image' ? ['en', 'pt', 'es'] : ['en']);
    }
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

  /** A site where every tool page has its own text, so that the only repeats are the shared blocks. */
  function build(dir: string): void {
    for (const entry of allPages()) {
      const id = entry.route.id;
      if (isCalcPage(id)) {
        write(dir, entry.path, calcPage(`${id} ${entry.lang}`));
        continue;
      }
      if (isPdfPage(id)) {
        write(dir, entry.path, pdfPage({ id }));
        continue;
      }
      if (id === PDF_HUB_ID) {
        write(dir, entry.path, pdfHub());
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

  it('passes on a complete site, whose 404 pages repeat a title and hold placeholder wording', () => {
    const dir = join(root, 'site');
    build(dir);
    const result = run(dir);
    expect(result.output).toMatch(/conteúdo: ok, 13 página\(s\) de ferramenta e de preset, 18 de calculadora/);
    expect(result.status).toBe(0);
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

  it('counts the 12 PDF tools and the hub, read from the PDF registry', () => {
    const dir = join(root, 'pdf-count');
    build(dir);
    expect(run(dir).output).toMatch(/18 de calculadora, 13 de PDF \(as ferramentas e o hub\)/);
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
    expect(run(dir).output).toMatch(/13 de PDF \(as ferramentas e o hub\), 10 guia\(s\) de arquivo/);
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
