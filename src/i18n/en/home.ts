import type { HomeTexts } from '../types.ts';

// F13b (UX-03 B, home-b.html; DECISOES § 567 to § 571): the home as the sea by category. Every number is a {placeholder}
// the build fills from its source (src/components/home-numbers.ts and src/components/tool-count.ts).
export default {
  title: 'FileOrca: free tools that never upload your files',
  description:
    'Free tools that run in your browser, with no account and no upload. Your files stay on your device, and you can check it yourself in the Network tab.',
  h1: '{n} tools.',
  h1Promise: '0 uploads.',
  intro: 'Image, PDF, money, home and health tools that do the work on your device, with no account.',
  toolsHeading: 'Choose a tool',
  to: ' to ',
  image: {
    heading: 'Image',
    count: '{n} tools',
    say: '{photos} phone photos in Compress image: {percent} lighter, with the default setting.',
    more: 'Each image tool opens the file in this tab, does the work on your device and gives you a new copy to save.',
    all: 'All image tools and common sizes',
  },
  pdf: {
    heading: 'PDF',
    count: '{n} tools',
    say: 'A PDF of photos in Compress PDF: {percent} lighter in the recommended mode.',
    more: 'Merging, splitting and signing happen in the same tab, and a password you type for a PDF never leaves it.',
    all: 'All PDF tools',
  },
  money: {
    heading: 'Money',
    count: '{n} calculators',
    num: '{payment} a month',
    say: 'The example mortgage, all in: a {price} home with {down} down, at {rate} for {years} years.',
    more: 'Each calculator explains its result, ready to download as PDF or CSV, and what you type stays on your device.',
    all: 'All {n} money calculators',
  },
  life: {
    heading: 'Home and health',
    count: '{n} calculators',
    num: '{gallons} gallons',
    say: 'of paint for {coats} coats on a room {perimeter} ft around and {height} ft high, after the doors and windows, in the example of the paint calculator.',
    more: 'The home calculators work in US units, and the health ones follow the published formulas they cite, for adults.',
    all: 'All home calculators',
    allHealth: 'All health calculators',
  },
  qr: {
    heading: 'QR code',
    count: '{n} tool',
    num: '{max} characters',
    say: 'in a single code, with Oli in the middle, at error correction H.',
    more: 'Type a link or a short text, and save the code as PNG or SVG while the text stays on your device.',
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
