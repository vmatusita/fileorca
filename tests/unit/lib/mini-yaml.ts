// A small YAML reader for the repository's own config files (.github/dependabot.yml and the workflows), so the
// tests can check their structure without a new dependency (DECISOES § 296). It reads the subset those files use:
// block mappings and sequences, flow sequences and maps of scalars, quoted and plain scalars, `|` and `>` block
// scalars, and comments. Anchors, tags, multi-document streams and multi-line flow collections are refused.

export type YamlValue = string | number | boolean | null | YamlValue[] | { [key: string]: YamlValue };

interface Line {
  indent: number;
  text: string;
  raw: string;
  number: number;
}

function stripComment(text: string): string {
  let quote: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '#' && (i === 0 || /\s/.test(text[i - 1] ?? ''))) {
      return text.slice(0, i).trimEnd();
    }
  }
  return text.trimEnd();
}

function scalar(text: string, line: number): YamlValue {
  const value = text.trim();
  if (value === '' || value === '~' || value === 'null') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  if (value.startsWith('"')) {
    if (!value.endsWith('"') || value.length < 2) throw new Error(`mini-yaml: aspas sem fim na linha ${line}`);
    return JSON.parse(value) as string;
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'") || value.length < 2) throw new Error(`mini-yaml: aspas sem fim na linha ${line}`);
    return value.slice(1, -1).replaceAll("''", "'");
  }
  if (value.startsWith('[')) {
    if (!value.endsWith(']')) throw new Error(`mini-yaml: lista sem fim na linha ${line}`);
    const inner = value.slice(1, -1).trim();
    return inner === '' ? [] : splitFlow(inner).map((item) => scalar(item, line));
  }
  if (value.startsWith('{')) {
    if (!value.endsWith('}')) throw new Error(`mini-yaml: mapa sem fim na linha ${line}`);
    const inner = value.slice(1, -1).trim();
    const out: Record<string, YamlValue> = {};
    if (inner === '') return out;
    for (const pair of splitFlow(inner)) {
      const at = keySplit(pair);
      if (!at) throw new Error(`mini-yaml: par sem chave na linha ${line}`);
      out[at.key] = scalar(at.rest, line);
    }
    return out;
  }
  if (/^[&*!]/.test(value)) throw new Error(`mini-yaml: âncora ou tag na linha ${line}`);
  return value;
}

function splitFlow(inner: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;
  for (let i = 0; i < inner.length; i++) {
    const char = inner[i];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '[' || char === '{') depth++;
    else if (char === ']' || char === '}') depth--;
    else if (char === ',' && depth === 0) {
      parts.push(inner.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(inner.slice(start).trim());
  return parts;
}

/** Splits `key: rest` (or `key:`) outside quotes; null when the text is not a mapping entry. */
function keySplit(text: string): { key: string; rest: string } | null {
  let quote: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quote) {
      if (char === quote) quote = null;
    } else if ((char === '"' || char === "'") && i === 0) quote = char;
    else if (char === ':' && (i === text.length - 1 || text[i + 1] === ' ')) {
      const rawKey = text.slice(0, i).trim();
      const key = rawKey.startsWith('"') || rawKey.startsWith("'") ? String(scalar(rawKey, 0)) : rawKey;
      return { key, rest: text.slice(i + 1).trim() };
    } else if (char === '[' || char === '{') {
      if (i === 0) return null;
    }
  }
  return null;
}

class Reader {
  constructor(private readonly lines: Line[]) {}

  private next(index: number): number {
    let i = index;
    while (i < this.lines.length && this.lines[i]!.text === '') i++;
    return i;
  }

  block(index: number, indent: number): [YamlValue, number] {
    const i = this.next(index);
    const line = this.lines[i];
    if (!line || line.indent < indent) return [null, i];
    if (line.text === '-' || line.text.startsWith('- ')) return this.sequence(i, line.indent);
    return this.mapping(i, line.indent);
  }

