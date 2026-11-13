// Every sentence of the How it works page has its proof (F19a, decision 7; DECISOES § 759 and § 760), in the style of
// tests/unit/launch-kit.test.ts (DECISOES § 205): the page marks each sentence with `data-claim` (the key of its text in
// src/i18n/<lang>/how-it-works.ts), and PROOFS ties each key to what proves it:
//  - a test: a file that exists and a test in it whose title has these words (most of them in
//    tests/e2e/launch-claims.spec.ts and the privacy specs, which run in Chromium and WebKit);
//  - a step in a browser: the official documentation of that browser, read on 13/nov/2026 (BROWSER_DOCS, § 760). What
//    the documentation did not confirm is not on the page;
//  - part 5 only: an honest limit of the check, which no test can prove (an extension, the page you have open).
// A sentence with no proof leaves the page: the keys of the built page in the three languages are exactly the keys here.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
import { consentBootstrap } from '../../src/analytics/consent.ts';
import { LANGS, pathFor } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import type { HowItWorksTexts } from '../../src/i18n/types.ts';

/** The official documentation of each browser step, read (WebFetch, read only) on DOCS_READ_ON (DECISOES § 760). */
const BROWSER_DOCS = {
  'chrome-open': 'https://developer.chrome.com/docs/devtools/open',
  'chrome-network': 'https://developer.chrome.com/docs/devtools/network',
  // Read in English, Portuguese (pt-br) and Spanish (es-es): the names "Rede"/"Red" and "Domínio"/"Dominio" of the pages.
  'edge-network': 'https://learn.microsoft.com/en-us/microsoft-edge/devtools/network/',
  'firefox-monitor': 'https://firefox-source-docs.mozilla.org/devtools-user/network_monitor/',
  'firefox-list': 'https://firefox-source-docs.mozilla.org/devtools-user/network_monitor/request_list/index.html',
  'safari-enable': 'https://developer.apple.com/documentation/safari-developer-tools/enabling-developer-features',
  // Read in English, Portuguese (pt-br) and Spanish (es-mx): the menu path and the name of the option in each language.
  'safari-menu': 'https://support.apple.com/guide/safari/sfri20948/mac',
  'safari-inspect': 'https://developer.apple.com/documentation/safari-developer-tools/inspecting-safari-macos',
  // The Network tab of Web Inspector, the reference Apple's documentation of Web Inspector links to.
  'safari-network': 'https://webkit.org/web-inspector/network-tab/',
} as const;
const DOCS_READ_ON = '2026-11-13';
type Doc = keyof typeof BROWSER_DOCS;

interface TestProof {
  file: string;
  test: string;
}
type Proof = TestProof | { doc: Doc };

const LAUNCH = 'tests/e2e/launch-claims.spec.ts';
const IMAGE = 'tests/e2e/image-privacy.spec.ts';
const PDF = 'tests/e2e/pdf-privacy.spec.ts';
const MONEY = 'tests/e2e/money-privacy.spec.ts';
const CONSENT_UNIT = 'tests/unit/consent.test.ts';
const CONSENT = 'tests/e2e/consent.spec.ts';
const OFFLINE = 'tests/e2e/sw-offline.spec.ts';
const SELF = 'tests/unit/how-it-works-claims.test.ts';
const TABLE = 'tests/unit/how-it-works.test.ts';

