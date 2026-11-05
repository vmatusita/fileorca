// The signature area of Sign PDF (F5a, decision 6; DECISOES § 152). Three ways to make the signature, every one with
// a keyboard: draw it on a pad (pointer, pen or finger), upload a PNG or JPG (drawn again on a canvas, so no metadata
// travels), or type the name (drawn with the site's display font). It becomes a PNG with a transparent background, in
// the ink of the light theme (docs/design tokens), whatever the theme on screen. Then it is placed on a preview of the
// page: dragged with the pointer, moved with the arrow keys (Shift: ten times further), resized with + and −, or set by
// the X, Y and width fields. The box is a focusable group, like the crop box of Crop image. Nothing is kept: the
// signature lives in the panel until the page closes.
import { useEffect, useRef, useState } from 'preact/hooks';
import type { TargetedKeyboardEvent, TargetedPointerEvent } from 'preact';
import { fmt } from '../../i18n/format.ts';
import Icon from '../../icons/Icon.tsx';
import NumberField from '../image/NumberField.tsx';
import OptionGroup from '../image/OptionGroup.tsx';
import FieldError from './FieldError.tsx';
import TextField from './TextField.tsx';
import type { SignTexts } from './option-texts.ts';
import uploadIcon from '../../../docs/design/assets/Icons/upload.svg?raw';

export interface SignatureImage {
  png: Uint8Array;
  /** Height over width. */
  ratio: number;
  /** Object URL of the PNG, for the preview. */
  url: string;
}

export interface SignatureBox {
  /** Left and top of the box, and its width, as fractions of the page as shown. */
  x: number;
  y: number;
  width: number;
}

export interface SignatureAreaProps {
  id: string;
  texts: SignTexts;
  /** The ink of the light theme (the token "ink"), read at build. */
  ink: string;
  image: SignatureImage | null;
  onImage: (image: SignatureImage | null) => void;
  box: SignatureBox;
  onBox: (box: SignatureBox) => void;
  /** Picture of the page the box is placed on, and the page's shape (width over height). */
  pageUrl: string | null;
  pageRatio: number;
  showErrors: boolean;
  /** Inner markup of the info icon of the note (F13a, F-10). */
  noteIcon: string;
  /** Told the width of the preview frame, in CSS pixels, when it is known and when it changes (F13a, F-5). */
  onFrameWidth?: (width: number) => void;
}

type Mode = 'draw' | 'upload' | 'type';
interface Point {
  x: number;
  y: number;
}

const PAD_WIDTH = 600;
/** The position is said once, this long after the last key (F13a, D-9; the pause of the ResultHero's region). */
const SPEAK_AFTER_MS = 400;
const PAD_HEIGHT = 200;
const MIN_WIDTH = 0.05;

async function canvasPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  return blob ? new Uint8Array(await blob.arrayBuffer()) : new Uint8Array(0);
}

