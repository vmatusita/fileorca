// Compress image to 1 MB: no choice to make, every image comes out as a JPG of at most 1,000,000 bytes
// (the smaller of the two readings of "MB", so it also passes a form that counts 1,024). The algorithm
// is the engine's 'target' operation: it estimates the scale from bytes per pixel, reduces the picture first and
// only then searches the quality, so a 12 MP photo is never re-encoded whole several times.
import type { PresetOptionsTexts } from '../../../../i18n/types.ts';
import ImagePanel from '../../../image/ImagePanel.tsx';
import type { ImagePanelData, ImageTool, OptionsProps } from '../../../image/types.ts';

type State = Record<string, never>;

function Options({ texts }: OptionsProps<State, PresetOptionsTexts>) {
  return <p class="fo-field__help">{texts.note}</p>;
}

const TOOL: ImageTool<State, PresetOptionsTexts> = {
  warm: ['jpeg'],
  success: 'smaller',
  initial: {},
  operation: () => ({ kind: 'target', maxBytes: 1_000_000 }),
  Options,
};

export default function To1mbPanel(props: ImagePanelData<PresetOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
