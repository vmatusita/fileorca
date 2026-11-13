import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { CompressPdfTexts } from '../../pdf/option-texts.ts';

// Compress PDF page blocks (how, specs, faq, privacy, related) and the panel bits the shared PDF island shows. The
// specs rows state the real behaviour of the engine (src/engine/pdf/process.ts): when the modes, the JPEG quality or
// the resolutions change there, change them here.
const texts: PdfToolTexts<CompressPdfTexts> = {
  title: 'Compress PDF: make PDF files smaller in your browser',
  description:
    'Make PDF files smaller in your browser, one or a whole batch. Pick lossless, recommended or strong. Nothing is uploaded, and you never get a bigger file.',
  h1: 'Compress PDF',
  howHeading: 'How it works',
  howSteps: [
    'Drop your PDF files on the box, choose them, or paste them.',
    'Pick Lossless, Recommended or Strong. Oli compresses each PDF, one after another, and redoes the batch if you change the level.',
    'Download the compressed PDFs.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Compress PDF takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['Files it takes', 'PDF files, as many as you like. Oli checks what is inside the file, not its name.'],
      [
        'Lossless',
        'qpdf tidies the structure of the file: it packs objects together, compresses the streams again at zlib level 9 and drops leftovers. Nothing you can see changes.',
      ],
      [
        'Recommended',
        'The default. It does what Lossless does, and also saves color and gray JPEG photos again with MozJPEG at quality 75. A photo with more than 150 ppi at its largest size on the page is scaled down to 150 ppi. Other images stay as they are, and a photo is replaced only if the new one is smaller.',
      ],
      [
        'Strong',
        'Every page becomes a JPG picture at 100 ppi. The text can no longer be selected or searched, and form fields, links and bookmarks are lost. Oli says so before you choose it.',
      ],
      ['Already optimized', 'If the result would not be smaller, you get your original back, byte for byte. Oli never gives you a bigger file.'],
      ['Batch', 'No limit on the number of files. Each one gets its own download, and two or more come together in one ZIP. Your original files stay untouched.'],
      [
        'Details kept',
        'In Lossless and Recommended the text, forms, links and bookmarks stay as they are, and so do the info fields and XMP metadata of your PDF. Oli adds no date, no Producer and nothing from your device.',
      ],
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
      q: 'How much smaller will my PDF get?',
      a: 'It depends on what is inside. A PDF full of photos can shrink a lot at Recommended, while a PDF that is mostly text has little to take out. Oli shows the size before and after for each file, so you see the real saving, and on a PDF of photos Strong is the level that goes furthest.',
    },
    {
      q: 'Does compressing reduce the quality of my PDF?',
      a: 'Not at Lossless. At Recommended, a photo saved again can lose a little fine detail, while the text stays sharp and selectable. At Strong, small print looks softer when you zoom in, because it has become part of a picture.',
    },
    {
      q: 'Can I compress a PDF that has a password?',
      a: 'Not as it is. Take the password off in Unlock PDF, compress the unlocked copy here, then put a password back on with Protect PDF.',
    },
    {
      q: 'Why did my PDF come back the same size?',
      a: 'Some PDFs are already well packed. Strong does not always help either: on a page of text, a picture of the page can weigh more than the text it replaces.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote: 'PDFs are compressed on your device, in your browser, and are never sent to a server.',
  relatedHeading: 'Related tools',
  panel: {
    suffix: 'compressed',
    note: 'PDF files, as many as you like',
    progressLabel: 'Compressing PDFs',
    done: 'Done! Oli made it {percent} lighter.',
    doneMany: 'Done! Oli made your {count} PDFs {percent} lighter.',
    placardLabel: 'lighter',
    options: {
      legend: 'Compression',
      lossless: 'Lossless',
      losslessHelp: 'no visible change',
      recommended: 'Recommended',
      recommendedHelp: 'smaller photos',
      strong: 'Strong',
      strongHelp: 'smallest file',
      strongWarning: 'Strong turns every page into a picture. The text can no longer be selected or searched, and form fields, links and bookmarks are lost.',
    },
  },
};

export default texts;
