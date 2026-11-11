// F13b · a página de guia (UX-13 A, decision 5; DECISOES § 376 and § 557 to § 565). The tables of the "What we
// measured" section without the columns that hold one value in every row, grouped by the first column where it repeats
// (F5b F-13 and the guides half of F4 ACE-9); the sheet under the H1 with two numbers of the measurement (G-17); the
// signature in one line and the history line (G-23); the link to the tool's page in the text (D-54); the hint of a table
// wider than its frame (F5b F-2). The pure parts are tested here, and the 30 pages in dist/ (run pnpm build first).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { LANGS, type Lang } from '../../src/i18n/routes.ts';
import { fmt } from '../../src/i18n/format.ts';
import { mediumDate, shortDate } from '../../src/i18n/dates.ts';
import { MEASURED, VARIANTS, globals, pageTable, pageTables, placeholdersIn, resolvePlaceholder } from '../../src/tools/guides/measured.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS, GUIDE_PUBLISHED_ON, GUIDE_REVIEWED_ON, type FileGuideId } from '../../src/tools/guides/registry.ts';
import { GUIDE_SHARED, guideTexts, toolInfo } from '../../src/tools/guides/page.ts';

/** The built site; the proof against the starting point reads a copy of this file with the folder swapped. */
const ROOT = 'dist';

const page = (path: string): HTMLElement => {
  const file = join(ROOT, path, 'index.html');
  expect(existsSync(file), `${path} não existe em ${ROOT}/: rode pnpm build antes do Vitest`).toBe(true);
  return parse(readFileSync(file, 'utf8'));
};
/** The text of a node with its spaces folded, but the no-break space of pt and es between a number and its unit kept. */
const text = (node: HTMLElement | null | undefined): string => (node?.textContent ?? '').replace(/[ \t\r\n]+/g, ' ').trim();
const ALL = FILE_GUIDE_IDS.flatMap((id) => LANGS.map((lang) => ({ id, lang, path: FILE_GUIDES[id].paths[lang] })));

describe('the tables of a guide as the page draws them (pageTable)', () => {
  it('leaves out a column with one value in every row, never the first, and keeps a table of one row whole', () => {
    const rows = [
      ['a', 'x', '1', 'None'],
      ['b', 'x', '2', 'None'],
    ];
    const table = pageTable(rows, ['Name', 'Kind', 'Size', 'GPS']);
    expect(table.head).toEqual(['Name', 'Size']);
    expect(table.groups).toEqual([[['a', '1'], ['b', '2']]]);
    expect(table.dropped).toEqual([{ head: 'Kind', value: 'x' }, { head: 'GPS', value: 'None' }]);
    expect(pageTable([['same', 'same']], ['A', 'B']).dropped).toEqual([]);
    expect(pageTable([['same', 'x'], ['same', 'y']], ['A', 'B']).head).toEqual(['A', 'B']);
  });

  it('groups the rows by the first column when it repeats, in the order each value first appears, even when they are apart', () => {
    const rows = [
      ['YouTube', 'Banner', '1'],
      ['Pinterest', 'Pin', '2'],
      ['YouTube', 'Thumbnail', '3'],
    ];
    const table = pageTable(rows, ['Network', 'Use', 'Size']);
    expect(table.grouped).toBe(true);
    expect(table.groups).toEqual([[['YouTube', 'Banner', '1'], ['YouTube', 'Thumbnail', '3']], [['Pinterest', 'Pin', '2']]]);
    expect(pageTable([['a', '1'], ['b', '2']], ['A', 'B']).grouped).toBe(false);
  });

  it('refuses a group whose rows share the cell that tells them apart', () => {
    expect(() => pageTable([['A', 'same', '1'], ['A', 'same', '2'], ['B', 'other', '3']], ['X', 'Y', 'Z'])).toThrow(/share a row header/);
  });

  it('leaves out the GPS column of the HEIC guide and the GPS column of guide 6, and nothing else, in the three languages', () => {
    const dropped: Partial<Record<FileGuideId, string[]>> = { 'guides-heic-to-jpg-on-windows': ['GPS after'], 'guides-remove-location-from-photos': ['Photos with GPS left'] };
    for (const id of FILE_GUIDE_IDS) {
      const tables = pageTables(id, GUIDE_SHARED.en, guideTexts(id, 'en'));
      expect(tables.flatMap((table) => table.dropped.map((column) => column.head)), id).toEqual(dropped[id] ?? []);
      for (const lang of LANGS) {
        const own = pageTables(id, GUIDE_SHARED[lang], guideTexts(id, lang), MEASURED, lang);
        expect(own.map((table) => table.dropped.length), `${id} ${lang}`).toEqual(tables.map((table) => table.dropped.length));
      }
    }
    // What the two columns held is what the measurement says: no JPG and no photo kept any GPS data.
    expect(MEASURED.guides['guides-heic-to-jpg-on-windows'].numbers['gpsAfterChromium']?.value).toBe(0);
    const location = MEASURED.guides['guides-remove-location-from-photos'].numbers;
    for (const tool of ['compressImage', 'removeExifData', 'resizeImage', 'cropImage', 'rotateImage', 'pngToJpg', 'imageToPdf']) expect(location[`${tool}GpsChromium`]?.value, tool).toBe(0);
  });

  it('groups the HEIC photos by camera, the PDF pages by file and the social sizes by network', () => {
    const grouped = FILE_GUIDE_IDS.filter((id) => pageTables(id, GUIDE_SHARED.en, guideTexts(id, 'en')).some((table) => table.grouped));
    expect(grouped.sort()).toEqual(['guides-heic-to-jpg-on-windows', 'guides-pdf-to-jpg-resolution', 'guides-social-media-image-sizes']);
    const social = pageTables('guides-social-media-image-sizes', GUIDE_SHARED.en, guideTexts('guides-social-media-image-sizes', 'en'))[0];
    expect(social?.groups.map((group) => group[0]?.[0])).toEqual(['Instagram', 'Facebook', 'X', 'LinkedIn', 'YouTube', 'Pinterest']);
    expect(social?.groups.find((group) => group[0]?.[0] === 'YouTube')).toHaveLength(2);
  });
});

