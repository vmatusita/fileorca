import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'How to Turn Photos Into One PDF, and Keep It Small Enough to Send',
  description: 'How to put several photos into one PDF on a phone or a computer, what the PDF weighs, and what compressing the photos first does to it.',
  h1: 'How to turn photos into one PDF',
  lead: 'Receipts, pages of a contract, a few photos for a form: one PDF is easier to send and to print than a pile of images. Here is how to make it, and how heavy it gets.',
  changed: 'First version, with the measurements of {date}.',
  intro: [
    'A PDF of photos keeps them in order, prints each one on its own page and opens on any computer or phone. Many forms and offices also ask for exactly that: one PDF, not a set of images.',
    'The catch is size. Put into one PDF, our {photos_word} phone photos made a file {pdfRatioChromium} as heavy as the photos themselves. We measured what happens to the size, with and without compressing the photos first.',
  ],
  toolHeading: 'Turn your photos into one PDF here',
  toolIntro: 'Drop your photos in the order you want them, or drag them into order. Each one becomes a page, the PDF is made in this browser tab, and nothing is uploaded.',
  sections: [
    {
      heading: 'On an iPhone',
      paragraphs: [
        'Apple’s Preview app on the iPhone can export an image as a PDF, and Apple notes it can also compress the file on the way. To add more photos, Apple’s guide describes inserting an image into a PDF: touch and hold a page thumbnail, then tap Insert from File. That makes a PDF of photos one insert at a time.',
      ],
    },
    {
      heading: 'On a computer',
      paragraphs: [
        'Windows includes a printer called Microsoft Print to PDF, which Microsoft describes as part of Windows 10 and Windows 11. From an app that prints your photos, choose it in the list of printers and the pages are saved as a PDF instead of printed. The page size and margins come from the print settings, so check them before you save.',
        'The tool on this page works the same way on a computer and on a phone, in the browser: drop the photos, set the page size if you need Letter or A4, and download one PDF.',
      ],
    },
    {
      heading: 'What the tool does with each photo',
      paragraphs: [
        'By default each page is the size of its photo, so nothing is cropped and no white border is added. You can also choose Letter or A4, and each photo then sits on the page with a margin. Photos are written into the PDF as JPGs at a high quality; an image with transparency goes in as PNG, so the transparent parts stay clear.',
        'Every photo is written again from its pixels. That is what keeps the location and the camera details out of the PDF: our PDF carried {pdfGpsChromium_word} GPS data, though every photo we put in had it.',
      ],
    },
    {
      heading: 'How heavy the PDF gets',
      paragraphs: [
        'Our {photos_word} real phone photos weighed {photosTotal} together. Put straight into one PDF, they made a file of {pdfChromium}, which is {pdfRatioChromium} of the photos. Almost all of that is the photos themselves: the pictures inside the PDF weighed {pdfImagesChromium}.',
        'The PDF came out a little lighter than the photos only because the tool saves the pictures at its own quality, a bit lower than the phone cameras used. It is not compression in any real sense.',
      ],
    },
    {
      heading: 'Compress the photos first',
      paragraphs: [
        'We then ran the same photos through Compress image first, at its Recommended level. They came out at {compressedChromium}, {compressedRatioChromium_off} lighter than the originals. Turned into one PDF, they made a file of {pdfAfterChromium}, which is {pdfAfterRatioChromium} of the original photos.',
        'That PDF is still {pdfAfterVsCompressedChromium_more} heavier than the compressed photos it was made from. The reason is the step above: Image to PDF writes each photo again at its own high quality, and that takes back part of the saving. The order still pays off, but if the PDF has to be as small as possible, compress the finished PDF too.',
      ],
    },
    {
      heading: 'Photos of documents',
      paragraphs: [
        'When the photos are of paper, a little care before the PDF makes a better file. Crop each photo to the sheet, so the table, the floor and your fingers stay out of it, and turn any photo that came out sideways. Crop image and Rotate image do both in the browser, before the photos go into the PDF.',
        'Take the photos in good light and straight from above. A sharp photo of a page reads well at a much smaller size than a blurry one, so it also compresses better.',
      ],
    },
    {
      heading: 'Photos from an iPhone',
      paragraphs: [
        'Image to PDF takes JPG, PNG and WebP. An iPhone saves photos as HEIC by default, so turn them into JPGs first with HEIC to JPG, then put the JPGs into one PDF. Our guide on converting HEIC to JPG explains the formats and the settings that avoid HEIC altogether.',
      ],
    },
    {
      heading: 'A short routine',
      paragraphs: [
        'Put the photos in order, compress them if the PDF has to be emailed, then turn them into one PDF. If it is still too heavy, run Compress PDF on it: our guide to large PDFs shows what each mode does to a PDF of photos.',
        'Keep the original photos. The PDF is for sending and printing; the photos are the copy you can always go back to.',
      ],
    },
  ],
  half: 4,
  measuredHeading: 'What we measured',
  measuredIntro: 'Our {photos_word} real phone photos, straight into one PDF, and again after Compress image. The share is against the original photos.',
  measuredNote: 'Measured on {date} through the Image to PDF and Compress image pages of this site in Chromium {chromiumVersion} and in WebKit {webkitVersion} on {system}, which gave the same sizes, on our real phone photos at the default settings. The pictures inside the PDF were counted with pdf-lib.',
  tables: [
    {
      heading: 'Photos and the PDF',
      caption: 'Each step: the original photos, the PDF made from them, the photos after Compress image and the PDF made from those, with the share of the original size',
      head: ['Step', 'Size', 'Of the original photos'],
      labels: ['The original photos', 'One PDF of the photos', 'The photos after Compress image', 'One PDF of the compressed photos'],
    },
  ],
  sourcesHeading: 'Sources',
  sources: [
    { id: 'apple-preview-export', label: 'Apple iPhone User Guide: Export or compress PDFs and images in Preview on iPhone', href: 'https://support.apple.com/guide/iphone/iph61c20afe1/ios', read: '2026-11-01' },
    { id: 'apple-preview-pages', label: 'Apple iPhone User Guide: Add, delete, rotate, move, or crop PDF pages in Preview on iPhone', href: 'https://support.apple.com/guide/iphone/iphbf4977cff/ios', read: '2026-11-01' },
    { id: 'ms-print-to-pdf', label: 'Microsoft Support: Save an Outlook message as a .eml file, a PDF file, or as a draft', href: 'https://support.microsoft.com/en-us/outlook/mail/save-an-outlook-message-as-a-eml-file-a-pdf-file-or-as-a-draft', read: '2026-11-01' },
  ],
  facts: {},
  names: ['Windows 10', 'Windows 11', 'A4'],
  relatedHeading: 'Related tools and guides',
};

export default texts;
