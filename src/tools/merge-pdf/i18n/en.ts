// Merge PDF page blocks (how, specs, faq, privacy, related) and the panel bits its island shows. The specs rows
// state the real behaviour of the PDF engine (src/engine/pdf/): when it changes there, change them here.
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { MergeTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<MergeTexts> = {
  title: 'Merge PDF: combine PDF files in your browser',
  description:
    'Merge PDF files into one, in the order you choose. It runs in your browser, so nothing is uploaded, and form fields, bookmarks and links stay.',
  h1: 'Merge PDF',
  howHeading: 'How it works',
  howSteps: [
    'Drop two or more PDFs on the box, choose them, or paste them. Use Add more PDFs to put more files in the list.',
    'Put the files in the order you want: drag a row, or press the arrow buttons on it (they work with the keyboard too).',
    'Press Merge PDFs to join them into one file.',
    'Download the merged PDF.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Merge PDF takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['What it takes', 'Two or more PDFs. Oli checks what is inside each file, not its name or its ending.'],
      ['Order', 'The pages follow the order of the list. Each row shows the file name, its number of pages and its size.'],
      ['How many files', 'No limit on the number of files. Your own device is the limit.'],
      ['Form fields', 'Fields on the copied pages are kept.'],
      ['Bookmarks and links', 'Bookmarks that point to a copied page are kept, and so are the links between copied pages. Links to a web address stay.'],
      ['XFA forms', 'The XFA layer, which only Adobe apps read, is removed. The regular form fields still work.'],
      ['Document info', 'The merged PDF takes the title, author and other metadata of the first file. Oli adds no date, no producer name and nothing from your device.'],
      ['PDFs with a password', 'A PDF with a password to open, or with editing restrictions, is turned away on its own row, with a link to Unlock PDF.'],
      ['Damaged files', 'A file that is empty, cut short or not a PDF is turned away on its own row. A file with a damaged index is repaired while Oli reads it.'],
      ['The result', 'One file, named after the first PDF with -merged added, like report-merged.pdf. Your original files stay untouched.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Can I add a picture, like a scan saved as a JPG?',
      a: 'Not as it is: Merge PDF joins PDFs only. Turn the pictures into a PDF with Image to PDF first, then add that file to the list here.',
    },
    {
      q: 'Why did a form field get " (2)" added to its name?',
      a: 'Two of your files had a field with the same name, and fields that share a name in one PDF share one value too. Oli adds " (2)" to the name in the later file, so each field keeps the value of its own file.',
    },
    {
      q: 'Can I merge a PDF that has a password?',
      a: 'Not as it is. Take the password off in Unlock PDF first, then add the unlocked copy to the list here.',
    },
    {
      q: 'Does a long list take longer on a phone?',
      a: 'Yes. A long list of big PDFs needs more memory and more time on a phone than on a computer.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your PDFs are read and joined on your device and are never sent to a server. The merged file is made in your browser too.',
  relatedHeading: 'Related tools',
  panel: {
    suffix: 'merged',
    note: 'PDF files, as many as you like',
    progressLabel: 'Merging PDFs',
    done: 'Done! Oli joined your PDFs into one.',
    doneMany: 'Done! Oli joined your {count} PDFs into one.',
    action: 'Merge PDFs',
    options: {
      add: 'Add more PDFs',
      help: 'Oli joins them from top to bottom. The arrows change the order.',
      needMore: 'Add at least one more PDF to merge.',
      listLabel: 'Files, in the order they join',
      order: 'Order · {count} files',
      orderHelp: 'Changing the order merges again right away.',
    },
  },
};

export default texts;