/** The values of the placeholders of a text, written from data/guides-measured.json by the formats of measured.ts. */
function fromJson(id: FileGuideId, template: string, lang: Lang): { filled: string; values: string[] } {
  const f = { lang, shared: GUIDE_SHARED[lang] };
  const always = globals(MEASURED, lang);
  const values: string[] = [];
  const filled = template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const found = resolvePlaceholder(id, name, MEASURED);
    const value = found ? VARIANTS[found.variant](found.number, f) : always[name];
    if (value === undefined) throw new Error(`${id}: {${name}} is not measured`);
    if (found) values.push(value);
    return value;
  });
  return { filled, values };
}

describe('the texts of the sheet, the history and the columns left out', () => {
  for (const lang of LANGS) {
    it(`give every guide a sheet of two numbers, each from measured placeholders only (${lang})`, () => {
      for (const id of FILE_GUIDE_IDS) {
        const t = guideTexts(id, lang);
        expect(t.sheet.stats, id).toHaveLength(2);
        for (const stat of t.sheet.stats) {
          // The number itself is measured: at least one measured placeholder, and every one of them resolves.
          expect([...placeholdersIn(stat.value)].filter((name) => resolvePlaceholder(id, name, MEASURED)), `${id}: ${stat.value}`).not.toEqual([]);
          for (const part of [stat.value, stat.from, stat.to, stat.sub, stat.label]) if (part) expect(() => fromJson(id, part, lang), `${id}: ${part}`).not.toThrow();
          expect(stat.from === undefined, `${id}: from and to go together`).toBe(stat.to === undefined);
        }
        expect(() => fromJson(id, t.sheet.sample, lang), id).not.toThrow();
      }
    });

    it(`say what a column left out held, if and only if the page leaves one out (${lang})`, () => {
      for (const id of FILE_GUIDE_IDS) {
        const t = guideTexts(id, lang);
        pageTables(id, GUIDE_SHARED[lang], t, MEASURED, lang).forEach((table, index) => {
          expect(Boolean(t.tables[index]?.constant), `${id} table ${index}`).toBe(table.dropped.length > 0);
        });
      }
    });
  }

  // Review F13b e-1 (DECISOES § 598): the caption is the name of the table for a screen reader, so it names only the columns the
  // page shows: the column the same in every row left out (§ 559) leaves the caption too.
  it('name in the caption of a table only the columns the page shows (the GPS after, the photos that kept GPS)', () => {
    const left: Partial<Record<FileGuideId, RegExp>> = {
      'guides-heic-to-jpg-on-windows': /\b(before and after|antes e depois|antes y después)\b/i,
      'guides-remove-location-from-photos': /\bGPS\b/,
    };
    for (const lang of LANGS) {
      for (const [id, words] of Object.entries(left) as [FileGuideId, RegExp][]) {
        const t = guideTexts(id, lang);
        const tables = pageTables(id, GUIDE_SHARED[lang], t, MEASURED, lang);
        expect(tables.some((table) => table.dropped.length > 0), `${id} ${lang}`).toBe(true);
        tables.forEach((table, index) => {
          if (table.dropped.length > 0) expect(t.tables[index]?.caption ?? '', `${id} ${lang} table ${index}`).not.toMatch(words);
        });
      }
    }
  });

  it('say "all" the HEIC photos in the note only while WebKit gave the same bytes for every one (F5b F-13)', () => {
    const numbers = MEASURED.guides['guides-heic-to-jpg-on-windows'].numbers;
    expect(numbers['identicalBrowsers']?.value).toBe(numbers['files']?.value);
    for (const lang of LANGS) {
      const note = guideTexts('guides-heic-to-jpg-on-windows', lang).measuredNote;
      expect(note, lang).not.toContain('identicalBrowsers');
      expect(note, lang).toMatch(/\{files\} (?:photos|fotos)\./);
    }
  });

  it('end the part the registry names with the link to the tool, in a part that exists in every language', () => {
    for (const id of FILE_GUIDE_IDS) {
      for (const lang of LANGS) expect(FILE_GUIDES[id].toolSection, `${id} ${lang}`).toBeLessThan(guideTexts(id, lang).sections.length);
    }
  });
});

