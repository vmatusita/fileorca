// Site-wide constants. Keep `LAUNCHED` on a single line in this exact form:
// the post-deploy check reads it with `git show <sha>:src/platform/site.ts`.
export const LAUNCHED = true;

// F19a (decision 5; DECISOES § 751): the day the site went live, the merge of the F2 (DECISOES § 75) in Brasília. It is
// the date of the first entry of src/platform/changelog.ts, and tests/unit/changelog.test.ts proves both against the merge
// of that pull request in the history of main. The About says it in the long form of each language (src/i18n/dates.ts).
export const LAUNCH_DATE = '2026-10-31';

// Kill switch of the service worker (F8, decision 7; DECISOES § 288). With false, the build writes a /sw.js that
// deletes every cache of the site and unregisters itself, and the pages stop registering it. A short adjustment run
// turns it off or back on (docs/OPERACAO.md).
export const SW_ENABLED = true;

export const SITE_ORIGIN = 'https://fileorca.com';
export const PRODUCTION_HOSTNAME = 'fileorca.com';
export const SITE_NAME = 'FileOrca';

export const GA4_MEASUREMENT_ID = 'G-T4BBJN7S11';
export const KOFI_URL = 'https://ko-fi.com/victormatusita';
export const CONTACT_EMAIL = 'contato@fileorca.com';

export const AUTHOR = {
  name: 'Victor Yuki Matusita',
  city: 'Curitiba',
  region: 'PR',
  website: 'https://vmatusita.com.br',
  linkedin: 'https://www.linkedin.com/in/victor-matusita',
} as const;

// IndexNow key: public by design, also served as /<key>.txt (public/).
export const INDEXNOW_KEY = '4ad5aef34d8b1746ec596c51d0f4fa1a';

/** Reads LAUNCHED from the source text of this file (used by the post-deploy check). */
export function parseLaunched(source: string): boolean {
  const match = /^export const LAUNCHED = (true|false);$/m.exec(source);
  if (!match) throw new Error('LAUNCHED not found in src/platform/site.ts');
  return match[1] === 'true';
}
