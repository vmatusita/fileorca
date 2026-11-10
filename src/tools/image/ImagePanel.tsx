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
// F15 (DECISOES § 651, § 652 and § 667 to § 670): the list is the Merge list of the PDF island for photos. In Image to PDF
// it is ordered (ol), and each row has the arrows that move it (by touch and keyboard) and the native drag of the whole
// row (by mouse); in every batch of two files or more a ready row goes out by the bin outside its card, leaving a line with
// Undo in its place until the next action that changes the batch. A move, a row that left and an Undo pack the outputs
// again (the PDF, or the ZIP) under a key made of the order of the ready rows, without encoding any photo again; the
// result stays on screen until the new bundle, and the Download never hands out an old one (aria-busy until it comes).
//
// State lives in one mutable model (the run loop is async and must see the latest values); every change
// calls render(). Outputs are kept as Blobs, object URLs are revoked when replaced and at "Start over".
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren, JSX, TargetedFocusEvent, TargetedMouseEvent } from 'preact';
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
import { bringIntoView, catchDrops, filesOf, imageFilesOf, pasteBelongsToElement } from './paste.ts';
import { carries, plainClick, storeForNext, takeInbox, workerControls, type Outgoing } from './inbox.ts';
import { acceptAttribute, batchOutcome, batchPercent, codecOf, isLossy, totals, worthSaying, type Ready } from './summary.ts';
import { bundleKey, moved, putBack, successor } from './batch.ts';
import { landingMove, landingSpent } from './landing.ts';
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
  /**
   * What it was built from: the PDF sheet and the order of the ids of its pages, or the order of the ids in the ZIP
   * (F15, batch.ts bundleKey), so a new size, a move, a row that left or came back is told from "nothing changed".
   */
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
  /** F13a · UX-14 (DECISOES § 498): the id of the page whose chip brought this batch, for its note; null otherwise. */
  from: string | null;
  /** F13a · UX-14 (DECISOES § 499): a chip sent files here and none arrived: the empty box, until files come. */
  lost: { from: string; count: number } | null;
  /** F13a · UX-14: a chip is writing the inbox; a second click waits for the first. */
  carrying: boolean;
  /**
   * F15 (DECISOES § 652): the ready row that went out by its bin, where it was, and whether its line said so. It is not let
   * go (its output, thumbnail and URLs come back with Undo) until the next action that changes the batch. `height`: the
   * height the row had (its sizes may take two lines on a phone), which its line keeps.
   */
  undo: { item: Item; position: number; said: boolean; height: number } | null;
  /**
   * F15: marks the effect spends only once their target is on screen (§ 510): the Undo of the line, the bin of the row
   * that came back, and the arrow of the row that moved (on the list as the model has it, not a list drawn before).
   */
  focusUndo: boolean;
  focusBin: number | null;
  focusMove: { id: number; control: string } | null;
  /** F15 (DECISOES § 659): the run whose end says nothing, because the gesture that started it already spoke (§ 629). */
  hush: number;
  /** F15: Download was pressed while its bundle was being made again; the new one is handed out when it comes. */
  wantDownload: boolean;
  /** F15 (DECISOES § 667): a chip of Image to PDF was pressed while the PDF was being made again; it takes the new one. */
  wantFollow: ChipData | null;
  /**
   * F16 (item 8; DECISOES § 692): Tab left a number field of the options for a control of a row (landing.ts). The row, the
   * kind of the control (its tag and classes), the control itself, and the place the island gave the focus since (null:
   * none yet). Spent when the batch is done, dropped when the person puts the focus anywhere else.
   */
  landing: { row: number; tag: string; kind: string; node: HTMLElement; placed: HTMLElement | null } | null;
}

