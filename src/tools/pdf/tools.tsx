// The behaviour of the 12 PDF tools (F5a, decision 1): each one's options, the request it sends the engine for a
// file, and its option fields. The panel (PdfPanel.tsx) does the rest: the drop, the queue, the run, the result.
// Ranges typed by the person are parsed here (ranges.ts), so the engine only gets page numbers.
import { useEffect, useState } from 'preact/hooks';
import { fmt } from '../../i18n/format.ts';
import NumberField from '../image/NumberField.tsx';
import FieldError from './FieldError.tsx';
import Icon from '../../icons/Icon.tsx';
import OptionGroup, { type OptionGroupProps } from '../image/OptionGroup.tsx';
import PageGrid from './PageGrid.tsx';
import { countOf, setOf } from './grid-math.ts';
import PasswordField from './PasswordField.tsx';
import SignatureArea, { fitBox, type SignatureBox, type SignatureImage } from './SignatureArea.tsx';
import TextField from './TextField.tsx';
import { pagesOf, parseRanges } from './ranges.ts';
import type { CompressMode, NumberFormat, Position } from '../../engine/pdf/types.ts';
import type {
  CompressPdfTexts,
  DeleteTexts,
  ImagesTexts,
  MergeTexts,
  NumbersTexts,
  PasswordToolTexts,
  ReorderTexts,
  RotatePdfTexts,
  SignTexts,
  SplitTexts,
  UnlockTexts,
  WatermarkTexts,
} from './option-texts.ts';
import type { PdfToolId } from './registry.ts';
import type { PdfOptionsProps, PdfToolDef } from './types.ts';

const pageCount = (props: { file: { info: { pages: number } | null } | null }): number => props.file?.info?.pages ?? 0;

/**
 * The "pick pages by number" field above a grid: it sets the grid's selection and says the count once, in Delete's
 * form where a picked page comes out (F14, d-2; DECISOES § 629). The grid keeps no anchor after it (§ 628).
 */
function RangePicker({ id, total, onPick, panel, announce, removes = false }: { id: string; total: number; onPick: (pages: number[]) => void; panel: PdfOptionsProps<unknown, unknown>['panel']; announce: (message: string) => void; removes?: boolean }) {
  const [text, setText] = useState('');
  const [wrong, setWrong] = useState(false);
  const apply = (value: string) => {
    const ranges = parseRanges(value, total);
    setWrong(ranges === null);
    if (!ranges) return;
    const pages = pagesOf(ranges);
    onPick(pages);
    announce(countOf(panel.grid, pages.length, total, removes));
  };
  return (
    <TextField
      id={id}
      label={panel.grid.rangeLabel}
      value={text}
      onCommit={setText}
      help={panel.grid.rangeHelp}
      error={wrong ? fmt(panel.grid.rangeError, { total }) : null}
      inputmode="text"
      action={{ label: panel.grid.rangeApply, onClick: apply }}
    />
  );
}

// ---- Merge ----------------------------------------------------------------------------------------------------

const merge: PdfToolDef<Record<string, never>, MergeTexts> = {
  initial: {},
  success: 'merged',
  warm: [],
  operation: (_state, _file, files) => (files.filter((file) => file.info?.lock === 'none').length >= 2 ? { kind: 'merge' } : null),
};

// ---- Split ----------------------------------------------------------------------------------------------------

interface SplitState {
  mode: 'each' | 'ranges' | 'pick';
  ranges: string;
  picked: number[];
}

