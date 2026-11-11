// PDF to PNG (F18, decisions 5 and 8): a preset of PDF to JPG with PNG fixed. Page blocks (how, specs, faq, privacy,
// related) with at least three of their own (gate:conteudo, MIN_OWN_BLOCKS) and the panel bits of the shared PDF island.
// The specs rows state the real behaviour of the PDF engine (src/engine/pdf/): when it changes there, change them here.
// Every sentence on the size of the files is checked against the matrix (tests/e2e/pdf-matrix.spec.ts, DECISOES § 729).
// The options are PngTexts: no format choice, so no legend and no "JPG"; `png` is the format in the "Adjust" line.
import type { PdfToolTexts } from '../../../../../i18n/types.ts';
import type { PngTexts } from '../../../../pdf/option-texts.ts';

const texts: PdfToolTexts<PngTexts> = {
  title: 'PDF to PNG: turn PDF pages into sharp images in your browser',
  description:
    'Convert the pages of a PDF to PNG images at 72, 150 or 300 ppi, in your browser. PNG keeps text and thin lines sharp. No upload, and no Exif or GPS.',
  h1: 'PDF to PNG',
  howHeading: 'How to convert a PDF to PNG',
  howSteps: [
    'Pick a resolution, and all the pages or a range such as 2-4, 7.',
    'Drop your PDFs on the box, choose them, or paste them. Oli turns each page into a PNG as soon as the file is read.',
    'Download the PNG, or all the images together in a ZIP.',
  ],
  specsHeading: 'What the PNG files are like',
  specs: {
    caption: 'What PDF to PNG takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['What it takes', 'PDF files, as many as you like. Oli reads what is inside each file, not its name.'],
      ['Format', 'Always PNG, which is saved without loss: no quality setting, and no blur around letters and lines.'],
      ['Resolution', '72 ppi for a screen, 150 ppi for most uses (the default) or 300 ppi for printing.'],
      ['Pages', 'Every page, or a range such as 2-4, 7, which applies to each PDF you add.'],
      ['What comes out', 'One PNG for each page, named after the PDF with -page-1, -page-2 and so on, like report-page-1.png. Several images download together in one ZIP.'],
      ['Background', 'Each page is drawn on white, as a PDF reader shows it, so the PNG has no transparent areas.'],
      ['File size', 'On a page with photos, the PNG is several times the size of the JPG of the same page. On a page of text and lines, the two are much closer in size.'],
      ['Very large pages', 'A page over 16.7 megapixels at the chosen resolution is too big for the browser to draw, so it comes out smaller, and the result tells you.'],
      ['Metadata', 'The PNG files carry no metadata: no Exif data and no GPS location.'],
      ['Restricted PDFs', 'A PDF with only editing restrictions is drawn all the same. A PDF with a password to open is turned away, with a link to Unlock PDF.'],
    ],
  },
  faqHeading: 'Questions about PNG',
  faq: [
    {
      q: 'When is PNG better than JPG for a PDF page?',
      a: 'For pages of text, tables, charts and line drawings. PNG is saved without loss, so letters, thin lines and sharp edges stay crisp, with none of the blur JPG can leave around them. For pages that are mostly photos, PDF to JPG gives a smaller file that looks the same.',
    },
    {
      q: 'Are the PNG files bigger than JPG files?',
      a: 'On pages with photos, yes, several times bigger: PNG keeps every detail of the picture, while JPG drops detail the eye hardly sees in order to save space. On pages of text and lines the two come out much closer in size. If a small file matters more than sharp text, use PDF to JPG.',
    },
    {
      q: 'Which resolution should I choose for PNG images?',
      a: 'Use 72 ppi to show the pages on a screen, 150 ppi for most uses and 300 ppi when you plan to print them. Twice the ppi gives four times the pixels, so the files grow quickly at 300 ppi.',
    },
    {
      q: 'Can I still select the text in the PNG?',
      a: 'No. The text of the page becomes part of the picture, so it can no longer be selected, searched or copied. Keep the PDF when you need the text itself.',
    },
    {
      q: 'Is my PDF uploaded to make the PNG files?',
      a: 'No. PDF.js draws each page on your device, inside your browser, and the PNG files are made there too. Nothing is sent to a server, as the Network tab of your browser shows.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote: 'Your PDFs are turned into PNG files on your device and are never sent to a server. The images carry no Exif data or GPS location.',
  relatedHeading: 'Related tools',
  panel: {
    suffix: 'page',
    note: 'PDF files, as many as you like',
    progressLabel: 'Turning pages into PNG images',
    // {count} is the number of images, for one PDF or several (DECISOES § 178).
    done: 'Done! Oli turned your PDF into a PNG image.',
    doneMany: 'Done! Oli turned the pages into {count} PNG images.',
    options: {
      png: 'PNG',
      // One line in Figtree and in its fallback at 320 px (288 px of text), in the three languages: a line that wraps in one
      // font and not in the other moves the options below it when Figtree arrives (layout-shift.spec.ts; DECISOES § 742).
      formatHelp: 'Each page is saved as a lossless PNG.',
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
