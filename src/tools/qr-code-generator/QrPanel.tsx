// The QR code generator's island (prompt F7, decision 8): a text box, the two options, the preview that follows the typing,
// and the two downloads. Everything happens on the page: the code is drawn from the text in memory, the PNG on a canvas of
// the page (no worker: the WebKit of Windows has no OffscreenCanvas in one) and the SVG as a string. The text never leaves
// the component's state: not the URL, not an event, not a storage, not the file name; and the page never fetches it.
import { useMemo, useState } from 'preact/hooks';
import type { TargetedEvent } from 'preact';
import Icon from '../../icons/Icon.tsx';
import Oli from '../image/Oli.tsx';
import OptionGroup from '../image/OptionGroup.tsx';
import { track } from '../../analytics/events.ts';
import { fmt, groupDigits } from '../../i18n/format.ts';
import alertIcon from '../../../docs/design/assets/Icons/alert.svg?raw';
import downloadIcon from '../../../docs/design/assets/Icons/download.svg?raw';
import { DARK, LIGHT, MAX_BYTES, PNG_SIZES, PNG_TARGETS, encode, iconSvg, pngIconBox, pngScale, pngSide, qrSvg, runs, type PngSize, type QrMatrix } from './qr.ts';
import type { QrPanelData } from './types.ts';

const TOOL = 'qr-code-generator';
/** Fixed names in the language of the page, never the text (decision 8): qr-code.png in English. */
export const fileNames = (t: QrPanelData['t']): { png: string; svg: string } => ({ png: `${t.file}.png`, svg: `${t.file}.svg` });

