// Crop image: the ratio (Square, 4:5, 16:9, Free), the crop box over the picked image and the four fields that
// mirror it. It opens on Square, centred, so a result shows at once. In a batch every image gets the centred
// crop of the ratio; the box a person adjusts belongs to the image it was adjusted on (the picked row of the
// queue) and to no other. The island, the queue and the ZIP are the shared ones (src/tools/image/).
//
// Box edits are state of this component, never written to the URL or to an event.
import { useRef } from 'preact/hooks';
import type { Box } from '../../engine/image/types.ts';
import type { CropOptionsTexts } from '../../i18n/types.ts';
import ImagePanel from '../image/ImagePanel.tsx';
import NumberField from '../image/NumberField.tsx';
import OptionGroup from '../image/OptionGroup.tsx';
import type { ImagePanelData, ImageTool, OptionsProps } from '../image/types.ts';
import CropEditor from './CropEditor.tsx';
import { RATIO_VALUE, fieldLimits, fitBox, setField, startBox, type Field, type Ratio, type Size } from './box.ts';

interface State {
  ratio: Ratio;
  /** The boxes a person adjusted, by file id. An image with no entry gets the centred crop of the ratio. */
  boxes: Record<number, Box>;
}

const FIELDS: readonly Field[] = ['x', 'y', 'width', 'height'];

function Options({ state, update, texts, files, selected }: OptionsProps<State, CropOptionsTexts>) {
  const ratio = RATIO_VALUE[state.ratio];
  // The latest boxes, also between two edits that land before the next render.
  const boxes = useRef(state.boxes);
  boxes.current = state.boxes;

  const size: Size | null = selected && selected.width !== null && selected.height !== null ? { width: selected.width, height: selected.height } : null;
  const current: Box | null = selected && size ? fitBox(boxes.current[selected.id] ?? startBox(size, ratio), size, ratio) : null;

  function setBox(box: Box): void {
    if (!selected) return;
    boxes.current = { ...boxes.current, [selected.id]: box };
    update({ boxes: boxes.current });
  }

  function chooseRatio(next: Ratio): void {
    // A locked ratio starts every image over with its centred crop. Free keeps the box on screen for the
    // picked image (so unlocking changes nothing yet) and leaves the other images whole.
    boxes.current = next === 'free' && selected && current ? { [selected.id]: current } : {};
    update({ ratio: next, boxes: boxes.current });
  }

  return (
    <>
      <OptionGroup
        name="cr-ratio"
        legend={texts.legend}
        value={state.ratio}
        choices={[
          { value: 'square', label: texts.square },
          { value: 'portrait', label: texts.portrait },
          { value: 'wide', label: texts.wide },
          { value: 'free', label: texts.free },
        ]}
        onChange={chooseRatio}
        {...(files.length > 1 && ratio !== null ? { note: texts.batchNote, noteId: 'cr-batch' } : {})}
      />
      {selected && size && current && (
        <>
          <CropEditor key={selected.id} url={selected.url ?? ''} size={size} box={current} ratio={ratio} label={texts.boxLabel} helpId="cr-keys" onChange={setBox} />
          <p class="fo-field__help" id="cr-keys">
            {texts.keyboardHelp}
          </p>
          <div class="fo-fields">
            {FIELDS.map((field) => {
              const limits = fieldLimits(current, field, size, ratio);
              return (
                <NumberField
                  key={`${selected.id}-${field}`}
                  id={`cr-${field}`}
                  label={texts[field]}
                  value={current[field]}
                  min={limits.min}
                  max={limits.max}
                  suffix={texts.px}
                  error={texts.invalid}
                  onCommit={(value) => setBox(setField(current, field, value, size, ratio))}
                />
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

export const TOOL: ImageTool<State, CropOptionsTexts> = {
  warm: [],
  success: 'cropped',
  initial: { ratio: 'square', boxes: {} },
  operation: (state, file) => {
    const ratio = RATIO_VALUE[state.ratio];
    const box = state.boxes[file.id];
    return box ? { kind: 'crop', ratio, box } : { kind: 'crop', ratio };
  },
  selectable: true,
  Options,
};

export default function CropPanel(props: ImagePanelData<CropOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
