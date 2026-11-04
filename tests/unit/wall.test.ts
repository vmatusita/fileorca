// F12 · a parede do bloqueador (decision 5, 10 and 11; § F12-P1, § F12-P5, § F12-P6 and § F12-P9). What only depends on
// the build, read from the rendered components (the default build itself is read by default-build.test.ts):
// - the wall (the dialog, the bait, its script and the sad pose in the sprite), the recovery tag and the onerror of the
//   loader are on a page with ads only with the three AdSense variables and PUBLIC_ADBLOCK_WALL in aviso or bloqueio, and
//   never on a free page;
// - the markup of the wall in each language and mode: the three buttons of the design system, the nine help entries, no
//   ad, no link, nothing sun;
// - the texts of the wall (adjustment 3) in the three languages: no "click", "clique" or "clic", the voice rules, nothing
//   about the coffee; and the Privacy of adjustment 1 in the three languages;
// - the script: the lock of the hostname in the exact text gate:prontidao reads, and the time zones of the region.
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/preact/container-renderer';
import { loadRenderers } from 'astro:container';
import { parse } from 'node-html-parser';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import AdblockWall from '../../src/components/AdblockWall.astro';
import AdsenseHead from '../../src/ads/AdsenseHead.astro';
import CompressImagePage from '../../src/tools/compress-image/CompressImagePage.astro';
import PdfToolPage from '../../src/tools/pdf/PdfToolPage.astro';
import LegalView from '../../src/views/LegalView.astro';
import SupportView from '../../src/views/SupportView.astro';
import AboutView from '../../src/views/AboutView.astro';
import NotFoundView from '../../src/views/NotFoundView.astro';
import { adsConfigFrom } from '../../src/ads/config.ts';
import { WALL_ESCAPE_KEY, WALL_ESCAPE_MS, WALL_FALLBACK_MS, recoveryTagSrc, wallScript } from '../../src/ads/wall.ts';
import { GDPR_TIME_ZONE, gdprZoneJs, inGdprTimeZone } from '../../src/platform/region.ts';
import { checkVoice } from '../../scripts/lib/design-checks.ts';
import { TEST_SLOTS } from '../../scripts/lib/test-build.ts';
import type { WallTexts } from '../../src/i18n/types.ts';
import enWall from '../../src/i18n/en/wall.ts';
import ptWall from '../../src/i18n/pt/wall.ts';
import esWall from '../../src/i18n/es/wall.ts';
import enPrivacy from '../../src/i18n/en/privacy.ts';
import ptPrivacy from '../../src/i18n/pt/privacy.ts';
import esPrivacy from '../../src/i18n/es/privacy.ts';

type Component = Parameters<AstroContainer['renderToString']>[0];
const CLIENT = 'ca-pub-1234567890123456';
const ALL = { PUBLIC_ADSENSE_CLIENT: CLIENT, PUBLIC_ADSENSE_SLOTS: JSON.stringify(TEST_SLOTS), PUBLIC_ADS_ENABLED: 'true' };
/** The states of the build variables, and whether the wall exists in each. */
const STATES: { name: string; env: Record<string, string>; wall: boolean }[] = [
  { name: 'sem as variáveis', env: {}, wall: false },
  { name: 'sem as variáveis, parede em bloqueio', env: { PUBLIC_ADBLOCK_WALL: 'bloqueio' }, wall: false },
  { name: 'só o ID, parede em aviso', env: { PUBLIC_ADSENSE_CLIENT: CLIENT, PUBLIC_ADBLOCK_WALL: 'aviso' }, wall: false },
  { name: 'ID e unidades sem PUBLIC_ADS_ENABLED, parede em bloqueio', env: { ...ALL, PUBLIC_ADS_ENABLED: 'false', PUBLIC_ADBLOCK_WALL: 'bloqueio' }, wall: false },
  { name: 'anúncios ligados, parede sem a variável', env: ALL, wall: false },
  { name: 'anúncios ligados, parede desligada', env: { ...ALL, PUBLIC_ADBLOCK_WALL: 'desligado' }, wall: false },
  { name: 'anúncios ligados, parede em aviso', env: { ...ALL, PUBLIC_ADBLOCK_WALL: 'aviso' }, wall: true },
  { name: 'anúncios ligados, parede em bloqueio', env: { ...ALL, PUBLIC_ADBLOCK_WALL: 'bloqueio' }, wall: true },
];
/** Everything of the wall a page can carry, by what it is. */
const PIECES: [string, RegExp][] = [
  ['o diálogo', /id="fo-wall"/],
  ['a isca', /id="fo-bait"/],
  ['o script', /K="fo-wall-escape"/],
  ['a pose sad no sprite', /id="oli-sad"/],
  ['a tag de recuperação', /fundingchoicesmessages\.google\.com/],
  ['o onerror do carregador', /foAdsFailed/],
];
const piecesOf = (html: string): string[] => PIECES.filter(([, pattern]) => pattern.test(html)).map(([what]) => what);

