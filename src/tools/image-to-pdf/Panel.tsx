// Image to PDF: every image becomes one page, in the order of the list, and the batch is one PDF (never a
// ZIP). "Image size" makes each page the size of its image; Letter and A4 fit the whole image inside the
// sheet with a 36 pt margin. Each file goes through the engine's 'pdf-page' operation, which writes clean
// pixels (no Exif, no GPS) with the orientation applied; the PDF worker then builds the document. Changing
// the sheet only builds the PDF again from the same pages.
import type { PdfOptionsTexts } from '../../i18n/types.ts';
import type { PdfPageSize } from '../../engine/pdf/build.ts';
import ImagePanel from '../image/ImagePanel.tsx';
import OptionGroup from '../image/OptionGroup.tsx';
import type { ImagePanelData, ImageTool, OptionsProps } from '../image/types.ts';

interface State {
  size: PdfPageSize;
}

function Options({ state, update, texts }: OptionsProps<State, PdfOptionsTexts>) {
  return (
    <OptionGroup
      name="pd-size"
      legend={texts.legend}
      value={state.size}
      choices={[
        { value: 'image', label: texts.image },
        { value: 'letter', label: texts.letter },
        { value: 'a4', label: texts.a4 },
      ]}
      onChange={(size) => update({ size })}
      note={texts.help}
      noteId="pd-help"
    />
  );
}

export const TOOL: ImageTool<State, PdfOptionsTexts> = {
  warm: [],
  success: 'pdf',
  initial: { size: 'image' },
  operation: () => ({ kind: 'pdf-page' }),
  pdfSize: (state) => state.size,
  Options,
  now: (state, texts) => texts[state.size],
};

export default function ImageToPdfPanel(props: ImagePanelData<PdfOptionsTexts>) {
  return <ImagePanel {...props} tool={TOOL} />;
}
