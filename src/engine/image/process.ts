// One file through one operation: read, recognise, check, decode, transform, encode. It runs in the
// worker, or on the page when the worker has no OffscreenCanvas (DECISOES § 22). It never throws:
// every error becomes an EngineFailure with the reason the page shows next to that file, so a bad
// file cannot stop a batch. A new output is always written from the decoded pixels, which is what
// removes Exif, XMP, IPTC and GPS; a file that gets no gain goes back through strip.ts (§ 33).
// Self-contained: nothing here imports from outside src/engine/image/.

import { decodeSource } from './decode.ts';
import type { Decoded } from './decode.ts';
import { blobOf, encodeAvifWork, encodeJpegMoz, encodeJpegNative, encodePngNative, encodeWebpWork, optimiseCleanPng, QUALITY } from './encode.ts';
import { EngineError, loading, reasonOf } from './errors.ts';
import { centeredBox, coverPlan, resizeSize, sameBox } from './geometry.ts';
import { clampBox, mosaic } from './pixels.ts';
import type { Spin } from './pixels.ts';
import { probe } from './probe.ts';
import type { SourceInfo } from './probe.ts';
import { sniff } from './sniff.ts';
import { stripMetadata, stripPng } from './strip.ts';
import { checkStructure } from './structure.ts';
import { fitToBytes, sampleBoxes } from './target.ts';
import type { TargetOps } from './target.ts';
import type { EngineFailure, EngineOutput, EngineResult, FailureReason, Flip, ImageFormat, Note, Operation, OutputFormat, Progress, Sniffed, Turn } from './types.ts';
import { RasterWork } from './work.ts';
import type { Work } from './work.ts';

// The page path (engine-client.ts) loads this module on demand and must set the .wasm URLs before the first file;
// re-exporting configureWasm from here puts it in the same chunk instead of costing a request of its own.
export { configureWasm } from './codecs/wasm.ts';

/** Formats strip.ts can clean without decoding (so a file with no gain can go back). */
const STRIPPABLE: readonly ImageFormat[] = ['jpeg', 'png', 'webp'];
const PREVIEW_LONGEST_SIDE = 1600;

function fail(reason: FailureReason, source?: Sniffed): EngineFailure {
  return source === undefined ? { ok: false, reason } : { ok: false, reason, source };
}

interface Run {
  file: Blob;
  bytes: Uint8Array;
  format: ImageFormat;
  info: SourceInfo;
  notes: Note[];
  onProgress: Progress;
  /** Everything opened for this file, closed in one place at the end. */
  owned: Work[];
}

function own(run: Run, work: Work): Work {
  run.owned.push(work);
  return work;
}

function output(run: Run, blob: Blob, format: OutputFormat, width: number, height: number, outcome: EngineOutput['outcome'], preview?: Blob): EngineOutput {
  const result: EngineOutput = {
    ok: true,
    blob,
    format,
    width,
    height,
    outcome,
    notes: [...run.notes],
    source: run.format,
    sourceWidth: run.info.width,
    sourceHeight: run.info.height,
  };
  if (preview) result.preview = preview;
  return result;
}

/** The original pixels with the metadata stripped: no gain, no encoder, or nothing to change (§ 33). */
function originalStripped(run: Run, outcome: 'no-gain' | 'cannot-encode' | 'fits'): EngineOutput {
  if (!STRIPPABLE.includes(run.format)) throw new EngineError('encode', 'no way to clean this format without decoding it');
  let stripped: { bytes: Uint8Array; type: string };
  try {
    stripped = stripMetadata(run.bytes);
  } catch {
    throw new EngineError('decode', 'could not remove the metadata of this file');
  }
  return output(run, blobOf(stripped.bytes, stripped.type), run.format as OutputFormat, run.info.width, run.info.height, outcome);
}

/** Paints transparent pixels white before a JPEG is written, and says so only when there were any. */
function flattenIfNeeded(run: Run, work: Work, alpha: boolean): void {
  if (alpha && work.hasTransparency()) {
    work.flatten();
    if (!run.notes.includes('flattened')) run.notes.push('flattened');
  }
}

/** A displayable copy of a source the browser cannot show (HEIC, AVIF decoded by WASM). */
async function makePreview(run: Run, decoded: Decoded): Promise<Blob | undefined> {
  try {
    const { work } = decoded;
    const longest = Math.max(work.width, work.height);
    let small = work;
    if (longest > PREVIEW_LONGEST_SIDE) {
      const factor = PREVIEW_LONGEST_SIDE / longest;
      small = own(run, await work.scale(Math.max(1, Math.round(work.width * factor)), Math.max(1, Math.round(work.height * factor))));
    }
    if (decoded.alpha && small.hasTransparency()) return await encodePngNative(small);
    return await encodeJpegNative(small, QUALITY.preview);
  } catch {
    return undefined; // the card shows without the before/after rather than failing the file
  }
}

function spinOf(turn: Turn, flip: Flip): Spin {
  return { rotate: turn === 'right' ? 90 : turn === 'left' ? 270 : 180, flipH: flip === 'horizontal', flipV: flip === 'vertical' };
}