const WALLS: Record<'en' | 'pt' | 'es', WallTexts> = { en: enWall, pt: ptWall, es: esWall };

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create({ renderers: await loadRenderers([getContainerRenderer()]) });
});
afterEach(() => vi.unstubAllEnvs());

describe('a parede só existe com as variáveis, e só nas páginas com anúncio', () => {
  for (const { name, env, wall } of STATES) {
    it(`${name}: ${wall ? 'tudo da parede nas páginas com anúncio' : 'nada da parede em página nenhuma'}`, async () => {
      for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
      const withAds: [string, string][] = [
        ['compress-image en', await container.renderToString(CompressImagePage as Component, { props: { lang: 'en' } })],
        ['compress-image pt', await container.renderToString(CompressImagePage as Component, { props: { lang: 'pt' } })],
        ['merge-pdf en', await container.renderToString(PdfToolPage as Component, { props: { id: 'merge-pdf' } })],
      ];
      for (const [page, html] of withAds) expect(piecesOf(html), page).toEqual(wall ? PIECES.map(([what]) => what) : []);
      // The free pages never have it (and the 404).
      for (const lang of ['en', 'pt', 'es'] as const) {
        const free: [string, string][] = [
          ['privacy', await container.renderToString(LegalView as Component, { props: { lang, page: 'privacy' } })],
          ['support', await container.renderToString(SupportView as Component, { props: { lang } })],
          ['about', await container.renderToString(AboutView as Component, { props: { lang } })],
          ['404', await container.renderToString(NotFoundView as Component, { props: { lang } })],
        ];
        for (const [page, html] of free) expect(piecesOf(html), `${page} ${lang}`).toEqual([]);
      }
    }, 60_000);
  }

  it('puts the wall in the language and in the mode of the build', async () => {
    vi.stubEnv('PUBLIC_ADSENSE_CLIENT', CLIENT);
    vi.stubEnv('PUBLIC_ADSENSE_SLOTS', JSON.stringify(TEST_SLOTS));
    vi.stubEnv('PUBLIC_ADS_ENABLED', 'true');
    vi.stubEnv('PUBLIC_ADBLOCK_WALL', 'aviso');
    const pt = parse(await container.renderToString(CompressImagePage as Component, { props: { lang: 'pt' } }));
    expect(pt.querySelector('#fo-wall-title')?.text).toBe('A Oli vive dos anúncios');
    expect(pt.querySelectorAll('script').map((script) => script.text).find((text) => text.includes(WALL_ESCAPE_KEY))).toContain('M="aviso",L="pt"');
    // The wall and its script come at the end of the <body>, after the search dialog, and the bait right after the dialog.
    const ids = pt.querySelectorAll('body > *').map((element) => element.id || element.tagName.toLowerCase());
    expect(ids.indexOf('fo-wall')).toBeGreaterThan(ids.indexOf('fo-search-dialog'));
    expect(ids[ids.indexOf('fo-wall') + 1]).toBe('fo-bait');
  });
});

