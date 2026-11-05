// The tool panel island, shared by every image tool (DECISOES § 23: rendered by the server, hydrated by
// the tool's mount.ts from data-props). One island per page. DropZone, WaterLevel and ResultCard share
// one slot; the queue of FileCards grows below it. A batch has no size limit: files come from a drop
// anywhere on the panel, the picker or Ctrl+V, and go through the engine one at a time. Options
// re-process the whole batch at once (no Apply button, the focus stays where it is). Markup and classes
// follow docs/design/components (v1.1). The Oli boxes draw from the page sprite (§ 44).
//
// F13a · a página de ferramenta "um lugar só" (UX-04 A; DECISOES § 463 and § 464 to § 472): the rectangle
// (.fo-slot) has one height in every state, and the one Oli sits in its top-right corner (wave, gulp, swim, cheer, oops,
// buoy). The result is the water that rose: the sentence, the placard that floats (aria-hidden), the line "2.6 MB → 717 KB",
// the Download, Start over and "Before and after" (it opens only when asked), the notes and the coffee line. The band under
// the rectangle (.fo-band) keeps its height: the options before the result; the chips and the options folded under
// "Adjust" after it. Nothing grows without a gesture of the person: the band keeps the height it had when the batch
// started, and the rectangle keeps the room of the coffee line from the start of the batch that will show it.
//
// State lives in one mutable model (the run loop is async and must see the latest values); every change
// calls render(). Outputs are kept as Blobs, object URLs are revoked when replaced and at "Start over".
import { useEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren, JSX, TargetedMouseEvent } from 'preact';
import type { ImagePanelTexts } from '../../i18n/types.ts';
import { fileSize, fmt, percent } from '../../i18n/format.ts';
import { browserLabel, track } from '../../analytics/events.ts';
import type { EngineFailure, EngineOutput, EngineResult, Note, Operation, Sniffed } from '../../engine/image/types.ts';
import type { Pose } from '../../oli/poses.ts';
import Icon from '../../icons/Icon.tsx';
import FileCard, { type FileCardProps } from '../../components/FileCard.tsx';
import BeforeAfter from './BeforeAfter.tsx';
import Oli from './Oli.tsx';
import { coffeeAhead, countUse, dontShowAgain, forgetWithoutConsent, type CoffeeLine } from './coffee.ts';
import { EXTENSION, imageExtensionOf, uniqueNames } from './names.ts';
import { carriesFiles, dragCount, filesOf, imageFilesOf, pasteBelongsToElement } from './paste.ts';
import { takeInbox } from './inbox.ts';
import { acceptAttribute, batchOutcome, batchPercent, codecOf, isLossy, totals, worthSaying, type Ready } from './summary.ts';
import type { ChipData, FileInfo, ImagePanelData, ImageTool, SelectedFile } from './types.ts';
import alertIcon from '../../../docs/design/assets/Icons/alert.svg?raw';
import arrowIcon from '../../../docs/design/assets/Icons/arrow-right.svg?raw';
import chevronDownIcon from '../../../docs/design/assets/Icons/chevron-down.svg?raw';
import coffeeIcon from '../../../docs/design/assets/Icons/coffee.svg?raw';
import downloadIcon from '../../../docs/design/assets/Icons/download.svg?raw';
import imageIcon from '../../../docs/design/assets/Icons/image.svg?raw';
// F13a · UX-16 (DECISOES § 493): the seal of the DropZone at rest is the file that goes into the water (file-drop).
import fileDropIcon from '../../../docs/design/assets/Icons/file-drop.svg?raw';
import offlineIcon from '../../../docs/design/assets/Icons/offline.svg?raw';

export interface ImagePanelProps<S extends object, O> extends ImagePanelData<O> {
  tool: ImageTool<S, O>;
}

const SHOW_PROGRESS_AFTER_MS = 400;
/** Rows shown before "Show N more". */
const VISIBLE_ROWS = 6;
const MINUS = '−';
/**
 * A file the panel could not hand to the engine: the engine, the page path or the PDF worker did not load (offline, or a
 * chunk gone after a deploy). It is no fault of the file, so it says so and is tried again on the next run (§ 102).
 */
