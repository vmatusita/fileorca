// Protect PDF and Unlock PDF on the engine, in Node (F5a, criterion 5; plan section 9). What reads the outputs is not the
// engine: qpdf --show-encryption and --check from a separate instance (scripts/lib/qpdf.ts) and PDF.js
// (tests/e2e/lib/pdfjs-read.ts); the passwords of the three encrypted fixtures are the ones scripts/fixtures/pdf.ts
// wrote them with, and the reason each fixture must give comes from the oracle fixtures/pdf/expected.json.
//
//  - Protect gives revision 6 with AES-256 (AESv3) on every file it takes, with no permission restricted; PDF.js opens
//    the result only with the password; the password is nowhere in the bytes;
//  - Unlock takes the three encrypted fixtures to a file with no /Encrypt that opens without a password; a wrong
//    password gives "wrong-password" as many times as it is tried and the right one still works after it; the file with
//    only an owner password unlocks without asking for anything;
//  - every fixture gives the reason of the oracle in every tool that refuses it;
//  - the password never reaches the console or the exit status of the process.
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { lockOf } from '../../src/engine/pdf/qpdf.ts';
import { processPdf } from '../../src/engine/pdf/process.ts';
import type { PdfOperation, PdfResult, PdfSuccess } from '../../src/engine/pdf/types.ts';
import { opensWithoutPassword, readWithPdfjs } from '../e2e/lib/pdfjs-read.ts';
import { qpdf, qpdfCheck, qpdfEncryption } from '../../scripts/lib/qpdf.ts';
import { PASSWORDS } from '../../scripts/fixtures/pdf.ts';
import { ORACLE, fixture, nodeRenderer, oracle, useNodeAssets } from './lib/pdf-engine.ts';

beforeAll(() => useNodeAssets());

const SENTINEL = 'Orca-Sentinel-7391-Kq';
const NAMES = Object.keys(ORACLE.files);
/** The files every tool takes (the repaired one is processed, with a note). */
const TAKEN = NAMES.filter((name) => ['ok', 'repaired'].includes(oracle(name).expect));
/** Small enough for PDF.js to read every page of the result; the big ones are checked by qpdf and by PDF.js refusing them. */
const SMALL = TAKEN.filter((name) => (oracle(name).pages ?? 0) <= 12);
const LOCKED = [
  { name: 'gen-cifrado-aes256.pdf', password: PASSWORDS.aes256, owner: PASSWORDS.aes256Owner, method: 'AESv3', revision: 6 },
  { name: 'gen-cifrado-rc4-128.pdf', password: PASSWORDS.rc4, owner: PASSWORDS.rc4Owner, method: 'RC4', revision: 3 },
] as const;

const run = (op: PdfOperation, name: string): Promise<PdfResult> => processPdf(op, [fixture(name)], nodeRenderer());

function succeeded(result: PdfResult, what: string): PdfSuccess {
  if (!result.ok) throw new Error(`${what}: refused as ${result.reason}`);
  return result;
}

const latin1 = (bytes: Uint8Array): string => Buffer.from(bytes).toString('latin1');
const textsOf = (read: Awaited<ReturnType<typeof readWithPdfjs>>): string[][] => read.pages.map((page) => page.texts.map((text) => text.str));

/** Every way a password could sit in a file as text: Latin-1 or UTF-8 bytes, UTF-16, and as a hexadecimal string. */
function spellings(password: string): Buffer[] {
  const utf8 = Buffer.from(password, 'utf8');
  const utf16le = Buffer.from(password, 'utf16le');
  const utf16be = Buffer.from(utf16le).swap16();
  return [Buffer.from(password, 'latin1'), utf8, utf16le, utf16be, Buffer.from(utf8.toString('hex'), 'latin1'), Buffer.from(utf8.toString('hex').toUpperCase(), 'latin1'), Buffer.from(utf16be.toString('hex').toUpperCase(), 'latin1')];
}