function SplitOptions(props: PdfOptionsProps<SplitState, SplitTexts>) {
  const { state, update, texts, panel, file } = props;
  const total = pageCount(props);
  const rangeWrong = state.mode === 'ranges' && (state.ranges.trim() !== '' || props.showErrors) && parseRanges(state.ranges, total) === null;
  return (
    <div class="fo-options-stack">
      <OptionGroup
        name="fo-split-mode"
        legend={texts.legend}
        value={state.mode}
        choices={[
          { value: 'each', label: texts.each },
          { value: 'ranges', label: texts.ranges },
          { value: 'pick', label: texts.pick },
        ]}
        onChange={(mode) => update({ mode })}
      />
      {state.mode === 'ranges' && (
        <TextField id="fo-split-ranges" label={texts.rangesLabel} value={state.ranges} onCommit={(ranges) => update({ ranges })} help={texts.rangesHelp} error={rangeWrong ? texts.rangesError : null} />
      )}
      {state.mode === 'pick' && file?.info && (
        <>
          <RangePicker id="fo-split-pick" total={total} panel={panel} announce={props.announce} onPick={(picked) => update({ picked })} />
          <PageGrid
            id="fo-split-grid"
            view={{ texts: panel.view, action: 'mark' }}
            name={file.name}
            boxes={file.info.boxes}
            mode="select"
            texts={panel.grid}
            icons={props.icons}
            thumbnails={props.thumbnails}
            announce={props.announce}
            selected={setOf(state.picked)}
            onSelect={(picked) => update({ picked })}
          />
          {props.showErrors && state.picked.length === 0 && <FieldError>{texts.pickNone}</FieldError>}
        </>
      )}
    </div>
  );
}

const split: PdfToolDef<SplitState, SplitTexts> = {
  initial: { mode: 'each', ranges: '', picked: [] },
  success: 'split',
  warm: [],
  grid: (state) => state.mode === 'pick',
  operation: (state, file) => {
    const total = file.info?.pages ?? 0;
    if (state.mode === 'each') return { kind: 'split', parts: Array.from({ length: total }, (_, i) => [i]) };
    if (state.mode === 'ranges') {
      const ranges = parseRanges(state.ranges, total);
      return ranges ? { kind: 'split', parts: ranges } : null;
    }
    return state.picked.length > 0 ? { kind: 'split', parts: [[...state.picked].sort((a, b) => a - b)] } : null;
  },
  Options: SplitOptions,
};

// ---- PDF to JPG -----------------------------------------------------------------------------------------------

interface ImagesState {
  format: 'jpeg' | 'png';
  ppi: 72 | 150 | 300;
  pages: 'all' | 'range';
  range: string;
}

/** The pages of a typed range that a file has (the range is one for the whole batch). */
function rangeFor(text: string, total: number): number[] | null {
  const ranges = parseRanges(text, Number.MAX_SAFE_INTEGER);
  if (!ranges) return null;
  const pages = pagesOf(ranges).filter((page) => page < total);
  return pages.length > 0 ? pages : null;
}

/**
 * The most pages a file of the batch has: a range that names a page past it names a page no file has, and the field
 * says so (DECISOES § 178). With no file yet, any range is taken.
 */
const mostPages = (files: readonly { info: { pages: number } | null }[]): number => (files.length > 0 ? Math.max(...files.map((file) => file.info?.pages ?? 0)) : Number.MAX_SAFE_INTEGER);

function ImagesOptions(props: PdfOptionsProps<ImagesState, ImagesTexts>) {
  const { state, update, texts } = props;
  const wrong = state.pages === 'range' && state.range.trim() !== '' && parseRanges(state.range, mostPages(props.files)) === null;
  return (
    <div class="fo-options-stack">
      <OptionGroup name="fo-images-format" legend={texts.formatLegend} value={state.format} note={texts.formatHelp} noteId="fo-images-format-note" choices={[{ value: 'jpeg', label: texts.jpg }, { value: 'png', label: texts.png }]} onChange={(format) => update({ format })} />
      <OptionGroup
        name="fo-images-ppi"
        legend={texts.resolutionLegend}
        value={String(state.ppi) as '72' | '150' | '300'}
        choices={[
          { value: '72', label: texts.low, help: texts.lowHelp },
          { value: '150', label: texts.medium, help: texts.mediumHelp },
          { value: '300', label: texts.high, help: texts.highHelp },
        ]}
        onChange={(ppi) => update({ ppi: Number(ppi) as 72 | 150 | 300 })}
      />
      <OptionGroup name="fo-images-pages" legend={texts.pagesLegend} value={state.pages} choices={[{ value: 'all', label: texts.all }, { value: 'range', label: texts.range }]} onChange={(pages) => update({ pages })} />
      {state.pages === 'range' && <TextField id="fo-images-range" label={texts.rangeLabel} value={state.range} onCommit={(range) => update({ range })} help={texts.rangeHelp} error={wrong ? texts.rangeError : null} />}
    </div>
  );
}

