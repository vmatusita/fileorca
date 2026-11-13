// The history of What's new (F19a, decision 1; DECISOES § 755 and § 757): src/platform/changelog.ts against itself, the
// route map, its texts and the history of git.
// - The entries: unique ids, real days in order, pages that exist (a RouteId of an indexable route, or a named group of
//   pages that exist), a 'site' entry with no page, a 'conteudo' entry that touches a page somewhere.
// - The births: every indexable page of every language is named by a 'conteudo' entry, and the first one that names it
//   there is the pull request that brought its file (src/pages/<path>index.astro) into the first-parent history of HEAD.
//   The commits before the launch (the first where src/platform/site.ts has LAUNCHED = true) count as the launch.
// - The dates: an entry with a pr is the day of the squash commit of that PR (main merges by squash: one commit whose
//   subject ends in "(#N)"; DECISOES § 757), in Brasília (UTC-3, no summer time in 2026), with one day of tolerance; only
//   the newest entry may have no pr, and it is never after today. LAUNCH_DATE is the date of the first entry and the
//   day of the launch merge, exactly.
// - The texts: a title and one to three sentences in each language where the entry shows (entriesIn), and none where it
//   does not; no digit (no count of tools, no phase name, no number from outside a registry) and no exclamation.
// The CI clones the whole history (fetch-depth: 0, DECISOES § 75). On a branch or a pull request the pages of the run are
// born in a commit with no "(#N)": the entry of the run has pr null. Once that run is merged, the next run gives the entry
// its pr (the test then finds the squash commit of the run as the birth). In between, on main and on every pull request
// opened before the next run, the open entry (pr null) is the one of the run whose commit brought it into
// src/platform/changelog.ts: once that commit is the squash commit "(#N)" of the run, the pages born there are its births,
// its date is that day give or take a day, and no other entry may claim #N (F19a review, E-1; DECISOES § 776).
import { execFileSync } from 'node:child_process';
import { beforeAll, describe, expect, it } from 'vitest';
import { CHANGELOG, PAGE_GROUPS, birthOf, entriesIn, lastmodOf, newestIn, pagesIn, type ChangeEntry, type PageGroup } from '../../src/platform/changelog.ts';
import { LANGS, ROUTES, type Lang } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { LAUNCH_DATE, parseLaunched } from '../../src/platform/site.ts';

const entries = CHANGELOG as readonly ChangeEntry[];
const routeOf = (id: string) => ROUTES.find((route) => route.id === id);
const langsOf = (entry: ChangeEntry): readonly Lang[] => entry.langs ?? LANGS;
const isIsoDay = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
/** The day of an instant in Brasília (UTC-3 all year in 2026). */
const brasiliaDay = (instant: string | number) => new Date(new Date(instant).getTime() - 3 * 3_600_000).toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => Math.abs(Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000;

describe('the entries of the changelog', () => {
  it('have unique ids and real days in order, oldest first', () => {
    const ids = entries.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const entry of entries) expect(isIsoDay(entry.date), entry.id).toBe(true);
    for (let i = 1; i < entries.length; i++) expect(entries[i]!.date >= entries[i - 1]!.date, `${entries[i]!.id} after ${entries[i - 1]!.id}`).toBe(true);
  });

  it('name only indexable routes and groups that exist, each in a language of the entry', () => {
    for (const [group, ids] of Object.entries(PAGE_GROUPS)) {
      expect(ids.length, group).toBeGreaterThan(0);
      for (const id of ids) expect(routeOf(id)?.indexable, `${group}: ${id}`).toBe(true);
    }
    for (const entry of entries) {
      for (const lang of langsOf(entry)) expect(LANGS, entry.id).toContain(lang);
      for (const ref of entry.pages) {
        if (ref.startsWith('all:')) {
          expect(Object.keys(PAGE_GROUPS), `${entry.id}: ${ref}`).toContain(ref.slice(4) as PageGroup);
          continue;
        }
        const route = routeOf(ref);
        expect(route?.indexable, `${entry.id}: ${ref}`).toBe(true);
        expect(langsOf(entry).some((lang) => route?.paths[lang] !== undefined), `${entry.id}: ${ref} in ${langsOf(entry).join(', ')}`).toBe(true);
      }
    }
  });

  it("keep 'site' for what belongs to every page and 'conteudo' for a change to pages", () => {
    for (const entry of entries) {
      if (entry.kind === 'site') expect(entry.pages, entry.id).toEqual([]);
      else expect(LANGS.some((lang) => pagesIn(entry, lang).length > 0), entry.id).toBe(true);
    }
  });

  it('show in a language when they touch a page there, or when they are of every page', () => {
    for (const lang of LANGS) {
      const shown = entries.filter((entry) => langsOf(entry).includes(lang) && (entry.kind === 'site' || pagesIn(entry, lang).length > 0));
      expect(entriesIn(lang).map((entry) => entry.id), lang).toEqual(shown.map((entry) => entry.id).reverse());
      expect(newestIn(lang).id, lang).toBe(shown.at(-1)?.id);
      // What's new changes with every entry it shows: its <lastmod> is the newest of them (DECISOES § 756).
      expect(lastmodOf('whats-new', lang), lang).toBe(shown.at(-1)?.date);
    }
  });

  it('give every indexable page of every language a content entry that names it, its birth there', () => {
    for (const route of ROUTES.filter((candidate) => candidate.indexable)) {
      for (const lang of LANGS) {
        if (route.paths[lang] === undefined) {
          expect(birthOf(route.id, lang), `${route.id} has no ${lang} page`).toBeUndefined();
          continue;
        }
        const born = birthOf(route.id, lang);
        expect(born, `${route.id} ${lang}`).toBeDefined();
        const entry = entries[born ?? -1];
        expect(entry?.kind, `${route.id} ${lang}`).toBe('conteudo');
        expect(entry?.pages, `${route.id} ${lang}`).toContain(route.id);
        expect(lastmodOf(route.id, lang) >= (entry?.date ?? ''), `${route.id} ${lang}`).toBe(true);
      }
    }
  });
});