interface LoadFailure {
  ok: false;
  reason: 'load';
  source?: undefined;
}
type Failure = EngineFailure | LoadFailure;
type RunResult = EngineResult | LoadFailure;
const LOAD_FAILED: LoadFailure = { ok: false, reason: 'load' };
/** The error that means the engine's code did not arrive, as opposed to a file that failed. */
const UNAVAILABLE = 'EngineUnavailable';
const unavailable = (): Error => Object.assign(new Error('the engine could not load'), { name: UNAVAILABLE });

/** These failures do not depend on the options: the file is not tried again when an option changes. */
const HOPELESS = new Set<Failure['reason']>(['empty', 'unsupported', 'wrong-tool', 'truncated', 'decode']);

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
  failure: Failure | null;
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
  coffee: CoffeeLine;
  completeSent: boolean;
  /** A batch counts once for the coffee line, however many times an option re-runs it. */
  newUse: boolean;
  focusDownload: boolean;
  broken: Set<string>;
  /** The queue row whose control had the focus when the last render was asked for (the focus may be lost with it). */
  rowFocus: number | null;
  /** The focus was inside the slot (drop zone, WaterLevel or card) when the last render was asked for. */
  slotFocus: boolean;
  /** The focus was inside the band (the options, the chips, Adjust) when the last render was asked for. */
  bandFocus: boolean;
  /** Rows that take the focus when the row that had it is gone: the next one, then the previous one. */
  successors: number[];
  /** A row that takes the focus once it is on screen (the first one that "Show N more" reveals). */
  focusRowId: number | null;
  /** F13a (UX-04 A): the comparison is open, because the person asked; it starts closed with every batch. */
  compareOpen: boolean;
  /** F13a (DECISOES § 470): the rectangle keeps the room of the coffee line, from the start of the batch that shows it. */
  coffeeRoom: boolean;
  /** F13a (DECISOES § 466): the band keeps the height it had when the batch started, until Start over. */
  bandLock: number | null;
}

function newModel(): Model {
  return {
    items: [], phase: 'idle', runId: 0, nextId: 1, finished: 0, total: 0, zipping: false, showLevel: false, hadCard: false, bundle: null,
    selected: null, expanded: false, announce: '', coffee: '', completeSent: false, newUse: false, focusDownload: false, broken: new Set(),
    rowFocus: null, slotFocus: false, bandFocus: false, successors: [], focusRowId: null, compareOpen: false, coffeeRoom: false, bandLock: null,
  };
}