describe('Protect PDF', () => {
  for (const name of TAKEN) {
    it(`${name}: revision 6 with AESv3, nothing restricted, opens only with the password, which is not in the bytes`, async () => {
      const done = succeeded(await run({ kind: 'protect', password: SENTINEL }, name), name);
      expect(done.outputs).toHaveLength(1);
      const out = done.outputs[0]?.bytes as Uint8Array;

      const shown = await qpdfEncryption(out, SENTINEL);
      expect(shown.out, name).toEqual(expect.arrayContaining(['R = 6', 'stream encryption method: AESv3', 'string encryption method: AESv3', 'file encryption method: AESv3']));
      // Opened with the one password, qpdf says it is the user password and the owner password: the same word does both.
      expect(shown.out, `${name}: the password opens and owns`).toEqual(expect.arrayContaining(['Supplied password is user password', 'Supplied password is owner password']));
      const permissions = shown.out.filter((line) => /: (allowed|not allowed)$/.test(line));
      expect(permissions.length, `${name}: the permissions qpdf lists`).toBeGreaterThanOrEqual(9);
      expect(permissions.filter((line) => /not allowed/.test(line)), `${name}: no permission is withheld`).toEqual([]);

      // Without it, or with another, qpdf and PDF.js both say no.
      expect((await qpdfCheck(out)).code, `${name}: qpdf without the password`).toBe(2);
      expect((await qpdfCheck(out, 'not-the-password')).code, `${name}: qpdf with another one`).toBe(2);
      expect(await opensWithoutPassword(out), `${name}: PDF.js without the password`).toBe(false);
      await expect(readWithPdfjs(out, 'not-the-password'), `${name}: PDF.js with another one`).rejects.toMatchObject({ name: 'PasswordException' });

      // With it, the same pages as before.
      const check = await qpdfCheck(out, SENTINEL);
      expect(check.code, `${name}: qpdf --check with the password: ${check.out.join(' | ')}`).toBe(0);
      const count = await qpdf(['--show-npages', `--password=${SENTINEL}`, '/in/file.pdf'], { 'file.pdf': out });
      expect(count.out, `${name}: pages`).toEqual([String(oracle(name).pages)]);
      if (SMALL.includes(name)) {
        const read = await readWithPdfjs(out, SENTINEL);
        expect(read.pages.map((page) => page.marker), `${name}: markers`).toEqual(oracle(name).markers);
      }

      // The password is not stored anywhere in the file: R6 keeps salted hashes of it.
      for (const spelling of spellings(SENTINEL)) expect(Buffer.from(out).includes(spelling), `${name}: ${spelling.subarray(0, 12).toString('latin1')}...`).toBe(false);
    }, 120_000);
  }

  it('the search for the password finds it in every spelling, so not finding it in the output means something', () => {
    for (const spelling of spellings(SENTINEL)) expect(Buffer.concat([Buffer.from('stream\n'), spelling, Buffer.from('\nendstream')]).includes(spelling)).toBe(true);
    // For a text this plain, Latin-1 and UTF-8 are the same bytes; UTF-16 both ways and the hexadecimal forms are not.
    expect(new Set(spellings(SENTINEL).map((spelling) => spelling.toString('hex'))).size).toBe(6);
  });

  it('takes a password with accents and one of 100 characters, and PDF.js, qpdf and Unlock open the result with it', async () => {
    for (const password of ['Señha-ção-Ω7-ñ', 'k'.repeat(100), 'ab12']) {
      const done = succeeded(await run({ kind: 'protect', password }, 'gen-paginas-mistas.pdf'), password);
      const out = done.outputs[0]?.bytes as Uint8Array;
      expect((await qpdfCheck(out, password)).code, `qpdf: ${password.slice(0, 12)}`).toBe(0);
      expect((await readWithPdfjs(out, password)).pages, `PDF.js: ${password.slice(0, 12)}`).toHaveLength(8);
      const back = succeeded(await processPdf({ kind: 'unlock', password }, [out], null), `unlock ${password.slice(0, 12)}`);
      expect(latin1(back.outputs[0]?.bytes as Uint8Array)).not.toMatch(/\/Encrypt\b/);
    }
  });

  it('refuses a locked file, an empty password and everything broken, and says which it was', async () => {
    expect(await run({ kind: 'protect', password: SENTINEL }, 'gen-cifrado-aes256.pdf')).toMatchObject({ ok: false, reason: 'needs-password' });
    expect(await run({ kind: 'protect', password: SENTINEL }, 'gen-cifrado-dono.pdf')).toMatchObject({ ok: false, reason: 'restricted' });
    expect(await run({ kind: 'protect', password: '' }, 'gen-paginas-mistas.pdf')).toMatchObject({ ok: false });
  });

  it('protects the file whose index pdf-lib had to rebuild, and says it repaired it', async () => {
    const done = succeeded(await run({ kind: 'protect', password: SENTINEL }, 'gen-xref-estragada.pdf'), 'gen-xref-estragada.pdf');
    expect(done.notes).toContain('repaired');
    expect((await qpdfCheck(done.outputs[0]?.bytes as Uint8Array, SENTINEL)).code).toBe(0);
  });
});

