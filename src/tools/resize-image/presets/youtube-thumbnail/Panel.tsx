// Resize image for a YouTube thumbnail: no choice to make, every image comes out as a 1280 × 720 JPG of at
// most 2,000,000 bytes (YouTube's help asks for 16:9, JPG or PNG, up to 2 MB; DECISOES § 58). The engine's
// 'cover' operation cuts from the centre to fill the frame, says so on the result, and a photo smaller than
// the frame is enlarged and says that too. The chip to Crop image lets the person choose the part that stays.
import type { PresetOptionsTexts } from '../../../../i18n/types.ts';
import ImagePanel from '../../../image/ImagePanel.tsx';
import type { ImagePanelData, ImageTool, OptionsProps } from '../../../image/types.ts';

type State = Record<string, never>;

function Options({ texts }: OptionsProps<State, PresetOptionsTexts>) {
  return <p class="fo-field__help">{texts.note}</p>;
}

export const TOOL: ImageTool<State, PresetOptionsTexts> = {
  warm: ['jpeg'],
  success: 'resized',
  initial: {},
  operation: () => ({ kind: 'cover', width: 1280, height: 720, format: 'jpeg', maxBytes: 2_000_000 }),
  Options,
};

export default function YoutubeThumbnailPanel(props: ImagePanelData<PresetOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
