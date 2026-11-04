import { readFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { POSES, isPose, type Pose } from '../../src/oli/poses.ts';
import { buildSprite, loadSprite, logoMarkup, poseBytes, spriteMarkup } from '../../src/oli/sprite.ts';

const BYTE_LIMIT = 4096;
const sprite = loadSprite();
const everything = () => spriteMarkup(sprite, POSES) + logoMarkup(sprite, { className: 'fo-logo', label: 'FileOrca' });

const readAsset = (path: string) => readFileSync(`docs/design/assets/${path}`, 'utf8');
const sources = () => ({
  poses: Object.fromEntries(POSES.map((pose) => [pose, readAsset(`Oli/oli-${pose}.svg`)])) as Record<Pose, string>,
  logo: readAsset('Logo/logo-light.svg'),
});

const idsOf = (markup: string) => [...markup.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1] ?? '');
const count = (text: string, part: string) => text.split(part).length - 1;

describe('sprite da Oli: montagem', () => {
  it('has ten symbols named after the closed list of poses', () => {
    expect([...sprite.symbols.keys()]).toEqual([...POSES]);
    expect(idsOf(spriteMarkup(sprite, POSES)).filter((id) => /^oli-(?!p\d|clip)/.test(id))).toEqual(POSES.map((pose) => `oli-${pose}`));
    expect(isPose('wave')).toBe(true);
    expect(isPose('sing')).toBe(false);
  });

  it('keeps each pose within 4096 bytes: symbol + the parts it references + oli-clip', () => {
    const rows = POSES.map((pose) => ({ pose, bytes: poseBytes(sprite, pose) }));
    console.log(['| pose | bytes |', '| --- | ---: |', ...rows.map((row) => `| ${row.pose} | ${row.bytes} |`)].join('\n'));
    for (const { pose, bytes } of rows) expect(bytes, pose).toBeLessThanOrEqual(BYTE_LIMIT);
  });

  it('shares a drawing that repeats across poses as one part instead of copying it', () => {
    const wave = sprite.symbols.get('wave');
    const swim = sprite.symbols.get('swim');
    expect(sprite.parts.size).toBeGreaterThan(5);
    expect(wave?.markup).toContain('<use href="#oli-p1"/>');
    expect(wave?.parts.filter((id) => swim?.parts.includes(id)).length).toBeGreaterThan(5);
    for (const [id, markup] of sprite.parts) expect(markup.startsWith(`<`) && markup.includes(` id="${id}"`), id).toBe(true);
    // The silhouette path is drawn once in the parts, not once per pose.
    const body = /d="(M14 74 C14 50[^"]*)"/.exec(sprite.clip)?.[1] ?? '';
    expect(body.length).toBeGreaterThan(50);
    expect([...sprite.parts.values()].filter((markup) => markup.includes(body)).length).toBeGreaterThanOrEqual(3);
    for (const { markup } of sprite.symbols.values()) expect(markup).not.toContain(body);
  });

  it('declares oli-clip once, for the poses and for the inline logo', () => {
    expect(count(everything(), 'id="oli-clip"')).toBe(1);
    expect(count(everything(), 'url(#oli-clip)')).toBeGreaterThanOrEqual(1);
    expect(spriteMarkup(sprite, [])).toContain(sprite.clip);
  });

  it('drops the unused clipPath ic of the peek', () => {
    expect(everything()).not.toContain('id="ic"');
    expect(everything()).not.toContain('#ic)');
    expect(sprite.symbols.get('peek')?.markup).toContain('viewBox="0 18 128 80"');
    expect(sprite.symbols.get('peek')?.parts).toEqual([]);
  });

  it('has no duplicate id and every reference resolves', () => {
    const markup = everything();
    const ids = idsOf(markup);
    expect(new Set(ids).size).toBe(ids.length);
    const targets = [...markup.matchAll(/href="#([^"]*)"|url\(#([^)]*)\)/g)].map((match) => match[1] ?? match[2] ?? '');
    expect(targets.length).toBeGreaterThan(20);
    for (const target of targets) expect(ids, target).toContain(target);
  });

  it('is hidden off-screen: aria-hidden, zero size, never display:none', () => {
    const markup = spriteMarkup(sprite, POSES);
    expect(markup.startsWith('<svg class="fo-sprite" aria-hidden="true" focusable="false" width="0" height="0"><defs>')).toBe(true);
    expect(markup.endsWith('</defs></svg>')).toBe(true);
    expect(markup).not.toMatch(/display\s*:\s*none/);
  });

  it('carries only the symbols of the poses a page uses, plus the parts of those poses and of the logo', () => {
    const markup = spriteMarkup(sprite, ['wave']);
    expect(idsOf(markup).filter((id) => /^oli-(?!p\d|clip)/.test(id))).toEqual(['oli-wave']);
    const wanted = new Set([...(sprite.symbols.get('wave')?.parts ?? []), ...sprite.logo.parts]);
    expect(idsOf(markup).filter((id) => /^oli-p\d/.test(id))).toEqual([...wanted].sort((a, b) => Number(a.slice(5)) - Number(b.slice(5))));
    expect(markup).not.toContain('id="oli-peek"');
    expect(markup.length).toBeLessThan(spriteMarkup(sprite, POSES).length);
    // Poses come out in the order of the closed list, whatever the order asked for.
    expect(idsOf(spriteMarkup(sprite, ['peek', 'wave', 'wave'])).filter((id) => /^oli-(?!p\d|clip)/.test(id))).toEqual(['oli-wave', 'oli-peek']);
  });

  it('refuses an unknown pose', () => {
    expect(() => spriteMarkup(sprite, ['sing' as Pose])).toThrow(/unknown Oli pose "sing"/);
    expect(() => poseBytes(sprite, 'sing' as Pose)).toThrow(/unknown Oli pose/);
  });

  it('keeps the classes the CSS animates (oli-steam) inside the coffee symbol', () => {
    const coffee = sprite.symbols.get('coffee')?.markup ?? '';
    expect(coffee).toContain('class="oli-steam"');
    expect(coffee).toContain('class="oli-mug"');
  });

  it('memoizes the sprite per root', () => {
    expect(loadSprite()).toBe(sprite);
  });
});

