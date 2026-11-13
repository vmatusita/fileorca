// Remove EXIF data (F18, decision 10; DECISOES § 731): no choice to make, every JPG, PNG and WebP comes back with its
// pixels and without its metadata, never decoded nor saved again (the strip operation of src/engine/image/process.ts, its
// outcome 'new', so the batch counts as 'cleaned'). The output keeps the name of the file, with the extension of its real
// format. Nothing is warmed: no codec runs.
import type { NoteOptionsTexts } from '../../i18n/types.ts';
import ImagePanel from '../image/ImagePanel.tsx';
import type { ImagePanelData, ImageTool, OptionsProps } from '../image/types.ts';

type State = Record<string, never>;

function Options({ texts }: OptionsProps<State, NoteOptionsTexts>) {
  return <p class="fo-field__help">{texts.note}</p>;
}

export const TOOL: ImageTool<State, NoteOptionsTexts> = {
  warm: [],
  success: 'cleaned',
  initial: {},
  operation: () => ({ kind: 'strip' }),
  Options,
};

export default function RemoveExifPanel(props: ImagePanelData<NoteOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
