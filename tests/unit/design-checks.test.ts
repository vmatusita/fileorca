import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FORBIDDEN_WORDS, FORBIDDEN_WORDS_BY_LANG, OLI_POSES, TOOL_NAME, checkArrows, checkFonts, checkMotion, checkSingleStylesheet, checkSprite, checkTextColors, checkThemeVars, checkVoice } from '../../scripts/lib/design-checks.ts';
import { tokenNames } from '../../scripts/lib/theme.ts';
import { F6_ES_CALC_IDS, fileGuideVoicePages, newVoicePages, pageVoiceProblems, pdfVoicePages } from '../../scripts/lib/voice-pages.ts';
import { LANGS, QR_ID, routeById } from '../../src/i18n/routes.ts';
import { CALC_PAGE_IDS, GUIDE_IDS, MONEY_HUB_ID } from '../../src/tools/calc/registry.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';

const tokens: unknown = JSON.parse(readFileSync('docs/design/tokens.json', 'utf8'));
const names = new Set(tokenNames(tokens));
const siteStyles = readdirSync('src/styles')
  .filter((file) => file.endsWith('.css') && file !== 'theme.css')
  .map((file) => ({ file: `src/styles/${file}`, css: readFileSync(`src/styles/${file}`, 'utf8') }));

describe('variáveis do tema', () => {
  const definitions = ':root{--radius-xl:24px;--shadow-lift:0 1px 2px #0000000f,0 10px 24px -12px #0f1b2d38;--font-display:Fredoka,Figtree,ui-rounded,system-ui,sans-serif}';

  it('accepts var(--token), the definitions that tokens.css makes, and variables outside the theme namespaces', () => {
    const good = `${definitions}:root{--color-ink:var(--ink);--color-surface-sunken:var( --surface-sunken );--radius-xl:var(--radius-xl);--shadow-lift:var(--shadow-lift)!important;--font-display:var(--font-display);--tw-shadow:0 0 #0000;--space-4:16px;--ad-clearance:150px}`;
    expect(checkThemeVars(good, names)).toEqual([]);
    expect(checkThemeVars('/* --color-red-500:#f00 */:root{--color-ink: var(--ink);\n  --spacing-4: var(--space-4);}', names)).toEqual([]);
  });

  it('reports a value that is not a token, a fallback, an unknown token and a default Tailwind variable', () => {
    for (const bad of ['--color-red-500:#ef4444', '--color-ink:var(--nope)', '--color-ink:var(--ink,#000)', '--font-sans:ui-sans-serif,system-ui', '--radius-2xl:1rem', '--shadow-md:0 4px 6px #0001', '--font-weight-bold:700', '--color-ink:#0f1b2d']) {
      expect(checkThemeVars(`:root{--color-bg:var(--bg);${bad}}`, names), bad).toHaveLength(1);
    }
    expect(checkThemeVars(':root{--color-a:#fff;--radius-b:1px;--shadow-c:none}', names).join('\n')).toMatch(/--color-a[\s\S]*--radius-b[\s\S]*--shadow-c/);
  });

  it('is green for the generated theme and for tokens.css', () => {
    expect(checkThemeVars(readFileSync('src/styles/theme.css', 'utf8'), names)).toEqual([]);
    expect(checkThemeVars(readFileSync('docs/design/tokens.css', 'utf8'), names)).toEqual([]);
  });
});

describe('color: só tokens de texto', () => {
  it('accepts the text tokens, inherit and currentColor in any case, with !important, minified or not', () => {
    const good = [
      '.a{color:var(--ink)}.b{color:var(--ink-muted)!important}.c{color:var(--brand)}.d{color:var(--danger)}.e{color:var(--success)}',
      '.f{color:var(--on-brand)}.g{color:var(--on-sun)}.h{color:var(--on-deep)}.i{color:var(--on-deep-muted)}.j{color:var(--on-cat)}.k{color:var(--on-violeta)}',
      '.l{color:inherit}.m{color:currentColor}.n{color:CURRENTCOLOR !important}.o{color:Inherit}',
      '.p {\n  color: var( --ink ) ;\n}\n/* color: red */\n.q { COLOR: var(--brand) !important; }',
    ];
    for (const css of good) expect(checkTextColors(css), css).toEqual([]);
  });

  it('ignores the properties that only end in color and the color-scheme', () => {
    const css = '.a{background-color:#fff;border-color:red;-webkit-text-fill-color:red;text-decoration-color:red;outline-color:red;caret-color:red;accent-color:red;border-top-color:red;--my-color:red;color-scheme:dark}@media (prefers-color-scheme:dark){.b{background:red}}.color:hover{background:red}';
    expect(checkTextColors(css)).toEqual([]);
  });

  it('reports hex, rgb, names, non-text tokens, fallbacks and keywords, naming the rule', () => {
    for (const bad of ['#fff', 'rgb(0 0 0 / .5)', 'red', 'transparent', 'var(--surface)', 'var(--sun)', 'var(--deep)', 'var(--nope)', 'var(--ink,red)', 'color-mix(in srgb,var(--ink),red)', 'unset', 'initial']) {
      const problems = checkTextColors(`.ok{color:var(--ink)}.alvo-ruim{color:${bad}!important}`);
      expect(problems, bad).toHaveLength(1);
      expect(problems[0], bad).toContain('.alvo-ruim');
    }
    expect(checkTextColors('.a{color:#fff}@media (min-width:768px){.b{color:red}}')).toHaveLength(2);
  });

  it('does not let a data: URI hide or fake a declaration', () => {
    expect(checkTextColors('.a{background:url("data:image/svg+xml;color:red")}.b{color:var(--ink)}')).toEqual([]);
    expect(checkTextColors('.a{background:url(data:image/svg+xml;utf8,<svg/>);color:red}')).toHaveLength(1);
  });

  it('applies to the site CSS', () => {
    expect(siteStyles.length).toBeGreaterThan(0);
    for (const { file, css } of siteStyles) expect(checkTextColors(css), file).toEqual([]);
  });
});

