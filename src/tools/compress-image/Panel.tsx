// Compress image: the options (Recommended or Strong) and what each file goes through. The island, the
// queue and the ZIP are the shared ones (src/tools/image/). The same component is rendered by the Astro
// page and hydrated by mount.ts, in English, Portuguese and Spanish.
import type { CompressOptionsTexts } from '../../i18n/types.ts';
import type { Level } from '../../engine/image/types.ts';
import ImagePanel from '../image/ImagePanel.tsx';
import type { ImagePanelData, ImageTool, OptionsProps } from '../image/types.ts';

interface State {
  level: Level;
}

function Options({ state, update, texts }: OptionsProps<State, CompressOptionsTexts>) {
  return (
    <fieldset class="fo-field fo-options">
      <legend class="fo-field__label">{texts.legend}</legend>
      <div class="fo-seg">
        {(['recommended', 'strong'] as const).map((value) => (
          <label class="fo-seg__opt" key={value}>
            <input type="radio" name="ci-level" value={value} checked={state.level === value} onChange={() => update({ level: value })} />
            {texts[value]}
            <small>{value === 'recommended' ? texts.recommendedHelp : texts.strongHelp}</small>
          </label>
        ))}
      </div>
      <p class="fo-field__help">{texts.pngNote}</p>
    </fieldset>
  );
}

const TOOL: ImageTool<State, CompressOptionsTexts> = {
  warm: ['jpeg', 'png', 'webp'],
  success: 'smaller',
  initial: { level: 'recommended' },
  operation: (state) => ({ kind: 'compress', level: state.level }),
  Options,
};

export default function CompressPanel(props: ImagePanelData<CompressOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