/** The smallest box around the non-transparent pixels, plus a small margin. */
function trimmed(source: HTMLCanvasElement): HTMLCanvasElement | null {
  const context = source.getContext('2d');
  if (!context) return null;
  const { width, height } = source;
  const data = context.getImageData(0, 0, width, height).data;
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if ((data[(y * width + x) * 4 + 3] as number) > 8) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0) return null;
  const pad = 6;
  const out = document.createElement('canvas');
  out.width = Math.min(width, right - left + 1 + 2 * pad);
  out.height = Math.min(height, bottom - top + 1 + 2 * pad);
  out.getContext('2d')?.drawImage(source, Math.max(0, left - pad), Math.max(0, top - pad), out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

async function asImage(canvas: HTMLCanvasElement | null): Promise<SignatureImage | null> {
  if (!canvas) return null;
  const png = await canvasPng(canvas);
  if (png.length === 0) return null;
  return { png, ratio: canvas.height / canvas.width, url: URL.createObjectURL(new Blob([png as BlobPart], { type: 'image/png' })) };
}

function drawStrokes(strokes: readonly Point[][], ink: string, scale: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = PAD_WIDTH * scale;
  canvas.height = PAD_HEIGHT * scale;
  const context = canvas.getContext('2d');
  if (context) {
    context.strokeStyle = ink;
    context.lineWidth = 3 * scale;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    for (const stroke of strokes) {
      context.beginPath();
      stroke.forEach((point, i) => (i === 0 ? context.moveTo(point.x * scale, point.y * scale) : context.lineTo(point.x * scale, point.y * scale)));
      if (stroke.length === 1 && stroke[0]) context.lineTo(stroke[0].x * scale + 0.1, stroke[0].y * scale);
      context.stroke();
    }
  }
  return canvas;
}

async function typedImage(text: string, ink: string): Promise<HTMLCanvasElement | null> {
  const name = text.trim();
  if (!name) return null;
  const family = getComputedStyle(document.documentElement).getPropertyValue('--fo-font-display').trim() || 'sans-serif';
  const font = `500 96px ${family}`;
  try {
    await document.fonts.load(font, name);
  } catch {
    // the fallback font draws it
  }
  const measure = document.createElement('canvas').getContext('2d');
  if (!measure) return null;
  measure.font = font;
  const width = Math.ceil(measure.measureText(name).width) + 24;
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(2400, width);
  canvas.height = 140;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.font = font;
  context.fillStyle = ink;
  context.textBaseline = 'middle';
  context.fillText(name, 12, 70, canvas.width - 24);
  return trimmed(canvas);
}

async function uploadedImage(file: File): Promise<HTMLCanvasElement | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const k = Math.min(1, 1200 / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * k));
    canvas.height = Math.max(1, Math.round(bitmap.height * k));
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas;
  } catch {
    return null;
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function fitBox(box: SignatureBox, ratio: number, pageRatio: number): SignatureBox {
  const width = clamp(box.width, MIN_WIDTH, 1);
  // Height of the box as a fraction of the page height: width × (image height / image width) × (page width / page height).
  const height = width * ratio * pageRatio;
  return { x: clamp(box.x, 0, Math.max(0, 1 - width)), y: clamp(box.y, 0, Math.max(0, 1 - height)), width };
}

export default function SignatureArea(props: SignatureAreaProps) {
  const { id, texts, ink, image, onImage, box, onBox, pageUrl, pageRatio, showErrors, noteIcon, onFrameWidth } = props;
  const [mode, setMode] = useState<Mode>('draw');
  const [typed, setTyped] = useState('');
  const [uploadError, setUploadError] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const strokes = useRef<Point[][]>([]);
  const pad = useRef<HTMLCanvasElement>(null);
  const drawing = useRef<number | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointer: number; startX: number; startY: number; box: SignatureBox } | null>(null);
  /** D-9: what the region says about the box, and the timer of the pause after the last key. */
  const [said, setSaid] = useState('');
  const speak = useRef(0);
  const position = useRef('');
  const ratio = image?.ratio ?? 1 / 3;
  /** The last signature this area made, so it can tell its own clearing from the tool's (Start over). */
  const own = useRef<SignatureImage | null>(null);
  const give = (made: SignatureImage | null): void => {
    own.current = made;
    onImage(made);
  };

  // The pad on screen draws in the text colour of the theme; the PNG is drawn again in the light ink.
  const repaint = () => {
    const canvas = pad.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = getComputedStyle(canvas).color;
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    for (const stroke of strokes.current) {
      context.beginPath();
      stroke.forEach((point, i) => (i === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y)));
      context.stroke();
    }
  };

  const finishDrawing = async () => give(await asImage(trimmed(drawStrokes(strokes.current, ink, 2))));

  const point = (event: TargetedPointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * PAD_WIDTH, y: ((event.clientY - rect.top) / rect.height) * PAD_HEIGHT };
  };

  useEffect(() => {
    if (mode !== 'type') return undefined;
    let alive = true;
    void typedImage(typed, ink).then(asImage).then((made) => {
      if (alive) give(made);
    });
    return () => {
      alive = false;
    };
  }, [typed, mode]);

  // Start over clears the signature in the tool's state without the area asking: the area's own fields (the mode, the
  // typed name, the pad, the chosen image) start fresh too, so a name on screen always has its signature (DECISOES § 182).
  useEffect(() => {
    if (image !== null || own.current === null) return;
    own.current = null;
    strokes.current = [];
    repaint();
    setTyped('');
    setChosen(null);
    setUploadError(false);
    setMode('draw');
  }, [image]);

  // F-5: the preview is drawn at the width of its frame times the pixel ratio; the frame says its width when it changes.
  useEffect(() => {
    const element = frame.current;
    if (!element || !onFrameWidth) return undefined;
    onFrameWidth(element.clientWidth);
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => onFrameWidth(element.clientWidth));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => () => window.clearTimeout(speak.current), []);

  const shown = fitBox(box, ratio, pageRatio);
  const move = (dx: number, dy: number, grow = 0) => onBox(fitBox({ x: shown.x + dx, y: shown.y + dy, width: shown.width + grow }, ratio, pageRatio));

  function onBoxKey(event: TargetedKeyboardEvent<HTMLDivElement>): void {
    // F13a (D-6): Shift makes the arrows go ten times further; + and = grow the box by 1 % and - and _ shrink it by 1 %,
    // with or without Shift (the + and the _ are Shift on most keyboards, and a step of 10 % was a surprise).
    const arrow = event.shiftKey ? 0.1 : 0.01;
    const grow = 0.01;
    const keys: Record<string, [number, number, number]> = {
      ArrowLeft: [-arrow, 0, 0],
      ArrowRight: [arrow, 0, 0],
      ArrowUp: [0, -arrow, 0],
      ArrowDown: [0, arrow, 0],
      '+': [0, 0, grow],
      '=': [0, 0, grow],
      '-': [0, 0, -grow],
      '_': [0, 0, -grow],
    };
    const change = keys[event.key];
    if (!change) return;
    event.preventDefault();
    move(...change);
    // D-9: the region is emptied at each key and says the new position once, 400 ms after the last one (WCAG 4.1.3).
    setSaid('');
    window.clearTimeout(speak.current);
    speak.current = window.setTimeout(() => setSaid(`${texts.boxLabel}: ${position.current}`), SPEAK_AFTER_MS);
  }

  const helpId = `${id}-box-help`;
  const value = fmt(texts.boxValue, { x: Math.round(shown.x * 100), y: Math.round(shown.y * 100), width: Math.round(shown.width * 100) });
  position.current = value;
  return (
    <div class="fo-sign">
      <OptionGroup<Mode>
        name={`${id}-mode`}
        legend={texts.modeLegend}
        value={mode}
        choices={[
          { value: 'draw', label: texts.draw },
          { value: 'upload', label: texts.upload },
          { value: 'type', label: texts.type },
        ]}
        onChange={(next) => {
          setMode(next);
          give(null);
          strokes.current = [];
          // The image chosen in Upload goes with the signature it made, so its name does not stay without one (DECISOES § 183).
          setChosen(null);
          setUploadError(false);
        }}
      />
      {mode === 'draw' && (
        <div class="fo-field">
          <p class="fo-field__label" id={`${id}-pad-label`}>
            {texts.drawLabel}
          </p>
          <canvas
            ref={pad}
            class="fo-sign__pad"
            width={PAD_WIDTH}
            height={PAD_HEIGHT}
            role="img"
            aria-labelledby={`${id}-pad-label`}
            aria-describedby={`${id}-pad-help`}
            onPointerDown={(event) => {
              drawing.current = event.pointerId;
              event.currentTarget.setPointerCapture(event.pointerId);
              strokes.current.push([point(event)]);
              repaint();
            }}
            onPointerMove={(event) => {
              if (drawing.current !== event.pointerId) return;
              strokes.current.at(-1)?.push(point(event));
              repaint();
            }}
            onPointerUp={(event) => {
              if (drawing.current !== event.pointerId) return;
              drawing.current = null;
              void finishDrawing();
            }}
            onPointerCancel={() => {
              drawing.current = null;
            }}
          />
          <p class="fo-field__help" id={`${id}-pad-help`}>
            {texts.drawHelp}
          </p>
          <button
            type="button"
            class="fo-btn fo-btn--ghost"
            onClick={() => {
              strokes.current = [];
              repaint();
              give(null);
            }}
          >
            {texts.clear}
          </button>
        </div>
      )}
      {mode === 'upload' && (
        <div class="fo-field" data-state={uploadError ? 'error' : undefined}>
          {/* The native input is out of sight and keeps the focus, the name and the keyboard; its label wears the site's
              button, with the upload icon and the site's words, and the chosen file's name shows beside it (DECISOES § 181). */}
          <div class="fo-sign__upload">
            <input
              id={`${id}-upload`}
              class="fo-sign__file"
              type="file"
              accept="image/png,image/jpeg"
              aria-invalid={uploadError ? 'true' : undefined}
              aria-describedby={uploadError ? `${id}-upload-error ${id}-upload-help` : `${id}-upload-help`}
              onChange={async (event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = '';
                if (!file) return;
                setChosen(file.name);
                const made = await asImage(await uploadedImage(file));
                setUploadError(made === null);
                give(made);
              }}
            />
            <label class="fo-btn fo-sign__choose" for={`${id}-upload`}>
              <Icon raw={uploadIcon} />
              {texts.uploadLabel}
            </label>
            {chosen && <span class="fo-sign__chosen">{chosen}</span>}
          </div>
          {/* The failure is an alert of its own, tied to the input (DECISOES § 177): said once, the help stays as it was. */}
          {uploadError && <FieldError id={`${id}-upload-error`}>{texts.uploadError}</FieldError>}
          <p class="fo-field__help" id={`${id}-upload-help`}>
            {texts.uploadHelp}
          </p>
        </div>
      )}
      {mode === 'type' && <TextField id={`${id}-typed`} label={texts.typeLabel} value={typed} onCommit={setTyped} help={texts.typeHelp} maxLength={60} />}
      {showErrors && !image && <FieldError>{texts.missing}</FieldError>}
      <fieldset class="fo-field fo-sign__place">
        <legend class="fo-field__label">{texts.placeLegend}</legend>
        {/* F13a (D-9): the picture and the box sit on a sheet of paper, light in both themes (the page of a PDF is white), and
            the frame no longer clips, so the focus ring of the box shows whole at every edge of the page. */}
        <div class="fo-sign__page" ref={frame} style={`--page-ratio:${pageRatio.toFixed(4)}`}>
          <div class="fo-sign__sheet" data-theme="light">
          {pageUrl && <img src={pageUrl} alt={texts.previewLabel} draggable={false} />}
        {image && (
          <div
            class="fo-sign__box"
            role="group"
            tabindex={0}
            aria-label={`${texts.boxLabel}, ${value}`}
            aria-describedby={helpId}
            style={`--x:${shown.x * 100}%;--y:${shown.y * 100}%;--w:${shown.width * 100}%`}
            onKeyDown={onBoxKey}
            onPointerDown={(event) => {
              drag.current = { pointer: event.pointerId, startX: event.clientX, startY: event.clientY, box: shown };
              event.currentTarget.setPointerCapture(event.pointerId);
              event.currentTarget.focus({ preventScroll: true });
              event.preventDefault();
            }}
            onPointerMove={(event) => {
              const current = drag.current;
              const rect = frame.current?.getBoundingClientRect();
              if (!current || current.pointer !== event.pointerId || !rect) return;
              onBox(fitBox({ x: current.box.x + (event.clientX - current.startX) / rect.width, y: current.box.y + (event.clientY - current.startY) / rect.height, width: current.box.width }, ratio, pageRatio));
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
          >
            <img src={image.url} alt="" draggable={false} />
          </div>
        )}
          </div>
        </div>
        <p class="fo-field__help" id={helpId}>
          {texts.keyboardHelp}
        </p>
        <p class="fo-sr" role="status" id={`${id}-box-status`}>
          {said}
        </p>
        <div class="fo-fields">
          <NumberField id={`${id}-x`} label={texts.x} value={Math.round(shown.x * 100)} min={0} max={100} suffix={texts.pct} error={texts.invalid} onCommit={(x) => onBox(fitBox({ ...shown, x: x / 100 }, ratio, pageRatio))} />
          <NumberField id={`${id}-y`} label={texts.y} value={Math.round(shown.y * 100)} min={0} max={100} suffix={texts.pct} error={texts.invalid} onCommit={(y) => onBox(fitBox({ ...shown, y: y / 100 }, ratio, pageRatio))} />
          <NumberField id={`${id}-w`} label={texts.width} value={Math.round(shown.width * 100)} min={5} max={100} suffix={texts.pct} error={texts.invalid} onCommit={(width) => onBox(fitBox({ ...shown, width: width / 100 }, ratio, pageRatio))} />
        </div>
      </fieldset>
      {/* F13a (F-10): the honest line is a note of the design system, brand-soft with the info icon. */}
      <p class="fo-note">
        <Icon inner={noteIcon} />
        <span>{texts.notice}</span>
      </p>
    </div>
  );
}