describe('movimento: só transform, opacity, translate, scale e rotate', () => {
  it('accepts allowed keyframes and transitions, minified, prefixed or with !important', () => {
    const good = [
      '@keyframes fo-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px);animation-timing-function:cubic-bezier(.65,0,.35,1)}}',
      '@-webkit-keyframes x{from{-webkit-transform:none;opacity:0}to{opacity:1}}@keyframes y{to{translate:0 -4px;scale:1.1;rotate:3deg}}',
      '.a{transition:transform .16s cubic-bezier(.2,.8,.2,1),opacity .16s ease}',
      '.b{transition-property:transform,opacity}.c{transition:none}.d{transition-property:none}',
      '.d{-webkit-transition:-webkit-transform .2s ease-out;-webkit-transition-property:-webkit-transform}',
      '.e{transition:opacity var(--dur-quick) var(--ease-out)!important;transition:translate .2s steps(4,end) .1s}',
      '.f{transition-duration:1ms!important;transition-timing-function:ease;transition-delay:0s;transition-behavior:allow-discrete}',
      '.g { transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1) , scale 90ms linear ; }',
      '.h{transition:opacity calc(var(--dur-base)*2) allow-discrete}',
      '.i{animation:fo-float var(--dur-float) var(--ease-in-out) infinite;will-change:transform}',
    ];
    for (const css of good) expect(checkMotion(css), css).toEqual([]);
  });

  it('reports keyframes that touch anything else, and names the animation', () => {
    for (const property of ['width', 'height', 'background-color', 'color', 'top', 'filter', 'box-shadow', '--level', 'margin-left', 'clip-path']) {
      const problems = checkMotion(`@keyframes fo-bad{0%{opacity:0;${property}:0}100%{opacity:1}}`);
      expect(problems, property).toHaveLength(1);
      expect(problems[0], property).toContain('@keyframes fo-bad');
    }
    expect(checkMotion('@media (min-width:1px){@keyframes a{from{left:0}50%{top:0;transform:none}to{height:0}}}')).toHaveLength(3);
    expect(checkMotion('@-webkit-keyframes a{from{-webkit-filter:blur(1px)}}')).toHaveLength(1);
  });

  it('reports "all", a shorthand item without a property, and properties that are not movement', () => {
    const bad: Record<string, number> = {
      'transition:all .2s': 1,
      'transition:all': 1,
      'transition:.2s': 1,
      'transition:200ms ease-out': 1,
      'transition:background-color .2s': 1,
      'transition:opacity .2s,all .3s': 1,
      'transition:opacity .2s,.3s ease': 1,
      'transition:opacity .2s,color .2s,background-color .2s': 2,
      'transition:color var(--dur-quick) var(--ease-out)': 1,
      '-webkit-transition:all .2s': 1,
      'transition:opacity .2s cubic-bezier(.2,.8,.2,1),all .2s cubic-bezier(.2,.8,.2,1)': 1,
      'transition:var(--fo-transition)': 1,
      'transition:inherit': 1,
      'transition-property:all': 1,
      'transition-property:transform,color': 1,
      'transition-property:opacity,all!important': 1,
      '-webkit-transition-property:-webkit-transform,margin': 1,
      'transition-property:var(--x)': 1,
    };
    for (const [declaration, count] of Object.entries(bad)) {
      const problems = checkMotion(`.ok{transition:opacity .2s}.alvo-ruim{${declaration}}`);
      expect(problems, declaration).toHaveLength(count);
      expect(problems[0], declaration).toContain('.alvo-ruim');
    }
    expect(checkMotion('.a{transition:all .2s}')[0]).toMatch(/"all"/);
    expect(checkMotion('.a{transition:.2s}')[0]).toMatch(/equivale a "all"/);
  });

  it('applies to the site CSS', () => {
    expect(siteStyles.length).toBeGreaterThan(0);
    for (const { file, css } of siteStyles) expect(checkMotion(css), file).toEqual([]);
  });
});