const images: PdfToolDef<ImagesState, ImagesTexts> = {
  initial: { format: 'jpeg', ppi: 150, pages: 'all', range: '' },
  success: 'converted',
  warm: ['pdfjs'],
  operation: (state, file, files) => {
    if (state.pages === 'all') return { kind: 'images', format: state.format, ppi: state.ppi, pages: null };
    // A page no file has: the field's error, for every file. A file without any page of the range: its row says so.
    if (parseRanges(state.range, mostPages(files)) === null) return null;
    const pages = rangeFor(state.range, file.info?.pages ?? 0);
    return pages ? { kind: 'images', format: state.format, ppi: state.ppi, pages } : null;
  },
  summary: (state, texts) => `${state.format === 'png' ? texts.png : texts.jpg} · ${state.ppi === 72 ? texts.low : state.ppi === 300 ? texts.high : texts.medium}`,
  Options: ImagesOptions,
};

// ---- Compress -------------------------------------------------------------------------------------------------

interface CompressState {
  mode: CompressMode;
}

/**
 * The OptionGroup with its note in the note of the design system (F13a, F-10): brand-soft with the info icon, the line the
 * fieldset points at with aria-describedby. The OptionGroup of the image tools has no such note (src/tools/image is not
 * this island's; DECISOES § 485), so the PDF island draws the same rail with it.
 */
function NotedOptionGroup<V extends string>({ name, legend, value, choices, onChange, note, noteId, noteIcon }: OptionGroupProps<V> & { note: string; noteId: string; noteIcon: string }) {
  return (
    <fieldset class="fo-field fo-options" aria-describedby={noteId}>
      <legend class="fo-field__label">{legend}</legend>
      <div class="fo-seg">
        {choices.map((choice) => (
          <label class="fo-seg__opt" key={choice.value}>
            <input type="radio" name={name} value={choice.value} checked={value === choice.value} onChange={() => onChange(choice.value)} />
            {choice.label}
            {choice.help && <small>{choice.help}</small>}
          </label>
        ))}
      </div>
      <p class="fo-note" id={noteId}>
        <Icon inner={noteIcon} />
        <span>{note}</span>
      </p>
    </fieldset>
  );
}

function CompressOptions({ state, update, texts, icons }: PdfOptionsProps<CompressState, CompressPdfTexts>) {
  return (
    <NotedOptionGroup
      name="fo-compress-mode"
      legend={texts.legend}
      value={state.mode}
      note={texts.strongWarning}
      noteId="fo-compress-warning"
      noteIcon={icons.info}
      choices={[
        { value: 'lossless', label: texts.lossless, help: texts.losslessHelp },
        { value: 'recommended', label: texts.recommended, help: texts.recommendedHelp },
        { value: 'strong', label: texts.strong, help: texts.strongHelp },
      ]}
      onChange={(mode) => update({ mode })}
    />
  );
}

const compress: PdfToolDef<CompressState, CompressPdfTexts> = {
  initial: { mode: 'recommended' },
  success: 'smaller',
  warm: ['qpdf'],
  operation: (state) => ({ kind: 'compress', mode: state.mode }),
  summary: (state, texts) => texts[state.mode],
  Options: CompressOptions,
};

// ---- Rotate ---------------------------------------------------------------------------------------------------

interface RotateState {
  turn: 1 | 2 | 3;
  scope: 'all' | 'pick';
  turns: Record<number, number>;
}