function newModel(): Model {
  return {
    items: [], phase: 'idle', runId: 0, nextId: 1, finished: 0, total: 0, zipping: false, showLevel: false, hadCard: false, bundle: null,
    selected: null, expanded: false, announce: '', coffee: '', completeSent: false, newUse: false, focusDownload: false, broken: new Set(),
    rowFocus: null, slotFocus: false, bandFocus: false, successors: [], focusRowId: null, compareOpen: false, coffeeRoom: false, bandLock: null,
    from: null, lost: null, carrying: false, undo: null, focusUndo: false, focusBin: null, focusMove: null, hush: 0, wantDownload: false,
    wantFollow: null, landing: null,
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

/**
 * A row of chips under a label (NextStepChips): the next steps after a result, or the right tool after a refusal. F13a ·
 * UX-14 (DECISOES § 496): a chip that takes the files along says so ("Resize this image", data-carry), and the line
 * under the row says they never leave the device; the label is decided here, after hydration, never by the server.
 */
function ChipRow({ id, label, chips, takes, line, onFollow }: {
  id: string;
  label: string;
  chips: ChipData[];
  /** How many files each chip takes along now (0: it only links). */
  takes: (chip: ChipData) => number;
  /** The line under the row, shown when a chip takes the files along. */
  line: JSX.Element;
  onFollow: (event: TargetedMouseEvent<HTMLAnchorElement>, chip: ChipData) => void;
}) {
  const carrying = chips.some((chip) => takes(chip) > 0);
  return (
    <>
      <nav class="fo-next" aria-labelledby={id}>
        <span class="fo-next__label" id={id}>
          {label}
        </span>
        {chips.map((chip) => {
          const count = takes(chip);
          return (
            <a
              key={chip.href}
              class={chip.category === 'none' ? 'fo-chip' : `fo-chip fo-cat--${chip.category}`}
              href={chip.href}
              data-carry={count > 0 ? '' : undefined}
              onClick={(event) => onFollow(event, chip)}
            >
              <span class="fo-chip__dot" aria-hidden="true">
                <Icon inner={chip.icon} />
              </span>
              {count > 0 && chip.carry ? (count === 1 ? chip.carry.one : fmt(chip.carry.many, { count })) : chip.name}
              <Icon raw={arrowIcon} />
            </a>
          );
        })}
      </nav>
      {carrying && line}
    </>
  );
}

/**
 * F13a · UX-14 (DECISOES § 496): the line under the chips that take the files along, and its room in the hidden copy.
 * The shield comes in the data of the page, as the icons of the PDF island do: a ?raw import would grow the shared chunk.
 */
function CarryLine({ text, icon }: { text: string; icon: string }) {
  return (
    <p class="fo-carry">
      <Icon inner={icon} class="fo-icon--inline" />
      {text}
    </p>
  );
}

export default function ImagePanel<S extends object, O>(props: ImagePanelProps<S, O>) {
  const { lang, page, t, texts, accepts, beforeAfter, pdf, chips, converters, elsewhere, coffeeHref, origins, carryIcons, listIcons, tool, initial } = props;
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
  // The list is an ol in Image to PDF and a div with the list role elsewhere (F15): a callback keeps either one here.
  const listRef = useRef<HTMLElement | null>(null);
  const holdList = (element: HTMLElement | null) => {
    listRef.current = element;
  };
  const summaryRef = useRef<HTMLElement>(null);
  const drops = useRef<ReturnType<typeof catchDrops> | null>(null);
  /** F15: the place of the row being dragged by the mouse (the native drag of Merge PDF), null when no row is. */
  const dragging = useRef<number | null>(null);

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
  /**
   * F16 (item 8; F15 R-b-1; DECISOES § 692): Tab out of a number field of the options (the NumberField: "Maximum size" of
   * Compress, the width and height of Resize, the box of Crop) toward a control of a row. The field commits on blur, the
   * batch is made again, and the render that follows, in a microtask before the focus lands, swaps that control. The
   * capture phase of the blur, on the island, comes before the field's own handler, with the control still in its row: its
   * focusout comes after the render, with the control already out (measured in Chromium and WebKit). The field keeps no
   * focus: the mark only follows the place the focus was going to.
   */
  const noteLanding = (event: TargetedFocusEvent<HTMLDivElement>) => {
    const field = event.target;
    const next = event.relatedTarget;
    if (!(field instanceof HTMLInputElement) || field.type !== 'text' || !bandRef.current?.contains(field)) return;
    if (!(next instanceof HTMLElement) || !listRef.current?.contains(next)) return;
    const row = next.closest<HTMLElement>('[data-row]');
    if (row) m.landing = { row: Number(row.dataset['row']), tag: next.tagName.toLowerCase(), kind: next.className, node: next, placed: null };
  };
  /**
   * F15 (DECISOES § 659): a gesture of the list says its sentence through the status region, emptied first and set 50 ms
   * later (a live region speaks only when its text changes), as say() of the PDF island. A run that a change started
   * after the result (an option) adds no "Done!" of its own when a move speaks during it (§ 629).
   */
  const say = (message: string) => {
    m.announce = '';
    if (m.phase === 'processing' && m.hadCard) m.hush = m.runId;
    setTick((tick) => tick + 1);
    window.setTimeout(() => {
      m.announce = message;
      setTick((tick) => tick + 1);
    }, 50);
  };
  const warmed = useRef(false);
  const formatName = (format: Sniffed | undefined): string => (format && format in t.formats ? t.formats[format as keyof ImagePanelTexts['formats']] : '');
  const nameOf = (item: Item) => item.file.name || t.fileFallback;
  const tracked = { tool: page, lang } as const;
  /** The tool picks one file of the batch (the comparison, the crop box): a ready row that leaves passes the pick on. */
  const selectable = tool.selectable ?? beforeAfter !== 'never';

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

  /** F15: the sheet of the PDF the options ask for now ('' outside Image to PDF). */
  const sheetOf = (state: S): string => (pdf ? (tool.pdfSize?.(state) ?? 'image') : '');
  /** F15 (DECISOES § 667): the key of the bundle the ready rows make now, in the order of the list; null when none is due. */
  const keyNow = (): string | null =>
    bundleKey(
      pdf ? 'pdf' : 'zip',
      ready().map((item) => item.id),
      sheetOf(stateRef.current),
    );

  /** F15 (DECISOES § 652): the next action that changes the batch ends the Undo, and only then lets the row that left go. */
  function clearUndo(): void {
    if (m.undo) release(m.undo.item);
    m.undo = null;
    m.focusUndo = false;
  }

  function teardown(): void {
    clearUndo();
    for (const item of m.items) release(item);
    m.items = [];
    m.focusMove = null;
    m.focusBin = null;
    m.landing = null;
    m.wantDownload = false;
    m.wantFollow = null;
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

  /**
   * The ZIP or the PDF of the outputs, under `key` (the caller asks only when one is due: a ZIP has two files or more).
   * Touches nothing of the model. `here`: the ZIP is made on the page, with no message to the image worker (F15: a
   * bundle made again after a gesture; the first ZIP of a batch is still the worker's).
   */
  async function assemble(items: Item[], sheet: string, key: string, here: boolean): Promise<Omit<Bundle, 'url'>> {
    const names = outputNames(items);
    if (pdf) {
      const { buildPdf } = await import('./pdf-client.ts').catch(() => {
        throw unavailable();
      });
      const pages = items.flatMap((item) =>
        item.output ? [{ blob: item.output.blob, format: item.output.format === 'png' ? ('png' as const) : ('jpeg' as const), width: item.output.width, height: item.output.height }] : [],
      );
      const blob = await buildPdf(pages, sheet as 'image' | 'letter' | 'a4');
      return { kind: 'pdf', blob, name: items.length === 1 ? names[0] ?? `${t.files.pdf}.pdf` : `${t.files.pdf}.pdf`, key };
    }
    const engine = await import('./engine-client.ts').catch(() => {
      throw unavailable();
    });
    const entries = items.flatMap((item, index) => (item.output ? [{ name: names[index] ?? `${index}.bin`, blob: item.output.blob }] : []));
    const blob = await (here ? engine.zipHere(entries) : engine.zipFiles(entries));
    return { kind: 'zip', blob, name: `${t.files.zip}.zip`, key };
  }

  /**
   * F15 (DECISOES § 651 and § 667): the bundle of the ready rows as the list has them when it is made, made again while
   * the list changed under it (a row moved, left or came back while the PDF or the ZIP was being made): the PDF never comes
   * out in an old order. Undefined when a newer run took over; null when none is due, or it could not be made (the rows
   * then carry the failure).
   */
  async function pack(id: number, here: boolean): Promise<Omit<Bundle, 'url'> | null | undefined> {
    for (let again = here; ; again = true) {
      const items = ready();
      const key = keyNow();
      if (key === null) return null;
      let built: Omit<Bundle, 'url'>;
      try {
        built = await assemble(items, sheetOf(stateRef.current), key, again);
      } catch (error) {
        if (m.runId !== id) return undefined;
        // A PDF worker or a ZIP chunk that never arrived is a load failure; anything else is the browser failing to write.
        const failure: RunResult = error instanceof Error && error.name === UNAVAILABLE ? LOAD_FAILED : { ok: false, reason: 'encode' };
        for (const item of items) settle(item, failure, '');
        return null;
      }
      if (m.runId !== id) return undefined;
      if (keyNow() === key) return built;
    }
  }

  /**
   * F15 (DECISOES § 667): only the bundle is made again (a move, a row that left or came back, a new sheet): no photo goes
   * to the engine. The result stays on screen (no WaterLevel, the band by `hadCard`), and the Download says it is busy
   * until the new bundle comes. `quiet`: the gesture already spoke, so the end does not say "Done!" again (§ 659).
   */
  async function repack(quiet: boolean): Promise<void> {
    const want = keyNow();
    if (want === null || want === m.bundle?.key) {
      // Nothing to pack again (a ZIP down to one file downloads as it is). A batch whose other rows all failed while a row
      // was out gets its result back with it.
      if (m.phase === 'error' && ready().length > 0) {
        if (quiet) m.hush = m.runId;
        finish();
      }
      return;
    }
    const id = ++m.runId;
    if (quiet) m.hush = id;
    render();
    const built = await pack(id, true);
    if (built === undefined) return;
    dropBundle();
    if (built) m.bundle = { ...built, url: URL.createObjectURL(built.blob) };
    finish();
  }

  async function run(): Promise<void> {
    const state = stateRef.current;
    const work: Item[] = [];
    for (const item of m.items) {
      const op = tool.operation(state, infoOf(item));
      const key = JSON.stringify(op);
      const settled = item.output !== null && item.op === key;
      const hopeless = item.failure !== null && HOPELESS.has(item.failure.reason);
      item.next = settled || hopeless ? null : { op, key };
      if (item.next) work.push(item);
    }
    // Every photo is as the options want it: only the bundle may be due again (a new sheet of the PDF).
    if (work.length === 0) {
      await repack(false);
      return;
    }

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
      const engine = await import('./engine-client.ts').catch(() => null);
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
        // The order is read when the bundle is made, and made again if it changed meanwhile (F15). A newer run may have
        // started while this one zipped: its own bundle replaces whatever this one made.
        const built = await pack(id, false);
        if (built === undefined) return;
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
    // The error box announces itself (role="alert"); the status region speaks when something came out, and says where a
    // batch brought by a chip came from (UX-14). F15 (DECISOES § 659): a bundle a gesture made again says nothing more.
    if (m.hush !== m.runId) m.announce = rows.length > 0 ? [saysFor(rows), failed > 0 ? fmt(t.errors.some, { count: failed }) : '', fromNote(rows.length)].filter(Boolean).join(' ') : '';
    render();
    // F15: the Download pressed while its bundle was being made again hands out the new one, never the old one.
    if (m.wantDownload) {
      m.wantDownload = false;
      if (m.phase === 'done' && m.bundle) {
        hand(m.bundle.url, m.bundle.name);
        track('download', tracked);
      }
    }
    // F15 (DECISOES § 667): a chip pressed while the PDF was being made again takes the new PDF, never the old one.
    if (m.wantFollow) {
      const chip = m.wantFollow;
      m.wantFollow = null;
      if (m.phase === 'done' && m.bundle?.kind === 'pdf') carryAway(chip, [{ name: m.bundle.name, blob: m.bundle.blob }]);
    }
  }

  /** F13a · UX-14 (DECISOES § 498): "Oli brought this image from Compress image.", for a batch a chip brought. */
  function fromNote(count: number): string {
    const name = m.from ? origins[m.from] : undefined;
    if (!name) return '';
    return fmt(count > 1 ? t.carry.fromMany : t.carry.from, { tool: name, count });
  }

  /** `from`: the page whose chip brought these files (UX-14), checked against the origins of this page. */
  function startBatch(files: File[], from: string | null = null): void {
    if (files.length === 0) return;
    // The warm-up is for before the first file: from here each codec comes when a file needs it, and the pointer that
    // later enters the rectangle (to click Download) or the focus on Choose after Start over fetches nothing (DECISOES § 534).
    warmed.current = true;
    m.from = from;
    m.lost = null;
    drops.current?.reset();
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
    clearUndo(); // F15 (DECISOES § 652): an option is an action that changes the batch
    m.focusDownload = false; // an option changed: the focus stays on it
    if (m.items.length > 0) {
      m.announce = ''; // a live region speaks only when its text changes: the same sentence needs an empty one before it
      void run();
    }
  }

  function startOver(): void {
    m.runId += 1;
    teardown();
    m.from = null;
    m.lost = null;
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

  /** Takes a file out for good: the × of a row that waits or works, the bin of a refused row. */
  function removeItem(item: Item): void {
    clearUndo(); // F15: another removal is an action that changes the batch
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

  /**
   * F15 (DECISOES § 652; D-21 of Merge PDF): the bin outside the card of a ready row. The row leaves, and in its place a
   * line says so with Undo, at the same height, until the next action that changes the batch; no timer (WCAG 2.2.1). The
   * focus goes to Undo, the picked file of Crop passes to the next ready row (or the one before), and the bundle is made
   * again from the outputs that stay. The row is not let go: Undo brings it back as it was.
   */
  function removeRow(item: Item): void {
    const at = m.items.indexOf(item);
    if (at < 0) return;
    clearUndo();
    if (selectable) {
      const ids = ready().map((other) => other.id);
      const pickedId = m.selected !== null && ids.includes(m.selected) ? m.selected : ids[0];
      if (pickedId === item.id) m.selected = successor(ids, ids.indexOf(item.id));
    }
    // The line keeps the height of the row it replaces (the sizes of a row may take two lines in a narrow column).
    const height = listRef.current?.querySelector<HTMLElement>(`[data-row="${item.id}"]`)?.getBoundingClientRect().height ?? 0;
    item.removed = true;
    m.items = m.items.filter((other) => other !== item);
    const undo = { item, position: at, said: false, height };
    m.undo = undo;
    m.focusUndo = true;
    m.focusMove = null;
    m.focusBin = null;
    m.focusDownload = false;
    render();
    // The sentence goes into the line's region after the line is on screen, so a screen reader says it (an element born
    // with its text is not said). The status region of the island stays quiet: one sentence per gesture (§ 659).
    window.setTimeout(() => {
      if (m.undo !== undo) return;
      undo.said = true;
      setTick((tick) => tick + 1);
    }, 50);
    if (m.phase !== 'processing') void repack(true);
  }

  /** F15: Undo. The row comes back to its place as it was, and the focus to its bin; the bundle is made again with it. */
  function undoRemove(): void {
    const undo = m.undo;
    if (!undo) return;
    m.undo = null;
    m.focusUndo = false;
    undo.item.removed = false;
    m.items = putBack(m.items, undo.item, undo.position);
    m.focusBin = undo.item.id;
    render();
    if (m.phase !== 'processing') void repack(true);
  }

  /**
   * F15 (DECISOES § 651): a row of Image to PDF moves from `from` to `to` (an arrow moves it one place, the mouse drags it
   * anywhere). `control` keeps the focus on the moved row: the arrow that was pressed, or the other one when the row reached
   * an end and the pressed one gave its place to the empty one. A move to or from a row under "Show N more" opens the whole
   * list. While the photos are prepared, the run that is going reads the new order when it makes the PDF; after the result,
   * only the PDF is made again.
   */
  function moveItem(from: number, to: number, control = '.fo-filelist__move'): void {
    const item = m.items[from];
    const next = moved(m.items, from, to);
    if (!item || !next) return;
    clearUndo(); // a move is an action too: the Undo of a row that left would put it back in the wrong place
    m.items = next;
    if (from >= VISIBLE_ROWS || to >= VISIBLE_ROWS) m.expanded = true;
    m.focusMove = { id: item.id, control };
    m.focusBin = null;
    m.focusDownload = false;
    say(fmt(t.queue.moved, { name: nameOf(item), position: to + 1, total: m.items.length }));
    render();
    if (m.phase !== 'processing') void repack(true);
  }

  /** A file handed to the browser to save, as a click on a link with `download` does. */
  function hand(url: string, name: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
  }

  function downloadItem(item: Item, name: string): void {
    if (!item.outUrl) return;
    hand(item.outUrl, name);
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

  /** A row of the queue takes the focus: its first button, or the row itself when it has none (the one row left while Undo waits). */
  function focusRow(id: number): boolean {
    const row = listRef.current?.querySelector<HTMLElement>(`[data-row="${id}"]`);
    const target = row?.querySelector<HTMLElement>('button, a[href]') ?? row;
    target?.focus();
    return Boolean(target);
  }

  /**
   * F15: the rows on screen are the ones the model shows now, in its order. A pending effect of an earlier render can run
   * at the start of the next one (§ 510), on the list as it was: a focus given there is lost when the row moves.
   */
  function listIsDrawn(list: HTMLElement): boolean {
    const want = (m.expanded ? m.items : m.items.slice(0, VISIBLE_ROWS)).map((item) => String(item.id));
    const have = [...list.querySelectorAll<HTMLElement>(':scope > [data-row]')].map((row) => row.dataset['row']);
    return want.length === have.length && want.every((id, index) => id === have[index]);
  }

  /**
   * F16 (item 8; DECISOES § 692): the mark of noteLanding, after every render and before the paint (a layout effect, in the
   * same microtask as the render), so the page never holds the focus in between: the control of the same kind in the same
   * row when it is there, the row itself while it waits without it, and the row's first control if the batch ends without
   * it (landing.ts). The mark is spent when the batch is done (§ 510: only with its target on screen), never at the end of
   * any other run of the effect (the F13a pitfall of docs/claude/imagem.md), and dropped as soon as the person puts the
   * focus anywhere else: nothing brings it back to the field.
   */
  useLayoutEffect(() => {
    const landing = m.landing;
    if (!landing) return;
    const active = document.activeElement;
    const here = landing.placed ?? landing.node;
    const row = listRef.current?.querySelector<HTMLElement>(`[data-row="${landing.row}"]`) ?? null;
    const control = landing.node.isConnected
      ? landing.node
      : ([...(row?.querySelectorAll<HTMLElement>(landing.tag) ?? [])].find((node) => node.className === landing.kind) ?? null);
    const seen = {
      lost: !active || active === document.body || active === document.documentElement,
      onHere: active === here,
      hereConnected: here.isConnected,
      row: row !== null,
      control: control !== null,
      busy: m.phase === 'processing',
    };
    const move = landingMove(seen);
    const next = move === 'control' ? control : move === 'row' ? row : move === 'first' ? (row?.querySelector<HTMLElement>('button, a[href]') ?? row) : null;
    if (next) {
      if (next !== active) next.focus();
      landing.placed = next;
    }
    if (landingSpent(seen, move)) m.landing = null;
  });

  useEffect(() => {
    if (m.phase === 'done' && m.focusDownload && downloadRef.current) {
      m.focusDownload = false;
      downloadRef.current.focus();
    }
    // F15 (DECISOES § 651 and § 652): each mark is spent only when its target is on screen (§ 510).
    const list = listRef.current;
    if (m.focusUndo && m.undo) {
      const button = list?.querySelector<HTMLElement>(`[data-out="${m.undo.item.id}"] button`);
      if (button) {
        m.focusUndo = false;
        button.focus();
      }
    }
    if (m.focusBin !== null) {
      const bin = list?.querySelector<HTMLElement>(`[data-row="${m.focusBin}"] .fo-filelist__remove`);
      if (bin) {
        m.focusBin = null;
        bin.focus();
      }
    }
    if (m.focusMove && list && listIsDrawn(list)) {
      const row = list.querySelector<HTMLElement>(`[data-row="${m.focusMove.id}"]`);
      const target = row?.querySelector<HTMLElement>(m.focusMove.control) ?? row?.querySelector<HTMLElement>('.fo-filelist__move');
      if (target) {
        m.focusMove = null;
        target.focus();
      }
    }
    if (m.focusRowId !== null && focusRow(m.focusRowId)) m.focusRowId = null;
    // The control that had the focus is gone and the page has it: the same row if it is still there (its Cancel gave
    // way to its Download), else the next row, the previous one, and last the control the panel shows now. In the band,
    // the options that gave way to the result's row come back folded: the focus goes to "Adjust".
    // The WaterLevel takes the focus without scrolling: it is the rectangle itself, 356px tall, already in view, and on a
    // first visit the browser scrolled its foot over the cookie notice (DECISOES § 514).
    // F16 (§ 692): while the mark of a number field holds (the layout effect above), it has the last word; an effect of an
    // earlier render that runs at the start of the next one (§ 510) finds the page with the focus in the middle of the blur.
    const level = levelRef.current;
    const active = document.activeElement;
    if (!m.landing && (!active || active === document.body || active === document.documentElement)) {
      if (m.rowFocus !== null) {
        const wanted = [m.rowFocus, ...m.successors];
        if (!wanted.some(focusRow)) {
          if (level) level.focus({ preventScroll: true });
          else (startOverRef.current ?? chooseRef.current ?? downloadRef.current)?.focus();
        }
      } else if (m.slotFocus) {
        if (level) level.focus({ preventScroll: true });
        else (downloadRef.current ?? startOverRef.current ?? chooseRef.current)?.focus();
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
    // F13a · UX-18 A (DECISOES § 501): files dragged anywhere on the page light the zone where it is, and a drop
    // anywhere (the text, the H1, the crumbs, the footer, the result card) starts a new batch, with the panel brought into
    // view. Over an ad the drag is the frame's: the page hears a dragleave and the zone goes back to rest.
    drops.current = catchDrops({
      enter: (count) => {
        if (m.phase !== 'processing') setOver(Math.max(1, count));
      },
      leave: () => setOver(0),
      drop: (files) => {
        if (files.length === 0) return;
        startBatch(files);
        bringIntoView(slotRef.current);
      },
    });
    const onPaste = (event: ClipboardEvent) => {
      if (pasteBelongsToElement(event.target)) return;
      const files = imageFilesOf(event.clipboardData?.files);
      if (files.length === 0) return;
      event.preventDefault();
      startBatch(files);
    };
    document.addEventListener('paste', onPaste);
    // The files shared with the installed app, when the "Open with" page sent them here (F8; DECISOES § 290), or the result
    // a next-step chip brought (F13a · UX-14): they come the way of a drop. A chip's choice that finds nothing is the empty
    // box; a `from` this page does not know is not believed (DECISOES § 498 and § 499).
    void takeInbox(page).then((arrival) => {
      const from = arrival.from !== null && arrival.from in origins ? arrival.from : null;
      if (arrival.files.length > 0) startBatch(arrival.files, from);
      else if (arrival.lost && from && m.items.length === 0) {
        m.lost = { from, count: arrival.count };
        render();
      }
    });
    return () => {
      drops.current?.stop();
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

  /**
   * F13a · UX-14 (DECISOES § 496 and § 497): a plain click on a chip that takes the files writes them into the
   * inbox, notes the choice and goes; a click with a key held, the middle button or a new tab only links. The event of
   * the click is the next_step_click of always (the D-17 chip sends none, as before).
   */
  function follow(event: TargetedMouseEvent<HTMLAnchorElement>, chip: ChipData, files: Outgoing[], counted: boolean): void {
    if (counted) track('next_step_click', { ...tracked, target: chip.target });
    if (!chip.carry || files.length === 0 || !plainClick(event) || !workerControls()) return;
    event.preventDefault();
    if (m.carrying) return;
    // F15 (DECISOES § 667): the PDF on screen is the one from before a gesture or a new sheet; the chip waits for the new one.
    // Read from the model at the press, not from the render: the press may come before the render of the gesture.
    if (pdf && m.bundle !== null && (m.phase === 'processing' || m.bundle.key !== keyNow())) {
      m.wantFollow = chip;
      return;
    }
    carryAway(chip, files);
  }

  function carryAway(chip: ChipData, files: Outgoing[]): void {
    if (m.carrying) return;
    m.carrying = true;
    const href = chip.href;
    // Written or not (a failure, or 3 s), the page goes: without the choice the tool opens empty, as the link of before.
    void storeForNext(files, chip.target, page).then(() => {
      m.carrying = false;
      location.assign(href);
    });
  }

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
  // F13a · UX-14 (DECISOES § 499): the empty box, until files come (any way) or a file is dragged over it.
  const lost = m.lost && m.phase === 'idle' && m.items.length === 0 ? m.lost : null;
  const dropState = over > 0 && m.phase !== 'processing' ? 'over' : offline ? 'offline' : m.phase === 'error' ? 'error' : lost ? 'lost' : undefined;
  const names = outputNames(ready());
  const nameFor = new Map(ready().map((item, index) => [item.id, names[index] ?? '']));
  const single = m.items.length === 1 ? m.items[0] : undefined;

  /** The picture the comparison needs: original (or a decoded copy) against the result of the picked file. */
  const picked = rows.find((row) => row.item.id === m.selected) ?? rows[0] ?? null;
  const comparable = (() => {
    if (!showCard || beforeAfter === 'never' || !picked || picked.output.outcome !== 'new') return null;
    if (beforeAfter === 'lossy' && !isLossy(picked.output.format)) return null;
    if (!picked.item.outUrl || m.broken.has(`${picked.item.id}:${picked.item.outUrl}`)) return null;
    return { item: picked.item, output: picked.output, outUrl: picked.item.outUrl };
  })();

  const bundled = pdf || rows.length >= 2;
  const deliverable = (() => {
    if (bundled) return m.bundle ? { url: m.bundle.url, name: m.bundle.name, size: m.bundle.blob.size } : null;
    const only = rows[0];
    return only?.item.outUrl ? { url: only.item.outUrl, name: nameFor.get(only.item.id) ?? '', size: only.output.blob.size } : null;
  })();
  // F15 (DECISOES § 667): the bundle on screen is no longer the one the list makes (a move, a row that left or came back,
  // a new sheet) or a run is making it again: the Download says it is busy, and a press waits for the new one.
  const busy = bundled && deliverable !== null && (m.phase === 'processing' || m.bundle?.key !== keyNow());

  // The one Oli of the rectangle, in its corner, says the state (UX-04 A; DECISOES § 465).
  const pose: Pose = showProgress ? 'swim' : showCard ? 'cheer' : dropState === 'over' ? 'gulp' : dropState === 'offline' ? 'buoy' : dropState === 'error' ? 'oops' : dropState === 'lost' ? 'lost' : 'wave';
  const islandState = m.phase === 'processing' && !showCard ? 'working' : showCard ? 'done' : dropState === 'over' ? 'over' : dropState === 'lost' ? 'lost' : dropState ? 'error' : 'rest';
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
              aria-busy={busy ? 'true' : undefined}
              onClick={(event) => {
                if (busy) {
                  event.preventDefault();
                  m.wantDownload = true;
                  return;
                }
                track('download', tracked);
              }}
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
          {fromNote(rows.length) && (
            // F13a · UX-14 (DECISOES § 498): where a batch brought by a chip came from, the first note of the card.
            <li class="fo-result__from">
              <Icon raw={arrowIcon} class="fo-icon--inline" />
              {fromNote(rows.length)}
            </li>
          )}
          {tot.notes.map((note) => (
            <li key={note}>{noteText(note, rows)}</li>
          ))}
          {!counted && rows[0] && (
            // The size in pixels of one picture, from 768 px (UX-04 A): on a phone the card keeps its height for the rest.
            // The notes run as one paragraph (DECISOES § 516), so this one ends with a period like the others.
            <li class="fo-desktop-only">{`${t.result.size}: ${rows[0].output.width} × ${rows[0].output.height} px.`}</li>
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
    const lostFrom = lost ? (origins[lost.from] ?? '') : '';
    // The children keep their places in every state (a hole where a state has none), so the button of the rest is the
    // same node as the "Choose other files" of the error and of the offline line: Preact never moves it, the focus stays on
    // it (a moved node loses the focus), and the cookie notice's keep() lifts it when it comes under the notice (D-01).
    // F13a · UX-14 (DECISOES § 499): the empty box keeps the same places too: its seal (info) where the seal is, its
    // message where the title is, and its two ways out where the button is, "Choose images" first (the first stop of Tab in
    // the panel; nothing calls focus()). UX-18 A: the drag of files is heard by the document (catchDrops), not by the zone.
    panel = (
      <div class="fo-drop" data-state={dropState} onClick={onZoneClick}>
        <div class="fo-drop__sea">
          <div class="fo-water" />
        </div>
        {error ? null : (
          <div class="fo-drop__badge" aria-hidden="true">
            {lost ? <Icon inner={carryIcons.info} /> : <Icon raw={badge} />}
          </div>
        )}
        {lost ? (
          <div role="status" class="fo-drop__message">
            <p class="fo-drop__title">{lost.count > 1 ? t.carry.lostTitleMany : t.carry.lostTitle}</p>
            <p class="fo-drop__help">{fmt(lost.count > 1 ? t.carry.lostHelpMany : t.carry.lostHelp, { tool: lostFrom })}</p>
          </div>
        ) : error ? (
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
        {lost ? (
          <div class="fo-drop__actions">
            <button ref={chooseRef} type="button" class="fo-btn fo-btn--brand fo-btn--lg" onClick={openPicker} onFocus={warmOnce}>
              <Icon raw={imageIcon} />
              {t.drop.choose}
            </button>
            {/* history.back(): the back cache of the browser usually brings the result back as it was. */}
            <button type="button" class="fo-btn" onClick={() => history.back()}>
              {fmt(t.carry.back, { tool: lostFrom })}
            </button>
          </div>
        ) : button ? (
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
  // F15 (DECISOES § 652): from two files to one, the list stays while Undo waits; the next action brings the card of one file.
  const showQueue = m.items.length >= 2 || (m.undo !== null && m.items.length > 0);
  /** A row with nothing to give (a refused file): its card has its own bin and takes the width of the list. */
  const refusedRow = (item: Item): boolean => item.status !== 'waiting' && item.status !== 'working' && !item.output;

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

  /**
   * F15 (DECISOES § 651 and § 652; the rows of Merge PDF): the card, and outside it, in the row, the arrows that can move
   * (Image to PDF; an empty place of 48 px where one cannot) and the bin of a ready row. A row that waits or works keeps the
   * place of the bin from the start (its × is in the card), so nothing moves when the photo is ready; the last row that
   * remains has none. In Image to PDF the mouse drags the whole row (the native drag of Merge PDF).
   */
  function queueRow(item: Item, position: number, last: number): JSX.Element {
    const name = nameOf(item);
    const refused = refusedRow(item);
    const card = <FileCard {...rowProps(item)} />;
    const none = () => <span class="fo-filelist__none" aria-hidden="true" />;
    const moves = pdf && !refused && (
      <span class="fo-filelist__moves">
        {position > 0 ? (
          <button type="button" class="fo-btn fo-btn--icon fo-filelist__move fo-filelist__move--up" aria-label={fmt(t.queue.moveEarlier, { name })} onClick={() => moveItem(position, position - 1, '.fo-filelist__move--up')}>
            <Icon inner={listIcons.chevron} class="fo-icon--sm" />
          </button>
        ) : (
          none()
        )}
        {position < last ? (
          <button type="button" class="fo-btn fo-btn--icon fo-filelist__move fo-filelist__move--down" aria-label={fmt(t.queue.moveLater, { name })} onClick={() => moveItem(position, position + 1, '.fo-filelist__move--down')}>
            <Icon inner={listIcons.chevron} class="fo-icon--sm" />
          </button>
        ) : (
          none()
        )}
      </span>
    );
    // The bin on a ready row while another row can still give a file (a waiting one may yet): the batch never loses its
    // last output this way, and Start over is the way out of one file.
    const bin = refused ? null : item.status === 'done' && m.items.some((other) => other !== item && !refusedRow(other)) ? (
      <button type="button" class="fo-btn fo-btn--icon fo-filelist__remove" aria-label={fmt(t.queue.remove, { name })} onClick={() => removeRow(item)}>
        <Icon inner={listIcons.trash} />
      </button>
    ) : (
      none()
    );
    const state = refused ? 'error' : undefined;
    if (!pdf) {
      return (
        <div role="listitem" key={item.id} class="fo-filelist__row" data-row={item.id} data-state={state} tabindex={-1} aria-label={name}>
          {card}
          {bin}
        </div>
      );
    }
    return (
      <li
        key={item.id}
        class="fo-filelist__row"
        data-row={item.id}
        data-state={state}
        tabindex={-1}
        aria-label={name}
        draggable={!refused}
        onDragStart={(event) => {
          dragging.current = position;
          event.dataTransfer?.setData('text/plain', name);
        }}
        onDragOver={(event) => {
          if (dragging.current !== null) event.preventDefault();
        }}
        onDrop={(event) => {
          // A drag of files from outside is not a row: it goes on to the document, which starts a new batch.
          if (dragging.current === null) return;
          event.preventDefault();
          event.stopPropagation();
          moveItem(dragging.current, position);
          dragging.current = null;
        }}
        onDragEnd={() => {
          dragging.current = null;
        }}
      >
        {card}
        {moves}
        {bin}
      </li>
    );
  }

  const queueRows = shown.map((item, position) => queueRow(item, position, m.items.length - 1));
  const undo = m.undo;
  if (undo) {
    // F15 (D-21 of Merge PDF): the line of the row that left, in its place and at its height, with its own key; its region
    // says so 50 ms after it is on screen.
    const out = fmt(t.queue.out, { name: nameOf(undo.item) });
    const said = <span role="status">{undo.said ? out : ''}</span>;
    const button = (
      <button type="button" class="fo-btn fo-btn--ghost" onClick={undoRemove}>
        {t.queue.undo}
      </button>
    );
    const style = undo.height > 0 ? `min-height:${undo.height}px` : undefined;
    queueRows.splice(
      Math.min(undo.position, queueRows.length),
      0,
      pdf ? (
        <li key={`out-${undo.item.id}`} class="fo-filelist__undo" data-out={undo.item.id} style={style}>
          {said}
          {button}
        </li>
      ) : (
        <div role="listitem" key={`out-${undo.item.id}`} class="fo-filelist__undo" data-out={undo.item.id} style={style}>
          {said}
          {button}
        </div>
      ),
    );
  }

  const queue = showQueue && (
    <div class="fo-queue">
      {pdf ? (
        // Image to PDF: the order of the list is the order of the pages.
        <ol class="fo-filelist fo-filelist--image" aria-label={t.queue.label} ref={holdList}>
          {queueRows}
        </ol>
      ) : (
        <div class="fo-filelist fo-filelist--image" role="list" aria-label={t.queue.label} ref={holdList}>
          {queueRows}
        </div>
      )}
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

  // F13a · UX-14 (DECISOES § 496 and § 497): what each chip would take along, decided here in the client: the
  // files that came out (not the ZIP), in the order of the list, and a service worker in control. The D-17 chip takes
  // the refused file itself, as it was chosen. F15 (DECISOES § 653): Image to PDF takes the PDF of the batch (the one
  // Download hands out), and its line says so in the words of the PDF; the hidden copy keeps that line and the label of
  // one PDF (always one: "Merge this PDF with others" is longer than "Merge these 10 PDFs").
  const controlled = workerControls();
  const outgoing: { format: string; file: Outgoing }[] =
    band === 'elsewhere' && single?.failure?.reason === 'wrong-tool'
      ? [{ format: single.failure.source ?? 'unknown', file: { name: single.file.name, blob: single.file } }]
      : pdf
        ? m.bundle?.kind === 'pdf' ? [{ format: 'pdf', file: { name: m.bundle.name, blob: m.bundle.blob } }] : []
        : rows.map((row) => ({ format: row.output.format, file: { name: nameFor.get(row.item.id) ?? '', blob: row.output.blob } }));
  const formats = outgoing.map((entry) => entry.format);
  const takes = (chip: ChipData): number => (chip.carry && controlled ? carries(chip.carry.accepts, chip.carry.single, formats) : 0);
  const filesFor = (chip: ChipData): Outgoing[] => {
    const carry = chip.carry;
    if (!carry) return [];
    const taken = outgoing.filter((entry) => carry.accepts.includes(entry.format)).map((entry) => entry.file);
    return carry.single ? taken.slice(0, 1) : taken;
  };
  const carryLine = pdf ? t.carry.linePdf : formats.length > 1 ? t.carry.lineMany : t.carry.line;
  const roomLabel = (carry: NonNullable<ChipData['carry']>): string => (pdf ? carry.one : fmt(carry.many, { count: 10 }));

  return (
    <div class="fo-tool-island" ref={rootRef} data-state={islandState} onBlurCapture={noteLanding}>
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
          {band === 'elsewhere' && elsewhere && texts.elsewhere && (
            <ChipRow
              id="fo-elsewhere-label"
              label={texts.elsewhere.label}
              chips={[elsewhere.chip]}
              takes={takes}
              line={<CarryLine text={t.carry.line} icon={carryIcons.shield} />}
              onFollow={(event, chip) => follow(event, chip, filesFor(chip), false)}
            />
          )}
          {band === 'after' && chips.length > 0 && (
            <ChipRow
              id="fo-next-label"
              label={t.next.label}
              chips={chips}
              takes={takes}
              line={<CarryLine text={carryLine} icon={carryIcons.shield} />}
              onFollow={(event, chip) => follow(event, chip, filesFor(chip), true)}
            />
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
          // F13a · UX-14 (DECISOES § 500): a chip that can take the files along keeps the room of its longest label (a
          // batch of 10) and of the line under the row from the first paint, so the row that says "Resize these 3 images"
          // and the line after a result move nothing; the server never knows whether a service worker will be there.
          <div class="fo-band__ghost" aria-hidden="true">
            <div class="fo-band__chips">
              <span class="fo-next__label">{t.next.label}</span>
              {chips.map((chip) => (
                <span key={chip.href} class="fo-chip">
                  <span class="fo-chip__dot">
                    <Icon inner={chip.icon} />
                  </span>
                  {chip.carry ? roomLabel(chip.carry) : chip.name}
                  <Icon raw={arrowIcon} />
                </span>
              ))}
            </div>
            {chips.some((chip) => chip.carry) && <CarryLine text={pdf ? t.carry.linePdf : t.carry.lineMany} icon={carryIcons.shield} />}
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
