// The Product Hunt kit stays true (prompt F5b, decision 8; DECISOES § 191): docs/lancamento/product-hunt.md is read here.
//  - every product count it writes ("10 image tools", "12 PDF tools"…) equals the registries, so a run that adds a tool
//    or a guide (the 2b, a later one) fails here until the kit is updated;
//  - the name, the taglines, the descriptions and the first comment have the character counts the file states, inside
//    the limits read on the Product Hunt pages;
//  - each image the file lists exists with the size and weight it states, inside its limit, and with a caption;
//  - the images carry nothing of the machine that made them, and every technical claim names a test that exists.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { IMAGE_PRESET_IDS, IMAGE_TOOL_IDS } from '../../src/tools/image/registry.ts';
import { PDF_TOOL_IDS } from '../../src/tools/pdf/registry.ts';
import { CALC_TOOL_IDS, GUIDE_IDS } from '../../src/tools/calc/registry.ts';
import { FILE_GUIDE_IDS } from '../../src/tools/guides/registry.ts';
import { FORBIDDEN_WORDS, TOOL_NAME } from '../../scripts/lib/design-checks.ts';
import { pngChunks } from '../e2e/lib/png.ts';

const KIT = 'docs/lancamento/product-hunt.md';
const IMAGES = 'docs/lancamento/product-hunt';
const kit = readFileSync(KIT, 'utf8');

/** The counts of the product, from the registries. */
const COUNTS = {
  'image-tools': IMAGE_TOOL_IDS.length,
  'image-presets': IMAGE_PRESET_IDS.length,
  'pdf-tools': PDF_TOOL_IDS.length,
  calculators: CALC_TOOL_IDS.length,
  guides: GUIDE_IDS.length + FILE_GUIDE_IDS.length,
  /** Only the file guides have numbers measured on test files; the money guides' come from the engines (DECISOES § 204). */
  'file-guides': FILE_GUIDE_IDS.length,
  'money-guides': GUIDE_IDS.length,
};

/** Limits read on 2026-11-01 (the kit's table "Campos e limites"). */
const LIMITS = { name: 40, tagline: 60, description: 500, comment: 5000, thumbnailBytes: 2_000_000, galleryBytes: 3_000_000 };

/** The phrases of the kit that state a count, and the registry count each one must equal. */
const PHRASES: [RegExp, keyof typeof COUNTS][] = [
  [/\b(\d+) image tools\b/g, 'image-tools'],
  [/\b(\d+) presets\b/g, 'image-presets'],
  [/\b(\d+) PDF tools\b/g, 'pdf-tools'],
  [/\b(\d+) money calculators\b/g, 'calculators'],
  [/\b(\d+) guides\b/g, 'guides'],
  [/\b(\d+) file guides\b/g, 'file-guides'],
  [/\b(\d+) money guides\b/g, 'money-guides'],
];

// ---- what the English texts may claim (DECISOES § 204 and § 205) ---------------------------------------------------

