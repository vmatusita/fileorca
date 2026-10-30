// The tool panel island (the only Preact island of the tool page). DropZone, WaterLevel and
// ResultCard share one slot; options re-process at once (no Apply button). Markup and classes
// follow docs/design/components (v1.1); the look is provisional until the F1b.
import { useEffect, useRef, useState } from 'preact/hooks';
import type { JSX, TargetedMouseEvent } from 'preact';
import type { Lang } from '../../i18n/routes.ts';
import type { CompressImageTexts } from '../../i18n/types.ts';
import { fileSize, fmt, percent } from '../../i18n/format.ts';
import { browserLabel, track } from '../../analytics/events.ts';
import { isSupportedType, type Level } from '../../engine/image/recompress.ts';

export interface ToolPanelProps {
  lang: Lang;
  t: CompressImageTexts;
  moreToolsHref: string;
}

type Phase = 'idle' | 'over' | 'processing' | 'done' | 'error';

interface Result {
  url: string;
  name: string;
  before: number;
  after: number;
  width: number;
  height: number;
  outcome: 'smaller' | 'no-gain' | 'cannot-encode';
  format: string;
}

const TOOL = 'compress-image';
const SHOW_PROGRESS_AFTER_MS = 400;
const MINUS = '−';
const FORMAT_NAME: Record<string, string> = { 'image/jpeg': 'JPG', 'image/png': 'PNG', 'image/webp': 'WebP' };

function imageFrom(list: FileList | DataTransferItemList | null | undefined): File | null {
  if (!list) return null;
  for (const item of Array.from(list as ArrayLike<File | DataTransferItem>)) {
    const file = item instanceof File ? item : item.kind === 'file' ? item.getAsFile() : null;
    if (file) return file;
  }
  return null;
}