describe('fontes', () => {
  const FREDOKA = '/_astro/fredoka-latin-wght-normal.BIKS5J3D.woff2';
  const FIGTREE = '/_astro/figtree-latin-wght-normal.D_k1x-2c.woff2';
  const face = (family: string, src: string) => `@font-face{font-family:${family};font-style:normal;font-display:swap;src:${src}}`;
  const fredokaFace = face('Fredoka', `url(${FREDOKA})format("woff2")`);
  const figtreeFace = face('Figtree', `url("${FIGTREE}") format("woff2")`);
  const fallbackFace = face('"Fredoka Fallback"', 'local(Arial);size-adjust:104%');
  const css = `${fredokaFace}${figtreeFace}${fallbackFace}`;
  const preload = (href = FREDOKA, attributes = 'type="font/woff2" crossorigin') => `<link rel="preload" href="${href}" as="font" ${attributes}>`;
  const page = (path: string, head = preload()) => ({ path, html: `<!doctype html><html><head>${head}<link rel="stylesheet" href="/_astro/x.css"></head><body></body></html>` });
  const good = { css, pages: [page('/'), page('/pt/')], woff2Files: [FREDOKA, FIGTREE] };

  it('accepts the two latin fonts, a local() fallback, one Fredoka preload per page and dist paths of any shape', () => {
    expect(checkFonts(good)).toEqual([]);
    expect(checkFonts({ ...good, woff2Files: ['dist\\_astro\\figtree-latin-wght-normal.D_k1x-2c.woff2', 'dist/_astro/fredoka-latin-wght-normal.BIKS5J3D.woff2'] })).toEqual([]);
    expect(checkFonts({ ...good, css: `/* ${face('Inter', 'url(/x.woff2)')} */${css}` })).toEqual([]);
  });

  it('reports a third @font-face with url(), another family and a wrong or unhashed file', () => {
    const cyrillic = face('Fredoka', 'url(/_astro/fredoka-cyrillic-wght-normal.AAAAAAAA.woff2)format("woff2")');
    expect(checkFonts({ ...good, css: css + cyrillic }).join('\n')).toMatch(/3 @font-face com url/);
    expect(checkFonts({ ...good, css: fredokaFace + face('Inter', 'url(/_astro/inter.AAAA.woff2)') }).join('\n')).toMatch(/família Inter[\s\S]*falta o @font-face com url\(\) de Figtree/);
    expect(checkFonts({ ...good, css: face('Fredoka', 'url(/fonts/fredoka.woff2)') + figtreeFace }).join('\n')).toMatch(/Fredoka usa \/fonts\/fredoka\.woff2/);
    expect(checkFonts({ ...good, css: face('Fredoka', 'url(/_astro/fredoka-latin-wght-normal.woff2)') + figtreeFace }).join('\n')).toMatch(/Fredoka usa/);
    expect(checkFonts({ ...good, css: face('Fredoka', `url(${FREDOKA}),url(/_astro/fredoka-latin-wght-normal.OTHER123.woff)`) + figtreeFace }).join('\n')).toMatch(/Fredoka com 2 url/);
    expect(checkFonts({ ...good, css: face('Fredoka', `url(${FREDOKA})`) + fredokaFace + figtreeFace }).join('\n')).toMatch(/3 @font-face|mais de um/);
  });

  it("accepts the Figtree Steady face (the breadcrumb and the cookie notice) of the Figtree file with font-display: optional, and nothing else under that family (DECISOES § 305)", () => {
    const trail = (src = `url("${FIGTREE}") format("woff2")`, display = 'optional') => `@font-face{font-family:"Figtree Steady";font-style:normal;font-display:${display};src:${src}}`;
    expect(checkFonts({ ...good, css: css + trail() })).toEqual([]);
    expect(checkFonts({ ...good, css: css + trail(undefined, 'swap') }).join('\n')).toMatch(/Figtree Steady com font-display swap \(esperado optional\)/);
    expect(checkFonts({ ...good, css: css + trail(`url(${FREDOKA})`) }).join('\n')).toMatch(/Figtree Steady usa .*fredoka.*esperado o arquivo de Figtree/);
    expect(checkFonts({ ...good, css: css + trail('url(/_astro/figtree-latin-wght-normal.OTHER123.woff2)') }).join('\n')).toMatch(/Figtree Steady usa/);
    expect(checkFonts({ ...good, css: css + trail() + trail() }).join('\n')).toMatch(/mais de um @font-face com url\(\) para Figtree Steady/);
    expect(checkFonts({ ...good, css: fredokaFace + trail() }).join('\n')).toMatch(/falta o @font-face com url\(\) de Figtree[\s\S]*Figtree Steady usa/);
  });

  it('reports an @font-face with neither url() nor local()', () => {
    expect(checkFonts({ ...good, css: `${css}@font-face{font-family:Mystery;font-weight:400}` }).join('\n')).toMatch(/Mystery sem url\(\) nem local\(\)/);
  });

  it('reports any .woff2 in dist beyond the two the CSS uses, and a hash that differs from the CSS', () => {
    expect(checkFonts({ ...good, woff2Files: [...good.woff2Files, '/_astro/fredoka-cyrillic-wght-normal.AAAAAAAA.woff2'] }).join('\n')).toMatch(/3 arquivo\(s\) \.woff2/);
    expect(checkFonts({ ...good, woff2Files: [FREDOKA] }).join('\n')).toMatch(/1 arquivo\(s\) \.woff2/);
    expect(checkFonts({ ...good, woff2Files: [] }).join('\n')).toMatch(/nenhum/);
    expect(checkFonts({ ...good, woff2Files: ['/_astro/fredoka-latin-wght-normal.OTHER123.woff2', FIGTREE] }).join('\n')).toMatch(/2 arquivo\(s\) \.woff2/);
  });

  it('reports a page without the preload, with two, without type or crossorigin, or with another URL', () => {
    const run = (head: string) => checkFonts({ ...good, pages: [page('/x/', head)] }).join('\n');
    expect(run('')).toMatch(/\/x\/: 0 <link rel="preload" as="font">/);
    expect(run(preload() + preload(FIGTREE))).toMatch(/2 <link rel="preload" as="font">/);
    expect(run(preload(FREDOKA, 'crossorigin'))).toMatch(/sem type="font\/woff2"/);
    expect(run(preload(FREDOKA, 'type="font/woff2"'))).toMatch(/sem crossorigin/);
    expect(run(preload(FIGTREE))).toMatch(/preload aponta \/_astro\/figtree[\s\S]*o CSS usa \/_astro\/fredoka/);
    expect(run(preload('/_astro/fredoka-latin-wght-normal.OTHER123.woff2'))).toMatch(/preload aponta/);
    expect(run(`<link rel="preload" href="/x.css" as="style">${preload()}`)).toBe('');
  });
});