/** The texts of the kit that go out in English: the code blocks, the taglines, the suggested answers and the captions. */
function englishOf(text: string): string[] {
  const out = [...text.matchAll(/```\n([\s\S]*?)\n```/g)].map((match) => match[1] as string);
  out.push(...[...text.matchAll(/^- \*\*\(\d+\)\*\* `([^`]+)`$/gm)].map((match) => match[1] as string));
  const questions = text.slice(text.indexOf('## Perguntas prováveis'), text.indexOf('## Imagens'));
  for (const line of questions.matchAll(/^- \*\*"[^"]+"\*\* (.*)$/gm)) out.push(...[...(line[1] as string).matchAll(/"([^"]+)"/g)].map((match) => match[1] as string));
  out.push(...[...text.matchAll(/Caption: "([^"]+)"/g)].map((match) => match[1] as string));
  return out;
}

const sentencesOf = (texts: readonly string[]): string[] => texts.flatMap((text) => text.split(/(?<=[.!?])\s+|\n+/)).map((sentence) => sentence.trim()).filter(Boolean);

/** The claims of the section "Provas": the quoted phrases of each item's heading, with the files the item cites. */
function proofsOf(text: string): { claims: string[]; files: string[] }[] {
  const section = text.slice(text.indexOf('## Provas'), text.indexOf('## O que ficou fora'));
  return section.split(/\n(?=\d+\. \*\*)/).slice(1).map((item) => ({
    claims: [...(/^\d+\. \*\*(.+?)\*\*/.exec(item)?.[1] ?? '').matchAll(/"([^"]+)"/g)].map((match) => (match[1] as string).replace(/[.,]$/, '')),
    files: [...item.matchAll(/`((?:tests|src|scripts)\/[\w./-]+\.ts|playwright\.config\.ts)`/g)].map((match) => match[1] as string),
  }));
}

/**
 * A sentence that makes a technical promise: where the file goes, offline, browsers, ads, analytics, account, batches,
 * and what a device can take (memory, an older phone: DECISOES § 211).
 */
const TECHNICAL = /\bupload\w*|\boffline\b|\bin your browser\b|\bon your device\b|\bnever leaves\b|\bnever sent\b|\bnot sent\b|\bAdSense\b|\bads?\b|\bAnalytics\b|\bConsent Mode\b|\bcookies?\b|\baccount\b|\bsign-up\b|\bZIP\b|Ctrl\+V|\bWebAssembly\b|\bNetwork tab\b|\bno request\b|\bChromium\b|\bWebKit\b|\bKo-fi\b|\bmemory\b|\bolder (?:phones?|devices?|computers?)\b|\btoo much for\b/i;
/** Part of the measured PDFs was written by the test script: they are test files, not "real test files" (§ 211). */
const REAL_TEST_FILES = /\breal test files?\b/i;
/** The engines the tests run: the projects of playwright.config.ts. Naming another browser claims a test nobody ran. */
const BROWSER_NAMES = /\b(?:Chromium|WebKit|Chrome|Edge|Firefox|Safari|Opera|Brave|Vivaldi|Samsung Internet)\b/g;
const TESTED = [...readFileSync('playwright.config.ts', 'utf8').matchAll(/name: '(\w+)'/g)].map((match) => (match[1] as string).toLowerCase());

function claimProblems(text: string): string[] {
  const problems: string[] = [];
  const proven = proofsOf(text).filter((proof) => proof.files.length > 0 && proof.files.every((file) => existsSync(file))).flatMap((proof) => proof.claims.map((claim) => claim.toLowerCase()));
  const english = englishOf(text);
  for (const sentence of sentencesOf(english)) {
    const lower = sentence.toLowerCase();
    if (TECHNICAL.test(sentence) && !proven.some((claim) => lower.includes(claim))) problems.push(`"${sentence}": afirmação técnica sem prova na seção Provas`);
    if (/\boffline\b/i.test(sentence) && !/\bcodec\b/i.test(sentence)) problems.push(`"${sentence}": offline só depois que a página e o codec carregam (show-hn.md)`);
    for (const name of sentence.match(BROWSER_NAMES) ?? []) if (!TESTED.includes(name.toLowerCase())) problems.push(`"${sentence}": ${name} não é um motor que os testes rodam (${TESTED.join(', ')})`);
    if (/\b(?:most|many|other) (?:sites|tools|services|apps)\b/i.test(sentence)) problems.push(`"${sentence}": fala de outros sites sem prova`);
    const word = FORBIDDEN_WORDS.exec(sentence.replace(TOOL_NAME, ''))?.[0];
    if (word) problems.push(`"${sentence}": "${word}" é palavra proibida (só o nome "Unlock PDF", § 153)`);
  }
  for (const sentence of [...sentencesOf(english), ...proofsOf(text).flatMap((proof) => proof.claims)]) {
    problems.push(...measuredProblems(sentence));
    if (REAL_TEST_FILES.test(sentence)) problems.push(`"${sentence}": parte dos arquivos medidos foi escrita pelo script de teste; diga "our test files"`);
  }
  return problems;
}

/** "measured" goes with the file guides only: the nearest count before it is theirs, or the sentence says "file guides". */
function measuredProblems(sentence: string): string[] {
  const at = sentence.toLowerCase().search(/\bmeasured\b/);
  if (at < 0) return [];
  const last = [...sentence.slice(0, at).matchAll(/\b(\d+)\b/g)].at(-1)?.[1];
  const ok = last ? Number(last) === COUNTS['file-guides'] : /\bfile guides?\b/i.test(sentence.slice(0, at));
  return ok ? [] : [`"${sentence}": "measured" vale só para os ${COUNTS['file-guides']} guias de arquivo`];
}

function countProblems(text: string): string[] {
  const problems: string[] = [];
  const prose = text.replace(/<!-- contagens: .*? -->/, '');
  for (const [pattern, key] of PHRASES) {
    for (const match of prose.matchAll(pattern)) {
      const stated = Number(match[1]);
      if (stated !== COUNTS[key]) problems.push(`"${match[0]}": os registros dizem ${COUNTS[key]}`);
    }
  }
  const marker = /<!-- contagens: (.*?) -->/.exec(text)?.[1];
  if (!marker) problems.push('sem a linha <!-- contagens: … -->');
  for (const pair of (marker ?? '').split(/\s+/).filter(Boolean)) {
    const [key, value] = pair.split('=') as [keyof typeof COUNTS, string];
    if (!(key in COUNTS)) problems.push(`contagem desconhecida: ${key}`);
    else if (Number(value) !== COUNTS[key]) problems.push(`contagens: ${key}=${value}, os registros dizem ${COUNTS[key]}`);
  }
  return problems;
}

/** A block of the kit stated as "**Label (N caracteres):**" followed by a code block or an inline code. */
function stated(label: string): { count: number; text: string }[] {
  const out: { count: number; text: string }[] = [];
  const block = new RegExp(`\\*\\*${label} \\((\\d+) caracteres\\):\\*\\*\\s*\\n\\n\`\`\`\\n([\\s\\S]*?)\\n\`\`\``, 'g');
  for (const match of kit.matchAll(block)) out.push({ count: Number(match[1]), text: match[2] as string });
  const inline = new RegExp(`\\*\\*${label} \\((\\d+) caracteres\\):\\*\\* \`([^\`]+)\``, 'g');
  for (const match of kit.matchAll(inline)) out.push({ count: Number(match[1]), text: match[2] as string });
  return out;
}

