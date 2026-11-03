// The five categories of the public-repository audit (scripts/publico/lib/classify.ts, DECISOES § 332). The context
// is synthetic, except publicValues, which the audit reads from src/platform/site.ts and pix.ts the same way here:
// the classification has to recognise what the site already publishes without anyone writing it by hand.
import { describe, expect, it } from 'vitest';
import * as pix from '../../src/platform/pix.ts';
import * as site from '../../src/platform/site.ts';
import { classify, type AuditContext, type Finding } from '../../scripts/publico/lib/classify.ts';
import { stringsOf } from '../../scripts/publico/lib/git-parse.ts';

const context = (): AuditContext => ({
  publicValues: stringsOf(site, pix),
  brandDomains: new Set(['fileorca.com']),
  ownerEmails: new Set(['dono.exemplo@caixa-postal.net']),
  ownerNames: new Set(['dono exemplo', 'donoexemplo']),
  samplePaths: new Set(['fixtures/images/sample-gps.jpg']),
  sampleCoordinates: new Set(['10.000000, -20.000000']),
});

const verdict = (finding: Finding): string => classify(finding, context()).category;

describe('segredo (gitleaks)', () => {
  it('values that the site already publishes are public by nature', () => {
    expect(verdict({ type: 'segredo', value: site.INDEXNOW_KEY, rule: 'generic-api-key', paths: ['src/platform/site.ts'] })).toBe('publico');
    expect(verdict({ type: 'segredo', value: pix.PIX_KEY, rule: 'generic-api-key', paths: ['fixtures/pix.json'] })).toBe('publico');
  });

  it('a hash, a common word, an example and a synthetic test value are false positives', () => {
    const sha = 'a'.repeat(30) + 'b'.repeat(34);
    expect(verdict({ type: 'segredo', value: sha, rule: 'generic-api-key', context: `sha256: '${sha}'`, paths: ['scripts/lib/tools.ts'] })).toBe('falso-positivo');
    expect(verdict({ type: 'segredo', value: 'Especificaciones', rule: 'linkedin-client-secret', paths: ['src/i18n/es/x.ts'] })).toBe('falso-positivo');
    expect(verdict({ type: 'segredo', value: 'sk_live_example_key', rule: 'stripe', paths: ['docs/x.md'] })).toBe('falso-positivo');
    expect(verdict({ type: 'segredo', value: 'Kq7-Sentinel-31', rule: 'generic-api-key', paths: ['tests/e2e/lib/sentinels.ts'] })).toBe('falso-positivo');
  });

  it('anything else is a real secret to check (the control that fails)', () => {
    expect(verdict({ type: 'segredo', value: 'Zr4Lq2Wm8Tx1Vb6Nc3Ks5Hy7', rule: 'generic-api-key', paths: ['scripts/deploy.ts'] })).toBe('segredo-real');
  });
});

describe('e-mail', () => {
  const email = (value: string, paths: string[] = ['docs/x.md']): string => verdict({ type: 'email', value, paths });

  it('example domains and the git SSH user are false positives', () => {
    expect(email('someone@example.com')).toBe('falso-positivo');
    expect(email('fo@example.invalid')).toBe('falso-positivo');
    expect(email('git@github.com')).toBe('falso-positivo');
  });

  it('the brand contact (read from site.ts) and service no-reply addresses are public', () => {
    expect(email(site.CONTACT_EMAIL)).toBe('publico');
    expect(email('noreply@anthropic.com')).toBe('publico');
    expect(email('12345+someone@users.noreply.github.com')).toBe('publico');
    expect(email('author@example-lib.org', ['src/platform/license-texts/x.txt'])).toBe('publico');
    expect(email('author@example-lib.org', ['pnpm-lock.yaml'])).toBe('publico');
  });

  it("the owner's addresses and accounts named after the brand are the owner's", () => {
    expect(email('dono.exemplo@caixa-postal.net')).toBe('victor');
    expect(email('fileorca.extra@mailbox.org')).toBe('victor');
  });

  it('other addresses are third-party data, with a note that tells personal from role addresses', () => {
    const personal = classify({ type: 'email', value: 'someone.blog@gmail.com', paths: ['docs/lancamento/x.md'] }, context());
    const role = classify({ type: 'email', value: 'editor@someblog.org', paths: ['docs/lancamento/x.md'] }, context());
    expect([personal.category, role.category]).toEqual(['terceiro', 'terceiro']);
    expect(personal.note).toContain('pessoal');
    expect(role.note).toContain('função');
  });
});

