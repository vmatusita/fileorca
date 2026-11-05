// WebP to JPG: a WebP in, a JPG (or a PNG) out. The browser decodes the WebP; an animated WebP gives its
// first frame and the result says so. JPG paints transparency white (and says so); PNG keeps it.
import type { SaveAsOptionsTexts } from '../../i18n/types.ts';
import ImagePanel from '../image/ImagePanel.tsx';
import OptionGroup from '../image/OptionGroup.tsx';
import type { ImagePanelData, ImageTool, OptionsProps } from '../image/types.ts';

interface State {
  to: 'jpeg' | 'png';
}

function Options({ state, update, texts }: OptionsProps<State, SaveAsOptionsTexts>) {
  return (
    <OptionGroup
      name="wj-to"
      legend={texts.legend}
      value={state.to}
      choices={[
        { value: 'jpeg', label: texts.jpg },
        { value: 'png', label: texts.png },
      ]}
      onChange={(to) => update({ to })}
      note={texts.help}
      noteId="wj-help"
    />
  );
}

export const TOOL: ImageTool<State, SaveAsOptionsTexts> = {
  warm: [],
  success: 'converted',
  initial: { to: 'jpeg' },
  operation: (state) => ({ kind: 'convert', to: state.to }),
  Options,
  now: (state, texts) => (state.to === 'jpeg' ? texts.jpg : texts.png),
};

export default function WebpToJpgPanel(props: ImagePanelData<SaveAsOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