const P = {
  launch: { file: LAUNCH, test: 'no byte of the file leaves the browser, and the tool keeps working offline' },
  blob: { file: LAUNCH, test: 'Download saves the result from the memory of the browser: its address is a blob: made in the page' },
  mozjpeg: { file: LAUNCH, test: 'Compress image makes a JPEG smaller with the MozJPEG .wasm, fetched from the site' },
  hash: { file: LAUNCH, test: 'the part of an address after the # never reaches the server: the browser keeps it to itself' },
  gps: { file: IMAGE, test: 'a JPG with GPS under a sentinel name, and nothing of it leaves the browser' },
  heic: { file: IMAGE, test: 'the page is not cross-origin isolated, and libheif comes to a HEIC as the unmodified file' },
  canvas: { file: IMAGE, test: 'Resize image: a picture above the canvas limit takes the path without a canvas, one below it does not' },
  avif: { file: IMAGE, test: 'Convert to WebP writes an AVIF and AVIF to JPG reads it' },
  coop: { file: IMAGE, test: 'no page, script or .wasm is sent with COOP or COEP' },
  threads: { file: IMAGE, test: 'the dist has no multi-thread codec, no worker helper and not a SharedArrayBuffer' },
  libheif: { file: IMAGE, test: 'the libheif .wasm in the dist is the unmodified file of the package, served as wasm and immutable' },
  sentinels: { file: PDF, test: 'drop, options, run, download and chip leave nothing of the sentinels anywhere' },
  qpdf: { file: PDF, test: 'qpdf and PDF.js work on a page that is not cross-origin isolated, with the unmodified .wasm files of their packages' },
  numbers: { file: MONEY, test: 'no typed number leaves the device' },
  measures: { file: 'tests/e2e/money-life-privacy.spec.ts', test: 'no typed measure or date leaves the device' },
  qr: { file: 'tests/e2e/qr-code.spec.ts', test: 'the text never leaves the device: no request, event, store, title, attribute or file name carries it' },
  gtag: { file: CONSENT_UNIT, test: 'injects gtag.js only on fileorca.com' },
  closed: { file: CONSENT_UNIT, test: 'has the closed list of the plan' },
  listed: { file: CONSENT_UNIT, test: 'foTrack keeps only the listed parameters' },
  calcEvents: { file: CONSENT_UNIT, test: 'keeps the calculator events to closed lists: tool, target and format never carry a typed number' },
  noParam: { file: CONSENT_UNIT, test: 'names no parameter that could carry a number, a range, a text, a password, a count of pages or a file name' },
  location: { file: CONSENT, test: 'page_location never carries the query string or the hash' },
  decline: { file: CONSENT, test: 'the Decline of the own notice is the four keys, made and replayed' },
  stillOn: { file: SELF, test: 'a stored Decline still loads gtag.js on fileorca.com: declining does not switch Google Analytics off' },
  freePages: { file: 'tests/e2e/ads.spec.ts', test: 'have no AdSlot and no ad code' },
  adsOff: { file: 'tests/e2e/ads.spec.ts', test: 'nothing exists without the variables' },
  engine: { file: OFFLINE, test: 'with the worker on, a tool page keeps its 2 JS files and no engine before the first file' },
  kept: { file: OFFLINE, test: 'a tool kept without its engine says so offline, in buoy, and works again with the network' },
  offline: { file: OFFLINE, test: 'Compress image and Rotate PDF, used once with the network, work offline with other files' },
  rows: { file: TABLE, test: 'every .wasm of dist/_astro has its row in the table, and every row has its files' },
  bytes: { file: TABLE, test: 'every .wasm of dist/ is the file its package publishes, byte for byte' },
  js: { file: TABLE, test: 'the JavaScript rows have no .wasm, and the only .wasm files of PDF.js in dist/ are its two image decoders' },
  anchors: { file: TABLE, test: 'links each row to the row of its package on the Licenses page, in the three languages' },
  links: { file: TABLE, test: 'links the Privacy and the Licenses page of its language' },
} as const satisfies Record<string, TestProof>;
const docs = (...keys: Doc[]): Proof[] => keys.map((doc) => ({ doc }));

