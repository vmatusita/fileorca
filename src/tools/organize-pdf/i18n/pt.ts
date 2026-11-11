// F18 placeholder: front T writes the pt text
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { OrganizeTexts } from '../../pdf/option-texts.ts';

// Organize PDF page blocks (data-content: how, specs, faq, privacy, related) and the panel bits the shared PDF island shows
// (F18, decision 6). The new PDF is built the way Delete PDF pages builds it (the engine's assemble.ts, DECISOES § 145), so
// the rows on forms, bookmarks and links follow that tool's. The specs rows state the real behaviour of the engine: when it
// changes there, change them here. Front O wrote the option texts (OrganizeTexts) in pt.
const texts: PdfToolTexts<OrganizeTexts> = {
  title: 'Organize PDF: move, rotate and remove pages in your browser',
  description:
    'Move, rotate and remove the pages of a PDF in one grid of thumbnails, then save one new PDF. It all happens in your browser, and nothing is uploaded.',
  h1: 'Organize PDF',
  howHeading: 'How it works',
  howSteps: [
    'Drop a PDF on the box, choose one, or paste it. Oli works on one PDF at a time and shows a thumbnail of every page; the magnifier on a page opens it large.',
    'Pick pages by tapping them or by typing numbers like 1-3, 5, then use the bar above the grid to turn them right or left, or to take them out of the new PDF.',
    'Move a page with the arrows on it, or drag it with the mouse. A page you took out stays in the grid, faded, until you put it back.',
    'Press Save changes, then download the new PDF. Your original file stays untouched.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Organize PDF takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['Files', 'One PDF at a time. Oli checks that it is a PDF from what is inside the file, not from its name.'],
      ['The grid', 'Oli draws a thumbnail of every page with PDF.js. The magnifier on a page opens it large, where Previous and Next follow the order you set.'],
      ['Picking pages', 'Tap pages to pick them, use Pick all, Pick none or Invert selection, or type page numbers and ranges like 1-3, 5.'],
      ['Turning pages', 'Rotate right and Rotate left turn the picked pages a quarter turn each time, on top of the turn they already have.'],
      ['Taking pages out', 'Remove takes the picked pages out of the new PDF. They stay in the grid, faded, and Put back brings them in again. At least one page has to stay.'],
      ['Moving pages', 'The arrows on each page move it one place earlier or later, and the mouse can drag it to its new place.'],
      ['The new file', 'Oli copies the pages you keep into a new PDF, in your order and with your turns, the way Delete PDF pages does. What only the removed pages used is left out.'],
      ['Forms', 'Form fields on the pages you keep stay. An XFA form layer, which only Adobe apps read, is removed; the regular form fields still work.'],
      ['Bookmarks and links', 'Bookmarks and links between pages stay when they point to a page you keep, and they still lead to that page in its new place. Links to the web stay. Links to a page you took out are removed.'],
      ['Details kept', 'The new PDF keeps the info fields and XMP metadata of your file. Oli adds no date, no Producer and nothing from your device.'],
      ['Files it refuses', 'A PDF that needs a password to open, or that has editing restrictions, is refused with a link to Unlock PDF. An empty or cut-short file, or one that is not a PDF, is refused too. A file with a damaged index (xref) is repaired while Oli reads it.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'What is the difference between Organize PDF and Reorder PDF pages?',
      a: 'Reorder PDF pages changes only the order of the pages. Organize PDF changes the order, turns pages and takes pages out in the same grid, and saves all of it in one new PDF, so a file that needs the three fixes goes through one tool instead of three.',
    },
    {
      q: 'When should I use Delete PDF pages or Rotate PDF instead?',
      a: 'Use Delete PDF pages when you only need to take pages out, and Rotate PDF when you only need to turn pages, or to turn the pages of several PDFs at once. Organize PDF works on one PDF at a time and suits a file that needs more than one of these fixes.',
    },
    {
      q: 'Can I undo a change before I save?',
      a: 'Yes. A page you took out stays in the grid, faded: pick it and press Put back. A turn goes back with a turn the other way, and a page you moved goes back with the arrows. After the result the grid stays on screen, and any change brings the button back to save another PDF. Your original file is never changed.',
    },
    {
      q: 'Will forms, links and bookmarks still work?',
      a: 'On the pages you keep, yes. Form fields stay, bookmarks and links between pages still lead to the same pages in their new place, and links to the web stay. A link to a page you took out is removed, because that page is no longer in the file.',
    },
    {
      q: 'Is my PDF uploaded?',
      a: "No. FileOrca reads and writes your PDF on your device, in your browser, and PDF.js draws the thumbnails there too. Open your browser's Network tab while you organize the pages: no request carries your files.",
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote: 'Your PDF is read and rebuilt on your device, in your browser, and is never sent to a server. The thumbnails and the large view of a page are drawn there too.',
  relatedHeading: 'Related tools',
  panel: {
    suffix: 'organized',
    note: 'one PDF at a time',
    progressLabel: 'Organizing pages',
    done: 'Done! Oli saved your pages in a new PDF.',
    doneMany: 'Done! Oli organized the pages of {count} PDFs.',
    action: 'Save changes',
    options: {
      help: 'Marque páginas para girar ou tirar, e mova uma página com as setas dela.',
      unchanged: 'Mova, gire ou tire uma página para salvar um PDF novo.',
      allOut: 'Um PDF precisa de pelo menos uma página: devolva uma.',
    },
  },
};

export default texts;
