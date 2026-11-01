import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Why Is My PDF So Large? What Fills It and What Shrinks It',
  description: 'What takes the space inside a PDF, measured on real files, and what each mode of Compress PDF did to them, including when the file came back the same.',
  h1: 'Why is my PDF so large?',
  lead: 'A PDF is a container, and the size depends on what went into it. Find out which part is heavy before you try to shrink it.',
  changed: 'First version, with the measurements of {date}.',
  intro: [
    'Most PDFs are small. A few pages of text weigh less than a photo from a phone. When a PDF is too big to attach, the cause is almost always one of two things: pictures, or fonts. Scans are pictures too, one per page. Adobe says the same in its own guide: the resolution of an image drives the size of the file, and a single embedded font can add a lot.',
    'The limit you run into is usually email. A personal Gmail account sends attachments up to {gmailLimit}, and Outlook.com takes attachments up to {outlookLimit}. Above that, the file needs to get smaller, be split, or travel as a link.',
  ],
  toolHeading: 'Compress your PDF here',
  toolIntro: 'Drop a PDF and it is compressed in this browser tab, with the Recommended mode to start. Change the mode to see each result. Nothing is uploaded.',
  sections: [
    {
      heading: 'Where the bytes are',
      paragraphs: [
        'We opened the PDFs of our tests and added up the bytes of each kind of content. In the scanned book page, the one picture is {scanImagesShare} of the file. In a PDF made of photos it is {photosImagesShare}. These files are big because their pictures are big, and nothing else matters much.',
        'The scanned NASA report has {reportPages} pages, each one a black and white picture. The pictures are {reportImagesShare} of it, and the rest is the structure that holds that many pages together. The IRS form has no pictures at all: its {formFontCount} embedded fonts are {formFontsShare} of the file, and the form fields and page text make up the other {formOtherShare}.',
        'The lecture notes mix everything: {bookImageCount} pictures are {bookImagesShare} of the file, {bookFontCount} embedded font programs are another {bookFontsShare}, and the {bookPages} pages of text and drawings are the rest. The table under "What we measured" has every file.',
      ],
    },
    {
      heading: 'Pictures: the usual suspect',
      paragraphs: [
        'A photo straight from a phone has millions of pixels, far more than a page needs on a screen or even in print. When such a photo goes into a PDF at full size, the PDF carries every pixel. A scan does the same: scanning at a high resolution, in color, makes each page a large picture.',
        'This is where compression helps the most, because pictures can lose detail nobody sees. It is also why the same tool gains almost nothing on a PDF of text: there is nothing heavy to make lighter.',
      ],
    },
    {
      heading: 'Fonts, forms and structure',
      paragraphs: [
        'A PDF carries the fonts it needs, so it looks the same on any computer. A document set in many typefaces, or one that embeds whole fonts instead of only the letters it uses, gets heavier for it. Forms add their own weight: every field is an object, and some forms carry a second description of themselves for older software.',
        'None of this can be squeezed the way a photo can. A lossless rewrite can pack the structure more tightly and drop what is repeated, which is a modest gain, never a dramatic one.',
      ],
    },
    {
      heading: 'What each mode of Compress PDF did',
      paragraphs: [
        'Lossless rewrites the file without touching any picture. It took {reportLosslessRatio_off} off the scanned report and {formLosslessRatio_off} off the tax form, and almost nothing off the files whose weight is in pictures: the PDF of photos went from {photosTotal} to {photosLossless}.',
        'Recommended also recompresses the color and gray photos inside, at no more than the resolution a page needs. On the PDF of photos it took {photosRecommendedRatio_off} off, and on the scanned book page {scanRecommendedRatio_off}. On the scanned report it gave the same result as Lossless, because black and white scans are stored in a way this mode does not recompress.',
        'Strong turns every page into a picture. On the PDF of photos it took {photosStrongChromiumRatio_off} off, and on the scanned book page {scanStrongChromiumRatio_off}. It has a cost: the text can no longer be selected or searched, and form fields, links and bookmarks are lost.',
      ],
    },
    {
      heading: 'When the file comes back the same',
      paragraphs: [
        'Compress PDF never hands back a file bigger than the one you gave it. When a mode cannot make the file smaller, you get the original back, byte for byte. Of the {accepted} files we compressed, Lossless gave {losslessUnchanged_word} back unchanged and Recommended {recommendedUnchanged_word}: a PDF that was already as small as the rewrite makes it.',
        'Strong gave {strongUnchangedChromium_word} of the {accepted} back unchanged. Text pages drawn as pictures are heavier than the text itself, and a black and white scan stored as a picture of a page is already smaller than a photo of the same page. Strong is for PDFs made of photos, and almost nothing else.',
      ],
    },
    {
      heading: 'If it is still too big',
      paragraphs: [
        'If the PDF is mostly text and still over the limit, compression will not get it there. Split it into parts and send them separately, or remove the pages that are not needed. If it is mostly photos, compress the photos before they go into the PDF, at a size that fits the page.',
        'For a scan you are about to make, a lower resolution and gray instead of color give a much smaller file than any compression afterwards. And when the file has to stay whole, a link to a shared copy often goes where an attachment cannot.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'What we measured',
  measuredIntro: 'First, what each kind of content weighs in our test PDFs. Then the three modes of Compress PDF on every PDF of our tests the tool takes, with the share of the original size that is left.',
  measuredNote: 'Measured on {date}. What takes the space was read with pdf-lib, the library the engine opens files with. Lossless and Recommended ran in Node with the engine of this site, which gives the same bytes as the browser; Strong draws the pages on the canvas, so it was measured through the Compress PDF page in Chromium {chromiumVersion} and in WebKit {webkitVersion} on {system}. The table shows Chromium.',
  tables: [
    {
      heading: 'What takes the space',
      caption: 'Our test PDFs: pages, size, and how much of it is pictures, fonts and everything else',
      head: ['File', 'Pages', 'Size', 'Pictures', 'Fonts', 'Everything else'],
    },
    {
      heading: 'Compress PDF, mode by mode',
      caption: 'Every PDF of our tests that Compress PDF takes: its size before, and after each mode, with the share of the original that is left',
      head: ['File', 'Before', 'Lossless', 'Recommended', 'Strong'],
    },
  ],
  sourcesHeading: 'Sources',
  sources: [
    { id: 'gmail', label: 'Gmail Help: Send attachments with your Gmail message', href: 'https://support.google.com/mail/answer/6584?hl=en', read: '2026-11-01' },
    { id: 'outlook', label: 'Microsoft Support: Sending limits in Outlook.com', href: 'https://support.microsoft.com/en-us/outlook/sending-limits-in-outlook-com', read: '2026-11-01' },
    { id: 'adobe', label: 'Adobe: Why is my PDF so big?', href: 'https://www.adobe.com/acrobat/hub/why-is-pdf-so-big.html', read: '2026-11-01' },
  ],
  facts: {
    gmailLimit: { text: '25 MB', source: 'gmail' },
    outlookLimit: { text: '25 MB', source: 'outlook' },
  },
  names: [],
  relatedHeading: 'Related tools and guides',
};

export default texts;