describe('Unlock PDF', () => {
  for (const { name, password, owner, method, revision } of LOCKED) {
    it(`${name}: no /Encrypt left, opens without a password, the pages as PDF.js reads them with the password`, async () => {
      const done = succeeded(await run({ kind: 'unlock', password }, name), name);
      const out = done.outputs[0]?.bytes as Uint8Array;
      expect(latin1(fixture(name)), `${name}: the locked original does have an /Encrypt (the search below can find one)`).toMatch(/\/Encrypt\b/);
      expect(latin1(out), `${name}: no /Encrypt`).not.toMatch(/\/Encrypt\b/);
      expect((await qpdfEncryption(out)).out, `${name}: qpdf says it is not encrypted`).toEqual(['File is not encrypted']);
      expect(await opensWithoutPassword(out), `${name}: PDF.js opens it as it is`).toBe(true);
      const check = await qpdfCheck(out);
      expect(check.code, `${name}: qpdf --check ${check.out.join(' | ')}`).toBe(0);

      // The same file as the locked one (revision and method from the oracle), read by PDF.js with the password.
      expect(oracle(name).encryption).toMatchObject({ R: revision, method, password });
      const locked = await readWithPdfjs(fixture(name), password);
      const unlocked = await readWithPdfjs(out);
      expect(unlocked.pages.map((page) => page.marker)).toEqual(oracle(name).markers);
      expect(textsOf(unlocked), `${name}: the text of every page`).toEqual(textsOf(locked));
      expect(unlocked.pages.map((page) => page.shown), `${name}: the size of every page`).toEqual(locked.pages.map((page) => page.shown));
      // The owner password of a file opens it too, as in qpdf and PDF.js.
      expect(succeeded(await run({ kind: 'unlock', password: owner }, name), `${name} with the owner password`).outputs).toHaveLength(1);
    });

    it(`${name}: asks for the password, says when it is wrong however many times, and the right one still works`, async () => {
      expect(await run({ kind: 'unlock', password: null }, name)).toMatchObject({ ok: false, reason: 'needs-password' });
      for (let attempt = 1; attempt <= 5; attempt += 1) {
        const wrong = await run({ kind: 'unlock', password: `not-it-${attempt}` }, name);
        expect(wrong, `${name}: wrong try ${attempt}`).toMatchObject({ ok: false, reason: 'wrong-password' });
        expect(JSON.stringify(wrong), 'the failure carries no password').not.toContain(`not-it-${attempt}`);
      }
      const right = succeeded(await run({ kind: 'unlock', password }, name), `${name} after five wrong tries`);
      expect(latin1(right.outputs[0]?.bytes as Uint8Array)).not.toMatch(/\/Encrypt\b/);
    });
  }

  it('unlocks the file with only an owner password without asking for anything, and ignores a password nobody needs', async () => {
    const name = 'gen-cifrado-dono.pdf';
    expect(await lockOf(fixture(name))).toBe('restricted');
    for (const password of [null, 'a-password-it-does-not-need']) {
      const done = succeeded(await run({ kind: 'unlock', password }, name), name);
      const out = done.outputs[0]?.bytes as Uint8Array;
      expect(latin1(out), `${name}: no /Encrypt`).not.toMatch(/\/Encrypt\b/);
      expect((await qpdfEncryption(out)).out).toEqual(['File is not encrypted']);
      expect(await opensWithoutPassword(out)).toBe(true);
      const check = await qpdfCheck(out);
      expect(check.code, check.out.join(' | ')).toBe(0);
      expect((await readWithPdfjs(out)).pages.map((page) => page.marker)).toEqual(oracle(name).markers);
    }
    // The restrictions were really there before: qpdf lists the permissions the file withheld.
    const before = (await qpdfEncryption(fixture(name))).out;
    expect(before.filter((line) => /not allowed/.test(line)).length).toBeGreaterThanOrEqual(6);
  });

  it('gives a file that is not locked its own reason', async () => {
    expect(await run({ kind: 'unlock', password: null }, 'gen-paginas-mistas.pdf')).toMatchObject({ ok: false, reason: 'not-encrypted' });
    expect(await run({ kind: 'unlock', password: 'x' }, 'gen-xref-estragada.pdf')).toMatchObject({ ok: false, reason: 'not-encrypted' });
  });

  it('takes back what Protect locked: the same pages, no /Encrypt', async () => {
    const protectedFile = succeeded(await run({ kind: 'protect', password: SENTINEL }, 'pdf-formulario-irs-1040-2019.pdf'), 'protect').outputs[0]?.bytes as Uint8Array;
    expect(await processPdf({ kind: 'unlock', password: 'not-it' }, [protectedFile], null)).toMatchObject({ ok: false, reason: 'wrong-password' });
    const back = succeeded(await processPdf({ kind: 'unlock', password: SENTINEL }, [protectedFile], null), 'unlock').outputs[0]?.bytes as Uint8Array;
    expect(latin1(back)).not.toMatch(/\/Encrypt\b/);
    const original = await readWithPdfjs(fixture('pdf-formulario-irs-1040-2019.pdf'));
    const again = await readWithPdfjs(back);
    expect(again.pages.map((page) => [page.shown, page.widgets])).toEqual(original.pages.map((page) => [page.shown, page.widgets]));
  }, 120_000);
});

