// STUB-IDIOMAS: copy of the English text, replaced by the writer of the lot.
import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Why Is My PDF So Large? What Fills It and What Shrinks It',
  description: 'What takes the space inside a PDF, measured on our test PDFs, and what each mode of Compress PDF did to them, including when the file came back the same.',
  h1: 'Why is my PDF so large?',
  lead: 'A PDF is a container, and the size depends on what went into it. Find out which part is heavy before you try to shrink it.',
  changed: 'First version, with the measurements of {date}.',
  intro: [
    'A PDF is as heavy as what went into it. In the {spaceFiles_word} test PDFs whose contents we weighed, the heaviest owe most of their weight to pictures, and a scan is pictures too, one per page. Fonts come next. Adobe’s guide names the same two causes: it says the resolution and the bit depth of an image can directly affect the size of the file, and that adding a single font can sometimes increase it substantially.',
    'Email is one limit you can run into. A personal Gmail account sends attachments up to {gmailLimit}, and Outlook.com takes attachments up to {outlookLimit}. Above that, the file needs to get smaller, be split, or travel as a link.',
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
      heading: 'Pictures: the weight of our heaviest PDFs',
      paragraphs: [
        'A photo straight from a phone has millions of pixels, far more than a page needs on a screen or even in print. When such a photo goes into a PDF at full size, the PDF carries every pixel. A scan does the same: scanning at a high resolution, in color, makes each page a large picture.',
        'This is where the Recommended and Strong modes of Compress PDF can help, because pictures can lose detail nobody sees. A PDF with no pictures can only get lighter by a rewrite of its structure, and how much that gave on our files is in the next section.',
      ],
    },
    {
      heading: 'Fonts, forms and structure',
      paragraphs: [
        'A PDF carries the fonts it needs, so it looks the same on any computer. A document set in many typefaces, or one that embeds whole fonts instead of only the letters it uses, gets heavier for it. Forms add their own weight: every field is an object, and some forms carry a second description of themselves for older software.',
        'None of this can be squeezed the way a photo can. A lossless rewrite packs the structure more tightly and drops what is repeated, and what that gives depends on how the file was written. Our long text-only PDF, which our test script wrote without packing anything, lost {textOnlyLosslessRatio_off} of its size to it. The lecture notes, a real document, lost only {bookLosslessSaved} of {bookTotal}.',
      ],
    },
    {
      heading: 'What each mode of Compress PDF did',
      paragraphs: [
        'Lossless rewrites the file without touching any picture. It took {reportLosslessRatio_off} off the scanned report and {formLosslessRatio_off} off the tax form. On the PDF of photos, whose weight is in its pictures, it saved only {photosLosslessSaved_exact} of {photosTotal}.',
        'Recommended also recompresses the color and gray photos inside, at no more than the resolution a page needs. On the PDF of photos it took {photosRecommendedRatio_off} off, and on the scanned book page {scanRecommendedRatio_off}. On the scanned report it gave the same result as Lossless, because black and white scans are stored in a way this mode does not recompress.',
        'Strong turns every page into a picture. On the PDF of photos it took {photosStrongChromiumRatio_off} off, and on the scanned book page {scanStrongChromiumRatio_off}. It has a cost: the text can no longer be selected or searched, and form fields, links and bookmarks are lost.',
      ],
    },
    {
      heading: 'When the file comes back the same',
      paragraphs: [
        'Compress PDF never hands back a file bigger than the one you gave it. When a mode cannot make the file smaller, you get the original back, byte for byte. Of the {accepted} files we compressed, Lossless gave {losslessUnchanged_word} back unchanged and Recommended {recommendedUnchanged_word}: a PDF that was already as small as the rewrite makes it.',
        'Strong gave {strongUnchangedChromium_word} of the {accepted_word} back unchanged. Text pages drawn as pictures are heavier than the text itself, and a black and white scan stored as a picture of a page is already smaller than a photo of the same page. In our tests, Strong did better than Recommended only on the PDF of photos and the scanned book page.',
      ],
    },
    {
      heading: 'If it is still too big',
      paragraphs: [
        'If the PDF is mostly text and still over the limit after Lossless, split it into parts and send them separately, or remove the pages that are not needed. If it is mostly photos, compress the photos before they go into the PDF, at a size that fits the page.',
        'For a scan you are about to make, a lower resolution and gray instead of color make each page a smaller picture from the start. And when the file has to stay whole, a link to a shared copy can go where an attachment cannot.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'What we measured',
  measuredIntro: 'First, what each kind of content weighs in {spaceFiles_word} of our test PDFs. Then each mode of Compress PDF on the {accepted} PDFs of our tests the tool takes, with the share of the original size that is left.',
  measuredNote: 'Measured on {date}. The scanned pages, the NASA report, the IRS form and the lecture notes are real documents; the other test PDFs were written by our own test script. What takes the space was read with pdf-lib, the library the engine opens files with. Lossless and Recommended ran in Node with the engine of this site, which gives the same bytes as the browser; Strong draws the pages on the canvas, so it was measured through the Compress PDF page in Chromium {chromiumVersion} and in WebKit {webkitVersion} on {system}. The table shows Chromium.',
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
