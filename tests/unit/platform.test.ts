import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildCommit } from '../../src/platform/build-files.ts';
import { WORKERS_DEV_PATTERN, headerRules, toHeadersFile, toRedirectsFile } from '../../src/platform/headers.ts';
import { parseJsonc } from '../../scripts/lib/jsonc.ts';

function rule(rules: ReturnType<typeof headerRules>, pattern: string) {
  const found = rules.find((candidate) => candidate.pattern === pattern);
  if (!found) throw new Error(`rule ${pattern} missing`);
  return found.headers;
}

describe('_headers gerado', () => {
  for (const launched of [false, true]) {
    it(`has the security headers on every path (LAUNCHED = ${launched})`, () => {
      const site = rule(headerRules({ launched }), '/*');
      expect(site['X-Content-Type-Options']).toBe('nosniff');
      expect(site['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(site['Content-Security-Policy']).toBe("frame-ancestors 'self'");
      expect(site['Strict-Transport-Security']).toBe('max-age=31536000; includeSubDomains');
    });

    it(`never sends COOP or COEP (LAUNCHED = ${launched})`, () => {
      const text = toHeadersFile(headerRules({ launched })).toLowerCase();
      expect(text).not.toContain('cross-origin-opener-policy');
      expect(text).not.toContain('cross-origin-embedder-policy');
    });

    it(`keeps noindex on every workers.dev URL (LAUNCHED = ${launched})`, () => {
      expect(WORKERS_DEV_PATTERN).toBe('https://:version.:subdomain.workers.dev/*');
      expect(rule(headerRules({ launched }), WORKERS_DEV_PATTERN)['X-Robots-Tag']).toBe('noindex');
    });
  }

  it('puts noindex on the whole site while LAUNCHED = false, and drops it after launch', () => {
    expect(rule(headerRules({ launched: false }), '/*')['X-Robots-Tag']).toBe('noindex');
    expect(rule(headerRules({ launched: true }), '/*')['X-Robots-Tag']).toBeUndefined();
  });

  it('writes the Cloudflare _headers format', () => {
    const text = toHeadersFile(headerRules({ launched: false }));
    expect(text).toContain("/*\n  X-Content-Type-Options: nosniff\n");
    expect(text).toContain(`${WORKERS_DEV_PATTERN}\n  X-Robots-Tag: noindex\n`);
    expect(text).toContain('/_astro/*\n  Cache-Control: public, max-age=31536000, immutable');
    for (const line of text.split('\n')) expect(line.length).toBeLessThanOrEqual(2000);
    expect(toRedirectsFile([])).toMatch(/^# Generated/);
  });

  it('never uses a robots meta tag for noindex (only the header)', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) walk(path);
        else if (/\.(astro|tsx?|html)$/.test(entry.name) && /<meta[^>]+name=["']robots["']/i.test(readFileSync(path, 'utf8'))) {
          offenders.push(path);
        }
      }
    };
    walk('src');
    expect(offenders).toEqual([]);
  });
});

describe('build.txt', () => {
  it('uses WORKERS_CI_COMMIT_SHA when Workers Builds sets it', () => {
    expect(buildCommit({ WORKERS_CI_COMMIT_SHA: 'abc123' })).toBe('abc123');
  });

  it('falls back to git HEAD elsewhere', () => {
    expect(buildCommit({})).toMatch(/^[0-9a-f]{40}$/);
  });
});

describe('Worker sem código', () => {
  const config = parseJsonc(readFileSync('wrangler.jsonc', 'utf8')) as Record<string, unknown>;

  it('has exactly the fields ADR-001 allows', () => {
    expect(Object.keys(config).sort()).toEqual(
      ['$schema', 'assets', 'compatibility_date', 'name', 'preview_urls', 'workers_dev'].sort(),
    );
    expect(config['name']).toBe('fileorca');
    expect(config['compatibility_date']).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(config['workers_dev']).toBe(true);
    expect(config['preview_urls']).toBe(true);
    expect(config['assets']).toEqual({
      directory: './dist',
      not_found_handling: '404-page',
      html_handling: 'auto-trailing-slash',
    });
  });

  it('has no main and no run_worker_first anywhere', () => {
    const text = readFileSync('wrangler.jsonc', 'utf8');
    expect(config).not.toHaveProperty('main');
    expect(JSON.stringify(config)).not.toContain('run_worker_first');
    expect(text).not.toMatch(/"main"\s*:/);
  });

  it('has no Worker code in the repository', () => {
    for (const path of ['functions', 'public/_worker.js', 'src/worker.ts', 'src/worker.js', '_worker.js', 'wrangler.toml', 'wrangler.json']) {
      expect(existsSync(path), path).toBe(false);
    }
  });
});
