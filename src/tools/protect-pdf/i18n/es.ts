// F6: esqueleto copiado do inglês até a tradução substituir este arquivo (o english-leak.test.ts reprova o que sobrar).
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
    'Drop your PDFs on the box, choose them, or paste them with Ctrl V. Add as many as you like.',
    'Type a password, then type it again to confirm. Use 4 to 100 characters.',
    'Press Protect PDFs. Oli encrypts each file in your browser, with the same password for all of them.',
    'Download one PDF, or all of them together in a ZIP. Write the password down: nobody can recover it for you.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Protect PDF takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'PDF files, as many as you like. Oli checks what is inside the file, not its name.'],
      ['Password', 'One password for the whole batch, typed twice. It must have 4 to 100 characters.'],
      ['Encryption', 'AES-256 (revision 6), written by qpdf running in your browser.'],
      ['Open and owner password', 'The same password is used to open the file and as the owner password.'],
      ['Restrictions', 'None are added. Printing and copying stay allowed for whoever has the password.'],
      ['What stays', 'The content of the pages is not changed: only the encryption is added. Form fields, links and bookmarks stay as they were, and so do the document details of your file. Oli adds no date, producer or anything from your device.'],
      ['File name', 'A file called report.pdf comes out as report-protected.pdf. Your original is not changed.'],
      ['Batch', 'No limit on the number of files. Several files download together as one ZIP.'],
      ['Already protected', 'A PDF that already has a password or restrictions is turned down on its own line, with a link to Unlock PDF. The other files go on.'],
      ['Forgotten password', 'FileOrca does not keep the password and cannot recover it. Keep a copy somewhere safe.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'How do I put a password on a PDF?',
      a: 'Drop the PDF, type a password twice and press Protect PDFs. Oli encrypts the file in your browser, and the new PDF asks for the password whenever someone opens it. Your original file stays as it was.',
    },
    {
      q: 'What if I forget the password?',
      a: 'FileOrca does not store your password, so it cannot recover it, and the protected file cannot be opened without it. Keep the password in a safe place, and keep your original PDF until you have checked that the protected copy opens.',
    },
    {
      q: 'How strong is the protection?',
      a: 'The file is encrypted with AES-256, a standard encryption for PDF files. The password matters most: a short or common one is easy to guess, so choose a long one that you do not use anywhere else. The rule here is 4 to 100 characters, and longer is safer.',
    },
    {
      q: 'Can I protect many PDFs at once?',
      a: 'Yes. Drop as many files as you like: they all get the same password, and each one comes out as its own file ending in -protected. When you want them all, one button gives you a ZIP.',
    },
    {
      q: 'Are my PDF and my password uploaded?',
      a: 'No. Oli reads the PDF and encrypts it on your device, in your browser, with qpdf. Neither the file nor the password is sent to a server, and the password is not saved.',
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
