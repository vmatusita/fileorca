// F19b, guide 4: Protect PDF or Unlock PDF once, in a Node process of its own, so the engine's qpdf starts fresh, as in a
// tab where it is the first file of the tool. The engine keeps one qpdf for every run of a page, and a Compress PDF run
// leaves its --compression-level=9 in it: a Protect PDF after it writes other bytes (the front M1 measured 16,576 and
// 16,544 for gen-ja-otimizado.pdf; F19b pendência). pnpm guias:medir measures every guide in one process, so without
// this the size depended on the guides measured before.
//   node scripts/guides/lib/lock-child.ts protect <fixture>   (the password in FO_MEASURE_PASSWORD, never in the arguments)
//   node scripts/guides/lib/lock-child.ts unlock <fixture>
// Prints one line of JSON: the output in base64, or the reason the engine gave.
import { lockTool, pdfFixture } from './node-pdf.ts';

const [kind, name] = process.argv.slice(2);
if ((kind !== 'protect' && kind !== 'unlock') || !name) throw new Error('usage: lock-child.ts protect|unlock <fixture>');
const result = kind === 'protect'
  ? await lockTool({ kind: 'protect', password: process.env['FO_MEASURE_PASSWORD'] ?? '' }, pdfFixture(name))
  : await lockTool({ kind: 'unlock', password: null }, pdfFixture(name));
const out = result.ok ? result.outputs[0] : undefined;
process.stdout.write(`${JSON.stringify(result.ok && out ? { ok: true, bytes: Buffer.from(out.bytes).toString('base64') } : { ok: false, reason: result.ok ? 'no output' : result.reason })}\n`);
