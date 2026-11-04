// The two inline scripts of the theme (F11, decision 2; DECISOES § 385), run in a context of their own like the consent
// bootstrap (tests/unit/consent.test.ts): the <head> one reads fo-theme and puts light or dark on <html> and in the
// color-scheme meta; the button one cycles System → Light → Dark, writes or removes the key and says the new name in the
// status region. With the storage blocked, neither throws: the page opens in System and the button still switches it.
import { runInNewContext } from 'node:vm';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { THEME_CHOICES, THEME_CYCLE, THEME_STORAGE_KEY, themeBootstrap, themeToggle } from '../../src/platform/theme.ts';

type Store = { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void; removeItem: (key: string) => void };

/** A storage that keeps its values in a map, or one whose every call throws (a private window, blocked site data). */
function storage(initial: Record<string, string> = {}, blocked = false): { store: Store; values: Map<string, string> } {
  const values = new Map(Object.entries(initial));
  const fail = () => {
    throw new Error('SecurityError: storage is blocked');
  };
  return {
    values,
    store: blocked
      ? { getItem: fail, setItem: fail, removeItem: fail }
      : { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => void values.set(key, String(value)), removeItem: (key) => void values.delete(key) },
  };
}

interface Page {
  html: { dataset: Record<string, string> };
  meta: { content: string } | null;
  status: { textContent: string } | null;
  click: () => void;
  hasButton: boolean;
}