function RotateOptions(props: PdfOptionsProps<RotateState, RotatePdfTexts>) {
  const { state, update, texts, panel, file, files } = props;
  const single = files.length === 1;
  return (
    <div class="fo-options-stack">
      <OptionGroup
        name="fo-rotate-scope"
        legend={texts.scopeLegend}
        value={single ? state.scope : 'all'}
        {...(single ? { note: texts.pickHelp } : files.length > 1 ? { note: texts.batchNote } : {})}
        noteId="fo-rotate-scope-note"
        choices={[
          { value: 'all', label: texts.all },
          { value: 'pick', label: texts.pick },
        ]}
        onChange={(scope) => update({ scope })}
      />
      {(!single || state.scope === 'all') && (
        <OptionGroup
          name="fo-rotate-turn"
          legend={texts.turnLegend}
          value={String(state.turn) as '1' | '2' | '3'}
          choices={[
            { value: '1', label: texts.right },
            { value: '2', label: texts.half },
            { value: '3', label: texts.left },
          ]}
          onChange={(turn) => update({ turn: Number(turn) as 1 | 2 | 3 })}
        />
      )}
      {single && state.scope === 'pick' && file?.info && (
        <PageGrid
          id="fo-rotate-grid"
          view={{ texts: panel.view, action: 'turn' }}
          name={file.name}
          boxes={file.info.boxes}
          mode="rotate"
          texts={panel.grid}
          icons={props.icons}
          thumbnails={props.thumbnails}
          announce={props.announce}
          turns={state.turns}
          onTurn={(index) => update({ turns: { ...state.turns, [index]: ((state.turns[index] ?? 0) + 1) % 4 } })}
        />
      )}
    </div>
  );
}

const rotate: PdfToolDef<RotateState, RotatePdfTexts> = {
  initial: { turn: 1, scope: 'all', turns: {} },
  success: 'rotated',
  warm: [],
  grid: (state) => state.scope === 'pick',
  // The turns are of the pages of one file: a new file starts with none, and with every page turned (DECISOES § 178).
  perFile: ['turns', 'scope'],
  operation: (state, _file, files) => {
    if (files.length > 1 || state.scope === 'all') return { kind: 'rotate', all: state.turn, pages: {} };
    return Object.values(state.turns).some((turn) => turn % 4 !== 0) ? { kind: 'rotate', all: 0, pages: state.turns } : null;
  },
  summary: (state, texts) => (state.scope === 'pick' ? texts.pick : state.turn === 2 ? texts.half : state.turn === 3 ? texts.left : texts.right),
  Options: RotateOptions,
};

// ---- Delete ---------------------------------------------------------------------------------------------------

interface PickState {
  picked: number[];
}

function DeleteOptions(props: PdfOptionsProps<PickState, DeleteTexts>) {
  const { state, update, texts, panel, file } = props;
  const total = pageCount(props);
  if (!file?.info) return <p class="fo-field__help">{texts.help}</p>;
  return (
    <div class="fo-options-stack">
      <p class="fo-field__help">{texts.help}</p>
      <RangePicker id="fo-delete-pick" total={total} panel={panel} announce={props.announce} removes onPick={(picked) => update({ picked })} />
      <PageGrid
        id="fo-delete-grid"
        view={{ texts: panel.view, action: 'remove' }}
        name={file.name}
        boxes={file.info.boxes}
        mode="select"
        texts={panel.grid}
        icons={props.icons}
        thumbnails={props.thumbnails}
        announce={props.announce}
        selected={setOf(state.picked)}
        onSelect={(picked) => update({ picked })}
        removes
      />
      {state.picked.length >= total && total > 0 && <FieldError>{texts.allPicked}</FieldError>}
      {props.showErrors && state.picked.length === 0 && <FieldError>{texts.nonePicked}</FieldError>}
    </div>
  );
}

const remove: PdfToolDef<PickState, DeleteTexts> = {
  initial: { picked: [] },
  success: 'deleted',
  warm: [],
  grid: () => true,
  operation: (state, file) => {
    const total = file.info?.pages ?? 0;
    return state.picked.length > 0 && state.picked.length < total ? { kind: 'delete', remove: [...state.picked].sort((a, b) => a - b) } : null;
  },
  actionLabel: (state, texts, _file, fallback) => (state.picked.length === 0 ? fallback : state.picked.length === 1 ? texts.actionOne : fmt(texts.actionCount, { count: state.picked.length })),
  Options: DeleteOptions,
};