describe('commit identities', () => {
  it("the owner's identity, a service identity and someone else's", () => {
    expect(verdict({ type: 'autor-commit', value: 'Dono Exemplo <other@example.org>', paths: [] })).toBe('victor');
    expect(verdict({ type: 'autor-commit', value: 'x <dono.exemplo@caixa-postal.net>', paths: [] })).toBe('victor');
    expect(verdict({ type: 'autor-commit', value: 'GitHub <noreply@github.com>', paths: [] })).toBe('publico');
    expect(verdict({ type: 'autor-commit', value: 'dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>', paths: [] })).toBe('publico');
    expect(verdict({ type: 'autor-commit', value: 'Fulana Contribuidora <fulana@example-mail.org>', paths: [] })).toBe('terceiro');
  });
});

describe('telefone, CPF and endereço', () => {
  it('only in tests or fixtures is synthetic; the 555-01xx range is fictional', () => {
    expect(verdict({ type: 'telefone', value: '(212) 555-0142', paths: ['docs/x.md'] })).toBe('falso-positivo');
    expect(verdict({ type: 'telefone', value: '(41) 99876-5432', paths: ['tests/unit/x.test.ts'] })).toBe('falso-positivo');
    expect(verdict({ type: 'cpf', value: '000.000.001-91', paths: ['fixtures/x.json', 'tests/unit/y.test.ts'] })).toBe('falso-positivo');
    expect(verdict({ type: 'endereco', value: 'Rua das Flores, 123', paths: ['tests/unit/x.test.ts'] })).toBe('falso-positivo');
  });

  it('outside the tests they are third-party data to check (the control that fails)', () => {
    expect(verdict({ type: 'telefone', value: '(41) 99876-5432', paths: ['docs/x.md'] })).toBe('terceiro');
    expect(verdict({ type: 'cpf', value: '000.000.001-91', paths: ['docs/x.md'] })).toBe('terceiro');
    expect(verdict({ type: 'endereco', value: 'Rua das Flores, 123', paths: ['docs/x.md'] })).toBe('terceiro');
  });
});

describe('images and profiles', () => {
  it('a GPS of a listed public sample (or the same coordinate in a derived file) is third-party data', () => {
    expect(verdict({ type: 'gps', value: '1.000000, 2.000000', paths: ['fixtures/images/sample-gps.jpg'] })).toBe('terceiro');
    expect(verdict({ type: 'gps', value: '10.000000, -20.000000', paths: ['fixtures/images/gen-copy.webp'] })).toBe('terceiro');
  });

  it('a GPS from outside fixtures/ORIGEM.md goes to the owner to check', () => {
    expect(verdict({ type: 'gps', value: '3.000000, 4.000000', paths: ['docs/relatorios/foto.jpg'] })).toBe('victor');
  });

  it("identity tags with the owner's name, and profiles", () => {
    expect(verdict({ type: 'identidade-imagem', value: 'Artist: Dono Exemplo', paths: ['docs/x.jpg'] })).toBe('victor');
    expect(verdict({ type: 'identidade-imagem', value: 'Artist: Outra Pessoa', paths: ['fixtures/images/sample-gps.jpg'] })).toBe('terceiro');
    expect(verdict({ type: 'perfil', value: site.AUTHOR.linkedin, paths: ['docs/lancamento/x.md'] })).toBe('publico');
    expect(verdict({ type: 'perfil', value: 'https://x.com/donoexemplo', paths: ['docs/lancamento/x.md'] })).toBe('victor');
    expect(verdict({ type: 'perfil', value: 'https://x.com/someone_else', paths: ['docs/lancamento/x.md'] })).toBe('terceiro');
  });
});