describe('the reason each fixture gives', () => {
  it('qpdf tells a password from owner restrictions, and a plain file from both', async () => {
    expect(await lockOf(fixture('gen-cifrado-aes256.pdf'))).toBe('password');
    expect(await lockOf(fixture('gen-cifrado-rc4-128.pdf'))).toBe('password');
    expect(await lockOf(fixture('gen-cifrado-dono.pdf'))).toBe('restricted');
    expect(await lockOf(fixture('gen-paginas-mistas.pdf'))).toBe('none');
    expect(await lockOf(fixture('pdf-formulario-irs-1040-2019.pdf'))).toBe('none');
  });

  // Each tool that takes one file or a list, with a request that needs nothing but the file. The ones that take the file
  // as it is must give the reason of the oracle for every fixture that is locked or broken.
  const REFUSING: [string, PdfOperation][] = [
    ['merge', { kind: 'merge' }],
    ['split', { kind: 'split', parts: [[0]] }],
    ['delete', { kind: 'delete', remove: [0] }],
    ['reorder', { kind: 'reorder', order: [0] }],
    ['organize', { kind: 'organize', pages: [{ index: 0, turn: 1 }] }],
    ['rotate', { kind: 'rotate', all: 1, pages: {} }],
    ['numbers', { kind: 'numbers', position: 'bottom-center', format: 'n', start: 1, skipFirst: false }],
    ['watermark', { kind: 'watermark', text: 'Draft', size: 'medium', opacity: 'light', direction: 'diagonal' }],
    ['sign', { kind: 'sign', image: new Uint8Array(0), pages: [0], box: { x: 0.1, y: 0.1, width: 0.2 } }],
    ['compress', { kind: 'compress', mode: 'lossless' }],
    ['protect', { kind: 'protect', password: SENTINEL }],
  ];
  const NOT_TAKEN = NAMES.filter((name) => !TAKEN.includes(name));

  for (const name of NOT_TAKEN) {
    it(`${name} is refused as "${oracle(name).expect}" by every tool that takes a file as it is`, async () => {
      for (const [tool, op] of REFUSING) {
        const result = await run(op, name);
        expect(result, `${name} in ${tool}`).toMatchObject({ ok: false, reason: oracle(name).expect });
      }
      // PDF to JPG draws what the owner restricted; everything else it refuses with the same reason.
      const images = await run({ kind: 'images', format: 'jpeg', ppi: 72, pages: [0] }, name);
      if (oracle(name).expect === 'restricted') expect(images, `${name} in PDF to JPG`).toMatchObject({ ok: true });
      else expect(images, `${name} in PDF to JPG`).toMatchObject({ ok: false, reason: oracle(name).expect });
    });
  }

  it('says what a file named .pdf really is, for the line of its row', async () => {
    expect(await run({ kind: 'merge' }, 'gen-jpg-extensao-pdf.pdf')).toMatchObject({ ok: false, reason: 'not-pdf', source: 'jpeg' });
    expect(await run({ kind: 'merge' }, 'gen-texto-extensao-pdf.pdf')).toMatchObject({ ok: false, reason: 'not-pdf', source: 'text' });
  });

  it('Unlock gives one of five answers on every fixture, the one the oracle implies', async () => {
    for (const name of NAMES) {
      const expected = oracle(name).expect;
      const result = await run({ kind: 'unlock', password: null }, name);
      if (expected === 'restricted') expect(result, name).toMatchObject({ ok: true });
      else if (expected === 'ok' || expected === 'repaired') expect(result, name).toMatchObject({ ok: false, reason: 'not-encrypted' });
      else expect(result, name).toMatchObject({ ok: false, reason: expected });
    }
  }, 120_000);
});

