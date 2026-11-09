// The PDF tool island, shared by the 12 PDF tools (F5a, decision 6; DECISOES § 148). One entry for all of them
// (PdfIsland.astro), hydrated from data-props (DECISOES § 23). The image island's model (§ 69), grown for PDF:
//  - files come from a drop anywhere on the panel, the picker or Ctrl+V; each one is read first (pages, lock, form) by
//    the engine, which never trusts the name;
//  - batch tools (Compress, PDF to JPG, Rotate, numbers, Watermark, Protect) treat every file on its own and give a ZIP
//    for two outputs or more; Merge puts the files in the order of its list into one; the single-file tools (Split,
//    Delete, Reorder, Sign, Unlock) take the first file and say so to any other ("one PDF at a time here");
//  - "auto" tools run as soon as the files are read and again when an option changes; the others wait for the action
//    button, which says what is missing instead of being disabled;
//  - DropZone, WaterLevel and ResultCard share one slot; refusals stay on the row of their file, with the Oli line.
// F13a (UX-04 A; DECISOES § 478): the slot is one rectangle of one height in every state (356 px on the phone,
// 340 px from 768 px), with the one Oli in its top right corner; the result is the water that rose; the band under it
// shows the options before the result and the chips after it. The Merge list lives in the rectangle (§ 479).
// State lives in one mutable model (the run loop is async and must see the latest values); every change calls
// render(). Object URLs are revoked when replaced and at "Start over"; the grid's thumbnails go when they leave the
// screen. Nothing typed (password, text, ranges, numbers) leaves this component except in the request to the worker.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ComponentChildren, JSX, TargetedMouseEvent } from 'preact';
import { fileSize, fmt, percent } from '../../i18n/format.ts';
import { browserLabel, track, type Codec, type ErrorReason, type Outcome } from '../../analytics/events.ts';
import { CONSENT_STORAGE_KEY } from '../../analytics/consent.ts';
import Icon from '../../icons/Icon.tsx';
import FileCard, { type FileCardProps } from '../../components/FileCard.tsx';
import Oli from '../image/Oli.tsx';
import { COFFEE_KEY, countUse, decideCoffee, dontShowAgain, forgetWithoutConsent, parseCoffee, type CoffeeLine } from '../image/coffee.ts';
import { bringIntoView, catchDrops, filesOf, pasteBelongsToElement } from '../image/paste.ts';
import { carries, plainClick, storeForNext, takeInbox, workerControls, type Outgoing } from '../image/inbox.ts';
import { batchPercent, worthSaying } from '../image/summary.ts';
import { pdfOutputNames } from './names.ts';
import { PDF_TOOLS } from './tools.tsx';
import { THUMB_WIDTH } from './PageGrid.tsx';
import PageView from './PageView.tsx';
import type { Pose } from '../../oli/poses.ts';
import type { PageBox, PdfInspect, PdfNote, PdfOperation, PdfOutput, PdfReason, PdfSniffed } from '../../engine/pdf/types.ts';
import type { PdfPanelTexts } from '../../i18n/types.ts';
import type { MergeTexts } from './option-texts.ts';
import type { PdfChip, PdfFileView, PdfPanelData, Thumbnails } from './types.ts';
import type * as ClientModule from './client.ts';
import alertIcon from '../../../docs/design/assets/Icons/alert.svg?raw';
import arrowIcon from '../../../docs/design/assets/Icons/arrow-right.svg?raw';
import coffeeIcon from '../../../docs/design/assets/Icons/coffee.svg?raw';
import downloadIcon from '../../../docs/design/assets/Icons/download.svg?raw';
// F13a · UX-16 (DECISOES § 493): the seal of the DropZone at rest is the file that goes into the water (file-drop).
import fileDropIcon from '../../../docs/design/assets/Icons/file-drop.svg?raw';
import offlineIcon from '../../../docs/design/assets/Icons/offline.svg?raw';

const SHOW_PROGRESS_AFTER_MS = 400;
/** Page pictures of the grid drawn at the same time: the worker draws one at a time, so two keep it busy (§ 180). */
const THUMBS_AT_ONCE = 2;
const VISIBLE_ROWS = 6;
const MINUS = '−';
const UNAVAILABLE = 'EngineUnavailable';

/** Two reasons of the panel's own: a second file of a one-file tool, and a file the options leave nothing to do for. */
type Reason = PdfReason | 'one-at-a-time' | 'no-pages';
interface Failure {
  reason: Reason;
  source?: PdfSniffed;
}

/**
 * Failures that no option change can fix: the file is not tried again and no request carries it. A lock is one of them:
 * the tools that take a locked file (Unlock PDF; PDF to JPG for owner restrictions) never mark it as refused. A wrong
 * password is not: the person types another one.
 */
const HOPELESS = new Set<Reason>(['empty', 'not-pdf', 'truncated', 'corrupted', 'too-large', 'not-encrypted', 'one-at-a-time', 'needs-password', 'restricted']);

type Phase = 'idle' | 'reading' | 'ready' | 'processing' | 'done' | 'error';

interface Item {
  id: number;
  file: File;
  status: 'reading' | 'waiting' | 'working' | 'done' | 'error';
  info: PdfInspect | null;
  failure: Failure | null;
  outputs: PdfOutput[] | null;
  outcome: 'new' | 'unchanged' | null;
  op: string | null;
  reported: boolean;
  removed: boolean;
}

interface Bundle {
  blob: Blob;
  url: string;
  name: string;
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
  /** The WaterLevel of the reading, only once it has lasted 400 ms (F13a, D-27): before that the rectangle is the list. */
  readingLevel: boolean;
  bundle: Bundle | null;
  /** Download of a single output: its object URL and name. */
  single: Bundle | null;
  notes: PdfNote[];
  announce: string;
  coffee: CoffeeLine;
  completeSent: boolean;
  newUse: boolean;
  focusDownload: boolean;
  focusAction: boolean;
  showErrors: boolean;
  expanded: boolean;
  slotFocus: boolean;
  /** The work runs again after a change made with the result on screen: the result stays until the new one (§ 483). */
  redo: boolean;
  /** The next result will carry the coffee line: the rectangle keeps its room from the gesture (§ 484). */
  coffeeSoon: boolean;
  /** The height of the Merge list, kept by the rectangle from the reading to the result (§ 479). */
  lock: number;
  /** The band under the rectangle keeps the height of the options when they fold under "Adjust" (§ 483). */
  bandHold: number;
  adjustOpen: boolean;
  orderOpen: boolean;
  /** Merge (D-21): the row taken out of the list, in its place until the next action; `said` puts its sentence in the region. */
  undo: { item: Item; position: number; said: boolean } | null;
  focusUndo: boolean;
  /** The row whose remove button takes the focus back after Undo. */
  focusRow: number | null;
  /** F13a (D-11): a password was wrong, so its field takes the focus with the text selected. */
  focusWrong: boolean;
  /** F13a · UX-14 (DECISOES § 498): the id of the page whose chip brought these files, for its note; null otherwise. */
  from: string | null;
  /** F13a · UX-14 (DECISOES § 499): a chip sent files here and none arrived: the empty box, until files come. */
  lost: { from: string; count: number } | null;
  /** F13a · UX-14: what came out of the last run, named, in order: what a chip takes along (not the ZIP). */
  outs: { format: PdfOutput['kind']; name: string; bytes: Uint8Array }[];
  carrying: boolean;
  /** F14 (§ 625): the last run asked for a password on its output (Protect): no "View the new PDF". */
  sealed: boolean;
  /** F14 (§ 625 and § 626): the page view open in the band, and a count that gives each one a key of its own. */
  view: BandView | null;
  views: number;
  /** The button that opened the view takes the focus back, once it is there (§ 510). */
  focusBack: string | null;
  /** F14 (d-8, DECISOES § 629): the run whose "Done!" is not said, since the gesture that started it said its own sentence. */
  hush: number;
}

const newModel = (): Model => ({
  items: [], phase: 'idle', runId: 0, nextId: 1, finished: 0, total: 0, zipping: false, showLevel: false, readingLevel: false, bundle: null, single: null, notes: [],
  announce: '', coffee: '', completeSent: false, newUse: false, focusDownload: false, focusAction: false, showErrors: false, expanded: false, slotFocus: false,
  redo: false, coffeeSoon: false, lock: 0, bandHold: 0, adjustOpen: false, orderOpen: false, undo: null, focusUndo: false, focusRow: null, focusWrong: false,
  from: null, lost: null, outs: [], carrying: false, sealed: false, view: null, views: 0, focusBack: null, hush: 0,
});

const revoke = (bundle: Bundle | null) => bundle && URL.revokeObjectURL(bundle.url);
/** The key of a request: what decides whether a file must run again (the signature's bytes count by their length). */
const keyOf = (op: PdfOperation): string => JSON.stringify(op, (_key, value: unknown) => (value instanceof Uint8Array ? `bytes:${value.length}:${value[value.length >> 1] ?? 0}` : value));
const viewOf = (item: Item): PdfFileView => ({ id: item.id, name: item.file.name, size: item.file.size, info: item.info });
const usable = (item: Item): boolean => item.info !== null && !item.removed && !(item.failure && HOPELESS.has(item.failure.reason));
const NOTE_KEY: Record<PdfNote, keyof PdfPanelData['t']['result']['notes'] | null> = {
  repaired: 'repaired', 'xfa-removed': 'xfaRemoved', 'form-lost': 'formLost', 'text-flattened': 'textFlattened', downscaled: 'downscaled', 'bookmarks-kept': null, 'form-kept': null,
};

