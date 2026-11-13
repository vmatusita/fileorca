// Protect PDF page blocks (how, specs, faq, privacy) and the panel bits this tool adds to the shared PDF panel texts.
// The specs rows state the real behaviour of the engine (src/engine/pdf/qpdf.ts): AES-256 revision 6, one password to
// open and to own, no restriction added. When the encryption changes there, change it here.
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { PasswordToolTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<PasswordToolTexts> = {
  title: 'Protect PDF: add a password to a PDF in your browser',
  description:
    'Add a password to PDF files in your browser with AES-256 encryption, one file or a whole batch. Nothing is uploaded, and your password is never saved.',
  h1: 'Protect PDF',
  howHeading: 'How it works',
  howSteps: [
    'Drop your PDFs on the box, choose them, or paste them with Ctrl V.',
    'Type a password, then type it again to confirm.',
    'Press Protect PDFs, and Oli encrypts each file.',
    'Download the protected PDFs, and write the password down.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Protect PDF takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'PDF files, as many as you like. Oli checks what is inside the file, not its name.'],
      ['Password', 'One password for the whole batch, typed twice. It must have 4 to 100 characters.'],
      ['Encryption', 'AES-256 (revision 6), written by qpdf.'],
      ['Open and owner password', 'The same password is used to open the file and as the owner password.'],
      ['Restrictions', 'None are added. Printing and copying stay allowed for whoever has the password.'],
      ['What stays', 'The content of the pages is not changed: only the encryption is added. Form fields, links and bookmarks stay as they were, and so do the document details of your file. Oli adds no date, producer or anything from your device.'],
      ['File name', 'A file called report.pdf comes out as report-protected.pdf. Your original is not changed.'],
      ['Batch', 'No limit on the number of files. Several files download together as one ZIP.'],
      ['Already protected', 'A PDF that already has a password or restrictions is turned down on its own line, with a link to Unlock PDF. The other files go on.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Can each file get a password of its own?',
      a: 'Not in one batch, because one password covers the whole batch. Protect the files in separate rounds, one round for each password.',
    },
    {
      q: 'What if I forget the password?',
      a: 'Then the protected copy cannot be opened, and nobody can recover the password for you. Keep the password in a safe place, and keep your original PDF until you have checked that the protected copy opens.',
    },
    {
      q: 'How strong is the protection?',
      a: 'The weak point is the password, not the encryption: a short or common password is easy to guess. Choose a long one that you do not use anywhere else.',
    },
    {
      q: 'Can I take the password off later?',
      a: 'Yes, with Unlock PDF and the same password. It gives you a copy that opens without one.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your PDFs are encrypted on your device and are never sent to a server. The password is not saved and does not leave your device.',
  relatedHeading: 'Related tools',
  panel: {
    suffix: 'protected',
    note: 'PDF files, as many as you like',
    progressLabel: 'Protecting PDFs',
    done: 'Done! Your PDF now asks for a password.',
    doneMany: 'Done! Your {count} PDFs now ask for a password.',
    action: 'Protect PDFs',
    options: {
      passwordLabel: 'Password',
      confirmLabel: 'Confirm password',
      rule: 'Use 4 to 100 characters.',
      mismatch: "The two passwords don't match. Type the same one in both fields.",
    },
  },
};

export default texts;