describe('the changelog against the history of git', () => {
  /** The first-parent history of HEAD, oldest first: the squash commits of main, then those of the branch. */
  let log: { sha: string; date: string; subject: string; pr: number | null }[] = [];
  let launch = -1;
  /** The open entry (pr null, the newest) and the first-parent commit that brought it into the changelog. */
  const open = entries.at(-1)?.pr === null ? entries.at(-1) : undefined;
  let openAt = -1;
  // stderr aside: the first commits have no src/platform/site.ts, and git says so.
  const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });

  beforeAll(() => {
    log = git('log', '--first-parent', '--reverse', '--format=%H%x09%cI%x09%s', 'HEAD')
      .trim()
      .split('\n')
      .map((line) => {
        const [sha = '', date = '', subject = ''] = line.split('\t');
        const pr = /\(#(\d+)\)$/.exec(subject)?.[1];
        return { sha, date, subject, pr: pr === undefined ? null : Number(pr) };
      });
    launch = log.findIndex((commit) => {
      try {
        return parseLaunched(git('show', `${commit.sha}:src/platform/site.ts`));
      } catch {
        return false;
      }
    });
    if (open) {
      // The oldest first-parent commit whose changelog has the id of the open entry: a commit of the branch before the
      // merge, the squash commit of the run after it. An entry not committed yet is in none of them (openAt stays -1).
      const added = git('log', '--first-parent', '--reverse', '--format=%H', '-S', `id: '${open.id}'`, 'HEAD', '--', 'src/platform/changelog.ts').trim().split('\n')[0] ?? '';
      openAt = log.findIndex((commit) => commit.sha === added);
    }
  }, 60_000);

  /** The pull request of the open entry once its run is merged: the "(#N)" of the commit that brought it; else null. */
  const openPr = () => (openAt >= 0 ? (log[openAt]?.pr ?? null) : null);

  it('has the launch in the history, and LAUNCH_DATE is its day and the date of the first entry', () => {
    expect(launch, 'a commit with LAUNCHED = true').toBeGreaterThanOrEqual(0);
    const commit = log[launch]!;
    expect(commit.pr, commit.subject).not.toBeNull();
    expect(entries[0]?.pr).toBe(commit.pr);
    expect(entries[0]?.date).toBe(LAUNCH_DATE);
    expect(brasiliaDay(commit.date), commit.subject).toBe(LAUNCH_DATE);
  });

  it('dates every entry with a pr on the day its squash commit reached main, in Brasília, give or take a day', () => {
    for (const entry of entries) {
      if (entry.pr === null) continue;
      const commits = log.filter((commit) => commit.pr === entry.pr);
      expect(commits, `${entry.id}: the squash commit of #${entry.pr}`).toHaveLength(1);
      const day = brasiliaDay(commits[0]?.date ?? '');
      expect(daysBetween(entry.date, day), `${entry.id}: ${entry.date}, #${entry.pr} on ${day}`).toBeLessThanOrEqual(1);
    }
    // The open entry of a merged run: the day of its squash commit, give or take a day, and a pull request no entry claims.
    const pr = openPr();
    if (open && pr !== null) {
      expect(entries.filter((entry) => entry.pr === pr), `#${pr}, the squash commit of ${open.id}`).toEqual([]);
      const day = brasiliaDay(log[openAt]?.date ?? '');
      expect(daysBetween(open.date, day), `${open.id}: ${open.date}, #${pr} on ${day}`).toBeLessThanOrEqual(1);
    }
  });

  it('leaves no pr only on the newest entry, never after today in Brasília', () => {
    const unnumbered = entries.filter((entry) => entry.pr === null);
    for (const entry of unnumbered) expect(entry, entry.id).toBe(entries.at(-1));
    for (const entry of unnumbered) expect(entry.date <= brasiliaDay(Date.now()), entry.id).toBe(true);
    // The newest entry with no pr is not older than the last squash commit before the commit that brought it (all of the
    // history while that commit is of the branch, or not committed yet).
    const before = openAt >= 0 ? log.slice(0, openAt) : log;
    const lastPr = before.filter((commit) => commit.pr !== null).at(-1);
    for (const entry of unnumbered) expect(entry.date >= brasiliaDay(lastPr?.date ?? '1970-01-01'), entry.id).toBe(true);
  });

  it('gives every page the birth git gives it: the pull request that brought its file to the history', () => {
    const files = log.map((commit) => new Set(git('ls-tree', '-r', '--name-only', commit.sha, '--', 'src/pages').split('\n')));
    const wrong: string[] = [];
    let checked = 0;
    for (const route of ROUTES.filter((candidate) => candidate.indexable)) {
      for (const lang of LANGS) {
        const path = route.paths[lang];
        if (path === undefined) continue;
        const file = `src/pages${path}index.astro`;
        const first = files.findIndex((list) => list.has(file));
        expect(first, `${file} in the history`).toBeGreaterThanOrEqual(0);
        const want = first <= launch ? log[launch]?.pr : log[first]?.pr;
        const born = entries[birthOf(route.id, lang) ?? -1];
        // The open entry stands for the pull request of its merged run (openPr), and for no number before the merge.
        const says = born !== undefined && born === open ? openPr() : born?.pr;
        checked++;
        if (says !== want) wrong.push(`${route.id} ${lang}: the changelog says #${says}, git says #${want} (${log[first]?.subject})`);
      }
    }
    expect(wrong).toEqual([]);
    expect(checked).toBe(ROUTES.filter((route) => route.indexable).reduce((sum, route) => sum + LANGS.filter((lang) => route.paths[lang] !== undefined).length, 0));
  }, 60_000);
});

describe('the texts of What\'s new', () => {
  it('exist for every entry a language shows, and only for those', () => {
    for (const lang of LANGS) {
      const texts = TEXTS[lang]['whats-new'].entries;
      expect(Object.keys(texts).sort(), lang).toEqual(entriesIn(lang).map((entry) => entry.id).sort());
    }
  });

  it('are a short title and one to three sentences, with no digit and no exclamation', () => {
    for (const lang of LANGS) {
      for (const [id, text] of Object.entries(TEXTS[lang]['whats-new'].entries)) {
        if (!text) continue;
        const where = `${lang} ${id}`;
        expect(text.title.length, where).toBeGreaterThan(0);
        expect(text.title.length, where).toBeLessThanOrEqual(60);
        expect(text.title, where).not.toMatch(/[.!?]$/);
        const sentences = text.body.split(/(?<=[.?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ"¿])/u);
        expect(sentences.length, where).toBeGreaterThanOrEqual(1);
        expect(sentences.length, where).toBeLessThanOrEqual(3);
        expect(text.body, where).toMatch(/\.$/);
        for (const part of [text.title, text.body]) {
          expect(part, where).not.toMatch(/\d/);
          expect(part, where).not.toMatch(/[!¡]/);
        }
      }
    }
  });
});
