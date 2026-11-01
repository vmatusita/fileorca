import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { DeleteTexts } from '../../pdf/option-texts.ts';

// Delete PDF pages page blocks (how, specs, faq, privacy, related) and the panel bits the shared PDF island shows.
// The specs rows state the real behaviour of the engine (src/engine/pdf/process.ts): the pages you keep are copied
// into a new document.
const texts: PdfToolTexts<DeleteTexts> = {
  title: 'Delete PDF pages: remove pages from a PDF in your browser',
  description:
    'Remove pages from a PDF in your browser. Pick them in a grid of thumbnails or type numbers like 1-3, 5. Nothing is uploaded, and your original file stays.',
  h1: 'Delete PDF pages',
  howHeading: 'How it works',
  howSteps: [
    'Drop a PDF on the box, choose one, or paste it.',
    'Pick the pages to delete in the grid of thumbnails, or type their numbers, like 1-3, 5.',
    'Press Delete pages. Oli makes a new PDF with the pages that are left.',
    'Download the new PDF. Your original file stays untouched.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Delete PDF pages takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['Files it takes', 'One PDF at a time. Oli checks what is inside the file, not its name.'],
      ['Picking pages', 'Pick pages in the grid of thumbnails, or type page numbers and ranges like 1-3, 5.'],
      ['Every page', 'Deleting all the pages is not possible: a PDF needs at least one page, so one page has to stay unpicked.'],
      [
        'The new file',
        'Oli copies the pages you keep into a new PDF. The deleted pages, and what only they used, are left out, so the file gets smaller.',
      ],
      ['Forms', 'Form fields on the remaining pages stay. An XFA form layer, which only Adobe apps read, is removed; the regular form fields still work.'],
      [
        'Bookmarks and links',
        'Bookmarks that point to the remaining pages stay, and so do links between those pages. Links to the web stay. Links to a deleted page are removed.',
      ],
      [
        'Details kept',
        'The new PDF keeps the info fields and XMP metadata of your file. Oli adds no date, no Producer and nothing from your device.',
      ],
      [
        'Files it refuses',
        'A PDF that needs a password to open, or that has editing restrictions, is refused with a link to Unlock PDF. An empty or cut-short file, or one that is not a PDF, is refused too. A file with a damaged index (xref) is repaired while Oli reads it.',
      ],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Can I delete several pages at once, like pages 2 to 5?',
      a: 'Yes. Pick the thumbnails in the grid, or type the numbers in the field below it, like 2-5 or 1-3, 7. Oli picks them for you, and you can still add or remove single pages before you press Delete pages.',
    },
    {
      q: 'Can I undo it if I delete the wrong pages?',
      a: 'Your original file is never changed, because Oli writes a new PDF. If the new one is not what you wanted, press Start over, choose the original again and pick other pages.',
    },
    {
      q: 'Will forms, links and bookmarks survive?',
      a: 'Yes, on the remaining pages. Form fields stay, bookmarks that point to kept pages stay, and so do links to the web and links between kept pages. Links to a page you deleted are removed, because there is nowhere left for them to go.',
    },
    {
      q: 'Why is the new PDF smaller?',
      a: 'The deleted pages leave the file, and so does whatever only they used, such as their own images. Anything a page you keep also uses stays, so the saving depends on how heavy the deleted pages were.',
    },
    {
      q: 'Is my PDF uploaded?',
      a: "No. FileOrca reads and writes your PDF on your device, in your browser, and PDF.js draws the page thumbnails there too. Open your browser's Network tab while you delete pages: no request carries your files.",
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote: 'Your PDF is read and rewritten on your device, in your browser, and is never sent to a server. Your original file stays untouched.',
  relatedHeading: 'Related tools',
  panel: {
    note: 'one PDF at a time',
    progressLabel: 'Deleting pages',
    done: 'Done! The pages are gone.',
    doneMany: 'Done! The pages are gone from {count} files.',
    action: 'Delete pages',
    options: {
      help: 'Pick the pages to delete in the grid, or type their numbers in the field below.',
      actionCount: 'Delete {count} pages',
      actionOne: 'Delete 1 page',
      allPicked: 'A PDF needs at least one page: leave one unpicked.',
      nonePicked: 'Pick at least one page to delete.',
    },
  },
};

export default texts;
