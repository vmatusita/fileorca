// Split PDF page blocks (how, specs, faq, privacy, related) and the panel bits its island shows. The specs rows
// state the real behaviour of the PDF engine (src/engine/pdf/): when it changes there, change them here.
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { SplitTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<SplitTexts> = {
  title: 'Split PDF: separate pages or ranges in your browser',
  description:
    'Split a PDF into single pages, page ranges or the pages you pick. It runs in your browser, so nothing is uploaded, and forms and bookmarks are kept.',
  h1: 'Split PDF',
  howHeading: 'How it works',
  howSteps: [
    'Drop one PDF on the box, choose it, or paste it.',
    'Pick how to split it: every page in its own file, page ranges like 1-3, 5, 8-10, or the pages you pick in the grid of thumbnails, where the magnifier opens each page large.',
    'Press Split PDF. Oli cuts the file in your browser.',
    'Download the result. One file downloads on its own, and several files come together in a ZIP.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Split PDF takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['What it takes', 'One PDF at a time. Oli checks what is inside the file, not its name or its ending.'],
      ['Every page', 'Each page becomes its own PDF, named after your file with -page-1, -page-2 and so on.'],
      ['Page ranges', 'Type ranges like 1-3, 5, 8-10 and each range becomes one PDF. They are named -part-1, -part-2 in the order you typed them, whatever the page numbers are.'],
      ['Picked pages', 'Pick pages in the grid of thumbnails and they go together into one PDF, named with -selected.'],
      ['What you download', 'One file downloads on its own. Several files come together in one ZIP.'],
      ['Form fields', 'Each part keeps the form fields that sit on its own pages. The XFA layer, which only Adobe apps read, is removed.'],
      ['Bookmarks and links', 'Each part keeps the bookmarks and the links between pages that point to its own pages. Links to a web address stay, and links to pages left out of that part go away.'],
      ['Document info', 'Each part takes the title, author and other metadata of your PDF. Oli adds no date, no producer name and nothing from your device.'],
      ['PDFs with a password', 'A PDF with a password to open, or with editing restrictions, is turned away with a link to Unlock PDF.'],
      ['Damaged files', 'A file that is empty, cut short or not a PDF is turned away. A file with a damaged index is repaired while Oli reads it.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'How do I split a PDF into single pages?',
      a: 'Choose Every page and press Split PDF. Oli saves each page as its own PDF, named after your file with -page-1, -page-2 and so on, and the files come together in a ZIP.',
    },
    {
      q: 'How do I split a PDF by page numbers?',
      a: 'Choose Page ranges and type them like 1-3, 5, 8-10. You get one PDF for each range: here, pages 1 to 3, then page 5, then pages 8 to 10. The files are named -part-1, -part-2 and -part-3 in the order you typed the ranges.',
    },
    {
      q: 'Can I take just a few pages out into one new PDF?',
      a: 'Yes. Choose Pick pages, pick the pages you want in the grid of thumbnails, and Oli puts them together into one PDF named with -selected. The pages keep the order they have in the original.',
    },
    {
      q: 'Do forms and bookmarks survive the split?',
      a: 'Each part keeps the form fields, the bookmarks and the links between pages that belong to its own pages. A link to a page that went into another part has nowhere to go, so it is dropped. Links to the web stay.',
    },
    {
      q: 'Is my PDF uploaded?',
      a: 'No. The PDF is read and written on your device, inside your browser, and nothing is sent to a server. Open the Network tab of your browser while you split: no request carries your file.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your PDF is read and cut on your device and is never sent to a server. Every part is made in your browser too.',
  relatedHeading: 'Related tools',
  // F18 (decision 5; DECISOES § 725): the table of the presets of this tool, with their links.
  presets: {
    heading: 'Ready-made settings',
    caption: 'Presets of Split PDF and what each one does',
    head: ['Preset', 'What it does'],
  },
  panel: {
    suffix: 'split',
    note: 'one PDF at a time',
    progressLabel: 'Splitting the PDF',
    done: 'Done! Oli cut your PDF.',
    doneMany: 'Done! Oli made {count} PDFs from your file.',
    action: 'Split PDF',
    options: {
      legend: 'Split by',
      each: 'Every page',
      ranges: 'Page ranges',
      pick: 'Pick pages',
      rangesLabel: 'Pages for each file',
      rangesHelp: 'One file for each range, for example 1-3, 5, 8-10',
      rangesError: 'Type page numbers like 1-3, 5, 8-10, using only pages the PDF has.',
      pickHelp: 'Pick the pages you want. They go together into one new PDF.',
      pickNone: 'Pick at least one page first.',
    },
  },
};

export default texts;
