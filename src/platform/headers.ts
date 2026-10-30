// Single source for HTTP headers and redirects (ADR-001, item 3).
// The build turns these rules into dist/_headers and dist/_redirects; moving to another
// host means rewriting only the two `to*File` converters below.

export interface HeaderRule {
  /** Path pattern (`/*`) or absolute URL pattern with placeholders. */
  pattern: string;
  headers: Record<string, string>;
}

export interface RedirectRule {
  from: string;
  to: string;
  status: 301 | 302 | 307 | 308;
}

/** Every workers.dev URL: production alias, version previews and branch previews. */
export const WORKERS_DEV_PATTERN = 'https://:version.:subdomain.workers.dev/*';

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "frame-ancestors 'self'",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

export function headerRules(options: { launched: boolean }): HeaderRule[] {
  const site: Record<string, string> = { ...SECURITY_HEADERS };
  if (!options.launched) site['X-Robots-Tag'] = 'noindex';
  return [
    { pattern: '/*', headers: site },
    { pattern: WORKERS_DEV_PATTERN, headers: { 'X-Robots-Tag': 'noindex' } },
    { pattern: '/_astro/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    { pattern: '/build.txt', headers: { 'Cache-Control': 'no-store' } },
  ];
}

export function redirectRules(): RedirectRule[] {
  return [];
}

export function toHeadersFile(rules: HeaderRule[]): string {
  const blocks = rules.map((rule) => {
    const lines = Object.entries(rule.headers).map(([name, value]) => `  ${name}: ${value}`);
    return [rule.pattern, ...lines].join('\n');
  });
  return `# Generated from src/platform/headers.ts. Do not edit.\n${blocks.join('\n\n')}\n`;
}

export function toRedirectsFile(rules: RedirectRule[]): string {
  const lines = rules.map((rule) => `${rule.from} ${rule.to} ${rule.status}`);
  return ['# Generated from src/platform/headers.ts. Do not edit.', ...lines].join('\n') + '\n';
}
