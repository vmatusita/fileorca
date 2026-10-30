import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { hasCommit, indexNowBody, injectedScripts, robotsHeaderProblem } from '../../scripts/ci/pos-deploy.ts';
import { INDEXNOW_KEY, LAUNCHED, parseLaunched } from '../../src/platform/site.ts';

describe('pós-deploy', () => {
  it('reads LAUNCHED from the source of site.ts', () => {
    const source = readFileSync('src/platform/site.ts', 'utf8');
    expect(parseLaunched(source)).toBe(LAUNCHED);
    expect(parseLaunched('export const LAUNCHED = true;\n')).toBe(true);
    expect(() => parseLaunched('const LAUNCHED = false')).toThrow();
  });

  it('keeps LAUNCHED false in the F1a', () => {
    expect(LAUNCHED).toBe(false);
  });

  it('accepts the commit itself or a later one, via git merge-base --is-ancestor', () => {
    const calls: string[][] = [];
    expect(hasCommit('aaa', 'bbb', (args) => void calls.push(args))).toBe(true);
    expect(calls).toEqual([['merge-base', '--is-ancestor', 'aaa', 'bbb']]);
    expect(hasCommit('aaa', 'bbb', () => { throw new Error('exit 1'); })).toBe(false);
  });

  it('flags Cloudflare-injected scripts', () => {
    expect(injectedScripts('<html><script src="/cdn-cgi/challenge-platform/x.js"></script></html>')).toEqual(['/cdn-cgi/']);
    expect(injectedScripts('<script src="https://static.cloudflareinsights.com/beacon.min.js"></script>')).toEqual(['cloudflareinsights']);
    expect(injectedScripts('<html><body>ok</body></html>')).toEqual([]);
  });

  it('requires noindex before launch and no X-Robots-Tag after it', () => {
    expect(robotsHeaderProblem('noindex', false)).toBeNull();
    expect(robotsHeaderProblem('noindex, noindex', false)).toBeNull();
    expect(robotsHeaderProblem(null, false)).toMatch(/sem noindex/);
    expect(robotsHeaderProblem(null, true)).toBeNull();
    expect(robotsHeaderProblem('noindex', true)).toMatch(/presente/);
  });

  it('builds the IndexNow body with the public key file', () => {
    expect(JSON.parse(indexNowBody(['https://fileorca.com/compress-image/']))).toEqual({
      host: 'fileorca.com',
      key: INDEXNOW_KEY,
      keyLocation: `https://fileorca.com/${INDEXNOW_KEY}.txt`,
      urlList: ['https://fileorca.com/compress-image/'],
    });
    expect(readFileSync(`public/${INDEXNOW_KEY}.txt`, 'utf8')).toBe(INDEXNOW_KEY);
    expect(INDEXNOW_KEY).toMatch(/^[a-f0-9]{32}$/);
  });
});