/** The proof of every sentence of the page, by its key; 'limit' is part 5 only. */
const PROOFS: Record<string, readonly Proof[] | 'limit'> = {
  intro: [P.launch],
  'file.open': [P.launch, P.engine],
  'file.read': [P.launch, P.gps, P.sentinels],
  'file.work': [P.launch, P.mozjpeg],
  'file.result': [P.blob, P.launch],
  'file.nothing': [P.launch, P.gps, P.sentinels],
  'file.numbers': [P.numbers, P.measures],
  'file.address': [P.numbers, P.calcEvents, P.location],
  'file.hash': [P.numbers, P.hash],
  'file.qr': [P.qr],
  'wasm.what': [P.launch, P.heic, P.qpdf],
  'wasm.table': [P.rows],
  'wasm.same': [P.bytes, P.launch],
  'wasm.native': [P.canvas, P.heic, P.avif],
  'wasm.js': [P.js],
  'wasm.threads': [P.coop, P.threads],
  'wasm.licenses': [P.anchors, P.libheif],
  'network.page': [P.launch, P.engine],
  'network.analytics': [P.gtag, P.closed, P.listed],
  'network.consent': [P.decline, P.stillOn],
  'network.ads': [P.freePages, P.adsOff],
  'network.never': [P.gps, P.sentinels, P.numbers, P.qr, P.noParam],
  'network.privacy': [P.links],
  'check.intro': docs('chrome-network', 'edge-network', 'firefox-monitor', 'safari-network'),
  'check.chrome.open': docs('chrome-open', 'chrome-network', 'edge-network'),
  'check.chrome.before': docs('chrome-network', 'edge-network'),
  'check.chrome.domain': docs('chrome-network', 'edge-network'),
  'check.firefox.open': docs('firefox-monitor'),
  'check.firefox.before': docs('firefox-monitor'),
  'check.firefox.domain': docs('firefox-list'),
  'check.safari.settings': docs('safari-enable', 'safari-menu'),
  'check.safari.open': docs('safari-inspect', 'safari-network'),
  'check.safari.before': docs('safari-network'),
  'check.watch.use': [P.launch],
  'check.watch.rows': [P.launch, P.closed],
  'check.watch.none': [P.launch, P.gps],
  'check.phone.load': [P.launch, P.kept],
  'check.phone.airplane': [P.launch, P.offline],
  'limits.extension': 'limit',
  'limits.again': 'limit',
};

/** The keys of the sentences of a language, in the order of the page. */
function claimKeys(t: HowItWorksTexts): string[] {
  const of = (part: string, paragraphs: readonly Readonly<Record<string, string>>[]) => paragraphs.flatMap((paragraph) => Object.keys(paragraph).map((key) => `${part}.${key}`));
  return [
    'intro',
    ...of('file', t.file.paragraphs),
    ...of('wasm', t.wasm.paragraphs),
    ...of('wasm', t.wasm.after),
    ...of('network', t.network.paragraphs),
    ...of('check', t.check.paragraphs),
    ...(['chrome', 'firefox', 'safari', 'watch', 'phone'] as const).flatMap((group) => Object.keys(t.check[group].steps).map((key) => `check.${group}.${key}`)),
    ...of('limits', t.limits.paragraphs),
  ];
}

/** The text of a sentence by its key. */
function sentence(t: HowItWorksTexts, key: string): string {
  const [part = '', a = '', b] = key.split('.');
  if (key === 'intro') return t.intro;
  if (part === 'check' && b !== undefined) return t.check[a as 'chrome'].steps[b as 'open'];
  const groups: Record<string, readonly Readonly<Record<string, string>>[]> = {
    file: t.file.paragraphs,
    wasm: [...t.wasm.paragraphs, ...t.wasm.after],
    network: t.network.paragraphs,
    check: t.check.paragraphs,
    limits: t.limits.paragraphs,
  };
  const found = groups[part]?.find((paragraph) => a in paragraph)?.[a];
  if (found === undefined) throw new Error(`no sentence ${key}`);
  return found;
}

