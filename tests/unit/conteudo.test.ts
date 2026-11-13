import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
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
  QR_BLOCKS,
  QR_NEVER_OPENS,
  QR_PRIVACY_PHRASE,
  QR_PRIVACY_PHRASES,
  calcComparisonPaths,
  checkCalcPage,
  checkGuidesHub,
  checkPdfHub,
  checkPdfPage,
  checkPresetPage,
  checkQrPage,
  checkSite,
  checkToolPage,
  comparisonPaths,
  findClaims,
  findPlaceholders,
  GUIDES_HUB_WORDS,
  guidesHubWords,
  isCalcPage,
  isImagePage,
  isNotFoundPath,
  isPdfPage,
  normalizeText,
  pathOfFile,
  pdfComparisonPaths,
  type ContentBlock,
} from '../../scripts/lib/conteudo.ts';
import { allPages, fileForPath } from '../../scripts/lib/dist.ts';
import { LANGS, QR_ID, ROUTES, languagesOf, routeById, type Lang } from '../../src/i18n/routes.ts';
import enCommon from '../../src/i18n/en/common.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import qrTexts from '../../src/tools/qr-code-generator/i18n/en.ts';
import ptQrTexts from '../../src/tools/qr-code-generator/i18n/pt.ts';
import esQrTexts from '../../src/tools/qr-code-generator/i18n/es.ts';
import type { QrPageTexts } from '../../src/tools/qr-code-generator/types.ts';
import { longDate } from '../../src/i18n/dates.ts';
import { IMAGE_PAGES, IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { CALC_PAGES, CALC_PRESET_IDS, isBrCalc, isLifeCalc } from '../../src/tools/calc/registry.ts';
import { PDF_HUB_ID, PDF_PAGES, PDF_PRESET_IDS, PDF_TOOL_IDS, type PdfPageId, type PdfToolId } from '../../src/tools/pdf/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS, GUIDES_HUB_ID, isFileGuide } from '../../src/tools/guides/registry.ts';
import { HUB_GROUPS, hubGroup, hubGuides } from '../../src/tools/guides/hub.ts';
import { fmt, groupDigits } from '../../src/i18n/format.ts';
import { FILLER, FILLER_BY_LANG, MAX_GUIDE_WORDS, MEASURED_DATE, MIN_GUIDE_WORDS, checkFileGuide, findFiller, guideWords } from '../../scripts/lib/file-guides.ts';

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
// The languages adjustment: `lang` writes the note of the measurement as the page of that language does ("Medido em 1 de
// novembro de 2026.", with the date of src/i18n/dates.ts).
const GUIDE_SENTENCE = 'The photo goes into the tool and comes back lighter than it was.';
const MEASURED_NOTE: Record<Lang, string> = {
  en: 'Measured on November 1, 2026.',
  pt: `Medido em ${longDate('2026-11-01', 'pt')}.`,
  es: `Medido el ${longDate('2026-11-01', 'es')}.`,
};
// F13b (UX-13 A; DECISOES § 376 and § 565): the order of the page is the trail, the H1, the signature in one line, the
// sheet "What we measured", the tool, the introduction, the text with the ads and the link to the tool's page, the
// measurements with the history line, the sources and the related pages. `oldGuidePage` is the page as it was before.
function guidePage(options: { words?: number; tool?: string; toolPath?: string; extra?: string; lang?: Lang; edit?: (html: string) => string } = {}): string {
  const sentences = Math.ceil((options.words ?? 900) / 13);
  const text = Array.from({ length: sentences }, () => GUIDE_SENTENCE).join(' ');
  const html = `<!doctype html><html><head><title>A guide | FileOrca</title><meta name="description" content="A guide to a tool."></head><body><main>
    <nav aria-label="Breadcrumb"><ol class="fo-crumbs"><li><a href="/">Home</a></li><li><span aria-current="page">A guide</span></li></ol></nav>
    <div class="fo-top fo-top--calc" data-guide-text><h1 class="fo-h1">A guide</h1><p class="fo-lead">What does the tool do?</p>
    <p class="fo-reviewed fo-sig">Reviewed by Victor · <time datetime="2026-11-01">Nov 1, 2026</time></p></div>
    <section class="fo-sheet" data-content="facts"><h2 class="fo-sheet__title">What we measured</h2><dl class="fo-sheet__list"><div class="fo-sheet__stat"><dt>Size</dt><dd class="fo-sheet__n">+25%</dd></div></dl><p class="fo-sheet__sample">10 photos. <a href="#measured">See the table</a>.</p></section>
    <section class="fo-section fo-prose fo-guide__tool" data-guide-text><h2 id="guide-tool">Use the tool here</h2></section>
    ${options.tool ?? '<div id="fo-tool-root" data-props="{}"><div class="fo-tool-island"></div></div>'}
    <p class="fo-guide__toolintro" data-guide-text>Drop a photo and it comes back lighter.</p>
    <div class="fo-prose fo-guide" data-guide-text><p>${text}</p></div>
    <section data-guide-text><h2>More</h2><p>${options.extra ?? 'More text.'}</p>
    <div class="fo-ad fo-ad--content"><span class="fo-ad__label">Advertisements</span></div>
    <p>Even more text.</p><p class="fo-guide__link">The panel above is the same tool as our <a href="${options.toolPath ?? '/heic-to-jpg/'}">HEIC to JPG page</a>.</p></section>
    <section data-content="measured"><h2 id="measured">Photo by photo</h2><div class="fo-table-wrap"><table><tbody><tr><th>Photo</th><td>1 MB</td></tr></tbody></table></div>
    <p class="fo-reviewed">${MEASURED_NOTE[options.lang ?? 'en']}</p><p class="fo-reviewed fo-guide__history">First version, published on <time datetime="2026-11-01">Nov 1, 2026</time>.</p></section>
    <section data-content="sources"><h2>Sources</h2><ul><li><a href="https://support.apple.com/en-us/116944">Apple</a>. Read on <time datetime="2026-11-01">November 1, 2026</time>.</li></ul></section>
    <section data-content="author"><h2>About the author</h2><p><a href="${routeById('about').paths[options.lang ?? 'en']}" rel="author">Victor Yuki Matusita</a> makes FileOrca.</p></section>
    <section data-content="related"><h2>Related</h2><ul class="fo-grid"><li><a class="fo-tool" href="/compress-image/">Compress image</a></li></ul></section>
    <div class="fo-ad fo-ad--multiplex"><span class="fo-ad__label">Advertisements</span></div>
  </main></body></html>`;
  return options.edit ? options.edit(html) : html;
}

/** A guide built the way FileGuideView rendered one before the F13b (the test of the old order). */
function oldGuidePage(): string {
  const text = Array.from({ length: Math.ceil(900 / 13) }, () => GUIDE_SENTENCE).join(' ');
  return `<!doctype html><html><head><title>A guide | FileOrca</title></head><body><main>
    <nav aria-label="Breadcrumb"><ol class="fo-crumbs"><li><a href="/">Home</a></li><li><span aria-current="page">A guide</span></li></ol></nav>
    <div class="fo-top fo-top--calc" data-guide-text><h1 class="fo-h1">A guide</h1><p class="fo-lead">What does the tool do?</p>
    <p class="fo-reviewed">Reviewed by Victor on <time datetime="2026-11-01">November 1, 2026</time>. First published <time datetime="2026-11-01">November 1, 2026</time>.</p></div>
    <div class="fo-prose fo-guide" data-guide-text><p>${text}</p></div>
    <div id="fo-tool-root" data-props="{}"><div class="fo-tool-island"></div></div>
    <p class="fo-guide__open"><a href="/heic-to-jpg/">Open the HEIC to JPG tool</a></p>
    <section data-guide-text><h2>More</h2><p>More text.</p>
    <div class="fo-ad fo-ad--content"><span class="fo-ad__label">Advertisements</span></div>
    <p>Even more text.</p></section>
    <section data-content="measured"><h2>What we measured</h2><div class="fo-table-wrap"><table><tbody><tr><th>Photo</th><td>1 MB</td></tr></tbody></table></div>
    <p class="fo-reviewed">${MEASURED_NOTE.en}</p></section>
    <section data-content="sources"><h2>Sources</h2><ul><li><a href="https://support.apple.com/en-us/116944">Apple</a>. Read on <time datetime="2026-11-01">November 1, 2026</time>.</li></ul></section>
    <section data-content="related"><h2>Related</h2><ul class="fo-grid"><li><a class="fo-tool" href="/compress-image/">Compress image</a></li></ul></section>
    <div class="fo-ad fo-ad--multiplex"><span class="fo-ad__label">Advertisements</span></div>
  </main></body></html>`;
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
    // F6: in Spanish a preset is compared with the Spanish pages only. Since the languages adjustment the four presets have
    // a Spanish page, so a Spanish preset is compared with its Spanish parent and its Spanish siblings, in the English order.
    const es = (id: keyof typeof CALC_PAGES): string => CALC_PAGES[id].es.path;
    expect(calcComparisonPaths('mortgage-calculator-biweekly', 'es')).toEqual([es('mortgage-calculator'), es('mortgage-calculator-extra-payments'), es('mortgage-calculator-15-vs-30-year')]);
    expect(calcComparisonPaths('loan-amortization-calculator-balloon-payment', 'es')).toEqual([es('loan-amortization-calculator')]);
    for (const id of CALC_PRESET_IDS) expect(calcComparisonPaths(id, 'es'), id).toEqual(calcComparisonPaths(id).map((path) => Object.values(CALC_PAGES).find((page) => page.path === path)?.es.path));
    // No US money page exists in Portuguese.
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

// ---- F7, decision 8: the QR code generator page ---------------------------------------------------------------------

/** The real texts of the QR page in each language (Portuguese and Spanish since the languages adjustment). */
const QR_TEXTS: Record<Lang, QrPageTexts> = { en: qrTexts, pt: ptQrTexts, es: esQrTexts };

/**
 * A privacy note of the QR page in each language, written here: the fake site of the script test has its pages in the words
 * of their language whatever the real texts say, as its calculators do (calcPage).
 */
const QR_NOTE: Record<Lang, string> = {
  en: 'Your text stays on your device. FileOrca never opens the link you type and never sends a request to it.',
  pt: 'Seu texto fica no seu aparelho. O FileOrca nunca abre o link que você digita e nunca manda um pedido para ele.',
  es: 'Tu texto se queda en tu dispositivo. FileOrca nunca abre el enlace que escribes ni le envía una solicitud.',
};

/** A QR page with its four blocks, made from the real texts of src/tools/qr-code-generator/i18n/<lang>.ts (English by default). */
function qrPage(change: (html: string) => string = (html) => html, t: QrPageTexts = qrTexts): string {
  const questions = t.faq.map((item) => `<details><summary>${item.q}</summary><div><p>${item.a}</p></div></details>`).join('');
  const blocks = [
    `<section data-content="how"><ol>${t.howSteps.map((step) => `<li>${step}</li>`).join('')}</ol></section>`,
    `<section data-content="faq"><div class="fo-faq">${questions}</div></section>`,
    `<section data-content="privacy"><p>${t.privacyNote}</p></section>`,
    `<section data-content="related"><ul><li><a class="fo-tool" href="/resize-image/">Resize image</a></li></ul></section>`,
  ].join('');
  return change(`<!doctype html><html><head><title>${t.title} | FileOrca</title><meta name="description" content="${t.description}"></head><body><main><h1>${t.h1}</h1>${blocks}</main></body></html>`);
}

describe('portão de conteúdo: o gerador de QR code (F7)', () => {
  it('accepts the page built from its real texts (positive control)', () => {
    expect(QR_BLOCKS).toEqual(['how', 'faq', 'privacy', 'related']);
    expect(checkQrPage(qrPage())).toEqual([]);
    expect(qrTexts.howSteps.length).toBeGreaterThanOrEqual(3);
    expect(qrTexts.faq.length).toBeGreaterThanOrEqual(4);
    expect(normalizeText(qrTexts.privacyNote)).toContain(QR_PRIVACY_PHRASE);
  });

  it('requires each of the four blocks', () => {
    for (const name of QR_BLOCKS) expect(checkQrPage(qrPage((html) => html.replace(`data-content="${name}"`, 'data-x="y"'))).join('\n'), name).toMatch(new RegExp(`sem o bloco ${name}`));
  });

  it('needs 3 steps, 4 real questions and a related link', () => {
    const steps = qrPage((html) => html.replace(/<section data-content="how"><ol>(.*?)<\/ol>/, (_match, items: string) => `<section data-content="how"><ol>${items.split('</li>').slice(0, 2).join('</li>')}</li></ol>`));
    expect(checkQrPage(steps).join()).toMatch(/how tem 2 passo/);
    const three = qrPage((html) => html.replace(/<div class="fo-faq">(.*?)<\/div><\/section>/, (_match, items: string) => `<div class="fo-faq">${items.split('</details>').slice(0, 3).join('</details>')}</details></div></section>`));
    expect(checkQrPage(three).join()).toMatch(/faq tem 3 pergunta/);
    const noMark = qrPage((html) => html.replace(`${qrTexts.faq[0]?.q}`, 'Do these QR codes expire'));
    expect(checkQrPage(noMark).join()).toMatch(/não termina em \?/);
    expect(checkQrPage(qrPage((html) => html.replace('href="/resize-image/"', 'href="#top"'))).join()).toMatch(/related não tem nenhum link/);
  });

  it('wants the privacy note to say the text stays on the device and the link typed is never opened', () => {
    const files = qrPage((html) => html.replace('Your text stays on your device.', 'Your files never leave your device.'));
    expect(checkQrPage(files).join()).toContain(`o bloco privacy não diz "${QR_PRIVACY_PHRASE}"`);
    const opens = qrPage((html) => html.replace('FileOrca never opens the link you type and never sends a request to it.', 'FileOrca may check the link.'));
    expect(checkQrPage(opens).join()).toMatch(/nunca abre o endereço digitado/);
  });

  it('flags an unmeasured claim', () => {
    expect(checkQrPage(qrPage((html) => html.replace('</main>', '<p>The best QR code maker.</p></main>'))).join()).toMatch(/afirmação sem medida na página: best/);
  });
});

// ---- The languages adjustment, decision 3: the QR code generator in Portuguese and Spanish -----------------------------

/** The English page with the privacy note of a language in place of the English one. */
const qrPageWithNote = (lang: Lang): string => qrPage((html) => html.replace(qrTexts.privacyNote, QR_NOTE[lang]));

describe('portão de conteúdo: o gerador de QR code em português e espanhol', () => {
  it('asks each language for its own phrases: the text stays on the device and the page never opens the link', () => {
    expect(QR_PRIVACY_PHRASES.en).toBe(QR_PRIVACY_PHRASE);
    expect(QR_PRIVACY_PHRASES).toEqual({ en: 'your text stays on your device', pt: 'seu texto fica no seu aparelho', es: 'tu texto se queda en tu dispositivo' });
    expect(Object.fromEntries(LANGS.map((lang) => [lang, QR_NEVER_OPENS[lang].words]))).toEqual({ en: 'never opens', pt: 'nunca abre', es: 'nunca abre' });
    // Positive controls: a page with the note of its language passes in that language.
    for (const lang of LANGS) expect(checkQrPage(qrPageWithNote(lang), lang), lang).toEqual([]);
    // The default stays English, as in the F7.
    expect(checkQrPage(qrPageWithNote('en'))).toEqual([]);
  });

  it('fails a page left in English in Portuguese and Spanish, and a translated note in English (negative controls)', () => {
    expect(checkQrPage(qrPage(), 'pt')).toEqual([
      'o bloco privacy não diz "seu texto fica no seu aparelho"',
      'o bloco privacy não diz que a página nunca abre o endereço digitado ("nunca abre")',
    ]);
    expect(checkQrPage(qrPage(), 'es')).toEqual([
      'o bloco privacy não diz "tu texto se queda en tu dispositivo"',
      'o bloco privacy não diz que a página nunca abre o endereço digitado ("nunca abre")',
    ]);
    expect(checkQrPage(qrPageWithNote('pt')).join()).toContain('o bloco privacy não diz "your text stays on your device"');
    expect(checkQrPage(qrPageWithNote('pt'), 'es').join()).toContain('não diz "tu texto se queda en tu dispositivo"');
    // Each phrase on its own: the device phrase without "nunca abre", and "nunca abre" without the device phrase.
    const noNever = qrPage((html) => html.replace(qrTexts.privacyNote, 'Seu texto fica no seu aparelho. O FileOrca não guarda o link.'));
    expect(checkQrPage(noNever, 'pt')).toEqual(['o bloco privacy não diz que a página nunca abre o endereço digitado ("nunca abre")']);
    const noDevice = qrPage((html) => html.replace(qrTexts.privacyNote, 'Tu texto nunca sale del navegador. FileOrca nunca abre el enlace.'));
    expect(checkQrPage(noDevice, 'es')).toEqual(['o bloco privacy não diz "tu texto se queda en tu dispositivo"']);
    // "Nunca abre" is two whole words: "nunca abrem" and "nunca abrió" are not it.
    expect(QR_NEVER_OPENS.pt.pattern.test('o fileorca nunca abrem o link')).toBe(false);
    expect(QR_NEVER_OPENS.es.pattern.test('fileorca nunca abrió el enlace')).toBe(false);
    expect(QR_NEVER_OPENS.es.pattern.test('fileorca nunca abre el enlace')).toBe(true);
  });

  it('looks for the claims of the language of the page', () => {
    expect(checkQrPage(qrPageWithNote('pt').replace('</main>', '<p>O melhor gerador de QR code.</p></main>'), 'pt').join()).toMatch(/afirmação sem medida na página: best/);
    expect(checkQrPage(qrPageWithNote('es').replace('</main>', '<p>El mejor generador de códigos QR.</p></main>'), 'es').join()).toMatch(/afirmação sem medida na página: best/);
    // The Portuguese words are not a claim in English, and the English rule is not run on a Spanish page.
    expect(checkQrPage(qrPageWithNote('en').replace('</main>', '<p>O melhor gerador.</p></main>'))).toEqual([]);
  });

  // Fails while src/tools/qr-code-generator/i18n/pt.ts and es.ts are the English stubs of the languages adjustment, and
  // passes once the writers' texts say the two phrases of their language (as the English one does above).
  it('accepts the Portuguese and Spanish pages built from their real texts', () => {
    for (const lang of ['pt', 'es'] as const) {
      const t = QR_TEXTS[lang];
      expect(checkQrPage(qrPage((html) => html, t), lang), lang).toEqual([]);
      expect(normalizeText(t.privacyNote), lang).toContain(QR_PRIVACY_PHRASES[lang]);
      expect(t.howSteps.length, lang).toBeGreaterThanOrEqual(3);
      expect(t.faq.length, lang).toBeGreaterThanOrEqual(4);
    }
  });
});

// ---- F5a: the PDF tool pages and the PDF hub (prompt F5a, decision 9) -------------------------------------------------

const ANSWER = 'This answer says what the tool does in a few plain words, so a visitor can go on.';
/**
 * F19a (decision 8; DECISOES § 765): the answers of a fake FAQ differ from each other, as on a real page. Before, the four
 * answers were the same sentence with "(1)" to "(4)" after it, which the repetition rule of the gate now fails (a sentence
 * copied into two blocks). Each one is still a real answer of 40 characters or more that says no fact of the specs.
 */
const ANSWERS: Record<Lang, readonly string[]> = {
  en: [
    'The pages keep the order of the list, and each file gets a row of its own.',
    'A damaged file is refused on its own row, and the other files carry on.',
    'The result opens in any PDF reader, on a phone or on a computer.',
    'Undo brings back the last change, and Start over clears the whole list.',
    'A long list of big files takes more memory and more time on a phone.',
  ],
  pt: [
    'As páginas seguem a ordem da lista, e cada arquivo ganha uma linha própria.',
    'Um arquivo danificado é recusado na própria linha, e os outros seguem.',
    'O resultado abre em qualquer leitor de PDF, no celular ou no computador.',
    'Desfazer traz de volta a última mudança, e Recomeçar limpa a lista inteira.',
    'Uma lista longa de arquivos grandes pede mais memória e mais tempo no celular.',
  ],
  es: [
    'Las páginas siguen el orden de la lista, y cada archivo tiene su propia fila.',
    'Un archivo dañado se rechaza en su propia fila, y los demás siguen.',
    'El resultado se abre en cualquier lector de PDF, en el teléfono o en la computadora.',
    'Deshacer recupera el último cambio, y Empezar de nuevo vacía toda la lista.',
    'Una lista larga de archivos grandes pide más memoria y más tiempo en el teléfono.',
  ],
};
const answerOf = (lang: Lang, index: number): string => ANSWERS[lang][index % ANSWERS[lang].length] ?? ANSWER;
const pdfFaq = (count: number): string =>
  `<div class="fo-faq">${Array.from({ length: count }, (_, i) => `<details><summary>Question ${i + 1} about the tool?</summary><div><p>${answerOf('en', i)}</p></div></details>`).join('')}</div>`;

/** The mode rows a fake page of this tool carries: one row per mode, headed by the mode (F6: in the language of the page). */
const modeRows = (id: PdfPageId, lang: Lang = 'en'): [string, string][] => (PDF_RULES[lang].modes[id] ?? []).map(({ mode }) => [mode, `What the ${mode} does to the file.`]);

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
const FAKE_PDF_WORDS: Record<Lang, { rows: [string, string][]; privacy: string; secret: (word: string) => string; question: string; title: string; description: string }> = {
  en: {
    rows: BASE_ROWS,
    privacy: 'Your PDF is handled on your device, in your browser, and is never sent to a server.',
    secret: (word) => ` Your ${word} is not kept.`,
    question: 'Question {n} about the tool?',
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
    title: 'hazlo en tu navegador',
    description: 'en tu navegador, sin subir nada.',
  },
};
const tableOf = (rows: [string, string][]): string =>
  `<section data-content="specs"><table><thead><tr><th scope="col">Detail</th><th scope="col">What happens</th></tr></thead><tbody>${rows.map(([head, text]) => `<tr><th scope="row">${head}</th><td>${text}</td></tr>`).join('')}</tbody></table></section>`;

interface FakePdf {
  // F18: a PDF tool or a PDF preset (the fake site of the gate builds both).
  id?: PdfPageId;
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
    : `<div class="fo-faq">${Array.from({ length: count }, (_, i) => `<details><summary>${FAKE_PDF_WORDS[lang].question.replace('{n}', String(i + 1))}</summary><div><p>${answerOf(lang, i)}</p></div></details>`).join('')}</div>`;

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

const wantOf = (id: PdfPageId, lang: Lang = 'en') => ({ id, name: TEXTS[lang].common.pdf[id].name, seal: TEXTS[lang].common.seal, ...(lang === 'en' ? {} : { lang }) });
const problemsOf = (html: string, id: PdfPageId = 'merge-pdf', lang: Lang = 'en'): string => checkPdfPage(html, wantOf(id, lang)).join('\n');

describe('portão de conteúdo: as páginas de PDF (F5a)', () => {
  // F18 (decision 6; DECISOES § 724): Organize PDF makes 13 tools (12 before), and the two PDF presets (decision 5) are PDF
  // pages of the gate too, each with the path /<parent>/<name>/ of the registry.
  it('reads the 13 tools and the 2 presets from the PDF registry and tells them from every other route', () => {
    expect(PDF_TOOL_IDS).toHaveLength(13);
    expect(PDF_PRESET_IDS).toEqual(['split-pdf-extract-pages', 'pdf-to-jpg-to-png']);
    for (const id of [...PDF_TOOL_IDS, ...PDF_PRESET_IDS]) expect(isPdfPage(id), id).toBe(true);
    for (const id of [PDF_HUB_ID, 'home', 'image-to-pdf', 'compress-image', 'rotate-image-flip', 'privacy', 'constructor', 'toString']) expect(isPdfPage(id), id).toBe(false);
    for (const id of PDF_PRESET_IDS) expect(PDF_PAGES[id].path, id).toBe(`/${PDF_PAGES[id].parent}/${id.replace(`${PDF_PAGES[id].parent}-`, '')}/`);
    // Every tool and preset of the registry is a page of the route map, in the three languages since the F6 (decision 4;
    // English only before), with the English path of the registry.
    for (const id of [...PDF_TOOL_IDS, ...PDF_PRESET_IDS]) {
      const route = ROUTES.find((candidate) => candidate.id === id);
      expect(route, id).toBeDefined();
      expect(route ? languagesOf(route) : [], id).toEqual([...LANGS]);
      expect(route?.paths.en, id).toBe(PDF_PAGES[id].path);
    }
    // The mode and secret tables name only tools of the registry and only rows of some tool.
    for (const id of [...Object.keys(PDF_MODES), ...Object.keys(PDF_SECRETS)]) expect(isPdfPage(id), id).toBe(true);
  });

  it('accepts a complete page for each of the 13 tools and the 2 presets, with the mode rows and the secret word its tool needs', () => {
    for (const id of [...PDF_TOOL_IDS, ...PDF_PRESET_IDS]) expect(checkPdfPage(pdfPage({ id }), wantOf(id)), id).toEqual([]);
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
    // F18 (decision 8; DECISOES § 729): PDF to PNG makes images too (IMAGE_RESULT); Extract pages makes a PDF, so it is asked
    // what stays, as its parent Split is (DECISOES § 728).
    expect(checkPdfPage(pdfPage({ id: 'pdf-to-jpg-to-png', rows }), wantOf('pdf-to-jpg-to-png'))).toEqual([]);
    const extract = checkPdfPage(pdfPage({ id: 'split-pdf-extract-pages', rows }), wantOf('split-pdf-extract-pages')).join();
    for (const word of [/formulário/, /marcadores/, /links/]) expect(extract).toMatch(word);
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
    // F18 (decisions 7 and 8): a PDF preset has one way of running, so no mode row is asked of it, in any language (Extract
    // pages has none of Split's three modes on screen; PDF to PNG has no format to choose).
    for (const id of PDF_PRESET_IDS) {
      for (const lang of LANGS) expect(PDF_RULES[lang].modes[id], `${id} ${lang}`).toBeUndefined();
      expect(problemsOf(pdfPage({ id, rows: BASE_ROWS }), id), id).not.toMatch(/modo/);
    }
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

// ---- F11: the guides hub (prompt F11, decision 5; DECISOES § 394) ----------------------------------------------------------

/** A card of the guides hub as the GuideCard writes it: one link, the kind first, the name in an H3. */
const guideCardHtml = (path: string): string =>
  `<li><a class="fo-guidecard fo-dogear fo-cat--image" href="${path}"><span class="fo-guidecard__kind"><strong>Guide</strong></span><h3 class="fo-guidecard__name">${path}</h3><span class="fo-guidecard__proof"><span>Measured</span></span></a></li>`;
interface FakeGuidesHub {
  lang?: Lang;
  head?: string;
  /** The line of the band (null: none). */
  intro?: string | null;
  how?: string;
  /** Paths of the registry left out of their group. */
  drop?: readonly string[];
  extra?: string;
}
/**
 * A guides hub that passes every rule, in the language asked (English by default), with the real texts of the hub and the
 * paths of the registries: each group with its cards, the money group of pt with the note. Each test changes one thing.
 */
function guidesHubPage(fake: FakeGuidesHub = {}): string {
  const lang = fake.lang ?? 'en';
  const t = TEXTS[lang].guides;
  const n = groupDigits(hubGuides(lang).length, lang);
  const head = fake.head ?? `<title>${t.title} | FileOrca</title><meta name="description" content="${fmt(t.description, { n })}">`;
  const intro = fake.intro === null ? '' : `<p class="fo-muted" data-hub-text>${fake.intro ?? fmt(t.intro, { n })}</p>`;
  const sections = HUB_GROUPS.map((group) => {
    const paths = hubGroup(group, lang).map((guide) => guide.path).filter((path) => !(fake.drop ?? []).includes(path));
    const note = t.moneyNote && hubGroup(group, lang).length === 0 ? `<p class="fo-section__note" data-hub-text>${t.moneyNote.before} <a href="/pt/calculadoras-financeiras/">${t.moneyNote.link}</a>${t.moneyNote.after}</p>` : '';
    const cards = paths.length > 0 ? `<ul class="fo-guidecards">${paths.map(guideCardHtml).join('')}</ul>` : '';
    return `<section class="fo-section" id="${group}" aria-labelledby="${group}-title"><h2 id="${group}-title">${t.groups[group].heading}</h2>${cards}${note}</section>`;
  }).join('');
  const how = `<section class="fo-section fo-prose" id="how" aria-labelledby="how-title"><h2 id="how-title">${t.howHeading}</h2><p data-hub-text>${fake.how ?? t.how}</p></section>`;
  return `<!doctype html><html><head>${head}</head><body><main><div class="fo-hubband fo-cat--guide"><span class="fo-eyebrow">${t.eyebrow}</span><h1 class="fo-h1">${t.h1}</h1>${intro}</div>${sections}${how}${fake.extra ?? ''}</main></body></html>`;
}
const guidesHubWant = (lang: Lang) => ({ paths: hubGuides(lang).map((guide) => guide.path), lang });

describe('portão de conteúdo: o hub de guias (F11)', () => {
  const problemsOf = (html: string, lang: Lang = 'en'): string => checkGuidesHub(html, guidesHubWant(lang)).join('\n');
  const someWords = (count: number): string => Array.from({ length: count }, (_, i) => `word${i}`).join(' ');

  it('accepts the complete hub in the three languages, with its own words in the range (en 91, pt 108, es 97)', () => {
    expect(GUIDES_HUB_WORDS).toEqual({ min: 60, max: 120 });
    for (const lang of LANGS) {
      expect(checkGuidesHub(guidesHubPage({ lang }), guidesHubWant(lang)), lang).toEqual([]);
      expect(guidesHubWant(lang).paths, lang).toHaveLength([15, 10, 15][LANGS.indexOf(lang)] ?? 0);
    }
    expect(LANGS.map((lang) => guidesHubWords(guidesHubPage({ lang })))).toEqual([91, 108, 97]);
  });

  it('H1, title and description: one H1, a title that starts with the name of the hub in the language', () => {
    expect(problemsOf(guidesHubPage().replace(/<h1 class="fo-h1">.*?<\/h1>/, ''))).toMatch(/0 H1, pede 1/);
    expect(problemsOf(guidesHubPage({ extra: '<h1>Again</h1>' }))).toMatch(/2 H1, pede 1/);
    expect(problemsOf(guidesHubPage({ head: '<title>Answers that show the numbers | FileOrca</title><meta name="description" content="x">' }))).toMatch(/não começa por "Guides"/);
    expect(problemsOf(guidesHubPage({ head: `<title>${TEXTS.en.guides.title} | FileOrca</title>` }))).toMatch(/sem meta description/);
    // The English title left on the Portuguese hub fails: it does not start with "Guias".
    expect(problemsOf(guidesHubPage({ lang: 'pt', head: `<title>${TEXTS.en.guides.title} | FileOrca</title><meta name="description" content="x">` }), 'pt')).toMatch(/não começa por "Guias"/);
  });

  it('its own text: the introduction in the band, and from 60 to 120 words of its own', () => {
    expect(problemsOf(guidesHubPage({ intro: null }))).toMatch(/sem a introdução própria na faixa/);
    expect(problemsOf(guidesHubPage({ intro: '' }))).toMatch(/sem a introdução própria na faixa/);
    // 32 words in the band and 20 at the end: 52, under the minimum.
    expect(problemsOf(guidesHubPage({ how: someWords(20) }))).toContain('o texto próprio tem 52 palavra(s), pede de 60 a 120');
    // 32 and 89: 121, one over the maximum; 120 passes.
    expect(problemsOf(guidesHubPage({ how: someWords(89) }))).toContain('o texto próprio tem 121 palavra(s), pede de 60 a 120');
    expect(problemsOf(guidesHubPage({ how: someWords(88) }))).toBe('');
    // A card's words are not the hub's own: a hub of only cards has no text of its own.
    expect(problemsOf(guidesHubPage({ intro: null, how: '' }))).toContain('o texto próprio tem 0 palavra(s), pede de 60 a 120');
  });

  it('cards: a GuideCard for every guide of the language in the registries, no other, none twice, and never a ToolCard', () => {
    const [first] = guidesHubWant('en').paths;
    expect(problemsOf(guidesHubPage({ drop: [first ?? ''] }))).toContain(`faltam os cartões de ${first}`);
    expect(problemsOf(guidesHubPage({ extra: guideCardHtml('/guides/not-a-guide/') }))).toContain('cartões fora do registro: /guides/not-a-guide/');
    expect(problemsOf(guidesHubPage({ extra: guideCardHtml(first ?? '') }))).toContain('um cartão aparece duas vezes');
    // A guide drawn with the ToolCard (the F5b F-12): the hub has no tool card at all.
    expect(problemsOf(guidesHubPage({ extra: `<a class="fo-tool fo-dogear fo-cat--image" href="${first}">x</a>` }))).toContain('1 cartão(ões) de ferramenta (a.fo-tool) no hub de guias');
    // A money guide on the Portuguese hub: the registries have none in pt.
    expect(problemsOf(guidesHubPage({ lang: 'pt', extra: guideCardHtml('/guides/extra-mortgage-payments/') }), 'pt')).toContain('cartões fora do registro: /guides/extra-mortgage-payments/');
  });

  it('groups: the three sections with their anchors, each with its cards or the note that says why it has none', () => {
    expect(problemsOf(guidesHubPage().replace(/<section class="fo-section" id="pdf".*?<\/section>/, ''))).toMatch(/sem a seção do grupo #pdf/);
    // Every money guide of en left out: the money group has no card and no note.
    const money = hubGroup('money', 'en').map((guide) => guide.path);
    expect(problemsOf(guidesHubPage({ drop: money }))).toContain('o grupo #money não tem cartão nem a nota que diz por quê');
    // In pt the money group is the note; without it, the group says nothing.
    const pt = guidesHubPage({ lang: 'pt' });
    expect(problemsOf(pt, 'pt')).toBe('');
    expect(problemsOf(pt.replace(/<p class="fo-section__note" data-hub-text>.*?<\/p>/, ''), 'pt')).toContain('o grupo #money não tem cartão nem a nota que diz por quê');
  });

  it('claims: the hub makes none, in its language', () => {
    expect(problemsOf(guidesHubPage({ extra: '<p>The best guides, the #1 choice.</p>' }))).toContain('afirmação sem medida na página: best');
    expect(problemsOf(guidesHubPage({ lang: 'es', extra: '<p>Las mejores guías.</p>' }), 'es')).toContain('afirmação sem medida na página: best');
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

    it(`${lang}: accepts a complete page for each of the 13 tools and the 2 presets, in the words of the language (positive control)`, () => {
      for (const id of [...PDF_TOOL_IDS, ...PDF_PRESET_IDS]) expect(checkPdfPage(pdfPage({ id, lang }), wantOf(id, lang)), `${lang} ${id}`).toEqual([]);
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
  // F18 (decisions 9 and 10; DECISOES § 724): Remove EXIF data and Flip image make 15 (11 tools and 4 presets). F17 (DECISOES
  // § 716): AVIF to JPG and Convert to WebP made 13 (10 tools and 3 presets; 11 before).
  it('knows the 15 pages of the registry and nothing else', () => {
    expect(IMAGE_TOOL_IDS.length + IMAGE_PRESET_IDS.length).toBe(15);
    for (const id of Object.keys(IMAGE_PAGES)) expect(isImagePage(id), id).toBe(true);
    for (const id of ['home', 'image-tools', 'privacy', 'not-found', 'constructor', 'toString', 'split-pdf-extract-pages']) expect(isImagePage(id), id).toBe(false);
  });

  it('finds every page of the registry in the route map, each in the three languages (F6; before, only Compress image)', () => {
    // 15 pages × 3 languages since the F18: the gate reads 45 image pages (39 since the F17; 33 before; 13 before the F6: 11
    // in English and Compress image in pt and es).
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

  // F18 (decision 5; DECISOES § 725): a PDF preset is compared, in its language, with its parent tool and the presets of the
  // same parent (none today: each parent has one), never with itself or with the presets of another parent.
  it('compares a PDF preset with its parent and the sibling presets of its language, never with itself', () => {
    expect(pdfComparisonPaths('split-pdf-extract-pages')).toEqual(['/split-pdf/']);
    expect(pdfComparisonPaths('pdf-to-jpg-to-png', 'pt')).toEqual(['/pt/pdf-para-jpg/']);
    expect(pdfComparisonPaths('pdf-to-jpg-to-png', 'es')).toEqual(['/es/pdf-a-jpg/']);
    for (const id of PDF_PRESET_IDS) {
      const parent = PDF_PAGES[id].parent;
      expect(parent, id).toBeDefined();
      const siblings = PDF_PRESET_IDS.filter((other) => other !== id && PDF_PAGES[other].parent === parent);
      for (const lang of LANGS) {
        const paths = pdfComparisonPaths(id, lang);
        expect(paths, `${id} ${lang}`).toEqual([parent, ...siblings].map((other) => routeById(other ?? 'split-pdf').paths[lang]));
        expect(paths, `${id} ${lang}`).not.toContain(routeById(id).paths[lang]);
      }
    }
    for (const id of PDF_TOOL_IDS) expect(pdfComparisonPaths(id), id).toEqual([]);
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

  // F13b (D-54; DECISOES § 565): the link to the tool's page is looked for in the text of the guide. Before, the line
  // under the panel (.fo-guide__open) had to lead to it ("o link da ferramenta leva a X em vez de Y").
  it('fails a guide without the tool, with two tools, or whose text does not link to its tool', () => {
    expect(checkFileGuide(guidePage({ tool: '' }), want)).toContain('sem a ferramenta embutida (#fo-tool-root)');
    const twice = '<div id="fo-tool-root" data-props="{}"></div><div id="fo-tool-root" data-props="{}"></div>';
    expect(checkFileGuide(guidePage({ tool: twice }), want)).toContain('2 raízes de ferramenta (pede 1)');
    expect(checkFileGuide(guidePage({ toolPath: '/png-to-jpg/' }), want)).toEqual(['sem o link para a página da ferramenta (/heic-to-jpg/) no texto do guia']);
    // A link to the tool outside the text of the guide (in the sheet, which is not data-guide-text) does not count.
    const inSheet = guidePage({ toolPath: '/png-to-jpg/', edit: (html) => html.replace('<a href="#measured">', '<a href="/heic-to-jpg/">') });
    expect(checkFileGuide(inSheet, want)).toEqual(['sem o link para a página da ferramenta (/heic-to-jpg/) no texto do guia']);
  });

  // F13b (UX-13 A, decision 5; DECISOES § 376 and § 565): the order of before the F13b fails, with each thing it lacks.
  it('fails the page of before the F13b: the introduction before the tool, no sheet, two dates on the signature and the link under the panel', () => {
    const problems = checkFileGuide(oldGuidePage(), want);
    expect(problems).toContain('sem a ficha "What we measured" ([data-content="facts"])');
    expect(problems).toContain('a introdução vem antes de a ferramenta embutida');
    expect(problems).toContain('a linha "Reviewed" com 2 datas (pede 1, a da revisão)');
    expect(problems).toContain('o link "Open the tool" embaixo do painel (.fo-guide__open): o link da ferramenta vai no texto');
    expect(problems).toContain('sem o link para a página da ferramenta (/heic-to-jpg/) no texto do guia');
    expect(problems).toContain('a seção medida sem o histórico (a data da primeira publicação)');
  });

  it('fails a sheet after the tool, a signature with no date and a measured section with no history line', () => {
    const sheet = /<section class="fo-sheet"[\s\S]*?<\/section>/;
    const late = guidePage({ edit: (html) => html.replace(sheet, '').replace('<p class="fo-guide__toolintro"', `${sheet.exec(html)?.[0] ?? ''}<p class="fo-guide__toolintro"`) });
    expect(checkFileGuide(late, want)).toContain('a ferramenta embutida vem antes de a ficha "What we measured"');
    expect(checkFileGuide(guidePage({ edit: (html) => html.replace('<time datetime="2026-11-01">Nov 1, 2026</time></p></div>', 'Nov 1, 2026</p></div>') }), want)).toEqual(['a linha "Reviewed" com 0 datas (pede 1, a da revisão)']);
    expect(checkFileGuide(guidePage({ edit: (html) => html.replace(/<p class="fo-reviewed fo-guide__history">.*?<\/p>/, '') }), want)).toEqual(['a seção medida sem o histórico (a data da primeira publicação)']);
  });

  // F12 (decision 3; DECISOES § 424): the ads of the map in a guide. Before, "two AdSlots at most"; now the first one
  // after the tool with a paragraph between them, five content ads at most, one multiplex as the last block, none in the
  // tool and none beside "What we measured".
  it('fails a guide whose first AdSlot comes before the tool or with no paragraph after it, and one with more ads than the map', () => {
    const box = '<div class="fo-ad fo-ad--content"><span class="fo-ad__label">Advertisements</span></div>';
    const early = guidePage({ edit: (html) => html.replace('<div id="fo-tool-root"', '<div class="fo-ad fo-ad--content"></div><div id="fo-tool-root"').replace(box, '') });
    expect(checkFileGuide(early, want).join()).toMatch(/a ferramenta embutida vem antes de o AdSlot de conteúdo|o AdSlot de conteúdo vem antes|vem antes de/);
    // F13b: the introduction and the paragraph of the tool come after the tool now, so the glued box has a list between
    // them and no paragraph (before, the box went right before the part, after the link under the panel).
    const glued = guidePage({
      edit: (html) =>
        html
          .replace(box, '')
          .replace(/<p class="fo-guide__toolintro"[^>]*>.*?<\/p>/, '')
          .replace(/<div class="fo-prose fo-guide" data-guide-text><p>(.*?)<\/p><\/div>/s, (_, words: string) => `<div class="fo-prose fo-guide" data-guide-text><ul><li>${words}</li></ul></div>`)
          .replace('<section data-guide-text><h2>More</h2>', `${box}<section data-guide-text><h2>More</h2>`),
    });
    expect(checkFileGuide(glued, want)).toEqual(['o 1º AdSlot sem um parágrafo entre a ferramenta e ele']);
    const six = guidePage({ edit: (html) => html.replace('<p>Even more text.</p>', `${`<p>Text.</p>${box}`.repeat(5)}<p>Even more text.</p>`) });
    expect(checkFileGuide(six, want)).toEqual(['6 AdSlots de conteúdo (no máximo 5)']);
    expect(checkFileGuide(guidePage({ edit: (html) => html.replace('<p>Even more text.</p>', `${`<p>Text.</p>${box}`.repeat(4)}<p>Even more text.</p>`) }), want)).toEqual([]);
    const multiplex = '<div class="fo-ad fo-ad--multiplex"><span class="fo-ad__label">Advertisements</span></div>';
    expect(checkFileGuide(guidePage({ edit: (html) => html.replace(multiplex, '').replace('<section data-content="related">', `${multiplex}<section data-content="related">`) }), want)).toEqual(['o multiplex não é o último bloco do <main>']);
    expect(checkFileGuide(guidePage({ edit: (html) => html.replace('</main>', `${multiplex}</main>`) }), want)).toEqual(['2 multiplex (no máximo 1)']);
    expect(checkFileGuide(guidePage({ edit: (html) => html.replace('<div class="fo-tool-island"></div>', `<div class="fo-tool-island"></div>${box}`) }), want)).toContain('um AdSlot dentro da ferramenta');
    for (const at of ['<section data-content="measured">', '<section data-content="sources">']) {
      expect(checkFileGuide(guidePage({ edit: (html) => html.replace(at, `${box}${at}`) }), want), at).toContain('um AdSlot ao lado de "What we measured"');
    }
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

// ---- The languages adjustment, decision 5: the file guides in Portuguese and Spanish ----------------------------------

describe('portão de conteúdo: os guias de arquivo em português e espanhol', () => {
  const toolPath = { pt: '/pt/heic-para-jpg/', es: '/es/heic-a-jpg/' } as const;

  it('passes a guide of each language with the date of the measurement written the way its page writes it', () => {
    for (const lang of ['pt', 'es'] as const) {
      expect(checkFileGuide(guidePage({ lang, toolPath: toolPath[lang] }), { toolPath: toolPath[lang], lang }), lang).toEqual([]);
    }
    expect(MEASURED_NOTE.pt).toBe('Medido em 1 de novembro de 2026.');
    expect(MEASURED_NOTE.es).toBe('Medido el 1 de noviembre de 2026.');
  });

  it('reads every month of src/i18n/dates.ts in its language, with a plain or a no-break space, and only there', () => {
    for (const lang of LANGS) {
      for (let month = 1; month <= 12; month += 1) {
        const written = longDate(`2026-${String(month).padStart(2, '0')}-02`, lang);
        expect(MEASURED_DATE[lang].test(`Measured: ${written}.`), `${lang} ${written}`).toBe(true);
        expect(MEASURED_DATE[lang].test(written.replace(/ /g, '\u00a0')), `${lang} ${written} with no-break spaces`).toBe(true);
      }
    }
    expect(MEASURED_DATE.en.test('November 2, 2026')).toBe(true);
    expect(MEASURED_DATE.pt.test('2 de novembro de 2026')).toBe(true);
    expect(MEASURED_DATE.es.test('2 de noviembre de 2026')).toBe(true);
    // A date of another language is not one: the English date in pt and es, the Portuguese one in es and en.
    expect(MEASURED_DATE.pt.test('November 2, 2026')).toBe(false);
    expect(MEASURED_DATE.es.test('November 2, 2026')).toBe(false);
    expect(MEASURED_DATE.es.test('2 de novembro de 2026')).toBe(false);
    expect(MEASURED_DATE.en.test('2 de novembro de 2026')).toBe(false);
    // Nor a month without its day or year.
    expect(MEASURED_DATE.pt.test('em novembro de 2026')).toBe(false);
    expect(MEASURED_DATE.es.test('2 de noviembre')).toBe(false);
  });

  it('fails a Portuguese or Spanish guide whose measured note keeps the English date, and an English guide with a translated one', () => {
    for (const lang of ['pt', 'es'] as const) {
      expect(checkFileGuide(guidePage({ toolPath: toolPath[lang] }), { toolPath: toolPath[lang], lang }), lang).toContain('a seção medida sem a data da medida');
    }
    expect(checkFileGuide(guidePage({ lang: 'pt' }), { toolPath: '/heic-to-jpg/' })).toContain('a seção medida sem a data da medida');
    expect(checkFileGuide(guidePage({ lang: 'es' }), { toolPath: '/heic-to-jpg/', lang: 'pt' })).toContain('a seção medida sem a data da medida');
  });

  // F13b (DECISOES § 565): the link is looked for in the text; before, "o link da ferramenta leva a X em vez de Y".
  it('fails a guide of a language that links to the tool page of another language', () => {
    expect(checkFileGuide(guidePage({ lang: 'pt' }), { toolPath: toolPath.pt, lang: 'pt' })).toEqual(['sem o link para a página da ferramenta (/pt/heic-para-jpg/) no texto do guia']);
  });

  it('keeps the limit of 800 to 1,500 words in every language', () => {
    for (const lang of ['pt', 'es'] as const) {
      expect(checkFileGuide(guidePage({ lang, toolPath: toolPath[lang], words: 700 }), { toolPath: toolPath[lang], lang }).join(), lang).toMatch(/palavras de texto \(pede de 800 a 1500\)/);
      expect(checkFileGuide(guidePage({ lang, toolPath: toolPath[lang], words: MAX_GUIDE_WORDS + 200 }), { toolPath: toolPath[lang], lang }).join(), lang).toMatch(/palavras de texto/);
    }
  });

  it('fails the filler phrases of Portuguese and Spanish, and an English one left in a translation', () => {
    const fillers: Record<'pt' | 'es', string[]> = {
      pt: [
        'No mundo de hoje, as fotos são grandes.',
        'Vale ressaltar que o JPG perde detalhes.',
        'É importante notar que o PNG não perde nada.',
        'Em conclusão, use JPG para fotos.',
        'Vamos mergulhar fundo nos formatos.',
        'Nem é preciso dizer que o arquivo fica menor.',
      ],
      es: [
        'En el mundo actual, las fotos pesan mucho.',
        'Cabe destacar que el JPG pierde detalles.',
        'Es importante señalar que el PNG no pierde nada.',
        'En conclusión, usa JPG para las fotos.',
        'Vamos a sumergirnos en los formatos.',
        'Huelga decir que el archivo queda más chico.',
      ],
    };
    for (const lang of ['pt', 'es'] as const) {
      expect(FILLER_BY_LANG[lang].length, lang).toBeGreaterThanOrEqual(5);
      for (const text of fillers[lang]) {
        expect(findFiller(text, lang), `${lang} ${text}`).not.toEqual([]);
        expect(checkFileGuide(guidePage({ lang, toolPath: toolPath[lang], extra: text }), { toolPath: toolPath[lang], lang }).join(), `${lang} ${text}`).toMatch(/frase de enchimento/);
        // The same phrase read as English is not English filler: each list is of its own language.
        expect(findFiller(text), `en ${text}`).toEqual([]);
      }
      // An English filler left in a translation fails too.
      expect(findFiller('In conclusion, use JPG.', lang), lang).toEqual(['in conclusion']);
    }
    expect(FILLER_BY_LANG.en).toBe(FILLER);
    // Negative controls: the words alone, in plain sentences, are not filler.
    for (const text of ['A conclusão da medida está na tabela.', 'O mundo das fotos de celular mudou com o HEIC.', 'É importante para quem envia fotos por e-mail.', 'O resumo da medida vem depois.']) expect(findFiller(text, 'pt'), text).toEqual([]);
    for (const text of ['La conclusión de la medida está en la tabla.', 'El mundo de las fotos del celular cambió con el HEIC.', 'Es importante para quien envía fotos por correo.', 'El resumen de la medida viene después.']) expect(findFiller(text, 'es'), text).toEqual([]);
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
  /** The tag of a fake calculator page: its place in the route map and its language (F19a, see build). */
  const calcTag = (id: string, lang: Lang): string => `calc ${ROUTES.findIndex((route) => route.id === id)} ${lang}`;

  /**
   * A site where every tool page has its own text, so that the only repeats are the shared blocks. F6: each page in the
   * words of its language (the calculators of ES_CALC_IDS in Spanish, the PDF pages and the hub in the three languages).
   */
  function build(dir: string): void {
    for (const entry of allPages()) {
      const id = entry.route.id;
      if (isCalcPage(id) || isBrCalc(id) || isLifeCalc(id)) {
        // F19a (decision 8; DECISOES § 765): a short tag of its own (the place of the route in the map), not the id: with the
        // longest ids ("loan-amortization-calculator-balloon-payment es"), the fake steps and answers, the same sentence around
        // the tag, reached 8 words, and the repetition rule of the gate failed them as copied sentences.
        write(dir, entry.path, calcPage(calcTag(id, entry.lang), undefined, entry.lang));
        continue;
      }
      if (isPdfPage(id)) {
        // F18 (decision 5): a PDF preset has blocks of its own (MIN_OWN_BLOCKS), as the image presets of this site have.
        const own = PDF_PAGES[id].parent
          ? {
              how: `<section data-content="how"><ol><li>Drop for ${id}</li><li>Pick for ${id}</li><li>Download for ${id}</li></ol></section>`,
              rows: [...FAKE_PDF_WORDS[entry.lang].rows, [id, `What ${id} does to the file.`] as [string, string]],
              faq: pdfFaqIn(entry.lang, 5),
            }
          : {};
        write(dir, entry.path, pdfPage({ id, lang: entry.lang, ...own }));
        continue;
      }
      if (id === PDF_HUB_ID) {
        write(dir, entry.path, pdfHub({ lang: entry.lang }));
        continue;
      }
      // F11: the guides hub, with a card for every guide of the language and the hub's own texts (DECISOES § 394).
      if (id === GUIDES_HUB_ID) {
        write(dir, entry.path, guidesHubPage({ lang: entry.lang }));
        continue;
      }
      // F7: the QR code generator, with its real English texts. The languages adjustment: in Portuguese and Spanish too, with
      // the privacy note of the language and a title and description of its own.
      if (id === QR_ID) {
        const qr = entry.lang === 'en' ? qrPage() : qrPageWithNote(entry.lang).replace(`<title>${qrTexts.title} | FileOrca</title>`, `<title>${qrTexts.title} ${entry.lang} | FileOrca</title>`).replace(`content="${qrTexts.description}"`, `content="${qrTexts.description} ${entry.lang}"`);
        write(dir, entry.path, qr);
        continue;
      }
      // The file guides, in each of their languages: the date of the measurement as that language writes it, and the link to
      // the tool page of that language.
      if (isFileGuide(id)) {
        const toolPath = ROUTES.find((route) => route.id === FILE_GUIDES[id].tool)?.paths[entry.lang] ?? '/';
        write(dir, entry.path, guidePage({ toolPath, lang: entry.lang, edit: (html) => html.replace('<title>A guide | FileOrca</title>', `<title>${id} ${entry.lang} | FileOrca</title>`).replace('content="A guide to a tool."', `content="Guide ${id} ${entry.lang}."`) }));
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

  /**
   * F12, Mudança 10 (DECISOES § 418): the gate reads the blocks of the file guides, their AdSlots included, on the build with
   * the ads (FO_ADS_BUILD) and wants no ad box in the default build. The fake site as written is the build with the ads;
   * the default build is the same site with its boxes taken out, put back after the run.
   */
  function run(dir: string): { status: number | null; output: string } {
    const dist = join(dir, 'dist');
    const ads = join(dir, 'ads-build');
    rmSync(ads, { recursive: true, force: true });
    cpSync(dist, ads, { recursive: true });
    for (const name of readdirSync(dist, { recursive: true, encoding: 'utf8' }).filter((entry) => entry.endsWith('.html'))) {
      const file = join(dist, name);
      writeFileSync(file, readFileSync(file, 'utf8').replace(/<div class="fo-ad[^"]*">(?:<span[^>]*>[^<]*<\/span>)?<\/div>/g, ''));
    }
    const result = spawnSync(process.execPath, [gate], { cwd: dir, encoding: 'utf8', env: { ...process.env, FO_ADS_BUILD: 'ads-build' } });
    rmSync(dist, { recursive: true, force: true });
    cpSync(ads, dist, { recursive: true });
    return { status: result.status, output: `${result.stdout}${result.stderr}` };
  }

  // The counts of the summary line, read from the route map (F6): 45 image pages (15 × 3 since the F18; 13 × 3 since the
  // F17; 11 × 3 before), the calculators in each of their languages (18 in English, 5 in Spanish and the Brazilian ones once
  // their rows are in the map; 18 before) and the PDF pages (16 × 3 since the F18: the 13 tools, the 2 presets and the hub;
  // 13 × 3 before; 13 before the F6).
  const imageCount = allPages().filter((entry) => isImagePage(entry.route.id)).length;
  // F7: and the 11 home and health calculators, in English (DECISOES § 259).
  const calcCount = allPages().filter((entry) => isCalcPage(entry.route.id) || isBrCalc(entry.route.id) || isLifeCalc(entry.route.id)).length;
  const pdfCount = allPages().filter((entry) => isPdfPage(entry.route.id) || entry.route.id === PDF_HUB_ID).length;
  // The languages adjustment: the ten file guides and the QR code generator in each of their languages (30 and 3; 10 and 1 before).
  const guideCount = allPages().filter((entry) => isFileGuide(entry.route.id)).length;
  const qrCount = allPages().filter((entry) => entry.route.id === QR_ID).length;

  it('passes on a complete site, whose 404 pages repeat a title and hold placeholder wording', () => {
    expect(imageCount).toBe(15 * 3);
    expect(calcCount).toBeGreaterThanOrEqual(18 + 5);
    expect(pdfCount).toBe((13 + 2 + 1) * 3);
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
    // The parent's own page, with the tag the fake site gives it (F19a): the preset repeats every block of it.
    write(dir, '/mortgage-calculator/biweekly/', calcPage(calcTag('mortgage-calculator', 'en')));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain('/auto-loan-calculator/: o bloco privacy não diz');
    expect(result.output).toMatch(/\/mortgage-calculator\/biweekly\/: só \d bloco\(s\) próprio/);
  });

  // The gate runs twice or more in a subprocess here: the limit of 60 s of the F11 (the guides hub above, and pdf-site.test.ts),
  // since the 5 s of Vitest were near on this machine with other agents reading the disk (DECISOES § 743).
  it('counts the 13 PDF tools, the 2 PDF presets and the hub in each of their languages, read from the PDF registry and the route map', () => {
    const dir = join(root, 'pdf-count');
    build(dir);
    expect(run(dir).output).toMatch(new RegExp(`${calcCount} de calculadora, ${pdfCount} de PDF \\(as ferramentas, as presets e o hub\\)`));
    // A language the map has but the dist lacks is a missing page, by name: a tool, and a preset (F18).
    rmSync(join(dir, fileForPath(routeById('split-pdf').paths.es ?? '')));
    rmSync(join(dir, fileForPath(routeById('pdf-to-jpg-to-png').paths.pt ?? '')));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain(`${routeById('split-pdf').paths.es}: a página não existe no dist`);
    expect(result.output).toContain(`${routeById('pdf-to-jpg-to-png').paths.pt}: a página não existe no dist`);
    expect(result.output).toContain(`${pdfCount - 2} página(s) de PDF conferida(s), o mapa de rotas tem ${pdfCount}`);
  }, 60_000);

  // F18 (decision 5; DECISOES § 725): a PDF preset has, in each language, at least MIN_OWN_BLOCKS blocks that neither its
  // parent nor a sibling preset has, as an image preset; and the page it is compared with must be in the dist.
  it('fails when a PDF preset repeats its parent or a sibling, or the page it is compared with is missing', () => {
    const dir = join(root, 'pdf-presets');
    build(dir);
    const extract = routeById('split-pdf-extract-pages').paths.es ?? '';
    const png = routeById('pdf-to-jpg-to-png').paths.en ?? '';
    // The Spanish Extract pages written as the Spanish Split PDF (the blocks of its parent), with its own name in the H1.
    write(dir, extract, pdfPage({ id: 'split-pdf', lang: 'es' }).replace(`<h1>${TEXTS.es.common.pdf['split-pdf'].name}</h1>`, `<h1>${TEXTS.es.common.pdf['split-pdf-extract-pages'].name}</h1>`));
    // The parent of PDF to PNG gone in English: the preset cannot be compared.
    rmSync(join(dir, fileForPath('/pdf-to-jpg/')));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toMatch(new RegExp(`${extract.replaceAll('/', '\\/')}: só 0 bloco\\(s\\) próprio\\(s\\)`));
    expect(result.output).toContain(`${png}: a página /pdf-to-jpg/, usada na comparação, não existe no dist`);
    // The other languages of both presets still pass.
    for (const path of [routeById('split-pdf-extract-pages').paths.en, routeById('pdf-to-jpg-to-png').paths.es]) expect(result.output).not.toContain(`${path}: só`);
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

  // The gate runs twice or more in a subprocess here: the limit of 60 s of the F11 (the guides hub above, and pdf-site.test.ts),
  // since the 5 s of Vitest were near on this machine with other agents reading the disk (DECISOES § 743).
  it('checks the ten file guides of the registry, and fails when one loses its tool or is missing (F5b)', () => {
    expect(guideCount).toBe(FILE_GUIDE_IDS.length * LANGS.length);
    const dir = join(root, 'guides');
    build(dir);
    expect(run(dir).output).toMatch(new RegExp(`${pdfCount} de PDF \\(as ferramentas, as presets e o hub\\), ${guideCount} guia\\(s\\) de arquivo`));
    write(dir, '/guides/jpg-vs-png/', guidePage({ toolPath: '/png-to-jpg/', tool: '' }));
    rmSync(join(dir, fileForPath('/guides/split-pdf-file-size/')));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain('/guides/jpg-vs-png/: sem a ferramenta embutida (#fo-tool-root)');
    expect(result.output).toContain('/guides/split-pdf-file-size/: a página não existe no dist');
    expect(result.output).toContain(`${guideCount - 1} guia(s) de arquivo conferido(s), o registro tem ${guideCount}`);
  }, 60_000);

  // F12, Mudança 10 (DECISOES § 418): the default build has no ad box, and the blocks are read on the build with the ads.
  it('fails a file guide with an ad box in the default build, or with no AdSlot in the build with the ads', () => {
    const dir = join(root, 'guides-boxes');
    build(dir);
    // A box run() does not take out of the default build (it has an attribute), and a guide whose AdSlot is gone.
    write(dir, '/guides/jpg-vs-png/', guidePage({ toolPath: '/png-to-jpg/', edit: (html) => html.replace('<div class="fo-ad fo-ad--content">', '<div class="fo-ad fo-ad--content" data-left>') }));
    write(dir, '/guides/split-pdf-file-size/', guidePage({ toolPath: routeById('split-pdf').paths.en ?? '', edit: (html) => html.replace(/<div class="fo-ad fo-ad--content"><span class="fo-ad__label">Advertisements<\/span><\/div>/, '') }));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain('/guides/jpg-vs-png/: caixa de anúncio no build padrão, que não tem ID de unidade');
    expect(result.output).toContain('/guides/split-pdf-file-size/: sem o AdSlot de conteúdo (.fo-ad--content)');
  });

  it('checks each file guide in Portuguese and Spanish, in the words and links of its language (the languages adjustment)', () => {
    const dir = join(root, 'guides-languages');
    build(dir);
    const jpgPng = FILE_GUIDES['guides-jpg-vs-png'];
    const pngToJpg = routeById('png-to-jpg');
    // The Portuguese guide with the English note of the measurement, and the Spanish one linking to the English tool page.
    write(dir, jpgPng.paths.pt, guidePage({ toolPath: pngToJpg.paths.pt ?? '', edit: (html) => html.replace('<title>A guide | FileOrca</title>', '<title>jpg pt | FileOrca</title>') }));
    write(dir, jpgPng.paths.es, guidePage({ lang: 'es', toolPath: pngToJpg.paths.en ?? '', edit: (html) => html.replace('<title>A guide | FileOrca</title>', '<title>jpg es | FileOrca</title>') }));
    // A Spanish guide with a filler phrase of Spanish, and a Portuguese guide that is missing.
    const heic = FILE_GUIDES['guides-heic-to-jpg-on-windows'];
    write(dir, heic.paths.es, guidePage({ lang: 'es', toolPath: routeById('heic-to-jpg').paths.es ?? '', extra: 'Cabe destacar que el HEIC pesa menos.', edit: (html) => html.replace('<title>A guide | FileOrca</title>', '<title>heic es | FileOrca</title>') }));
    rmSync(join(dir, fileForPath(heic.paths.pt)));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain(`${jpgPng.paths.pt}: a seção medida sem a data da medida`);
    expect(result.output).toContain(`${jpgPng.paths.es}: sem o link para a página da ferramenta (${pngToJpg.paths.es}) no texto do guia`);
    expect(result.output).toContain(`${heic.paths.es}: frase de enchimento: "cabe destacar"`);
    expect(result.output).toContain(`${heic.paths.pt}: a página não existe no dist`);
    // The English guides of the same site still pass: no English guide is named.
    expect(result.output).not.toContain(`${jpgPng.paths.en}:`);
    expect(result.output).not.toContain(`${heic.paths.en}:`);
  });

  // F11 (decision 5; DECISOES § 394): the guides hub, in each language of its route, from the route map and the registries.
  it('checks the guides hub in each of its languages, and fails when it loses a card or its own words (F11)', () => {
    const hubCount = allPages().filter((entry) => entry.route.id === GUIDES_HUB_ID).length;
    expect(hubCount).toBe(3);
    const dir = join(root, 'guides-hub');
    build(dir);
    const ok = run(dir);
    expect(ok.status, ok.output).toBe(0);
    expect(ok.output).toContain(`; ${hubCount} do hub de guias`);
    expect(ok.output).toContain('palavras próprias do hub de guias: en 91, pt 108, es 97');
    const pt = routeById(GUIDES_HUB_ID).paths.pt ?? '';
    const es = routeById(GUIDES_HUB_ID).paths.es ?? '';
    const [lost] = hubGuides('pt').map((guide) => guide.path);
    write(dir, pt, guidesHubPage({ lang: 'pt', drop: [lost ?? ''] }));
    write(dir, es, guidesHubPage({ lang: 'es', how: 'Nada sale de tu dispositivo.' }));
    const broken = run(dir);
    expect(broken.status).toBe(1);
    expect(broken.output).toContain(`${pt}: faltam os cartões de ${lost}`);
    expect(broken.output).toMatch(new RegExp(`${es}: o texto próprio tem \\d+ palavra\\(s\\), pede de 60 a 120`));
    // The English hub of the same site still passes.
    expect(broken.output).not.toContain('/guides/:');
    rmSync(join(dir, fileForPath(pt)));
    expect(run(dir).output).toContain(`${pt}: a página não existe no dist`);
  }, 60_000);

  // The gate runs twice or more in a subprocess here: the limit of 60 s of the F11 (the guides hub above, and pdf-site.test.ts),
  // since the 5 s of Vitest were near on this machine with other agents reading the disk (DECISOES § 743).
  it('checks the QR code generator from the route map, and fails when it loses a block or is missing (F7)', () => {
    expect(qrCount).toBe(3);
    const dir = join(root, 'qr');
    build(dir);
    const ok = run(dir);
    expect(ok.status).toBe(0);
    expect(ok.output).toMatch(new RegExp(`${guideCount} guia\\(s\\) de arquivo, ${qrCount} do gerador de QR code e \\d+ página\\(s\\) do site`));
    const path = routeById(QR_ID).paths.en ?? '';
    write(dir, path, qrPage((html) => html.replace(/<section data-content="privacy">.*?<\/section>/, '')));
    const lost = run(dir);
    expect(lost.status).toBe(1);
    expect(lost.output).toContain(`${path}: sem o bloco privacy`);
    rmSync(join(dir, fileForPath(path)));
    expect(run(dir).output).toContain(`${path}: a página não existe no dist`);
  }, 60_000);

  it('checks the QR code generator in Portuguese and Spanish with the phrases of each language (the languages adjustment)', () => {
    const dir = join(root, 'qr-languages');
    build(dir);
    const pt = routeById(QR_ID).paths.pt ?? '';
    const es = routeById(QR_ID).paths.es ?? '';
    // The Portuguese page left in English, and the Spanish one with the Portuguese note.
    write(dir, pt, qrPage().replace(`<title>${qrTexts.title} | FileOrca</title>`, '<title>qr pt | FileOrca</title>').replace(`content="${qrTexts.description}"`, 'content="qr pt"'));
    write(dir, es, qrPageWithNote('pt').replace(`<title>${qrTexts.title} | FileOrca</title>`, '<title>qr es | FileOrca</title>').replace(`content="${qrTexts.description}"`, 'content="qr es"'));
    const result = run(dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain(`${pt}: o bloco privacy não diz "seu texto fica no seu aparelho"`);
    expect(result.output).toContain(`${pt}: o bloco privacy não diz que a página nunca abre o endereço digitado ("nunca abre")`);
    expect(result.output).toContain(`${es}: o bloco privacy não diz "tu texto se queda en tu dispositivo"`);
    // The Portuguese "nunca abre" is the Spanish one too, so the Spanish page fails on the device phrase only.
    expect(result.output).not.toContain(`${es}: o bloco privacy não diz que a página nunca abre`);
    expect(result.output).not.toContain(`${routeById(QR_ID).paths.en}:`);
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
