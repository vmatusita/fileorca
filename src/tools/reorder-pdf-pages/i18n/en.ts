import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { ReorderTexts } from '../../pdf/option-texts.ts';

// Reorder PDF pages page blocks (data-content: how, specs, faq, privacy, related) and the panel bits the shared PDF
// island shows. The specs rows state the real behaviour of the engine (src/engine/pdf/): when it changes there, change them here.
const texts: PdfToolTexts<ReorderTexts> = {
  title: 'Reorder PDF pages: drag pages into a new order in your browser',
  description:
    'Rearrange the pages of a PDF by dragging thumbnails, using the arrows or the keyboard. It all happens in your browser, and nothing is uploaded.',
  h1: 'Reorder PDF pages',
  howHeading: 'How it works',
  howSteps: [
    'Drop a PDF on the box, choose one, or paste it. Oli works on one PDF at a time and shows a thumbnail of every page.',
    'Drag a page to its new place, use the arrows on each page, or use the keyboard: Space picks a page up, the arrow keys move it, Space drops it. Reverse order flips the whole PDF.',
    'Press Save new order, then download the new PDF. Your original file stays untouched.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Reorder PDF pages takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['Files', 'One PDF at a time. Oli checks that it is a PDF from what is inside the file, not from its name.'],
      ['Thumbnails', 'Oli draws a small picture of every page with PDF.js, so you can see what you are moving.'],
      ['Moving pages', 'Drag a page to its new place, or use the buttons on each page to move it one place earlier or later.'],
      ['Keyboard', 'The arrow keys move between pages. Space picks a page up, the arrow keys move it, and Space drops it.'],
      ['Reverse order', 'One button puts the last page first and the first page last.'],
      ['What changes', 'Only the order of the pages. The pages themselves, their links, bookmarks and form fields stay the same.'],
      ['What stays', 'Document properties and metadata stay as they were, and Oli adds no date or device information. Only the XFA form layer, which most PDF apps cannot read, is removed; the regular form fields keep working.'],
      ['Protected or damaged PDFs', 'A PDF with a password to open, or with restrictions, is refused with a link to Unlock PDF. A damaged index is repaired while the pages are read.'],
      ['What you get', 'A new PDF with the pages in your order. Your original file is not changed.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'How do I change the order of pages in a PDF?',
      a: 'Drop the PDF, then drag each page to where you want it, or use the arrows on the page. When the order looks right, press Save new order and download the new file. Reverse order flips the whole document in one press.',
    },
    {
      q: 'Can I move pages with the keyboard?',
      a: 'Yes. Use the arrow keys to move between pages, press Space to pick one up, use the arrow keys to move it, then press Space to drop it. The buttons on each page work with the keyboard too.',
    },
    {
      q: 'Will links, bookmarks and form fields still work?',
      a: 'Yes. Reordering changes only the order of the pages, so links and bookmarks still lead to the same pages and form fields keep their place on them. Page numbers already printed on the pages stay where they are, so they may no longer be in order.',
    },
    {
      q: 'Is my PDF uploaded?',
      a: "No. Oli reads and writes the PDF on your device, in your browser. PDF.js draws the thumbnails and the new file is built right there. Open your browser's Network tab while you use the tool: no request carries your files.",
    },
    {
      q: 'Can I reorder a PDF that has a password?',
      a: 'Not directly. A PDF that needs a password to open, or that has restrictions, is refused with a link to Unlock PDF. Take the protection off there first, then come back and reorder the pages.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your PDF is read and written on your device, in your browser, and is never sent to a server. The thumbnails are drawn there too.',
  relatedHeading: 'Related tools',
  panel: {
    suffix: 'reordered',
    note: 'one PDF at a time',
    progressLabel: 'Reordering pages',
    done: 'Done! Oli put your pages in the new order.',
    doneMany: 'Done! Oli put the pages of {count} PDFs in the new order.',
    action: 'Save new order',
    options: {
      help: 'Drag a page to its new place, or use the arrows on each page.',
      reverse: 'Reverse order',
      unchanged: 'Move a page to save a new order.',
    },
  },
};

export default texts;
