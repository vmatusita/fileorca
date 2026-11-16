// F19b (front E4): what a PDF password protects, with the measurements of data/guides-measured.json (front M1) and the
// sources read on 2026-11-16 (the qpdf documentation and NIST SP 800-63B).
import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'What a PDF Password Protects, and What Restrictions Do Not',
  description: 'The password to open a PDF locks the whole file, while restrictions alone are only a request to the reader. What each one did to our test PDFs.',
  h1: 'What a PDF password protects',
  lead: 'A password to open and a list of restrictions both sound like protection. Only one of them kept our test PDFs shut.',
  changed: 'First version of this guide, published on {published}, with the numbers measured on {measured}.',
  intro: [
    'A PDF can carry two different kinds of protection. A password to open, the kind Protect PDF adds, keeps the file shut until someone types it. Restrictions, set with a separate owner password, let anyone open and read the file but ask the program not to print it, copy its text or change its pages.',
    'We put both to the test on files of our own: {files_word} PDFs we protected with Protect PDF, and a PDF that came locked by restrictions alone. For each one we read the encryption, tried to open it with no password, with the right one and with a wrong one, and counted the bytes the protection added. The documentation of qpdf, the program behind Protect PDF and Unlock PDF, explains what we saw.',
  ],
  toolHeading: 'Add a password to a PDF here',
  toolIntro: 'Drop one PDF or several, type a password twice and press Protect PDFs. Each file comes back encrypted, and asks for that password before it opens.',
  sections: [
    {
      heading: 'The password to open encrypts the whole file',
      paragraphs: [
        'A password to open is not a lock on the outside of the file. Protect PDF encrypts the contents of the PDF with a key, and the qpdf documentation explains where that key lives: it is generated at random and stored in the file, encrypted with the password. Whoever types the password gets the key, and with it the pages.',
        'All {files_word} of our protected PDFs came back with AES encryption and a {keyBits}-bit key, revision {revision} of PDF encryption. According to the qpdf documentation, a key that long always means AES, and this is the only revision the PDF 2.0 specification does not deprecate.',
        'Without the password, the reader of our tests refused to open all {refusedWithout_word}. With it, every one opened, and a wrong password got nowhere. We also searched the bytes of each protected file for the password we had typed, and it was not there: the password locks the key, and it is not kept beside it.',
      ],
    },
    {
      heading: 'Restrictions are a request, not a lock',
      paragraphs: [
        'Restrictions work another way. A PDF can list what it allows, such as printing, copying text, filling in forms or changing pages, and set an owner password for that list alone, with no password to open. The qpdf documentation is plain about what that does: the restrictions are enforced only by the software that opens the file. A reader that follows the standard is supposed to obey them, and any program that can read the file at all already holds the key.',
        'Our test PDF with restrictions shows what that means. It is encrypted just like the protected files, with a {ownerKeyBits}-bit key and revision {ownerRevision}, and it blocks {ownerBlocked_word} of the {capabilities_word} actions qpdf lists. Yet the reader of our tests opened it with no password at all. The qpdf documentation has a name for such a file: encrypted, but not password-protected.',
        'Unlock PDF, in its mode for restrictions, took them all off without asking for any password. The copy it gave back had no encryption, no blocked action and the same {ownerPages_word} pages. Nothing in the file could stop it, and the qpdf documentation adds that any open source reader could be changed to ignore the list.',
      ],
    },
    {
      heading: 'What Protect PDF adds, and what it leaves out',
      paragraphs: [
        'Protect PDF uses the one password you type both to open the file and as the owner password, and it adds no restriction: in our protected files, not one of the actions qpdf lists was blocked. A PDF that already carries restrictions is turned down, and ours was, so those restrictions have to come off with Unlock PDF first.',
        'The encryption takes little room, and in our sample the size of the file made little difference to it. Our {files_word} PDFs grew by {addedMin_exact} to {addedMax_exact}: the PDF of photos, at {photosBefore}, gained the least, and our smallest file, at {mixedBefore}, gained {mixedAdded_exact}, which on a file that small is {mixedChange_more} more.',
        'We protected each file twice, with a different password each time, and both copies came out the same size, for all {sameSize_word} files.',
      ],
    },
    {
      heading: 'A short password can be guessed',
      paragraphs: [
        'A long key does not help much if the password that guards it is easy to find. NIST, the standards agency of the United States, writes in Special Publication 800-63B that length is a primary factor in the strength of a password, and that passwords that are too short yield to brute-force and dictionary attacks: trying every combination, or every word of a list.',
        'Its rules for sign-in systems ask for at least {nistMinimum} when a password is the only thing that proves who you are, and they rely on limiting failed attempts as well. A protected PDF has no such limit. The key sits inside the file, so whoever has a copy can try one password after another on a computer of their own, where nothing limits the rate of tries. NIST calls this an offline attack.',
        'Our measurement did not time how long any password takes to guess, and this guide makes no promise about it. What it shows is narrower: the right password opened every file, a wrong one opened none, and the encryption was the same whatever password we typed. How hard a protected file is to open comes down to the password.',
      ],
    },
    {
      heading: 'Which protection does what',
      paragraphs: ['Put side by side, the two protections cover different things.'],
      list: [
        'A password to open: the file stays encrypted for anyone who does not have the password, and the password is not stored in the file. Anyone you give it to can do everything with the copy, since Protect PDF adds no restriction.',
        'Restrictions alone: everyone can open and read the file, and what it allows holds only in programs that choose to follow the list.',
      ],
    },
  ],
  half: 2,
  measuredHeading: 'What we measured',
  sheet: {
    stats: [
      { label: 'Added to our PDF of photos', value: '+{photosAdded_exact}', from: '{photosBefore}', to: '{photosAfter}' },
      { label: 'Blocked in our PDF that opens freely', value: '{ownerBlocked} of {capabilities}', sub: 'Actions, as qpdf lists them' },
    ],
    sample: '{files} test PDFs with a password, and a PDF with restrictions only.',
    link: 'See the tables',
  },
  tableHeading: 'File by file',
  measuredIntro: 'Our {files_word} test PDFs protected by Protect PDF, each twice and each time with a new password made up for the test; then our PDF with restrictions and no password to open, as it came and after Unlock PDF. Added is the size after against the size before, to the byte.',
  measuredNote: 'Measured on {date}, in Node, with the engine of the tools of this site, each run in a fresh process, as in a new tab. The encryption of each file was read with qpdf, and each file was opened with PDF.js, the reader our tests use, with no password, the right one and a wrong one.',
  tables: [
    {
      heading: 'PDFs with a password',
      caption: 'Each PDF protected by Protect PDF: its pages, its size before and after, and the bytes the encryption added',
      head: ['PDF', 'Pages', 'Before', 'After', 'Added'],
    },
    {
      heading: 'Restrictions without a password',
      caption: 'The PDF with restrictions and no password to open, as it came and after Unlock PDF, beside a PDF after Protect PDF: the size, whether a reader opened it with no password, and how many actions it blocks',
      head: ['File', 'Size', 'Opens with no password', 'Actions blocked'],
      labels: ['Restrictions only, as it came', 'The same PDF after Unlock PDF', 'PDF with pages of mixed sizes, after Protect PDF'],
    },
  ],
  sourcesHeading: 'Sources',
  sources: [
    { id: 'qpdf', label: 'qpdf documentation: PDF Encryption', href: 'https://qpdf.readthedocs.io/en/stable/encryption.html', read: '2026-11-16' },
    { id: 'nist', label: 'NIST: Special Publication 800-63B', href: 'https://pages.nist.gov/800-63-4/sp800-63b.html', read: '2026-11-16' },
  ],
  facts: {
    nistMinimum: { text: '15 characters', source: 'nist' },
  },
  names: ['800-63B', 'PDF 2.0'],
  relatedHeading: 'Related tools and guides',
};

export default texts;
