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
    'Pick JPG or PNG, a resolution, and all the pages or a range such as 1-3, 5, 8-10.',
    'Drop your PDFs on the box, choose them, or paste them. Add as many as you like.',
    'Oli draws each page as an image in your browser, one PDF after another.',
    'Download one image, or all of them together in a ZIP.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What PDF to JPG takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['What it takes', 'PDF files, as many as you like. Oli checks what is inside each file, not its name or its ending.'],
      ['What comes out', 'One image for each page, named after the PDF with -page-1, -page-2 and so on, like report-page-1.jpg.'],
      ['Formats', 'JPG at quality 92, or PNG. JPG files are smaller, and PNG keeps text and sharp lines crisp.'],
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
      a: 'Use 72 ppi to look at the pages on a screen, 150 ppi for general use, and 300 ppi when you plan to print them. A higher resolution makes sharper images, but larger files that take longer to make. A very large page, over 16.7 megapixels, is drawn at a lower resolution because the browser cannot draw it bigger, and the result says so.',
    },
    {
      q: 'Can I convert only some pages?',
      a: 'Yes. Choose Page range and type the pages, like 1-3, 5, 8-10. Oli makes images only for those pages. When you add several PDFs, the same range applies to each of them.',
    },
    {
      q: 'Should I pick JPG or PNG?',
      a: 'JPG, saved at quality 92, gives smaller files and suits pages with photos. PNG loses nothing, so the text and thin lines of a page stay crisp, but the files are larger. In both cases the text of the page becomes part of the picture, so it can no longer be selected or searched.',
    },
    {
      q: 'Can I convert a PDF that has editing restrictions or a password?',
      a: 'A PDF that has only editing restrictions is drawn as it appears on screen. A PDF that needs a password to open is turned away with a link to Unlock PDF, where you can remove the password first and then bring the result back here.',
    },
    {
      q: 'Is my PDF uploaded?',
      a: 'No. PDF.js draws the pages on your device, inside your browser, and the images are made there too. Nothing is sent to a server. Open the Network tab of your browser while you convert: no request carries your files.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your PDFs are drawn on your device and are never sent to a server. The images come out without Exif data or GPS location.',
  relatedHeading: 'Related tools',
  panel: {
    note: 'PDF files, as many as you like',
    progressLabel: 'Turning pages into images',
    done: 'Done! Oli turned your PDF into images.',
    doneMany: 'Done! Oli turned your {count} PDFs into images.',
    options: {
      formatLegend: 'Image format',
      jpg: 'JPG',
      png: 'PNG',
      formatHelp: 'JPG files are smaller (quality 92). PNG loses nothing, so text and thin lines stay crisp, but the files are larger.',
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
