import type { ImageToolTexts, PdfOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'Image to PDF online, no upload',
  description:
    'Turn JPG, PNG and WebP images into one PDF in your browser, one image per page. No upload, no limit on images, and no GPS data or file names in the PDF.',
  h1: 'Image to PDF',
  howHeading: 'How to turn images into a PDF',
  howSteps: [
    'Drop your images on the box, choose them, or paste them with Ctrl V.',
    'Pick Image size, Letter or A4 for the pages, and put the list in the order you want: drag a row, or press its arrow buttons (they work with the keyboard too).',
    'Download your PDF.',
  ],
  specsHeading: 'Specifications',
  specs: {
    caption: 'Image to PDF: formats taken, output and limits',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'JPG, PNG and WebP, recognized from the file content and not from the name.'],
      ['Output', 'One PDF for the whole batch, with one image per page, in the order of the list.'],
      ['Image size', 'The default. Each page takes the size of its image, with no white border.'],
      ['Letter and A4', 'The whole image fits inside the sheet with a margin of 0.5 inch, which is 36 points. The sheet turns to match each image.'],
      ['Images in the PDF', 'Photos go in as JPG, saved again from the pixels, which can cost a little quality. Images with transparency go in as PNG, without loss. The photo orientation is applied.'],
      ['PDF details', 'The PDF has no title or author taken from your file names. FileOrca is only named as the program that made it.'],
      ['Batch', 'No limit on the number of images. A batch always gives one PDF.'],
      ['Metadata', 'Exif, XMP, IPTC and GPS never reach the PDF.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Which page size should I choose?',
      a: 'Image size suits photos you only want to view on a screen. Letter and A4 are standard sheets, for printing or for forms that ask for a normal page.',
    },
    {
      q: 'Can I change the list after the PDF is made?',
      a: 'Yes. The trash button on a row takes that image out, and Undo brings it back. If the PDF is already made and you change the order, Oli makes it again without preparing the images again.',
    },
    {
      q: 'Why is my PDF so big?',
      a: 'A PDF is about as heavy as the images inside it. Use Compress image or Resize image on the photos first, then build the PDF from the lighter copies.',
    },
    {
      q: 'Can I put HEIC photos from my iPhone into a PDF?',
      a: 'Not directly. Convert them with HEIC to JPG first, then add the JPG files here. An AVIF goes through AVIF to JPG the same way.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your images are put into the PDF on your device and never sent to a server.',
  relatedHeading: 'More image tools',
  panel: {
    formats: 'JPG, PNG or WebP',
    progressLabel: 'Building your PDF',
    done: 'Done! Your PDF is ready.',
    doneMany: 'Done! Your PDF with {count} pages is ready.',
    options: {
      legend: 'Page size',
      image: 'Image size',
      letter: 'Letter',
      a4: 'A4',
      help: 'One image per page, in the order of the list. Letter and A4 keep a 0.5 inch margin.',
    },
  },
} satisfies ImageToolTexts<PdfOptionsTexts>;
