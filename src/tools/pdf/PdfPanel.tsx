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
// State lives in one mutable model (the run loop is async and must see the latest values); every change calls
// render(). Object URLs are revoked when replaced and at "Start over"; the grid's thumbnails go when they leave the
// screen. Nothing typed (password, text, ranges, numbers) leaves this component except in the request to the worker.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ComponentChildren, JSX, TargetedKeyboardEvent, TargetedMouseEvent } from 'preact';
import { fileSize, fmt, percent } from '../../i18n/format.ts';
import { browserLabel, track, type Codec, type ErrorReason, type Outcome } from '../../analytics/events.ts';
import Icon from '../../icons/Icon.tsx';
import FileCard, { type FileCardProps } from '../../components/FileCard.tsx';
import Oli from '../image/Oli.tsx';
import { countUse, dontShowAgain, forgetWithoutConsent, type CoffeeLine } from '../image/coffee.ts';
import { carriesFiles, dragCount, filesOf, pasteBelongsToElement } from '../image/paste.ts';
import { takeInbox } from '../image/inbox.ts';
import { batchPercent, worthSaying } from '../image/summary.ts';
import { pdfOutputNames } from './names.ts';
import { PDF_TOOLS } from './tools.tsx';
import type { PdfInspect, PdfNote, PdfOperation, PdfOutput, PdfReason, PdfSniffed } from '../../engine/pdf/types.ts';
import type { PdfPanelTexts } from '../../i18n/types.ts';
import type { PdfFileView, PdfPanelData, Thumbnails } from './types.ts';
import type * as ClientModule from './client.ts';
import alertIcon from '../../../docs/design/assets/Icons/alert.svg?raw';
import arrowIcon from '../../../docs/design/assets/Icons/arrow-right.svg?raw';
import coffeeIcon from '../../../docs/design/assets/Icons/coffee.svg?raw';
import downloadIcon from '../../../docs/design/assets/Icons/download.svg?raw';
import uploadIcon from '../../../docs/design/assets/Icons/upload.svg?raw';
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
  /** Merge list, keyboard: the id of the row Space picked up (the arrow keys move it), or null. */
  grabbed: number | null;
}

