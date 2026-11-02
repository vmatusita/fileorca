import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'How to Combine PDFs on a Phone, iPhone or Android',
  description: 'The ways to put several PDFs into one on an iPhone or an Android phone, what the merged file weighs, and what it keeps from each PDF.',
  h1: 'How to combine PDFs on a phone',
  lead: 'You have a few PDFs on your phone and need to send them as one. Here are the ways to do it there, without a computer, and what to expect from the result.',
  changed: 'First version, with the measurements of {date}.',
  intro: [
    'Forms, receipts, a signed page and a scan of an ID can arrive as separate PDFs, and the place you need to send them takes a single file. On a computer there are plenty of ways to join them. On a phone there are fewer, and they depend on the phone.',
    'This guide covers the way Apple documents for the iPhone, the way that works in a browser on any phone, and what we measured when we merged real PDFs.',
  ],
  toolHeading: 'Combine your PDFs here',
  toolIntro: 'Choose two or more PDFs from your phone, drag them into the order you want and tap the button. They are joined in this browser tab, on the phone itself, and nothing is uploaded.',
  sections: [
    {
      heading: 'On an iPhone, with Preview',
      paragraphs: [
        'Apple’s iPhone User Guide describes how to add pages to a PDF in the Preview app: open the PDF, touch and hold a page thumbnail, then tap Insert from File to bring in another PDF or an image. To change the order, touch and hold a thumbnail and drag it above or below another one.',
        'This works well for adding one file to another. For several files, you repeat the insert for each one, and the result is the PDF you started from with the new pages added.',
      ],
    },
    {
      heading: 'On an Android phone',
      paragraphs: [
        'Google’s help for the Drive app describes scanning paper into a PDF: you scan a page, tap Add to scan another, and save the result as a PDF. That is a good way to turn several sheets of paper into one file, but it makes a new PDF from the camera. It does not join PDFs you already have on the phone.',
        'For files that are already PDFs, the browser is the simplest place to do it on Android, with the tool on this page.',
      ],
    },
    {
      heading: 'On any phone, in the browser',
      paragraphs: [
        'Merge PDF on this page runs in the browser of the phone, so it works the same on an iPhone and on an Android phone. Tap to choose the files, from the Files app on an iPhone or from your downloads on Android, put them in order and tap the button. The merged PDF downloads like any other file.',
        'The files are not uploaded to a server: the phone does the work, so private documents stay on it.',
      ],
    },
    {
      heading: 'What the merged file weighs',
      paragraphs: [
        'We merged {pairs} pairs of our test PDFs and compared the merged file with the two files it came from. The merged file was never bigger than the two together, and in {smaller} of the {pairs} pairs it was a little smaller.',
        'For two scanned or photo PDFs, merging is almost free: our PDF of photos and the scanned book page came out at {photosScanRatio} of their combined size. A PDF has some structure around its pages, and the merged file needs that structure once instead of twice.',
      ],
    },
    {
      heading: 'When the merged file is clearly smaller',
      paragraphs: [
        'One pair stood out. The scanned book page with the IRS form came out {scanFormRatio_off} smaller than the two files together. The form carries a second description of itself, in a format called XFA, that only some programs read, and Merge PDF leaves it out; the result tells you so next to the file. The form fields themselves are kept, so the form can still be filled in.',
        'Nothing else is dropped on purpose. Bookmarks and links come along, and a field whose name already exists in another file gets a number added so both keep working.',
      ],
    },
    {
      heading: 'Before you merge',
      paragraphs: [
        'Put the files in the order the reader should see them, and remove the pages that are not needed first: a merged PDF is easier to check than to fix. A PDF that asks for a password has to be saved without it before it can be merged, which Unlock PDF does; Merge PDF tells you which file is locked.',
        'If the merged file is too big to send, compress it afterwards. Merging does not make files lighter by itself, apart from the small savings above.',
      ],
    },
    {
      heading: 'Sending the merged PDF',
      paragraphs: [
        'A personal Gmail account sends attachments up to {gmailLimit}; above that, Google turns the attachment into a Drive link. If your merged PDF is near the limit, Compress PDF may bring it under. In the measurements of our guide to large PDFs, it made a PDF of photos and a scanned color page much lighter, and a black and white scan only a little; that guide has each mode on each file.',
        'Check the merged file before you send it: open it, scroll through every page and make sure the order is right. It takes a minute, and it is much easier than explaining a missing page later.',
      ],
    },
  ],
  half: 4,
  measuredHeading: 'What we measured',
  measuredIntro: 'We merged {pairs_word} pairs made from {pdfs_word} of our test PDFs, in the order shown. Change is the merged file against the two files together.',
  measuredNote: 'Measured on {date} in Node with the engine of this site, which gives the same bytes as the browser, on pairs of the PDFs of our tests.',
  tables: [
    {
      heading: 'Merged pairs',
      caption: 'Each pair of PDFs: the two files together, the merged file, and the change',
      head: ['Files', 'Together', 'Merged', 'Change'],
    },
  ],
  sourcesHeading: 'Sources',
  sources: [
    { id: 'google-drive-scan', label: 'Google Drive Help: Scan documents with Google Drive', href: 'https://support.google.com/drive/answer/3145835?hl=en&co=GENIE.Platform%3DAndroid', read: '2026-11-01' },
    { id: 'gmail', label: 'Gmail Help: Send attachments with your Gmail message', href: 'https://support.google.com/mail/answer/6584?hl=en', read: '2026-11-01' },
    { id: 'apple-preview', label: 'Apple iPhone User Guide: Add, delete, rotate, move, or crop PDF pages in Preview on iPhone', href: 'https://support.apple.com/guide/iphone/iphbf4977cff/ios', read: '2026-11-01' },
  ],
  facts: {
    gmailLimit: { text: '25 MB', source: 'gmail' },
  },
  names: [],
  relatedHeading: 'Related tools and guides',
};

export default texts;
