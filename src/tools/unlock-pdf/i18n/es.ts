// F6: esqueleto copiado do inglês até a tradução substituir este arquivo (o english-leak.test.ts reprova o que sobrar).
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { UnlockTexts } from '../../pdf/option-texts.ts';

// Unlock PDF page blocks (data-content: how, specs, faq, privacy, related) and the panel bits the shared PDF island
// shows. The specs rows state the real behaviour of the engine (src/engine/pdf/): when it changes there, change them here.
const texts: PdfToolTexts<UnlockTexts> = {
  title: 'Unlock PDF: remove a PDF password in your browser',
  description:
    'Open a password-protected PDF or take its restrictions off, right in your browser. The file and the password stay on your device and are never uploaded.',
  h1: 'Unlock PDF',
  howHeading: 'How it works',
  howSteps: [
    'Drop a PDF on the box, choose one, or paste it. Oli works on one PDF at a time, because each file has its own password.',
    'If the PDF only has restrictions, Oli takes them off straight away. If it needs a password to open, type it in the box and press Remove password.',
    'Download the new PDF. It opens without a password, and your original file stays untouched.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Unlock PDF takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['Files', 'One PDF at a time. Oli checks that it is a PDF from what is inside the file, not from its name.'],
      ['Restrictions only', 'A PDF that opens freely but blocks things like editing, printing or copying loses those restrictions at once. Oli asks for nothing.'],
      ['Password to open', 'A PDF that asks for a password when you open it needs that password here. Type it in the box and press Remove password.'],
      ['Wrong password', 'Oli says the password did not open the file, and you can try again as many times as you need.'],
      ['Kinds of protection', 'AES-256, AES-128 and the old RC4 protection, handled by qpdf running in your browser.'],
      ['No guessing', 'Without the right password the file stays closed: Oli does not guess or break passwords. Use this only on files you have the right to open and change.'],
      ['What stays', 'Pages, text, images, form fields, links, bookmarks and document properties stay as they were. Only the protection goes.'],
      ['What you get', 'A new PDF with no password and no restrictions. Your original file is not changed.'],
      ['Nothing to remove', 'A PDF with no password and no restrictions has nothing to take off, so Oli tells you that instead of giving the same file back.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'What is the difference between a password to open and restrictions?',
      a: 'A password to open stops anyone from reading the PDF at all, so you need it here. Restrictions are set by whoever made the file: you can read it, but things like editing, printing or copying text are blocked. Oli takes restrictions off by itself and only asks for a password when the file needs one to open.',
    },
    {
      q: 'Can I open a PDF if I forgot the password?',
      a: 'No. Oli needs the right password and does not guess or break passwords, so a file without it stays closed. If the file is yours to open, ask the person who made it for the password or for a copy without one.',
    },
    {
      q: 'Is it fine to remove the password from any PDF?',
      a: "Use this only on files you have the right to open and change, such as your own documents or files whose owner allowed it. Removing a password does not give you permission to share or edit someone else's work. When in doubt, ask the owner first.",
    },
    {
      q: 'Is my PDF or my password uploaded?',
      a: "No. Oli reads and writes the PDF on your device, in your browser, with qpdf running inside the page. Neither the file nor the password you type is sent anywhere. Open your browser's Network tab while you use the tool: no request carries your files.",
    },
    {
      q: 'Which kinds of protection does it handle?',
      a: 'AES-256, AES-128 and the older RC4 protection. Oli removes only the protection, so the pages, text, forms, links and bookmarks stay as they were.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your PDF and the password you type are handled on your device, in your browser, and are never sent to a server. Oli does not keep them.',
  relatedHeading: 'Related tools',
  panel: {
    suffix: 'unlocked',
    note: 'one PDF at a time',
    progressLabel: 'Removing protection',
    done: 'Done! Oli took the protection off your PDF.',
    doneMany: 'Done! Oli took the protection off {count} PDFs.',
    options: {
      passwordLabel: 'Password to open the PDF',
      rule: 'Type the password of this PDF to continue.',
      submit: 'Remove password',
      ask: 'This PDF needs a password to open. Type it, then press Remove password.',
    },
  },
};

export default texts;