describe('sprite da Oli: logo inline', () => {
  const logo = logoMarkup(sprite, { className: 'fo-logo', label: 'FileOrca' });

  it('draws the Oli only with <use> and the two words as paths without fill', () => {
    expect(logo.startsWith('<svg class="fo-logo" viewBox="0 0 426 128" role="img" aria-label="FileOrca">')).toBe(true);
    expect(logo.endsWith('</svg>')).toBe(true);
    expect(logo).toContain('<g transform="translate(128 4) scale(-1 1)"><g transform="translate(64 64) scale(0.9) translate(-69.5 -60)"><use href="#oli-p1"/>');
    expect(sprite.logo.parts.length).toBe(11);
    expect(count(logo, '<use ')).toBe(11);
    expect(count(logo, '<path ')).toBe(2);
    expect(logo).toMatch(/<path class="fo-logo__file" d="M147\.1 92\.7[^"]*"\/><path class="fo-logo__orca" d="M283\.9 93\.4[^"]*"\/><\/svg>$/);
    for (const forbidden of ['<ellipse', '<circle', '<rect', 'fill=', 'stroke=', 'clip-path', 'id=']) expect(logo).not.toContain(forbidden);
  });

  it('escapes the class and the label', () => {
    expect(logoMarkup(sprite, { className: 'a"b', label: 'File & <Orca>' })).toContain('class="a&quot;b"');
    expect(logoMarkup(sprite, { className: 'a', label: 'File & <Orca>' })).toContain('aria-label="File &amp; &lt;Orca>"');
  });
});