/** Hands a file to the browser's download from the page itself (the model is save() of src/tools/calc/exports.ts). */
function save(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/**
 * The PNG on a canvas of the page: the white ground painted first (a transparent pixel reads as black to a decoder), the
 * dark runs at a whole number of pixels per module, and the icon from its SVG, decoded before it is drawn.
 */
async function drawPng(matrix: QrMatrix, oli: boolean, size: PngSize): Promise<Blob> {
  const scale = pngScale(matrix.size, size);
  const canvas = document.createElement('canvas');
  const side = pngSide(matrix.size, size);
  canvas.width = side;
  canvas.height = side;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('no 2d context');
  context.fillStyle = LIGHT;
  context.fillRect(0, 0, side, side);
  context.fillStyle = DARK;
  for (const [x, y, length] of runs(matrix, oli)) context.fillRect(x * scale, y * scale, length * scale, scale);
  if (oli) {
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSvg())}`;
    await image.decode();
    const box = pngIconBox(matrix.size, scale);
    context.drawImage(image, box.x, box.x, box.side, box.side);
  }
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('no PNG'))), 'image/png'));
}

export default function QrPanel({ lang, t }: QrPanelData) {
  const [text, setText] = useState('');
  /** Set by the first input: an empty box is an error only after the person has typed in it. */
  const [touched, setTouched] = useState(false);
  const [oli, setOli] = useState(true);
  const [size, setSize] = useState<PngSize>('small');
  const [busy, setBusy] = useState(false);
  const [pngFailed, setPngFailed] = useState(false);

  const encoded = useMemo(() => encode(text), [text]);
  const matrix = encoded.ok ? encoded.matrix : null;
  const svg = useMemo(() => (matrix ? qrSvg(matrix, oli) : null), [matrix, oli]);
  const problem = encoded.ok ? null : encoded.problem === 'long' || touched ? encoded.problem : null;
  const max = groupDigits(MAX_BYTES, lang);
  const sideOf = (choice: PngSize): number => (matrix ? pngSide(matrix.size, choice) : PNG_TARGETS[choice]);
  const pxOf = (choice: PngSize): string => fmt(t.size.px, { side: groupDigits(sideOf(choice), lang) });

  function onInput(event: TargetedEvent<HTMLTextAreaElement>): void {
    setText(event.currentTarget.value);
    setTouched(true);
    setPngFailed(false);
  }

  async function downloadPng(): Promise<void> {
    if (!matrix || busy) return;
    track('export_click', { tool: TOOL, lang, format: 'png' });
    setBusy(true);
    setPngFailed(false);
    try {
      save(await drawPng(matrix, oli, size), fileNames(t).png);
    } catch {
      setPngFailed(true);
    } finally {
      setBusy(false);
    }
  }

  function downloadSvg(): void {
    if (!svg) return;
    track('export_click', { tool: TOOL, lang, format: 'svg' });
    save(new Blob([svg], { type: 'image/svg+xml' }), fileNames(t).svg);
  }

  const describedBy = ['fo-qr-help', 'fo-qr-count', ...(problem ? ['fo-qr-error'] : [])].join(' ');
  return (
    <div class="fo-qr">
      <Oli pose={problem || pngFailed ? 'oops' : 'wave'} class="fo-qr__oli" />
      <div class="fo-qr__form">
        <div class="fo-field" data-state={problem ? 'error' : undefined}>
          <div class="fo-field__label">
            <label for="fo-qr-text">{t.field.label}</label>
            <span class="fo-qr__count" id="fo-qr-count">
              {fmt(t.field.count, { count: groupDigits(encoded.bytes, lang), max })}
            </span>
          </div>
          <div class="fo-input fo-input--area">
            <textarea
              id="fo-qr-text"
              rows={4}
              value={text}
              placeholder={t.field.placeholder}
              autocomplete="off"
              autocapitalize="off"
              spellcheck={false}
              aria-invalid={problem ? 'true' : undefined}
              aria-describedby={describedBy}
              onInput={onInput}
            />
          </div>
          <p class="fo-field__help" id="fo-qr-help">
            {fmt(t.field.help, { max })}
          </p>
          {problem && (
            <p class="fo-field__error" id="fo-qr-error" role="alert">
              <Icon raw={alertIcon} />
              {fmt(problem === 'long' ? t.errors.long : t.errors.empty, { max })}
            </p>
          )}
        </div>
        <OptionGroup
          name="fo-qr-oli"
          legend={t.oli.legend}
          value={oli ? 'on' : 'off'}
          choices={[
            { value: 'on', label: t.oli.on },
            { value: 'off', label: t.oli.off },
          ]}
          onChange={(value) => setOli(value === 'on')}
        />
        <OptionGroup
          name="fo-qr-size"
          legend={t.size.legend}
          value={size}
          choices={PNG_SIZES.map((choice) => ({ value: choice, label: t.size[choice], help: pxOf(choice) }))}
          onChange={setSize}
          note={t.size.note}
          noteId="fo-qr-size-note"
        />
      </div>
      <div class="fo-qr__out">
        <div class="fo-qr__preview" data-state={svg ? 'ready' : 'empty'}>
          {svg ? (
            <div class="fo-qr__code" role="img" aria-label={t.preview.label} dangerouslySetInnerHTML={{ __html: svg }} />
          ) : (
            <p class="fo-qr__empty">{t.preview.empty}</p>
          )}
        </div>
        <p class="fo-qr__status" role="status">
          {svg ? t.preview.ready : ''}
        </p>
        {/* F13b (F7 f-9 and f-10, saída A; DECISOES § C-8): no Download turned off. Before there is a code, the place of the two
            buttons says why, at the same height; with a code, the PNG says its size on a second line of its own, with no dot. */}
        <div class="fo-qr__actions">
          {svg ? (
            <>
              <button type="button" class="fo-btn fo-btn--download fo-btn--lg fo-qr__png" key="png" aria-busy={busy ? 'true' : undefined} onClick={downloadPng}>
                <Icon raw={downloadIcon} />
                <span class="fo-qr__name">
                  <span>{t.download.png}</span>
                  <span class="fo-btn__meta">{fmt(t.download.pngMeta, { side: groupDigits(sideOf(size), lang) })}</span>
                </span>
              </button>
              <button type="button" class="fo-btn" key="svg" onClick={downloadSvg}>
                {t.download.svg}
              </button>
            </>
          ) : (
            <p class="fo-qr__wait" key="wait">
              {t.download.wait}
            </p>
          )}
        </div>
        {pngFailed && (
          <p class="fo-field__error" role="alert">
            <Icon raw={alertIcon} />
            {t.errors.png}
          </p>
        )}
      </div>
    </div>
  );
}
