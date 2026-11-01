// Add page numbers to PDF page blocks (how, specs, faq, privacy) and the panel bits this tool adds to the shared PDF
// panel texts. The specs rows state the real behaviour of the engine (src/engine/pdf/): when the font, the size, the
// margin or the formats change there, change them here.
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { NumbersTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<NumbersTexts> = {
  title: 'Add page numbers to PDF: number your pages in your browser',
  description:
    'Add page numbers to PDF files in your browser. Choose the position, the format and the first number. No upload, and forms, links and bookmarks stay in place.',
  h1: 'Add page numbers to PDF',
  howHeading: 'How it works',
  howSteps: [
    'Drop your PDFs on the box, choose them, or paste them with Ctrl V. Add as many as you like.',
    'Pick where the number goes, which format it uses and the number to start from. Oli numbers each file in your browser and redoes the batch if you change a choice.',
    'Download one PDF, or all of them together in a ZIP. Your original files stay untouched.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Add page numbers to PDF takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'PDF files, as many as you like. Oli checks what is inside the file, not its name.'],
      ['Position', 'Six places: top or bottom, and left, center or right. The default is bottom center.'],
      ['Format', 'Four formats: 1, Page 1, Page 1 of 12 and 1 of 12. The word "Page" always comes out in English.'],
      ['First number', 'Any whole number from 1 to 9999. The default is 1.'],
      ['Skip the first page', 'The first page gets no number, and the second page gets the first number you chose. In the "of" formats, the total is the number on the last page.'],
      ['Look of the number', 'Helvetica, 10 pt, black, 28 pt from the edge of the page. It is measured on the page as it appears on screen, with the crop box and the rotation of each page.'],
      ['What stays', 'Form fields, links, bookmarks and the document details stay as they were. Only the XFA form layer, which a few desktop apps read, is removed; the regular form fields still work.'],
      ['Document details', 'The title, the author and the XMP details of your file stay. Oli adds no date, producer or anything from your device.'],
      ['Password or restrictions', 'A PDF that needs a password to open, or has editing restrictions, is turned down on its own line, with a link to Unlock PDF. The other files go on.'],
      ['Damaged files', 'A file with a damaged index is repaired while it is read. A file that is empty, cut short or not a PDF is turned down on its own line.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'How do I add page numbers to a PDF?',
      a: 'Drop the PDF, choose where the number goes and which format it uses, then download the result. Oli writes the numbers on the pages in your browser and gives you a new file, and your original stays as it was.',
    },
    {
      q: 'Can I start numbering from a number other than 1?',
      a: 'Yes. Type any whole number from 1 to 9999 as the first number. To leave a cover page without a number, choose to skip the first page: the second page then gets the first number you chose.',
    },
    {
      q: 'What happens to pages that are rotated or cropped?',
      a: 'Oli places the number by the page as it appears on your screen, using the crop box and the rotation of each page. A turned page still gets its number in the corner you picked, as you see it.',
    },
    {
      q: 'Will the number cover something on my pages?',
      a: 'The number is small black type 28 pt from the edge, which fits inside the margin of most documents. If a page has content right at the edge, the number can overlap it, so look at the result before you send it. A different corner usually clears the way.',
    },
    {
      q: 'Is my PDF uploaded?',
      a: "No. Oli reads and writes the PDF on your device, in your browser, and nothing is sent to a server. Open your browser's Network tab while you work: no request carries your file.",
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your PDFs are numbered on your device and are never sent to a server. The new file keeps the details of the original and gets none from your device.',
  relatedHeading: 'Related tools',
  panel: {
    note: 'PDF files, as many as you like',
    progressLabel: 'Adding page numbers',
    done: 'Done! Oli numbered your pages.',
    doneMany: 'Done! Oli numbered the pages of {count} PDFs.',
    options: {
      positionLegend: 'Position',
      topLeft: 'Top left',
      topCenter: 'Top center',
      topRight: 'Top right',
      bottomLeft: 'Bottom left',
      bottomCenter: 'Bottom center',
      bottomRight: 'Bottom right',
      formatLegend: 'Format',
      n: '1',
      pageN: 'Page 1',
      pageNofTotal: 'Page 1 of 12',
      nOfTotal: '1 of 12',
      startLabel: 'First number',
      startError: 'Type a whole number from 1 to 9999.',
      skipFirst: 'Skip the first page',
    },
  },
};

export default texts;
