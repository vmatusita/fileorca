// The two dates in sight (F19a, decision 4; DECISOES § 754 and § 757), read from dist/ after `pnpm build`:
// - the line "Updated {date} · What's new" of every image, PDF and QR code page (tools and presets) is the <lastmod> of the
//   page in the sitemap of its language: one p.fo-updated[data-updated], out of the island and of every content block,
//   with one <time datetime> equal to it, the long date of the language as its text, and the link to What's new. No other
//   page has one (the calculators and the guides show their own date of review);
// - the date at the base of the footer of every page built from the route map (the 404, offline and "Open with" pages
//   too) is the newest entry What's new shows in that language (newestIn), in a <time datetime> with the short date of the
//   language, linked to that entry on the What's new page, which has an element with its id.
import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { allPages, fileForPath } from '../../scripts/lib/dist.ts';
import { isImagePage, isPdfPage, isQrPage } from '../../scripts/lib/seo-pages.ts';
import { LANGS, ROUTES, pathFor } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { longDate, shortDate } from '../../src/i18n/dates.ts';
import { fmt } from '../../src/i18n/format.ts';
import { newestIn } from '../../src/platform/changelog.ts';
import { SITE_ORIGIN } from '../../src/platform/site.ts';

const text = (value: string) => value.replace(/[ \t\r\n]+/g, ' ').trim();

describe('the line "Updated" of the image, PDF and QR code pages is their <lastmod>', () => {
  const pages = LANGS.flatMap((lang) => {
    const file = `dist/sitemap-${lang}.xml`;
    const xml = existsSync(file) ? readFileSync(file, 'utf8') : '';
    return [...xml.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>([^<]*)<\/lastmod><\/url>/g)].map((match) => {
      const path = (match[1] ?? '').slice(SITE_ORIGIN.length);
      return { lang, path, lastmod: match[2] ?? '', route: ROUTES.find((candidate) => candidate.paths[lang] === path) };
    });
  });
  const withLine = (id: string) => isImagePage(id) || isPdfPage(id) || isQrPage(id);

  it('reads the sitemaps of dist/', () => {
    expect(existsSync(fileForPath('/')), 'dist/ não existe: rode pnpm build antes do Vitest').toBe(true);
    for (const page of pages) expect(page.route, page.path).toBeDefined();
    const expected = ROUTES.filter((route) => route.indexable && withLine(route.id)).reduce((sum, route) => sum + LANGS.filter((lang) => route.paths[lang] !== undefined).length, 0);
    expect(pages.filter((page) => withLine(page.route?.id ?? '')).length).toBe(expected);
    expect(expected).toBeGreaterThan(0);
  });

  it('shows the <lastmod> of the page, in the long date of its language, with the link to What\'s new', () => {
    const wrong: string[] = [];
    for (const { lang, path, lastmod, route } of pages) {
      if (!route || !withLine(route.id)) continue;
      const root = parse(readFileSync(fileForPath(path), 'utf8'));
      const lines = root.querySelectorAll('[data-updated]');
      if (lines.length !== 1) {
        wrong.push(`${path}: ${lines.length} lines "Updated"`);
        continue;
      }
      const line = lines[0]!;
      const times = line.querySelectorAll('time');
      const common = TEXTS[lang].common;
      const want = `${fmt(common.trust.updated, { date: longDate(lastmod, lang) })} · ${common.footer.whatsNew}`;
      if (!line.classList.contains('fo-updated')) wrong.push(`${path}: the line has no class fo-updated`);
      if (!line.closest('main') || line.closest('#fo-tool-root') || line.closest('[data-content]')) wrong.push(`${path}: the line is out of the <main> or inside the island or a content block`);
      if (times.length !== 1 || times[0]?.getAttribute('datetime') !== lastmod) wrong.push(`${path}: <time> ${times.map((time) => time.getAttribute('datetime')).join(', ')}, lastmod ${lastmod}`);
      if (text(line.textContent) !== want) wrong.push(`${path}: "${text(line.textContent)}", want "${want}"`);
      if (line.querySelector('a')?.getAttribute('href') !== pathFor('whats-new', lang)) wrong.push(`${path}: the link goes to ${line.querySelector('a')?.getAttribute('href')}`);
    }
    expect(wrong).toEqual([]);
  });

  it('is on no other page: the calculators, the guides, the hubs and the pages of the site have none', () => {
    const extra = pages.filter(({ path, route }) => route && !withLine(route.id) && parse(readFileSync(fileForPath(path), 'utf8')).querySelector('[data-updated], .fo-updated'));
    expect(extra.map((page) => page.path)).toEqual([]);
  });
});

describe('the date in the footer of every page is the newest change of its language', () => {
  it('links the short date of the newest entry to that entry on What\'s new', () => {
    const wrong: string[] = [];
    let checked = 0;
    for (const { lang, path } of allPages()) {
      const file = fileForPath(path);
      if (!existsSync(file)) {
        wrong.push(`${path}: not built`);
        continue;
      }
      const newest = newestIn(lang);
      const links = parse(readFileSync(file, 'utf8')).querySelectorAll('footer .fo-footer__updated');
      checked++;
      if (links.length !== 1) {
        wrong.push(`${path}: ${links.length} dates in the footer`);
        continue;
      }
      const link = links[0]!;
      const time = link.querySelector('time');
      if (link.getAttribute('href') !== `${pathFor('whats-new', lang)}#${newest.id}`) wrong.push(`${path}: the date links to ${link.getAttribute('href')}`);
      if (time?.getAttribute('datetime') !== newest.date) wrong.push(`${path}: <time datetime="${time?.getAttribute('datetime')}">, newest ${newest.date}`);
      if (text(time?.textContent ?? '') !== shortDate(newest.date, lang)) wrong.push(`${path}: "${text(time?.textContent ?? '')}"`);
      if (!text(link.textContent).includes(text(fmt(TEXTS[lang].common.trust.updated, { date: shortDate(newest.date, lang) })))) wrong.push(`${path}: "${text(link.textContent)}"`);
    }
    expect(wrong).toEqual([]);
    expect(checked).toBe(allPages().length);
  });

  it('leads to an entry that is on the What\'s new page of the language', () => {
    for (const lang of LANGS) {
      const page = parse(readFileSync(fileForPath(pathFor('whats-new', lang)), 'utf8'));
      const newest = newestIn(lang);
      expect(page.querySelector(`main li#${newest.id}`), `${lang} #${newest.id}`).not.toBeNull();
      expect(page.querySelector(`main li#${newest.id} time`)?.getAttribute('datetime'), lang).toBe(newest.date);
    }
  });
});