/** The same format the file came in, written by the browser (or its fallback). */
async function encodeSame(work: Work, format: ImageFormat): Promise<{ blob: Blob; format: OutputFormat }> {
  if (format === 'png') return { blob: await encodePngNative(work), format: 'png' };
  if (format === 'webp') return { blob: await encodeWebpWork(work, QUALITY.native, true), format: 'webp' };
  return { blob: await encodeJpegNative(work), format: 'jpeg' };
}

// --- target size ------------------------------------------------------------------------------

function targetOps(run: Run, work: Work): TargetOps<Work> {
  return {
    width: work.width,
    height: work.height,
    full: () => work,
    async sample() {
      const tiles = await Promise.all(sampleBoxes(work.width, work.height).map((box) => work.crop(box)));
      const grid = mosaic(tiles.map((tile) => tile.raster()), 2);
      for (const tile of tiles) tile.close();
      const handle = own(run, new RasterWork(grid));
      return { handle, pixels: grid.width * grid.height };
    },
    async scale(width, height) {
      const handle = own(run, await work.scale(width, height));
      return { handle, pixels: width * height };
    },
    async encode(handle, quality) {
      const { encodeJpeg } = await loading(import('./codecs/jpeg.ts'));
      return encodeJpeg(handle.raster(), quality);
    },
    release(handle) {
      if (handle !== work) handle.close();
    },
  };
}

// --- the operations ---------------------------------------------------------------------------

/**
 * Operations that would change nothing on this picture (Resize with a box the photo already fits,
 * Crop of the whole picture): the answer is the original without its metadata, and no decoding.
 * The notes say why when the user asked for something the tool cannot give.
 */
function unchanged(op: Operation, width: number, height: number): { notes: Note[] } | null {
  if (op.kind === 'resize') {
    const plan = resizeSize({ width, height }, op.mode === 'size' ? { width: op.width, height: op.height } : { percent: op.percent });
    if (!plan) return { notes: [] };
    if (plan.notEnlarged) return { notes: ['not-enlarged'] };
  }
  if (op.kind === 'crop') {
    const whole = { x: 0, y: 0, width, height };
    const box = op.box ? clampBox(op.box, width, height) : op.ratio ? centeredBox({ width, height }, op.ratio) : whole;
    if (sameBox(box, whole)) return { notes: [] };
  }
  return null;
}

async function runOperation(run: Run, op: Operation, decoded: Decoded): Promise<EngineOutput> {
  const { work } = decoded;
  const width = work.width;
  const height = work.height;
  const { onProgress } = run;
  const preview = decoded.viewable ? undefined : await makePreview(run, decoded);
  onProgress(55);

  switch (op.kind) {
    case 'compress': {
      let blob: Blob;
      try {
        if (run.format === 'webp') blob = await encodeWebpWork(work, QUALITY.webp[op.level], false);
        else if (run.format === 'jpeg') blob = await encodeJpegMoz(work, QUALITY.mozjpeg[op.level]);
        else throw new EngineError('unsupported', 'Compress takes JPG, PNG and WebP');
      } catch (error) {
        if (error instanceof EngineError) throw error;
        return originalStripped(run, 'cannot-encode'); // the codec could not load: the clean original goes back
      }
      onProgress(100);
      if (blob.size >= run.file.size) return originalStripped(run, 'no-gain');
      return output(run, blob, run.format as OutputFormat, width, height, 'new', preview);
    }

    case 'target': {
      flattenIfNeeded(run, work, decoded.alpha);
      const fitted = await fitToBytes(targetOps(run, work), op.maxBytes);
      if (!fitted) throw new EngineError('encode', 'no quality or size fits the limit');
      if (fitted.downscaled) run.notes.push('downscaled');
      onProgress(100);
      return output(run, blobOf(fitted.bytes, 'image/jpeg'), 'jpeg', fitted.width, fitted.height, 'new', preview);
    }

    case 'resize': {
      const plan = resizeSize({ width, height }, op.mode === 'size' ? { width: op.width, height: op.height } : { percent: op.percent });
      if (!plan || plan.notEnlarged) {
        run.notes.push(...(unchanged(op, width, height)?.notes ?? []));
        onProgress(100);
        return originalStripped(run, 'fits');
      }
      const resized = own(run, await work.scale(plan.width, plan.height));
      onProgress(70);
      const encoded = await encodeSame(resized, run.format);
      onProgress(100);
      return output(run, encoded.blob, encoded.format, plan.width, plan.height, 'new', preview);
    }

    case 'cover': {
      const plan = coverPlan({ width, height }, { width: op.width, height: op.height });
      flattenIfNeeded(run, work, decoded.alpha);
      const cut = own(run, await work.crop(plan.box));
      const framed = own(run, await cut.scale(op.width, op.height));
      if (plan.cropped) run.notes.push('center-cropped');
      if (plan.enlarged) run.notes.push('enlarged');
      onProgress(70);
      for (const quality of [90, 80, 70, 60, 50, 40]) {
        const blob = await encodeJpegMoz(framed, quality);
        if (blob.size <= op.maxBytes) {
          onProgress(100);
          return output(run, blob, 'jpeg', op.width, op.height, 'new', preview);
        }
      }
      throw new EngineError('encode', 'the frame does not fit the size limit');
    }

    case 'crop': {
      const whole = { x: 0, y: 0, width, height };
      const box = op.box ? clampBox(op.box, width, height) : op.ratio ? centeredBox({ width, height }, op.ratio) : whole;
      if (sameBox(box, whole)) {
        onProgress(100);
        return originalStripped(run, 'fits');
      }
      const cut = own(run, await work.crop(box));
      onProgress(70);
      const encoded = await encodeSame(cut, run.format);
      onProgress(100);
      return output(run, encoded.blob, encoded.format, box.width, box.height, 'new', preview);
    }

    case 'rotate': {
      const spin = spinOf(op.turn, op.flip);
      const turned = own(run, await work.spin(spin));
      onProgress(70);
      const encoded = await encodeSame(turned, run.format);
      onProgress(100);
      return output(run, encoded.blob, encoded.format, turned.width, turned.height, 'new', preview);
    }

    case 'convert': {
      const to: OutputFormat = op.to === 'swap' ? (run.format === 'png' ? 'jpeg' : 'png') : op.to;
      const level = op.level ?? 'recommended';
      let blob: Blob;
      if (to === 'jpeg') {
        flattenIfNeeded(run, work, decoded.alpha);
        blob = await encodeJpegNative(work);
      } else if (to === 'png') {
        blob = await encodePngNative(work);
      } else if (to === 'webp') {
        blob = await encodeWebpWork(work, QUALITY.webp[level], true);
      } else {
        blob = await encodeAvifWork(work, level);
      }
      onProgress(100);
      return output(run, blob, to, width, height, 'new', preview);
    }

    case 'pdf-page': {
      // JPEG for photos; PNG when the image has transparency, which a PDF page can keep.
      const transparent = decoded.alpha && work.hasTransparency();
      const blob = transparent ? await encodePngNative(work) : await encodeJpegNative(work);
      onProgress(100);
      return output(run, blob, transparent ? 'png' : 'jpeg', width, height, 'new', preview);
    }
  }
}

