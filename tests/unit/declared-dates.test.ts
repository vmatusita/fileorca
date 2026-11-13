// The dates a page shows or declares about itself, against its <lastmod> (F19a, decision 3; DECISOES § 757). For every
// URL of the three sitemaps in dist/, the <lastmod> is never before a date the page gives as its own:
// - in the JSON-LD (every script[type="application/ld+json"]): each datePublished and dateModified, in any node of the
//   graph (the Article of the guides and of How it works);
// - in the <main>, every time[datetime] outside the island (#fo-tool-root): the "Reviewed" line of the guides, the
//   calculators and their hubs (p.fo-reviewed), "First published" and the day each source was read, the history of a file
//   guide (published and measured), the line "Updated" of the image, PDF and QR code pages (p.fo-updated) and the day
//   of each change on What's new (li.fo-change);
// - on the Privacy and the Terms, the "Last updated" line (main .fo-view--legal p.fo-muted), read with the long date of
//   the language (src/i18n/dates.ts; "1º de" too, the way pt once wrote the first day).
// Not counted, because they are data and not the date of the page: what the island computes and shows (a payment
// schedule, the days of a cycle or of a pregnancy), the dates of the worked examples, written as plain text, and the
// footer, outside the <main>, whose date is the newest change of the whole site (decision 4). When a real page fails, the
// history is wrong: the fix goes in src/platform/changelog.ts, never here.
// Read dist/ after `pnpm build` (as `pnpm verificar` does: the build runs before the Vitest step).
import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { fileForPath } from '../../scripts/lib/dist.ts';
import { LANGS, ROUTES, type Lang } from '../../src/i18n/routes.ts';
import { longDate } from '../../src/i18n/dates.ts';
import { SITE_ORIGIN } from '../../src/platform/site.ts';

interface Declared {
  where: string;
  date: string;
}

const isIsoDay = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

/** A long date of the language in a text ("November 5, 2026", "5 de novembro de 2026", "1º de novembro de 2026"), as an ISO day. */
function parseLongDate(text: string, lang: Lang): string | undefined {
  const months = Array.from({ length: 12 }, (_, index) => {
    const written = longDate(`2026-${String(index + 1).padStart(2, '0')}-01`, lang);
    return lang === 'en' ? (written.split(' ')[0] ?? '') : (written.split(' de ')[1] ?? '');
  });
  const match = lang === 'en' ? /\b([A-Z][a-z]+) (\d{1,2}), (\d{4})\b/.exec(text) : /\b(\d{1,2})º? de ([a-zç]+) de (\d{4})\b/.exec(text);
  if (!match) return undefined;
  const [, a = '', b = '', year = ''] = match;
  const month = months.indexOf(lang === 'en' ? a : b) + 1;
  const day = Number(lang === 'en' ? b : a);
  if (month === 0) return undefined;
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return isIsoDay(iso) ? iso : undefined;
}

/** Every date the page gives as its own (the rules at the top of this file). */
function declaredDates(html: string, lang: Lang): Declared[] {
  const root = parse(html);
  const out: Declared[] = [];
  const walk = (value: unknown, path: string) => {
    if (Array.isArray(value)) value.forEach((item, index) => walk(item, `${path}[${index}]`));
    else if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        if ((key === 'datePublished' || key === 'dateModified') && typeof item === 'string') out.push({ where: `JSON-LD ${path}.${key}`, date: item });
        else walk(item, `${path}.${key}`);
      }
    }
  };
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) walk(JSON.parse(script.textContent), 'ld');
  const main = root.querySelector('main');
  for (const island of main?.querySelectorAll('#fo-tool-root') ?? []) island.remove();
  for (const time of main?.querySelectorAll('time[datetime]') ?? []) {
    out.push({ where: `<time> in ${time.parentNode?.getAttribute?.('class') ?? time.parentNode?.tagName ?? '?'}: ${time.textContent.trim()}`, date: time.getAttribute('datetime') ?? '' });
  }
  for (const line of main?.querySelectorAll('.fo-view--legal p.fo-muted') ?? []) {
    out.push({ where: `"${line.textContent.trim()}"`, date: parseLongDate(line.textContent, lang) ?? `unreadable: ${line.textContent.trim()}` });
  }
  return out;
}

