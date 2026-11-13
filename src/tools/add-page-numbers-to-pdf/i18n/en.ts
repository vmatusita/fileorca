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
    'Drop your PDFs on the box, choose them, or paste them with Ctrl V.',
    'Pick where the number goes, which format it uses and the number to start from. Oli numbers each file and redoes the batch if you change a choice.',
    'Download the numbered PDFs.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Add page numbers to PDF takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'PDF files, as many as you like. Oli checks what is inside the file, not its name. Two or more come back together in one ZIP, and your original files stay untouched.'],
      ['Position', 'Six places: top or bottom, and left, center or right. The default is bottom center.'],
      ['Format', 'Four formats: 1, Page 1, Page 1 of 12 and 1 of 12. The word "Page" always comes out in English.'],
      ['First number', 'Any whole number from 1 to 9999. The default is 1.'],
      ['Skip the first page', 'The first page gets no number, and the second page gets the first number you chose. In the "of" formats, the total is the number on the last page.'],
      ['Look of the number', 'Helvetica, 10 pt, black, 28 pt from the edge of the page.'],
      ['What stays', 'Form fields, links, bookmarks and the document details stay as they were. Only the XFA form layer, which a few desktop apps read, is removed; the regular form fields still work.'],
      ['Document details', 'The title, the author and the XMP details of your file stay. Oli adds no date, producer or anything from your device.'],
      ['Password or restrictions', 'A PDF that needs a password to open, or has editing restrictions, is turned down on its own line, with a link to Unlock PDF. The other files go on.'],
      ['Damaged files', 'A file with a damaged index is repaired while it is read. A file that is empty, cut short or not a PDF is turned down on its own line.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Can I number only some of the pages?',
      a: 'Only the first page can be left without a number. To number just a part of a file, take that part out with Split PDF, number it here, then join the parts again with Merge PDF.',
    },
    {
      q: 'Can the numbers go on from another file?',
      a: 'Yes, through the first number. If part one has 30 pages, give part two the first number 31, and its pages show 31, 32 and so on.',
    },
    {
      q: 'What happens to pages that are rotated or cropped?',
      a: 'Oli places the number by the page as it appears on your screen, using the crop box and the rotation of each page. A turned page still gets its number in the corner you picked, as you see it.',
    },
    {
      q: 'Will the number cover something on my pages?',
      a: 'It can, when a page has content right at the edge: the number sits in the margin, where most documents leave room. Look at the result before you send it; a different corner usually clears the way.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote: 'Your PDFs are numbered on your device and are never sent to a server.',
  relatedHeading: 'Related tools',
  panel: {
    suffix: 'numbered',
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
      pageWord: 'Page',
      ofWord: 'of',
      startLabel: 'First number',
      startError: 'Type a whole number from 1 to 9999.',
      firstLegend: 'First page',
      numberIt: 'Number it',
      skipIt: 'Skip it',
    },
  },
};

export default texts;