const NAMES = { system: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' } as const;

/** A page with the meta, the theme button with its three .fo-sr names and the status region, as the Header renders it. */
function page(store: Store, options: { meta?: boolean; button?: boolean; status?: boolean; theme?: string } = {}): Page {
  const html = { dataset: {} as Record<string, string> };
  if (options.theme) html.dataset['theme'] = options.theme;
  const meta = options.meta === false ? null : { content: 'light dark' };
  const status = options.status === false ? null : { textContent: '' };
  let handler: (() => void) | null = null;
  const button = {
    addEventListener: (type: string, listener: () => void) => {
      if (type === 'click') handler = listener;
    },
    querySelector: (selector: string) => {
      const match = /^\.fo-theme__state--(system|light|dark) \.fo-sr$/.exec(selector);
      return match ? { textContent: NAMES[match[1] as keyof typeof NAMES] } : null;
    },
  };
  const document = {
    documentElement: html,
    querySelector: (selector: string) => {
      if (selector === 'meta[name="color-scheme"]') return meta;
      if (selector === '[data-theme-toggle]') return options.button === false ? null : button;
      if (selector === '[data-theme-status]') return status;
      return null;
    },
  };
  // Only what the scripts may touch: no fetch, no location, no history, no dataLayer. A reference to any of them throws.
  const context = { document, localStorage: store };
  runInNewContext(themeBootstrap(), context);
  runInNewContext(themeToggle(), context);
  return {
    html,
    meta,
    status,
    hasButton: handler !== null,
    click: () => {
      if (!handler) throw new Error('no click listener');
      handler();
    },
  };
}

describe('the <head> script of the theme', () => {
  it('puts a stored light or dark on <html> and in the color-scheme meta', () => {
    for (const choice of THEME_CHOICES) {
      const { html, meta } = page(storage({ [THEME_STORAGE_KEY]: choice }).store);
      expect(html.dataset['theme']).toBe(choice);
      expect(meta?.content).toBe(choice);
    }
  });

  it('leaves System alone: no key, or a value outside the list, puts no data-theme and keeps "light dark"', () => {
    for (const stored of [{}, { [THEME_STORAGE_KEY]: 'blue' }, { [THEME_STORAGE_KEY]: '' }, { 'fo-consent': 'dark' }]) {
      const { html, meta } = page(storage(stored).store);
      expect(html.dataset['theme'], JSON.stringify(stored)).toBeUndefined();
      expect(meta?.content).toBe('light dark');
    }
  });

  it('opens in System, with no error, when the storage is blocked', () => {
    const { html, meta } = page(storage({}, true).store);
    expect(html.dataset['theme']).toBeUndefined();
    expect(meta?.content).toBe('light dark');
  });

  it('still puts data-theme when the page has no color-scheme meta (the error stays inside the try)', () => {
    const { html } = page(storage({ [THEME_STORAGE_KEY]: 'dark' }).store, { meta: false });
    expect(html.dataset['theme']).toBe('dark');
  });

  it('reads the key fo-theme, and nothing else: no write, no request, no address', () => {
    expect(THEME_STORAGE_KEY).toBe('fo-theme');
    expect(themeBootstrap()).toContain('localStorage.getItem("fo-theme")');
    expect(themeBootstrap()).not.toMatch(/setItem|removeItem|fetch|XMLHttpRequest|sendBeacon|location|history|gtag|dataLayer|cookie/);
  });
});

describe('the script of the theme button', () => {
  it('goes System → Light → Dark → System, with the meta, the key and the name in the status region', () => {
    const { store, values } = storage();
    const p = page(store);
    expect(p.hasButton).toBe(true);
    expect(THEME_CYCLE).toEqual(['', 'light', 'dark']);
    p.click();
    expect([p.html.dataset['theme'], p.meta?.content, values.get(THEME_STORAGE_KEY), p.status?.textContent]).toEqual(['light', 'light', 'light', NAMES.light]);
    p.click();
    expect([p.html.dataset['theme'], p.meta?.content, values.get(THEME_STORAGE_KEY), p.status?.textContent]).toEqual(['dark', 'dark', 'dark', NAMES.dark]);
    p.click();
    // Back to System: no data-theme (prefers-color-scheme decides), both schemes in the meta, and the key removed.
    expect('theme' in p.html.dataset).toBe(false);
    expect([p.meta?.content, values.has(THEME_STORAGE_KEY), p.status?.textContent]).toEqual(['light dark', false, NAMES.system]);
    p.click();
    expect(p.html.dataset['theme']).toBe('light');
  });

  it('starts from the stored choice: Dark goes back to System and removes the key', () => {
    const { store, values } = storage({ [THEME_STORAGE_KEY]: 'dark' });
    const p = page(store);
    expect(p.html.dataset['theme']).toBe('dark');
    p.click();
    expect('theme' in p.html.dataset).toBe(false);
    expect(values.size).toBe(0);
  });

  it('still switches the theme of the page when the storage is blocked, without an error', () => {
    const p = page(storage({}, true).store);
    expect(() => p.click()).not.toThrow();
    expect([p.html.dataset['theme'], p.meta?.content, p.status?.textContent]).toEqual(['light', 'light', NAMES.light]);
    expect(() => p.click()).not.toThrow();
    expect(p.html.dataset['theme']).toBe('dark');
  });

  it('does nothing, with no error, on a page without the button, and works without the meta or the status region', () => {
    expect(() => page(storage().store, { button: false })).not.toThrow();
    const p = page(storage().store, { meta: false, status: false });
    expect(() => p.click()).not.toThrow();
    expect(p.html.dataset['theme']).toBe('light');
  });

  it('sends nothing and listens to no other tab: no request, no event, no address, no storage listener', () => {
    expect(themeToggle()).not.toMatch(/fetch|XMLHttpRequest|sendBeacon|location|history|gtag|dataLayer|foTrack|cookie|"storage"/);
    expect(themeToggle().match(/addEventListener\("(\w+)"/g)).toEqual(['addEventListener("click"']);
  });
});

describe('the size of the two scripts', () => {
  it('keeps them small: together well under the 1 KB of gzip the run may add to the initial JS of a page', () => {
    const head = Buffer.byteLength(themeBootstrap());
    const button = Buffer.byteLength(themeToggle());
    const gzip = gzipSync(`${themeBootstrap()}\n${themeToggle()}`, { level: 9 }).length;
    expect(head).toBeLessThanOrEqual(200);
    expect(button).toBeLessThanOrEqual(600);
    expect(gzip).toBeLessThanOrEqual(512);
  });
});
