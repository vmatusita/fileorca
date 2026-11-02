// The list of the offline page (src/platform/offline-list.ts; F8, decision 8; review F8 b-9 and d-1, DECISOES § 307):
// the inline script the page ships runs here on a fake page and a fake Cache Storage. It lists the pages kept, once
// each, with the <title> without " | FileOrca", and each link says its language; never the offline and share pages,
// the files, the inbox, another cache or another origin. With nothing kept, the empty line stays.
import { describe, expect, it } from 'vitest';
import { ROUTES } from '../../src/i18n/routes.ts';
import { offlineListScript } from '../../src/platform/offline-list.ts';
import { INBOX_CACHE, PAGES_CACHE_PREFIX } from '../../src/sw/shared.ts';

const ORIGIN = 'https://fileorca.com';
const SKIP = ROUTES.filter((route) => route.id === 'offline' || route.id === 'open-with').flatMap((route) => Object.values(route.paths));

interface FakeNode {
  tag: string;
  hidden: boolean;
  href: string;
  lang: string;
  textContent: string;
  children: FakeNode[];
  appendChild(child: FakeNode): void;
}

function node(tag: string, hidden = false): FakeNode {
  return {
    tag,
    hidden,
    href: '',
    lang: '',
    textContent: '',
    children: [],
    appendChild(child) {
      this.children.push(child);
    },
  };
}

const page = (title: string) => `<!doctype html><html><head><title>${title}</title></head><body></body></html>`;

/** Runs the shipped script with these caches (name → url → html) and returns the list and the empty line. */
async function run(stored: Record<string, Record<string, string>>): Promise<{ list: FakeNode; empty: FakeNode }> {
  const list = node('ul', true);
  const empty = node('p');
  const document = {
    querySelector: (selector: string) => (selector === '[data-saved]' ? list : selector === '[data-saved-empty]' ? empty : null),
    createElement: (tag: string) => node(tag),
  };
  const caches = {
    keys: async () => Object.keys(stored),
    open: async (name: string) => ({
      keys: async () => Object.keys(stored[name] ?? {}).map((url) => ({ url })),
      match: async (request: { url: string }) => ({ text: async () => stored[name]?.[request.url] ?? '' }),
    }),
  };
  class DOMParser {
    parseFromString(html: string): { title: string } {
      return { title: (/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '').replace(/&amp;/g, '&') };
    }
  }
  new Function('document', 'window', 'caches', 'DOMParser', 'location', offlineListScript(SKIP))(document, { caches }, caches, DOMParser, { origin: ORIGIN });
  for (let i = 0; i < 20; i += 1) await new Promise((resolve) => setTimeout(resolve, 0));
  return { list, empty };
}

describe('the list of the offline page', () => {
  it('lists each kept page once, with its title and its language, and nothing else', async () => {
    const pages = `${PAGES_CACHE_PREFIX}abc1234`;
    const { list, empty } = await run({
      [pages]: {
        [`${ORIGIN}/compress-image/`]: page('Compress image online, free, no upload | FileOrca'),
        [`${ORIGIN}/pt/comprimir-imagem/`]: page('Comprimir imagem online, grátis e sem upload | FileOrca'),
        [`${ORIGIN}/es/comprimir-imagen/`]: page('Comprimir imagen en línea &amp; gratis | FileOrca'),
        [`${ORIGIN}/offline/`]: page('Offline | FileOrca'),
        [`${ORIGIN}/pt/offline/`]: page('Sem internet | FileOrca'),
        [`${ORIGIN}/es/sin-conexion/`]: page('Sin conexión | FileOrca'),
        [`${ORIGIN}/open-with/`]: page('Open with | FileOrca'),
        [`${ORIGIN}/pt/abrir-com/`]: page('Abrir com | FileOrca'),
        [`${ORIGIN}/es/abrir-con/`]: page('Abrir con | FileOrca'),
        [`${ORIGIN}/_astro/island.css`]: 'body{}',
        [`${ORIGIN}/sw-not-a-page`]: page('Not a page'),
        ['https://elsewhere.example/compress-image/']: page('Elsewhere | FileOrca'),
      },
      [`${PAGES_CACHE_PREFIX}old`]: { [`${ORIGIN}/compress-image/`]: page('Compress image, the old copy | FileOrca') },
      [INBOX_CACHE]: { [`${ORIGIN}/__fileorca-inbox/0`]: 'file bytes' },
      'another-cache': { [`${ORIGIN}/mortgage-calculator/`]: page('Mortgage | FileOrca') },
    });
    const links = list.children.map((item) => item.children[0]);
    expect(links.map((link) => [link?.href, link?.lang, link?.textContent])).toEqual([
      ['/compress-image/', 'en', 'Compress image online, free, no upload'],
      ['/pt/comprimir-imagem/', 'pt-BR', 'Comprimir imagem online, grátis e sem upload'],
      ['/es/comprimir-imagen/', 'es', 'Comprimir imagen en línea & gratis'],
    ]);
    expect(list.hidden).toBe(false);
    expect(empty.hidden).toBe(true);
  });

  it('keeps the empty line when no page is kept', async () => {
    const { list, empty } = await run({ [`${PAGES_CACHE_PREFIX}abc1234`]: { [`${ORIGIN}/offline/`]: page('Offline | FileOrca') } });
    expect(list.children).toEqual([]);
    expect(list.hidden).toBe(true);
    expect(empty.hidden).toBe(false);
  });
});