/** The problems of one proof: a file that does not exist, or no test in it with this title. */
function proofProblems(proof: Proof): string[] {
  if ('doc' in proof) return BROWSER_DOCS[proof.doc] ? [] : [`a documentação ${proof.doc} não está em BROWSER_DOCS`];
  if (!existsSync(proof.file)) return [`${proof.file} não existe`];
  const lines = readFileSync(proof.file, 'utf8').split('\n');
  // The title is in a test( or it( line, or in the `title` a loop of tests passes to test() (tests/e2e/qr-code.spec.ts).
  const found = lines.some((line) => line.includes(proof.test) && /\b(?:test|it)\(|\btitle = /.test(line));
  return found ? [] : [`${proof.file} não tem o teste "${proof.test}"`];
}

const EN = TEXTS.en['how-it-works'];
const KEYS = claimKeys(EN);

describe('the sentences of How it works and their proofs (F19a, decision 7; DECISOES § 759)', () => {
  it('ties every sentence of the page to a proof, and every proof to a sentence', () => {
    expect(KEYS.filter((key) => !(key in PROOFS)), 'uma frase sem prova').toEqual([]);
    expect(Object.keys(PROOFS).filter((key) => !KEYS.includes(key)), 'uma prova sem frase').toEqual([]);
  });

  it('has the same sentences, by key, in the three languages', () => {
    for (const lang of LANGS) expect(claimKeys(TEXTS[lang]['how-it-works']), lang).toEqual(KEYS);
  });

  it('finds every test it cites, by its file and its title', () => {
    const problems = Object.values(PROOFS).flatMap((proofs) => (proofs === 'limit' ? [] : proofs.flatMap(proofProblems)));
    expect(problems).toEqual([]);
  });

  it('proves a step in a browser only by the documentation of that browser, read on the day of § 760, and nothing else by it', () => {
    expect(DOCS_READ_ON).toBe('2026-11-13');
    for (const url of Object.values(BROWSER_DOCS)) expect(url).toMatch(/^https:\/\/(?:developer\.chrome\.com|learn\.microsoft\.com|firefox-source-docs\.mozilla\.org|developer\.apple\.com|support\.apple\.com|webkit\.org)\//);
    for (const [key, proofs] of Object.entries(PROOFS)) {
      const browserStep = key === 'check.intro' || /^check\.(?:chrome|firefox|safari)\./.test(key);
      if (proofs === 'limit') {
        expect(key, 'só a parte 5 é limite').toMatch(/^limits\./);
        continue;
      }
      expect(proofs.every((proof) => ('doc' in proof) === browserStep), key).toBe(true);
    }
    // Each browser's steps cite its own documentation (Chrome and Edge share theirs).
    const own: Record<string, RegExp> = { chrome: /^(?:chrome|edge)-/, firefox: /^firefox-/, safari: /^safari-/ };
    for (const [key, proofs] of Object.entries(PROOFS)) {
      const browser = /^check\.(chrome|firefox|safari)\./.exec(key)?.[1];
      if (browser && proofs !== 'limit') expect(proofs.every((proof) => 'doc' in proof && own[browser]?.test(proof.doc)), key).toBe(true);
    }
  });

  it('names a browser only in the steps of that browser, which the documentation proves (DECISOES § 205)', () => {
    const BROWSERS = /\b(?:Chrome|Edge|Firefox|Safari|Opera|Brave|Vivaldi|Samsung Internet)\b/;
    for (const lang of LANGS) {
      const t = TEXTS[lang]['how-it-works'];
      for (const key of KEYS) {
        if (/^check\.(?:chrome|firefox|safari)\./.test(key)) continue;
        expect(sentence(t, key), `${lang} ${key}`).not.toMatch(BROWSERS);
      }
    }
  });

  it('says offline only after the engine was loaded once with the network (DECISOES § 205)', () => {
    expect(EN.check.phone.steps.load).toMatch(/\bonce\b/);
    expect(EN.check.phone.steps.load).toMatch(/\bengine\b/);
    expect(KEYS.indexOf('check.phone.load')).toBeLessThan(KEYS.indexOf('check.phone.airplane'));
  });

  it('catches a cited test that does not exist, a file that does not exist and a sentence with no proof (controls)', () => {
    expect(proofProblems({ file: LAUNCH, test: 'a title nobody wrote' })).toEqual([`${LAUNCH} não tem o teste "a title nobody wrote"`]);
    expect(proofProblems({ file: 'tests/e2e/nowhere.spec.ts', test: 'x' })).toEqual(['tests/e2e/nowhere.spec.ts não existe']);
    // A title that is only in a comment is not a test.
    expect(proofProblems({ file: SELF, test: 'A title that is only in a comment is not a test.' })).toHaveLength(1);
    const withExtra = { ...EN, file: { ...EN.file, paragraphs: [EN.file.paragraphs[0], EN.file.paragraphs[1], { ...EN.file.paragraphs[2], extra: 'An unproved sentence.' }] } } as unknown as HowItWorksTexts;
    expect(claimKeys(withExtra).filter((key) => !(key in PROOFS))).toEqual(['file.extra']);
  });
});

const DIST = 'dist';
const BUILT = existsSync(join(DIST, 'index.html'));

describe.runIf(BUILT)('the built How it works page carries exactly the sentences that have a proof', () => {
  for (const lang of LANGS) {
    it(`marks every sentence of the five parts, and nothing else, in ${lang}`, () => {
      const path = pathFor('how-it-works', lang);
      const main = parse(readFileSync(join(DIST, ...path.split('/').filter(Boolean), 'index.html'), 'utf8')).querySelector('main');
      const marked = main?.querySelectorAll('[data-claim]').map((element) => element.getAttribute('data-claim')) ?? [];
      expect(marked, lang).toEqual(KEYS);
      // Each paragraph and each step of the five parts is made of marked sentences only.
      for (const block of main?.querySelectorAll('section.fo-how > p, section.fo-how li[data-claim]') ?? []) {
        const loose = block.tagName === 'LI' ? '' : block.childNodes.filter((node) => node.nodeType === 3).map((node) => node.text.trim()).join('');
        expect(loose, `${lang}: texto sem data-claim`).toBe('');
      }
    });
  }
});

// The one claim of the page that no test of before proved: the Privacy says that declining does not switch Google
// Analytics off (it works without cookies), and the How it works page says the same. The bootstrap of the consent runs as
// on fileorca.com with a stored Decline, the way tests/unit/consent.test.ts runs it.
function bootstrap(hostname: string, stored: string | null): { appended: string[]; dataLayer: unknown[][] } {
  const appended: string[] = [];
  const window: Record<string, unknown> = {
    location: { hostname, origin: `https://${hostname}`, pathname: '/compress-image/' },
    localStorage: { getItem: () => stored },
    document: { head: { appendChild: (node: { src: string }) => appended.push(node.src) }, createElement: () => ({ src: '' }) },
    Date,
    Intl: { DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone: 'America/Sao_Paulo' }) }) },
  };
  window['window'] = window;
  runInNewContext(consentBootstrap(), window);
  return { appended, dataLayer: (window['dataLayer'] as ArrayLike<unknown>[]).map((entry) => Array.from(entry)) };
}

describe('the consent of Google Analytics, as the Privacy page says it', () => {
  it('a stored Decline still loads gtag.js on fileorca.com: declining does not switch Google Analytics off', () => {
    const declined = bootstrap('fileorca.com', 'denied');
    expect(declined.appended).toEqual(['https://www.googletagmanager.com/gtag/js?id=G-T4BBJN7S11']);
    // The Decline is the four keys denied, given before the config: what Google may keep, not whether it runs.
    expect(declined.dataLayer).toContainEqual(['consent', 'update', { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }]);
    expect(declined.dataLayer.some((entry) => entry[0] === 'config')).toBe(true);
    // The same script with an Accept, and with no choice at all.
    expect(bootstrap('fileorca.com', 'granted').appended).toEqual(declined.appended);
    expect(bootstrap('fileorca.com', null).appended).toEqual(declined.appended);
  });
});
