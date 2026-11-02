import type { QrPageTexts } from '../types.ts';

export default {
  title: 'QR code generator for links and text, as PNG or SVG',
  description:
    'Make a QR code of a link or any text in your browser, with Oli in the middle or plain, and save it as PNG or SVG. Free, with no sign-up and no upload.',
  h1: 'QR code generator',
  seal: 'Your text never leaves your device',
  howHeading: 'How to make a QR code',
  howSteps: [
    'Type or paste a link, or any text, in the box. The code appears as you type.',
    'Choose whether Oli sits in the middle, and the size of the PNG.',
    'Download the PNG for a screen or a document, or the SVG to print at any size.',
    'Scan the code with your phone camera before you share or print it.',
  ],
  specsHeading: 'Specifications',
  specs: {
    caption: 'QR code generator: what it takes, what it makes and its limits',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'A link or any text, up to 1,273 characters. A letter with an accent counts as 2 and an emoji as 4, because the code stores the text as UTF-8 bytes.'],
      ['Error correction', 'Level H, the highest. The code still reads with about 30% of it hidden, which is what leaves room for Oli in the middle.'],
      ['Oli in the middle', 'On by default. The FileOrca icon sits in a white square about 22% as wide as the code. Turn it off for a plain code.'],
      ['PNG', 'Small, Medium or Large, aiming at 512, 1,024 and 2,048 pixels wide. Each square of the code gets a whole number of pixels, at least 4, so the real size shows under each choice.'],
      ['SVG', 'A vector file with the same squares and the same Oli. It stays sharp at any size, from a business card to a poster.'],
      ['Colors', 'Black squares on white, with a white margin 4 squares wide all around, as the QR code standard asks.'],
      ['File names', 'Always qr-code.png and qr-code.svg, never your text.'],
      ['Kind of code', 'A static code: it holds your text itself, with no short link, no tracking and no expiry date. A new text needs a new code.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Do these QR codes expire?',
      a: 'No. The code holds your link or text itself, not a short link to a server, so nobody can switch it off later. It works for as long as the link inside it works.',
    },
    {
      q: 'Can I change the link after I print the code?',
      a: 'No. A code that holds the link itself cannot change. Make a new code with the new link and print that one.',
    },
    {
      q: 'Will the code still scan with Oli in the middle?',
      a: 'Yes. The code uses error correction H, the highest, which rebuilds the part under the icon. Our tests read codes of every size back with Oli in the middle. Scan yours before you print it, and turn Oli off for a very small print.',
    },
    {
      q: 'Why does a long text make a denser code?',
      a: 'A QR code grows with what it holds. A short link like https://fileorca.com/ fits in a grid of 29 squares a side, and the longest text takes 177. Fewer squares mean bigger ones, which a camera reads from farther away.',
    },
    {
      q: 'Should I download the PNG or the SVG?',
      a: 'The PNG suits a screen, a slide or a document. The SVG suits print and design apps, because it stays sharp at any size.',
    },
    {
      q: 'Can I use the code on products or for my business?',
      a: 'Yes. The code is yours to use anywhere, for free, with no watermark and no credit to give.',
    },
    {
      q: 'Does FileOrca see what I type?',
      a: 'No. The code is made in your browser. Your text is not added to the page address, sent in an analytics event, kept in a cookie or in your browser storage, or put in the file name. FileOrca never opens the link you type.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your text stays on your device. The code is made in your browser, and the text never goes into the page address, an analytics event, a cookie, your browser storage or the file name. FileOrca never opens the link you type and never sends a request to it.',
  relatedHeading: 'More tools',
  panel: {
    field: {
      label: 'Link or text',
      placeholder: 'https://fileorca.com',
      help: 'Up to {max} characters. A letter with an accent counts as 2 and an emoji as 4.',
      count: '{count} of {max}',
    },
    oli: { legend: 'Oli in the middle', on: 'On', off: 'Off' },
    size: {
      legend: 'PNG size',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      px: '{side} px',
      note: 'Each square of the code gets whole pixels, so its edges stay sharp.',
    },
    preview: {
      label: 'Preview of your QR code',
      empty: 'Your QR code shows up here as you type.',
      ready: 'Your QR code is ready to download.',
    },
    download: { png: 'Download PNG', svg: 'Download SVG', pngMeta: '{side} × {side} px' },
    errors: {
      empty: 'Oops, there is nothing to put in the code yet. Type a link or some text.',
      long: "Oops, that's too long for one QR code, which holds up to {max} characters. A letter with an accent counts as 2 and an emoji as 4.",
      png: "Oops, Oli couldn't draw the PNG. Try a smaller size, or download the SVG.",
    },
  },
} satisfies QrPageTexts;
