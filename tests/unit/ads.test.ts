import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import AdSlot from '../../src/ads/AdSlot.astro';
import AdsenseHead from '../../src/ads/AdsenseHead.astro';
import { AD_UNITS, CONTENT_UNITS, adsConfigFrom, adsTxt, contentUnit, unitFor, wallModeOf, type AdsConfig } from '../../src/ads/config.ts';
import { TEST_SLOTS, TEST_UNIT_COUNT } from '../../scripts/lib/test-build.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { pushScript } from '../../src/ads/map.ts';

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

  // F12 (decision 2; DECISOES § 412): the area "geral", one unit per position (37 in the model of the map) and the
  // ad-block wall variable, each wrong value failing the build.
  it('takes the 37 units of the map, the area "geral" and the position of each content ad', () => {
    const config = adsConfigFrom({ PUBLIC_ADSENSE_CLIENT: CLIENT, PUBLIC_ADSENSE_SLOTS: JSON.stringify(TEST_SLOTS), PUBLIC_ADS_ENABLED: 'true' });
    expect(TEST_UNIT_COUNT).toBe(37);
    expect(Object.values(config.slots).reduce((sum, units) => sum + Object.keys(units).length, 0)).toBe(37);
    expect(Object.keys(config.slots)).toEqual(['geral', 'arquivos', 'dinheiro', 'casa-saude', 'utilidades']);
    for (const area of ['geral', 'arquivos', 'dinheiro', 'casa-saude'] as const) {
      expect(Object.keys(config.slots[area] ?? {})).toEqual(['conteudo', 'conteudo-2', 'conteudo-3', 'conteudo-4', 'conteudo-5', 'lateral', 'lateral-2', 'multiplex']);
    }
    expect(Object.keys(config.slots.utilidades ?? {})).toEqual(['conteudo', 'conteudo-2', 'lateral', 'lateral-2', 'multiplex']);
    expect(unitFor(config, 'geral', 'multiplex')).toBe(TEST_SLOTS['geral']?.['multiplex']);
    expect(unitFor(config, 'utilidades', 'conteudo-3')).toBeNull();
    expect(CONTENT_UNITS).toEqual(['conteudo', ...[2, 3, 4, 5, 6, 7, 8, 9].map((n) => `conteudo-${n}`)]);
    expect([1, 2, 5, 9, 10].map(contentUnit)).toEqual(['conteudo', 'conteudo-2', 'conteudo-5', 'conteudo-9', null]);
    expect(AD_UNITS).toHaveLength(12);
    const nine = adsConfigFrom({ PUBLIC_ADSENSE_SLOTS: JSON.stringify({ geral: { 'conteudo-9': '123456', 'lateral-2': '1234567' } }) });
    expect(nine.slots.geral).toEqual({ 'conteudo-9': '123456', 'lateral-2': '1234567' });
  });

  it('fails the build on a wrong area, unit or id of the new model', () => {
    expect(() => adsConfigFrom({ PUBLIC_ADSENSE_SLOTS: '{"home":{"conteudo":"1234567"}}' })).toThrow(/unknown area "home"/);
    expect(() => adsConfigFrom({ PUBLIC_ADSENSE_SLOTS: '{"geral":{"conteudo-10":"1234567"}}' })).toThrow(/unknown unit "conteudo-10"/);
    expect(() => adsConfigFrom({ PUBLIC_ADSENSE_SLOTS: '{"geral":{"conteudo-1":"1234567"}}' })).toThrow(/unknown unit "conteudo-1"/);
    expect(() => adsConfigFrom({ PUBLIC_ADSENSE_SLOTS: '{"geral":{"lateral-3":"1234567"}}' })).toThrow(/unknown unit "lateral-3"/);
    expect(() => adsConfigFrom({ PUBLIC_ADSENSE_SLOTS: '{"geral":{"multiplex":"12345"}}' })).toThrow(/geral\.multiplex must be a numeric id/);
    expect(() => adsConfigFrom({ PUBLIC_ADSENSE_SLOTS: '{"geral":{"multiplex":1234567}}' })).toThrow(/numeric id/);
    expect(() => adsConfigFrom({ PUBLIC_ADSENSE_SLOTS: '{"geral":{"multiplex":"ca-1234567"}}' })).toThrow(/numeric id/);
    expect(() => adsConfigFrom({ PUBLIC_ADSENSE_SLOTS: '{"geral":["1234567"]}' })).toThrow(/geral must be an object/);
  });

  it('reads PUBLIC_ADBLOCK_WALL: off by default, aviso or bloqueio, and only with the ads on', () => {
    expect(adsConfigFrom({}).wall).toBe('desligado');
    expect(adsConfigFrom({ PUBLIC_ADBLOCK_WALL: '' }).wall).toBe('desligado');
    expect(adsConfigFrom({ PUBLIC_ADBLOCK_WALL: 'desligado' }).wall).toBe('desligado');
    expect(adsConfigFrom({ PUBLIC_ADBLOCK_WALL: 'aviso' }).wall).toBe('aviso');
    expect(adsConfigFrom({ PUBLIC_ADBLOCK_WALL: ' Bloqueio ' }).wall).toBe('bloqueio');
    for (const wrong of ['on', 'true', 'block', 'avisos', '1']) {
      expect(() => adsConfigFrom({ PUBLIC_ADBLOCK_WALL: wrong }), wrong).toThrow(/PUBLIC_ADBLOCK_WALL must be desligado, aviso or bloqueio/);
    }
    // The wall exists only with the three variables of the ads (scriptEnabled).
    expect(wallModeOf(adsConfigFrom({ PUBLIC_ADBLOCK_WALL: 'bloqueio' }))).toBe('desligado');
    expect(wallModeOf(adsConfigFrom({ PUBLIC_ADSENSE_CLIENT: CLIENT, PUBLIC_ADBLOCK_WALL: 'bloqueio' }))).toBe('desligado');
    expect(wallModeOf(adsConfigFrom({ PUBLIC_ADSENSE_CLIENT: CLIENT, PUBLIC_ADSENSE_SLOTS: SLOTS, PUBLIC_ADS_ENABLED: 'true', PUBLIC_ADBLOCK_WALL: 'aviso' }))).toBe('aviso');
    expect(wallModeOf(adsConfigFrom({ PUBLIC_ADSENSE_CLIENT: CLIENT, PUBLIC_ADSENSE_SLOTS: SLOTS, PUBLIC_ADS_ENABLED: 'true', PUBLIC_ADBLOCK_WALL: 'bloqueio' }))).toBe('bloqueio');
    expect(wallModeOf(adsConfigFrom({ PUBLIC_ADSENSE_CLIENT: CLIENT, PUBLIC_ADSENSE_SLOTS: SLOTS, PUBLIC_ADS_ENABLED: 'true' }))).toBe('desligado');
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
    // F12, Mudança 10 (DECISOES § 413 and § 418): with no unit id for the position, nothing at all (no box, no label, no
    // reserved space, no push); with the id, the reserved box with the label.
    // F12, the ad map (plan B, DECISOES § 415, § 420 and § 423): the box carries the area, the unit, its id and its
    // format, and no <ins> and no push of its own: the one push script of the page makes the unit on fileorca.com.
    it(`renders the reserved box with the label in each language only with the unit id (${state})`, async () => {
      for (const [lang, label] of [['en', 'Advertisements'], ['pt', 'Publicidade'], ['es', 'Anuncios']] as const) {
        expect(TEXTS[lang].common.adLabel).toBe(label);
        const html = await container.renderToString(AdSlot, { props: { area: 'arquivos', unit: 'conteudo', label, config } });
        if (state !== 'all') {
          expect(html.trim()).toBe('');
          continue;
        }
        expect(html).toContain('class="fo-ad fo-ad--content"');
        expect(html).toContain(`<span class="fo-ad__label">${label}</span>`);
        expect(html).not.toContain('aria-label');
        expect(html).not.toContain('tabindex');
        expect(html).not.toContain('role=');
        expect(html).toContain('data-ad-area="arquivos"');
        expect(html).toContain('data-ad-unit="conteudo"');
        expect(html).toContain('data-ad-id="1111111111"');
        expect(html).toContain('data-ad-format="auto"');
        // The first content ad shows at every width: no media query.
        expect(html).not.toContain('data-ad-media');
        expect(html).not.toContain('class="adsbygoogle"');
        expect(html).not.toContain('<script');
      }
    });

    it(`puts the meta tag and the loader only where they belong (${state})`, async () => {
      const withAds = await container.renderToString(AdsenseHead, { props: { withAds: true, config } });
      const withoutAds = await container.renderToString(AdsenseHead, { props: { withAds: false, config } });
      const meta = `<meta name="google-adsense-account" content="${CLIENT}">`;
      expect(withAds.includes(meta)).toBe(state !== 'none');
      expect(withoutAds.includes(meta)).toBe(state !== 'none');
      expect(withAds.includes('adsbygoogle.js?client=ca-pub-1234567890123456')).toBe(state === 'all');
      if (state === 'all') expect(withAds).toContain('if(location.hostname==="fileorca.com")');
      expect(withoutAds).not.toContain('adsbygoogle.js');
    });
  }

  it('emits /ads.txt only when PUBLIC_ADSENSE_CLIENT exists, with pub- and without ca-', async () => {
    const { getStaticPaths, GET } = await import('../../src/pages/[adsfile].txt.ts');
    const paths = () => (getStaticPaths as unknown as () => { params: { adsfile: string } }[])();
    vi.stubEnv('PUBLIC_ADSENSE_CLIENT', '');
    expect(paths()).toEqual([]);
    vi.stubEnv('PUBLIC_ADSENSE_CLIENT', CLIENT);
    expect(paths()).toEqual([{ params: { adsfile: 'ads' } }]);
    const response = await (GET as unknown as () => Response)();
    expect(await response.text()).toBe('google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
    vi.unstubAllEnvs();
  });

  // F12 (DECISOES § 420 and § 423): the rail box says it is for 1280 px and more; its 300 × 600 unit is made by the push
  // script, only where that width matches on load.
  it('reserves the rail unit size', async () => {
    const html = await container.renderToString(AdSlot, { props: { area: 'arquivos', unit: 'lateral', label: 'Anuncios', config: STATES['all'] } });
    expect(html).toContain('class="fo-ad fo-ad--rail"');
    expect(html).toContain('data-ad-id="2222222222"');
    expect(html).toContain('data-ad-media="(min-width: 1280px)"');
    expect(html).not.toContain('data-ad-format');
    expect(pushScript(CLIENT)).toContain('width:300px;height:600px');
    expect(pushScript(CLIENT)).toContain('matchMedia(m)');
  });
});
