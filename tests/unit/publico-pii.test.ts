// The text scanner of the public-repository audit (scripts/publico/lib/pii.ts, DECISOES § 332). Every value here is
// synthetic: CPFs computed from their own check digits, example domains, the US fictional 555-01xx range.
import { describe, expect, it } from 'vitest';
import { cpfValid, looksLikeText, scanText } from '../../scripts/publico/lib/pii.ts';

/** A CPF built from nine digits and its own check digits (the same algorithm, written independently here). */
function makeCpf(nine: string): string {
  const digits = [...nine].map(Number);
  for (const length of [9, 10]) {
    const sum = digits.slice(0, length).reduce((total, digit, index) => total + digit * (length + 1 - index), 0);
    const rest = (sum * 10) % 11;
    digits.push(rest === 10 ? 0 : rest);
  }
  const text = digits.join('');
  return `${text.slice(0, 3)}.${text.slice(3, 6)}.${text.slice(6, 9)}-${text.slice(9)}`;
}

const kinds = (text: string, profiles = false): string[] => scanText(text, { profiles }).map((hit) => `${hit.kind}:${hit.value}`);

describe('CPF', () => {
  const valid = makeCpf('390533447');

  it('accepts a CPF whose two check digits are right, with or without punctuation', () => {
    expect(cpfValid(valid)).toBe(true);
    expect(cpfValid(valid.replace(/\D/g, ''))).toBe(true);
  });

  it('refuses a wrong check digit, eleven equal digits and the wrong length', () => {
    const last = Number(valid.at(-1));
    expect(cpfValid(`${valid.slice(0, -1)}${(last + 1) % 10}`)).toBe(false);
    expect(cpfValid('111.111.111-11')).toBe(false);
    expect(cpfValid('123.456.789-0')).toBe(false);
  });

  it('finds a formatted CPF only when it is valid', () => {
    const wrong = `${valid.slice(0, -1)}${(Number(valid.at(-1)) + 1) % 10}`;
    expect(kinds(`titular: ${valid}`)).toEqual([`cpf:${valid}`]);
    expect(kinds(`protocolo ${wrong}`)).toEqual([]);
  });

  it('finds bare digits only right after the word CPF', () => {
    const bare = valid.replace(/\D/g, '');
    expect(kinds(`CPF ${bare}`)).toEqual([`cpf:${bare}`]);
    expect(kinds(`pedido ${bare}`)).toEqual([]);
  });
});

describe('e-mail', () => {
  it('finds addresses and their line', () => {
    const hits = scanText('primeira linha\nfale com ana.souza@example.com hoje\n');
    expect(hits).toEqual([{ kind: 'email', value: 'ana.souza@example.com', line: 2 }]);
  });

  it('ignores file names with @2x, package versions and npm scopes', () => {
    expect(kinds('icon@2x.png react@18.3.1 @astrojs/preact pnpm@10.34.9')).toEqual([]);
  });
});

describe('telefone', () => {
  it('finds the Brazilian formats', () => {
    expect(kinds('ligue (41) 99876-5432')).toEqual(['telefone:(41) 99876-5432']);
    expect(kinds('whats +55 41 99876-5432')).toEqual(['telefone:+55 41 99876-5432']);
  });

  it('finds the US formats', () => {
    expect(kinds('call (212) 555-0142')).toEqual(['telefone:(212) 555-0142']);
    expect(kinds('call 212-555-0142')).toEqual(['telefone:212-555-0142']);
    expect(kinds('call +1 212 555 0142')).toEqual(['telefone:+1 212 555 0142']);
  });

  it('leaves dates, versions, hashes and long numbers alone', () => {
    expect(kinds('2026-11-03 v1.2.3 sha 9f86d081884c7d659a2feaa0c55ad015 id 1234567890123 size 3024x4032')).toEqual([]);
  });
});

describe('endereço', () => {
  it('finds a CEP after the word, a Brazilian street with a number and a US street', () => {
    expect(kinds('CEP 01310-100')).toEqual(['endereco:CEP 01310-100']);
    expect(kinds('Rua das Flores, 123')).toEqual(['endereco:Rua das Flores, 123']);
    expect(kinds('at 1600 Example Parkway today')).toEqual(['endereco:1600 Example Parkway']);
  });

  it('does not take a street name without a number', () => {
    expect(kinds('IMG_4521 Rua Augusta')).toEqual([]);
  });
});

describe('perfil', () => {
  it('finds personal profiles only when asked (docs/lancamento/)', () => {
    const text = 'see https://www.linkedin.com/in/someone-example and https://x.com/someone_example.';
    expect(kinds(text)).toEqual([]);
    expect(kinds(text, true)).toEqual(['perfil:https://www.linkedin.com/in/someone-example', 'perfil:https://x.com/someone_example']);
  });
});

describe('looksLikeText', () => {
  it('is false when the head has a NUL byte', () => {
    expect(looksLikeText(new TextEncoder().encode('plain text'))).toBe(true);
    expect(looksLikeText(new Uint8Array([0x89, 0x50, 0x00, 0x47]))).toBe(false);
  });
});
