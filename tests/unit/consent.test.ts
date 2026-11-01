import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { DENIED_BY_DEFAULT_REGIONS, EEA_EXTRA, EU, consentBootstrap, defaultConsentFor } from '../../src/analytics/consent.ts';
import { EVENT_PARAMS, browserLabel, cleanParams, type EventMap } from '../../src/analytics/events.ts';
import { CALC_EVENT_TOOLS, IMAGE_EVENT_TOOLS } from '../../src/analytics/tool-ids.ts';
import { IMAGE_PAGES } from '../../src/tools/image/registry.ts';
import { CALC_PAGE_IDS } from '../../src/tools/calc/registry.ts';
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
    expect([...CALC_EVENT_TOOLS].sort()).toEqual([...CALC_PAGE_IDS].sort());
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
