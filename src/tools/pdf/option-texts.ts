// The shapes of the option texts of each PDF tool (the `options` of its panel texts, src/tools/<slug>/i18n/en.ts).
// Types only: every label is a noun phrase in sentence case, every error says the rule (docs/design/README, voice).

export interface MergeTexts {
  /** "Add more PDFs" (adds to the list instead of starting over). */
  add: string;
  /** Above the rows, in view (F13a, D-26): the order of the list is the order of the file, and the arrows change it. */
  help: string;
  /** With one PDF in the list: "Add at least one more PDF to merge." */
  needMore: string;
  /** The name of the list: "Files, in the order they join". */
  listLabel: string;
  /** After the result, the order folded in the band (F13a): "Order · {count} files", and the line inside it. */
  order: string;
  orderHelp: string;
}

export interface SplitTexts {
  legend: string;
  each: string;
  ranges: string;
  pick: string;
  rangesLabel: string;
  rangesHelp: string;
  rangesError: string;
  pickHelp: string;
  pickNone: string;
}

export interface ImagesTexts {
  formatLegend: string;
  jpg: string;
  png: string;
  formatHelp: string;
  resolutionLegend: string;
  low: string;
  lowHelp: string;
  medium: string;
  mediumHelp: string;
  high: string;
  highHelp: string;
  pagesLegend: string;
  all: string;
  range: string;
  rangeLabel: string;
  rangeHelp: string;
  rangeError: string;
}

export interface CompressPdfTexts {
  legend: string;
  lossless: string;
  losslessHelp: string;
  recommended: string;
  recommendedHelp: string;
  strong: string;
  strongHelp: string;
  /** Said under the rail before the choice: the text stops being selectable and forms and links go. */
  strongWarning: string;
}

export interface RotatePdfTexts {
  turnLegend: string;
  right: string;
  half: string;
  left: string;
  scopeLegend: string;
  all: string;
  pick: string;
  pickHelp: string;
  /** With two files or more: page by page works on one file. */
  batchNote: string;
}

export interface DeleteTexts {
  help: string;
  /** "Delete {count} pages" and "Delete 1 page". */
  actionCount: string;
  actionOne: string;
  /** Every page picked: "A PDF needs at least one page: leave one unpicked." */
  allPicked: string;
  nonePicked: string;
}

export interface NumbersTexts {
  positionLegend: string;
  topLeft: string;
  topCenter: string;
  topRight: string;
  bottomLeft: string;
  bottomCenter: string;
  bottomRight: string;
  formatLegend: string;
  /** Examples of each format, written as they come out. */
  n: string;
  pageN: string;
  pageNofTotal: string;
  nOfTotal: string;
  /** The words the page numbers are written with, as the examples above show them: "Page" and "of". */
  pageWord: string;
  ofWord: string;
  startLabel: string;
  startError: string;
  skipFirst: string;
}

export interface ReorderTexts {
  help: string;
  reverse: string;
  /** Nothing moved yet: "Move a page to save a new order." */
  unchanged: string;
}

export interface WatermarkTexts {
  textLabel: string;
  textHelp: string;
  textError: string;
  /** The default text of the mark. */
  defaultText: string;
  sizeLegend: string;
  small: string;
  medium: string;
  large: string;
  opacityLegend: string;
  light: string;
  mediumOpacity: string;
  strong: string;
  directionLegend: string;
  diagonal: string;
  horizontal: string;
}

export interface SignTexts {
  modeLegend: string;
  draw: string;
  upload: string;
  type: string;
  drawLabel: string;
  drawHelp: string;
  clear: string;
  uploadLabel: string;
  uploadHelp: string;
  uploadError: string;
  typeLabel: string;
  typeHelp: string;
  /** No signature yet: "Draw, upload or type your signature first." */
  missing: string;
  placeLegend: string;
  /** Name of the movable box: "Signature position". */
  boxLabel: string;
  /** "{x}% from the left, {y}% from the top, {width}% wide" */
  boxValue: string;
  keyboardHelp: string;
  x: string;
  y: string;
  width: string;
  pct: string;
  invalid: string;
  pagesLegend: string;
  thisPage: string;
  allPages: string;
  pickPages: string;
  previewLabel: string;
  previewPage: string;
  /** The honest line: an image of the signature, not a digital signature. */
  notice: string;
}

export interface PasswordToolTexts {
  passwordLabel: string;
  confirmLabel: string;
  /** The rule, said before and as the error: "Use 4 to 100 characters." */
  rule: string;
  mismatch: string;
}

export interface UnlockTexts {
  passwordLabel: string;
  rule: string;
  /** The button next to the field: "Remove password". */
  submit: string;
  /** The line that asks for the password of a file. */
  ask: string;
}
