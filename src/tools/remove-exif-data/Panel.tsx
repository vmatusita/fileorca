// Remove EXIF data (F18, decision 10): no choice to make, every JPG, PNG and WebP comes back with its pixels and without
// its metadata, never decoded nor saved again (the originalStripped path of src/engine/image/process.ts). Nothing is
// warmed: no codec runs.
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
  // F18 placeholder: front I replaces with { kind: 'strip' }. A resize to 100 % changes nothing, so the engine answers with
  // the original without its metadata (originalStripped, outcome 'fits'), with no decoding and no new encoding.
  operation: () => ({ kind: 'resize', mode: 'percent', percent: 100 }),
  Options,
};

export default function RemoveExifPanel(props: ImagePanelData<NoteOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
