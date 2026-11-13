// PDF to JPG page blocks (how, specs, faq, privacy, related) and the panel bits its island shows. The specs rows
// state the real behaviour of the PDF engine (src/engine/pdf/): when it changes there, change them here.
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { ImagesTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<ImagesTexts> = {
  title: 'PDF to JPG: turn PDF pages into images in your browser',
  description:
    'Turn the pages of a PDF into JPG or PNG images at 72, 150 or 300 ppi. It runs in your browser, so nothing is uploaded, and the images carry no Exif or GPS.',
  h1: 'PDF to JPG',
  howHeading: 'How it works',
  howSteps: [
    'Pick JPG or PNG, a resolution, and which pages to convert.',
    'Drop your PDFs on the box, choose them, or paste them.',
    'Oli draws each page as an image, one PDF after another.',
    'Download the images.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What PDF to JPG takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['What it takes', 'PDF files, as many as you like. Oli checks what is inside each file, not its name or its ending.'],
      ['What comes out', 'One image for each page, named after the PDF with -page-1, -page-2 and so on, like report-page-1.jpg.'],
      ['Formats', 'JPG, saved at quality 92, or PNG, saved without loss.'],
      ['Resolution', '72 ppi for the screen, 150 ppi for general use (the default) or 300 ppi for printing.'],
      ['Pages', 'All the pages, or a range such as 1-3, 5, 8-10. The same range applies to every PDF.'],
      ['Many images', 'Several images download together as one ZIP.'],
      ['Very large pages', 'A page that is too big for the browser to draw (over 16.7 megapixels) comes out at a lower resolution, and the result tells you.'],
      ['Metadata', 'The images come out without metadata: no Exif data and no GPS location.'],
      ['PDFs with restrictions', 'A PDF that has only editing restrictions, and no password to open, is drawn all the same. A PDF with a password to open is turned away, with a link to Unlock PDF.'],
      ['Damaged files', 'A file that is empty, cut short or not a PDF is turned away on its own row. A file with a damaged index is repaired while Oli reads it.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Which resolution should I choose?',
      a: 'Match it to where the images go: the lowest for a screen, the highest for print. Each step up makes sharper images, but bigger files that take longer to make: a US Letter page comes out at 612 × 792 pixels at the lowest resolution, 1275 × 1650 at the default and 2550 × 3300 at the highest.',
    },
    {
      q: 'What if one of my PDFs has fewer pages than the range?',
      a: 'Oli makes images of the pages in the range that this PDF has. A PDF with no page in the range at all is left out, and its row tells you.',
    },
    {
      q: 'Should I pick JPG or PNG?',
      a: 'For a PDF of photos, JPG: the PNG files of all its pages add up to several times the size of the JPG files. For a PDF of text and lines, PNG keeps thin lines crisp, and its files add up to between about half and about twice the size of the JPG files, so they can even be the smaller ones. Either way, the text of the page becomes part of the picture and can no longer be selected or searched.',
    },
    {
      q: 'Can I convert a PDF that needs a password to open?',
      a: 'Not as it is. Take the password off in Unlock PDF first, then bring the unlocked copy back here.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your PDFs are drawn on your device and are never sent to a server. The images are made there too.',
  relatedHeading: 'Related tools',
  // F18 (decision 5; DECISOES § 725): the table of the presets of this tool, with their links.
  presets: {
    heading: 'Ready-made settings',
    caption: 'Presets of PDF to JPG and what each one does',
    head: ['Preset', 'What it does'],
  },
  panel: {
    suffix: 'page',
    note: 'PDF files, as many as you like',
    progressLabel: 'Turning pages into images',
    // {count} is the number of images, for one PDF or several (DECISOES § 178).
    done: 'Done! Oli turned your PDF into an image.',
    doneMany: 'Done! Oli turned the pages into {count} images.',
    options: {
      formatLegend: 'Image format',
      jpg: 'JPG',
      png: 'PNG',
      formatHelp: 'JPG files are much smaller on pages with photos (quality 92). PNG loses nothing, so text and thin lines stay crisp.',
      resolutionLegend: 'Resolution',
      low: '72 ppi',
      lowHelp: 'for the screen',
      medium: '150 ppi',
      mediumHelp: 'general use',
      high: '300 ppi',
      highHelp: 'for printing',
      pagesLegend: 'Pages',
      all: 'All pages',
      range: 'Page range',
      rangeLabel: 'Pages to turn into images',
      rangeHelp: 'For example 1-3, 5, 8-10. The same range applies to every PDF.',
      rangeError: 'Type page numbers like 1-3, 5, 8-10, using only pages the PDF has.',
    },
  },
};

export default texts;