  private blockScalar(index: number, parentIndent: number, folded: boolean): [string, number] {
    const collected: string[] = [];
    let i = index;
    let base = -1;
    while (i < this.lines.length) {
      const line = this.lines[i]!;
      if (line.raw.trim() === '') {
        collected.push('');
        i++;
        continue;
      }
      if (line.indent <= parentIndent) break;
      if (base < 0) base = line.indent;
      collected.push(line.raw.slice(base));
      i++;
    }
    while (collected.length > 0 && collected[collected.length - 1] === '') collected.pop();
    const text = folded ? collected.join(' ') : collected.join('\n');
    return [`${text}\n`, i];
  }

  private value(rest: string, index: number, indent: number, number: number): [YamlValue, number] {
    if (/^[|>][-+]?$/.test(rest)) return this.blockScalar(index, indent, rest.startsWith('>'));
    if (rest !== '') return [scalar(rest, number), index];
    const i = this.next(index);
    const line = this.lines[i];
    if (line && line.indent > indent) return this.block(i, line.indent);
    if (line && line.indent === indent && (line.text === '-' || line.text.startsWith('- '))) return this.sequence(i, indent);
    return [null, i];
  }

  mapping(index: number, indent: number): [Record<string, YamlValue>, number] {
    const out: Record<string, YamlValue> = {};
    let i = this.next(index);
    while (i < this.lines.length) {
      const line = this.lines[i]!;
      if (line.indent < indent) break;
      if (line.indent > indent) throw new Error(`mini-yaml: recuo inesperado na linha ${line.number}`);
      if (line.text === '-' || line.text.startsWith('- ')) break;
      const entry = keySplit(line.text);
      if (!entry) throw new Error(`mini-yaml: esperava "chave:" na linha ${line.number}`);
      if (entry.key in out) throw new Error(`mini-yaml: chave repetida "${entry.key}" na linha ${line.number}`);
      const [value, after] = this.value(entry.rest, i + 1, indent, line.number);
      out[entry.key] = value;
      i = this.next(after);
    }
    return [out, i];
  }

  sequence(index: number, indent: number): [YamlValue[], number] {
    const out: YamlValue[] = [];
    let i = this.next(index);
    while (i < this.lines.length) {
      const line = this.lines[i]!;
      if (line.indent !== indent || !(line.text === '-' || line.text.startsWith('- '))) break;
      const rest = line.text === '-' ? '' : line.text.slice(2).trimStart();
      if (rest === '') {
        const [value, after] = this.value('', i + 1, indent, line.number);
        out.push(value);
        i = this.next(after);
        continue;
      }
      const inner = indent + (line.text.length - rest.length);
      if (keySplit(rest) && !rest.startsWith('[') && !rest.startsWith('{') && !rest.startsWith('"') && !rest.startsWith("'")) {
        // "- key: value" opens a mapping whose other keys sit at the column of "key".
        this.lines[i] = { ...line, indent: inner, text: rest };
        const [value, after] = this.mapping(i, inner);
        out.push(value);
        i = this.next(after);
      } else {
        out.push(scalar(rest, line.number));
        i = this.next(i + 1);
      }
    }
    return [out, i];
  }
}

export function parseYaml(source: string): YamlValue {
  const lines: Line[] = source.replaceAll('\r\n', '\n').split('\n').map((raw, i) => {
    if (raw.includes('\t') && raw.trimStart().startsWith('\t')) throw new Error(`mini-yaml: tabulação no recuo da linha ${i + 1}`);
    const indent = raw.length - raw.trimStart().length;
    const trimmed = raw.trim();
    const text = trimmed.startsWith('#') ? '' : stripComment(trimmed);
    return { indent, text, raw, number: i + 1 };
  });
  if (lines.some((line) => line.text === '---' || line.text === '...')) throw new Error('mini-yaml: mais de um documento');
  const reader = new Reader(lines);
  const [value, end] = reader.block(0, 0);
  const rest = lines.slice(end).find((line) => line.text !== '');
  if (rest) throw new Error(`mini-yaml: sobrou conteúdo na linha ${rest.number}`);
  return value;
}
