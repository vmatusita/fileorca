// The tool panel island, shared by every image tool (DECISOES § 23: rendered by the server, hydrated by
// the tool's mount.ts from data-props). One island per page. DropZone, WaterLevel and ResultCard share
// one slot; the queue of FileCards grows below it. A batch has no size limit: files come from a drop
// anywhere on the panel, the picker or Ctrl+V, and go through the engine one at a time. Options
// re-process the whole batch at once (no Apply button, the focus stays where it is). Markup and classes
// follow docs/design/components (v1.1). The Oli boxes draw from the page sprite (§ 44).
//
// State lives in one mutable model (the run loop is async and must see the latest values); every change
// calls render(). Outputs are kept as Blobs, object URLs are revoked when replaced and at "Start over".
import { useEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren, JSX, TargetedMouseEvent } from 'preact';
import type { ImagePanelTexts } from '../../i18n/types.ts';
import { fileSize, fmt, percent } from '../../i18n/format.ts';
import { browserLabel, track } from '../../analytics/events.ts';
import { PRODUCTION_HOSTNAME } from '../../platform/site.ts';
import type { EngineFailure, EngineOutput, EngineResult, Note, Operation, Sniffed } from '../../engine/image/types.ts';
import Icon from '../../icons/Icon.tsx';
import FileCard, { type FileCardProps } from '../../components/FileCard.tsx';
import BeforeAfter from './BeforeAfter.tsx';
import Oli from './Oli.tsx';
import { countUse, dontShowAgain, forgetWithoutConsent, isAdBlocked } from './coffee.ts';
import { EXTENSION, PDF_BATCH_NAME, ZIP_NAME, uniqueNames } from './names.ts';
import { carriesFiles, dragCount, filesOf, imageFilesOf, pasteBelongsToElement } from './paste.ts';
import { acceptAttribute, batchOutcome, batchPercent, codecOf, isLossy, totals, worthSaying, type Ready } from './summary.ts';
import type { FileInfo, ImagePanelData, ImageTool, SelectedFile } from './types.ts';
import alertIcon from '../../../docs/design/assets/Icons/alert.svg?raw';
import arrowIcon from '../../../docs/design/assets/Icons/arrow-right.svg?raw';
import coffeeIcon from '../../../docs/design/assets/Icons/coffee.svg?raw';
import downloadIcon from '../../../docs/design/assets/Icons/download.svg?raw';
import imageIcon from '../../../docs/design/assets/Icons/image.svg?raw';
import uploadIcon from '../../../docs/design/assets/Icons/upload.svg?raw';

export interface ImagePanelProps<S extends object, O> extends ImagePanelData<O> {
  tool: ImageTool<S, O>;
}

const SHOW_PROGRESS_AFTER_MS = 400;
/** Rows shown before "Show N more". */
const VISIBLE_ROWS = 6;
const MINUS = '−';
/** These failures do not depend on the options: the file is not tried again when an option changes. */
const HOPELESS = new Set<EngineFailure['reason']>(['empty', 'unsupported', 'wrong-tool', 'truncated', 'decode']);

type Phase = 'idle' | 'processing' | 'done' | 'error';

interface Item {
  id: number;
  file: File;
  status: 'waiting' | 'working' | 'done' | 'error';
  /** 0 to 1, inside the current run. */
  progress: number;
  /** Key of the operation that produced `output`. */
  op: string | null;
  /** What the current run will do with this file; null when there is nothing to redo. */
  next: { op: Operation; key: string } | null;
  output: EngineOutput | null;
  failure: EngineFailure | null;
  /** tool_error already sent for this file. */
  reported: boolean;
  outUrl: string | null;
  previewUrl: string | null;
  originalUrl: string | null;
  width: number | null;
  height: number | null;
  removed: boolean;
  /** Lets go of the engine call in progress for this file (the cancel button). */
  cancel: (() => void) | null;
}

interface Bundle {
  kind: 'zip' | 'pdf';
  blob: Blob;
  url: string;
  name: string;
  /** What it was built from: the PDF sheet, so a size change is told from "nothing changed". */
  key: string;
}

