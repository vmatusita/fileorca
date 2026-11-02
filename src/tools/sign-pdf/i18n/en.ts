// Sign PDF page blocks (how, specs, faq, privacy) and the panel bits this tool adds to the shared PDF panel texts. The
// signature goes on the page as an image, never as a digital signature: the notice and the FAQ say so, and they give no
// legal advice. The specs rows state the real behaviour of the engine (src/engine/pdf/).
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { SignTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<SignTexts> = {
  title: 'Sign PDF: add your signature to a PDF in your browser',
  description:
    'Sign a PDF in your browser: draw, upload or type your signature and place it on the page. Nothing is uploaded, and your signature is not saved anywhere.',
  h1: 'Sign PDF',
  howHeading: 'How it works',
  howSteps: [
    'Drop your PDF on the box or choose it. Oli works on one PDF at a time here.',
    'Draw your signature, upload an image of it or type your name, then drag the box to the spot where it should go.',
    'Pick the pages that get it and press Sign PDF. Oli draws the signature on them in your browser.',
    'Download your PDF. Your original file stays untouched.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Sign PDF takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'One PDF at a time. Oli checks what is inside the file, not its name. A second file asks you to start over.'],
      ['Drawn signature', 'Draw it on the box with your finger, a pen or the mouse.'],
      ['Image of a signature', 'A PNG or JPG that you choose. Oli saves it again without its metadata before it goes on the page.'],
      ['Typed name', 'Oli draws your name as an image, with the font of the site.'],
      ['Pages', 'This page, all pages or only the pages you pick.'],
      ['Position', 'Drag the box on the preview, move it with the arrow keys (+ and − change its size), or type the X, Y and width in percent. The position follows each page as it appears on screen, with its crop box and rotation.'],
      ['How it goes in', 'The signature is drawn on the page as an image. It is not a form field and not a digital signature.'],
      ['What stays', 'Form fields, links, bookmarks and the document details stay as they were. Only the XFA form layer, which a few desktop apps read, is removed; the regular form fields still work.'],
      ['Your signature', 'It is not saved anywhere and it does not leave your device.'],
      ['Password or restrictions', 'A PDF that needs a password to open, or has editing restrictions, is turned down with a link to Unlock PDF.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Is this a digital signature?',
      a: 'No. Sign PDF puts an image of your signature on the page, like a stamp. It is not a digital signature with a certificate, and it does not prove who signed or whether the file changed afterward. FileOrca gives no legal advice: where a signature with a certificate is required, use a service built for that.',
    },
    {
      q: 'How do I sign a PDF without printing it?',
      a: 'Draw your signature, upload an image of it or type your name, then drag the box to the spot on the preview where it should go. Pick the pages and press Sign PDF. Oli draws the signature on the page and gives you a new PDF to download.',
    },
    {
      q: 'Can I put my signature on every page?',
      a: 'Yes. Under Pages, choose All pages to repeat it in the same spot, or Pick pages to choose which ones get it. The position follows each page as it appears on screen, so a rotated page still gets the signature where you see it.',
    },
    {
      q: 'Is my signature saved anywhere?',
      a: 'No. Your drawing, image or typed name is used to sign this one PDF and is not saved or sent anywhere. Nothing is kept for next time, so you add your signature again on the next file.',
    },
    {
      q: 'Is my PDF uploaded?',
      a: 'No. Oli reads the PDF, shows the preview with PDF.js and writes the signed copy on your device, in your browser. Nothing is sent to a server, and your signature stays on your device too.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your PDF is signed on your device and is never sent to a server. Your signature is not saved anywhere.',
  relatedHeading: 'Related tools',
  panel: {
    suffix: 'signed',
    note: 'one PDF at a time',
    progressLabel: 'Signing your PDF',
    done: 'Done! Oli placed your signature on the PDF.',
    doneMany: 'Done! Oli placed your signature on the PDF.',
    action: 'Sign PDF',
    options: {
      modeLegend: 'Signature',
      draw: 'Draw',
      upload: 'Upload',
      type: 'Type',
      drawLabel: 'Draw your signature',
      drawHelp: 'Use your finger, a pen or the mouse.',
      clear: 'Clear',
      uploadLabel: 'Choose a signature image',
      uploadHelp: 'A PNG or JPG. Oli saves it again without its metadata.',
      uploadError: 'Oli can only use a PNG or JPG here. Choose another image.',
      typeLabel: 'Type your name',
      typeHelp: 'Oli draws it as an image, with the font of the site.',
      missing: 'Draw, upload or type your signature first.',
      placeLegend: 'Position',
      boxLabel: 'Signature position',
      boxValue: '{x}% from the left, {y}% from the top, {width}% wide',
      keyboardHelp: 'Drag the box on the preview. With the keyboard, the arrow keys move it, + makes it bigger and − makes it smaller.',
      x: 'From the left',
      y: 'From the top',
      width: 'Width',
      pct: '%',
      invalid: 'Type a percent that keeps the whole box on the page.',
      pagesLegend: 'Pages',
      thisPage: 'This page',
      allPages: 'All pages',
      pickPages: 'Pick pages',
      previewLabel: 'Page preview',
      previewPage: 'Page {n} of {total}',
      notice:
        'This puts an image of your signature on the page. It is not a digital signature with a certificate, and FileOrca gives no legal advice. Where a signature with a certificate is required, use a service built for that.',
    },
  },
};

export default texts;
