// Site-wide constants. Keep `LAUNCHED` on a single line in this exact form:
// the post-deploy check reads it with `git show <sha>:src/platform/site.ts`.
export const LAUNCHED = false;

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
