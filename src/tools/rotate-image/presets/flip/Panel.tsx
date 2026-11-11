// Flip image (F18, decision 9): the mirror alone, Horizontal (the default) or Vertical, with no turn. The engine has no
// "no turn" (Turn is 'right' | 'left' | 'half'), and half a turn followed by a mirror is the other mirror, so Horizontal
// asks for { turn: 'half', flip: 'vertical' } and Vertical for { turn: 'half', flip: 'horizontal' }. The photo
// orientation (Exif) is applied first by the engine, as in the parent, so Horizontal mirrors what the person sees.
// F18 placeholder: front I finalizes it and proves with the matrix that the output is the right mirror, never the other
// mirror nor a turn (DECISOES § 730).
import type { FlipOptionsTexts } from '../../../../i18n/types.ts';
import ImagePanel from '../../../image/ImagePanel.tsx';
import OptionGroup from '../../../image/OptionGroup.tsx';
import type { ImagePanelData, ImageTool, OptionsProps } from '../../../image/types.ts';

interface State {
  mirror: 'horizontal' | 'vertical';
}

function Options({ state, update, texts }: OptionsProps<State, FlipOptionsTexts>) {
  return (
    <OptionGroup
      name="fl-mirror"
      legend={texts.legend}
      value={state.mirror}
      choices={[
        { value: 'horizontal', label: texts.horizontal },
        { value: 'vertical', label: texts.vertical },
      ]}
      onChange={(mirror) => update({ mirror })}
    />
  );
}

export const TOOL: ImageTool<State, FlipOptionsTexts> = {
  warm: [],
  success: 'rotated',
  initial: { mirror: 'horizontal' },
  operation: (state) => ({ kind: 'rotate', turn: 'half', flip: state.mirror === 'horizontal' ? 'vertical' : 'horizontal' }),
  Options,
  now: (state, texts) => texts[state.mirror],
};

export default function FlipPanel(props: ImagePanelData<FlipOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
