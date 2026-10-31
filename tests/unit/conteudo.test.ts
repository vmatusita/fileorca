import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  CONTENT_BLOCKS,
  PLACEHOLDERS,
  checkPresetPage,
  checkSite,
  checkToolPage,
  comparisonPaths,
  findPlaceholders,
  isImagePage,
  isNotFoundPath,
  normalizeText,
  pathOfFile,
  type ContentBlock,
} from '../../scripts/lib/conteudo.ts';
import { allPages, fileForPath } from '../../scripts/lib/dist.ts';
import { ROUTES, languagesOf } from '../../src/i18n/routes.ts';
import { IMAGE_PAGES, IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';

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

describe('portão de conteúdo: páginas lidas do mapa de rotas', () => {
  it('knows the 13 pages of the registry and nothing else', () => {
    expect(IMAGE_TOOL_IDS.length + IMAGE_PRESET_IDS.length).toBe(13);
    for (const id of Object.keys(IMAGE_PAGES)) expect(isImagePage(id), id).toBe(true);
    for (const id of ['home', 'image-tools', 'privacy', 'not-found', 'constructor', 'toString']) expect(isImagePage(id), id).toBe(false);
  });

  it('finds every page of the registry in the route map: Compress image in three languages, the rest in English', () => {
    const found = allPages().filter((entry) => isImagePage(entry.route.id));
    expect(found).toHaveLength(15);
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
    expect(result.output).toMatch(/conteúdo: ok, 15 página\(s\) de ferramenta/);
    expect(result.status).toBe(0);
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
