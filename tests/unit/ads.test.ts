import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import AdSlot from '../../src/ads/AdSlot.astro';
import AdsenseHead from '../../src/ads/AdsenseHead.astro';
import { adsConfigFrom, adsTxt, unitFor, type AdsConfig } from '../../src/ads/config.ts';
import { TEXTS } from '../../src/i18n/texts.ts';

const CLIENT = 'ca-pub-1234567890123456';
const SLOTS = JSON.stringify({
  arquivos: { conteudo: '1111111111', lateral: '2222222222' },
  dinheiro: { conteudo: '3333333333', lateral: '4444444444' },
});
const STATES: Record<string, AdsConfig> = {
  none: adsConfigFrom({}),
  client: adsConfigFrom({ PUBLIC_ADSENSE_CLIENT: CLIENT }),
  all: adsConfigFrom({ PUBLIC_ADSENSE_CLIENT: CLIENT, PUBLIC_ADSENSE_SLOTS: SLOTS, PUBLIC_ADS_ENABLED: 'true' }),
};

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

describe('ads config from the build variables', () => {
  it('reads the three states', () => {
    expect(STATES['none']).toMatchObject({ client: null, scriptEnabled: false });
    expect(STATES['client']).toMatchObject({ client: CLIENT, scriptEnabled: false });
    expect(STATES['all']).toMatchObject({ client: CLIENT, enabled: true, scriptEnabled: true });
  });

  it('needs all three variables for the script, and PUBLIC_ADS_ENABLED exactly true', () => {
    expect(adsConfigFrom({ PUBLIC_ADSENSE_CLIENT: CLIENT, PUBLIC_ADSENSE_SLOTS: SLOTS }).scriptEnabled).toBe(false);
    expect(adsConfigFrom({ PUBLIC_ADSENSE_CLIENT: CLIENT, PUBLIC_ADSENSE_SLOTS: SLOTS, PUBLIC_ADS_ENABLED: 'false' }).scriptEnabled).toBe(false);
    expect(adsConfigFrom({ PUBLIC_ADSENSE_SLOTS: SLOTS, PUBLIC_ADS_ENABLED: 'true' }).scriptEnabled).toBe(false);
  });

  it('fails the build on a malformed variable', () => {
    expect(() => adsConfigFrom({ PUBLIC_ADSENSE_CLIENT: 'pub-1234567890123456' })).toThrow(/ca-pub/);
    expect(() => adsConfigFrom({ PUBLIC_ADSENSE_SLOTS: '{"arquivos":{"topo":"1"}}' })).toThrow(/unknown unit/);
    expect(() => adsConfigFrom({ PUBLIC_ADSENSE_SLOTS: '{"games":{}}' })).toThrow(/unknown area/);
    expect(() => adsConfigFrom({ PUBLIC_ADSENSE_SLOTS: '[1]' })).toThrow(/JSON object/);
  });

  it('writes ads.txt with pub- and without ca-', () => {
    expect(adsTxt(CLIENT)).toBe('google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
  });

  it('picks the unit of the area', () => {
    expect(unitFor(STATES['all'] as AdsConfig, 'arquivos', 'conteudo')).toBe('1111111111');
    expect(unitFor(STATES['all'] as AdsConfig, 'utilidades', 'conteudo')).toBeNull();
    expect(unitFor(STATES['client'] as AdsConfig, 'arquivos', 'conteudo')).toBeNull();
  });
});

describe('AdSlot and the AdSense head in the three states', () => {
  for (const [state, config] of Object.entries(STATES)) {
    it(`renders the reserved box with the label in each language (${state})`, async () => {
      for (const [lang, label] of [['en', 'Advertisements'], ['pt', 'Publicidade'], ['es', 'Anuncios']] as const) {
        expect(TEXTS[lang].common.adLabel).toBe(label);
        const html = await container.renderToString(AdSlot, { props: { area: 'arquivos', variant: 'content', label, config } });
        expect(html).toContain('class="fo-ad fo-ad--content"');
        expect(html).toContain(`<span class="fo-ad__label">${label}</span>`);
        expect(html).not.toContain('aria-label');
        const hasUnit = html.includes('class="adsbygoogle"');
        expect(hasUnit).toBe(state === 'all');
        if (state === 'all') {
          expect(html).toContain(`data-ad-client="${CLIENT}"`);
          expect(html).toContain('data-ad-slot="1111111111"');
          expect(html).toContain('(window.adsbygoogle = window.adsbygoogle || []).push({});');
        }
      }
    });

    it(`puts the meta tag and the loader only where they belong (${state})`, async () => {
      const withAds = await container.renderToString(AdsenseHead, { props: { withAds: true, config } });
      const withoutAds = await container.renderToString(AdsenseHead, { props: { withAds: false, config } });
      const meta = `<meta name="google-adsense-account" content="${CLIENT}">`;
      expect(withAds.includes(meta)).toBe(state !== 'none');
      expect(withoutAds.includes(meta)).toBe(state !== 'none');
      expect(withAds.includes('adsbygoogle.js?client=ca-pub-1234567890123456')).toBe(state === 'all');
      expect(withoutAds).not.toContain('adsbygoogle.js');
    });
  }

  it('reserves the rail unit size', async () => {
    const html = await container.renderToString(AdSlot, { props: { area: 'arquivos', variant: 'rail', label: 'Anuncios', config: STATES['all'] } });
    expect(html).toContain('class="fo-ad fo-ad--rail"');
    expect(html).toContain('data-ad-slot="2222222222"');
    expect(html).toContain('width:300px;height:600px');
  });
});