/** Offline right now, as the browser says: a failed engine load then gets the offline line (F8; DECISOES § 292). */
function offlineNow(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

/**
 * Whether the next delivered result is the use that asks for the coffee: the same rule as countUse, read without counting,
 * so the rectangle can keep the room of the line from the gesture that asks for the result (§ 484).
 */
function coffeeDue(): boolean {
  try {
    const store = window.localStorage;
    if (store.getItem(CONSENT_STORAGE_KEY) !== 'granted') return false;
    return decideCoffee(parseCoffee(store.getItem(COFFEE_KEY)), { now: Date.now(), consent: true }).show;
  } catch {
    return false;
  }
}

/** The tag of a part of a split, in the words of the page: the page of "each page", the part of the ranges, "selected". */
const splitTag = (words: PdfPanelTexts['files'], mode: string | undefined, index: number): string =>
  mode === 'each' ? `${words.page}-${index}` : mode === 'ranges' ? `${words.part}-${index}` : words.selected;

/** Whether the focus is in a field of the island where a person types (the file input is a button to them). */
function typingIn(root: HTMLElement | null): boolean {
  const active = document.activeElement;
  return root !== null && active instanceof HTMLElement && root.contains(active) && active.matches('input:not([type="file"]):not([type="radio"]):not([type="checkbox"]), textarea');
}

const codecOf = (failure: Failure | null): Codec => {
  const source = failure?.source;
  if (failure?.reason === 'empty') return 'empty';
  if (source === 'jpeg' || source === 'png' || source === 'webp' || source === 'gif' || source === 'heic') return `image/${source}` as Codec;
  if (!source || source === 'pdf') return 'application/pdf';
  return 'unknown';
};

type Client = typeof ClientModule;

/**
 * The pictures of the pages of one file, by (page, width), drawn by the engine under `key` (the key its `release` lets go).
 * One picture per page and width, shared by whoever shows it (a grid cell, the Sign preview, the page view) and let go when
 * the last one does. Pictures are drawn THUMBS_AT_ONCE at a time, in the order asked; one whose cells all left before its
 * turn is never drawn, so a fast sweep does not leave the worker drawing every page it passed (DECISOES § 180). F14 (§ 625
 * and § 626): the views of the result and of a row of the Merge list have one of their own, with keys of their own.
 */
function pictures(key: string, file: File, boxes: readonly PageBox[], client: () => Promise<Client>): Thumbnails {
  interface Entry {
    url: Promise<string | null>;
    done: (value: string | null) => void;
    users: number;
  }
  const cache = new Map<string, Entry>();
  const waiting: { index: number; width: number; entry: Entry }[] = [];
  let drawing = 0;
  const draw = async (index: number, width: number): Promise<string | null> => {
    const box = boxes[index];
    const shownWidth = box ? (box.rotate === 90 || box.rotate === 270 ? box.height : box.width) : 612;
    try {
      const blob = await (await client()).thumbnail(key, file, index, width, shownWidth);
      return blob ? URL.createObjectURL(blob) : null;
    } catch {
      return null;
    }
  };
  const pump = (): void => {
    while (drawing < THUMBS_AT_ONCE && waiting.length > 0) {
      const next = waiting.shift();
      if (!next) break;
      if (next.entry.users === 0) {
        next.entry.done(null);
        continue;
      }
      drawing += 1;
      void draw(next.index, next.width).then((value) => {
        drawing -= 1;
        next.entry.done(value);
        pump();
      });
    }
  };
  return {
    get(index, width = THUMB_WIDTH) {
      const id = `${index}:${width}`;
      let entry = cache.get(id);
      if (!entry) {
        let done: (value: string | null) => void = () => {};
        const url = new Promise<string | null>((resolve) => {
          done = resolve;
        });
        entry = { url, done, users: 0 };
        cache.set(id, entry);
        waiting.push({ index, width, entry });
      }
      entry.users += 1;
      const url = entry.url;
      pump();
      return url;
    },
    drop(index, width = THUMB_WIDTH) {
      const id = `${index}:${width}`;
      const entry = cache.get(id);
      if (!entry) return;
      entry.users -= 1;
      if (entry.users > 0) return;
      cache.delete(id);
      void entry.url.then((value) => value && URL.revokeObjectURL(value));
    },
  };
}

/** F14 (§ 625 and § 626): the page view open in the band, from the result or from a row of the Merge list. */
interface BandView {
  /** The key of its pictures in the engine, its own (`r<n>` for the result, `m<n>` for a file of the list). */
  key: string;
  boxes: readonly PageBox[];
  pictures: Thumbnails;
  index: number;
  /** What opened it: the result, or the id of the row of the Merge list. */
  from: 'result' | number;
}

export default function PdfPanel(props: PdfPanelData) {
  const { lang, page, t, texts, files: mode, run: runMode, suffix, chips, links, icons, ink, coffeeHref, origins, carryLine } = props;
  const tool = PDF_TOOLS[page];
  const { Options } = tool;
  const model = useRef<Model>(newModel());
  const m = model.current;
  const [, setTick] = useState(0);
  const [over, setOver] = useState(0);
  const [state, setState] = useState<object>(() => ({ ...tool.initial, ...(tool.start?.(texts.options as never) ?? {}) }));
  const stateRef = useRef<object>(state);
  const rootRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const mergeRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseRef = useRef<HTMLButtonElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const holdRef = useRef<HTMLParagraphElement>(null);
  const undoRef = useRef<HTMLButtonElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const startOverRef = useRef<HTMLButtonElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);
  const warmed = useRef(false);
  const appending = useRef(false);
  const drops = useRef<ReturnType<typeof catchDrops> | null>(null);
  const dragging = useRef<number | null>(null);
  /** D-22: where the top of the Choose button is in the rectangle at rest, so the Merge button takes that place. */
  const chooseAt = useRef(0);
  /** The height of the band while the options are in it, and whether the last render showed the result. */
  const bandHeight = useRef(0);
  const slotHeight = useRef(0);
  const resultBefore = useRef(false);
  const tracked = { tool: page, lang } as const;
  const one = mode === 'single';
  const merging = mode === 'merge';
  /** The tools that run by themselves fold their options under "Adjust" after the result (§ 483). */
  const adjustable = runMode === 'auto' && Boolean(Options);
  const mergeTexts = texts.options as unknown as MergeTexts;

  const render = () => {
    const active = document.activeElement;
    if (active && active !== document.body && slotRef.current?.contains(active)) m.slotFocus = true;
    setTick((tick) => tick + 1);
  };
  const say = (message: string) => {
    m.announce = '';
    // F14 (d-8, § 629): a sentence said while a run that a change started is going (a turn of a page in Rotate, in the
    // grid or in the page view) is that gesture's one sentence: the run adds no "Done!" of its own.
    if (runMode === 'auto' && m.phase === 'processing' && !m.focusDownload) m.hush = m.runId;
    setTick((tick) => tick + 1);
    window.setTimeout(() => {
      m.announce = message;
      setTick((tick) => tick + 1);
    }, 50);
  };

  const client = (): Promise<Client> =>
    import('./client.ts').catch(() => {
      throw Object.assign(new Error('the PDF engine did not load'), { name: UNAVAILABLE });
    });

  // --- what each file is ------------------------------------------------------------------------------------------

  function refuse(item: Item, failure: Failure): void {
    item.failure = failure;
    item.status = 'error';
    if (!item.reported && failure.reason !== 'one-at-a-time' && failure.reason !== 'no-pages') {
      item.reported = true;
      track('tool_error', { ...tracked, browser: browserLabel(navigator.userAgent), codec: codecOf(failure), reason: failure.reason as ErrorReason });
    }
  }

  /** Reads every new file in turn; refuses what no tool here can use (a lock the tool does not take). */
  async function readAll(id: number): Promise<void> {
    let engine: Client | null = null;
    try {
      engine = await client();
    } catch {
      engine = null;
    }
    // A copy of the list: the person can move a row of the Merge list while the files are read (tests/e2e/pdf-privacy.spec.ts),
    // and walking the live list would skip the file that took the place of the one being read (DECISOES § 168).
    for (const item of [...m.items]) {
      if (m.runId !== id) return;
      if (item.status !== 'reading' || item.removed) continue;
      let result: Awaited<ReturnType<Client['inspect']>> | null = null;
      try {
        result = engine ? await engine.inspect(item.file) : null;
      } catch {
        result = null;
      }
      if (m.runId !== id) return;
      if (!result) refuse(item, { reason: 'load' });
      else if (!result.ok) refuse(item, { reason: result.reason, ...(result.source ? { source: result.source } : {}) });
      else {
        item.info = result;
        item.status = 'waiting';
        const takesLocks = page === 'unlock-pdf' || (page === 'pdf-to-jpg' && result.lock === 'restricted');
        if (result.lock === 'password' && !takesLocks) refuse(item, { reason: 'needs-password' });
        else if (result.lock === 'restricted' && !takesLocks) refuse(item, { reason: 'restricted' });
        else if (page === 'unlock-pdf' && result.lock === 'none') refuse(item, { reason: 'not-encrypted' });
      }
      render();
    }
    if (m.runId !== id) return;
    afterReading();
  }

  /** "2 PDFs ready" under the action, or what Merge still needs; the same words on screen and in the status. */
  function readyCount(count: number): string {
    if (merging && count < 2) return mergeTexts.needMore ?? '';
    return count === 1 ? t.queue.readyOne : fmt(t.queue.ready, { count });
  }

  function afterReading(): void {
    m.readingLevel = false;
    const ready = m.items.filter(usable);
    if (ready.length === 0) {
      m.phase = 'error';
      if (!m.completeSent) {
        m.completeSent = true;
        track('tool_complete', { ...tracked, outcome: 'failed' });
      }
      render();
      return;
    }
    m.phase = 'ready';
    if (runMode === 'auto') void run(false);
    else {
      m.focusAction = true;
      // The focus goes to the action, so the status says what the reading found: the files ready, and the ones refused
      // (review F4-F7 d-1; DECISOES § 305).
      const refused = m.items.length - ready.length;
      // Merge with one PDF left after the refusals also says what it still needs, as the screen does (second pass, s-3).
      const needs = merging && ready.length < 2;
      const some = fmt(t.errors.some, { count: refused });
      // Merge: the count of the list says "2 PDFs ready" in its own region (role="status"), so this one says only the refusals.
      m.announce = refused === 0 ? (merging ? '' : readyCount(ready.length)) : needs ? `${some} ${readyCount(ready.length)}` : some;
      render();
    }
  }

  // --- the run ----------------------------------------------------------------------------------------------------

  /**
   * The requests of this run: per file, or one for the whole list (Merge). No request at all: the options are not
   * complete, and the field says why. A file of a batch with no request while others have one: these options leave it
   * nothing to do (PDF to JPG, a range with none of its pages), so it is `skipped` and its row says so (DECISOES § 178).
   */
  function plan(): { requests: { items: Item[]; op: PdfOperation; key: string }[]; skipped: Item[] } | null {
    const views = m.items.filter(usable).map(viewOf);
    const ready = m.items.filter(usable);
    if (merging) {
      const first = ready[0];
      const op = first ? tool.operation(stateRef.current, viewOf(first), views) : null;
      return op ? { requests: [{ items: ready, op, key: keyOf(op) + ready.map((item) => item.id).join(',') }], skipped: [] } : null;
    }
    const chosen = one ? ready.slice(0, 1) : ready;
    const out: { items: Item[]; op: PdfOperation; key: string }[] = [];
    const skipped: Item[] = [];
    for (const item of chosen) {
      const op = tool.operation(stateRef.current, viewOf(item), views);
      if (op) out.push({ items: [item], op, key: keyOf(op) });
      else skipped.push(item);
    }
    return out.length > 0 ? { requests: out, skipped } : null;
  }

  async function run(fromButton: boolean): Promise<void> {
    const planned = plan();
    if (!planned) {
      if (fromButton) {
        m.showErrors = true;
        render();
      } else if (m.phase !== 'processing') {
        m.phase = 'ready';
        m.redo = false;
        render();
      }
      return;
    }
    // The press of the action is the person asking for the result: the focus goes to Download when it comes, whatever
    // was picked, moved or changed before (DECISOES § 176).
    if (fromButton) {
      m.focusDownload = true;
      // The press is the next action after a row left the Merge list: the Undo goes (D-21).
      m.undo = null;
      // The coffee line of the result is known before it: its room is kept from this press (§ 484).
      if (m.newUse && !m.coffeeSoon && coffeeDue()) m.coffeeSoon = true;
    }
    const { requests, skipped } = planned;
    // F14 (§ 625): what the run asks says whether its output has a password (the rule reads the operation, not the tool).
    m.sealed = requests.some((request) => request.op.kind === 'protect');
    // The press of the action closes a view of the band (a file of the Merge list): the result takes its place.
    if (fromButton) shut();
    // A skipped file that had outputs leaves the download: it is made again without them.
    const dropped = skipped.some((item) => item.outputs);
    for (const item of skipped) {
      refuse(item, { reason: 'no-pages' });
      item.outputs = null;
      item.op = null;
    }
    const work = requests.filter((request) => !(request.items.every((item) => item.op === request.key && item.outputs)));
    if (work.length === 0 && !dropped && (m.bundle || m.single)) {
      m.phase = 'done';
      m.redo = false;
      render();
      return;
    }
    const id = ++m.runId;
    // F14 (§ 625; item 8, E-4): a new run lets the view of the last result go, and its document with it.
    if (m.view?.from === 'result') shut();
    // A change made with the result on screen (an option under "Adjust", the order of the Merge) keeps the result until
    // the new one, or the WaterLevel after 400 ms: the rectangle never shows the ready card in between (§ 483).
    m.redo = !fromButton && (m.phase === 'done' || m.redo) && Boolean(m.bundle ?? m.single);
    // A WaterLevel already on screen (the reading, before an auto tool's run) stays for the run: no other state flashes
    // between the two (DECISOES § 176).
    const levelShown = Boolean(levelRef.current?.isConnected);
    m.phase = 'processing';
    m.finished = 0;
    m.total = work.length;
    m.zipping = false;
    m.showLevel = levelShown;
    m.showErrors = false;
    m.notes = [];
    for (const request of work) for (const item of request.items) item.status = 'waiting';
    render();
    const timer = window.setTimeout(() => {
      if (m.runId === id && m.phase === 'processing') {
        m.showLevel = true;
        render();
      }
    }, SHOW_PROGRESS_AFTER_MS);
    try {
      let engine: Client | null = null;
      try {
        engine = await client();
      } catch {
        engine = null;
      }
      for (const request of work) {
        if (m.runId !== id) return;
        for (const item of request.items) item.status = 'working';
        render();
        let result: Awaited<ReturnType<Client['processFiles']>> | null = null;
        try {
          result = engine ? await engine.processFiles(request.op, request.items.map((item) => item.file)) : null;
        } catch {
          result = null;
        }
        if (m.runId !== id) return;
        m.finished += 1;
        for (const item of request.items) {
          if (!result) {
            refuse(item, { reason: 'load' });
            item.outputs = null;
            item.op = null;
          } else if (!result.ok) {
            refuse(item, { reason: result.reason, ...(result.source ? { source: result.source } : {}) });
            item.outputs = null;
            item.op = null;
            if (result.reason === 'wrong-password') m.focusWrong = true;
          } else {
            item.failure = null;
            item.status = 'done';
            item.op = request.key;
            // Merge gives one output for the whole list: it is kept on the first file.
            item.outputs = item === request.items[0] ? result.outputs : [];
            item.outcome = result.outcome;
            m.notes.push(...result.notes);
          }
        }
        render();
      }
      if (m.runId !== id) return;
      await bundle(id);
    } finally {
      window.clearTimeout(timer);
    }
  }

  /** The outputs of the run, named, in order: one downloads as it is, two or more go into a ZIP. */
  async function bundle(id: number): Promise<void> {
    const done = m.items.filter((item) => item.outputs && item.status === 'done');
    const entries = done.flatMap((item) =>
      (item.outputs ?? []).map((output) => ({
        source: item.file.name,
        output,
        tag: output.kind !== 'pdf' ? `${t.files.page}-${output.index ?? 1}` : page === 'split-pdf' ? splitTag(t.files, (stateRef.current as { mode?: string }).mode, output.index ?? 1) : suffix,
      })),
    );
    const names = pdfOutputNames(
      entries.map((entry) => ({ source: entry.source, tag: entry.tag, extension: entry.output.kind === 'pdf' ? 'pdf' : entry.output.kind === 'png' ? 'png' : 'jpg' })),
      t.fileFallback,
    );
    revoke(m.bundle);
    revoke(m.single);
    m.bundle = null;
    m.single = null;
    // F13a · UX-14: the files a chip takes along are these, one by one with their names, never the ZIP.
    m.outs = entries.map((entry, i) => ({ format: entry.output.kind, name: names[i] ?? '', bytes: entry.output.bytes }));
    if (entries.length === 1 && entries[0]) {
      const output = entries[0].output;
      const type = output.kind === 'pdf' ? 'application/pdf' : output.kind === 'png' ? 'image/png' : 'image/jpeg';
      const blob = new Blob([output.bytes as BlobPart], { type });
      m.single = { blob, url: URL.createObjectURL(blob), name: names[0] ?? `${t.files.document}.pdf` };
    } else if (entries.length > 1) {
      m.zipping = true;
      render();
      try {
        const engine = await client();
        const blob = await engine.zip(entries.map((entry, i) => ({ name: names[i] ?? `${i}.bin`, blob: new Blob([entry.output.bytes as BlobPart]) })));
        if (m.runId !== id) return;
        m.bundle = { blob, url: URL.createObjectURL(blob), name: `${page === 'pdf-to-jpg' ? t.files.imagesZip : t.files.zip}.zip` };
      } catch {
        for (const item of done) refuse(item, { reason: 'load' });
      }
    }
    finish();
  }

  function finish(): void {
    const done = m.items.filter((item) => item.status === 'done' && item.outputs);
    const failed = m.items.filter((item) => item.failure !== null).length;
    m.zipping = false;
    m.redo = false;
    const delivered = m.single ?? m.bundle;
    m.phase = delivered ? 'done' : m.items.some(usable) ? 'ready' : 'error';
    const unchanged = done.length > 0 && done.every((item) => item.outcome === 'unchanged');
    if (!m.completeSent && (delivered || m.phase === 'error')) {
      m.completeSent = true;
      const outcome: Outcome = !delivered ? 'failed' : unchanged ? 'unchanged' : tool.success;
      track('tool_complete', { ...tracked, outcome });
    }
    if (delivered && m.newUse && done.some((item) => item.outcome === 'new')) {
      m.newUse = false;
      m.coffee = countUse() ? 'ask' : '';
    }
    // F13a · UX-14: a batch a chip brought also says where it came from.
    if (!(delivered && m.hush === m.runId)) m.announce = delivered ? [says(done), failed > 0 ? fmt(t.errors.some, { count: failed }) : '', fromNote()].filter(Boolean).join(' ') : '';
    render();
  }

  /** F13a · UX-14 (DECISOES § 498): "Oli brought this PDF from Merge PDF.", for files a chip brought. */
  function fromNote(): string {
    const name = m.from ? origins[m.from] : undefined;
    if (!name) return '';
    const count = m.items.filter(usable).length;
    return fmt(count > 1 ? t.carry.fromMany : t.carry.from, { tool: name, count });
  }

  function totals(done: Item[]): { before: number; after: number } {
    const before = done.reduce((sum, item) => sum + item.file.size, 0) + (merging ? m.items.filter((item) => usable(item) && !done.includes(item)).reduce((sum, item) => sum + item.file.size, 0) : 0);
    const after = done.reduce((sum, item) => sum + (item.outputs ?? []).reduce((inner, output) => inner + output.bytes.length, 0), 0);
    return { before, after };
  }

  function says(done: Item[]): string {
    const many = done.length > 1;
    // F13a (D-10): Rotate says how many pages turned and which way.
    if (page === 'rotate-pdf') {
      const state = stateRef.current as { turn?: number; scope?: string; turns?: Record<number, number> };
      const words = texts.options as unknown as { doneOne: string; donePicked: string; rightTurn: string; halfTurn: string; leftTurn: string };
      const turn = state.turn === 2 ? words.halfTurn : state.turn === 3 ? words.leftTurn : words.rightTurn;
      const pages = done[0]?.info?.pages ?? 1;
      if (many) return fmt(texts.doneMany, { count: done.length, turn });
      if (state.scope === 'pick' && m.items.filter(usable).length === 1) {
        const count = Object.values(state.turns ?? {}).filter((quarter) => quarter % 4 !== 0).length;
        return fmt(words.donePicked, { count, pages });
      }
      return pages === 1 ? fmt(words.doneOne, { turn }) : fmt(texts.done, { pages, turn });
    }
    if (page === 'compress-pdf') {
      const { before, after } = totals(done);
      const saved = before > 0 ? (1 - after / before) * 100 : 0;
      if (!done.some((item) => item.outcome === 'new') || !worthSaying(saved)) return many ? t.result.unchangedMany : t.result.unchanged;
      return fmt(many ? texts.doneMany : texts.done, { percent: percent(saved, lang), count: done.length });
    }
    // {count} counts what came out: one output per file in a batch, the parts of a Split, the images of PDF to JPG (for one
    // PDF of many pages it was the images said as PDFs, DECISOES § 178). The Merge says how many files went into its one
    // PDF (DECISOES § 183).
    const count = merging ? done.length : done.reduce((sum, item) => sum + (item.outputs?.length ?? 0), 0);
    return fmt(count > 1 ? texts.doneMany : texts.done, { count, percent: '' });
  }

  // --- the batch ----------------------------------------------------------------------------------------------------

  function teardown(): void {
    letGo();
    for (const item of m.items) item.removed = true;
    m.items = [];
    m.outs = [];
    m.focusWrong = false;
    m.undo = null;
    revoke(m.bundle);
    revoke(m.single);
    m.bundle = null;
    m.single = null;
  }

  /** The room of the rectangle and of the band goes back to its own: a gesture (a new batch, Start over) asks for it. */
  function unlock(): void {
    m.lock = 0;
    m.bandHold = 0;
    // A tool that runs by itself keeps the room of a coffee line that is still due, so the next drop grows nothing (§ 495).
    m.coffeeSoon = runMode === 'auto' && coffeeDue();
    m.redo = false;
    m.adjustOpen = false;
    m.orderOpen = false;
  }

  function newItem(file: File, failure: Failure | null = null): Item {
    return { id: m.nextId++, file, status: failure ? 'error' : 'reading', info: null, failure, outputs: null, outcome: null, op: null, reported: false, removed: false };
  }

  /** `from`: the page whose chip brought these files (UX-14), checked against the origins of this page. */
  function addFiles(files: File[], from: string | null = null): void {
    if (files.length === 0) return;
    const append = merging && (appending.current || (m.items.length > 0 && m.phase !== 'done'));
    appending.current = false;
    m.lost = null;
    drops.current?.reset();
    if (!append) m.from = from;
    // Adding is the next action after a row left the Merge list: the Undo goes (D-21).
    m.undo = null;
    if (!append) {
      m.runId += 1;
      teardown();
      unlock();
      m.completeSent = false;
      m.newUse = true;
      m.coffee = '';
      m.expanded = false;
      m.focusDownload = true;
      // A tool that runs by itself gives its result with no other gesture: the drop is the one that asks for it.
      m.coffeeSoon = runMode === 'auto' && coffeeDue();
      if (one) {
        const fresh = { ...tool.initial, ...(tool.start?.(texts.options as never) ?? {}) };
        stateRef.current = fresh;
        setState(fresh);
      } else if (tool.perFile) {
        // The options of the batch stay; the ones of the last file go (DECISOES § 178).
        const initial = tool.initial as Record<string, unknown>;
        const fresh: Record<string, unknown> = { ...stateRef.current };
        for (const key of tool.perFile as readonly string[]) fresh[key] = initial[key];
        stateRef.current = fresh;
        setState(fresh);
      }
      track('tool_start', tracked);
    } else {
      m.runId += 1;
      revoke(m.bundle);
      revoke(m.single);
      m.bundle = null;
      m.single = null;
    }
    const taken = one && m.items.some((item) => !item.removed);
    m.items.push(...files.map((file, i) => (one && (taken || i > 0) ? newItem(file, { reason: 'one-at-a-time' }) : newItem(file))));
    m.phase = 'reading';
    m.readingLevel = false;
    m.showErrors = false;
    // Merge: the count of the list says "Reading 2 PDFs…" in its own region, so the panel's region says nothing more.
    m.announce = merging ? '' : t.progress.reading;
    setOver(0);
    // D-27: the reading is the list (or the ready card) at once; its WaterLevel only after 400 ms, as the processing's.
    const id = m.runId;
    window.setTimeout(() => {
      if (m.runId === id && m.phase === 'reading') {
        m.readingLevel = true;
        render();
      }
    }, SHOW_PROGRESS_AFTER_MS);
    render();
    void readAll(m.runId);
  }

  function update(patch: object): void {
    // F14 (§ 625): a change of the options makes the result on view an old one: its view goes.
    if (m.view?.from === 'result') shut();
    const next = { ...stateRef.current, ...patch };
    stateRef.current = next;
    setState(next);
    m.focusDownload = false;
    if (m.items.length === 0 || m.phase === 'reading') return;
    if (runMode === 'auto') {
      m.announce = '';
      void run(false);
    } else if (m.phase === 'done') {
      m.phase = 'ready';
      render();
    }
  }

  function startOver(): void {
    m.runId += 1;
    teardown();
    unlock();
    m.from = null;
    m.lost = null;
    m.phase = 'idle';
    m.announce = '';
    m.coffee = '';
    m.showErrors = false;
    setOver(0);
    const fresh = { ...tool.initial, ...(tool.start?.(texts.options as never) ?? {}) };
    stateRef.current = fresh;
    setState(fresh);
    render();
    window.setTimeout(() => chooseRef.current?.focus(), 0);
  }

  /** Takes a file out for good: the × of a row being read, the remove button of a refused row. */
  function removeItem(item: Item): void {
    // F14 (§ 626): the view of the row that leaves goes with it, its document let go at once; so does a view of the result.
    if (m.view && (m.view.from === item.id || m.view.from === 'result')) shut();
    item.removed = true;
    m.undo = null;
    m.items = m.items.filter((other) => other !== item);
    if (m.items.length === 0) {
      startOver();
      return;
    }
    if (m.phase === 'done' || m.phase === 'ready') {
      m.phase = 'ready';
      revoke(m.bundle);
      revoke(m.single);
      m.bundle = null;
      m.single = null;
      if (runMode === 'auto') void run(false);
    }
    render();
  }

  /**
   * The remove button of a row of the Merge list (D-21): the row leaves, and in its place a line says so with Undo, at the
   * same height, until the next action (Merge, Add, another remove). No timer (WCAG 2.2.1). The focus goes to Undo.
   */
  function removeRow(item: Item, position: number): void {
    removeItem(item);
    if (m.items.length === 0) return;
    m.undo = { item, position, said: false };
    m.focusUndo = true;
    render();
    const undo = m.undo;
    // The sentence goes into the region after the line is on screen, so a screen reader says it (an element born with
    // its text is not said).
    window.setTimeout(() => {
      if (m.undo !== undo) return;
      undo.said = true;
      render();
    }, 50);
  }

  /** Undo: the row comes back to its place, and the focus to its remove button. */
  function undoRemove(): void {
    const undo = m.undo;
    if (!undo) return;
    m.undo = null;
    undo.item.removed = false;
    m.items.splice(Math.min(undo.position, m.items.length), 0, undo.item);
    m.focusRow = undo.item.id;
    render();
  }

  /**
   * `focus` is the control of the moved row that keeps the focus: the arrow button that was pressed, or the other one when
   * the row reached the end and the pressed one gave its place to the empty one (DECISOES § 177; F13a, D-23).
   */
  function moveItem(from: number, to: number, focus = '.fo-merge__move'): void {
    if (to < 0 || to >= m.items.length || from === to) return;
    const [item] = m.items.splice(from, 1);
    if (!item) return;
    m.items.splice(to, 0, item);
    // A move is an action too: the Undo of a row that left would put it back in the wrong place.
    m.undo = null;
    say(fmt(t.queue.moved, { name: item.file.name || t.fileFallback, position: to + 1, total: m.items.length }));
    // After the result the order is under "Order" in the band, and a change merges again at once (§ 479).
    if (m.phase === 'done' || (m.phase === 'processing' && m.redo)) void run(false);
    window.setTimeout(() => {
      const row = rootRef.current?.querySelector<HTMLElement>(`[data-row="${item.id}"]`);
      (row?.querySelector<HTMLElement>(focus) ?? row?.querySelector<HTMLElement>('.fo-merge__move'))?.focus();
    }, 0);
  }

  // --- the page view in the band (F14; § 625 and § 626) ------------------------------------------------------------

  /** The view of the band goes, and the engine lets its document go (never the file of the grid: its key is its own). */
  function letGo(): void {
    const view = m.view;
    m.view = null;
    m.focusBack = null;
    if (view) void client().then((engine) => engine.release(view.key)).catch(() => {});
  }

  /** Closes the view of the band; `back`: the button that opened it takes the focus again. */
  function shut(back = false): void {
    const view = m.view;
    if (!view) return;
    letGo();
    if (back) m.focusBack = view.from === 'result' ? '.fo-result__view' : `[data-row="${view.from}"] .fo-merge__view`;
    render();
  }

  function openView(file: File, boxes: readonly PageBox[], from: BandView['from']): void {
    letGo();
    m.views += 1;
    const key = `${from === 'result' ? 'r' : 'm'}${m.views}`;
    m.view = { key, boxes, pictures: pictures(key, file, boxes, client), index: 0, from };
    render();
  }

  /** "View the new PDF": the output is read again for its pages and boxes, and only its pages on view are drawn. */
  async function viewResult(): Promise<void> {
    if (m.view?.from === 'result') return shut(true);
    const out = m.outs[0];
    if (!out) return;
    const id = m.runId;
    const file = new File([out.bytes as BlobPart], out.name, { type: 'application/pdf' });
    let found: Awaited<ReturnType<Client['inspect']>> | null = null;
    try {
      found = await (await client()).inspect(file);
    } catch {
      found = null;
    }
    if (m.runId !== id || m.outs[0] !== out || !found?.ok || found.boxes.length === 0) return;
    openView(file, found.boxes, 'result');
  }

  /** "View pages of {name}" in a row of the Merge list: the boxes the reading gave, the pages drawn as they are seen. */
  function viewRow(item: Item): void {
    if (m.view?.from === item.id) return shut(true);
    if (item.info) openView(item.file, item.info.boxes, item.id);
  }

  // --- events from the page -----------------------------------------------------------------------------------------

  function warmOnce(): void {
    if (warmed.current) return;
    warmed.current = true;
    void client().then((engine) => engine.warm([...tool.warm])).catch(() => {});
  }

  useEffect(() => {
    forgetWithoutConsent();
    // A tool that runs by itself: the inline script of PdfIsland.astro (COFFEE_AHEAD_SCRIPT) gave the rectangle the room of the
    // coffee line before the first paint when the next use shows it, which hydration keeps as it is. The model takes the same
    // answer, so the drop that asks for the result grows nothing (the file picker is no recent input; DECISOES § 495).
    if (runMode !== 'auto') return;
    const due = coffeeDue();
    if (!due) slotRef.current?.removeAttribute('data-coffee');
    if (due !== m.coffeeSoon) {
      m.coffeeSoon = due;
      render();
    }
  }, []);

  useEffect(() => {
    if (m.phase === 'done' && m.focusDownload && downloadRef.current) {
      m.focusDownload = false;
      downloadRef.current.focus();
    }
    if (m.phase === 'ready' && m.focusAction && actionRef.current) {
      m.focusAction = false;
      const active = document.activeElement;
      const lost = !active || active === document.body;
      // The options come with the ready card, a frame before this effect: a person already typing in one of their fields
      // keeps it, and the keys never go to the action (DECISOES § 240). Merge (D-27): the button takes the place of the
      // reading line, so only a focus left on nothing goes to it; a person on a row or on Add more stays there.
      // F14 (§ 624): a page view opened in that frame keeps the focus on its heading.
      const viewing = active instanceof HTMLElement && active.closest('.fo-pview') !== null;
      if (merging ? lost : !typingIn(rootRef.current) && !viewing) actionRef.current.focus();
    }
    // D-11 (§ 177 and § 240): after a wrong password the focus goes back to the field, with what was typed selected, so a
    // new try replaces it; the error is on the field (role="alert").
    // F13a (DECISOES § 510): the mark waits for the field to say the error. The effect of the render that showed the
    // work can run at the start of the next render (Preact runs the pending effects first), with the mark already set and
    // the field not yet marked: consumed there, the focus never came (WebKit, when the engine answers within a frame).
    if (m.focusWrong) {
      const field = rootRef.current?.querySelector<HTMLInputElement>('.fo-pass input[aria-invalid="true"]');
      if (field) {
        m.focusWrong = false;
        field.focus();
        field.select();
      }
    }
    if (m.focusUndo && undoRef.current) {
      m.focusUndo = false;
      undoRef.current.focus();
    }
    if (m.focusRow !== null) {
      const id = m.focusRow;
      m.focusRow = null;
      rootRef.current?.querySelector<HTMLElement>(`[data-row="${id}"] .fo-merge__remove`)?.focus();
    }
    // F14 (§ 625 and § 626): back from a view of the band, the button that opened it (the mark waits for it, § 510).
    if (m.focusBack) {
      const target = rootRef.current?.querySelector<HTMLElement>(m.focusBack);
      if (target) {
        m.focusBack = null;
        target.focus();
      }
    }
    const active = document.activeElement;
    if ((!active || active === document.body) && m.slotFocus) {
      // The WaterLevel takes the focus without scrolling: it is the rectangle itself, already in view, and on a first
      // visit the browser scrolled its foot over the cookie notice (DECISOES § 514).
      const level = levelRef.current;
      if (level) level.focus({ preventScroll: true });
      else (downloadRef.current ?? actionRef.current ?? holdRef.current ?? startOverRef.current ?? chooseRef.current)?.focus();
    }
    m.slotFocus = false;
  });

  useEffect(() => {
    // F13a · UX-18 A (DECISOES § 501): files dragged anywhere on the page light the zone where it is, and a drop
    // anywhere goes to the tool (the Merge list adds them), with the panel brought into view. The drag of a row of the
    // list or of a page of the grid carries no files and is left to them.
    drops.current = catchDrops({
      enter: (count) => {
        if (m.phase !== 'processing') setOver(Math.max(1, count));
      },
      leave: () => setOver(0),
      drop: (files) => {
        if (files.length === 0) return;
        addFiles(files);
        bringIntoView(slotRef.current);
      },
    });
    const onPaste = (event: ClipboardEvent) => {
      if (pasteBelongsToElement(event.target)) return;
      const files = filesOf(event.clipboardData?.files);
      if (files.length === 0) return;
      event.preventDefault();
      addFiles(files);
    };
    document.addEventListener('paste', onPaste);
    // The files shared with the installed app, when the "Open with" page sent them here (F8; DECISOES § 290), or the result
    // a next-step chip brought (F13a · UX-14; § 498 and § 499).
    void takeInbox(page).then((arrival) => {
      const from = arrival.from !== null && arrival.from in origins ? arrival.from : null;
      if (arrival.files.length > 0) addFiles(arrival.files, from);
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

  /**
   * F13a · UX-14 (DECISOES § 496 and § 497): a plain click on a chip that takes the files writes them into the
   * inbox, notes the choice and goes; anything else only links, as before. The event is the next_step_click of always.
   */
  function follow(event: TargetedMouseEvent<HTMLAnchorElement>, chip: PdfChip): void {
    track('next_step_click', { ...tracked, target: chip.target });
    const files = carriedBy(chip);
    if (!chip.carry || files.length === 0 || !plainClick(event) || !workerControls()) return;
    event.preventDefault();
    if (m.carrying) return;
    m.carrying = true;
    const href = chip.href;
    // Written or not (a failure, or 3 s), the page goes: without the choice the tool opens empty, as the link of before.
    void storeForNext(files, chip.target, page).then(() => {
      m.carrying = false;
      location.assign(href);
    });
  }

  /** The files a chip would take along: the outputs its tool takes, in order, one at most for a one-file tool. */
  function carriedBy(chip: PdfChip): Outgoing[] {
    const carry = chip.carry;
    if (!carry) return [];
    const typeOf = (kind: PdfOutput['kind']) => (kind === 'pdf' ? 'application/pdf' : kind === 'png' ? 'image/png' : 'image/jpeg');
    const taken = m.outs.filter((out) => carry.accepts.includes(out.format));
    return (carry.single ? taken.slice(0, 1) : taken).map((out) => ({ name: out.name, blob: new Blob([out.bytes as BlobPart], { type: typeOf(out.format) }) }));
  }

  // --- thumbnails of the file of a single-file tool -------------------------------------------------------------

  const subject = one ? (m.items.find((item) => usable(item)) ?? null) : mode === 'batch' && m.items.filter(usable).length === 1 ? (m.items.find(usable) ?? null) : null;
  const wantsGrid = Boolean(subject && tool.grid?.(state));
  const thumbnails = useMemo<Thumbnails | null>(() => (subject?.info && wantsGrid ? pictures(`f${subject.id}`, subject.file, subject.info.boxes, client) : null), [subject?.id, subject?.info, wantsGrid]);
  useEffect(() => {
    if (!subject) return undefined;
    const key = `f${subject.id}`;
    return () => {
      void client().then((engine) => engine.release(key)).catch(() => {});
    };
  }, [subject?.id]);

  // --- what is on screen ------------------------------------------------------------------------------------------

  const openPicker = (append = false) => {
    appending.current = append;
    inputRef.current?.click();
  };
  const onZoneClick = (event: TargetedMouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, a, input')) return;
    openPicker();
  };
  const nameOf = (item: Item) => item.file.name || t.fileFallback;

  function linked(sentence: string, name: string, link: { href: string; name: string }): ComponentChildren {
    const [before = '', after = ''] = sentence.split('{tool}').map((part) => fmt(part, { name }));
    return (
      <>
        {before}
        <a href={link.href}>{link.name}</a>
        {after}
      </>
    );
  }

  function reasonOf(item: Item): ComponentChildren {
    const failure = item.failure;
    if (!failure) return '';
    const name = nameOf(item);
    const e = t.errors;
    switch (failure.reason) {
      case 'empty': return fmt(e.empty, { name });
      case 'not-pdf': return failure.source === 'jpeg' || failure.source === 'png' || failure.source === 'webp' || failure.source === 'heic' || failure.source === 'gif' ? linked(e.notPdfImage, name, links.imageToPdf) : fmt(e.notPdf, { name });
      case 'truncated': return fmt(e.truncated, { name });
      case 'corrupted': return fmt(e.corrupted, { name });
      case 'needs-password': return linked(e.needsPassword, name, links.unlock);
      case 'restricted': return linked(e.restricted, name, links.unlock);
      case 'wrong-password': return fmt(e.wrongPassword, { name });
      case 'not-encrypted': return fmt(e.notEncrypted, { name });
      case 'too-large': return fmt(e.tooLarge, { name });
      case 'encode': return fmt(e.encode, { name });
      case 'load': return fmt(offlineNow() ? e.offlineRow : e.load, { name });
      case 'one-at-a-time': return fmt(e.oneAtATime, { name });
      case 'no-pages': return fmt(e.noPages, { name });
    }
  }

  const pagesLabel = (info: PdfInspect | null) => (info ? (info.pages === 1 ? t.queue.page : fmt(t.queue.pages, { count: info.pages })) : '');
  const done = m.items.filter((item) => item.status === 'done' && item.outputs);
  const delivered = m.single ?? m.bundle;
  const reading = m.phase === 'reading';
  // Every file failed to load the engine while the device is offline: the tool was kept without its engine (F8).
  const offline = m.phase === 'error' && m.items.length > 0 && m.items.every((item) => item.failure?.reason === 'load') && offlineNow();
  // F13a · UX-14 (DECISOES § 499): the empty box, until files come (any way) or a file is dragged over it.
  const lost = m.lost && m.phase === 'idle' && m.items.length === 0 ? m.lost : null;
  const dropState = over > 0 && m.phase !== 'processing' ? 'over' : offline ? 'offline' : m.phase === 'error' ? 'error' : lost ? 'lost' : undefined;
  const showLevel = (m.phase === 'processing' && m.showLevel) || (reading && m.readingLevel && m.items.length > 0);
  /** The result is on screen: done, or a new one on its way after a change made with it on screen (§ 483). */
  const resultOnScreen = Boolean(delivered) && !showLevel && (m.phase === 'done' || (m.phase === 'processing' && m.redo));
  const listOnScreen = merging && !showLevel && !resultOnScreen && m.items.length > 0 && m.phase !== 'error' && m.phase !== 'idle';
  const progress = m.zipping ? 100 : reading ? 0 : batchPercent(m.finished, m.total, 0);
  const actionText = texts.action ? (tool.actionLabel?.(state, texts.options as never, subject ? viewOf(subject) : null, texts.action) ?? texts.action) : '';
  const many = m.items.length > 1 || merging;
  const [helpBefore = '', helpAfter = ''] = fmt(t.drop.helpDesktop, { note: texts.note }).split('{kbd}');
  const ready = m.items.filter(usable);
  const labels = { to: t.queue.to, download: t.queue.download, cancel: t.queue.cancel, remove: t.queue.remove };
  const pose: Pose = dropState === 'over' ? 'gulp' : showLevel ? 'swim' : resultOnScreen ? 'cheer' : dropState === 'offline' ? 'buoy' : dropState === 'error' ? 'oops' : dropState === 'lost' ? 'lost' : 'wave';

  // F13a (§ 479 and § 484): what the rectangle and the band keep, set before the frame is painted, so a state
  // that comes with no gesture (the Merge button after the reading, the result) never moves what is under it.
  useLayoutEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const choose = chooseRef.current;
    if (choose && m.phase === 'idle' && !dropState) chooseAt.current = Math.round(choose.getBoundingClientRect().top - slot.getBoundingClientRect().top);
    const panel = mergeRef.current;
    if (panel && listOnScreen) m.lock = Math.max(m.lock, Math.ceil(panel.getBoundingClientRect().height));
    // At the first frame of the result the rectangle goes back to its own height and the band under it takes the room
    // the list left, so the island keeps its height (nothing under it moves) and the chips come right under the
    // Download (§ 479).
    const firstResult = resultOnScreen && !resultBefore.current;
    if (firstResult) m.lock = 0;
    if (m.lock > 0) {
      slot.style.setProperty('--fo-lock', `${m.lock}px`);
      slot.dataset['lock'] = 'list';
    } else {
      slot.style.removeProperty('--fo-lock');
      delete slot.dataset['lock'];
    }
    const band = bandRef.current;
    if (band) {
      if (!resultOnScreen) {
        bandHeight.current = band.getBoundingClientRect().height;
        slotHeight.current = slot.getBoundingClientRect().height;
      } else if (firstResult) {
        const freed = Math.max(0, slotHeight.current - slot.getBoundingClientRect().height);
        if (adjustable || freed > 0) m.bandHold = bandHeight.current + freed;
      }
      band.style.minHeight = m.bandHold > 0 ? `${m.bandHold}px` : '';
    }
    resultBefore.current = resultOnScreen;
  });

  let panel: JSX.Element;
  if (showLevel) {
    const total = Math.max(1, m.total);
    const value = Math.min(m.finished, total);
    panel = (
      <div
        ref={levelRef}
        tabindex={-1}
        class="fo-level"
        role="progressbar"
        aria-label={reading ? t.progress.reading : texts.progressLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-valuetext={m.total >= 2 ? fmt(t.progress.valueText, { percent: percent(progress, lang), done: value, total }) : percent(progress, lang)}
        aria-busy={m.zipping || reading ? 'true' : undefined}
        style={`--level:${progress}%`}
      >
        <div class="fo-water fo-water--moving" />
        <div class="fo-level__text">
          <span class="fo-level__pct">{progress}%</span>
          {m.zipping || reading ? (
            <span class="fo-level__msg fo-level__msg--busy">
              <span class="fo-spin" aria-hidden="true" />
              {m.zipping ? fmt(t.result.zipping, { count: done.reduce((sum, item) => sum + (item.outputs?.length ?? 0), 0) }) : t.progress.reading}
            </span>
          ) : (
            <span class="fo-level__msg">{t.progress.working}</span>
          )}
          {m.total >= 2 && !m.zipping && m.phase === 'processing' && <span class="fo-level__count">{fmt(t.progress.count, { done: value, total })}</span>}
        </div>
      </div>
    );
  } else if (resultOnScreen && delivered) {
    const { before, after } = totals(done);
    const saved = before > 0 ? (1 - after / before) * 100 : 0;
    const gained = page === 'compress-pdf' && done.some((item) => item.outcome === 'new') && worthSaying(saved);
    const outputs = done.reduce((sum, item) => sum + (item.outputs?.length ?? 0), 0);
    const pages = done.reduce((sum, item) => sum + (item.outputs ?? []).reduce((inner, output) => inner + (output.pages ?? 0), 0), 0) || (done[0]?.info?.pages ?? 1);
    const notes = [...new Set(m.notes)].map((note) => NOTE_KEY[note]).filter((key): key is NonNullable<typeof key> => key !== null);
    const size = fileSize(m.bundle ? m.bundle.blob.size : after, lang);
    const viewable = Boolean(m.single) && m.outs.length === 1 && m.outs[0]?.format === 'pdf' && !m.sealed;
    panel = (
      <section key="result" class="fo-result fo-deep" aria-labelledby="fo-says">
        <div class="fo-water fo-result__sea" />
        <div class="fo-result__head">
          {gained && (
            // The placard repeats the number of the sentence, which is read: it is only seen (UX-04 A).
            <div class="fo-placard fo-pop" aria-hidden="true">
              <span class="fo-placard__n">{MINUS + percent(saved, lang)}</span>
              <span class="fo-placard__l">{texts.placardLabel}</span>
            </div>
          )}
          <p class="fo-result__says" id="fo-says">
            {says(done)}
          </p>
        </div>
        {/* "2.6 MB → 717 KB" when Compress made the file lighter; "246 KB · 3 pages" otherwise (Principle 4). The arrow is
            the icon, with the hidden word for screen readers (the fonts have no →; design-checks checkArrows). */}
        <dl class="fo-numbers">
          {gained ? (
            <>
              <div class="fo-numbers__before">
                <dt class="fo-sr">{t.result.before}</dt>
                <dd>{fileSize(before, lang)}</dd>
              </div>
              <div>
                <dt class="fo-sr">{t.result.after}</dt>
                <dd>
                  <Icon raw={arrowIcon} class="fo-icon--inline" />
                  <span class="fo-sr">{t.queue.to} </span>
                  {size}
                </dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt class="fo-sr">{t.result.after}</dt>
                <dd>{size}</dd>
              </div>
              <div class="fo-numbers__count">
                <dt class="fo-sr">{outputs > 1 ? t.result.files : t.result.pages}</dt>
                <dd>{outputs > 1 ? fmt(t.result.filesCount, { count: outputs }) : pages === 1 ? t.queue.page : fmt(t.queue.pages, { count: pages })}</dd>
              </div>
            </>
          )}
        </dl>
        <div class="fo-result__actions">
          <a
            ref={downloadRef}
            class="fo-btn fo-btn--download fo-btn--lg"
            href={delivered.url}
            download={delivered.name}
            onClick={() => track('download', tracked)}
          >
            <Icon raw={downloadIcon} />
            {m.bundle ? fmt(t.result.downloadZip, { size: fileSize(m.bundle.blob.size, lang) }).split(' · ')[0] : t.result.download}{' '}
            <span class="fo-btn__meta">{m.bundle ? `· ${fmt(t.result.downloadZip, { size: fileSize(m.bundle.blob.size, lang) }).split(' · ').slice(1).join(' · ')}` : `· ${fileSize(delivered.blob.size, lang)}`}</span>
          </a>
          <div class="fo-result__more">
            <button ref={startOverRef} type="button" class="fo-btn fo-btn--ghost" onClick={startOver}>
              {t.result.startOver}
            </button>
            {/* F14 (§ 625): one PDF with no password came out (Split with one part too; never a ZIP, the images of PDF to
                JPG or a protected PDF): its pages open first in the band, after Start over in the row (as "Before and after"). */}
            {viewable && (
              <button type="button" class="fo-btn fo-btn--ghost fo-result__view" aria-expanded={m.view?.from === 'result' ? 'true' : 'false'} onClick={() => void viewResult()}>
                {t.view.openResult}
              </button>
            )}
          </div>
        </div>
        {(notes.length > 0 || fromNote()) && (
          <ul class="fo-result__notes">
            {fromNote() && (
              // F13a · UX-14 (DECISOES § 498): where files brought by a chip came from, the first note of the card.
              <li class="fo-result__from">
                <Icon raw={arrowIcon} class="fo-icon--inline" />
                {fromNote()}
              </li>
            )}
            {notes.map((key) => (
              <li key={key}>{t.result.notes[key]}</li>
            ))}
          </ul>
        )}
        {m.coffee && (m.coffee === 'done' ? (
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
  } else if (listOnScreen) {
    // The Merge list lives in the rectangle (UX-04 A, tool-a-merge; § 479): the count, the Merge button where the
    // Choose button was (D-22), the order help in view (D-26), the rows, "Add more PDFs" and Start over at the foot.
    const pages = ready.reduce((sum, item) => sum + (item.info?.pages ?? 0), 0);
    const count = reading ? (m.items.length === 1 ? t.queue.readingOne : fmt(t.queue.readingCount, { count: m.items.length })) : ready.length === 1 ? t.queue.readyOne : fmt(t.queue.ready, { count: ready.length });
    panel = (
      <section ref={mergeRef} class="fo-merge-panel" aria-labelledby="fo-count" data-state={reading ? 'reading' : undefined} style={chooseAt.current > 0 ? `--fo-merge-at:${chooseAt.current}px` : undefined}>
        <p key="count" class="fo-count" id="fo-count" role="status">
          {count}
          {!reading && pages > 0 && <span class="fo-count__pages"> · {pages === 1 ? t.queue.page : fmt(t.queue.pages, { count: pages })}</span>}
        </p>
        {reading || ready.length < 2 ? (
          <p key="hold" ref={holdRef} tabindex={-1} class={reading ? 'fo-merge__hold' : 'fo-merge__hold fo-merge__hold--need'}>
            {reading ? t.progress.reading : mergeTexts.needMore}
          </p>
        ) : (
          <button key="action" ref={actionRef} type="button" class="fo-btn fo-btn--brand fo-btn--lg fo-btn--block-mobile" onClick={() => void run(true)}>
            {actionText}
          </button>
        )}
        <p key="help" class="fo-merge__help" id="fo-merge-help">
          {mergeTexts.help}
        </p>
        <ol key="list" class="fo-merge" aria-label={mergeTexts.listLabel} aria-describedby="fo-merge-help">
          {mergeRows(true)}
        </ol>
        <button key="add" type="button" class="fo-merge__add" onClick={() => openPicker(true)}>
          <span class="fo-water" aria-hidden="true" />
          <Icon inner={icons.plus} />
          <span>{mergeTexts.add}</span>
        </button>
        <button key="restart" ref={startOverRef} type="button" class="fo-btn fo-btn--ghost fo-merge__restart" onClick={startOver}>
          {t.result.startOver}
        </button>
      </section>
    );
  } else if (reading || m.phase === 'ready' || m.phase === 'processing' || (m.phase === 'done' && !delivered)) {
    // While Oli works and before the WaterLevel shows (400 ms), the ready card stays: the action that was pressed keeps
    // the focus, and the empty DropZone never flashes in the slot (DECISOES § 176). F13a (D-27): the reading is this card
    // too, with the file "Reading…" and, in the place of the action, the line of the same height.
    const first = one ? (reading ? m.items.find((item) => !item.removed && !item.failure) : ready[0]) : undefined;
    const cardLabels = { to: t.queue.to, download: t.queue.download, cancel: t.queue.cancel, remove: t.queue.remove };
    panel = (
      <div key="ready" class={reading ? 'fo-ready fo-ready--reading' : 'fo-ready'}>
        {first ? (
          reading ? (
            <FileCard name={nameOf(first)} category="pdf" labels={cardLabels} icon={icons.pdf} state="waiting" status={t.queue.reading} onCancel={() => removeItem(first)} />
          ) : (
            <FileCard name={nameOf(first)} category="pdf" labels={cardLabels} icon={icons.pdf} state="done" before={fileSize(first.file.size, lang)} note={pagesLabel(first.info)} />
          )
        ) : (
          <p class="fo-ready__count">{reading ? (m.items.length === 1 ? t.queue.readingOne : fmt(t.queue.readingCount, { count: m.items.length })) : readyCount(ready.length)}</p>
        )}
        <div class="fo-result__actions">
          {texts.action &&
            (reading ? (
              <p key="hold" ref={holdRef} tabindex={-1} class="fo-merge__hold">
                {t.progress.reading}
              </p>
            ) : (
              <button key="action" ref={actionRef} type="button" class="fo-btn fo-btn--brand fo-btn--lg" onClick={() => void run(true)}>
                {actionText}
              </button>
            ))}
          <button key="restart" ref={startOverRef} type="button" class="fo-btn fo-btn--ghost" onClick={startOver}>
            {t.result.startOver}
          </button>
        </div>
      </div>
    );
  } else {
    const single = m.items.length === 1 ? m.items[0] : undefined;
    const lostFrom = lost ? (origins[lost.from] ?? '') : '';
    // UX-18 A: the drag of files is heard by the document (catchDrops), not by the zone.
    panel = (
      <div key="drop" class="fo-drop" data-state={dropState} onClick={onZoneClick}>
        <div class="fo-drop__sea">
          <div class="fo-water" />
        </div>
        {dropState === 'error' ? (
          // The error has no round seal (UX-04 A): the sentence with the alert icon, the reason, and the way out right under them.
          <>
            <div role="alert" class="fo-drop__error">
              <p class="fo-drop__error-title">
                <Icon raw={alertIcon} />
                {t.errors.title}
              </p>
              <p class="fo-drop__why">{m.items.length > 1 || !single ? fmt(t.errors.all, { count: m.items.length }) : reasonOf(single)}</p>
            </div>
            <button ref={chooseRef} type="button" class="fo-btn" onClick={() => openPicker()}>
              {t.errors.chooseAnother}
            </button>
          </>
        ) : (
          <>
            <div class="fo-drop__badge" aria-hidden="true">
              {dropState === 'lost' ? <Icon inner={icons.info} /> : <Icon raw={dropState === 'over' ? downloadIcon : dropState === 'offline' ? offlineIcon : fileDropIcon} />}
            </div>
            {lost ? (
              // F13a · UX-14 (DECISOES § 499): the empty box: what happened, "Choose PDFs" (the first stop of Tab in the
              // panel; nothing calls focus()) and the way back to the page the files came from.
              <>
                <div role="status" class="fo-drop__message">
                  <p class="fo-drop__title">{lost.count > 1 ? t.carry.lostTitleMany : t.carry.lostTitle}</p>
                  <p class="fo-drop__help">{fmt(lost.count > 1 ? t.carry.lostHelpMany : t.carry.lostHelp, { tool: lostFrom })}</p>
                </div>
                <div class="fo-drop__actions">
                  <button ref={chooseRef} type="button" class="fo-btn fo-btn--brand fo-btn--lg" onClick={() => openPicker()} onFocus={warmOnce}>
                    <Icon inner={icons.pdf} />
                    {one ? t.drop.chooseOne : t.drop.chooseMany}
                  </button>
                  {/* history.back(): the back cache of the browser usually brings the result back as it was. */}
                  <button type="button" class="fo-btn" onClick={() => history.back()}>
                    {fmt(t.carry.back, { tool: lostFrom })}
                  </button>
                </div>
              </>
            ) : dropState === 'over' ? (
              <>
                <p class="fo-drop__title">{t.drop.over}</p>
                <p class="fo-drop__help">{over > 1 ? fmt(t.drop.overCount, { count: over }) : t.drop.overHelp}</p>
              </>
            ) : dropState === 'offline' ? (
              <>
                <div role="status" class="fo-drop__message">
                  <p class="fo-drop__title">{t.errors.offline}</p>
                  <p class="fo-drop__help">{t.errors.offlineHelp}</p>
                </div>
                <button ref={chooseRef} type="button" class="fo-btn" onClick={() => openPicker()}>
                  {t.errors.chooseAnother}
                </button>
              </>
            ) : (
              <>
                <p class="fo-drop__title fo-desktop-only">{one ? t.drop.titleOne : t.drop.titleMany}</p>
                <button ref={chooseRef} type="button" class="fo-btn fo-btn--brand fo-btn--lg fo-btn--block-mobile" aria-describedby="fo-drop-help" onClick={() => openPicker()} onFocus={warmOnce}>
                  <Icon inner={icons.pdf} />
                  {one ? t.drop.chooseOne : t.drop.chooseMany}
                </button>
                <p class="fo-drop__help" id="fo-drop-help">
                  <span class="fo-desktop-only">
                    {helpBefore}
                    <span class="fo-kbd">{t.drop.pasteKey}</span>
                    {helpAfter}
                  </span>
                  <span class="fo-mobile-only">{texts.note}</span>
                </p>
              </>
            )}
          </>
        )}
      </div>
    );
  }

  // --- the rows: the queue of a batch, and the Merge list ------------------------------------------------------------

  function rowProps(item: Item): FileCardProps {
    const name = nameOf(item);
    const base = { name, category: 'pdf' as const, labels, icon: icons.pdf };
    if (item.status === 'reading') return { ...base, state: 'waiting', status: t.queue.reading, onCancel: () => removeItem(item) };
    if (item.status === 'error' && item.failure && !(item.failure.reason === 'wrong-password' && item.info)) return { ...base, state: 'error', reason: reasonOf(item), onRemove: () => removeItem(item) };
    if (item.status === 'working') return { ...base, state: 'working', status: t.queue.working, progress: 0.5, onCancel: () => removeItem(item) };
    if (item.status === 'done' && item.outputs && page === 'compress-pdf') {
      const after = item.outputs.reduce((sum, output) => sum + output.bytes.length, 0);
      const gained = (1 - after / item.file.size) * 100;
      return { ...base, state: 'done', before: fileSize(item.file.size, lang), after: fileSize(after, lang), ...(item.outcome === 'new' && worthSaying(gained) ? { gain: MINUS + percent(gained, lang) } : { note: t.queue.unchanged }) };
    }
    return { ...base, state: 'done', before: fileSize(item.file.size, lang), note: pagesLabel(item.info) };
  }

  /**
   * The rows of the Merge list (in the rectangle, or under "Order" after the result): the number of the place in a deep
   * circle, the arrows that can move (an empty place of 48 px where one cannot, D-23), and the remove button (D-21) on
   * the rows that are read, in the rectangle only. A row being read keeps its × and its arrows (the order can change while
   * the files are read; DECISOES § 168); a refused row has its reason and its own remove button.
   */
  function mergeRows(removable: boolean): JSX.Element[] {
    const last = m.items.length - 1;
    let order = 0;
    const rows = m.items.map((item, position) => {
      const refused = item.status === 'error' && item.failure !== null;
      if (!refused) order += 1;
      const card: FileCardProps = refused
        ? { name: nameOf(item), category: 'pdf', labels, state: 'error', reason: reasonOf(item), onRemove: () => removeItem(item) }
        : item.status === 'reading'
          ? { name: nameOf(item), category: 'pdf', labels, order, state: 'waiting', status: t.queue.reading, onCancel: () => removeItem(item) }
          : { name: nameOf(item), category: 'pdf', labels, order, state: 'done', before: fileSize(item.file.size, lang), note: pagesLabel(item.info) };
      return (
        <li
          key={item.id}
          class="fo-merge__row fo-filelist__row"
          data-row={item.id}
          data-state={refused ? 'error' : item.status === 'reading' ? 'reading' : undefined}
          draggable={!refused}
          onDragStart={(event) => {
            dragging.current = position;
            event.dataTransfer?.setData('text/plain', nameOf(item));
          }}
          onDragOver={(event) => {
            if (dragging.current !== null) event.preventDefault();
          }}
          onDrop={(event) => {
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
          <FileCard {...card} />
          {!refused && (
            <span class="fo-merge__moves">
              {position > 0 ? (
                <button type="button" class="fo-btn fo-btn--icon fo-merge__move fo-merge__move--up" aria-label={fmt(t.queue.moveEarlier, { name: nameOf(item) })} onClick={() => moveItem(position, position - 1, '.fo-merge__move--up')}>
                  <Icon inner={icons.chevron} class="fo-icon--sm" />
                </button>
              ) : (
                <span class="fo-merge__none" aria-hidden="true" />
              )}
              {position < last ? (
                <button type="button" class="fo-btn fo-btn--icon fo-merge__move fo-merge__move--down" aria-label={fmt(t.queue.moveLater, { name: nameOf(item) })} onClick={() => moveItem(position, position + 1, '.fo-merge__move--down')}>
                  <Icon inner={icons.chevron} class="fo-icon--sm" />
                </button>
              ) : (
                <span class="fo-merge__none" aria-hidden="true" />
              )}
            </span>
          )}
          {removable &&
            !refused &&
            (item.status === 'reading' ? (
              // The place of the remove button while the file is read (its × is in the card): the arrows do not move when it comes.
              <span class="fo-merge__none" aria-hidden="true" />
            ) : (
              <button type="button" class="fo-btn fo-btn--icon fo-merge__remove" aria-label={fmt(t.queue.remove, { name: nameOf(item) })} onClick={() => removeRow(item, position)}>
                <Icon inner={icons.trash} />
              </button>
            ))}
          {/* F14 (§ 626): "View pages of {name}", the last action of the row; its place is kept while the file is read. */}
          {!refused &&
            (item.info ? (
              <button type="button" class="fo-btn fo-btn--icon fo-merge__view" aria-label={fmt(t.view.openFile, { name: nameOf(item) })} aria-expanded={m.view?.from === item.id ? 'true' : 'false'} onClick={() => viewRow(item)}>
                <Icon inner={icons.zoom} />
              </button>
            ) : (
              <span class="fo-merge__gap" aria-hidden="true" />
            ))}
        </li>
      );
    });
    const undo = m.undo;
    if (removable && undo) {
      rows.splice(
        Math.min(undo.position, rows.length),
        0,
        <li key={`out-${undo.item.id}`} class="fo-merge__undo">
          <span role="status">{undo.said ? fmt(t.queue.out, { name: nameOf(undo.item) }) : ''}</span>
          <button ref={undoRef} type="button" class="fo-btn fo-btn--ghost" onClick={undoRemove}>
            {t.queue.undo}
          </button>
        </li>,
      );
    }
    return rows;
  }

  const shown = m.expanded ? m.items : m.items.slice(0, VISIBLE_ROWS);
  const hidden = m.items.length - shown.length;
  // The queue of a batch (one row per file), under the band. Merge has its rows in the rectangle; when every file was
  // refused, the rectangle is the error and the rows with their reasons come here.
  const queue =
    // F13a (F-13): a file refused only because its password was wrong is still the file of the card above: no second card.
    m.items.length > 0 && (merging ? m.phase === 'error' : many || m.items.some((item) => item.failure && !(item.failure.reason === 'wrong-password' && item.info))) ? (
      <div class="fo-queue">
        <div class="fo-filelist" role="list" aria-label={t.queue.label}>
          {shown.map((item) => (
            <div role="listitem" key={item.id} class="fo-filelist__row" data-row={item.id}>
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
            }}
          >
            {fmt(t.queue.showMore, { count: hidden })}
          </button>
        )}
      </div>
    ) : null;

  // --- the band under the rectangle (§ 483) --------------------------------------------------------------------
  // Before the result: the options. After it: the chips, then the options folded under "Adjust" (the tools that run by
  // themselves) or still in view (the ones with an action: a change brings the action back to the rectangle). The room of
  // the chips is kept from the gesture that asks for the result: the press of the action, and for Merge the whole time the
  // list is in the rectangle (the band is reserved, empty: the chips and the closed "Order" are there, not seen).
  const chipsSeen = resultOnScreen && chips.length > 0;
  // F13a · UX-14 (DECISOES § 496 and § 497): what each chip takes along, decided here in the client, with the
  // formats of what came out and a service worker in control.
  const controlled = workerControls();
  const formats = chipsSeen ? m.outs.map((out) => out.format) : [];
  const takes = (chip: PdfChip): number => (chip.carry && controlled ? carries(chip.carry.accepts, chip.carry.single, formats) : 0);
  const carryingNow = chipsSeen && chips.some((chip) => takes(chip) > 0);
  const chipsKept = !chipsSeen && chips.length > 0 && ((runMode === 'action' && m.phase === 'processing') || listOnScreen);
  const orderSeen = merging && resultOnScreen;
  const orderKept = merging && listOnScreen;
  const failureOfSubject = subject?.failure?.reason ?? null;
  const options = Options ? (
    <Options
      key="options"
      state={state}
      update={update}
      texts={texts.options}
      panel={t}
      icons={icons}
      ink={ink}
      file={subject ? viewOf(subject) : null}
      files={m.items.filter(usable).map(viewOf)}
      thumbnails={thumbnails}
      busy={m.phase === 'processing'}
      showErrors={m.showErrors}
      failure={failureOfSubject}
      announce={say}
    />
  ) : null;
  const summary = tool.summary?.(state, texts.options as never);
  // F14 (§ 625 and § 626): the view of the result or of a file of the Merge list, the first item of the band, only to see.
  const view = m.view;
  const bandView = view ? (
    <PageView
      key={view.key}
      boxes={view.boxes}
      sequence={view.boxes.map((_, i) => i)}
      index={view.index}
      thumbnails={view.pictures}
      small={THUMB_WIDTH}
      texts={t.view}
      icons={icons}
      announce={say}
      onGo={(index) => {
        view.index = index;
        render();
      }}
      onBack={() => shut(true)}
    />
  ) : null;
  // The Merge has no options: its band is there at rest too, empty, so the list growing in the rectangle (a gesture: the
  // files) never moves into view what is under the island (§ 479).
  const band =
    options || merging || chipsSeen || chipsKept || bandView ? (
      <div class="fo-band" ref={bandRef}>
        {bandView}
        {(chipsSeen || chipsKept) && (
          <nav key="next" class={chipsKept ? 'fo-next fo-next--kept' : 'fo-next'} aria-labelledby="fo-next-label" inert={chipsKept} aria-hidden={chipsKept ? 'true' : undefined}>
            <span class="fo-next__label" id="fo-next-label">
              {t.next.label}
            </span>
            {chips.map((chip) => {
              const count = takes(chip);
              return (
                <a
                  key={chip.href}
                  class={chip.category === 'none' ? 'fo-chip' : `fo-chip fo-cat--${chip.category}`}
                  href={chip.href}
                  data-carry={count > 0 ? '' : undefined}
                  onClick={(event) => follow(event, chip)}
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
        )}
        {(chipsSeen || chipsKept) && chips.some((chip) => chip.carry) && (
          // F13a · UX-14 (DECISOES § 496 and § 500): the files the chips take along never leave the device. Where a
          // chip could take them, the line keeps its room with the chips (hidden when none takes them now: no service worker,
          // or a format the tools do not take), so the band never grows or shrinks when the result comes.
          <p key="carry" class={carryingNow ? 'fo-carry' : 'fo-carry fo-next--kept'} aria-hidden={carryingNow ? undefined : 'true'}>
            <Icon inner={icons.shield} class="fo-icon--inline" />
            {carryingNow && formats.length === 1 ? carryLine.one : carryLine.many}
          </p>
        )}
        {(orderSeen || orderKept) && (
          <details
            key="order"
            class={orderKept ? 'fo-adjust fo-merge__order fo-merge__order--kept' : 'fo-adjust fo-merge__order'}
            open={orderSeen && m.orderOpen}
            inert={orderKept}
            aria-hidden={orderKept ? 'true' : undefined}
            onToggle={(event) => {
              m.orderOpen = (event.currentTarget as HTMLDetailsElement).open;
              render();
            }}
          >
            <summary>
              <span>{fmt(mergeTexts.order, { count: ready.length })}</span>
              <Icon inner={icons.down} class="fo-icon--sm" />
            </summary>
            {orderSeen && m.orderOpen && (
              <div class="fo-adjust__body">
                <p class="fo-field__help" id="fo-order-help">
                  {mergeTexts.orderHelp}
                </p>
                <ol class="fo-merge" aria-label={mergeTexts.listLabel} aria-describedby="fo-order-help">
                  {mergeRows(false)}
                </ol>
              </div>
            )}
          </details>
        )}
        {options &&
          (adjustable && resultOnScreen ? (
            <details
              key="adjust"
              class="fo-adjust"
              open={m.adjustOpen}
              onToggle={(event) => {
                m.adjustOpen = (event.currentTarget as HTMLDetailsElement).open;
                render();
              }}
            >
              <summary>
                <span>
                  {t.result.adjust}
                  {summary && <span class="fo-adjust__now"> · {summary}</span>}
                </span>
                <Icon inner={icons.down} class="fo-icon--sm" />
              </summary>
              {/* The fields are in the page only while "Adjust" is open: closed, a browser still lays out the content of a
                  details (content-visibility), and fields nobody sees would count as fields near an ad (§ 483). */}
              {m.adjustOpen && (
                <div class="fo-adjust__body">
                  <p class="fo-field__help">{t.result.adjustHelp}</p>
                  {options}
                </div>
              )}
            </details>
          ) : (
            options
          ))}
      </div>
    ) : null;

  return (
    <div class="fo-tool-island fo-pdf-island" ref={rootRef}>
      <div class="fo-slot" ref={slotRef} onPointerEnter={warmOnce} data-coffee={m.coffeeSoon ? 'soon' : undefined}>
        {/* One Oli, in the top right corner of the rectangle in every state, looking at the words (UX-04 A). */}
        <Oli pose={pose} class="fo-slot__oli" />
        {panel}
      </div>
      <p class="fo-sr" role="status">
        {m.announce}
      </p>
      {band}
      {queue}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="application/pdf,.pdf"
        hidden
        onChange={(event) => {
          const target = event.currentTarget;
          const files = filesOf(target.files);
          target.value = '';
          addFiles(files);
        }}
      />
    </div>
  );
}
