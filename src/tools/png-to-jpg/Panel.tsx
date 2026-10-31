// PNG to JPG: no choice to make. The direction comes from the file (the engine's 'swap' target): a PNG becomes a
// JPG, with transparency painted white, and a JPG becomes a PNG without loss. The real format is read from
// the bytes, so a PNG named .jpg still becomes a JPG.
import type { NoteOptionsTexts } from '../../i18n/types.ts';
import ImagePanel from '../image/ImagePanel.tsx';
import type { ImagePanelData, ImageTool, OptionsProps } from '../image/types.ts';

type State = Record<string, never>;

function Options({ texts }: OptionsProps<State, NoteOptionsTexts>) {
  return <p class="fo-field__help">{texts.note}</p>;
}

export const TOOL: ImageTool<State, NoteOptionsTexts> = {
  warm: [],
  success: 'converted',
  initial: {},
  operation: () => ({ kind: 'convert', to: 'swap' }),
  Options,
};

export default function PngToJpgPanel(props: ImagePanelData<NoteOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