describe('sprite da Oli', () => {
  const sprite = [
    '<svg class="fo-sprite" aria-hidden="true" width="0" height="0" style="position:absolute;left:-9999px">',
    '<defs><clipPath id="oli-clip"><rect width="64" height="64"/></clipPath></defs>',
    '<symbol id="oli-p1" viewBox="0 0 64 64"><path d="M1 1"/></symbol>',
    '<symbol id="oli-p12" viewBox="0 0 64 64"><path d="M2 2"/></symbol>',
    '<symbol id="oli-wave" viewBox="0 0 64 64"><use href="#oli-p1"/><use href="#oli-p12"/><path d="M0 0" clip-path="url(#oli-clip)"/></symbol>',
    '<symbol id="oli-peek" viewBox="0 0 64 64"><use href="#oli-p1"></use></symbol>',
    '</svg>',
  ].join('');
  const box = (pose: string) => `<div class="fo-drop__oli" data-oli="${pose}" aria-hidden="true"><svg aria-hidden="true" viewBox="0 0 64 64"><use href="#oli-${pose}"/></svg></div>`;
  const page = (body = box('wave'), svg = sprite) => `<!doctype html><html lang="en"><body>${svg}${body}</body></html>`;
  const required = { requiredPoses: ['peek'] };
  const problems = (html: string, options: { requiredPoses: readonly string[]; forbiddenPoses?: readonly string[] } = required) => checkSprite(html, options).join('\n');

  it('lists the ten poses of the closed list (F12: sad, only on the ad-block wall)', () => {
    expect(OLI_POSES).toEqual(['wave', 'gulp', 'swim', 'cheer', 'oops', 'buoy', 'lost', 'coffee', 'peek', 'sad']);
  });

  it('accepts a sprite with parts, one oli-clip and boxes that use their own pose', () => {
    expect(checkSprite(page(), required)).toEqual([]);
    expect(checkSprite(page(box('wave') + box('peek')), required)).toEqual([]);
    expect(checkSprite(page('<p>sem Oli</p>'), required)).toEqual([]);
    expect(checkSprite(page('<p>sem Oli</p>'), { requiredPoses: [] })).toEqual([]);
  });

  it('reads camelCase markup (viewBox, clipPath) and self-closing <use/> as the browser does', () => {
    expect(checkSprite(page(box('wave').replace('<use href="#oli-wave"/>', '<use href="#oli-wave"></use>')), required)).toEqual([]);
    expect(problems(page(box('wave'), sprite.replace('<clipPath id="oli-clip">', '<mask id="oli-clip">').replace('</clipPath>', '</mask>')))).toMatch(/oli-clip é <mask>, deveria ser <clipPath>/);
  });

  it('reports repeated ids, a missing or repeated oli-clip and the ic clipPath', () => {
    expect(problems(page(box('wave') + '<p id="a"></p><p id="a"></p>'))).toMatch(/id "a" repetido 2 vezes/);
    expect(problems(page(box('wave') + '<svg><clipPath id="oli-clip"/></svg>'))).toMatch(/id "oli-clip" repetido 2 vezes/);
    expect(problems(page(box('wave'), sprite.replace(/<defs>.*<\/defs>/, '').replace(' clip-path="url(#oli-clip)"', '')))).toMatch(/falta o clipPath oli-clip/);
    expect(problems(page(box('wave') + '<svg><clipPath id="ic"><rect/></clipPath></svg>'))).toMatch(/id "ic"/);
    expect(problems(page(box('wave') + '<svg><path id="oli-wave"/></svg>'))).toMatch(/id "oli-wave" repetido/);
  });

  it('reports a sprite that is missing, doubled, visible to screen readers, hidden or display:none', () => {
    expect(problems(page(box('wave'), sprite.replace('class="fo-sprite"', 'class="other"')))).toMatch(/0 svg\.fo-sprite/);
    expect(problems(page(box('wave') + sprite.replace(/id="[^"]*"/g, '')))).toMatch(/2 svg\.fo-sprite/);
    expect(problems(page(box('wave'), sprite.replace(' aria-hidden="true"', '')))).toMatch(/sem aria-hidden/);
    expect(problems(page(box('wave'), sprite.replace(' aria-hidden="true"', ' aria-hidden="false"')))).toMatch(/sem aria-hidden/);
    expect(problems(page(box('wave'), sprite.replace('<svg class="fo-sprite"', '<svg class="fo-sprite" hidden')))).toMatch(/atributo hidden/);
    expect(problems(page(box('wave'), sprite.replace('position:absolute', 'display: none')))).toMatch(/display:none/);
    expect(problems(page(box('wave'), sprite.replace('position:absolute', 'DISPLAY:NONE !important')))).toMatch(/display:none/);
  });

  it('reports symbols outside the pose list and accepts parts oli-p<N> only', () => {
    expect(problems(page(box('wave'), sprite.replace('</svg>', '<symbol id="oli-orca"><path/></symbol></svg>')))).toMatch(/símbolo oli-orca fora da lista/);
    expect(problems(page(box('wave'), sprite.replace('</svg>', '<symbol id="oli-px"><path/></symbol><symbol id="oli-p"><path/></symbol></svg>')))).toMatch(/oli-px[\s\S]*oli-p fora da lista/);
    expect(problems(page(box('wave'), sprite.replace('</svg>', '<symbol id="logo"><path/></symbol><symbol><path/></symbol></svg>')))).toBe('');
  });

  it('reports a [data-oli] box with a wrong pose, without aria-hidden or without exactly one svg and use', () => {
    expect(problems(page(box('wave') + box('dolphin')))).toMatch(/\[data-oli="dolphin"\] com pose fora da lista/);
    expect(problems(page(box('wave').replace('data-oli="wave" aria-hidden="true"', 'data-oli="wave"')))).toMatch(/\[data-oli="wave"\] sem aria-hidden/);
    expect(problems(page('<div data-oli="wave" aria-hidden="true"></div>'))).toMatch(/0 <svg> filho/);
    expect(problems(page('<div data-oli="wave" aria-hidden="true"><svg aria-hidden="true"><use href="#oli-wave"/></svg><svg aria-hidden="true"/></div>'))).toMatch(/2 <svg> filho/);
    expect(problems(page('<div data-oli="wave" aria-hidden="true"><span><svg aria-hidden="true"><use href="#oli-wave"/></svg></span></div>'))).toMatch(/0 <svg> filho/);
    expect(problems(page(box('wave').replace('<svg aria-hidden="true"', '<svg')))).toMatch(/<svg> filho está sem aria-hidden/);
    expect(problems(page(box('wave').replace('<use href="#oli-wave"/>', '<use href="#oli-wave"/><use href="#oli-wave"/>')))).toMatch(/2 <use>/);
    expect(problems(page(box('wave').replace('<use href="#oli-wave"/>', '')))).toMatch(/0 <use>/);
    expect(problems(page(box('wave').replace('#oli-wave', '#oli-peek')))).toMatch(/em vez de #oli-wave/);
  });

  it('reports references to ids that do not exist', () => {
    expect(problems(page(box('wave') + '<svg><use href="#nope"/></svg>'))).toMatch(/<use href="#nope"> aponta um id que não existe/);
    expect(problems(page(box('wave'), sprite.replace('<use href="#oli-p12"/>', '<use href="#oli-p99"/>')))).toMatch(/#oli-p99/);
    expect(problems(page(box('wave'), sprite.replace('url(#oli-clip)', 'url(#ic)')))).toMatch(/clip-path="url\(#ic\)" aponta um id que não existe/);
    expect(problems(page(box('wave') + '<svg><path fill="url(#grad)"/></svg>'))).toMatch(/fill="url\(#grad\)"/);
    expect(problems(page(box('wave') + '<svg><use href="https://example.com/a.svg#x"/></svg>'))).toBe('');
  });

  it('reports a pose the page shows or needs that has no symbol', () => {
    expect(problems(page(box('wave') + box('swim')))).toMatch(/falta o símbolo oli-swim/);
    expect(problems(page(), { requiredPoses: ['peek', 'gulp', 'cheer'] })).toMatch(/oli-gulp[\s\S]*oli-cheer/);
    expect(problems(page(), { requiredPoses: ['peek', 'gulp'] })).not.toMatch(/oli-peek/);
    expect(problems(page('<p>sem Oli</p>'), { requiredPoses: ['lost'] })).toMatch(/falta o símbolo oli-lost/);
  });

  // F7 (decision 5): a health calculator never cheers, so the pose is forbidden there.
  it('reports a forbidden pose that the sprite holds or the page shows, and passes without it', () => {
    expect(problems(page(), { requiredPoses: ['peek'], forbiddenPoses: ['cheer'] })).not.toMatch(/cheer/);
    expect(problems(page(box('cheer')), { requiredPoses: ['peek'], forbiddenPoses: ['cheer'] })).toMatch(/a pose cheer está na página/);
  });
});

describe('setas fora da fonte', () => {
  const page = (body: string, head = '') => `<!doctype html><html><head><title>FileOrca</title>${head}</head><body>${body}</body></html>`;

  it('accepts a page without → or ↔ in text, and arrows inside script and style', () => {
    expect(checkArrows(page('<p>2.4 MB <svg aria-hidden="true"><use href="#ic-arrow-right"/></svg><span class="fo-sr">to</span> 780 KB, −68%, ← voltar, ⇒</p>'))).toEqual([]);
    expect(checkArrows(page('<p>ok</p><script>const a = "→ ↔";</script><style>.a::before{content:"→"}</style>', '<script type="application/ld+json">{"name":"a → b"}</script>'))).toEqual([]);
  });

  it('reports → and ↔ in text, also as entities, with the text around them', () => {
    const arrow = checkArrows(page('<p>Before 2.4 MB → after 780 KB</p>'));
    expect(arrow).toHaveLength(1);
    expect(arrow[0]).toContain('U+2192');
    expect(arrow[0]).toContain('2.4 MB → after');
    expect(checkArrows(page('<p>a ↔ b</p>'))[0]).toContain('U+2194');
    expect(checkArrows(page('<p>a &rarr; b</p>'))).toHaveLength(1);
    expect(checkArrows(page('<p>a &harr; b &#8594; c &#x2194; d</p>'))).toHaveLength(3);
    expect(checkArrows(page('<p>x</p>', '<title>Seta → no título</title>'))).toHaveLength(1);
    expect(checkArrows(page('<noscript>a → b</noscript>'))).toHaveLength(1);
  });

  it('caps the list and counts the rest', () => {
    const problems = checkArrows(page(`<p>${'→ '.repeat(7)}</p>`));
    expect(problems).toHaveLength(4);
    expect(problems[3]).toMatch(/mais 4 seta/);
  });
});

describe('uma folha de estilo só', () => {
  const html = (head: string) => `<!doctype html><html><head>${head}</head><body></body></html>`;

  it('accepts exactly one <link rel="stylesheet"> and no <style>', () => {
    expect(checkSingleStylesheet(html('<link rel="stylesheet" href="/_astro/a.css"><link rel="preload" href="/_astro/f.woff2" as="font" crossorigin>'))).toEqual([]);
  });

  it('reports no stylesheet, two, an inline <style> and a <style> inside the body', () => {
    expect(checkSingleStylesheet(html('')).join()).toMatch(/0 <link rel="stylesheet">/);
    expect(checkSingleStylesheet(html('<link rel="stylesheet" href="/a.css"><link rel="stylesheet" href="/b.css">')).join()).toMatch(/2 <link rel="stylesheet">/);
    expect(checkSingleStylesheet(html('<link rel="stylesheet" href="/a.css"><style>.a{color:red}</style>')).join()).toMatch(/1 elemento\(s\) <style>/);
    expect(checkSingleStylesheet(html('<style>.a{}</style>')).join('\n')).toMatch(/0 <link[\s\S]*<style>/);
    expect(checkSingleStylesheet('<link rel="stylesheet" href="/a.css"><svg><style>.a{}</style></svg>')).toHaveLength(1);
  });
});

// ---- F5a: the voice of the PDF texts and the CSS block of the PDF island -------------------------------------------------

describe('voz dos textos (F5a)', () => {
  it('accepts plain texts, a success line with one exclamation and the name of the Unlock PDF tool', () => {
    expect(checkVoice({ title: 'Merge PDF: combine PDF files in your browser', panel: { done: 'Done! Oli joined your PDFs into one.', doneMany: 'Done! Oli joined your {count} PDFs.' } })).toEqual([]);
    expect(checkVoice({ line: 'Open it in Unlock PDF first.', guide: 'unlock-pdf removes the password.', title: 'Unlock PDF: remove a password' })).toEqual([]);
    expect(checkVoice(['one', 'two', { three: 3, four: null }])).toEqual([]);
  });

  it('refuses each forbidden word of the README, with its endings, in English, Portuguese and Spanish', () => {
    for (const word of ['seamless', 'seamlessly', 'effortless', 'effortlessly', 'Unlock your photos', 'unlocked files', 'supercharge', 'Supercharged compression', 'magic', 'A magical way', 'mágica', 'Una forma mágica', 'AI-powered', 'revolutionary', 'best-in-class']) {
      expect(checkVoice({ a: word }), word).toHaveLength(1);
      expect(FORBIDDEN_WORDS.test(word), word).toBe(true);
    }
  });

  it('takes out the exact name Unlock PDF and nothing else', () => {
    expect('Unlock PDF and unlock-pdf'.replace(TOOL_NAME, '')).toBe(' and ');
    expect(checkVoice({ a: 'Unlock PDFs fast' })).toHaveLength(1);
    expect(checkVoice({ a: 'Unlock your PDF' })).toHaveLength(1);
    expect(checkVoice({ a: 'Use Unlock PDF to unlock the file' })).toHaveLength(1);
  });

  it('refuses an emoji, an arrow and "up to 50", and lets the copyright signs be', () => {
    expect(checkVoice({ a: 'Done 🎉' })).toEqual(['texto.a: emoji no texto']);
    expect(checkVoice({ a: 'Merge → split' })[0]).toMatch(/seta/);
    // U+2194 is an emoji for Unicode as well, so it is reported twice.
    expect(checkVoice({ a: 'a ↔ b' }).join('\n')).toMatch(/seta/);
    expect(checkVoice({ a: 'Compress up to 50 files' })[0]).toMatch(/up to 50/);
    expect(checkVoice({ a: '© 2026 FileOrca™ ®' })).toEqual([]);
  });

  it('allows an exclamation only once, in a success line (done, doneMany)', () => {
    expect(checkVoice({ panel: { error: 'Oops! The file is broken.' } })).toEqual(['texto.panel.error: exclamação fora da fala de sucesso']);
    expect(checkVoice({ panel: { note: '¡Listo!' } })).toEqual(['texto.panel.note: exclamação fora da fala de sucesso']);
    expect(checkVoice({ panel: { done: 'Done! Oli did it!' } })).toEqual(['texto.panel.done: a fala de sucesso tem de ter uma exclamação só']);
    expect(checkVoice({ panel: { doneMany: '¡Listo! Oli juntó tus PDFs.' } })).toEqual([]);
    // The path names the string, so a deep one is found.
    expect(checkVoice({ faq: [{ q: 'Is it free?', a: 'Yes! It is.' }] }, 'texts')).toEqual(['texts.faq.0.a: exclamação fora da fala de sucesso']);
  });

  it('takes out the English file suffix of Unlock PDF at its key, in the texts and in the data-props the island gets, and nowhere else', () => {
    // The texts file (panel.suffix) and the built page (data-props.texts.suffix, what gate:design reads) both pass.
    expect(checkVoice({ panel: { suffix: 'unlocked' } }, 'src/tools/unlock-pdf/i18n/en.ts')).toEqual([]);
    expect(checkVoice({ suffix: 'unlocked' }, 'data-props.texts')).toEqual([]);
    // The same word at another key, another value at that key, or the key under another root still fails.
    expect(checkVoice({ note: 'unlocked' }, 'data-props.texts')).toHaveLength(1);
    expect(checkVoice({ suffix: 'unlocked files' }, 'data-props.texts')).toHaveLength(1);
    expect(checkVoice({ suffix: 'unlocked' }, 'data-props.t')).toHaveLength(1);
  });

  it('adds the marketing words of Portuguese and Spanish for a text of that language (F6), and English keeps its list', () => {
    expect(FORBIDDEN_WORDS_BY_LANG.en).toBeNull();
    // Positive controls: each word of the glossaries is refused in its language, with its endings.
    const refused: Record<'pt' | 'es', string[]> = {
      pt: ['Uma ferramenta revolucionária', 'Compressão revolucionário', 'Compressão turbinada', 'Junte PDFs sem esforço', 'Feito com IA', 'Um app movido a IA'],
      es: ['Una herramienta revolucionaria', 'Compresión revolucionarios', 'Une PDF sin esfuerzo', 'Hecho con IA', 'Una app impulsada por IA'],
    };
    for (const lang of ['pt', 'es'] as const) {
      for (const text of refused[lang]) {
        expect(checkVoice({ a: text }, 'texto', lang), `${lang} ${text}`).toHaveLength(1);
        // The same text read as English passes the English list: the words are of their own language.
        expect(checkVoice({ a: text }), `en ${text}`).toEqual([]);
      }
      // The English list holds in Portuguese and Spanish too: an English marketing word left in a translation fails.
      expect(checkVoice({ a: 'Junte PDFs seamless' }, 'texto', lang), lang).toHaveLength(1);
    }
    // Negative controls: the words that only look like them pass.
    for (const text of ['A Oli comprime a foto.', 'Ela não faz esforço nenhum para o navegador.', 'Comprima com a opção Forte.', 'Revolução de 1930']) expect(checkVoice({ a: text }, 'texto', 'pt'), text).toEqual([]);
    for (const text of ['Oli comprime la foto.', 'Comprime con la opción Fuerte.', 'Con ayuda de Oli, sin subir nada.']) expect(checkVoice({ a: text }, 'texto', 'es'), text).toEqual([]);
  });
});

// ---- The languages adjustment: the pages whose voice gate:design reads, and the check of one page ----------------------

describe('voz das páginas do gate:design (ajuste de idiomas)', () => {
  it('reads the PDF pages and the file guides in every language, from the registries', () => {
    const pdf = pdfVoicePages();
    expect(pdf).toHaveLength((PDF_TOOL_IDS.length + 1) * LANGS.length);
    for (const page of pdf) expect(page.path, `${page.id} ${page.lang}`).toBe(routeById(page.id).paths[page.lang]);
    const guides = fileGuideVoicePages();
    expect(guides).toHaveLength(FILE_GUIDE_IDS.length * LANGS.length);
    for (const id of FILE_GUIDE_IDS) {
      for (const lang of LANGS) expect(guides, `${id} ${lang}`).toContainEqual({ id, lang, path: FILE_GUIDES[id].paths[lang] });
    }
    // The paths are the route map's.
    for (const page of guides) expect(page.path, `${page.id} ${page.lang}`).toBe(routeById(page.id).paths[page.lang]);
  });

  it('reads the other new pages of pt and es: the QR code generator, and in es the new calculators and presets, the hub and the money guides', () => {
    const pages = newVoicePages();
    const ids = (lang: 'en' | 'pt' | 'es'): string[] => pages.filter((page) => page.lang === lang).map((page) => page.id);
    expect(ids('en')).toEqual([]);
    expect(ids('pt')).toEqual([QR_ID]);
    const newCalcs = CALC_PAGE_IDS.filter((id) => !F6_ES_CALC_IDS.includes(id));
    expect(newCalcs).toHaveLength(13);
    expect(ids('es')).toEqual([QR_ID, ...newCalcs, MONEY_HUB_ID, ...GUIDE_IDS]);
    expect(pages).toHaveLength(1 + 1 + 13 + 1 + GUIDE_IDS.length);
    for (const page of pages) expect(page.path, `${page.id} ${page.lang}`).toBe(routeById(page.id).paths[page.lang]);
    // The Spanish pages of the F6 stay out, like every page that existed before (PENDENCIAS F7 f-11).
    expect(F6_ES_CALC_IDS).toEqual(['mortgage-calculator', 'personal-loan-calculator', 'credit-card-payoff-calculator', 'debt-payoff-calculator', 'compound-interest-calculator']);
    for (const id of F6_ES_CALC_IDS) expect(ids('es'), id).not.toContain(id);
  });

  /** A page with a visible text and an island whose data-props hold `props`, escaped as Astro writes the attribute. */
  const voicePage = (text: string, props: unknown = { t: { field: { label: 'Texto' } }, texts: { done: '¡Listo! Oli terminó.' } }): string =>
    `<!doctype html><html><body><main><h1>Página</h1><p>${text}</p><div id="fo-tool-root" data-props="${JSON.stringify(props).replaceAll('"', '&quot;')}"></div><script>const a = "¡Hola!";</script></main></body></html>`;

  it('passes a clean page in its language, with one exclamation in the success line of the island (positive control)', () => {
    for (const lang of LANGS) expect(pageVoiceProblems(voicePage('Oli faz o QR code no seu aparelho.'), lang), lang).toEqual([]);
  });

  it('fails the visible text and the island texts of a page by the rules of its language (negative controls)', () => {
    // A marketing word of Portuguese, refused in Portuguese and not in English.
    expect(pageVoiceProblems(voicePage('Um gerador revolucionário.'), 'pt')).toEqual(['texto visível: "revolucionário" é uma palavra que o README do design proíbe']);
    expect(pageVoiceProblems(voicePage('Um gerador revolucionário.'), 'en')).toEqual([]);
    // In the island's texts: a Spanish marketing word in `texts`, an exclamation outside the success line in `t`.
    expect(pageVoiceProblems(voicePage('Texto.', { t: { field: { label: 'Escribe' } }, texts: { lead: 'Crea códigos QR sin esfuerzo.' } }), 'es')).toEqual(['data-props.texts.lead: "sin esfuerzo" é uma palavra que o README do design proíbe']);
    expect(pageVoiceProblems(voicePage('Texto.', { t: { errors: { long: '¡Ay! Es demasiado largo.' } } }), 'es')).toEqual(['data-props.t.errors.long: exclamação fora da fala de sucesso']);
    // An emoji or an arrow in the visible text.
    expect(pageVoiceProblems(voicePage('Listo 🎉'), 'es').join()).toMatch(/texto visível: emoji no texto/);
    expect(pageVoiceProblems(voicePage('PNG → SVG'), 'pt').join()).toMatch(/texto visível: seta/);
    // The guides read the visible text only (props false), as in the F5b.
    expect(pageVoiceProblems(voicePage('Texto.', { t: { errors: { long: '¡Ay!' } } }), 'es', false)).toEqual([]);
  });
});

describe('o bloco do CSS da ilha de PDF (F5a)', () => {
  const components = readFileSync('src/styles/components.css', 'utf8');
  const start = components.indexOf('/* ---- F5a:');
  const block = start >= 0 ? components.slice(start) : '';

  it('finds the block of the PDF island in components.css, with the pieces it styles', () => {
    expect(start).toBeGreaterThan(0);
    for (const selector of ['.fo-pages__grid', '.fo-page__main', '.fo-sign__pad', '.fo-sign__box', '.fo-pass__toggle', '.fo-merge__moves']) expect(block, selector).toContain(selector);
  });

  it('keeps its colours to the text tokens, its movement to the five properties and its theme variables to the tokens', () => {
    expect(checkTextColors(block)).toEqual([]);
    expect(checkMotion(block)).toEqual([]);
    expect(checkThemeVars(block, names)).toEqual([]);
  });

  it('would catch a hex colour, a colour transition and a made-up theme variable in that block', () => {
    expect(checkTextColors(`${block}\n.fo-sign__notice { color: #FFC93C; }`)).toHaveLength(1);
    expect(checkMotion(`${block}\n.fo-page { transition: background-color 150ms; }`)).toHaveLength(1);
    expect(checkMotion(`${block}\n.fo-page { transition: all 150ms; }`)).toHaveLength(1);
    expect(checkThemeVars(`${block}\n:root { --color-sun-fake: #ffc93c; }`, names)).toHaveLength(1);
  });
});
