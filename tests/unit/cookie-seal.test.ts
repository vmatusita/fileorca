// F13a · o aviso compacto (UX-09; DECISOES § 458): every page of dist/ repeats, in its cookie notice, the seal of the page
// itself, followed by a period and the Privacy link: the PrivacySeal under the H1 where the page has one (the files of the
// image and PDF tools, the numbers of the calculators, the text of the QR code), the numbers on the two calculator hubs, and
// the files everywhere else (the home, the file hubs, the guides, the legal and institutional pages). Before, the notice of
// every page said the files never leave the device, numbers and text included. Read from dist/ (run `pnpm build` first).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { listFiles } from '../../scripts/lib/dist.ts';
import enCommon from '../../src/i18n/en/common.ts';
import esCommon from '../../src/i18n/es/common.ts';
import ptCommon from '../../src/i18n/pt/common.ts';
import { QR_ID } from '../../src/i18n/routes.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';
import qrEn from '../../src/tools/qr-code-generator/i18n/en.ts';
import qrPt from '../../src/tools/qr-code-generator/i18n/pt.ts';
import qrEs from '../../src/tools/qr-code-generator/i18n/es.ts';

// FO_COOKIE_DIST points the test at another build folder (the proof that it fails on the dist/ of the starting point).
const DIST = process.env['FO_COOKIE_DIST'] ?? 'dist';
const BUILT = existsSync(join(DIST, 'index.html'));
const COMMON = { en: enCommon, pt: ptCommon, es: esCommon } as const;
const HUBS = ['/money-calculators/', '/pt/calculadoras-financeiras/', '/es/calculadoras-financieras/', '/home-calculators/', '/health-calculators/'];
// F19b (DECISOES § 786 and § 796): a guide that embeds the QR code generator takes no file, so its notice says the seal of
// the QR code (its text never leaves the device), like the QR page; the image and PDF guides keep the seal of the files.
const QR_SEAL = { en: qrEn.seal, pt: qrPt.seal, es: qrEs.seal } as const;
const QR_GUIDE_PATHS = new Set(FILE_GUIDE_IDS.filter((id) => FILE_GUIDES[id].tool === QR_ID).flatMap((id) => Object.values(FILE_GUIDES[id].paths)));

const text = (html: string): string =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

describe.runIf(BUILT)('the cookie notice repeats the seal of its page', () => {
  const pages = listFiles(DIST)
    .filter((file) => file.endsWith('.html'))
    .map((file) => ({ path: file.slice(DIST.length).split('\\').join('/').replace(/index\.html$/, ''), html: readFileSync(file, 'utf8') }))
    .filter((page) => page.html.includes('id="fo-cookie-text"'));

  it('reads every page with a notice', () => {
    expect(pages.length).toBeGreaterThanOrEqual(200);
  });

  it('says the seal of the page, then a period and the Privacy link', () => {
    const wrong: string[] = [];
    for (const { path, html } of pages) {
      const lang = (/<html[^>]*data-lang="(en|pt|es)"/.exec(html)?.[1] ?? 'en') as keyof typeof COMMON;
      const common = COMMON[lang];
      const own = /<span class="fo-seal"[^>]*>(.*?)<\/span>/s.exec(html)?.[1];
      const seal = own ? text(own) : HUBS.includes(path) ? common.calcSeal : QR_GUIDE_PATHS.has(path) ? QR_SEAL[lang] : common.seal;
      const notice = text(/<p id="fo-cookie-text"[^>]*>(.*?)<\/p>/s.exec(html)?.[1] ?? '');
      const expected = `${common.cookie.title} ${common.cookie.body} ${seal}. ${common.cookie.privacyLink}`;
      if (notice !== expected) wrong.push(`${path}: "${notice}" (esperado "${expected}")`);
    }
    expect(wrong, wrong.slice(0, 10).join('\n')).toEqual([]);
  });
});
