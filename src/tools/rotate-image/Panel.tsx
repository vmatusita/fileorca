// Rotate image: the turn (Right 90°, Left 90°, 180°) and the mirror (None, Horizontal, Vertical) combine and
// apply to the whole batch. The photo orientation (Exif) is applied first by the engine, so "Right 90°"
// always means a quarter turn of what the person sees.
import type { RotateOptionsTexts } from '../../i18n/types.ts';
import type { Flip, Turn } from '../../engine/image/types.ts';
import ImagePanel from '../image/ImagePanel.tsx';
import OptionGroup from '../image/OptionGroup.tsx';
import type { ImagePanelData, ImageTool, OptionsProps } from '../image/types.ts';

interface State {
  turn: Turn;
  flip: Flip;
}

function Options({ state, update, texts }: OptionsProps<State, RotateOptionsTexts>) {
  return (
    <>
      <OptionGroup
        name="ro-turn"
        legend={texts.turnLegend}
        value={state.turn}
        choices={[
          { value: 'right', label: texts.right },
          { value: 'left', label: texts.left },
          { value: 'half', label: texts.half },
        ]}
        onChange={(turn) => update({ turn })}
      />
      <OptionGroup
        name="ro-flip"
        legend={texts.flipLegend}
        value={state.flip}
        choices={[
          { value: 'none', label: texts.none },
          { value: 'horizontal', label: texts.horizontal },
          { value: 'vertical', label: texts.vertical },
        ]}
        onChange={(flip) => update({ flip })}
      />
    </>
  );
}

export const TOOL: ImageTool<State, RotateOptionsTexts> = {
  warm: [],
  success: 'rotated',
  initial: { turn: 'right', flip: 'none' },
  operation: (state) => ({ kind: 'rotate', turn: state.turn, flip: state.flip }),
  Options,
};

export default function RotatePanel(props: ImagePanelData<RotateOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