export default function ToolPanel({ lang, t, moreToolsHref }: ToolPanelProps) {
  const says = (outcome: Result['outcome'], saved: number, format: string) =>
    outcome === 'smaller'
      ? fmt(t.result.done, { percent: percent(saved, lang) })
      : outcome === 'no-gain'
        ? t.result.unchanged
        : fmt(t.result.cannotEncode, { format });
  const [phase, setPhase] = useState<Phase>('idle');
  const [showLevel, setShowLevel] = useState(false);
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState<Level>('recommended');
  const [result, setResult] = useState<Result | null>(null);
  const [errorName, setErrorName] = useState('');
  const [announce, setAnnounce] = useState('');
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseRef = useRef<HTMLButtonElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const runRef = useRef(0);
  // Focus goes to Download when the card appears for a new file, not when an option re-runs it.
  const focusDownload = useRef(false);

  useEffect(() => {
    if (phase === 'done' && focusDownload.current) {
      focusDownload.current = false;
      downloadRef.current?.focus();
    }
  }, [phase]);

  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.url);
  }, [result]);

  async function run(file: File, chosen: Level) {
    const id = ++runRef.current;
    setPhase('processing');
    setProgress(0);
    setShowLevel(false);
    const timer = window.setTimeout(() => {
      if (runRef.current === id) setShowLevel(true);
    }, SHOW_PROGRESS_AFTER_MS);
    try {
      const { compress } = await import('./engine-client.ts');
      const outcome = await compress(file, chosen, (value) => {
        if (runRef.current === id) setProgress(value);
      });
      if (runRef.current !== id) return;
      if (!outcome.ok) {
        fail(file, outcome.reason);
        return;
      }
      const after = outcome.blob.size;
      setResult({
        url: URL.createObjectURL(outcome.blob),
        name: file.name || t.fileFallback,
        before: file.size,
        after,
        width: outcome.width,
        height: outcome.height,
        outcome: outcome.outcome,
        format: FORMAT_NAME[file.type] ?? file.type,
      });
      setPhase('done');
      setAnnounce(says(outcome.outcome, (1 - after / file.size) * 100, FORMAT_NAME[file.type] ?? file.type));
      track('tool_complete', { tool: TOOL, lang, outcome: outcome.outcome === 'smaller' ? 'smaller' : 'unchanged' });
      if (outcome.outcome === 'cannot-encode') {
        track('tool_error', { tool: TOOL, lang, browser: browserLabel(navigator.userAgent), codec: file.type, reason: 'encode' });
      }
    } catch {
      if (runRef.current === id) fail(file, 'decode');
    } finally {
      window.clearTimeout(timer);
    }
  }

  function fail(file: File, reason: 'decode' | 'encode' | 'unsupported') {
    setErrorName(file.name || t.fileFallback);
    setResult(null);
    setPhase('error');
    // The error text sits in a role="alert" box, which announces it; the status region stays empty.
    setAnnounce('');
    track('tool_error', { tool: TOOL, lang, browser: browserLabel(navigator.userAgent), codec: file.type || 'unknown', reason });
  }

  function accept(file: File | null) {
    if (!file) return;
    fileRef.current = file;
    focusDownload.current = true;
    track('tool_start', { tool: TOOL, lang });
    if (!isSupportedType(file.type)) {
      runRef.current += 1;
      fail(file, 'unsupported');
      return;
    }
    void run(file, level);
  }

  function choose(value: Level) {
    setLevel(value);
    const file = fileRef.current;
    if (file && isSupportedType(file.type) && (phase === 'done' || phase === 'processing')) void run(file, value);
  }

  function startOver() {
    runRef.current += 1;
    fileRef.current = null;
    setResult(null);
    setPhase('idle');
    setAnnounce('');
    window.setTimeout(() => chooseRef.current?.focus(), 0);
  }

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const file = imageFrom(event.clipboardData?.files);
      if (file) {
        event.preventDefault();
        accept(file);
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  });

  const openPicker = () => inputRef.current?.click();
  const onZoneClick = (event: TargetedMouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, a, input')) return;
    openPicker();
  };
  const dragHandlers = {
    onDragEnter: (event: DragEvent) => {
      event.preventDefault();
      if (phase !== 'processing') setPhase('over');
    },
    onDragOver: (event: DragEvent) => event.preventDefault(),
    onDragLeave: (event: DragEvent) => {
      const zone = event.currentTarget as HTMLElement;
      if (!zone.contains(event.relatedTarget as Node | null)) setPhase(result ? 'done' : fileRef.current ? 'error' : 'idle');
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault();
      accept(imageFrom(event.dataTransfer?.files));
    },
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      hidden
      onChange={(event) => {
        const target = event.currentTarget;
        accept(imageFrom(target.files));
        target.value = '';
      }}
    />
  );

  const showProgress = phase === 'processing' && showLevel;
  const showResult = result !== null && (phase === 'done' || (phase === 'processing' && !showLevel));
  const dropState = phase === 'over' ? 'over' : phase === 'error' ? 'error' : undefined;
  const oli = phase === 'over' ? 'gulp' : phase === 'error' ? 'oops' : 'wave';
  const kbd = t.drop.pasteKey;
  const [helpBefore, helpAfter] = t.drop.helpDesktop.split('{kbd}');

  let panel: JSX.Element;
  if (showProgress) {
    panel = (
      <div
        class="fo-level"
        role="progressbar"
        aria-label={t.progress.label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-valuetext={`${progress}%`}
        style={`--level:${progress}%`}
      >
        <div class="fo-water fo-water--moving" />
        <div class="fo-level__oli" data-oli="swim" aria-hidden="true" />
        <div class="fo-level__text">
          <span class="fo-level__pct">{progress}%</span>
          <span class="fo-level__msg">{t.progress.working}</span>
        </div>
      </div>
    );
  } else if (showResult && result) {
    const saved = (1 - result.after / result.before) * 100;
    const smaller = result.outcome === 'smaller';
    panel = (
      <section class="fo-result fo-deep" aria-live="polite">
        <div class="fo-result__head">
          <div class="fo-result__oli" data-oli="cheer" aria-hidden="true" />
          <p class="fo-result__says">
            {says(result.outcome, saved, result.format)}
          </p>
          {smaller && (
            <div class="fo-placard">
              <span class="fo-placard__n">{MINUS + percent(saved, lang)}</span>
              <span class="fo-placard__l">{t.result.placardLabel}</span>
            </div>
          )}
        </div>
        <dl class="fo-result__stats">
          {result.after < result.before && (
            <div class="fo-result__stat fo-result__stat--before">
              <dt>{t.result.before}</dt>
              <dd>{fileSize(result.before, lang)}</dd>
            </div>
          )}
          <div class="fo-result__stat">
            <dt>{t.result.after}</dt>
            <dd>{fileSize(result.after, lang)}</dd>
          </div>
          <div class="fo-result__stat">
            <dt>{t.result.size}</dt>
            <dd>{`${result.width} × ${result.height}`}</dd>
          </div>
        </dl>
        <div class="fo-result__actions">
          <a
            ref={downloadRef}
            class="fo-btn fo-btn--download fo-btn--lg"
            href={result.url}
            download={result.name}
            onClick={() => track('download', { tool: TOOL, lang })}
          >
            {t.result.download} <span class="fo-btn__meta">{`· ${fileSize(result.after, lang)}`}</span>
          </a>
          <button type="button" class="fo-btn fo-btn--ghost" onClick={startOver}>
            {t.result.startOver}
          </button>
        </div>
      </section>
    );
  } else {
    panel = (
      <div class="fo-drop" data-state={dropState} onClick={onZoneClick} {...dragHandlers}>
        <div class="fo-drop__sea">
          <div class="fo-water" />
        </div>
        <div class="fo-drop__oli" data-oli={oli} aria-hidden="true" />
        <div class="fo-drop__badge" aria-hidden="true" />
        {phase === 'over' ? (
          <>
            <p class="fo-drop__title">{t.drop.over}</p>
            <p class="fo-drop__help">{t.drop.overHelp}</p>
          </>
        ) : phase === 'error' ? (
          <>
            <div role="alert" class="fo-drop__message">
              <p class="fo-drop__title">{t.drop.errorTitle}</p>
              <p class="fo-drop__help">{fmt(t.drop.errorHelp, { name: errorName })}</p>
            </div>
            <button ref={chooseRef} type="button" class="fo-btn" onClick={openPicker}>
              {t.drop.chooseAnother}
            </button>
          </>
        ) : (
          <>
            <p class="fo-drop__title fo-desktop-only">{t.drop.title}</p>
            <button
              ref={chooseRef}
              type="button"
              class="fo-btn fo-btn--brand fo-btn--lg fo-btn--block-mobile"
              aria-describedby="ci-help"
              onClick={openPicker}
            >
              {t.drop.choose}
            </button>
            <p class="fo-drop__help" id="ci-help">
              <span class="fo-desktop-only">
                {helpBefore}
                <span class="fo-kbd">{kbd}</span>
                {helpAfter}
              </span>
              <span class="fo-mobile-only">{t.drop.help}</span>
            </p>
          </>
        )}
        {input}
      </div>
    );
  }

  return (
    <div class="fo-tool-island">
      <div class="fo-slot">{panel}</div>
      <p class="fo-sr" role="status">
        {announce}
      </p>
      <fieldset class="fo-field fo-options">
        <legend class="fo-field__label">{t.options.legend}</legend>
        <div class="fo-seg">
          {(['recommended', 'strong'] as const).map((value) => (
            <label class="fo-seg__opt" key={value}>
              <input
                type="radio"
                name="ci-level"
                value={value}
                checked={level === value}
                onChange={() => choose(value)}
              />
              {t.options[value]}
              <small>{value === 'recommended' ? t.options.recommendedHelp : t.options.strongHelp}</small>
            </label>
          ))}
        </div>
        <p class="fo-field__help">{t.options.pngNote}</p>
      </fieldset>
      {phase === 'done' && (
        <nav class="fo-next" aria-labelledby="ci-next">
          <span class="fo-next__label" id="ci-next">
            {t.next.label}
          </span>
          <a
            class="fo-chip fo-cat--image"
            href={moreToolsHref}
            onClick={() => track('next_step_click', { tool: TOOL, lang, target: 'home' })}
          >
            <span class="fo-chip__dot" aria-hidden="true" />
            {t.next.moreTools}
          </a>
        </nav>
      )}
    </div>
  );
}