describe('the 30 file guides in dist/', () => {
  for (const lang of LANGS) {
    const pages = ALL.filter((entry) => entry.lang === lang);

    it(`name the frame of each table by a heading, never by the name of the table (${lang})`, () => {
      const problems: string[] = [];
      for (const { path } of pages) {
        const root = page(path);
        const frames = root.querySelectorAll('[data-content="measured"] .fo-table-wrap');
        if (frames.length === 0) problems.push(`${path}: nenhuma moldura`);
        for (const frame of frames) {
          const by = frame.getAttribute('aria-labelledby');
          const name = by ? text(root.querySelector(`#${by}`)) : (frame.getAttribute('aria-label') ?? '');
          const table = text(frame.querySelector('caption'));
          if (!name) problems.push(`${path}: a região sem nome`);
          if (frame.getAttribute('role') !== 'region') problems.push(`${path}: a moldura não é uma região`);
          if (name === table) problems.push(`${path}: a região e a tabela com o mesmo nome ("${name}")`);
        }
      }
      expect(problems).toEqual([]);
    });

    it(`give each tbody distinct row headers and keep no column that holds one value in every row (${lang})`, () => {
      const problems: string[] = [];
      for (const { path } of pages) {
        for (const table of page(path).querySelectorAll('[data-content="measured"] table')) {
          const rows: string[][] = [];
          for (const body of table.querySelectorAll('tbody')) {
            const keys = body.querySelectorAll('th[scope="row"]').map(text);
            if (keys.length !== body.querySelectorAll('tr').length) problems.push(`${path}: uma linha sem th[scope=row]`);
            if (new Set(keys).size !== keys.length) problems.push(`${path}: th[scope=row] repetido num tbody (${keys.join(', ')})`);
            const group = text(body.querySelector('th[scope="rowgroup"]'));
            for (const row of body.querySelectorAll('tr')) rows.push([...(group ? [group] : []), ...row.querySelectorAll('th[scope="row"], td').map(text)]);
          }
          const width = Math.max(...rows.map((row) => row.length));
          for (let column = 0; column < width && rows.length > 1; column += 1) {
            const values = new Set(rows.map((row) => row[column]));
            if (values.size === 1) problems.push(`${path}: a coluna ${column + 1} tem "${[...values][0] ?? ''}" em todas as linhas`);
          }
        }
      }
      expect(problems).toEqual([]);
    });

    it(`link the tool's page in the text of the guide, with no line under the panel (${lang})`, () => {
      const problems: string[] = [];
      for (const { id, path } of pages) {
        const root = page(path);
        const tool = toolInfo(FILE_GUIDES[id].tool, lang).path;
        if (root.querySelector('.fo-guide__open')) problems.push(`${path}: .fo-guide__open`);
        const links = root.querySelectorAll('main [data-guide-text] a').filter((link) => link.getAttribute('href') === tool);
        if (links.length !== 1) problems.push(`${path}: ${links.length} link(s) para ${tool} no texto (pede 1)`);
        const part = root.querySelector(`#part-${FILE_GUIDES[id].toolSection}`)?.parentNode;
        if (!part?.querySelector(`a[href="${tool}"]`)) problems.push(`${path}: o link não está na parte ${FILE_GUIDES[id].toolSection}`);
      }
      expect(problems).toEqual([]);
    });

    it(`show in the sheet the numbers of data/guides-measured.json, and no other digit (${lang})`, () => {
      const problems: string[] = [];
      for (const { id, path } of pages) {
        const t = guideTexts(id, lang);
        const sheet = page(path).querySelector('[data-content="facts"]');
        if (!sheet) {
          problems.push(`${path}: sem a ficha`);
          continue;
        }
        const numbers = sheet.querySelectorAll('.fo-sheet__n').map(text);
        const subs = sheet.querySelectorAll('.fo-sheet__sub').map(text);
        const seen: string[] = [];
        let sub = 0;
        t.sheet.stats.forEach((stat, index) => {
          const value = fromJson(id, stat.value, lang);
          seen.push(...value.values);
          if (numbers[index] !== value.filled) problems.push(`${path}: o número ${index + 1} é "${numbers[index] ?? ''}", o JSON dá "${value.filled}"`);
          const below = stat.from !== undefined && stat.to !== undefined ? [stat.from, stat.to] : stat.sub !== undefined ? [stat.sub] : [];
          if (below.length === 0) return;
          const parts = below.map((part) => fromJson(id, part, lang));
          for (const part of parts) seen.push(...part.values);
          const wanted = parts.map((part) => part.filled);
          const got = subs[sub] ?? '';
          sub += 1;
          if (!wanted.every((part) => got.includes(part))) problems.push(`${path}: a linha de baixo do número ${index + 1} é "${got}", o JSON dá "${wanted.join(' … ')}"`);
        });
        for (const part of [...t.sheet.stats.map((stat) => stat.label), t.sheet.sample, t.sheet.link]) seen.push(...fromJson(id, part, lang).values, ...Object.values(globals(MEASURED, lang)).filter((value) => part.includes(value)));
        // Every digit of the sheet is a measured number (or a technical name of the guide, such as "Form 1040").
        let rest = text(sheet);
        for (const known of [...seen, ...t.names, ...Object.values(globals(MEASURED, lang))].sort((a, b) => b.length - a.length)) rest = rest.split(known).join(' ');
        if (/\d/.test(rest)) problems.push(`${path}: algarismo na ficha fora dos números medidos: "${rest}"`);
        if (/\{\w+\}/.test(text(sheet))) problems.push(`${path}: placeholder na ficha`);
      }
      expect(problems).toEqual([]);
    });

    it(`sign the guide in one line with one short date, and keep the first publication in the history line (${lang})`, () => {
      const problems: string[] = [];
      for (const { path } of pages) {
        const root = page(path);
        const times = root.querySelectorAll('.fo-top .fo-reviewed time');
        if (times.length !== 1 || times[0]?.getAttribute('datetime') !== GUIDE_REVIEWED_ON[lang] || text(times[0]) !== shortDate(GUIDE_REVIEWED_ON[lang], lang)) problems.push(`${path}: a assinatura "${text(root.querySelector('.fo-top .fo-reviewed'))}"`);
        const history = root.querySelector('[data-content="measured"] .fo-guide__history');
        const published = history?.querySelector(`time[datetime="${GUIDE_PUBLISHED_ON[lang]}"]`);
        if (!published || text(published) !== mediumDate(GUIDE_PUBLISHED_ON[lang], lang)) problems.push(`${path}: o histórico "${text(history)}"`);
        if (lang !== 'en' && !history?.querySelector(`time[datetime="${MEASURED.measuredOn}"]`)) problems.push(`${path}: o histórico sem a data da medida`);
      }
      expect(problems).toEqual([]);
    });

    it(`count, in the hint over each table, the columns the page draws (${lang})`, () => {
      const problems: string[] = [];
      for (const { path } of pages) {
        for (const frame of page(path).querySelectorAll('[data-content="measured"] .fo-table-wrap')) {
          const hint = frame.querySelector('.fo-guide__hint');
          const columns = frame.querySelectorAll('thead th').length;
          const wanted = fmt(GUIDE_SHARED[lang].hint, { n: columns });
          if (!hint || text(hint) !== wanted) problems.push(`${path}: a pista "${text(hint)}", pede "${wanted}"`);
          if (!hint?.classList.contains('fo-mobile-only')) problems.push(`${path}: a pista sem fo-mobile-only`);
        }
      }
      expect(problems).toEqual([]);
    });
  }
});