describe('the reader of the declared dates', () => {
  it('reads the long dates of each language, and nothing else', () => {
    expect(parseLongDate('Last updated: November 5, 2026', 'en')).toBe('2026-11-05');
    expect(parseLongDate('Última atualização: 1º de novembro de 2026', 'pt')).toBe('2026-11-01');
    expect(parseLongDate('Última atualização: 3 de novembro de 2026', 'pt')).toBe('2026-11-03');
    expect(parseLongDate('Última actualización: 5 de noviembre de 2026', 'es')).toBe('2026-11-05');
    expect(parseLongDate('Last updated: Novembre 5, 2026', 'en')).toBeUndefined();
    expect(parseLongDate('Last updated: November 31, 2026', 'en')).toBeUndefined();
    expect(parseLongDate('5 de novembro de 2026', 'es')).toBeUndefined();
  });

  it('takes the JSON-LD, the <time> of the <main> out of the island and the legal line, and leaves the rest', () => {
    const html = `<html><head><script type="application/ld+json">{"@graph":[{"@type":"Article","datePublished":"2026-11-02","dateModified":"2026-11-11"}]}</script></head><body>
      <main><p class="fo-reviewed"><time datetime="2026-11-03">Nov 3</time></p>
      <div id="fo-tool-root"><time datetime="2027-06-14">June 14, 2027</time></div>
      <article class="fo-view fo-view--legal"><div class="fo-prose"><p class="fo-muted">Last updated: November 5, 2026</p></div></article>
      <p>Due date June 14, 2027</p></main>
      <footer><time datetime="2026-12-01">Dec 1</time></footer></body></html>`;
    expect(declaredDates(html, 'en').map((found) => found.date)).toEqual(['2026-11-02', '2026-11-11', '2026-11-03', '2026-11-05']);
  });
});

describe('no page has a <lastmod> before a date it shows or declares', () => {
  const pages = LANGS.flatMap((lang) => {
    const file = `dist/sitemap-${lang}.xml`;
    const xml = existsSync(file) ? readFileSync(file, 'utf8') : '';
    return [...xml.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>([^<]*)<\/lastmod><\/url>/g)].map((match) => ({ lang, url: match[1] ?? '', lastmod: match[2] ?? '' }));
  });

  it('reads the three sitemaps of dist/, one <url> per indexable page', () => {
    expect(existsSync(fileForPath('/')), 'dist/ não existe: rode pnpm build antes do Vitest').toBe(true);
    expect(pages.length).toBe(ROUTES.filter((route) => route.indexable).reduce((sum, route) => sum + LANGS.filter((lang) => route.paths[lang] !== undefined).length, 0));
  });

  it('every date of every page is a real day, and none is after its <lastmod>', () => {
    const late: string[] = [];
    let dated = 0;
    for (const { lang, url, lastmod } of pages) {
      const path = url.slice(SITE_ORIGIN.length);
      const found = declaredDates(readFileSync(fileForPath(path), 'utf8'), lang);
      if (found.length > 0) dated++;
      for (const { where, date } of found) {
        if (!isIsoDay(date)) late.push(`${path}: not a day (${date}) at ${where}`);
        else if (date > lastmod) late.push(`${path}: lastmod ${lastmod} is before ${date} (${where})`);
      }
    }
    expect(late).toEqual([]);
    // The guard reads something: the guides, the calculators, the tool pages, the legal pages and What's new have dates.
    expect(dated).toBeGreaterThan(pages.length / 2);
  });

  it('reads the "Last updated" line of the Privacy and the Terms in every language', () => {
    for (const { lang, url } of pages) {
      const path = url.slice(SITE_ORIGIN.length);
      const route = ROUTES.find((candidate) => candidate.paths[lang] === path);
      if (route?.id !== 'privacy' && route?.id !== 'terms') continue;
      const legal = declaredDates(readFileSync(fileForPath(path), 'utf8'), lang).filter((found) => found.where.startsWith('"'));
      expect(legal, path).toHaveLength(1);
      expect(isIsoDay(legal[0]?.date ?? ''), `${path}: ${legal[0]?.where}`).toBe(true);
    }
  });
});