// ---- Page numbers ---------------------------------------------------------------------------------------------

interface NumbersState {
  position: Position;
  format: NumberFormat;
  start: number;
  skipFirst: boolean;
  /** The words of the page's language, set by `start`. */
  page?: string;
  of?: string;
}

const POSITION_KEY: Record<Position, 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight'> = {
  'top-left': 'topLeft',
  'top-center': 'topCenter',
  'top-right': 'topRight',
  'bottom-left': 'bottomLeft',
  'bottom-center': 'bottomCenter',
  'bottom-right': 'bottomRight',
};

function NumbersOptions({ state, update, texts }: PdfOptionsProps<NumbersState, NumbersTexts>) {
  const positions: { value: Position; label: string }[] = [
    { value: 'top-left', label: texts.topLeft },
    { value: 'top-center', label: texts.topCenter },
    { value: 'top-right', label: texts.topRight },
    { value: 'bottom-left', label: texts.bottomLeft },
    { value: 'bottom-center', label: texts.bottomCenter },
    { value: 'bottom-right', label: texts.bottomRight },
  ];
  return (
    <div class="fo-options-stack">
      <fieldset class="fo-field fo-options">
        <legend class="fo-field__label">{texts.positionLegend}</legend>
        <div class="fo-seg fo-seg--grid">
          {positions.map((choice) => (
            <label class="fo-seg__opt" key={choice.value}>
              <input type="radio" name="fo-numbers-position" value={choice.value} checked={state.position === choice.value} onChange={() => update({ position: choice.value })} />
              {choice.label}
            </label>
          ))}
        </div>
      </fieldset>
      <OptionGroup
        name="fo-numbers-format"
        legend={texts.formatLegend}
        value={state.format}
        choices={[
          { value: 'n', label: texts.n },
          { value: 'page-n', label: texts.pageN },
          { value: 'page-n-of-total', label: texts.pageNofTotal },
          { value: 'n-of-total', label: texts.nOfTotal },
        ]}
        onChange={(format) => update({ format })}
      />
      <div class="fo-fields">
        <NumberField id="fo-numbers-start" label={texts.startLabel} value={state.start} min={1} max={9999} error={texts.startError} onCommit={(start) => update({ start })} />
        {/* F13a (F-11): a choice of two in the rail of the site, not the native check box; the state and the engine do not change. */}
        <OptionGroup
          name="fo-numbers-first"
          legend={texts.firstLegend}
          value={state.skipFirst ? 'skip' : 'number'}
          choices={[
            { value: 'number', label: texts.numberIt },
            { value: 'skip', label: texts.skipIt },
          ]}
          onChange={(first) => update({ skipFirst: first === 'skip' })}
        />
      </div>
    </div>
  );
}

const numbers: PdfToolDef<NumbersState, NumbersTexts> = {
  initial: { position: 'bottom-center', format: 'n', start: 1, skipFirst: false },
  success: 'numbered',
  warm: [],
  // The words of the numbers come from the page (F6, decision 4); the English ones give the bytes of before.
  start: (texts) => ({ page: texts.pageWord, of: texts.ofWord }),
  operation: (state) => ({ kind: 'numbers', ...state }),
  summary: (state, texts) => texts[POSITION_KEY[state.position]],
  Options: NumbersOptions,
};

// ---- Sign -----------------------------------------------------------------------------------------------------

interface SignState {
  image: SignatureImage | null;
  box: SignatureBox;
  scope: 'this' | 'all' | 'pick';
  page: number;
  picked: number[];
}

