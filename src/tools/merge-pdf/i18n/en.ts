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
    'Put the files in the order you want: drag a row, press the arrow buttons on it, or move it with the keyboard.',
    'Press Merge PDFs. Oli joins the files in your browser, in the order of the list.',
    'Download the merged PDF. Your original files stay untouched.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Merge PDF takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['What it takes', 'Two or more PDFs. Oli checks what is inside each file, not its name or its ending.'],
      ['Order', 'The pages follow the order of the list. Each row shows the file name, its number of pages and its size.'],
      ['How many files', 'No limit on the number of files. Your own device is the limit.'],
      ['Form fields', 'Fields on the copied pages are kept. When two files have a field with the same name, the later one gets " (2)" added.'],
      ['Bookmarks and links', 'Bookmarks that point to a copied page are kept, and so are the links between copied pages. Links to a web address stay.'],
      ['XFA forms', 'The XFA layer, which only Adobe apps read, is removed. The regular form fields still work.'],
      ['Document info', 'The merged PDF takes the title, author and other metadata of the first file. Oli adds no date, no producer name and nothing from your device.'],
      ['PDFs with a password', 'A PDF with a password to open, or with editing restrictions, is turned away on its own row, with a link to Unlock PDF.'],
      ['Damaged files', 'A file that is empty, cut short or not a PDF is turned away on its own row. A file with a damaged index is repaired while Oli reads it.'],
      ['The result', 'One file, named after the first PDF with -merged added, like report-merged.pdf.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'How do I change the order of the files?',
      a: 'Drag a row to a new place, or press the arrow buttons on the row to move it up or down. You can also move a row with the keyboard. Oli joins the files in the order the list shows when you press Merge PDFs.',
    },
    {
      q: 'Will form fields, bookmarks and links still work after merging?',
      a: 'Yes, for the pages that Oli copies. Form fields on those pages stay, and so do bookmarks that point to them and links between them. Links to the web stay as well, while a link to a page that is not in the merged file goes away. If two files have a field with the same name, the second one is renamed with " (2)" so both keep their own value.',
    },
    {
      q: 'Can I merge a PDF that has a password?',
      a: 'Not as it is. Oli turns away a PDF that needs a password to open, or that has editing restrictions, and shows a link to Unlock PDF. Remove the password there first, then add the result to your list here.',
    },
    {
      q: 'Is there a limit on how many PDFs I can merge?',
      a: 'Oli sets no limit on the number of files. The limit is your device: a long list of big PDFs takes more memory and more time on a phone than on a computer.',
    },
    {
      q: 'Is my PDF uploaded?',
      a: 'No. The PDFs are read and written on your device, inside your browser, and nothing is sent to a server. Open the Network tab of your browser while you merge: no request carries your files.',
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
