import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { RotatePdfTexts } from '../../pdf/option-texts.ts';

// Rotate PDF page blocks (how, specs, faq, privacy, related) and the panel bits the shared PDF island shows. The
// specs rows state the real behaviour of the engine (src/engine/pdf/operations.ts): only /Rotate changes.
const texts: PdfToolTexts<RotatePdfTexts> = {
  title: 'Rotate PDF: turn PDF pages 90° or 180° in your browser',
  description:
    'Turn every page of a PDF, or single pages, 90° right, 90° left or 180°, right in your browser. Nothing is redrawn or uploaded, so the quality stays the same.',
  h1: 'Rotate PDF',
  howHeading: 'How it works',
  howSteps: [
    'Drop your PDF files on the box, choose them, or paste them. Add as many as you like.',
    'Pick a turn: 90° right, 180° or 90° left. With one file you can also turn page by page, using the button on each thumbnail; the magnifier opens a page large.',
    'Download the turned PDF, or all of them together in a ZIP. Your original files stay untouched.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Rotate PDF takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['Files it takes', 'PDF files, as many as you like. Oli checks what is inside the file, not its name.'],
      ['Turns', '90° to the right (the default), 180° or 90° to the left.'],
      ['No loss', 'Only the rotation setting of each page changes. Nothing is redrawn, so text, images and quality stay exactly as they were.'],
      ['All pages', 'Every page of the file is turned the same way. In a batch, this is what happens to each file.'],
      ['Page by page', 'With one file, the grid shows every page, and a button on each thumbnail turns just that page.'],
      ['Batch', 'No limit on the number of files. Each one gets its own download, and two or more come together in one ZIP.'],
      [
        'Details kept',
        'Forms, links, bookmarks and the info fields and XMP metadata of your PDF stay. Oli adds no date, no Producer and nothing from your device.',
      ],
      ['Form layer', 'An XFA form layer, which only Adobe apps read, is removed. The regular form fields still work.'],
      [
        'Passwords and restrictions',
        'A PDF that needs a password to open, or that has editing restrictions, is refused on its own line, with a link to Unlock PDF. The other files carry on.',
      ],
      [
        'Damaged files',
        'A file that is empty, cut short or not a PDF is refused on its own line. A file with a damaged index (xref) is repaired while Oli reads it.',
      ],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Does rotating a PDF reduce its quality?',
      a: 'No. Oli changes only the rotation setting of each page. Nothing is redrawn or compressed again, so text stays sharp and selectable, and images keep every pixel.',
    },
    {
      q: 'Can I rotate just one page?',
      a: 'Yes, when you work on one PDF. Choose Page by page, and each thumbnail gets a button that turns that page. With several files at once, Oli turns every page of each file, so do single pages one file at a time.',
    },
    {
      q: 'Will forms, links and bookmarks still work?',
      a: 'Yes. They stay in the file, and so does the metadata. The one thing Oli takes out is an XFA form layer, which only Adobe apps read; the regular form fields keep working.',
    },
    {
      q: 'Why was my PDF refused?',
      a: 'A PDF that needs a password to open, or that has editing restrictions, is refused with a link to Unlock PDF. An empty or cut-short file, or one that is not a PDF, is refused too. The other files in the batch carry on.',
    },
    {
      q: 'Is my PDF uploaded?',
      a: "No. FileOrca reads and writes your PDF on your device, in your browser, and PDF.js draws the page thumbnails there too. Open your browser's Network tab while you rotate: no request carries your files.",
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote: 'PDFs are rotated on your device, in your browser, and are never sent to a server. Your original files stay untouched.',
  relatedHeading: 'Related tools',
  panel: {
    suffix: 'rotated',
    note: 'PDF files, as many as you like',
    progressLabel: 'Rotating PDFs',
    done: 'Done! Oli turned the {pages} pages of your PDF {turn}.',
    doneMany: 'Done! Oli turned your {count} PDFs {turn}.',
    options: {
      turnLegend: 'Turn',
      right: '90° right',
      half: '180°',
      left: '90° left',
      scopeLegend: 'Pages',
      all: 'All pages',
      pick: 'Page by page',
      pickHelp: 'Use the turn button on a thumbnail to turn that page.',
      batchNote: 'Page by page works on one file. With several files, Oli turns every page of each one.',
      doneOne: 'Done! Oli turned the page of your PDF {turn}.',
      donePicked: 'Done! Oli turned {count} of the {pages} pages.',
      rightTurn: '90° to the right',
      halfTurn: '180°',
      leftTurn: '90° to the left',
    },
  },
};

export default texts;