function SignOptions(props: PdfOptionsProps<SignState, SignTexts>) {
  const { state, update, texts, panel, file, thumbnails } = props;
  const [pageUrl, setPageUrl] = useState<string | null>(null);
  // F13a (F-5): the preview is drawn at the width of its frame times the pixel ratio (up to 1080 px), rounded up to 60 px
  // so a frame that changes by a pixel does not draw it again; the grid keeps its 240 px pictures.
  const [frameWidth, setFrameWidth] = useState(0);
  const previewWidth = frameWidth > 0 ? Math.min(1080, Math.ceil((frameWidth * (window.devicePixelRatio || 1)) / 60) * 60) : 0;
  const total = pageCount(props);
  const box = file?.info?.boxes[state.page];
  const ratio = box ? ((box.rotate === 90 || box.rotate === 270 ? box.height / box.width : box.width / box.height)) : 0.77;
  // The file view is made again on every render of the panel: the preview follows the file and its reading, not the view
  // object, or every move of the box would let the picture go and draw it again (DECISOES § 183).
  useEffect(() => {
    if (!thumbnails || !file?.info || previewWidth === 0) return undefined;
    let alive = true;
    const shown = state.page;
    const width = previewWidth;
    void thumbnails.get(shown, width).then((url) => {
      if (alive) setPageUrl(url);
    });
    // The preview holds its page's picture like a grid cell does, so a cell of the same page leaving the screen no
    // longer lets it go under the preview (DECISOES § 180); the picture of the preview is its own, let go with its page.
    return () => {
      alive = false;
      thumbnails.drop(shown, width);
    };
  }, [thumbnails, file?.id, Boolean(file?.info), state.page, previewWidth]);
  const ink = props.ink;
  return (
    <div class="fo-options-stack">
      <SignatureArea id="fo-sign" texts={texts} ink={ink} noteIcon={props.icons.info} onFrameWidth={setFrameWidth} image={state.image} onImage={(image) => update({ image })} box={state.box} onBox={(next) => update({ box: next })} pageUrl={pageUrl} pageRatio={ratio} showErrors={props.showErrors} />
      {file?.info && (
        <>
          <OptionGroup
            name="fo-sign-scope"
            legend={texts.pagesLegend}
            value={state.scope}
            choices={[
              { value: 'this', label: texts.thisPage },
              { value: 'all', label: texts.allPages },
              { value: 'pick', label: texts.pickPages },
            ]}
            onChange={(scope) => update({ scope })}
          />
          <NumberField id="fo-sign-page" label={fmt(texts.previewPage, { n: state.page + 1, total })} value={state.page + 1} min={1} max={Math.max(1, total)} error={fmt(panel.grid.rangeError, { total })} onCommit={(page) => update({ page: page - 1 })} />
          {state.scope === 'pick' && (
            <PageGrid
              id="fo-sign-grid"
              view={{ texts: panel.view, action: 'sign' }}
              name={file.name}
              boxes={file.info.boxes}
              mode="select"
              texts={panel.grid}
              icons={props.icons}
              thumbnails={thumbnails}
              announce={props.announce}
              selected={setOf(state.picked)}
              onSelect={(picked) => update({ picked })}
            />
          )}
        </>
      )}
    </div>
  );
}

const sign: PdfToolDef<SignState, SignTexts> = {
  initial: { image: null, box: { x: 0.55, y: 0.8, width: 0.3 }, scope: 'this', page: 0, picked: [] },
  success: 'signed',
  warm: ['pdfjs'],
  grid: () => true,
  operation: (state, file) => {
    if (!state.image) return null;
    const total = file.info?.pages ?? 0;
    const pages = state.scope === 'all' ? Array.from({ length: total }, (_, i) => i) : state.scope === 'pick' ? state.picked : [state.page];
    if (pages.length === 0) return null;
    const box = file.info?.boxes[state.page];
    const pageRatio = box ? (box.rotate === 90 || box.rotate === 270 ? box.height / box.width : box.width / box.height) : 0.77;
    return { kind: 'sign', image: state.image.png, pages, box: fitBox(state.box, state.image.ratio, pageRatio) };
  },
  Options: SignOptions,
};

// ---- Protect --------------------------------------------------------------------------------------------------

interface ProtectState {
  password: string;
  confirm: string;
}

