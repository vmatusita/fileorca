// ToolSearch (docs/design/components/ToolSearch): combobox inside a modal <dialog>. This module and
// the index (/search-index.json) load on first use only (DECISOES § 15). Each entry brings the icon of
// its tool, so the results need no request of their own. F11 (decision 7; DECISOES § 397): the results come in two
// groups, the tools first and then the guides, each a role="group" named by its title; an empty group has no title. The
// order inside each group is the one of filterEntries, and the arrows run through both groups as one list.
import { iconMarkup } from '../icons/svg.ts';

export interface SearchEntry {
  id: string;
  /** A tool (or calculator) or a guide (F11): the group of the results it goes in. */
  kind: 'tool' | 'guide';
  /** href per language */
  href: Record<string, string>;
  /** display name per language */
  name: Record<string, string>;
  category: Record<string, string>;
  /** design-system category class suffix (fo-cat--image) */
  cat: string;
  /** children of the tool icon (docs/design/assets/Icons) */
  icon: string;
  /** every name and synonym in every language, normalized */
  terms: string[];
}

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

/**
 * How close an entry is to the query (DECISOES § 180): 0 when a name or synonym is the whole query, 1 when one
 * holds the whole query as a phrase, 2 when every word is only found somewhere in its terms, and -1 when a word is
 * not found at all. "pdf to jpg" is the name of PDF to JPG and only three loose words of Image to PDF.
 */
function closeness(entry: SearchEntry, phrase: string, words: readonly string[]): number {
  if (entry.terms.includes(phrase)) return 0;
  if (entry.terms.some((term) => term.includes(phrase))) return 1;
  return words.every((word) => entry.terms.some((term) => term.includes(word))) ? 2 : -1;
}

/**
 * Entries whose names or synonyms (any language) contain every word of the query, the closest first (closeness):
 * the first one is where Enter goes, so a tool typed by its name is never behind a neighbour that only shares the
 * words. Inside each step the index order holds. With a language, only the entries that have a page in it: a page
 * that exists only in English is never offered in Portuguese or Spanish, and the search never falls back to the
 * English link.
 */
export function filterEntries(entries: SearchEntry[], query: string, lang?: string): SearchEntry[] {
  const here = lang === undefined ? entries : entries.filter((entry) => entry.href[lang] !== undefined);
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return here;
  const phrase = words.join(' ');
  const ranked = here.map((entry) => ({ entry, step: closeness(entry, phrase, words) })).filter((item) => item.step >= 0);
  // Array.prototype.sort is stable: inside a step, the index order is kept.
  return ranked.sort((a, b) => a.step - b.step).map((item) => item.entry);
}

let index: Promise<SearchEntry[]> | null = null;

function loadIndex(): Promise<SearchEntry[]> {
  index ??= fetch('/search-index.json').then((response) => response.json() as Promise<SearchEntry[]>);
  return index;
}

/** The results in the order of the screen: every tool, then every guide, each group in the order of filterEntries. */
export function groupEntries(entries: readonly SearchEntry[]): SearchEntry[] {
  return [...entries.filter((entry) => entry.kind !== 'guide'), ...entries.filter((entry) => entry.kind === 'guide')];
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string>, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Wires a search box (dialog or the inline one on the 404) once; returns a function to focus it. */
export function attach(root: HTMLElement): () => void {
  const lang = document.documentElement.dataset['lang'] ?? 'en';
  const input = root.querySelector<HTMLInputElement>('input[role="combobox"]');
  const list = root.querySelector<HTMLElement>('[role="listbox"]');
  const empty = root.querySelector<HTMLElement>('[data-search-empty]');
  const status = root.querySelector<HTMLElement>('[data-search-status]');
  if (!input || !list || !empty) return () => {};
  if (root.dataset['ready'] === 'true') return () => input.focus();
  root.dataset['ready'] = 'true';
  const emptyTitle = empty.dataset['title'] ?? '';
  let results: SearchEntry[] = [];
  let active = -1;

  const go = (entry: SearchEntry | undefined) => {
    const href = entry?.href[lang];
    if (href) window.location.assign(href);
  };

  const select = (position: number) => {
    active = position;
    const options = list.querySelectorAll('[role="option"]');
    options.forEach((option, i) => option.setAttribute('aria-selected', String(i === position)));
    if (position >= 0) {
      input.setAttribute('aria-activedescendant', `${list.id}-${position}`);
      // The list scrolls past eight rows: the active row stays in view as the arrows move it (the group titles are not
      // rows: the option itself is scrolled to).
      options[position]?.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  };

  const render = async () => {
    results = groupEntries(filterEntries(await loadIndex(), input.value, lang));
    const groups: HTMLElement[] = [];
    let group: HTMLElement | null = null;
    results.forEach((entry, i) => {
      const kind = entry.kind === 'guide' ? 'guides' : 'tools';
      if (group?.dataset['kind'] !== kind) {
        // A title per group that has a result, named in the language of the page; the group is named by it.
        const title = el('div', { class: 'fo-search__group', id: `${list.id}-${kind}` }, list.dataset[kind] ?? '');
        group = el('div', { role: 'group', 'aria-labelledby': title.id, 'data-kind': kind });
        group.append(title);
        groups.push(group);
      }
      const option = el('div', { id: `${list.id}-${i}`, role: 'option', 'aria-selected': 'false', class: `fo-search__item fo-cat--${entry.cat}` });
      const dot = el('span', { class: 'fo-chip__dot', 'aria-hidden': 'true' });
      dot.innerHTML = iconMarkup(entry.icon);
      option.append(dot, el('span', {}, entry.name[lang] ?? ''), el('small', {}, entry.category[lang] ?? ''));
      option.addEventListener('click', () => go(entry));
      group.append(option);
    });
    list.replaceChildren(...groups);
    const none = results.length === 0;
    list.hidden = none;
    empty.hidden = !none;
    input.setAttribute('aria-expanded', String(!none));
    const said = none ? emptyTitle.replace('{query}', input.value.trim()) : '';
    if (none) {
      const title = empty.querySelector('[data-search-empty-title]');
      if (title) title.textContent = said;
    }
    // The status region speaks the empty state, which the hidden block alone does not (WCAG 4.1.3).
    if (status) status.textContent = said;
    select(none ? -1 : 0);
  };

  input.addEventListener('input', () => void render());
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' && results.length) {
      event.preventDefault();
      select((active + 1) % results.length);
    } else if (event.key === 'ArrowUp' && results.length) {
      event.preventDefault();
      select((active - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(results[active]);
    }
  });
  void render();
  return () => input.focus();
}

export function openSearch(): void {
  const dialog = document.getElementById('fo-search-dialog') as HTMLDialogElement | null;
  if (!dialog) return;
  const focus = attach(dialog);
  if (!dialog.open) dialog.showModal();
  focus();
}
