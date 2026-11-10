// AVIF to JPG: no choice to make, every AVIF comes out as a JPG with transparency painted white (the note says so).
// The browser decodes the AVIF when it can; when it cannot (WebKit on Windows), the engine uses the jSquash decoder,
// fetched on the first AVIF and never at load, and shows the "before" from the decoded picture. Nothing is warmed:
// the worker warms only where it has OffscreenCanvas, and those browsers open AVIF themselves (DECISOES § 701 on).
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
  operation: () => ({ kind: 'convert', to: 'jpeg' }),
  Options,
};

export default function AvifToJpgPanel(props: ImagePanelData<NoteOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