const newModel = (): Model => ({
  items: [], phase: 'idle', runId: 0, nextId: 1, finished: 0, total: 0, zipping: false, showLevel: false, bundle: null, single: null, notes: [],
  announce: '', coffee: '', completeSent: false, newUse: false, focusDownload: false, focusAction: false, showErrors: false, expanded: false, slotFocus: false, grabbed: null,
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

export default function PdfPanel(props: PdfPanelData) {
  const { lang, page, t, texts, files: mode, run: runMode, suffix, chips, links, icons, ink, coffeeHref } = props;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseRef = useRef<HTMLButtonElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const startOverRef = useRef<HTMLButtonElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);
  const warmed = useRef(false);
  const appending = useRef(false);
  const dragging = useRef<number | null>(null);
  const tracked = { tool: page, lang } as const;
  const one = mode === 'single';

  const render = () => {
    const active = document.activeElement;
    if (active && active !== document.body && slotRef.current?.contains(active)) m.slotFocus = true;
    setTick((tick) => tick + 1);
  };
  const say = (message: string) => {
    m.announce = '';
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
    if (mode === 'merge' && count < 2) return (texts.options as { needMore?: string }).needMore ?? '';
    return count === 1 ? t.queue.readyOne : fmt(t.queue.ready, { count });
  }

  function afterReading(): void {
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
      const needs = mode === 'merge' && ready.length < 2;
      const some = fmt(t.errors.some, { count: refused });
      m.announce = refused === 0 ? readyCount(ready.length) : needs ? `${some} ${readyCount(ready.length)}` : some;
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
    if (mode === 'merge') {
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
        render();
      }
      return;
    }
    // The press of the action is the person asking for the result: the focus goes to Download when it comes, whatever
    // was picked, moved or changed before (DECISOES § 176).
    if (fromButton) m.focusDownload = true;
    const { requests, skipped } = planned;
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
      render();
      return;
    }
    const id = ++m.runId;
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
    m.announce = delivered ? [says(done), failed > 0 ? fmt(t.errors.some, { count: failed }) : ''].filter(Boolean).join(' ') : '';
    render();
  }

  function totals(done: Item[]): { before: number; after: number } {
    const before = done.reduce((sum, item) => sum + item.file.size, 0) + (mode === 'merge' ? m.items.filter((item) => usable(item) && !done.includes(item)).reduce((sum, item) => sum + item.file.size, 0) : 0);
    const after = done.reduce((sum, item) => sum + (item.outputs ?? []).reduce((inner, output) => inner + output.bytes.length, 0), 0);
    return { before, after };
  }

  function says(done: Item[]): string {
    const many = done.length > 1;
    if (page === 'compress-pdf') {
      const { before, after } = totals(done);
      const saved = before > 0 ? (1 - after / before) * 100 : 0;
      if (!done.some((item) => item.outcome === 'new') || !worthSaying(saved)) return many ? t.result.unchangedMany : t.result.unchanged;
      return fmt(many ? texts.doneMany : texts.done, { percent: percent(saved, lang), count: done.length });
    }
    // {count} counts what came out: one output per file in a batch, the parts of a Split, the images of PDF to JPG (for one
    // PDF of many pages it was the images said as PDFs, DECISOES § 178). The Merge says how many files went into its one
    // PDF (DECISOES § 183).
    const count = mode === 'merge' ? done.length : done.reduce((sum, item) => sum + (item.outputs?.length ?? 0), 0);
    return fmt(count > 1 ? texts.doneMany : texts.done, { count, percent: '' });
  }

  // --- the batch ----------------------------------------------------------------------------------------------------

  function teardown(): void {
    for (const item of m.items) item.removed = true;
    m.items = [];
    m.grabbed = null;
    revoke(m.bundle);
    revoke(m.single);
    m.bundle = null;
    m.single = null;
  }

  function newItem(file: File, failure: Failure | null = null): Item {
    return { id: m.nextId++, file, status: failure ? 'error' : 'reading', info: null, failure, outputs: null, outcome: null, op: null, reported: false, removed: false };
  }

  function addFiles(files: File[]): void {
    if (files.length === 0) return;
    const append = mode === 'merge' && (appending.current || (m.items.length > 0 && m.phase !== 'done'));
    appending.current = false;
    if (!append) {
      m.runId += 1;
      teardown();
      m.completeSent = false;
      m.newUse = true;
      m.coffee = '';
      m.expanded = false;
      m.focusDownload = true;
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
    m.showErrors = false;
    m.announce = t.progress.reading;
    setOver(0);
    render();
    void readAll(m.runId);
  }

  function update(patch: object): void {
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

  function removeItem(item: Item): void {
    item.removed = true;
    if (m.grabbed === item.id) m.grabbed = null;
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
   * `focus` is the control of the moved row that keeps the focus: the arrow button that was pressed (the other one when
   * the row reached the end and it became disabled, DECISOES § 177), the handle for the keyboard.
   */
  function moveItem(from: number, to: number, focus = '.fo-merge__move:not([disabled])'): void {
    if (to < 0 || to >= m.items.length || from === to) return;
    const [item] = m.items.splice(from, 1);
    if (!item) return;
    m.items.splice(to, 0, item);
    if (m.phase === 'done') m.phase = 'ready';
    say(fmt(t.queue.moved, { name: item.file.name || t.fileFallback, position: to + 1, total: m.items.length }));
    window.setTimeout(() => {
      const row = rootRef.current?.querySelector<HTMLElement>(`[data-row="${item.id}"]`);
      (row?.querySelector<HTMLElement>(focus) ?? row?.querySelector<HTMLElement>('.fo-merge__move:not([disabled])'))?.focus();
    }, 0);
  }

  /** Space or Enter on a row's handle: picks the row up, or drops it where it is. Each is said once (WCAG 4.1.3). */
  function toggleGrab(item: Item, position: number): void {
    const name = item.file.name || t.fileFallback;
    if (m.grabbed === item.id) {
      m.grabbed = null;
      say(fmt(t.queue.dropped, { name, position: position + 1, total: m.items.length }));
    } else {
      m.grabbed = item.id;
      say(fmt(t.queue.picked, { name }));
    }
  }

  /**
   * Arrow keys on a handle (the keyboard alternative to dragging a row, WCAG 2.5.7): while a row is picked up they move
   * it; otherwise they go to the handle of the next or previous row. Home and End go to the ends. Escape lets go.
   */
  function onGrabKey(event: TargetedKeyboardEvent<HTMLButtonElement>, item: Item, position: number): void {
    const last = m.items.length - 1;
    const target = event.key === 'ArrowUp' ? position - 1 : event.key === 'ArrowDown' ? position + 1 : event.key === 'Home' ? 0 : event.key === 'End' ? last : null;
    if (target !== null) {
      event.preventDefault();
      const to = Math.min(last, Math.max(0, target));
      if (m.grabbed === item.id) moveItem(position, to, '.fo-merge__grab');
      else {
        const other = m.items[to];
        if (other) rootRef.current?.querySelector<HTMLElement>(`[data-row="${other.id}"] .fo-merge__grab`)?.focus();
      }
    } else if (event.key === 'Escape' && m.grabbed === item.id) {
      m.grabbed = null;
      render();
    }
  }

  // --- events from the page -----------------------------------------------------------------------------------------

  function warmOnce(): void {
    if (warmed.current) return;
    warmed.current = true;
    void client().then((engine) => engine.warm([...tool.warm])).catch(() => {});
  }

  useEffect(() => forgetWithoutConsent(), []);

  useEffect(() => {
    if (m.phase === 'done' && m.focusDownload && downloadRef.current) {
      m.focusDownload = false;
      downloadRef.current.focus();
    }
    if (m.phase === 'ready' && m.focusAction && actionRef.current) {
      m.focusAction = false;
      // The options come with the ready card, a frame before this effect: a person already typing in one of their fields
      // keeps it, and the keys never go to the action (DECISOES § 240).
      if (!typingIn(rootRef.current)) actionRef.current.focus();
    }
    const active = document.activeElement;
    if ((!active || active === document.body) && m.slotFocus) (levelRef.current ?? downloadRef.current ?? actionRef.current ?? startOverRef.current ?? chooseRef.current)?.focus();
    m.slotFocus = false;
  });

  useEffect(() => {
    const onDragOver = (event: DragEvent) => {
      if (carriesFiles(event.dataTransfer)) event.preventDefault();
    };
    const onDrop = (event: DragEvent) => {
      if (!carriesFiles(event.dataTransfer)) return;
      event.preventDefault();
      setOver(0);
      const root = rootRef.current;
      if (root && event.target instanceof Node && root.contains(event.target)) addFiles(filesOf(event.dataTransfer?.files));
    };
    const onPaste = (event: ClipboardEvent) => {
      if (pasteBelongsToElement(event.target)) return;
      const files = filesOf(event.clipboardData?.files);
      if (files.length === 0) return;
      event.preventDefault();
      addFiles(files);
    };
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('drop', onDrop);
    document.addEventListener('paste', onPaste);
    // The files shared with the installed app, when the "Open with" page sent them here (F8; DECISOES § 290).
    void takeInbox(page).then((files) => {
      if (files.length > 0) addFiles(files);
    });
    return () => {
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('drop', onDrop);
      document.removeEventListener('paste', onPaste);
      m.runId += 1;
      teardown();
    };
  }, []);

  // --- thumbnails of the file of a single-file tool -------------------------------------------------------------

  const subject = one ? (m.items.find((item) => usable(item)) ?? null) : mode === 'batch' && m.items.filter(usable).length === 1 ? (m.items.find(usable) ?? null) : null;
  const wantsGrid = Boolean(subject && tool.grid?.(state));
  const thumbnails = useMemo<Thumbnails | null>(() => {
    if (!subject?.info || !wantsGrid) return null;
    // One picture per page, shared by whoever shows it (a grid cell, the Sign preview) and let go when the last one does.
    // Pictures are drawn THUMBS_AT_ONCE at a time, in the order asked; one whose cells all left before its turn is never
    // drawn, so a fast sweep does not leave the worker drawing every page it passed (DECISOES § 180).
    interface Entry {
      url: Promise<string | null>;
      done: (value: string | null) => void;
      users: number;
    }
    const cache = new Map<number, Entry>();
    const waiting: { index: number; entry: Entry }[] = [];
    let drawing = 0;
    const key = `f${subject.id}`;
    const boxes = subject.info.boxes;
    const draw = async (index: number): Promise<string | null> => {
      const box = boxes[index];
      const shownWidth = box ? (box.rotate === 90 || box.rotate === 270 ? box.height : box.width) : 612;
      try {
        const blob = await (await client()).thumbnail(key, subject.file, index, 240, shownWidth);
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
        void draw(next.index).then((value) => {
          drawing -= 1;
          next.entry.done(value);
          pump();
        });
      }
    };
    return {
      get(index) {
        let entry = cache.get(index);
        if (!entry) {
          let done: (value: string | null) => void = () => {};
          const url = new Promise<string | null>((resolve) => {
            done = resolve;
          });
          entry = { url, done, users: 0 };
          cache.set(index, entry);
          waiting.push({ index, entry });
        }
        entry.users += 1;
        const url = entry.url;
        pump();
        return url;
      },
      drop(index) {
        const entry = cache.get(index);
        if (!entry) return;
        entry.users -= 1;
        if (entry.users > 0) return;
        cache.delete(index);
        void entry.url.then((value) => value && URL.revokeObjectURL(value));
      },
    };
  }, [subject?.id, subject?.info, wantsGrid]);
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
  // Every file failed to load the engine while the device is offline: the tool was kept without its engine (F8).
  const offline = m.phase === 'error' && m.items.length > 0 && m.items.every((item) => item.failure?.reason === 'load') && offlineNow();
  const dropState = over > 0 && m.phase !== 'processing' ? 'over' : offline ? 'offline' : m.phase === 'error' ? 'error' : undefined;
  const showLevel = (m.phase === 'processing' && m.showLevel) || (m.phase === 'reading' && m.items.length > 0);
  const progress = m.zipping ? 100 : m.phase === 'reading' ? 0 : batchPercent(m.finished, m.total, 0);
  const actionText = texts.action ? (tool.actionLabel?.(state, texts.options as never, subject ? viewOf(subject) : null, texts.action) ?? texts.action) : '';
  const many = m.items.length > 1 || mode === 'merge';
  const [helpBefore = '', helpAfter = ''] = fmt(t.drop.helpDesktop, { note: texts.note }).split('{kbd}');

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
        aria-label={m.phase === 'reading' ? t.progress.reading : texts.progressLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-valuetext={m.total >= 2 ? fmt(t.progress.valueText, { percent: percent(progress, lang), done: value, total }) : percent(progress, lang)}
        aria-busy={m.zipping || m.phase === 'reading' ? 'true' : undefined}
        style={`--level:${progress}%`}
      >
        <div class="fo-water fo-water--moving">
          <Oli pose="swim" class="fo-level__oli" />
        </div>
        <div class="fo-level__text">
          <span class="fo-level__pct">{progress}%</span>
          {m.zipping || m.phase === 'reading' ? (
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
  } else if (m.phase === 'done' && delivered) {
    const { before, after } = totals(done);
    const saved = before > 0 ? (1 - after / before) * 100 : 0;
    const gained = page === 'compress-pdf' && done.some((item) => item.outcome === 'new') && worthSaying(saved);
    const outputs = done.reduce((sum, item) => sum + (item.outputs?.length ?? 0), 0);
    const pages = done.reduce((sum, item) => sum + (item.outputs ?? []).reduce((inner, output) => inner + (output.pages ?? 0), 0), 0);
    const notes = [...new Set(m.notes)].map((note) => NOTE_KEY[note]).filter((key): key is NonNullable<typeof key> => key !== null);
    panel = (
      <section class="fo-result fo-deep">
        <div class="fo-result__head">
          <Oli pose="cheer" class="fo-result__oli" />
          <p class="fo-result__says">{says(done)}</p>
          {gained && (
            <div class="fo-placard fo-pop">
              <span class="fo-placard__n">{MINUS + percent(saved, lang)}</span>
              <span class="fo-placard__l">{texts.placardLabel}</span>
            </div>
          )}
        </div>
        <dl class="fo-result__stats">
          {page === 'compress-pdf' && after < before && (
            <div class="fo-result__stat fo-result__stat--before">
              <dt>{t.result.before}</dt>
              <dd>{fileSize(before, lang)}</dd>
            </div>
          )}
          <div class="fo-result__stat">
            <dt>{t.result.after}</dt>
            <dd>{fileSize(m.bundle ? m.bundle.blob.size : after, lang)}</dd>
          </div>
          <div class="fo-result__stat">
            <dt>{outputs > 1 ? t.result.files : t.result.pages}</dt>
            <dd>{outputs > 1 ? outputs : pages || (done[0]?.info?.pages ?? 1)}</dd>
          </div>
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
          <button ref={startOverRef} type="button" class="fo-btn fo-btn--ghost" onClick={startOver}>
            {t.result.startOver}
          </button>
        </div>
        {notes.length > 0 && (
          <ul class="fo-result__notes">
            {notes.map((key) => (
              <li key={key}>{t.result.notes[key]}</li>
            ))}
          </ul>
        )}
        {m.coffee && (m.coffee === 'done' ? (
          // "Don't show this again" leaves one quiet sentence in the same place, read once (DECISOES § F12-C2).
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
  } else if (m.phase === 'ready' || m.phase === 'processing' || (m.phase === 'done' && !delivered)) {
    // While Oli works and before the WaterLevel shows (400 ms), the ready card stays: the action that was pressed keeps
    // the focus, and the empty DropZone never flashes in the slot (DECISOES § 176).
    const ready = m.items.filter(usable);
    const only = ready[0];
    panel = (
      <div class="fo-ready">
        {one && only ? (
          <FileCard name={nameOf(only)} category="pdf" labels={{ to: t.queue.to, download: t.queue.download, cancel: t.queue.cancel, remove: t.queue.remove }} state="done" before={fileSize(only.file.size, lang)} note={pagesLabel(only.info)} />
        ) : (
          <p class="fo-ready__count">{readyCount(ready.length)}</p>
        )}
        <div class="fo-result__actions">
          {texts.action && (
            <button ref={actionRef} type="button" class="fo-btn fo-btn--brand fo-btn--lg" onClick={() => void run(true)}>
              {actionText}
            </button>
          )}
          {mode === 'merge' && (
            <button type="button" class="fo-btn" onClick={() => openPicker(true)}>
              <Icon inner={icons.plus} />
              {(texts.options as { add?: string }).add}
            </button>
          )}
          <button ref={startOverRef} type="button" class="fo-btn fo-btn--ghost" onClick={startOver}>
            {t.result.startOver}
          </button>
        </div>
      </div>
    );
  } else {
    const single = m.items.length === 1 ? m.items[0] : undefined;
    panel = (
      <div class="fo-drop" data-state={dropState} onClick={onZoneClick} {...dragHandlers}>
        <div class="fo-drop__sea">
          <div class="fo-water" />
        </div>
        <Oli pose={dropState === 'over' ? 'gulp' : dropState === 'offline' ? 'buoy' : dropState === 'error' ? 'oops' : 'wave'} class="fo-drop__oli" />
        <div class="fo-drop__badge" aria-hidden="true">
          <Icon raw={dropState === 'over' ? downloadIcon : dropState === 'offline' ? offlineIcon : dropState === 'error' ? alertIcon : uploadIcon} />
        </div>
        {dropState === 'over' ? (
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
        ) : dropState === 'error' ? (
          <>
            <div role="alert" class="fo-drop__message">
              <p class="fo-drop__title">{t.errors.title}</p>
              <p class="fo-drop__help">{m.items.length > 1 || !single ? fmt(t.errors.all, { count: m.items.length }) : reasonOf(single)}</p>
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
      </div>
    );
  }

  // --- the queue: rows of every file; the merge list moves ---------------------------------------------------------

  const labels = { to: t.queue.to, download: t.queue.download, cancel: t.queue.cancel, remove: t.queue.remove };
  function rowProps(item: Item): FileCardProps {
    const name = nameOf(item);
    const base = { name, category: 'pdf' as const, labels };
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

  const shown = m.expanded || mode === 'merge' ? m.items : m.items.slice(0, VISIBLE_ROWS);
  const hidden = m.items.length - shown.length;
  const queue =
    m.items.length > 0 && (many || m.items.some((item) => item.failure)) ? (
      <div class="fo-queue">
        <div class={mode === 'merge' ? 'fo-filelist fo-merge' : 'fo-filelist'} role="list" aria-label={t.queue.label}>
          {shown.map((item, position) => (
            <div
              role="listitem"
              key={item.id}
              class="fo-filelist__row"
              data-row={item.id}
              data-grabbed={m.grabbed === item.id ? 'true' : undefined}
              draggable={mode === 'merge'}
              onDragStart={() => {
                dragging.current = position;
              }}
              onDragOver={(event) => {
                if (dragging.current !== null) event.preventDefault();
              }}
              onDrop={(event) => {
                if (dragging.current === null) return;
                event.preventDefault();
                moveItem(dragging.current, position);
                dragging.current = null;
              }}
            >
              {mode === 'merge' && (
                <button
                  type="button"
                  class="fo-btn fo-btn--icon fo-btn--ghost fo-merge__grab"
                  aria-pressed={m.grabbed === item.id}
                  aria-label={fmt(t.queue.pickUp, { name: nameOf(item) })}
                  aria-describedby="fo-merge-help"
                  onClick={() => toggleGrab(item, position)}
                  onKeyDown={(event) => onGrabKey(event, item, position)}
                >
                  <Icon inner={icons.reorder} class="fo-icon--sm" />
                </button>
              )}
              <FileCard {...rowProps(item)} />
              {mode === 'merge' && (
                <span class="fo-merge__moves">
                  <button type="button" class="fo-btn fo-btn--icon fo-btn--ghost fo-merge__move fo-merge__move--up" aria-label={fmt(t.queue.moveEarlier, { name: nameOf(item) })} disabled={position === 0} onClick={() => moveItem(position, position - 1, '.fo-merge__move--up:not([disabled])')}>
                    <Icon inner={icons.chevron} class="fo-icon--sm" />
                  </button>
                  <button type="button" class="fo-btn fo-btn--icon fo-btn--ghost fo-merge__move fo-merge__move--down" aria-label={fmt(t.queue.moveLater, { name: nameOf(item) })} disabled={position === m.items.length - 1} onClick={() => moveItem(position, position + 1, '.fo-merge__move--down:not([disabled])')}>
                    <Icon inner={icons.chevron} class="fo-icon--sm" />
                  </button>
                </span>
              )}
            </div>
          ))}
        </div>
        {mode === 'merge' && (
          <p class="fo-field__help" id="fo-merge-help">
            {(texts.options as { help?: string }).help}
          </p>
        )}
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

  const failureOfSubject = subject?.failure?.reason ?? null;
  return (
    <div class="fo-tool-island fo-pdf-island" ref={rootRef}>
      <div class="fo-slot" ref={slotRef} onPointerEnter={warmOnce}>
        {panel}
      </div>
      <p class="fo-sr" role="status">
        {m.announce}
      </p>
      {Options && (
        <Options
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
      )}
      {queue}
      {m.phase === 'done' && delivered && chips.length > 0 && (
        <nav class="fo-next" aria-labelledby="fo-next-label">
          <span class="fo-next__label" id="fo-next-label">
            {t.next.label}
          </span>
          {chips.map((chip) => (
            <a key={chip.href} class={chip.category === 'none' ? 'fo-chip' : `fo-chip fo-cat--${chip.category}`} href={chip.href} onClick={() => track('next_step_click', { ...tracked, target: chip.target })}>
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