describe('a tag de recuperação e o onerror do carregador (§ 416)', () => {
  const head = (env: Record<string, string>, withAds = true) => container.renderToString(AdsenseHead, { props: { withAds, config: adsConfigFrom(env) } });

  it('comes after the loader, made by a script, only on fileorca.com, with the id without "ca-"', async () => {
    const html = await head({ ...ALL, PUBLIC_ADBLOCK_WALL: 'bloqueio' });
    const scripts = parse(html).querySelectorAll('script').map((script) => script.text);
    expect(scripts).toHaveLength(2);
    const [loader, recovery] = scripts as [string, string];
    expect(loader).toContain('adsbygoogle.js?client=ca-pub-1234567890123456');
    expect(loader).toContain('s.onerror=function(){window.foAdsFailed=true;};');
    expect(loader.startsWith('if(location.hostname==="fileorca.com"){')).toBe(true);
    expect(recovery.startsWith('if(location.hostname==="fileorca.com"){')).toBe(true);
    expect(recovery).toContain(JSON.stringify(recoveryTagSrc(CLIENT)));
    expect(recoveryTagSrc(CLIENT)).toBe('https://fundingchoicesmessages.google.com/i/pub-1234567890123456?ers=1');
    expect(recovery).toContain("i.name='googlefcPresent'");
    expect(recovery).toContain('f.async=true');
    // No <script src> of Google: everything is created by the locked script.
    expect(html).not.toMatch(/<script[^>]+src=/);
  });

  it('is not there with the wall off, without the three variables, or on a page without ads', async () => {
    for (const env of [ALL, { ...ALL, PUBLIC_ADBLOCK_WALL: 'desligado' }, { PUBLIC_ADSENSE_CLIENT: CLIENT, PUBLIC_ADBLOCK_WALL: 'bloqueio' }, { PUBLIC_ADBLOCK_WALL: 'aviso' }]) {
      const html = await head(env);
      expect(html, JSON.stringify(env)).not.toContain('fundingchoices');
      expect(html, JSON.stringify(env)).not.toContain('foAdsFailed');
    }
    const free = await head({ ...ALL, PUBLIC_ADBLOCK_WALL: 'bloqueio' }, false);
    expect(free).not.toContain('fundingchoices');
    expect(free).not.toContain('adsbygoogle.js');
  });
});