describe('the counts of the Product Hunt kit', () => {
  it('equal the registries, in every phrase and in the counts line', () => {
    expect(countProblems(kit)).toEqual([]);
    // The phrases are there: a kit that stopped stating a count would pass the check above without proving anything.
    for (const [pattern] of PHRASES) expect([...kit.matchAll(pattern)].length, String(pattern)).toBeGreaterThan(0);
  });

  it('fail when a registry and the kit disagree (control)', () => {
    // F18 (DECISOES § 740): the control follows the registry, so a run that adds a PDF tool does not have to rewrite it.
    const pdf = PDF_TOOL_IDS.length;
    expect(countProblems(kit.replace(new RegExp(`\\b${pdf} PDF tools\\b`), `${pdf + 1} PDF tools`)).join()).toMatch(new RegExp(`"${pdf + 1} PDF tools": os registros dizem ${pdf}`));
    expect(countProblems(kit.replace(`pdf-tools=${pdf}`, `pdf-tools=${pdf - 1}`)).join()).toMatch(new RegExp(`pdf-tools=${pdf - 1}`));
  });
});

describe('the texts of the Product Hunt kit', () => {
  it('state the right character counts, inside the limits read on Product Hunt', () => {
    const name = stated('Nome');
    expect(name).toHaveLength(1);
    const taglines = [...kit.matchAll(/^- \*\*\((\d+)\)\*\* `([^`]+)`$/gm)].map((match) => ({ count: Number(match[1]), text: match[2] as string }));
    expect(taglines, 'three taglines').toHaveLength(3);
    const descriptions = stated('Descrição [AB]');
    expect(descriptions, 'two descriptions').toHaveLength(2);
    const comment = stated('Primeiro comentário');
    expect(comment).toHaveLength(1);
    for (const [items, limit] of [[name, LIMITS.name], [taglines, LIMITS.tagline], [descriptions, LIMITS.description], [comment, LIMITS.comment]] as const) {
      for (const item of items) {
        expect(item.text.length, `"${item.text.slice(0, 40)}…" says ${item.count}`).toBe(item.count);
        expect(item.text.length, `"${item.text.slice(0, 40)}…" over ${limit}`).toBeLessThanOrEqual(limit);
      }
    }
  });

  it('name a test that exists for every proof', () => {
    const proofs = kit.slice(kit.indexOf('## Provas'), kit.indexOf('## O que ficou fora'));
    const files = [...proofs.matchAll(/`((?:tests|src|scripts)\/[\w./-]+\.ts|playwright\.config\.ts)`/g)].map((match) => match[1] as string);
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) expect(existsSync(file), file).toBe(true);
  });

  it('tie every technical sentence in English to a proof, and claim only what the proofs cover (DECISOES § 204 and § 205)', () => {
    expect(englishOf(kit).length, 'the English texts are found').toBeGreaterThan(10);
    expect(proofsOf(kit).flatMap((proof) => proof.claims).length, 'the claims of the proofs are found').toBeGreaterThan(10);
    expect(TESTED).toEqual(['chromium', 'webkit']);
    expect(claimProblems(kit)).toEqual([]);
  });

  it('fail an answer with no proof, an untested browser, offline without the codec, a loose "unlock" and "measured" on all guides (controls)', () => {
    const answer = (text: string): string => kit.replace(/(- \*\*"How do you make money\?"\*\* )"[^"]+"/, `$1"${text}"`);
    expect(claimProblems(answer('Ads never show next to a download.')).join()).toMatch(/Ads never show next to a download\.": afirmação técnica sem prova/);
    expect(claimProblems(answer('Every tool is tested automatically in Chromium and in WebKit. Use a current Chrome, Edge, Firefox or Safari.')).join()).toMatch(/Chrome não é um motor.*Firefox não é um motor/);
    expect(claimProblems(answer('Once a tool has loaded, it keeps working if you go offline.')).join()).toMatch(/offline só depois que a página e o codec carregam/);
    expect(claimProblems(answer('There is no account. You can protect, unlock and watermark PDFs.')).join()).toMatch(/"unlock" é palavra proibida/);
    expect(claimProblems(answer('There is no account. Unlock PDF removes a password.'))).toEqual([]);
    expect(claimProblems(answer('There is no account, and most sites want you to upload it first.')).join()).toMatch(/fala de outros sites/);
    expect(measuredProblems('plus 15 guides whose numbers were measured on real test files')).toHaveLength(1);
    expect(measuredProblems('15 guides with measured numbers')).toHaveLength(1);
    expect(measuredProblems(`15 guides, ${COUNTS['file-guides']} of them with numbers measured on real test files`)).toEqual([]);
    expect(measuredProblems('File guides with numbers measured on real files')).toEqual([]);
    expect(claimProblems(answer('There is no account, and 10 of them have numbers measured on real test files.')).join()).toMatch(/diga "our test files"/);
    expect(claimProblems(answer('A very long PDF can be too much for the memory of an older phone.')).join()).toMatch(/memory of an older phone\.": afirmação técnica sem prova/);
    expect(claimProblems(answer('I have not tested the largest file each phone can open, so tell me if one fails.'))).toEqual([]);
    expect(measuredProblems('Guides with numbers measured on real files')).toHaveLength(1);
    // A proof whose test file does not exist proves nothing.
    expect(claimProblems(kit.replace('`tests/e2e/consent.spec.ts`', '`tests/e2e/no-such.spec.ts`')).join()).toMatch(/Google Analytics with Consent Mode.*afirmação técnica sem prova/);
  });

  it('say no forbidden word, no "fastest", "best" or "#1" in the English texts', () => {
    const english = [...kit.matchAll(/```\n([\s\S]*?)\n```/g)].map((match) => match[1] as string).join('\n') + [...kit.matchAll(/^- \*\*\(\d+\)\*\* `([^`]+)`$/gm)].map((match) => match[1]).join('\n');
    expect(english).not.toMatch(/\b(?:seamless|effortless|supercharge|magic|ai-powered|revolutionary|best-in-class|fastest|best)\b|#1/i);
    expect(english, 'never asks for a vote').not.toMatch(/\bupvote\b|\bvote for\b|\bsupport us\b/i);
  });
});

interface Listed {
  file: string;
  width: number;
  height: number;
  bytes: number;
  alt: string;
}

function listed(): Listed[] {
  const table = kit.slice(kit.indexOf('<!-- imagens:'), kit.indexOf('<!-- fim das imagens -->'));
  return [...table.matchAll(/^\| `([\w.-]+)` \| [^|]+ \| (\d+) × (\d+) \| ([\d.]+) bytes \| (.+) \|$/gm)].map((match) => ({
    file: match[1] as string,
    width: Number(match[2]),
    height: Number(match[3]),
    bytes: Number((match[4] as string).replaceAll('.', '')),
    alt: (match[5] as string).trim(),
  }));
}

function sizeOf(bytes: Uint8Array): { width: number; height: number } {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (String.fromCharCode(...bytes.subarray(0, 3)) === 'GIF') return { width: (bytes[6] ?? 0) | ((bytes[7] ?? 0) << 8), height: (bytes[8] ?? 0) | ((bytes[9] ?? 0) << 8) };
  throw new Error('not a PNG or a GIF');
}

/**
 * The GIF's extensions other than the graphic control (0xF9) of each frame and the NETSCAPE2.0 loop, walking the blocks
 * of the file (a byte search would find 0x21 0xFE inside the compressed pixels).
 */
function gifExtras(bytes: Uint8Array): string[] {
  const extras: string[] = [];
  const skipSubBlocks = (at: number): number => {
    let i = at;
    while ((bytes[i] ?? 0) !== 0) i += (bytes[i] ?? 0) + 1;
    return i + 1;
  };
  const packed = bytes[10] ?? 0;
  let i = 13 + (packed & 0x80 ? 3 * 2 ** ((packed & 0x07) + 1) : 0);
  while (i < bytes.length) {
    const block = bytes[i];
    if (block === 0x3b) break;
    if (block === 0x2c) {
      const local = bytes[i + 9] ?? 0;
      i += 10 + (local & 0x80 ? 3 * 2 ** ((local & 0x07) + 1) : 0);
      i = skipSubBlocks(i + 1);
    } else if (block === 0x21) {
      const label = bytes[i + 1];
      const app = String.fromCharCode(...bytes.subarray(i + 3, i + 14));
      if (label === 0xfe) extras.push('comment');
      else if (label === 0xff && app !== 'NETSCAPE2.0') extras.push(`application ${app}`);
      else if (label !== 0xf9 && label !== 0xff) extras.push(`extension 0x${(label ?? 0).toString(16)}`);
      i = skipSubBlocks(i + 2);
    } else {
      extras.push(`unknown block 0x${(block ?? 0).toString(16)}`);
      break;
    }
  }
  return extras;
}

describe('the images of the Product Hunt kit', () => {
  const rows = listed();

  it('are the thumbnail (PNG and GIF) and three to six gallery images', () => {
    expect(rows.map((row) => row.file).filter((file) => file.startsWith('thumbnail.'))).toEqual(['thumbnail.png', 'thumbnail.gif']);
    const gallery = rows.filter((row) => row.file.startsWith('gallery-'));
    expect(gallery.length).toBeGreaterThanOrEqual(3);
    expect(gallery.length).toBeLessThanOrEqual(6);
  });

  it('exist with the size and weight the kit states, inside the limits, each with a caption', () => {
    for (const row of rows) {
      const path = `${IMAGES}/${row.file}`;
      expect(existsSync(path), path).toBe(true);
      const bytes = new Uint8Array(readFileSync(path));
      expect(bytes.length, `${row.file}: weight`).toBe(row.bytes);
      expect(sizeOf(bytes), `${row.file}: size`).toEqual({ width: row.width, height: row.height });
      const thumbnail = row.file.startsWith('thumbnail.');
      expect({ width: row.width, height: row.height }).toEqual(thumbnail ? { width: 240, height: 240 } : { width: 1270, height: 760 });
      expect(bytes.length, `${row.file}: limit`).toBeLessThanOrEqual(thumbnail ? LIMITS.thumbnailBytes : LIMITS.galleryBytes);
      expect(row.alt.length, `${row.file}: caption`).toBeGreaterThan(20);
    }
  });

  it('carry nothing of the machine that made them: PNG image chunks only, GIF frames and loop only', () => {
    for (const row of rows) {
      const bytes = new Uint8Array(readFileSync(`${IMAGES}/${row.file}`));
      if (row.file.endsWith('.png')) {
        for (const chunk of pngChunks(bytes)) expect(['IHDR', 'PLTE', 'tRNS', 'IDAT', 'IEND', 'sRGB', 'gAMA', 'cHRM', 'pHYs'], `${row.file}: ${chunk.type}`).toContain(chunk.type);
      } else {
        expect(gifExtras(bytes), row.file).toEqual([]);
      }
    }
  });
});
