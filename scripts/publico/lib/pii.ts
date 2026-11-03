// Personal data in text, for the public-repository audit (pnpm publico:auditar, DECISOES § 332): e-mail addresses,
// phone numbers in the Brazilian and US formats, CPF (only when the check digits are right, which cuts most false
// positives), street addresses and CEP, and personal social profiles (only where the caller asks, docs/lancamento/).
// Pure functions over a string: the caller decides where the text came from and how to classify each hit.

export type TextKind = 'email' | 'telefone' | 'cpf' | 'endereco' | 'perfil';

export interface TextHit {
  kind: TextKind;
  /** The matched text, trimmed. Never printed outside .cache/. */
  value: string;
  /** 1-based line of the match. */
  line: number;
}

/** CPF check digits (Receita Federal): two mod-11 digits over the first nine and ten; eleven equal digits are invalid. */
export function cpfValid(text: string): boolean {
  const digits = text.replace(/\D/g, '');
  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) return false;
  const nums = [...digits].map(Number);
  const check = (length: number): number => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) sum += (nums[index] ?? 0) * (length + 1 - index);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === nums[9] && check(10) === nums[10];
}

/** File extensions that follow an "@" in names like icon@2x.png: not an e-mail domain. */
const FILE_TLDS = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif', 'heic', 'ico', 'js', 'mjs', 'cjs', 'ts', 'tsx', 'css', 'json', 'md', 'html', 'map', 'txt', 'pdf', 'zip', 'wasm', 'woff', 'woff2', 'ttf', 'otf', 'astro', 'yml', 'yaml']);

const EMAIL = /(?<![\w.%+-])[A-Za-z0-9][A-Za-z0-9._%+-]{0,63}@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+([A-Za-z]{2,24})(?![\w-])/g;

const PHONES: RegExp[] = [
  // Brazil: +55 with or without the area code in parentheses, or the area code in parentheses.
  /(?<![\w+])\+55[\s.-]?\(?[1-9]{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}(?!\d)/g,
  /(?<![\w(])\([1-9]{2}\)\s?9?\d{4}-\d{4}(?!\d)/g,
  // United States: +1, the area code in parentheses, or the dashed or dotted 3-3-4 form.
  /(?<![\w+])\+1[\s.-]?\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)/g,
  /(?<![\w(])\([2-9]\d{2}\)\s?\d{3}[-.]\d{4}(?!\d)/g,
  /(?<![\w.-])[2-9]\d{2}-\d{3}-\d{4}(?![\w-])/g,
  /(?<![\w.-])[2-9]\d{2}\.\d{3}\.\d{4}(?![\w.-])/g,
];

/** Formatted CPF anywhere; any 11 digits (with or without the dots and dash) only right after the word CPF. */
const CPF_FORMATTED = /(?<![\d.])\d{3}\.\d{3}\.\d{3}-\d{2}(?![\d-])/g;
const CPF_AFTER_WORD = /\bCPF\b[^\d\n]{0,30}(\d{3}\.?\d{3}\.?\d{3}-?\d{2})(?!\d)/gi;

const CEP = /\bCEP\b[^\d\n]{0,10}(\d{5}-?\d{3})(?![\d-])/gi;
const STREET_BR = /\b(?:Rua|Avenida|Av\.|Alameda|Travessa|Praça|Rodovia|Estrada)\s+\p{L}[^\n,;:()]{1,60}?,\s*(?:n[º°o.]?\s*)?\d{1,5}(?!\d)/gu;
const STREET_US = /\b\d{1,6}\s+(?:[A-Z][A-Za-z0-9.'-]*\s+){1,4}(?:Street|Avenue|Road|Boulevard|Lane|Drive|Court|Parkway|Place|St|Ave|Rd|Blvd|Ln|Dr|Ct|Pkwy)\b\.?(?:,?\s+(?:Suite|Ste\.?|Apt\.?|Unit)\s*#?\w+)?/g;

/** Personal social profiles (an account, not a publication or a repository). */
const PROFILE = /https?:\/\/(?:www\.)?(?:linkedin\.com\/in\/|x\.com\/|twitter\.com\/|instagram\.com\/|facebook\.com\/|fb\.com\/|tiktok\.com\/@|youtube\.com\/@|threads\.net\/@|bsky\.app\/profile\/|medium\.com\/@|producthunt\.com\/@|news\.ycombinator\.com\/user\?id=|reddit\.com\/u(?:ser)?\/)[^\s)>\]"'`|]+/g;

/** 1-based line of a position, by binary search over the line starts. */
function lineOf(index: number, starts: number[]): number {
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if ((starts[mid] ?? 0) <= index) low = mid;
    else high = mid - 1;
  }
  return low + 1;
}

function lineStarts(text: string): number[] {
  const starts = [0];
  for (let index = text.indexOf('\n'); index !== -1; index = text.indexOf('\n', index + 1)) starts.push(index + 1);
  return starts;
}

export interface ScanOptions {
  /** Look for personal social profiles too (docs/lancamento/). */
  profiles?: boolean;
}

/** Every personal-data hit in the text, in order of position. Overlapping hits of the same kind count once. */
export function scanText(text: string, options: ScanOptions = {}): TextHit[] {
  const starts = lineStarts(text);
  const hits: (TextHit & { at: number })[] = [];
  const seen = new Set<string>();
  const add = (kind: TextKind, value: string, at: number): void => {
    const key = `${kind}:${at}`;
    if (seen.has(key)) return;
    seen.add(key);
    hits.push({ kind, value: value.trim(), line: lineOf(at, starts), at });
  };
  for (const match of text.matchAll(EMAIL)) {
    if (FILE_TLDS.has((match[1] ?? '').toLowerCase())) continue;
    add('email', match[0], match.index);
  }
  const phoneSpans: [number, number][] = [];
  for (const pattern of PHONES) {
    for (const match of text.matchAll(pattern)) {
      const at = match.index;
      if (phoneSpans.some(([from, to]) => at < to && at + match[0].length > from)) continue;
      phoneSpans.push([at, at + match[0].length]);
      add('telefone', match[0], at);
    }
  }
  for (const match of text.matchAll(CPF_FORMATTED)) if (cpfValid(match[0])) add('cpf', match[0], match.index);
  for (const match of text.matchAll(CPF_AFTER_WORD)) {
    const value = match[1] ?? '';
    const at = match.index + match[0].length - value.length;
    if (cpfValid(value)) add('cpf', value, at);
  }
  for (const match of text.matchAll(CEP)) add('endereco', match[0], match.index);
  for (const match of text.matchAll(STREET_BR)) add('endereco', match[0], match.index);
  for (const match of text.matchAll(STREET_US)) add('endereco', match[0], match.index);
  if (options.profiles) for (const match of text.matchAll(PROFILE)) add('perfil', match[0].replace(/[.,;:]+$/, ''), match.index);
  return hits.sort((left, right) => left.at - right.at).map(({ kind, value, line }) => ({ kind, value, line }));
}

/** The domain of an e-mail address, lower case. */
export function emailDomain(email: string): string {
  return (email.split('@')[1] ?? '').toLowerCase();
}

/** True when the bytes look like text: no NUL in the first 8 KB. */
export function looksLikeText(bytes: Uint8Array): boolean {
  const head = bytes.subarray(0, 8192);
  return !head.includes(0);
}