describe('a marcação da parede', () => {
  for (const lang of ['en', 'pt', 'es'] as const) {
    for (const mode of ['aviso', 'bloqueio'] as const) {
      it(`${lang}, ${mode}`, async () => {
        const html = await container.renderToString(AdblockWall as Component, { props: { lang, mode } });
        const root = parse(html);
        const t = WALLS[lang];
        const dialog = root.querySelector('dialog#fo-wall');
        expect(dialog?.getAttribute('class')).toBe('fo-wall');
        expect(dialog?.getAttribute('aria-labelledby')).toBe('fo-wall-title');
        expect(dialog?.getAttribute('aria-describedby')).toBe('fo-wall-desc');
        // Closed in the HTML: only the script opens it, with showModal().
        expect(dialog?.hasAttribute('open')).toBe(false);
        expect(root.querySelector('h2#fo-wall-title')?.text).toBe(t.title);
        expect(root.querySelector('#fo-wall-desc p')?.text).toBe(t.body);
        expect(root.querySelector('.fo-wall__later')?.text).toBe(t.later);
        // The sad Oli after the title, decorative.
        const oli = root.querySelector('.fo-wall__head [data-oli]');
        expect(oli?.getAttribute('data-oli')).toBe('sad');
        expect(oli?.getAttribute('aria-hidden')).toBe('true');
        expect(oli?.querySelector('use')?.getAttribute('href')).toBe('#oli-sad');
        // The buttons: close (an icon with its name), help (neutral, with aria-expanded), reload (brand, large, autofocus),
        // escape (ghost). No sun, no download look, no link.
        const close = root.querySelector('[data-wall="close"]');
        expect(close?.getAttribute('aria-label')).toBe(t.close);
        expect(close?.getAttribute('class')).toBe('fo-btn fo-btn--ghost fo-btn--icon fo-wall__close');
        const help = root.querySelector('[data-wall="help"]');
        expect(help?.getAttribute('class')).toBe('fo-btn fo-wall__toggle');
        expect(help?.getAttribute('aria-expanded')).toBe('false');
        expect(help?.getAttribute('aria-controls')).toBe('fo-wall-help');
        expect(help?.text.trim()).toBe(t.help);
        const reload = root.querySelector('[data-wall="reload"]');
        expect(reload?.getAttribute('class')).toBe('fo-btn fo-btn--brand fo-btn--lg');
        expect(reload?.hasAttribute('autofocus')).toBe(true);
        expect(reload?.text).toBe(t.reload);
        const escape = root.querySelector('[data-wall="escape"]');
        expect(escape?.getAttribute('class')).toBe('fo-btn fo-btn--ghost fo-wall__once');
        expect(escape?.text).toBe(t.escape);
        // The reload and the escape in the footer of the card, out of the body that scrolls.
        expect(root.querySelectorAll('.fo-wall__foot > button').map((button) => button.getAttribute('data-wall'))).toEqual(['reload', 'escape']);
        // The help: a section named by its h3, hidden, with the nine entries of one group (one open at a time).
        const panel = root.querySelector('section#fo-wall-help');
        expect(panel?.hasAttribute('hidden')).toBe(true);
        expect(panel?.getAttribute('aria-labelledby')).toBe('fo-wall-help-title');
        expect(root.querySelector('h3#fo-wall-help-title')?.text).toBe(t.helpTitle);
        const entries = root.querySelectorAll('#fo-wall-help details');
        expect(entries.map((entry) => entry.getAttribute('name'))).toEqual(Array(9).fill('fo-wall-help'));
        expect(entries.map((entry) => entry.querySelector('summary span')?.text)).toEqual(Object.values(t.entries).map((entry) => entry.name));
        for (const entry of entries) {
          expect(entry.querySelectorAll('ol.fo-steps > li')).toHaveLength(3);
          expect(entry.querySelector('.fo-wall__note')).not.toBeNull();
        }
        // Nothing of an ad, nothing sun, no link out, no alert icon.
        expect(html).not.toMatch(/<ins\b|fo-ad\b|fo-ad__|adsbygoogle"|fo-btn--download|--sun|<a\b|href="http/);
        // The icons are the close and the chevrons only (the alert and info icons draw a circle).
        expect(root.querySelectorAll('svg.fo-icon circle')).toHaveLength(0);
        expect(root.querySelectorAll('svg.fo-icon')).toHaveLength(1 + 1 + 9);
        // The bait: never an ins.adsbygoogle, empty, off screen, hidden from assistive technology.
        const bait = root.querySelector('#fo-bait');
        expect(bait?.tagName.toLowerCase()).toBe('div');
        expect(bait?.getAttribute('class')).toBe('adsbox ad-banner textads');
        expect(bait?.getAttribute('aria-hidden')).toBe('true');
        expect(bait?.innerHTML).toBe('');
        expect(bait?.getAttribute('style')).toContain('left:-9999px');
        // The script of the page's language and mode.
        const script = root.querySelectorAll('script').at(-1)?.text ?? '';
        expect(script).toContain(`M=${JSON.stringify(mode)},L=${JSON.stringify(lang)}`);
      });
    }
  }
});

