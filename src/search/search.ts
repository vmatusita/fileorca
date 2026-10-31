// ToolSearch (docs/design/components/ToolSearch): combobox inside a modal <dialog>. This module and
// the index (/search-index.json) load on first use only (DECISOES § 15). Each entry brings the icon of
// its tool, so the results need no request of their own.
import { iconMarkup } from '../icons/svg.ts';

export interface SearchEntry {
  id: string;
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
 * Entries whose names or synonyms (any language) contain every word of the query. With a language, only the
 * entries that have a page in it: a page that exists only in English is never offered in Portuguese or
 * Spanish, and the search never falls back to the English link.
 */
export function filterEntries(entries: SearchEntry[], query: string, lang?: string): SearchEntry[] {
  const here = lang === undefined ? entries : entries.filter((entry) => entry.href[lang] !== undefined);
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return here;
  return here.filter((entry) => words.every((word) => entry.terms.some((term) => term.includes(word))));
}

let index: Promise<SearchEntry[]> | null = null;

function loadIndex(): Promise<SearchEntry[]> {
  index ??= fetch('/search-index.json').then((response) => response.json() as Promise<SearchEntry[]>);
  return index;
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
  const list = root.querySelector<HTMLUListElement>('[role="listbox"]');
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
    list.querySelectorAll('[role="option"]').forEach((option, i) => option.setAttribute('aria-selected', String(i === position)));
    if (position >= 0) {
      input.setAttribute('aria-activedescendant', `${list.id}-${position}`);
      // The list scrolls past eight rows: the active row stays in view as the arrows move it.
      list.children[position]?.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  };

  const render = async () => {
    results = filterEntries(await loadIndex(), input.value, lang);
    list.replaceChildren(
      ...results.map((entry, i) => {
        const option = el('li', { id: `${list.id}-${i}`, role: 'option', 'aria-selected': 'false', class: `fo-search__item fo-cat--${entry.cat}` });
        const dot = el('span', { class: 'fo-chip__dot', 'aria-hidden': 'true' });
        dot.innerHTML = iconMarkup(entry.icon);
        option.append(dot, entry.name[lang] ?? '', el('small', {}, entry.category[lang] ?? ''));
        option.addEventListener('click', () => go(entry));
        return option;
      }),
    );
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