interface Model {
  items: Item[];
  phase: Phase;
  runId: number;
  nextId: number;
  finished: number;
  total: number;
  zipping: boolean;
  showLevel: boolean;
  /** The result card was shown for this batch (an option re-run keeps it for 400 ms). */
  hadCard: boolean;
  bundle: Bundle | null;
  selected: number | null;
  expanded: boolean;
  announce: string;
  coffee: boolean;
  completeSent: boolean;
  /** A batch counts once for the coffee line, however many times an option re-runs it. */
  newUse: boolean;
  focusDownload: boolean;
  broken: Set<string>;
}

function newModel(): Model {
  return {
    items: [], phase: 'idle', runId: 0, nextId: 1, finished: 0, total: 0, zipping: false, showLevel: false, hadCard: false, bundle: null,
    selected: null, expanded: false, announce: '', coffee: false, completeSent: false, newUse: false, focusDownload: false, broken: new Set(),
  };
}

function adBlocked(adsOn: boolean): boolean {
  const ads = (window as { adsbygoogle?: { loaded?: boolean } }).adsbygoogle;
  const unit = document.querySelector<HTMLElement>('.fo-ad--content ins.adsbygoogle');
  return isAdBlocked({ adsOn, production: location.hostname === PRODUCTION_HOSTNAME, loaded: ads?.loaded === true, unitHeight: unit ? unit.offsetHeight : null });
}