describe('the password stays in the engine', () => {
  const spies: ReturnType<typeof vi.spyOn>[] = [];
  afterEach(() => {
    for (const spy of spies.splice(0)) spy.mockRestore();
  });

  it('never goes to the console or to the output of the process, and qpdf leaves the exit status of the process alone', async () => {
    const seen: string[] = [];
    const record = (...parts: unknown[]): void => void seen.push(parts.map(String).join(' '));
    for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) spies.push(vi.spyOn(console, method).mockImplementation(record));
    spies.push(vi.spyOn(process.stdout, 'write').mockImplementation(((chunk: unknown) => (record(String(chunk)), true)) as never));
    spies.push(vi.spyOn(process.stderr, 'write').mockImplementation(((chunk: unknown) => (record(String(chunk)), true)) as never));
    // The control: the listeners hear every way a line can leave the process, so hearing nothing below means something.
    console.error('control');
    console.log('control');
    process.stdout.write('control\n');
    process.stderr.write('control\n');
    expect(seen).toHaveLength(4);
    seen.length = 0;
    const exitCode = process.exitCode;

    const locked = succeeded(await run({ kind: 'protect', password: SENTINEL }, 'gen-paginas-mistas.pdf'), 'protect').outputs[0]?.bytes as Uint8Array;
    // A wrong password makes qpdf say "invalid password" and exit with 2; the right one makes it decrypt.
    expect(await processPdf({ kind: 'unlock', password: `${SENTINEL}-wrong` }, [locked], null)).toMatchObject({ ok: false, reason: 'wrong-password' });
    expect(await processPdf({ kind: 'unlock', password: null }, [locked], null)).toMatchObject({ ok: false, reason: 'needs-password' });
    succeeded(await processPdf({ kind: 'unlock', password: SENTINEL }, [locked], null), 'unlock');
    // And a file that makes qpdf fail outright, which also goes through the same capture.
    expect(await run({ kind: 'unlock', password: 'x' }, 'gen-cifrado-rc4-128.pdf')).toMatchObject({ ok: false, reason: 'wrong-password' });

    for (const spy of spies.splice(0)) spy.mockRestore();
    expect(seen.filter((line) => line.includes('Orca-Sentinel') || /invalid password/i.test(line)), 'nothing of qpdf or of the password was printed').toEqual([]);
    expect(seen, 'nothing at all was printed').toEqual([]);
    expect(process.exitCode, 'the exit status of the process is as it was').toBe(exitCode);
  }, 60_000);
});