export const PASSWORD_MIN = 4;
export const PASSWORD_MAX = 100;
const validPassword = (value: string) => value.length >= PASSWORD_MIN && value.length <= PASSWORD_MAX;

function ProtectOptions({ state, update, texts, panel, showErrors }: PdfOptionsProps<ProtectState, PasswordToolTexts>) {
  const ruleBroken = (showErrors || state.password.length > 0) && !validPassword(state.password);
  const mismatch = (showErrors || state.confirm.length >= state.password.length) && state.confirm.length > 0 && state.confirm !== state.password;
  return (
    <div class="fo-fields fo-fields--stack">
      <PasswordField id="fo-protect-password" label={texts.passwordLabel} value={state.password} onInput={(password) => update({ password })} autocomplete="new-password" help={texts.rule} error={ruleBroken && showErrors ? texts.rule : null} show={panel.password.show} showName={panel.password.showPassword} />
      <PasswordField
        id="fo-protect-confirm"
        label={texts.confirmLabel}
        value={state.confirm}
        onInput={(confirm) => update({ confirm })}
        autocomplete="new-password"
        error={mismatch || (showErrors && state.confirm !== state.password) ? texts.mismatch : null}
        show={panel.password.show}
        showName={panel.password.showConfirm}
      />
    </div>
  );
}

const protect: PdfToolDef<ProtectState, PasswordToolTexts> = {
  initial: { password: '', confirm: '' },
  success: 'protected',
  warm: ['qpdf'],
  operation: (state) => (validPassword(state.password) && state.confirm === state.password ? { kind: 'protect', password: state.password } : null),
  Options: ProtectOptions,
};

// ---- Unlock ---------------------------------------------------------------------------------------------------

interface UnlockState {
  draft: string;
  /** The password the person sent with the button (null until then). */
  password: string | null;
}

function UnlockOptions({ state, update, texts, panel, file, failure, showErrors }: PdfOptionsProps<UnlockState, UnlockTexts>) {
  if (file?.info?.lock !== 'password') return null;
  const submit = () => update({ password: state.draft });
  const wrong = failure === 'wrong-password' && state.password === state.draft;
  return (
    <div class="fo-fields fo-fields--stack">
      <p class="fo-field__help">{texts.ask}</p>
      <PasswordField
        id="fo-unlock-password"
        label={texts.passwordLabel}
        value={state.draft}
        onInput={(draft) => update({ draft })}
        autocomplete="current-password"
        help={texts.rule}
        error={wrong ? fmt(panel.errors.wrongPassword, { name: file.name }) : showErrors && state.draft.length === 0 ? texts.rule : null}
        show={panel.password.show}
        showName={panel.password.showPassword}
        onEnter={submit}
      />
      <button type="button" class="fo-btn fo-btn--brand" onClick={submit}>
        {texts.submit}
      </button>
    </div>
  );
}

const unlock: PdfToolDef<UnlockState, UnlockTexts> = {
  initial: { draft: '', password: null },
  success: 'unlocked',
  warm: ['qpdf'],
  operation: (state, file) => {
    if (file.info?.lock === 'password') return state.password ? { kind: 'unlock', password: state.password } : null;
    return { kind: 'unlock', password: null };
  },
  Options: UnlockOptions,
};

// ---- Reorder --------------------------------------------------------------------------------------------------

interface ReorderState {
  order: number[] | null;
}

