import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { DENIED_BY_DEFAULT_REGIONS, EEA_EXTRA, EU, consentBootstrap, defaultConsentFor } from '../../src/analytics/consent.ts';
import { EVENT_PARAMS, browserLabel, cleanParams } from '../../src/analytics/events.ts';

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
    expect(Object.keys(EVENT_PARAMS).sort()).toEqual(['donate_click', 'download', 'next_step_click', 'tool_complete', 'tool_error', 'tool_start']);
    expect(EVENT_PARAMS.tool_error).toEqual(['tool', 'lang', 'browser', 'codec', 'reason']);
    expect(EVENT_PARAMS.donate_click).toEqual(['place', 'lang']);
  });

  it('drops parameters outside the list and non-scalar values', () => {
    expect(cleanParams('tool_start', { tool: 'compress-image', lang: 'en', fileName: 'IMG_1.jpg', size: 123 })).toEqual({ tool: 'compress-image', lang: 'en' });
    expect(cleanParams('download', { tool: 'compress-image', lang: { nested: true } })).toEqual({ tool: 'compress-image' });
  });

  it('rejects unknown parameters at compile time', () => {
    const check = (fn: () => void) => fn;
    check(() => {
      // @ts-expect-error file names are not an event parameter
      cleanParams('tool_start', { tool: 'compress-image', lang: 'en', fileName: 'x' } satisfies import('../../src/analytics/events.ts').EventMap['tool_start']);
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
