import type { HomeTexts } from '../types.ts';

export default {
  title: 'FileOrca: free tools that never upload your files',
  description:
    'Free tools that run in your browser, with no account and no upload. Your files stay on your device, and you can check it yourself in the Network tab.',
  h1: 'Free tools that run in your browser',
  intro: 'No account, no upload and no server processing. Pick a tool and the work happens on your device.',
  toolsHeading: 'Choose a tool',
  hubLink: 'See all image tools and common sizes',
  pdf: {
    heading: 'Work on a PDF',
    intro: 'Merge, split, compress, rotate, protect and sign PDFs, or turn their pages into images. The PDF is read and written on your device, and a password never leaves it.',
    hubLink: 'See all PDF tools',
  },
  money: {
    heading: 'Work out a loan',
    intro: 'Mortgages, refinancing, car and personal loans: the payment, the interest and the whole schedule. Your numbers stay on your device.',
    hubLink: 'See all money calculators',
  },
  house: {
    heading: 'Plan a home project',
    intro: 'Square feet, cubic yards of concrete or mulch, gallons of paint, tiles and the size of an air conditioner, in US units.',
    hubLink: 'See all home calculators',
  },
  health: {
    heading: 'Check a health number',
    intro: 'BMI, daily calories, ovulation, body fat and due date, by the published formulas they cite. For adults.',
    hubLink: 'See all health calculators',
  },
  qr: {
    heading: 'Make a QR code',
    intro: 'Turn a link or a short text into a QR code with Oli in the middle, and save it as PNG or SVG. The text stays on your device.',
  },
  privacyHeading: 'Your files stay with you',
  privacyBody:
    "Your files never leave your device. FileOrca does the work in your browser, and you can check it yourself: open your browser's Network tab while you use a tool and see that no request carries your file.",
  // F11 (decision 7): the "Read a guide" section; {n} is the number of guides of the language, read from the registries.
  guides: {
    heading: 'Read a guide',
    intro: 'Each guide answers one question with numbers and has the tool inside.',
    hubLink: 'See all {n} guides',
  },
} satisfies HomeTexts;
