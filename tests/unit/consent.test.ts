import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { DENIED_BY_DEFAULT_REGIONS, EEA_EXTRA, EU, consentBootstrap, defaultConsentFor } from '../../src/analytics/consent.ts';
import { CODECS, ERROR_REASONS, EVENT_PARAMS, OUTCOMES, browserLabel, cleanParams, type EventMap } from '../../src/analytics/events.ts';
import { CALC_EVENT_TOOLS, EVENT_TOOLS, IMAGE_EVENT_TOOLS, PDF_EVENT_TOOLS } from '../../src/analytics/tool-ids.ts';
import { IMAGE_PAGES } from '../../src/tools/image/registry.ts';
import { BR_CALC_IDS, CALC_PAGE_IDS } from '../../src/tools/calc/registry.ts';
import { PDF_PAGES, PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { PDF_TOOLS } from '../../src/tools/pdf/tools.tsx';
import { PDF_REASONS } from '../../src/engine/pdf/types.ts';
import { CALC_IDS } from '../../src/calc/index.ts';

function runBootstrap(hostname: string, stored: string | null) {
  const appended: string[] = [];
  // In a browser the global object is `window`; make the vm context play that role.
  const window: Record<string, unknown> = {
    location: { hostname, origin: `https://${hostname}`, pathname: '/compress-image/' },
    localStorage: { getItem: () => stored },
    document: { head: { appendChild: (node: { src: string }) => appended.push(node.src) }, createElement: () => ({ src: '' }) },
    Date,
  };
  window['window'] = window;
  runInNewContext(consentBootstrap(), window);
  const read = () => (window['dataLayer'] as ArrayLike<unknown>[]).map((entry) => Array.from(entry));
  return { dataLayer: read(), read, appended, foTrack: window['foTrack'] as (name: string, params: Record<string, unknown>) => void };
}

describe('Consent Mode v2 defaults', () => {
  it('lists the EU 27, the EEA extra countries, the UK and Switzerland, with ISO codes', () => {
    expect(EU).toHaveLength(27);
    expect(EEA_EXTRA).toEqual(['IS', 'LI', 'NO']);
    expect(DENIED_BY_DEFAULT_REGIONS).toHaveLength(32);
    expect(DENIED_BY_DEFAULT_REGIONS).toContain('GB');
    expect(DENIED_BY_DEFAULT_REGIONS).toContain('CH');
    expect(DENIED_BY_DEFAULT_REGIONS).toContain('GR');
    expect(DENIED_BY_DEFAULT_REGIONS).not.toContain('EL');
    expect(DENIED_BY_DEFAULT_REGIONS).not.toContain('UK');
  });

  it('changes the default by region', () => {
    for (const region of ['DE', 'FR', 'NO', 'IS', 'LI', 'GB', 'CH', 'gr']) expect(defaultConsentFor(region).analytics_storage).toBe('denied');
    for (const region of ['US', 'BR', 'MX', 'CA', 'JP']) expect(defaultConsentFor(region).ad_storage).toBe('granted');
  });

  it('declares both defaults before js and config, and config sends origin + path only', () => {
    const { dataLayer } = runBootstrap('fileorca.com', null);
    const kinds = dataLayer.map((entry) => `${entry[0]}:${entry[0] === 'consent' ? entry[1] : ''}`);
    expect(kinds.slice(0, 4)).toEqual(['consent:default', 'consent:default', 'js:', 'config:']);
    expect(dataLayer[3]).toEqual(['config', 'G-T4BBJN7S11', { page_location: 'https://fileorca.com/compress-image/' }]);
  });

  it('replays a stored choice before config', () => {
    const { dataLayer } = runBootstrap('fileorca.com', 'denied');
    expect(dataLayer[2]).toEqual(['consent', 'update', { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }]);
    expect(dataLayer[4]?.[0]).toBe('config');
  });

  it('injects gtag.js only on fileorca.com', () => {
    expect(runBootstrap('fileorca.com', null).appended).toEqual(['https://www.googletagmanager.com/gtag/js?id=G-T4BBJN7S11']);
    for (const host of ['localhost', '127.0.0.1', 'fase-01a-fileorca.vmatusita.workers.dev', 'www.fileorca.com', 'fileorca.com.evil.test']) {
      expect(runBootstrap(host, null).appended).toEqual([]);
    }
  });

  it('foTrack keeps only the listed parameters', () => {
    const { read, foTrack } = runBootstrap('localhost', null);
    foTrack('donate_click', { place: 'footer', lang: 'pt', file: 'secret.jpg' });
    foTrack('made_up_event', { a: 1 });
    const dataLayer = read();
    expect(dataLayer.at(-1)).toEqual(['event', 'donate_click', { place: 'footer', lang: 'pt' }]);
    expect(dataLayer.some((entry) => entry[1] === 'made_up_event')).toBe(false);
  });
});

describe('typed events', () => {
  it('has the closed list of the plan', () => {
    // The F4 adds calc_complete, export_click and share_click (DECISOES § 113).
    expect(Object.keys(EVENT_PARAMS).sort()).toEqual([
      'calc_complete', 'donate_click', 'download', 'export_click', 'next_step_click', 'share_click', 'tool_complete', 'tool_error', 'tool_start',
    ]);
    expect(EVENT_PARAMS.calc_complete).toEqual(['tool', 'lang']);
    expect(EVENT_PARAMS.export_click).toEqual(['tool', 'lang', 'format']);
    expect(EVENT_PARAMS.share_click).toEqual(['tool', 'lang']);
    expect(EVENT_PARAMS.tool_error).toEqual(['tool', 'lang', 'browser', 'codec', 'reason']);
    expect(EVENT_PARAMS.donate_click).toEqual(['place', 'lang']);
  });

  it('keeps the calculator events to closed lists: tool, target and format never carry a typed number (F4)', () => {
    expect(cleanParams('calc_complete', { tool: 'mortgage-calculator', lang: 'en' })).toEqual({ tool: 'mortgage-calculator', lang: 'en' });
    expect(cleanParams('export_click', { tool: 'refinance-calculator', lang: 'en', format: 'csv' })).toEqual({ tool: 'refinance-calculator', lang: 'en', format: 'csv' });
    expect(cleanParams('export_click', { tool: 'mortgage-calculator', lang: 'en', format: '987654' })).toEqual({ tool: 'mortgage-calculator', lang: 'en' });
    expect(cleanParams('share_click', { tool: 'mortgage-calculator', lang: 'en', price: 987_654.32 })).toEqual({ tool: 'mortgage-calculator', lang: 'en' });
    // A tool or a target outside the registries is dropped, whatever it is.
    expect(cleanParams('calc_complete', { tool: '987654.32', lang: 'en' })).toEqual({ lang: 'en' });
    expect(cleanParams('next_step_click', { tool: 'mortgage-calculator', lang: 'en', target: 'refinance-calculator' })).toEqual({
      tool: 'mortgage-calculator',
      lang: 'en',
      target: 'refinance-calculator',
    });
    expect(cleanParams('next_step_click', { tool: 'compress-image', lang: 'en', target: 'home' })).toEqual({ tool: 'compress-image', lang: 'en', target: 'home' });
    expect(cleanParams('next_step_click', { tool: 'mortgage-calculator', lang: 'en', target: '/mortgage-calculator/#v=1' })).toEqual({ tool: 'mortgage-calculator', lang: 'en' });
  });

  it('lists exactly the pages of both registries as event tools', () => {
    expect([...IMAGE_EVENT_TOOLS]).toEqual(Object.keys(IMAGE_PAGES));
    // The 18 English calculators and, since the F6, the 8 adapted to Brazil (DECISOES § 226).
    expect([...CALC_EVENT_TOOLS].sort()).toEqual([...CALC_PAGE_IDS, ...BR_CALC_IDS].sort());
    expect([...CALC_EVENT_TOOLS].sort()).toEqual([...CALC_IDS].sort());
  });

  it('drops parameters outside the list and non-scalar values', () => {
    expect(cleanParams('tool_start', { tool: 'compress-image', lang: 'en', fileName: 'IMG_1.jpg', size: 123 })).toEqual({ tool: 'compress-image', lang: 'en' });
    expect(cleanParams('download', { tool: 'compress-image', lang: { nested: true } })).toEqual({ tool: 'compress-image' });
  });

  it('carries the new image values (F2) and drops anything outside the closed lists', () => {
    for (const outcome of ['smaller', 'unchanged', 'converted', 'resized', 'cropped', 'rotated', 'pdf', 'failed']) {
      expect(cleanParams('tool_complete', { tool: 'resize-image', lang: 'en', outcome }), outcome).toEqual({ tool: 'resize-image', lang: 'en', outcome });
    }
    expect(cleanParams('tool_complete', { tool: 'compress-image', lang: 'en', outcome: 'IMG_1.jpg' })).toEqual({ tool: 'compress-image', lang: 'en' });
    for (const reason of ['empty', 'unsupported', 'wrong-tool', 'truncated', 'decode', 'encode', 'too-large', 'load']) {
      expect(cleanParams('tool_error', { tool: 'heic-to-jpg', lang: 'en', browser: 'safari-18', codec: 'image/heic', reason }), reason).toMatchObject({ reason, codec: 'image/heic' });
    }
    for (const codec of ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif', 'image/gif', 'unknown', 'empty']) {
      expect(cleanParams('tool_error', { tool: 'compress-image', lang: 'pt', browser: 'chrome-141', codec, reason: 'decode' }), codec).toMatchObject({ codec });
    }
    // A file type string or a file name never gets through as a codec or a reason.
    expect(cleanParams('tool_error', { tool: 'compress-image', lang: 'en', browser: 'chrome-141', codec: 'image/tiff', reason: 'broken.jpg' })).toEqual({ tool: 'compress-image', lang: 'en', browser: 'chrome-141' });
    expect(cleanParams('next_step_click', { tool: 'compress-image', lang: 'en', target: 'resize-image' })).toEqual({ tool: 'compress-image', lang: 'en', target: 'resize-image' });
    expect(cleanParams('next_step_click', { tool: 'image-to-pdf', lang: 'pt', target: 'home' })).toEqual({ tool: 'image-to-pdf', lang: 'pt', target: 'home' });
  });

  it('types every image page as a tool and refuses a file name there', () => {
    const check = (fn: () => void) => fn;
    check(() => {
      const ok: EventMap['tool_complete'] = { tool: 'compress-image-to-100kb', lang: 'en', outcome: 'smaller' };
      const pdf: EventMap['tool_start'] = { tool: 'image-to-pdf', lang: 'en' };
      // @ts-expect-error a file name is not a tool
      const bad: EventMap['tool_start'] = { tool: 'IMG_1.jpg', lang: 'en' };
      // @ts-expect-error the outcome is a closed list
      const worse: EventMap['tool_complete'] = { tool: 'compress-image', lang: 'en', outcome: 'done' };
      return [ok, pdf, bad, worse];
    });
  });

  it('rejects unknown parameters at compile time', () => {
    const check = (fn: () => void) => fn;
    check(() => {
      // @ts-expect-error file names are not an event parameter
      cleanParams('tool_start', { tool: 'compress-image', lang: 'en', fileName: 'x' } satisfies EventMap['tool_start']);
    });
  });

  it('labels browsers for tool_error', () => {
    expect(browserLabel('Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1')).toBe('safari-18');
    expect(browserLabel('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36')).toBe('chrome-141');
    expect(browserLabel('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36 Edg/141.0')).toBe('edge-141');
    expect(browserLabel('Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0')).toBe('firefox-140');
    expect(browserLabel('curl/8')).toBe('other');
  });
});

// F5a (decision 11, DECISOES § 169): the events of the PDF tools are the same ones as the image tools', with the
// `tool` taken from the PDF registry; the outcome and the reason grow in closed lists, pinned here so that a new value
// has to come with a change to this test; and no parameter carries a number, a range, a text, a password, a count of
// pages or a file name. tests/e2e/events.spec.ts fires real runs and reads the dataLayer.
describe('the events of the PDF tools (F5a)', () => {
  /** What each PDF tool says it ended with: the oracle of the table, written here and not read from the tools. */
  const SUCCESS = {
    'merge-pdf': 'merged',
    'split-pdf': 'split',
    'pdf-to-jpg': 'converted',
    'compress-pdf': 'smaller',
    'rotate-pdf': 'rotated',
    'delete-pdf-pages': 'deleted',
    'add-page-numbers-to-pdf': 'numbered',
    'sign-pdf': 'signed',
    'protect-pdf': 'protected',
    'unlock-pdf': 'unlocked',
    'reorder-pdf-pages': 'reordered',
    'watermark-pdf': 'watermarked',
  } as const;
  /** Smuggled in beside the allowed parameters of an event: a count, a range, a text, a password, a file name. */
  const SMUGGLED = { pages: 300, count: 12, range: '1-3, 5', password: 'Orca-Sentinel-7391-Kq', text: 'CONFIDENTIAL', start: 7, fileName: 'contract.pdf', size: 123_456, ppi: 300, position: 'bottom-center' };

  it('lists exactly the pages of the PDF registry as event tools, apart from the other two lists', () => {
    expect([...PDF_EVENT_TOOLS]).toEqual([...PDF_TOOL_IDS]);
    expect([...PDF_EVENT_TOOLS]).toEqual(Object.keys(PDF_PAGES));
    for (const id of PDF_TOOL_IDS) expect(PDF_PAGES[id].id).toBe(id);
    expect([...EVENT_TOOLS]).toEqual([...IMAGE_EVENT_TOOLS, ...CALC_EVENT_TOOLS, ...PDF_EVENT_TOOLS]);
    expect(new Set(EVENT_TOOLS).size, 'no page name is in two lists').toBe(EVENT_TOOLS.length);
    expect(Object.keys(SUCCESS)).toEqual([...PDF_TOOL_IDS]);
  });

  it('gives every PDF tool one outcome of the closed list, and the closed list is these words', () => {
    for (const id of PDF_TOOL_IDS) {
      expect(PDF_TOOLS[id].success, id).toBe(SUCCESS[id]);
      expect(OUTCOMES as readonly string[], id).toContain(SUCCESS[id]);
    }
    // Pinned: a new outcome comes with a change here. 'unchanged' and 'failed' are the two that belong to no tool.
    expect([...OUTCOMES].sort()).toEqual(
      ['smaller', 'unchanged', 'converted', 'resized', 'cropped', 'rotated', 'pdf', 'failed', 'merged', 'split', 'deleted', 'numbered', 'reordered', 'watermarked', 'signed', 'protected', 'unlocked'].sort(),
    );
    for (const outcome of OUTCOMES) expect(cleanParams('tool_complete', { tool: 'merge-pdf', lang: 'en', outcome }), outcome).toEqual({ tool: 'merge-pdf', lang: 'en', outcome });
    for (const outcome of ['merged-3', '300 pages', 'IMG_1.pdf', 'Merged', '']) {
      expect(cleanParams('tool_complete', { tool: 'merge-pdf', lang: 'en', outcome }), outcome).toEqual({ tool: 'merge-pdf', lang: 'en' });
    }
  });

  it('carries every reason of the PDF engine, as a closed list, and no reason of the panel that is not one', () => {
    for (const reason of PDF_REASONS) expect(ERROR_REASONS as readonly string[], reason).toContain(reason);
    // Pinned: the image engine's reasons and the PDF engine's, and nothing else.
    expect([...ERROR_REASONS].sort()).toEqual(
      ['empty', 'unsupported', 'wrong-tool', 'truncated', 'decode', 'encode', 'too-large', 'load', 'not-pdf', 'corrupted', 'needs-password', 'wrong-password', 'restricted', 'not-encrypted'].sort(),
    );
    const error = { tool: 'unlock-pdf', lang: 'en', browser: 'chrome-141', codec: 'application/pdf' } as const;
    for (const reason of PDF_REASONS) expect(cleanParams('tool_error', { ...error, reason }), reason).toEqual({ ...error, reason });
    // 'one-at-a-time' is said on the row and never sent; a password, a name or a typed word is not a reason.
    for (const reason of ['one-at-a-time', 'Orca-Sentinel-7391-Kq', 'contract.pdf', 'password is 12345']) {
      expect(cleanParams('tool_error', { ...error, reason }), reason).toEqual(error);
    }
    for (const codec of CODECS) expect(cleanParams('tool_error', { ...error, reason: 'corrupted', codec }), codec).toMatchObject({ codec });
    // A file type string or a name is not a codec: it is dropped.
    expect(cleanParams('tool_error', { ...error, reason: 'corrupted', codec: 'contract.pdf' })).toEqual({ tool: 'unlock-pdf', lang: 'en', browser: 'chrome-141', reason: 'corrupted' });
  });

  it('names no parameter that could carry a number, a range, a text, a password, a count of pages or a file name', () => {
    const names = new Set<string>();
    for (const params of Object.values(EVENT_PARAMS)) for (const name of params) names.add(name);
    expect([...names].sort()).toEqual(['browser', 'codec', 'format', 'lang', 'outcome', 'place', 'reason', 'target', 'tool']);
  });

  it('drops anything smuggled beside the parameters of a PDF event, whichever the event', () => {
    for (const id of PDF_TOOL_IDS) {
      const chip = PDF_PAGES[id].next[0] as string;
      expect(cleanParams('tool_start', { tool: id, lang: 'en', ...SMUGGLED }), id).toEqual({ tool: id, lang: 'en' });
      expect(cleanParams('tool_complete', { tool: id, lang: 'en', outcome: SUCCESS[id], ...SMUGGLED }), id).toEqual({ tool: id, lang: 'en', outcome: SUCCESS[id] });
      expect(cleanParams('download', { tool: id, lang: 'en', ...SMUGGLED }), id).toEqual({ tool: id, lang: 'en' });
      expect(cleanParams('next_step_click', { tool: id, lang: 'en', target: chip, ...SMUGGLED }), id).toEqual({ tool: id, lang: 'en', target: chip });
      expect(cleanParams('tool_error', { tool: id, lang: 'en', browser: 'safari-18', codec: 'application/pdf', reason: 'wrong-password', ...SMUGGLED }), id).toEqual({
        tool: id,
        lang: 'en',
        browser: 'safari-18',
        codec: 'application/pdf',
        reason: 'wrong-password',
      });
    }
  });

  it('keeps a typed value out of the values of the closed parameters: tool and target are page names', () => {
    for (const value of ['contract.pdf', '/merge-pdf/#1-3', 'merge-pdf?pages=300', 'Orca-Sentinel-7391-Kq', '300']) {
      expect(cleanParams('tool_start', { tool: value, lang: 'en' }), value).toEqual({ lang: 'en' });
      expect(cleanParams('next_step_click', { tool: 'merge-pdf', lang: 'en', target: value }), value).toEqual({ tool: 'merge-pdf', lang: 'en' });
    }
    // The chips of every PDF page lead to pages of the registries (the PDF ones, or the image pages the registry names).
    for (const id of PDF_TOOL_IDS) {
      for (const target of PDF_PAGES[id].next) expect(cleanParams('next_step_click', { tool: id, lang: 'en', target }), `${id} → ${target}`).toEqual({ tool: id, lang: 'en', target });
    }
  });

  it('types the PDF tools as tools and the outcome and the reason as closed lists', () => {
    const check = (fn: () => void) => fn;
    check(() => {
      const ok: EventMap['tool_complete'] = { tool: 'watermark-pdf', lang: 'en', outcome: 'watermarked' };
      const failed: EventMap['tool_error'] = { tool: 'unlock-pdf', lang: 'en', browser: 'chrome-141', codec: 'application/pdf', reason: 'wrong-password' };
      // @ts-expect-error a file name is not a tool
      const bad: EventMap['tool_start'] = { tool: 'contract.pdf', lang: 'en' };
      // @ts-expect-error the outcome is a closed list
      const worse: EventMap['tool_complete'] = { tool: 'merge-pdf', lang: 'en', outcome: 'merged 300 pages' };
      // @ts-expect-error the reason is a closed list: the row's "one at a time" is never sent
      const worst: EventMap['tool_error'] = { tool: 'merge-pdf', lang: 'en', browser: 'chrome-141', codec: 'application/pdf', reason: 'one-at-a-time' };
      return [ok, failed, bad, worse, worst];
    });
  });
});
