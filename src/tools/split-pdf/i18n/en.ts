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
    'Pick how to split it: every page in its own file, page ranges you type, or the pages you pick in the grid of thumbnails, where the magnifier opens each page large.',
    'Press Split PDF, and Oli cuts the file.',
    'Download the result.',
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
      q: 'Can my ranges overlap, or run past the last page?',
      a: 'They can overlap, because each range makes its own file: 1-3 and 2-4 give two files that both have pages 2 and 3. A range has to go from the lower page to the higher one and stay within the pages the PDF has; if it does not, the field asks you to fix it.',
    },
    {
      q: 'Can I take just a few pages out into one new PDF?',
      a: 'Yes, with Pick pages here, or with Extract pages from PDF, which does only that. Either way the pages come out in the order they have in your file, whatever order you tap them in.',
    },
    {
      q: 'Will each part be smaller than my PDF?',
      a: 'Usually. A part carries only its own pages and what they use, such as their images. A font that many pages share goes into every part that needs it, so all the parts together can weigh more than your PDF.',
    },
    {
      q: 'Do hidden layers stay hidden in the parts?',
      a: 'Yes. Each part keeps the layers its pages use, each one on or off as your PDF had it, so a layer the author hid stays hidden.',
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