describe('os textos da parede (decisão 10, com o ajuste 3)', () => {
  const strings = (value: unknown): string[] =>
    typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];

  it('has the texts of the prompt in the three languages', () => {
    expect([enWall.title, ptWall.title, esWall.title]).toEqual(['Oli lives on ads', 'A Oli vive dos anúncios', 'Oli vive de los anuncios']);
    expect(enWall.body).toContain("With an ad blocker on, the ads don't show, and nothing comes in.");
    expect(ptWall.body).toContain('Com um bloqueador ligado, os anúncios não aparecem e nada entra.');
    expect(esWall.body).toContain('Con un bloqueador activado, los anuncios no se ven y no entra nada.');
    expect([enWall.reload, ptWall.reload, esWall.reload]).toEqual(["Reload, it's off now", 'Recarregar, já desativei', 'Recargar, ya lo desactivé']);
    expect([enWall.help, ptWall.help, esWall.help]).toEqual(['See how to turn it off', 'Ver como desativar', 'Ver cómo desactivarlo']);
    expect([enWall.escape, ptWall.escape, esWall.escape]).toEqual(['Continue just this once', 'Usar só desta vez', 'Seguir solo esta vez']);
    // The line after the escape names it with its new label.
    for (const t of [enWall, ptWall, esWall]) expect(t.later).toContain(`“${t.escape}”`);
  });

  it('has the same keys in the three languages, and the nine entries with three steps each', () => {
    const keys = (value: unknown, path = ''): string[] =>
      value && typeof value === 'object' ? Object.entries(value).flatMap(([key, item]) => [`${path}${key}`, ...keys(item, `${path}${key}.`)]) : [];
    expect(keys(ptWall)).toEqual(keys(enWall));
    expect(keys(esWall)).toEqual(keys(enWall));
    for (const t of [enWall, ptWall, esWall]) {
      expect(Object.keys(t.entries)).toEqual(['ubo', 'adblock', 'abp', 'adguard', 'brave', 'firefox', 'safari-mac', 'safari-ios', 'other']);
      for (const entry of Object.values(t.entries)) expect(entry.steps).toHaveLength(3);
    }
  });

  it('has no "click", "clique" or "clic" in any text of the wall, in any case (the steps included)', () => {
    const CLICK = /click|clique|clic/i;
    for (const [lang, t] of Object.entries(WALLS)) expect(strings(t).filter((text) => CLICK.test(text)), lang).toEqual([]);
    // The control: the list catches each word, in any case.
    for (const word of ['Click here', 'CLIQUE no botão', 'haz Clic', 'clicking', 'clicar']) expect(CLICK.test(word), word).toBe(true);
  });

  it('is sad without blame: no warning in the title, nothing about the coffee, no link, and the voice rules of the README', () => {
    for (const [lang, t] of Object.entries(WALLS)) {
      expect(t.title, lang).not.toMatch(/warning|attention|aviso|atenção|atención|!/i);
      const all = strings(t).join(' ');
      expect(all, lang).not.toMatch(/coffee|café|ko-fi|pix/i);
      expect(all, lang).not.toMatch(/https?:|www\./);
      expect(checkVoice(t, `src/i18n/${lang}/wall.ts`, lang as 'en' | 'pt' | 'es'), lang).toEqual([]);
    }
  });
});