function useWide(): boolean {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const update = () => setWide(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return wide;
}

function revoke(url: string | null): void {
  if (url) URL.revokeObjectURL(url);
}

function releaseOutput(item: Item): void {
  revoke(item.outUrl);
  revoke(item.previewUrl);
  item.outUrl = null;
  item.previewUrl = null;
}

function release(item: Item): void {
  releaseOutput(item);
  revoke(item.originalUrl);
  item.originalUrl = null;
}

const infoOf = (item: Item): FileInfo => ({ id: item.id, name: item.file.name, size: item.file.size, width: item.width, height: item.height });

export default function ImagePanel<S extends object, O>(props: ImagePanelProps<S, O>) {
  const { lang, page, t, texts, accepts, beforeAfter, pdf, chips, converters, coffeeHref, adsOn, tool } = props;
  const { Options } = tool;
  const model = useRef<Model>(newModel());
  const m = model.current;
  const [, setTick] = useState(0);
  const render = () => setTick((tick) => tick + 1);
  const [over, setOver] = useState(0);
  const [state, setState] = useState<S>(tool.initial);
  const stateRef = useRef<S>(state);
  const wide = useWide();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseRef = useRef<HTMLButtonElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const warmed = useRef(false);
  const formatName = (format: Sniffed | undefined): string => (format && format in t.formats ? t.formats[format as keyof ImagePanelTexts['formats']] : '');
  const nameOf = (item: Item) => item.file.name || t.fileFallback;
  const tracked = { tool: page, lang } as const;

  // --- queue bookkeeping ---------------------------------------------------------------------

  const ready = (): Item[] => m.items.filter((item) => item.output !== null);
  const readyRows = (): (Ready & { item: Item; output: EngineOutput })[] =>
    ready().flatMap((item) => (item.output ? [{ item, inputSize: item.file.size, output: item.output }] : []));

  /** Output names, unique inside the batch, in queue order. */
  function outputNames(items: Item[]): string[] {
    return uniqueNames(
      items.map((item) => ({ name: item.file.name, extension: item.output ? EXTENSION[pdf ? 'pdf' : item.output.format] : 'bin' })),
      t.fileFallback,
    );
  }

  function dropBundle(): void {
    revoke(m.bundle?.url ?? null);
    m.bundle = null;
  }

  function teardown(): void {
    for (const item of m.items) release(item);
    m.items = [];
    dropBundle();
  }

  const originalUrl = (item: Item): string => (item.originalUrl ??= URL.createObjectURL(item.file));

  // --- the run: every file one at a time, then the ZIP or the PDF ----------------------------------

  function settle(item: Item, result: EngineResult, key: string): void {
    releaseOutput(item);
    if (result.ok) {
      item.output = result;
      item.failure = null;
      item.op = key;
      item.status = 'done';
      item.outUrl = URL.createObjectURL(result.blob);
      item.previewUrl = result.preview ? URL.createObjectURL(result.preview) : null;
      item.width = result.sourceWidth;
      item.height = result.sourceHeight;
      if (result.outcome === 'cannot-encode' && !item.reported) {
        item.reported = true;
        track('tool_error', { ...tracked, browser: browserLabel(navigator.userAgent), codec: codecOf(result.source), reason: 'encode' });
      }
      return;
    }
    item.output = null;
    item.failure = result;
    item.op = null;
    item.status = 'error';
    if (!item.reported) {
      item.reported = true;
      track('tool_error', { ...tracked, browser: browserLabel(navigator.userAgent), codec: codecOf(result.reason === 'empty' ? 'empty' : result.source), reason: result.reason });
    }
  }

  /** The ZIP or the PDF of the outputs; null for a single file (it downloads as it is). Touches nothing of the model. */
  async function assemble(items: Item[], pdfKey: string): Promise<Omit<Bundle, 'url'> | null> {
    const names = outputNames(items);
    if (pdf) {
      const { buildPdf } = await import('./pdf-client.ts');
      const pages = items.flatMap((item) =>
        item.output ? [{ blob: item.output.blob, format: item.output.format === 'png' ? ('png' as const) : ('jpeg' as const), width: item.output.width, height: item.output.height }] : [],
      );
      const blob = await buildPdf(pages, pdfKey as 'image' | 'letter' | 'a4');
      return { kind: 'pdf', blob, name: items.length === 1 ? names[0] ?? PDF_BATCH_NAME : PDF_BATCH_NAME, key: pdfKey };
    }
    if (items.length < 2) return null;
    const { zipFiles } = await import('./engine-client.ts');
    const blob = await zipFiles(items.flatMap((item, index) => (item.output ? [{ name: names[index] ?? `${index}.bin`, blob: item.output.blob }] : [])));
    return { kind: 'zip', blob, name: ZIP_NAME, key: '' };
  }

  async function run(): Promise<void> {
    const state = stateRef.current;
    const pdfKey = pdf ? (tool.pdfSize?.(state) ?? 'image') : '';
    const work: Item[] = [];
    for (const item of m.items) {
      const op = tool.operation(state, infoOf(item));
      const key = JSON.stringify(op);
      const settled = item.output !== null && item.op === key;
      const hopeless = item.failure !== null && HOPELESS.has(item.failure.reason);
      item.next = settled || hopeless ? null : { op, key };
      if (item.next) work.push(item);
    }
    const rebuild = work.length > 0 || (pdf && ready().length > 0 && m.bundle?.key !== pdfKey);
    if (!rebuild) return;

    const id = ++m.runId;
    m.phase = 'processing';
    m.finished = 0;
    m.total = work.length;
    m.zipping = false;
    m.showLevel = false;
    for (const item of work) {
      item.status = 'waiting';
      item.progress = 0;
    }
    render();
    const timer = window.setTimeout(() => {
      if (m.runId === id && m.phase === 'processing') {
        m.showLevel = true;
        render();
      }
    }, SHOW_PROGRESS_AFTER_MS);
    try {
      const engine = work.length > 0 ? await import('./engine-client.ts').catch(() => null) : null;
      for (const item of work) {
        if (m.runId !== id) return;
        if (item.removed || !item.next) {
          m.finished += 1;
          continue;
        }
        const { op, key } = item.next;
        item.status = 'working';
        item.progress = 0;
        render();
        const cancelled = new Promise<null>((resolve) => {
          item.cancel = () => resolve(null);
        });
        let result: EngineResult | null;
        try {
          result = engine
            ? await Promise.race([
                engine.processFile(item.file, op, accepts, (value) => {
                  if (m.runId === id && !item.removed) {
                    item.progress = value / 100;
                    render();
                  }
                }),
                cancelled,
              ])
            : { ok: false, reason: 'decode' };
        } catch {
          result = { ok: false, reason: 'decode' };
        }
        item.cancel = null;
        if (m.runId !== id) return;
        m.finished += 1;
        if (item.removed || !result) continue;
        settle(item, result, key);
        render();
      }
      if (m.runId !== id) return;
      const done = ready();
      if (done.length > 0) {
        m.zipping = pdf || done.length >= 2;
        render();
        let built: Omit<Bundle, 'url'> | null = null;
        try {
          built = await assemble(done, pdfKey);
        } catch {
          for (const item of done) settle(item, { ok: false, reason: 'encode' }, '');
        }
        // A newer run may have started while this one zipped: its own bundle replaces whatever this one made.
        if (m.runId !== id) return;
        dropBundle();
        if (built) m.bundle = { ...built, url: URL.createObjectURL(built.blob) };
      } else {
        dropBundle();
      }
      finish();
    } finally {
      window.clearTimeout(timer);
    }
  }

  function finish(): void {
    const rows = readyRows();
    const failed = m.items.filter((item) => item.failure !== null).length;
    m.zipping = false;
    m.phase = rows.length > 0 ? 'done' : 'error';
    m.hadCard = rows.length > 0;
    if (!m.hadCard) m.focusDownload = false;
    if (!m.completeSent) {
      m.completeSent = true;
      track('tool_complete', { ...tracked, outcome: batchOutcome(tool.success, rows) });
    }
    if (rows.length > 0 && m.newUse && rows.some((row) => row.output.outcome === 'new')) {
      m.newUse = false;
      m.coffee = countUse(adBlocked(adsOn));
    }
    // The error box announces itself (role="alert"); the status region speaks when something came out.
    m.announce = rows.length > 0 ? [saysFor(rows), failed > 0 ? fmt(t.errors.some, { count: failed }) : ''].filter(Boolean).join(' ') : '';
    render();
  }

  function startBatch(files: File[]): void {
    if (files.length === 0) return;
    m.runId += 1; // any run still going stops at its next step
    teardown();
    m.items = files.map((file) => ({
      id: m.nextId++, file, status: 'waiting', progress: 0, op: null, next: null, output: null, failure: null, reported: false,
      outUrl: null, previewUrl: null, originalUrl: null, width: null, height: null, removed: false, cancel: null,
    }));
    m.selected = null;
    m.expanded = false;
    m.hadCard = false;
    m.completeSent = false;
    m.newUse = true;
    m.coffee = false;
    m.announce = '';
    m.focusDownload = true;
    m.broken = new Set();
    setOver(0);
    track('tool_start', tracked);
    void run();
  }

  function update(patch: Partial<S>): void {
    const next = { ...stateRef.current, ...patch };
    stateRef.current = next;
    setState(next);
    m.focusDownload = false; // an option changed: the focus stays on it
    if (m.items.length > 0) void run();
  }

  function startOver(): void {
    m.runId += 1;
    teardown();
    m.phase = 'idle';
    m.hadCard = false;
    m.announce = '';
    m.coffee = false;
    m.selected = null;
    m.zipping = false;
    setOver(0);
    render();
    window.setTimeout(() => chooseRef.current?.focus(), 0);
  }

  function removeItem(item: Item): void {
    item.removed = true;
    item.cancel?.();
    release(item);
    m.items = m.items.filter((other) => other !== item);
    if (m.items.length === 0) {
      startOver();
      return;
    }
    render();
  }

  function downloadItem(item: Item, name: string): void {
    if (!item.outUrl) return;
    const link = document.createElement('a');
    link.href = item.outUrl;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    track('download', tracked);
  }

  // --- what a batch says ---------------------------------------------------------------------

  const compression = texts.placardLabel !== undefined;

  function saysFor(rows: (Ready & { item: Item; output: EngineOutput })[]): string {
    const tot = totals(rows);
    const single = tot.count === 1;
    const gain = percent(tot.saved, lang);
    if (compression && !(tot.anyNew && worthSaying(tot.saved))) {
      if (single && tot.cannotEncode) return fmt(t.result.cannotEncode, { format: formatName(tot.cannotEncode) });
      return single ? t.result.unchanged : t.result.unchangedMany;
    }
    return fmt(single ? texts.done : texts.doneMany, { percent: gain, count: tot.count });
  }

  function noteText(note: Note, rows: (Ready & { item: Item; output: EngineOutput })[]): string {
    const notes = t.result.notes;
    switch (note) {
      case 'flattened': return notes.flattened;
      case 'first-frame': return notes.firstFrame;
      case 'not-enlarged': return notes.notEnlarged;
      case 'center-cropped': return notes.centerCropped;
      case 'enlarged': return notes.enlarged;
      case 'downscaled': {
        const row = rows.find((candidate) => candidate.output.notes.includes('downscaled'));
        return fmt(notes.downscaled, { width: row?.output.width ?? '', height: row?.output.height ?? '' });
      }
    }
  }

  function reasonOf(item: Item): ComponentChildren {
    const failure = item.failure;
    if (!failure) return '';
    const name = nameOf(item);
    const errors = t.errors;
    switch (failure.reason) {
      case 'empty': return fmt(errors.empty, { name });
      case 'unsupported': return fmt(errors.unsupported, { name, formats: texts.formats });
      case 'truncated': return fmt(errors.truncated, { name });
      case 'decode': return fmt(errors.decode, { name });
      case 'encode': return fmt(errors.encode, { name });
      case 'too-large': return fmt(errors.tooLarge, { name });
      case 'wrong-tool': {
        const link = failure.source === 'heic' ? converters.heic : failure.source === 'avif' ? converters.avif : undefined;
        const format = formatName(failure.source);
        if (!link) return fmt(errors.wrongFormat, { name, format, formats: texts.formats });
        const [before = '', after = ''] = fmt(errors.wrongTool, { name, format }).split('{tool}');
        return (
          <>
            {before}
            <a href={link.href}>{link.name}</a>
            {after}
          </>
        );
      }
    }
  }

  // --- events from the page ------------------------------------------------------------------

  function warmOnce(): void {
    if (warmed.current) return;
    warmed.current = true;
    void import('./engine-client.ts').then((engine) => engine.warm(tool.warm)).catch(() => {});
  }

  useEffect(() => forgetWithoutConsent(), []);

  useEffect(() => {
    if (m.phase === 'done' && m.focusDownload && downloadRef.current) {
      m.focusDownload = false;
      downloadRef.current.focus();
    }
  });

  useEffect(() => {
    // The drop anywhere on the panel starts a new batch; anywhere else the browser must not open the file in the tab.
    const onDragOver = (event: DragEvent) => {
      if (carriesFiles(event.dataTransfer)) event.preventDefault();
    };
    const onDrop = (event: DragEvent) => {
      if (!carriesFiles(event.dataTransfer)) return;
      event.preventDefault();
      setOver(0);
      const root = rootRef.current;
      if (root && event.target instanceof Node && root.contains(event.target)) startBatch(filesOf(event.dataTransfer?.files));
    };
    const onPaste = (event: ClipboardEvent) => {
      if (pasteBelongsToElement(event.target)) return;
      const files = imageFilesOf(event.clipboardData?.files);
      if (files.length === 0) return;
      event.preventDefault();
      startBatch(files);
    };
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('drop', onDrop);
    document.addEventListener('paste', onPaste);
    return () => {
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('drop', onDrop);
      document.removeEventListener('paste', onPaste);
      m.runId += 1;
      teardown();
    };
  }, []);

  const openPicker = () => inputRef.current?.click();
  const onZoneClick = (event: TargetedMouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, a, input')) return;
    openPicker();
  };
  const dragHandlers = {
    onDragEnter: (event: DragEvent) => {
      event.preventDefault();
      if (m.phase !== 'processing') setOver(Math.max(1, dragCount(event.dataTransfer)));
    },
    onDragOver: (event: DragEvent) => event.preventDefault(),
    onDragLeave: (event: DragEvent) => {
      const zone = event.currentTarget as HTMLElement;
      if (!zone.contains(event.relatedTarget as Node | null)) setOver(0);
    },
  };

  // --- what is on screen -----------------------------------------------------------------------

  const rows = readyRows();
  const tot = totals(rows);
  const total = m.total;
  const current = m.items.find((item) => item.status === 'working');
  const progress = m.zipping ? 100 : batchPercent(m.finished, total, current?.progress ?? 0);
  const showProgress = m.phase === 'processing' && m.showLevel;
  const showCard = rows.length > 0 && m.hadCard && (m.phase === 'done' || (m.phase === 'processing' && !m.showLevel));
  const dropState = over > 0 && m.phase !== 'processing' ? 'over' : m.phase === 'error' ? 'error' : undefined;
  const names = outputNames(ready());
  const nameFor = new Map(ready().map((item, index) => [item.id, names[index] ?? '']));

  /** The picture the comparison needs: original (or a decoded copy) against the result of the picked file. */
  const picked = rows.find((row) => row.item.id === m.selected) ?? rows[0] ?? null;
  const selectable = tool.selectable ?? beforeAfter !== 'never';
  const comparison = (() => {
    if (!showCard || beforeAfter === 'never' || !picked || picked.output.outcome !== 'new') return null;
    if (beforeAfter === 'lossy' && !isLossy(picked.output.format)) return null;
    if (!picked.item.outUrl || m.broken.has(`${picked.item.id}:${picked.item.outUrl}`)) return null;
    const before = picked.item.previewUrl ?? originalUrl(picked.item);
    return (
      <BeforeAfter
        key={`${picked.item.id}:${picked.item.outUrl}`}
        label={t.compare.label}
        beforeUrl={before}
        afterUrl={picked.item.outUrl}
        beforeTag={fmt(t.compare.before, { size: fileSize(picked.item.file.size, lang) })}
        afterTag={fmt(t.compare.after, { size: fileSize(picked.output.blob.size, lang) })}
        width={picked.output.width}
        height={picked.output.height}
        onBroken={() => {
          m.broken.add(`${picked.item.id}:${picked.item.outUrl}`);
          render();
        }}
      />
    );
  })();

  const deliverable = (() => {
    if (pdf || rows.length >= 2) return m.bundle ? { url: m.bundle.url, name: m.bundle.name, size: m.bundle.blob.size } : null;
    const only = rows[0];
    return only?.item.outUrl ? { url: only.item.outUrl, name: nameFor.get(only.item.id) ?? '', size: only.output.blob.size } : null;
  })();

  const oliPose = dropState === 'over' ? 'gulp' : dropState === 'error' ? 'oops' : 'wave';
  const badge = dropState === 'over' ? downloadIcon : dropState === 'error' ? alertIcon : uploadIcon;
  const [helpBefore = '', helpAfter = ''] = fmt(t.drop.helpDesktop, { formats: texts.formats }).split('{kbd}');
  const single = m.items.length === 1 ? m.items[0] : undefined;

  let panel: JSX.Element;
  if (showProgress) {
    const done = Math.min(m.finished, total);
    const valueText = total >= 2 ? fmt(t.progress.valueText, { percent: percent(progress, lang), done, total }) : percent(progress, lang);
    panel = (
      <div
        class="fo-level"
        role="progressbar"
        aria-label={texts.progressLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-valuetext={valueText}
        aria-busy={m.zipping ? 'true' : undefined}
        style={`--level:${progress}%`}
      >
        <div class="fo-water fo-water--moving">
          <Oli pose="swim" class="fo-level__oli" />
        </div>
        <div class="fo-level__text">
          <span class="fo-level__pct">{progress}%</span>
          {m.zipping ? (
            <span class="fo-level__msg fo-level__msg--busy">
              <span class="fo-spin" aria-hidden="true" />
              {pdf ? texts.progressLabel : fmt(t.result.zipping, { count: rows.length })}
            </span>
          ) : (
            <span class="fo-level__msg">{t.progress.working}</span>
          )}
          {total >= 2 && !m.zipping && <span class="fo-level__count">{fmt(t.progress.count, { done, total })}</span>}
        </div>
      </div>
    );
  } else if (showCard) {
    const savedText = percent(tot.saved, lang);
    const afterBytes = pdf && m.bundle ? m.bundle.blob.size : tot.after;
    const more = tot.count > 1;
    const counted = more || pdf;
    const lead = more ? fmt(t.result.downloadZip, { size: fileSize(deliverable?.size ?? 0, lang) }) : '';
    const [zipHead = '', ...zipTail] = lead.split(' · ');
    panel = (
      <section class="fo-result fo-deep" aria-live="polite">
        <div class="fo-result__head">
          <Oli pose="cheer" class="fo-result__oli" />
          <p class="fo-result__says">{saysFor(rows)}</p>
          {compression && tot.anyNew && worthSaying(tot.saved) && (
            <div class="fo-placard fo-pop">
              <span class="fo-placard__n">{MINUS + savedText}</span>
              <span class="fo-placard__l">{texts.placardLabel}</span>
            </div>
          )}
        </div>
        <dl class="fo-result__stats">
          {afterBytes < tot.before && (
            <div class="fo-result__stat fo-result__stat--before">
              <dt>{t.result.before}</dt>
              <dd>{fileSize(tot.before, lang)}</dd>
            </div>
          )}
          <div class="fo-result__stat">
            <dt>{t.result.after}</dt>
            <dd>{fileSize(afterBytes, lang)}</dd>
          </div>
          <div class="fo-result__stat">
            <dt>{counted ? t.result.files : t.result.size}</dt>
            <dd>{counted ? tot.count : `${rows[0]?.output.width} × ${rows[0]?.output.height}`}</dd>
          </div>
        </dl>
        <div class="fo-result__actions">
          {deliverable && (
            <a
              ref={downloadRef}
              class="fo-btn fo-btn--download fo-btn--lg"
              href={deliverable.url}
              download={deliverable.name}
              onClick={() => track('download', tracked)}
            >
              <Icon raw={downloadIcon} />
              {more && !pdf ? zipHead : t.result.download}{' '}
              <span class="fo-btn__meta">{more && !pdf ? `· ${zipTail.join(' · ')}` : `· ${fileSize(deliverable.size, lang)}`}</span>
            </a>
          )}
          <button type="button" class="fo-btn fo-btn--ghost" onClick={startOver}>
            {t.result.startOver}
          </button>
        </div>
        <ul class="fo-result__notes">
          {tot.notes.map((note) => (
            <li key={note}>{noteText(note, rows)}</li>
          ))}
          <li>{t.result.metadata}</li>
        </ul>
        {wide && comparison}
        {m.coffee && m.phase === 'done' && (
          <div class="fo-result__support">
            <p>{t.result.coffee.text}</p>
            <div class="fo-result__support-actions">
              <a class="fo-btn" href={coffeeHref} rel={coffeeHref.startsWith('/') ? undefined : 'noopener'} onClick={() => track('donate_click', { place: 'result', lang })}>
                <Icon raw={coffeeIcon} class="fo-icon--sm" />
                {t.result.coffee.button}
              </a>
              <button
                type="button"
                class="fo-btn fo-btn--ghost"
                onClick={() => {
                  dontShowAgain();
                  m.coffee = false;
                  render();
                  downloadRef.current?.focus();
                }}
              >
                {t.result.coffee.hide}
              </button>
            </div>
          </div>
        )}
      </section>
    );
  } else {
    const several = m.items.length > 1;
    panel = (
      <div class="fo-drop" data-state={dropState} onClick={onZoneClick} {...dragHandlers}>
        <div class="fo-drop__sea">
          <div class="fo-water" />
        </div>
        <Oli pose={oliPose} class="fo-drop__oli" />
        <div class="fo-drop__badge" aria-hidden="true">
          <Icon raw={badge} />
        </div>
        {dropState === 'over' ? (
          <>
            <p class="fo-drop__title">{t.drop.over}</p>
            <p class="fo-drop__help">{over > 1 ? fmt(t.drop.overCount, { count: over }) : t.drop.overHelp}</p>
          </>
        ) : dropState === 'error' ? (
          <>
            <div role="alert" class="fo-drop__message">
              <p class="fo-drop__title">{t.errors.title}</p>
              <p class="fo-drop__help">{several || !single ? fmt(t.errors.all, { count: m.items.length }) : reasonOf(single)}</p>
            </div>
            <button ref={chooseRef} type="button" class="fo-btn" onClick={openPicker}>
              {t.errors.chooseAnother}
            </button>
          </>
        ) : (
          <>
            <p class="fo-drop__title fo-desktop-only">{t.drop.title}</p>
            <button
              ref={chooseRef}
              type="button"
              class="fo-btn fo-btn--brand fo-btn--lg fo-btn--block-mobile"
              aria-describedby="fo-drop-help"
              onClick={openPicker}
              onFocus={warmOnce}
            >
              <Icon raw={imageIcon} />
              {t.drop.choose}
            </button>
            <p class="fo-drop__help" id="fo-drop-help">
              <span class="fo-desktop-only">
                {helpBefore}
                <span class="fo-kbd">{t.drop.pasteKey}</span>
                {helpAfter}
              </span>
              <span class="fo-mobile-only">{fmt(t.drop.help, { formats: texts.formats })}</span>
            </p>
          </>
        )}
      </div>
    );
  }

  // --- the queue ---------------------------------------------------------------------------------

  const shown = m.expanded ? m.items : m.items.slice(0, VISIBLE_ROWS);
  const hidden = m.items.length - shown.length;
  const labels = { to: t.queue.to, download: t.queue.download, cancel: t.queue.cancel, remove: t.queue.remove, select: t.queue.select };
  const showQueue = m.items.length >= 2;

  function rowProps(item: Item): FileCardProps {
    const name = nameOf(item);
    const thumb = item.output && item.outUrl && item.output.format !== 'avif' ? item.outUrl : item.output ? originalUrl(item) : null;
    const base = { name, category: 'image' as const, labels, ...(thumb ? { thumb } : {}) };
    const pick =
      selectable && item.output
        ? { selected: picked?.item.id === item.id, onSelect: () => { m.selected = item.id; render(); } }
        : {};
    if (item.status === 'waiting') return { ...base, state: 'waiting', status: t.queue.waiting, onCancel: () => removeItem(item) };
    if (item.status === 'working') return { ...base, ...pick, state: 'working', status: t.queue.working, progress: item.progress, onCancel: () => removeItem(item) };
    if (item.status === 'error' || !item.output) return { ...base, state: 'error', reason: reasonOf(item), onRemove: () => removeItem(item) };
    const output = item.output;
    const outName = nameFor.get(item.id) ?? name;
    const gained = (1 - output.blob.size / item.file.size) * 100;
    const dims = `${output.width} × ${output.height}`;
    const sizes = pdf ? { before: fileSize(item.file.size, lang) } : { before: fileSize(item.file.size, lang), after: fileSize(output.blob.size, lang) };
    const verdict =
      compression && output.outcome === 'new' && worthSaying(gained)
        ? { gain: MINUS + percent(gained, lang) }
        : { note: compression ? t.queue.unchanged : dims };
    return {
      ...base,
      ...pick,
      state: 'done',
      ...sizes,
      ...verdict,
      downloadName: outName,
      ...(pdf ? {} : { onDownload: () => downloadItem(item, outName) }),
    };
  }

  const queue = showQueue && (
    <div class="fo-queue">
      <div class="fo-filelist" role="list" aria-label={t.queue.label} ref={listRef}>
        {shown.map((item) => (
          <div role="listitem" key={item.id} class="fo-filelist__row">
            <FileCard {...rowProps(item)} />
          </div>
        ))}
      </div>
      {hidden > 0 && (
        <button
          type="button"
          class="fo-btn fo-queue__more"
          aria-expanded="false"
          onClick={() => {
            m.expanded = true;
            render();
            window.setTimeout(() => listRef.current?.querySelectorAll<HTMLElement>('.fo-filelist__row')[VISIBLE_ROWS]?.querySelector<HTMLElement>('button')?.focus(), 0);
          }}
        >
          {fmt(t.queue.showMore, { count: hidden })}
        </button>
      )}
    </div>
  );

  // --- options and chips ---------------------------------------------------------------------------

  const selectedFile: SelectedFile | null = (() => {
    if (!tool.selectable || !picked) return null;
    return { ...infoOf(picked.item), url: picked.item.previewUrl ?? originalUrl(picked.item) };
  })();

  return (
    <div class="fo-tool-island" ref={rootRef}>
      <div class="fo-slot" onPointerEnter={warmOnce}>
        {panel}
      </div>
      <p class="fo-sr" role="status">
        {m.announce}
      </p>
      {!wide && comparison}
      {Options && (
        <Options
          state={state}
          update={update}
          texts={texts.options}
          panel={t}
          lang={lang}
          files={m.items.map(infoOf)}
          selected={selectedFile}
          select={(id) => {
            m.selected = id;
            render();
          }}
          busy={m.phase === 'processing'}
        />
      )}
      {queue}
      {showCard && m.phase === 'done' && chips.length > 0 && (
        <nav class="fo-next" aria-labelledby="fo-next-label">
          <span class="fo-next__label" id="fo-next-label">
            {t.next.label}
          </span>
          {chips.map((chip) => (
            <a
              key={chip.href}
              class={chip.category === 'none' ? 'fo-chip' : `fo-chip fo-cat--${chip.category}`}
              href={chip.href}
              onClick={() => track('next_step_click', { ...tracked, target: chip.target })}
            >
              <span class="fo-chip__dot" aria-hidden="true">
                <Icon inner={chip.icon} />
              </span>
              {chip.name}
              <Icon raw={arrowIcon} />
            </a>
          ))}
        </nav>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={acceptAttribute(accepts)}
        hidden
        onChange={(event) => {
          const target = event.currentTarget;
          const files = filesOf(target.files);
          target.value = '';
          startBatch(files);
        }}
      />
    </div>
  );
}
