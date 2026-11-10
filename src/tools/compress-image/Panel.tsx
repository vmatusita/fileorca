// Compress image: the options (Recommended, Strong or Up to a size) and what each file goes through. The island, the
// queue and the ZIP are the shared ones (src/tools/image/). The same component is rendered by the Astro page and hydrated
// by mount.ts, in English, Portuguese and Spanish.
//
// F15 (PLANO-UX-QV, section D; DECISOES § 656 and § 657): the third choice, "Up to a size", opens the field "Maximum size"
// in KB (the NumberField of Resize), from MIN_KB to MAX_KB and 200 at first, and every file goes through the operation of
// the size presets, { kind: 'target', maxBytes: KB × 1000 } (size.ts). The typed number stays in this component: it is
// never written to the URL, to an event or to a storage.
import type { CompressOptionsTexts } from '../../i18n/types.ts';
import ImagePanel from '../image/ImagePanel.tsx';
import NumberField from '../image/NumberField.tsx';
import type { ImagePanelData, ImageTool, OptionsProps } from '../image/types.ts';
import { CHOICES, MAX_KB, MIN_KB, START_KB, helpOf, labelOf, maxInvalidOf, nowOf, operationOf, type CompressState } from './size.ts';

function Options({ state, update, texts, lang }: OptionsProps<CompressState, CompressOptionsTexts>) {
  const size = state.level === 'size';
  return (
    <>
      <fieldset class="fo-field fo-options">
        <legend class="fo-field__label">{texts.legend}</legend>
        {/* Three choices with a help line each do not fit side by side below 480 px: this rail stacks there, in the three
            languages (fo-seg--stack; § 675). */}
        <div class="fo-seg fo-seg--stack">
          {CHOICES.map((value) => (
            <label class="fo-seg__opt" key={value}>
              <input type="radio" name="ci-level" value={value} checked={state.level === value} onChange={() => update({ level: value })} />
              {labelOf(texts, value)}
              <small>{helpOf(texts, value)}</small>
            </label>
          ))}
        </div>
        {/* The PNG note is not true for "Up to a size" (every file comes out as a JPG): there the help of the field says
            what happens, under the field (§ 676). */}
        {size ? null : <p class="fo-field__help">{texts.pngNote}</p>}
      </fieldset>
      {size && (
        <div class="fo-fields">
          <NumberField
            id="ci-max"
            label={texts.maxLabel}
            value={state.kb}
            min={MIN_KB}
            max={MAX_KB}
            suffix={texts.kb}
            error={maxInvalidOf(texts, lang)}
            describedBy="ci-max-help"
            onCommit={(kb) => update({ kb })}
          />
        </div>
      )}
      {size && (
        <p class="fo-field__help" id="ci-max-help">
          {texts.maxHelp}
        </p>
      )}
    </>
  );
}

export const TOOL: ImageTool<CompressState, CompressOptionsTexts> = {
  warm: ['jpeg', 'png', 'webp'],
  success: 'smaller',
  initial: { level: 'recommended', kb: START_KB },
  operation: (state) => operationOf(state),
  Options,
  now: nowOf,
};

export default function CompressPanel(props: ImagePanelData<CompressOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