describe('sprite da Oli: a estrutura dos arquivos é conferida', () => {
  it('assembles from the sources as read by loadSprite', () => {
    expect(buildSprite(sources()).parts).toEqual(sprite.parts);
  });

  it('fails naming the file when a pose changes the wrapper', () => {
    const input = sources();
    input.poses.cheer = input.poses.cheer.replace('scale(0.9)', 'scale(0.8)');
    expect(() => buildSprite(input)).toThrow(/oli-cheer\.svg: expected attributes/);
  });

  it('fails naming the file when oli-clip differs between poses', () => {
    const input = sources();
    input.poses.oops = input.poses.oops.replace('<clipPath id="oli-clip"><path d="M14 74', '<clipPath id="oli-clip"><path d="M15 74');
    expect(() => buildSprite(input)).toThrow(/oli-oops\.svg: oli-clip differs from the one in oli-wave\.svg/);
  });

  it('fails naming the logo when its clip or its words change', () => {
    const clip = sources();
    clip.logo = clip.logo.replace('<clipPath id="oli-clip"><path d="M14 74', '<clipPath id="oli-clip"><path d="M13 74');
    expect(() => buildSprite(clip)).toThrow(/logo-light\.svg: oli-clip differs/);
    const word = sources();
    word.logo = word.logo.replace('fill="#0B63F6"/></svg>', 'fill="#5AA2FF"/></svg>');
    expect(() => buildSprite(word)).toThrow(/logo-light\.svg: the "Orca" path must be/);
  });

  it('fails when the peek starts to use its clipPath ic', () => {
    const input = sources();
    input.poses.peek = input.poses.peek.replace('<g><g fill', '<g clip-path="url(#ic)"><g fill');
    expect(() => buildSprite(input)).toThrow(/oli-peek\.svg: expected attributes/);
    input.poses.peek = sources().poses.peek.replace('<path d="M56 100', '<path clip-path="url(#ic)" d="M56 100');
    expect(() => buildSprite(input)).toThrow(/oli-peek\.svg: clipPath "ic" is referenced/);
  });

  it('fails on markup the assembler does not parse', () => {
    const input = sources();
    input.poses.gulp = input.poses.gulp.replace('<defs>', '<!-- no --><defs>');
    expect(() => buildSprite(input)).toThrow(/oli-gulp\.svg:1: unsupported markup/);
    input.poses.gulp = sources().poses.gulp.replace('</defs>', '</defs>text');
    expect(() => buildSprite(input)).toThrow(/oli-gulp\.svg:1: unexpected text "text"/);
  });
});

// Pixel equivalence with resvg: the sprite must draw what the original files draw.
// Measured on the current drawings: 0 or 1 pixel above a channel difference of 32 out of 65,536
// (the tip of the fin, 58 at most). The limit leaves room for resvg or antialiasing changes while
// a missing or misplaced piece costs thousands (see the negative control).
const PIXEL_LIMIT = 8;
const CHANNEL_STEP = 32;
const NIGHT = '#0B1524';

function rasterize(svg: string, width: number) {
  const image = new Resvg(svg, { fitTo: { mode: 'width', value: width }, background: NIGHT, font: { loadSystemFonts: false } }).render();
  const size = { width: image.width, height: image.height };
  const pixels = image.pixels; // each access copies the buffer: read it once
  return { ...size, pixels };
}

function differingPixels(a: ReturnType<typeof rasterize>, b: ReturnType<typeof rasterize>): number {
  expect([a.width, a.height]).toEqual([b.width, b.height]);
  let count = 0;
  for (let i = 0; i < a.pixels.length; i += 4) {
    let worst = 0;
    for (let channel = 0; channel < 4; channel++) worst = Math.max(worst, Math.abs((a.pixels[i + channel] ?? 0) - (b.pixels[i + channel] ?? 0)));
    if (worst > CHANNEL_STEP) count++;
  }
  return count;
}

const defsOf = (poses: readonly Pose[]) => {
  const markup = spriteMarkup(sprite, poses);
  return markup.slice(markup.indexOf('<defs>'), markup.lastIndexOf('</defs>') + '</defs>'.length);
};

// The host markup of the site: no viewBox, the symbol fits the box (the peek box is 128:80).
const hosted = (pose: Pose, width: number, drawn: Pose = pose) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${pose === 'peek' ? width * 0.625 : width}">${defsOf([drawn])}<use href="#oli-${drawn}"/></svg>`;

describe('sprite da Oli: equivalência de pixels com os arquivos originais (resvg, 256 px)', () => {
  it.each(POSES)('%s drawn through <use> matches its original file', (pose) => {
    const original = rasterize(readAsset(`Oli/oli-${pose}.svg`), 256);
    expect(differingPixels(original, rasterize(hosted(pose, 256), 256))).toBeLessThanOrEqual(PIXEL_LIMIT);
  });

  it('would notice a wrong pose (negative control)', () => {
    const original = rasterize(readAsset('Oli/oli-wave.svg'), 256);
    expect(differingPixels(original, rasterize(hosted('wave', 256, 'gulp'), 256))).toBeGreaterThan(1000);
  });

  it('draws the inline logo like logo-light.svg, with the fills given by the two classes', () => {
    const markup = logoMarkup(sprite, { className: 'fo-logo', label: 'FileOrca' });
    const style = '<style>.fo-logo__file{fill:#0F1B2D}.fo-logo__orca{fill:#0B63F6}</style>';
    const standalone = markup.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace('>', `>${style}${defsOf([])}`);
    const original = rasterize(readAsset('Logo/logo-light.svg'), 852);
    expect(differingPixels(original, rasterize(standalone, 852))).toBeLessThanOrEqual(PIXEL_LIMIT);
  });
});