function ReorderOptions(props: PdfOptionsProps<ReorderState, ReorderTexts>) {
  const { state, update, texts, panel, file } = props;
  if (!file?.info) return <p class="fo-field__help">{texts.help}</p>;
  const total = file.info.pages;
  const order = state.order ?? Array.from({ length: total }, (_, i) => i);
  return (
    <div class="fo-options-stack">
      <div class="fo-pages__bar">
        <p class="fo-field__help">{texts.help}</p>
        <button
          type="button"
          class="fo-btn"
          onClick={() => {
            update({ order: [...order].reverse() });
            // F13a (D-10): what happened, not the name of the button.
            props.announce(texts.reversed);
          }}
        >
          {texts.reverse}
        </button>
      </div>
      <PageGrid
        id="fo-reorder-grid"
        view={{ texts: panel.view }}
        name={file.name}
        boxes={file.info.boxes}
        mode="order"
        texts={panel.grid}
        icons={props.icons}
        thumbnails={props.thumbnails}
        announce={props.announce}
        order={order}
        onMove={(from, to) => {
          const next = [...order];
          const [moved] = next.splice(from, 1);
          if (moved !== undefined) next.splice(to, 0, moved);
          update({ order: next });
        }}
      />
      {props.showErrors && (!state.order || state.order.every((page, i) => page === i)) && <FieldError>{texts.unchanged}</FieldError>}
    </div>
  );
}

const reorder: PdfToolDef<ReorderState, ReorderTexts> = {
  initial: { order: null },
  success: 'reordered',
  warm: [],
  grid: () => true,
  operation: (state) => (state.order && state.order.some((page, i) => page !== i) ? { kind: 'reorder', order: state.order } : null),
  Options: ReorderOptions,
};

// ---- Watermark ------------------------------------------------------------------------------------------------

interface WatermarkState {
  text: string | null;
  size: 'small' | 'medium' | 'large';
  opacity: 'light' | 'medium' | 'strong';
  direction: 'diagonal' | 'horizontal';
}

/** What the standard font can draw of the text: the same rule as the engine's winAnsi(). */
const drawable = (text: string) => text.replace(/[^\x20-\x7e¡-ÿ]/g, '').trim();

function WatermarkOptions({ state, update, texts, showErrors }: PdfOptionsProps<WatermarkState, WatermarkTexts>) {
  const text = state.text ?? texts.defaultText;
  return (
    <div class="fo-options-stack">
      <TextField id="fo-watermark-text" label={texts.textLabel} value={text} onCommit={(value) => update({ text: value })} help={texts.textHelp} error={(showErrors || text.length > 0) && drawable(text) === '' ? texts.textError : null} maxLength={80} />
      <OptionGroup name="fo-watermark-size" legend={texts.sizeLegend} value={state.size} choices={[{ value: 'small', label: texts.small }, { value: 'medium', label: texts.medium }, { value: 'large', label: texts.large }]} onChange={(size) => update({ size })} />
      <OptionGroup name="fo-watermark-opacity" legend={texts.opacityLegend} value={state.opacity} choices={[{ value: 'light', label: texts.light }, { value: 'medium', label: texts.mediumOpacity }, { value: 'strong', label: texts.strong }]} onChange={(opacity) => update({ opacity })} />
      <OptionGroup name="fo-watermark-direction" legend={texts.directionLegend} value={state.direction} choices={[{ value: 'diagonal', label: texts.diagonal }, { value: 'horizontal', label: texts.horizontal }]} onChange={(direction) => update({ direction })} />
    </div>
  );
}

const watermark: PdfToolDef<WatermarkState, WatermarkTexts> = {
  initial: { text: null, size: 'medium', opacity: 'medium', direction: 'diagonal' },
  start: (texts) => ({ text: texts.defaultText }),
  success: 'watermarked',
  warm: [],
  operation: (state) => {
    // The default text is the page's own (texts.defaultText), filled in by the panel before the first run.
    const text = drawable(state.text ?? '');
    return text ? { kind: 'watermark', text, size: state.size, opacity: state.opacity, direction: state.direction } : null;
  },
  Options: WatermarkOptions,
};

export const PDF_TOOLS = {
  'merge-pdf': merge,
  'split-pdf': split,
  'pdf-to-jpg': images,
  'compress-pdf': compress,
  'rotate-pdf': rotate,
  'delete-pdf-pages': remove,
  'add-page-numbers-to-pdf': numbers,
  'sign-pdf': sign,
  'protect-pdf': protect,
  'unlock-pdf': unlock,
  'reorder-pdf-pages': reorder,
  'watermark-pdf': watermark,
} as unknown as Record<PdfToolId, PdfToolDef<object, object>>;

