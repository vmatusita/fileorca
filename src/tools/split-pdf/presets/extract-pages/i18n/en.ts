// Extract pages from PDF (F18, decisions 5 and 7): a preset of Split PDF in its Pick mode only, with one PDF out. Page
// blocks (how, specs, faq, privacy, related) with at least three of their own (gate:conteudo, MIN_OWN_BLOCKS) and the panel
// bits of the shared PDF island. The specs rows state the real behaviour of the PDF engine (src/engine/pdf/): when it
// changes there, change them here. The options are ExtractTexts: no segment of Split's modes, only the help above the grid
// and the error of the action pressed with no page picked (DECISOES § 728).
import type { PdfToolTexts } from '../../../../../i18n/types.ts';
import type { ExtractTexts } from '../../../../pdf/option-texts.ts';

const texts: PdfToolTexts<ExtractTexts> = {
  title: 'Extract pages from PDF: save the pages you pick in a new PDF',
  description:
    'Extract pages from a PDF in your browser: pick them in a grid of thumbnails or type numbers like 2-4, 7, and get them in one new PDF. Nothing is uploaded.',
  h1: 'Extract pages from PDF',
  howHeading: 'How to extract pages from a PDF',
  howSteps: [
    'Drop one PDF on the box, choose it, or paste it. Oli shows a thumbnail of every page, and the magnifier opens a page large.',
    'Pick the pages you want in the grid, or type their numbers, like 2-4, 7.',
    'Press Extract pages. Oli copies the picked pages into one new PDF, in the order they have in your file.',
    'Download the new PDF, named after your file with -extracted. Your original keeps every page.',
  ],
  specsHeading: 'What the extracted PDF keeps',
  specs: {
    caption: 'What Extract pages from PDF takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['What it takes', 'One PDF at a time. Oli reads what is inside the file, not its name or its ending.'],
      ['Choosing pages', 'Tap pages in the grid of thumbnails, or type numbers and ranges like 2-4, 7 and Oli picks them for you. Pick all, Pick none and Invert selection work on the whole grid.'],
      ['What you get', 'One PDF with the picked pages, in the order they have in your file, named with -extracted. The pages are copied, so your original keeps all of them.'],
      ['Form fields', 'The new PDF keeps the form fields that sit on the extracted pages. The XFA layer, which only Adobe apps read, is removed.'],
      ['Bookmarks and links', 'Bookmarks and links between pages stay when they point to an extracted page. Links to a web address stay too, and links to the pages left behind go away.'],
      ['Document info', 'The new PDF takes the title, author and other metadata of your file. Oli adds no date, no producer name and nothing from your device.'],
      ['Locked PDFs', 'A PDF with a password to open, or with editing restrictions, is turned away with a link to Unlock PDF.'],
      ['Damaged files', 'An empty file, a file cut short or a file that is not a PDF is turned away. A damaged index is repaired while Oli reads the file.'],
    ],
  },
  faqHeading: 'Questions about extracting pages',
  faq: [
    {
      q: 'What is the difference between extracting pages and splitting a PDF?',
      a: 'Extract pages gives one PDF with the pages you pick. Split PDF can also put every page in a file of its own, or cut the PDF into several files by ranges like 1-3, 4-6. To pull a few pages out into one file, Extract pages has fewer steps.',
    },
    {
      q: 'Should I use Delete PDF pages instead?',
      a: 'Use Delete PDF pages when it is quicker to pick the pages that go than the pages that stay: it gives your PDF without the pages you pick. Extract pages works the other way round and gives only the pages you pick.',
    },
    {
      q: 'Can I put the extracted pages in another order?',
      a: 'They come out in the order they have in your file. To change the order, turn a page or take one out as well, open the new PDF in Organize PDF.',
    },
    {
      q: 'Does my original PDF lose the pages I extract?',
      a: 'No. Oli copies the picked pages into a new file and never changes yours, which keeps every page it had.',
    },
    {
      q: 'Is my PDF uploaded to extract the pages?',
      a: 'No. The PDF is read and the new file is written on your device, in your browser, and nothing is sent to a server. Open the Network tab of your browser while you extract pages: no request carries your file.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote: 'The pages you extract are copied on your device, in your browser, and your PDF is never sent to a server.',
  relatedHeading: 'Related tools',
  panel: {
    suffix: 'extracted',
    note: 'one PDF at a time',
    progressLabel: 'Extracting pages',
    done: 'Done! Oli put your pages in a new PDF.',
    doneMany: 'Done! Oli made {count} PDFs from your file.',
    action: 'Extract pages',
    options: {
      pickHelp: 'Pick the pages you want. They go together into one new PDF, in the order of your file.',
      pickNone: 'Pick at least one page first.',
    },
  },
};

export default texts;
