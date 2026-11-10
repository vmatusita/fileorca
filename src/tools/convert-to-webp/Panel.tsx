// Convert to WebP or AVIF: a JPG or PNG in, a WebP (the default) or an AVIF out, at Recommended or Strong. The
// transparency of a PNG stays in both. WebP is written by the browser when it can and by the jSquash encoder when it
// cannot; AVIF always by the jSquash encoder, fetched on the first AVIF and never at load. Nothing is warmed: the
// default WebP needs no codec where the worker can warm, and the AVIF encoder is fetched only when AVIF is chosen.
import type { Level } from '../../engine/image/types.ts';
import { fmt } from '../../i18n/format.ts';
import type { ConvertToOptionsTexts } from '../../i18n/types.ts';
import ImagePanel from '../image/ImagePanel.tsx';
import OptionGroup from '../image/OptionGroup.tsx';
import type { ImagePanelData, ImageTool, OptionsProps } from '../image/types.ts';

interface State {
  to: 'webp' | 'avif';
  level: Level;
}

function Options({ state, update, texts }: OptionsProps<State, ConvertToOptionsTexts>) {
  return (
    <>
      <OptionGroup
        name="cw-format"
        legend={texts.formatLegend}
        value={state.to}
        choices={[
          { value: 'webp', label: texts.webp },
          { value: 'avif', label: texts.avif },
        ]}
        onChange={(to) => update({ to })}
      />
      <OptionGroup
        name="cw-level"
        legend={texts.levelLegend}
        value={state.level}
        choices={[
          { value: 'recommended', label: texts.recommended, help: texts.recommendedHelp },
          { value: 'strong', label: texts.strong, help: texts.strongHelp },
        ]}
        onChange={(level) => update({ level })}
      />
    </>
  );
}

export const TOOL: ImageTool<State, ConvertToOptionsTexts> = {
  warm: [],
  success: 'converted',
  initial: { to: 'webp', level: 'recommended' },
  operation: (state) => ({ kind: 'convert', to: state.to, level: state.level }),
  Options,
  now: (state, texts) => fmt(texts.now, { format: texts[state.to], level: texts[state.level] }),
};

export default function ConvertToWebpPanel(props: ImagePanelData<ConvertToOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