/** Compress for PNG: lossless, on the file's own bytes, at any size, without decoding a pixel. */
async function compressPng(run: Run): Promise<EngineOutput> {
  let clean: Uint8Array;
  try {
    clean = stripPng(run.bytes);
  } catch {
    throw new EngineError('decode', 'could not read the PNG chunks');
  }
  run.onProgress(40);
  let optimised: Uint8Array;
  try {
    optimised = await optimiseCleanPng(clean, run.info.width * run.info.height);
  } catch (error) {
    if (error instanceof EngineError && error.reason === 'load') throw error;
    return originalStripped(run, 'cannot-encode');
  }
  run.onProgress(100);
  if (optimised.length >= run.file.size) return originalStripped(run, 'no-gain');
  return output(run, blobOf(optimised, 'image/png'), 'png', run.info.width, run.info.height, 'new');
}

/**
 * Runs `op` on `file`, if its real format (from the bytes) is one of `accepts`. Progress is coarse:
 * 10 read, 40 decoded, 70 transformed, 100 encoded.
 */
export async function processImage(file: Blob, op: Operation, accepts: readonly ImageFormat[], onProgress: Progress = () => {}): Promise<EngineResult> {
  const owned: Work[] = [];
  let stage: FailureReason = 'decode';
  let known: Sniffed | undefined;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    onProgress(10);
    known = sniff(bytes);
    if (known === 'empty') return fail('empty');
    if (known === 'unknown' || known === 'gif') return fail('unsupported', known);
    if (!accepts.includes(known)) return fail('wrong-tool', known);
    const format = known;
    const structure = checkStructure(bytes, format);
    if (structure !== 'ok') return fail(structure, format);
    const info = probe(bytes, format);
    if (!info) return fail('decode', format);
    const run: Run = { file, bytes, format, info, notes: [], onProgress, owned };

    // Answers that need no decoding at all.
    if (op.kind === 'target' && file.size <= op.maxBytes && STRIPPABLE.includes(format)) {
      onProgress(100);
      return originalStripped(run, 'fits');
    }
    const nothingToDo = STRIPPABLE.includes(format) ? unchanged(op, info.width, info.height) : null;
    if (nothingToDo) {
      run.notes.push(...nothingToDo.notes);
      onProgress(100);
      return originalStripped(run, 'fits');
    }
    if (op.kind === 'compress' && format === 'png') return await compressPng(run);
    if (op.kind === 'compress' && format === 'webp' && info.animated) {
      // Recompressing would keep only the first frame; the file goes back clean, still animated.
      onProgress(100);
      return originalStripped(run, 'no-gain');
    }

    const decoded = await decodeSource(bytes, file, info);
    own(run, decoded.work);
    if (info.animated) run.notes.push('first-frame');
    onProgress(40);
    stage = 'encode';
    return await runOperation(run, op, decoded);
  } catch (error) {
    return fail(reasonOf(error, stage), known === 'empty' ? undefined : known);
  } finally {
    for (const work of owned) work.close();
  }
}
