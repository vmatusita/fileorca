// The PDF hub /pdf-tools/ in English (F5a, decision 7): the band, the grid of the PDF tools in order of search volume,
// the guide of which tool does which job (DECISOES § 96) and how the files stay on the device.
import type { PdfToolsTexts } from '../types.ts';

const texts: PdfToolsTexts = {
  title: 'PDF tools: merge, split, compress and more, in your browser',
  description: 'Free PDF tools that run in your browser: merge, split, compress, convert to JPG, rotate, number, sign and protect PDFs without uploading them.',
  eyebrow: 'PDF',
  h1: 'Free PDF tools that never upload your files',
  intro: 'Merge, split, compress, convert, number, sign and protect PDFs. Every tool works on your device: no account, no upload, no limit on files.',
  toolsHeading: 'Every PDF tool',
  guideHeading: 'Which tool do you need?',
  guideIntro: 'Most PDF jobs are one of these. Pick the line that sounds like yours.',
  guide: [
    { before: 'Several PDFs that should be one file, in a set order:', tool: 'merge-pdf', after: 'puts them together and keeps their bookmarks and form fields.' },
    { before: 'One long PDF and you only need some pages, or each page apart:', tool: 'split-pdf', after: 'cuts it by ranges, by picked pages or page by page.' },
    { before: 'A PDF too big to email or upload to a form:', tool: 'compress-pdf', after: 'tidies its structure and, in the Recommended mode, makes its photos lighter.' },
    { before: 'Pages you want as pictures, for a slide or a message:', tool: 'pdf-to-jpg', after: 'draws each page as a JPG or a PNG at the resolution you choose.' },
    { before: 'Photos or scans that should become a PDF:', tool: 'image-to-pdf', after: 'puts one image on each page, in the order of the list.' },
    { before: 'A scan that came out sideways or upside down:', tool: 'rotate-pdf', after: 'turns every page, or only the ones that need it, without redrawing them.' },
    { before: 'Blank or unwanted pages in the middle:', tool: 'delete-pdf-pages', after: 'takes them out and keeps everything else as it was.' },
    { before: 'Pages to move, turn and take out of the same PDF:', tool: 'organize-pdf', after: 'does all three in one grid and saves one new PDF.' },
    { before: 'Pages in the wrong order:', tool: 'reorder-pdf-pages', after: 'lets you drag them, or move them with buttons or the keyboard.' },
    { before: 'A report or a thesis that needs numbered pages:', tool: 'add-page-numbers-to-pdf', after: 'writes the numbers where you want them, in one of four formats.' },
    { before: 'A document to mark as a draft or as confidential:', tool: 'watermark-pdf', after: 'stamps your text across the middle of every page.' },
    { before: 'A form or a letter to sign and send back:', tool: 'sign-pdf', after: 'places a drawn, uploaded or typed signature on the pages you pick.' },
    { before: 'A PDF that should open only with a password:', tool: 'protect-pdf', after: 'locks it with AES-256 encryption.' },
    { before: 'A PDF of yours that asks for a password every time:', tool: 'unlock-pdf', after: 'removes the password, once you type it, or the editing restrictions.' },
  ],
  guideOutro: 'The tools chain well: merge first, then number the pages, then compress the result. Each one gives back a new file and leaves your original as it was.',
  privacyHeading: 'Your PDFs stay on your device',
  privacy: [
    'Every PDF tool here reads and writes the file inside your browser. The PDF is opened with PDF.js, the reader Firefox uses, and changed with pdf-lib and qpdf, compiled to run in the page. Nothing is sent to a server, so there is no upload to wait for and no copy of your file anywhere else.',
    'A password you type to protect or open a PDF stays in the page while you use it and is gone when you close it. A signature you draw, upload or type is not kept either. Open the Network tab of your browser while a tool runs: no request carries your file, your password or your text.',
  ],
  presetsHeading: 'Ready-made settings',
  presetsCaption: 'Ready-made settings of the PDF tools and what each one gives',
  presetsHead: ['Preset', 'What you get'],
};

export default texts;
