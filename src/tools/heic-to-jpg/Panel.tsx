// HEIC to JPG: one HEIC or HEIF photo in, one JPG (or PNG) out, from the main image of the file. Only HEIC
// and HEIF are taken here; the engine reads the photo with the browser when it can and with libheif (a
// separate .wasm, loaded on the first HEIC) when it cannot. The first HEIC warms that file in advance
// (pointer over the zone, focus on the button), so the 1.4 MB does not wait for the click.
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
      name="hj-to"
      legend={texts.legend}
      value={state.to}
      choices={[
        { value: 'jpeg', label: texts.jpg },
        { value: 'png', label: texts.png },
      ]}
      onChange={(to) => update({ to })}
      note={texts.help}
      noteId="hj-help"
    />
  );
}

export const TOOL: ImageTool<State, SaveAsOptionsTexts> = {
  warm: ['heic'],
  success: 'converted',
  initial: { to: 'jpeg' },
  operation: (state) => ({ kind: 'convert', to: state.to }),
  Options,
};

export default function HeicToJpgPanel(props: ImagePanelData<SaveAsOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
