import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { WatermarkTexts } from '../../pdf/option-texts.ts';

// Watermark PDF page blocks (data-content: how, specs, faq, privacy, related) and the panel bits the shared PDF island
// shows. The specs rows state the real behaviour of the engine (src/engine/pdf/operations.ts): when the sizes, the
// opacities or the font change there, change them here.
const texts: PdfToolTexts<WatermarkTexts> = {
  title: 'Watermark PDF: add a text watermark in your browser',
  description:
    'Stamp a text watermark such as CONFIDENTIAL across every page of your PDFs. Pick the size, opacity and direction. Nothing leaves your device.',
  h1: 'Watermark PDF',
  howHeading: 'How it works',
  howSteps: [
    'Drop your PDFs on the box, choose them, or paste them. Add as many as you like.',
    'Type the text of the watermark, then pick its size, how strong it looks, and whether it runs diagonally or straight across.',
    'Press Add watermark. Oli stamps the text on every page in your browser, and you download one PDF, or all of them together in a ZIP.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Watermark PDF takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['Files', 'PDF files, as many as you like. Oli checks what is inside each file, not its name. Several results download together as one ZIP.'],
      ['Kind of mark', 'Text only. This tool does not add image watermarks.'],
      ['Where it goes', 'In the center of every page, in gray. The position follows the page as it appears on screen, including its crop and rotation.'],
      ['Size', 'Small, Medium or Large: the text spans about 35%, 55% or 80% of the page diagonal, or of the page width when the mark is horizontal. A short word never grows taller than a third of the page.'],
      ['Opacity', 'Light is 15%, Medium is 30% (the default) and Strong is 50%. The lighter the mark, the easier the page reads underneath.'],
      ['Direction', 'Diagonal runs at 45° on the screen. Horizontal runs straight across the page.'],
      ['Font and characters', 'Helvetica Bold. Letters of the basic Latin alphabet and common accents work. Other characters are left out of the mark, and the help under the text field warns you.'],
      ['How it is added', 'The mark is drawn into the page itself, not on a layer that comes off with one click. Someone with a PDF editor can still remove it, so a watermark marks a file but does not lock it.'],
      ['What stays', 'Form fields, links, bookmarks and document properties stay as they were. Only the XFA form layer, which most PDF apps cannot read, is removed; the regular form fields keep working.'],
      ['Protected PDFs', 'A PDF with a password to open, or with restrictions, is refused with a link to Unlock PDF. Your original files are never changed.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Can I use an image or a logo as a watermark?',
      a: 'Not here. This tool adds a text watermark only, such as CONFIDENTIAL, DRAFT or a name. If you need a logo on every page, use a PDF editor.',
    },
    {
      q: 'Can someone remove the watermark?',
      a: 'The mark is drawn into the content of each page, so it does not come off with a single click like a separate layer. Someone with a PDF editor can still take it out. If the goal is to keep people from opening the file, set a password instead.',
    },
    {
      q: 'Why are some characters missing from my watermark?',
      a: 'Oli draws the mark in Helvetica Bold, which covers the basic Latin alphabet and common accented letters. Other characters, such as Cyrillic, Greek or Chinese letters, are left out, and the help under the text field warns you when that happens. If nothing is left to draw, Oli asks for a different text.',
    },
    {
      q: 'Is my PDF uploaded?',
      a: 'No. Oli reads each PDF and writes the new one on your device, in your browser. Nothing is sent to a server, and the text you type for the watermark stays on your device too.',
    },
    {
      q: 'Does the watermark change the rest of my PDF?',
      a: 'No. Form fields, links, bookmarks and document properties stay as they were, and the watermark is drawn on top of the page. The only thing taken out is the XFA form layer, which most PDF apps cannot read; the regular form fields keep working.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your PDFs and the watermark text are handled on your device, in your browser, and are never sent to a server.',
  relatedHeading: 'Related tools',
  panel: {
    note: 'PDF files, as many as you like',
    progressLabel: 'Adding watermarks',
    done: 'Done! Oli added the watermark to your PDF.',
    doneMany: 'Done! Oli added the watermark to {count} PDFs.',
    action: 'Add watermark',
    options: {
      textLabel: 'Watermark text',
      textHelp: 'Letters of the basic Latin alphabet and common accents work. Other characters are left out of the mark.',
      textError: 'The watermark needs text Oli can draw. Type letters or numbers from the basic Latin alphabet.',
      defaultText: 'CONFIDENTIAL',
      sizeLegend: 'Size',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      opacityLegend: 'Opacity',
      light: 'Light',
      mediumOpacity: 'Medium',
      strong: 'Strong',
      directionLegend: 'Direction',
      diagonal: 'Diagonal',
      horizontal: 'Horizontal',
    },
  },
};

export default texts;
