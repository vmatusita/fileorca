// The Product Hunt kit stays true (prompt F5b, decision 8; DECISOES § 191): docs/lancamento/product-hunt.md is read here.
//  - every product count it writes ("8 image tools", "12 PDF tools"…) equals the registries, so a run that adds a tool
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
];

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
    expect(countProblems(kit.replace(/\b12 PDF tools\b/, '13 PDF tools')).join()).toMatch(/"13 PDF tools": os registros dizem 12/);
    expect(countProblems(kit.replace('pdf-tools=12', 'pdf-tools=11')).join()).toMatch(/pdf-tools=11/);
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
