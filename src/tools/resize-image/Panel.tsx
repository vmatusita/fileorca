// Resize image: By size (a width × height box every picture fits inside) or By percentage, and what each
// file goes through. The island, the queue and the ZIP are the shared ones (src/tools/image/).
//
// The result shows at once: until the person touches an option, every file is resized to 50%, and the two
// fields show half of the first picture's size (an example, not yet a choice). The first edit turns what
// the fields show into the box, so nothing is processed twice and nothing the person did not choose is
// kept. The typed numbers stay in this component: they are never written to the URL or to an event.
import type { ResizeOptionsTexts } from '../../i18n/types.ts';
import { fmt } from '../../i18n/format.ts';
import ImagePanel from '../image/ImagePanel.tsx';
import NumberField from '../image/NumberField.tsx';
import OptionGroup from '../image/OptionGroup.tsx';
import type { FileInfo, ImagePanelData, ImageTool, OptionsProps } from '../image/types.ts';

type Mode = 'size' | 'percent';

interface State {
  mode: Mode;
  /** The box the person chose; null until they edit a field or switch the mode (then 50% is used). */
  width: number | null;
  height: number | null;
  percent: number;
}

/** Longest side a field takes: far above any photo, so only a typo is refused. */
const MAX_PX = 20_000;
const START_PERCENT = 50;
/** What the fields show before a picture is known. */
const EXAMPLE = { width: 1920, height: 1080 };

interface Box {
  width: number;
  height: number;
}

/** The box on screen: the chosen one, else half of the first measured picture, else the example. */
export function shownBox(state: Pick<State, 'width' | 'height'>, files: readonly FileInfo[]): Box {
  if (state.width !== null && state.height !== null) return { width: state.width, height: state.height };
  for (const file of files) {
    if (file.width !== null && file.height !== null) {
      return { width: Math.max(1, Math.round(file.width / 2)), height: Math.max(1, Math.round(file.height / 2)) };
    }
  }
  return EXAMPLE;
}

function Options({ state, update, texts, files, lang }: OptionsProps<State, ResizeOptionsTexts>) {
  const box = shownBox(state, files);
  const tooBig = fmt(texts.invalid, { max: MAX_PX.toLocaleString(lang) });
  return (
    <>
      <OptionGroup
        name="rz-mode"
        legend={texts.legend}
        value={state.mode}
        choices={[
          { value: 'size', label: texts.bySize },
          { value: 'percent', label: texts.byPercent },
        ]}
        onChange={(mode) => update(mode === 'size' ? { mode, width: box.width, height: box.height } : { mode })}
      />
      {state.mode === 'size' ? (
        <>
          <div class="fo-fields">
            <NumberField
              id="rz-width"
              label={texts.width}
              value={box.width}
              min={1}
              max={MAX_PX}
              suffix={texts.px}
              error={tooBig}
              describedBy="rz-fit"
              onCommit={(width) => update({ width, height: box.height })}
            />
            <NumberField
              id="rz-height"
              label={texts.height}
              value={box.height}
              min={1}
              max={MAX_PX}
              suffix={texts.px}
              error={tooBig}
              describedBy="rz-fit"
              onCommit={(height) => update({ width: box.width, height })}
            />
          </div>
          <p class="fo-field__help" id="rz-fit">
            {texts.fitNote}
          </p>
        </>
      ) : (
        <div class="fo-fields">
          <NumberField
            id="rz-percent"
            label={texts.percent}
            value={state.percent}
            min={1}
            max={100}
            suffix={texts.pct}
            error={fmt(texts.invalid, { max: 100 })}
            onCommit={(percent) => update({ percent })}
          />
        </div>
      )}
    </>
  );
}

export const TOOL: ImageTool<State, ResizeOptionsTexts> = {
  warm: [],
  success: 'resized',
  initial: { mode: 'size', width: null, height: null, percent: START_PERCENT },
  operation: (state) => {
    if (state.mode === 'percent') return { kind: 'resize', mode: 'percent', percent: state.percent };
    if (state.width === null || state.height === null) return { kind: 'resize', mode: 'percent', percent: START_PERCENT };
    return { kind: 'resize', mode: 'size', width: state.width, height: state.height };
  },
  Options,
};

export default function ResizePanel(props: ImagePanelData<ResizeOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