/** Offline right now, as the browser says: a failed engine load then gets the offline line (F8; DECISOES § 292). */
function offlineNow(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
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

/** A row of chips under a label (NextStepChips): the next steps after a result, or the right tool after a refusal. */
function ChipRow({ id, label, chips, onPick }: { id: string; label: string; chips: ChipData[]; onPick?: (chip: ChipData) => void }) {
  return (
    <nav class="fo-next" aria-labelledby={id}>
      <span class="fo-next__label" id={id}>
        {label}
      </span>
      {chips.map((chip) => (
        <a key={chip.href} class={chip.category === 'none' ? 'fo-chip' : `fo-chip fo-cat--${chip.category}`} href={chip.href} onClick={onPick ? () => onPick(chip) : undefined}>
          <span class="fo-chip__dot" aria-hidden="true">
            <Icon inner={chip.icon} />
          </span>
          {chip.name}
          <Icon raw={arrowIcon} />
        </a>
      ))}
    </nav>
  );
}

export default function ImagePanel<S extends object, O>(props: ImagePanelProps<S, O>) {
  const { lang, page, t, texts, accepts, beforeAfter, pdf, chips, converters, elsewhere, coffeeHref, tool, initial } = props;
  const { Options } = tool;
  const model = useRef<Model>(newModel());
  const m = model.current;
  const [, setTick] = useState(0);
  const [over, setOver] = useState(0);
  const [state, setState] = useState<S>(() => (initial ? { ...tool.initial, ...(initial as Partial<S>) } : tool.initial));
  const stateRef = useRef<S>(state);
  const rootRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseRef = useRef<HTMLButtonElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const startOverRef = useRef<HTMLButtonElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  /**
   * Every change goes through here. Before the page is drawn again it notes where the focus is, because a control
   * that goes away with the new picture (a row that is removed or finished, the drop zone that gives way to the
   * WaterLevel) takes the focus with it and the browser leaves it on the page. The effect below gives it back.
   */
  const render = () => {
    const active = document.activeElement;
    if (active && active !== document.body && rootRef.current?.contains(active)) {
      const row = active.closest<HTMLElement>('[data-row]');
      if (row) m.rowFocus = Number(row.dataset['row']);
      else if (slotRef.current?.contains(active)) m.slotFocus = true;
      else if (bandRef.current?.contains(active)) m.bandFocus = true;
    }
    setTick((tick) => tick + 1);
  };
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

  function settle(item: Item, result: RunResult, key: string): void {
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
      const { buildPdf } = await import('./pdf-client.ts').catch(() => {
        throw unavailable();
      });
      const pages = items.flatMap((item) =>
        item.output ? [{ blob: item.output.blob, format: item.output.format === 'png' ? ('png' as const) : ('jpeg' as const), width: item.output.width, height: item.output.height }] : [],
      );
      const blob = await buildPdf(pages, pdfKey as 'image' | 'letter' | 'a4');
      return { kind: 'pdf', blob, name: items.length === 1 ? names[0] ?? `${t.files.pdf}.pdf` : `${t.files.pdf}.pdf`, key: pdfKey };
    }
    if (items.length < 2) return null;
    const { zipFiles } = await import('./engine-client.ts').catch(() => {
      throw unavailable();
    });
    const blob = await zipFiles(items.flatMap((item, index) => (item.output ? [{ name: names[index] ?? `${index}.bin`, blob: item.output.blob }] : [])));
    return { kind: 'zip', blob, name: `${t.files.zip}.zip`, key: '' };
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
        let result: RunResult | null;
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
            : LOAD_FAILED;
        } catch {
          // processFile never rejects for a bad file (engine-client.ts): an exception here is code that did not load.
          result = LOAD_FAILED;
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
        } catch (error) {
          // A PDF worker or a ZIP chunk that never arrived is a load failure; anything else is the browser failing to write.
          const failure: RunResult = error instanceof Error && error.name === UNAVAILABLE ? LOAD_FAILED : { ok: false, reason: 'encode' };
          for (const item of done) settle(item, failure, '');
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
      m.coffee = countUse() ? 'ask' : '';
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
    m.coffee = '';
    m.compareOpen = false;
    // The 3rd use is known before its result (DECISOES § 470): the page gave the rectangle the room of the coffee
    // line before its first paint, or Start over did; here is the last chance, for a batch dropped on a result. The band
    // keeps the height it has now, so the shorter row of the result never pulls the page up (§ 466). Neither
    // shrinks before a click on Start over.
    m.coffeeRoom = m.coffeeRoom || coffeeAhead();
    const band = bandRef.current?.offsetHeight ?? 0;
    if (band > 0) m.bandLock = Math.max(m.bandLock ?? 0, band);
    m.announce = texts.progressLabel; // the status region speaks while the batch runs, then says how it ended
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
    if (m.items.length > 0) {
      m.announce = ''; // a live region speaks only when its text changes: the same sentence needs an empty one before it
      void run();
    }
  }

  function startOver(): void {
    m.runId += 1;
    teardown();
    m.phase = 'idle';
    m.hadCard = false;
    m.announce = '';
    m.coffee = '';
    m.selected = null;
    m.zipping = false;
    m.compareOpen = false;
    // Start over is a click: the rectangle may change here. It keeps the room of the coffee line when the next use is the
    // one that shows it (the 2nd use was just done), and gives it back otherwise (DECISOES § 470).
    m.coffeeRoom = coffeeAhead();
    m.bandLock = null;
    setOver(0);
    render();
    window.setTimeout(() => chooseRef.current?.focus(), 0);
  }

  function removeItem(item: Item): void {
    const at = m.items.indexOf(item);
    m.successors = [m.items[at + 1]?.id, m.items[at - 1]?.id].filter((id): id is number => id !== undefined);
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

  /** D-17 (DECISOES § 469): the file is of the format another tool of the site takes (a PNG on HEIC to JPG). */
  const goesElsewhere = (item: Item): boolean =>
    elsewhere !== undefined && texts.elsewhere !== undefined && item.failure?.reason === 'wrong-tool' && item.failure.source === elsewhere.format;

  function reasonOf(item: Item): ComponentChildren {
    const failure = item.failure;
    if (!failure) return '';
    const name = nameOf(item);
    const errors = t.errors;
    switch (failure.reason) {
      case 'empty': return fmt(errors.empty, { name });
      case 'unsupported': {
        // D-06 (DECISOES § 468): a name that promises a picture over bytes that are none hears that the two
        // disagree, and how to make a real one, never "try PNG" for a file that already says it is a PNG.
        const extension = failure.source === 'unknown' ? imageExtensionOf(name) : null;
        if (extension) return fmt(errors.mismatch, { name, extension, formats: texts.formats });
        return fmt(errors.unsupported, { name, formats: texts.formats });
      }
      case 'truncated': return fmt(errors.truncated, { name });
      case 'decode': return fmt(errors.decode, { name });
      case 'encode': return fmt(errors.encode, { name });
      case 'too-large': return fmt(errors.tooLarge, { name });
      case 'load': return fmt(offlineNow() ? errors.offlineRow : errors.load, { name });
      case 'wrong-tool': {
        // The sentence is split before the file name goes in, so a name that holds "{tool}" cannot move anything.
        if (goesElsewhere(item) && elsewhere && texts.elsewhere) {
          const [before = '', after = ''] = texts.elsewhere.reason.split('{tool}').map((part) => fmt(part, { name }));
          return `${before}${elsewhere.chip.name}${after}`;
        }
        const link = failure.source === 'heic' ? converters.heic : failure.source === 'avif' ? converters.avif : undefined;
        const format = formatName(failure.source);
        if (!link) return fmt(errors.wrongFormat, { name, format, formats: texts.formats });
        const [before = '', after = ''] = errors.wrongTool.split('{tool}').map((part) => fmt(part, { name, format }));
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

  useEffect(() => {
    forgetWithoutConsent();
    // The inline script of the page (COFFEE_AHEAD_SCRIPT) may have given the rectangle the room of the coffee line before
    // the first paint, which hydration keeps as it is: the model takes the same answer, so the attribute is the island's
    // from now on (and goes away at Start over, a click). DECISOES § 470.
    const ahead = coffeeAhead();
    if (!ahead) slotRef.current?.removeAttribute('data-coffee');
    if (ahead !== m.coffeeRoom) {
      m.coffeeRoom = ahead;
      render();
    }
  }, []);

  /** A row of the queue takes the focus: its first button, or the row itself when it has none (a finished row of Image to PDF). */
  function focusRow(id: number): boolean {
    const row = listRef.current?.querySelector<HTMLElement>(`[data-row="${id}"]`);
    const target = row?.querySelector<HTMLElement>('button, a[href]') ?? row;
    target?.focus();
    return Boolean(target);
  }

  useEffect(() => {
    if (m.phase === 'done' && m.focusDownload && downloadRef.current) {
      m.focusDownload = false;
      downloadRef.current.focus();
    }
    if (m.focusRowId !== null) {
      focusRow(m.focusRowId);
      m.focusRowId = null;
    }
    // The control that had the focus is gone and the page has it: the same row if it is still there (its Cancel gave
    // way to its Download), else the next row, the previous one, and last the control the panel shows now. In the band,
    // the options that gave way to the result's row come back folded: the focus goes to "Adjust".
    const active = document.activeElement;
    if (!active || active === document.body || active === document.documentElement) {
      if (m.rowFocus !== null) {
        const wanted = [m.rowFocus, ...m.successors];
        if (!wanted.some(focusRow)) (levelRef.current ?? startOverRef.current ?? chooseRef.current ?? downloadRef.current)?.focus();
      } else if (m.slotFocus) {
        (levelRef.current ?? downloadRef.current ?? startOverRef.current ?? chooseRef.current)?.focus();
      } else if (m.bandFocus) {
        (summaryRef.current ?? bandRef.current?.querySelector<HTMLElement>('input, button, a[href], summary'))?.focus();
      }
    }
    m.rowFocus = null;
    m.slotFocus = false;
    m.bandFocus = false;
    m.successors = [];
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
    // The files shared with the installed app, when the "Open with" page sent them here (F8; DECISOES § 290).
    void takeInbox(page).then((files) => {
      if (files.length > 0) startBatch(files);
    });
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
  // Every file failed to load the engine while the device is offline: the tool was kept without its engine (F8).
  const offline = m.phase === 'error' && m.items.length > 0 && m.items.every((item) => item.failure?.reason === 'load') && offlineNow();
  const dropState = over > 0 && m.phase !== 'processing' ? 'over' : offline ? 'offline' : m.phase === 'error' ? 'error' : undefined;
  const names = outputNames(ready());
  const nameFor = new Map(ready().map((item, index) => [item.id, names[index] ?? '']));
  const single = m.items.length === 1 ? m.items[0] : undefined;

  /** The picture the comparison needs: original (or a decoded copy) against the result of the picked file. */
  const picked = rows.find((row) => row.item.id === m.selected) ?? rows[0] ?? null;
  const selectable = tool.selectable ?? beforeAfter !== 'never';
  const comparable = (() => {
    if (!showCard || beforeAfter === 'never' || !picked || picked.output.outcome !== 'new') return null;
    if (beforeAfter === 'lossy' && !isLossy(picked.output.format)) return null;
    if (!picked.item.outUrl || m.broken.has(`${picked.item.id}:${picked.item.outUrl}`)) return null;
    return { item: picked.item, output: picked.output, outUrl: picked.item.outUrl };
  })();

  const deliverable = (() => {
    if (pdf || rows.length >= 2) return m.bundle ? { url: m.bundle.url, name: m.bundle.name, size: m.bundle.blob.size } : null;
    const only = rows[0];
    return only?.item.outUrl ? { url: only.item.outUrl, name: nameFor.get(only.item.id) ?? '', size: only.output.blob.size } : null;
  })();

  // The one Oli of the rectangle, in its corner, says the state (UX-04 A; DECISOES § 465).
  const pose: Pose = showProgress ? 'swim' : showCard ? 'cheer' : dropState === 'over' ? 'gulp' : dropState === 'offline' ? 'buoy' : dropState === 'error' ? 'oops' : 'wave';
  const islandState = m.phase === 'processing' && !showCard ? 'working' : showCard ? 'done' : dropState === 'over' ? 'over' : dropState ? 'error' : 'rest';
  const badge = dropState === 'over' ? downloadIcon : dropState === 'offline' ? offlineIcon : fileDropIcon;
  const [helpBefore = '', helpAfter = ''] = fmt(t.drop.helpDesktop, { formats: texts.formats }).split('{kbd}');

  let panel: JSX.Element;
  if (showProgress) {
    const done = Math.min(m.finished, total);
    const valueText = total >= 2 ? fmt(t.progress.valueText, { percent: percent(progress, lang), done, total }) : percent(progress, lang);
    panel = (
      <div
        ref={levelRef}
        tabindex={-1}
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
        <div class="fo-water fo-water--moving" />
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
    // F10 p-13 (DECISOES § 472): a tool with no placard says the change of size with its sign, "+66%" when the file
    // grew (a HEIC that becomes a JPG), so no line of the card says it got lighter when it did not.
    const change = tot.before > 0 ? ((afterBytes - tot.before) / tot.before) * 100 : 0;
    const showChange = !compression && worthSaying(Math.abs(change));
    // No aria-live on the card: the status region below says the Oli's sentence once, with the final numbers. With
    // both, a batch was read N + 1 times, with "Done!" and figures that were not final yet (DECISOES § 102 and § 467).
    panel = (
      <section class="fo-result fo-deep" aria-labelledby="fo-says">
        <div class="fo-water fo-result__sea" />
        <div class="fo-result__head">
          {compression && tot.anyNew && worthSaying(tot.saved) && (
            // The placard floats at the surface, held by the Oli; it repeats the number of the sentence (aria-hidden).
            <div class="fo-placard fo-pop" aria-hidden="true">
              <span class="fo-placard__n">{MINUS + savedText}</span>
              <span class="fo-placard__l">{texts.placardLabel}</span>
            </div>
          )}
          <p class="fo-result__says" id="fo-says">
            {saysFor(rows)}
          </p>
        </div>
        <dl class="fo-numbers">
          <div class="fo-numbers__before">
            <dt class="fo-sr">{t.result.before}</dt>
            <dd>{fileSize(tot.before, lang)}</dd>
          </div>
          <div>
            <dt class="fo-sr">{t.result.after}</dt>
            <dd>
              <Icon raw={arrowIcon} class="fo-icon--inline" />
              <span class="fo-sr">{t.queue.to} </span>
              {fileSize(afterBytes, lang)}
            </dd>
          </div>
          {showChange && (
            <div class="fo-numbers__change">
              <dt class="fo-sr">{t.result.change}</dt>
              <dd>{(change > 0 ? '+' : MINUS) + percent(Math.abs(change), lang)}</dd>
            </div>
          )}
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
          <div class="fo-result__more">
            <button ref={startOverRef} type="button" class="fo-btn fo-btn--ghost" onClick={startOver}>
              {t.result.startOver}
            </button>
            {comparable && (
              <button
                type="button"
                class="fo-btn fo-btn--ghost"
                aria-expanded={m.compareOpen ? 'true' : 'false'}
                aria-controls="fo-compare"
                onClick={() => {
                  m.compareOpen = !m.compareOpen;
                  render();
                }}
              >
                {t.compare.open}
              </button>
            )}
          </div>
        </div>
        {comparable && (
          // The comparison opens only when the person asks (UX-04 A): its pictures are not even decoded before.
          <div class="fo-result__compare" id="fo-compare" hidden={!m.compareOpen}>
            {m.compareOpen && (
              <BeforeAfter
                key={`${comparable.item.id}:${comparable.outUrl}`}
                label={t.compare.label}
                beforeUrl={comparable.item.previewUrl ?? originalUrl(comparable.item)}
                afterUrl={comparable.outUrl}
                beforeTag={fmt(t.compare.before, { size: fileSize(comparable.item.file.size, lang) })}
                afterTag={fmt(t.compare.after, { size: fileSize(comparable.output.blob.size, lang) })}
                width={comparable.output.width}
                height={comparable.output.height}
                onBroken={() => {
                  m.broken.add(`${comparable.item.id}:${comparable.outUrl}`);
                  render();
                }}
              />
            )}
          </div>
        )}
        <ul class="fo-result__notes">
          {tot.notes.map((note) => (
            <li key={note}>{noteText(note, rows)}</li>
          ))}
          {!counted && rows[0] && (
            // The size in pixels of one picture, from 768 px (UX-04 A): on a phone the card keeps its height for the rest.
            <li class="fo-desktop-only">{`${t.result.size}: ${rows[0].output.width} × ${rows[0].output.height} px`}</li>
          )}
          <li>{t.result.metadata}</li>
        </ul>
        {m.coffee && m.phase === 'done' && (m.coffee === 'done' ? (
          // "Don't show this again" leaves one quiet sentence in the same place, read once (DECISOES § 436).
          <p class="fo-result__support--done" role="status">{t.result.coffee.done}</p>
        ) : (
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
                  m.coffee = 'done';
                  render();
                  downloadRef.current?.focus();
                }}
              >
                {t.result.coffee.hide}
              </button>
            </div>
          </div>
        ))}
      </section>
    );
  } else {
    const several = m.items.length > 1;
    const error = dropState === 'error';
    const button = dropState !== 'over';
    // The children keep their places in every state (a hole where a state has none), so the button of the rest is the
    // same node as the "Choose other files" of the error and of the offline line: Preact never moves it, the focus stays on
    // it (a moved node loses the focus), and the cookie notice's keep() lifts it when it comes under the notice (D-01).
    panel = (
      <div class="fo-drop" data-state={dropState} onClick={onZoneClick} {...dragHandlers}>
        <div class="fo-drop__sea">
          <div class="fo-water" />
        </div>
        {error ? null : (
          <div class="fo-drop__badge" aria-hidden="true">
            <Icon raw={badge} />
          </div>
        )}
        {error ? (
          // The error loses the round seal (UX-04 A): the sentence with the alert icon, the reason that says the case, and the
          // way out right under them (DECISOES § 468).
          <div role="alert" class="fo-drop__error">
            <p class="fo-drop__error-title">
              <Icon raw={alertIcon} />
              {t.errors.title}
            </p>
            <p class="fo-drop__why">{several || !single ? fmt(t.errors.all, { count: m.items.length }) : reasonOf(single)}</p>
          </div>
        ) : dropState === 'offline' ? (
          <div role="status" class="fo-drop__message">
            <p class="fo-drop__title">{t.errors.offline}</p>
            <p class="fo-drop__help">{t.errors.offlineHelp}</p>
          </div>
        ) : dropState === 'over' ? (
          <p class="fo-drop__title">{t.drop.over}</p>
        ) : (
          <p class="fo-drop__title fo-desktop-only">{t.drop.title}</p>
        )}
        {button ? (
          <button
            ref={chooseRef}
            type="button"
            class={dropState ? 'fo-btn' : 'fo-btn fo-btn--brand fo-btn--lg fo-btn--block-mobile'}
            aria-describedby={dropState ? undefined : 'fo-drop-help'}
            onClick={openPicker}
            onFocus={warmOnce}
          >
            {dropState ? null : <Icon raw={imageIcon} />}
            {dropState ? t.errors.chooseAnother : t.drop.choose}
          </button>
        ) : (
          <p class="fo-drop__help">{over > 1 ? fmt(t.drop.overCount, { count: over }) : t.drop.overHelp}</p>
        )}
        {dropState ? null : (
          <p class="fo-drop__help" id="fo-drop-help">
            <span class="fo-desktop-only">
              {helpBefore}
              <span class="fo-kbd">{t.drop.pasteKey}</span>
              {helpAfter}
            </span>
            <span class="fo-mobile-only">{fmt(t.drop.help, { formats: texts.formats })}</span>
          </p>
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
          <div role="listitem" key={item.id} class="fo-filelist__row" data-row={item.id} tabindex={-1} aria-label={nameOf(item)}>
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
            m.focusRowId = m.items[VISIBLE_ROWS]?.id ?? null; // the button goes away: the first new row takes the focus
            render();
          }}
        >
          {fmt(t.queue.showMore, { count: hidden })}
        </button>
      )}
    </div>
  );

  // --- the band: options before the result, chips and "Adjust" after it ----------------------------------

  const selectedFile: SelectedFile | null = (() => {
    if (!tool.selectable || !picked) return null;
    return { ...infoOf(picked.item), url: picked.item.previewUrl ?? originalUrl(picked.item) };
  })();

  const options = Options && (
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
  );
  // The band shows one of three rows (DECISOES § 466 and § 469). After a result of this batch (also while an
  // option runs it again) it is the chips and "Adjust", in the same nodes, so the focus on an option survives the re-run.
  const elsewhereError = m.phase === 'error' && !offline && single !== undefined && goesElsewhere(single);
  const band = m.hadCard ? 'after' : elsewhereError ? 'elsewhere' : 'options';

  return (
    <div class="fo-tool-island" ref={rootRef} data-state={islandState}>
      <div class="fo-slot" ref={slotRef} onPointerEnter={warmOnce} data-coffee={m.coffeeRoom ? '' : undefined}>
        <Oli pose={pose} class="fo-slot__oli" />
        {panel}
      </div>
      <p class="fo-sr" role="status">
        {m.announce}
      </p>
      <div class="fo-band" ref={bandRef} style={m.bandLock ? `--fo-band-lock:${m.bandLock}px` : undefined}>
        <div class="fo-band__now">
          {band === 'options' && options}
          {band === 'elsewhere' && elsewhere && texts.elsewhere && <ChipRow id="fo-elsewhere-label" label={texts.elsewhere.label} chips={[elsewhere.chip]} />}
          {band === 'after' && chips.length > 0 && (
            <ChipRow id="fo-next-label" label={t.next.label} chips={chips} onPick={(chip) => track('next_step_click', { ...tracked, target: chip.target })} />
          )}
          {band === 'after' &&
            (tool.now ? (
              <details class="fo-adjust">
                <summary ref={summaryRef}>
                  <span>
                    {t.adjust.label} <span class="fo-adjust__now">· {tool.now(state, texts.options, lang)}</span>
                  </span>
                  <Icon raw={chevronDownIcon} />
                </summary>
                <div class="fo-adjust__body">
                  <p class="fo-field__help">{texts.adjustHelp ?? t.adjust.help}</p>
                  {options}
                </div>
              </details>
            ) : (
              options
            ))}
        </div>
        {chips.length > 0 && (
          // The room of the result's row, kept from the first paint (DECISOES § 466): a hidden copy of the chips and
          // of the "Adjust" line in the same cell as the row on screen, so the band is as tall as the taller of the two in
          // every state, in every language, and the chips that wrap to three lines on a phone push nothing down.
          <div class="fo-band__ghost" aria-hidden="true">
            <div class="fo-band__chips">
              <span class="fo-next__label">{t.next.label}</span>
              {chips.map((chip) => (
                <span key={chip.href} class="fo-chip">
                  <span class="fo-chip__dot">
                    <Icon inner={chip.icon} />
                  </span>
                  {chip.name}
                  <Icon raw={arrowIcon} />
                </span>
              ))}
            </div>
            {tool.now ? <div class="fo-band__room" /> : options}
          </div>
        )}
      </div>
      {queue}
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
