// The default build, with none of the AdSense variables (F12, decision 11 and criterion 1; Mudança 10, DECISOES § 413):
// every page of dist/, read without rendering, has no ad box, no unit, no push, nothing of the ad-block wall (the
// dialog, the bait, its script, the recovery tag) and no sad pose in the sprite. With no unit id, nothing exists: no box,
// no label, no reserved space. The pages are read from dist/ (run `pnpm build` first, as `pnpm verificar` does).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { listFiles } from '../../scripts/lib/dist.ts';

// FO_DEFAULT_DIST points the test at another build folder (the proof that it fails on the dist/ of the starting point).
const DIST = process.env['FO_DEFAULT_DIST'] ?? 'dist';
const BUILT = existsSync(join(DIST, 'index.html'));

/** What none of the default pages may carry, by what it is. */
const FORBIDDEN: [string, RegExp][] = [
  ['caixa de anúncio', /class="fo-ad[\s"]/],
  ['rótulo de anúncio', /class="fo-ad__label"/],
  // The cookie notice of every page reads the anchor ad (ins.adsbygoogle[data-anchor-status]) to rise above it; a unit or a
  // push is something else.
  ['unidade do AdSense', /class="adsbygoogle"/],
  ['push do AdSense', /window\.adsbygoogle\s*=|adsbygoogle[^;]*\.push\s*\(/],
  ['carregador do AdSense', /pagead2\.googlesyndication\.com/],
  ['parede do bloqueador', /fo-wall/],
  ['isca do bloqueador', /fo-bait/],
  ['tag de recuperação do Google', /fundingchoicesmessages|googlefc/],
  ['pose sad', /oli-sad/],
];

/** The pages of dist/ and what each one carries that it must not. */
function offenders(pages: { path: string; html: string }[]): string[] {
  return pages.flatMap(({ path, html }) => FORBIDDEN.filter(([, pattern]) => pattern.test(html)).map(([what]) => `${path}: ${what}`));
}

describe.runIf(BUILT)('the default build has nothing of the ads nor of the wall', () => {
  const pages = listFiles(DIST)
    .filter((file) => file.endsWith('.html'))
    .map((file) => ({ path: file.slice(DIST.length).split('\\').join('/'), html: readFileSync(file, 'utf8') }));

  it('reads every page of the site', () => {
    expect(pages.length).toBeGreaterThanOrEqual(211);
  });

  it('has no ad box, unit, push, wall, bait, recovery tag or sad pose on any page', () => {
    expect(offenders(pages)).toEqual([]);
  });

  it('catches each of them on a page that has it (control)', () => {
    const samples = [
      '<div class="fo-ad fo-ad--content"></div>',
      '<span class="fo-ad__label">Advertisements</span>',
      '<ins class="adsbygoogle"></ins>',
      '<script>(window.adsbygoogle=window.adsbygoogle||[]).push({})</script>',
      '<script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>',
      '<dialog id="fo-wall"></dialog>',
      '<div id="fo-bait"></div>',
      '<script src="https://fundingchoicesmessages.google.com/i/pub-0000000000000000?ers=1"></script>',
      '<symbol id="oli-sad"></symbol>',
    ];
    for (const sample of samples) expect(offenders([{ path: '/x/', html: `<main>${sample}</main>` }]), sample).not.toEqual([]);
    expect(offenders([{ path: '/x/', html: '<main class="fo-main"><p>Advertisements</p></main>' }])).toEqual([]);
  });
});