describe('a Privacidade do ajuste 1, nos três idiomas', () => {
  const PRIVACY = { en: enPrivacy, pt: ptPrivacy, es: esPrivacy } as const;
  const WANT = {
    en: [
      "To show Oli's notice, the site checks whether an ad blocker is on.",
      "The check uses Google's ad blocking recovery tag, which tells Google whether it found a blocker, as the ads themselves do.",
      'Like the use of the tools, the site counts in Google Analytics when the notice shows and which button was used.',
      'In your browser, it keeps only the time of “Continue just this once”.',
    ],
    pt: [
      'Para mostrar o aviso da Oli, o site verifica se há um bloqueador de anúncios ligado.',
      'A verificação usa a ferramenta de recuperação de anúncios do Google, que conta ao Google se achou um bloqueador, como os próprios anúncios fazem.',
      'Como faz com o uso das ferramentas, o site conta no Google Analytics quando o aviso aparece e qual botão foi usado.',
      'No seu navegador, ele guarda só a hora do “Usar só desta vez”.',
    ],
    es: [
      'Para mostrar el aviso de Oli, el sitio comprueba si hay un bloqueador de anuncios activado.',
      'La comprobación usa la herramienta de recuperación de anuncios de Google, que le dice a Google si encontró un bloqueador, como hacen los propios anuncios.',
      'Como con el uso de las herramientas, el sitio cuenta en Google Analytics cuándo aparece el aviso y qué botón se usó.',
      'En tu navegador, solo guarda la hora de “Seguir solo esta vez”.',
    ],
  };

  for (const lang of ['en', 'pt', 'es'] as const) {
    it(`says what the check tells Google, what Analytics counts and the one key kept (${lang})`, () => {
      const privacy = PRIVACY[lang];
      const first = WANT[lang][0] ?? '';
      const ads = privacy.sections.find((section) => section.paragraphs.some((paragraph) => paragraph.includes(first)));
      expect(ads, 'a seção dos anúncios com o texto da parede').toBeDefined();
      const paragraph = ads?.paragraphs.find((text) => text.startsWith(first)) ?? '';
      expect(paragraph).toBe(WANT[lang].join(' '));
      expect(paragraph).toContain(`“${WALLS[lang].escape}”`);
      // The event in the list of Analytics, and the time of the escape in the list of what is kept, each once.
      const lists = privacy.sections.map((section) => (section.list ?? []).filter((item) => /Oli/.test(item)));
      expect(lists.filter((items) => items.length).map((items) => items.length)).toEqual([1, 1]);
      expect(lists.flat().filter((item) => item.includes(`“${WALLS[lang].escape}”`))).toHaveLength(1);
      // The page names no marker of the wall: the default build of a free page carries nothing that says fo-wall.
      expect(JSON.stringify(privacy)).not.toMatch(/fo-wall|fo-bait|googlefc/);
      // The wrong text of section A ("nothing leaves the device") is not there.
      expect(JSON.stringify(privacy)).not.toMatch(/nothing leaves the device because of it|nada sai do aparelho por isso|nada sale del dispositivo por eso/i);
    });
  }
});

describe('o script da parede', () => {
  it('carries the lock of the hostname in the text gate:prontidao reads, and the only key of the wall', () => {
    for (const mode of ['aviso', 'bloqueio'] as const) {
      const script = wallScript({ lang: 'en', mode });
      expect(script).toContain('location.hostname==="fileorca.com"');
      expect(script).toContain(`K=${JSON.stringify(WALL_ESCAPE_KEY)}`);
      expect(script).toContain(`H=${WALL_ESCAPE_MS}`);
      expect(script).toContain(`},${WALL_FALLBACK_MS});`);
      // One key only: the script writes nothing else to the storage, and never to the address.
      expect(script.match(/localStorage\.setItem\(/g)).toHaveLength(1);
      expect(script).not.toMatch(/sessionStorage|document\.cookie|history\.|location\.(href|search|hash)\s*=/);
      // The time zone stays on the device: it goes into no event.
      expect(script).toContain("w.foTrack('adblock_wall',{action:a,mode:mode,lang:L})");
    }
    expect([WALL_ESCAPE_MS, WALL_FALLBACK_MS]).toEqual([1_800_000, 4_000]);
  });

  it('reads the region from the time zone list of section A, with Ceuta, and counts an unreadable one as inside', () => {
    for (const zone of ['Europe/Berlin', 'Europe/London', 'Europe/Zurich', 'Europe/Kyiv', 'Atlantic/Azores', 'Atlantic/Madeira', 'Atlantic/Canary', 'Atlantic/Reykjavik', 'Atlantic/Faroe', 'Africa/Ceuta', '']) {
      expect(inGdprTimeZone(zone), zone).toBe(true);
    }
    for (const zone of ['America/Sao_Paulo', 'UTC', 'Etc/UTC', 'Atlantic/Bermuda', 'Atlantic/Stanley', 'Africa/Casablanca', 'Asia/Istanbul', 'Europe', 'Europe/']) {
      expect(inGdprTimeZone(zone), zone).toBe(false);
    }
    expect(gdprZoneJs()).toContain(GDPR_TIME_ZONE.source);
  });
});
