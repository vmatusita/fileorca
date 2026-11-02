// F6: esqueleto copiado do inglês até a tradução substituir este arquivo (o english-leak.test.ts reprova o que sobrar).
import type { ImageToolTexts, PdfOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'Image to PDF online, no upload',
  description:
    'Turn JPG, PNG and WebP images into one PDF in your browser, one image per page. No upload, no limit on images, and no GPS data or file names in the PDF.',
  h1: 'Image to PDF',
  howHeading: 'How to turn images into a PDF',
  howSteps: [
    'Drop your images on the box, choose them, or paste them with Ctrl V.',
    'Pick Image size, Letter or A4 for the pages, and check that the list is in the order you want.',
    'Download your PDF.',
  ],
  specsHeading: 'Specifications',
  specs: {
    caption: 'Image to PDF: formats taken, output and limits',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'JPG, PNG and WebP, recognized from the file content and not from the name. HEIC photos go through HEIC to JPG first, and AVIF files are not accepted.'],
      ['Output', 'One PDF for the whole batch, with one image per page, in the order of the list.'],
      ['Image size', 'The default. Each page takes the size of its image, with no white border.'],
      ['Letter and A4', 'The whole image fits inside the sheet with a margin of 0.5 inch, which is 36 points. The sheet turns to match each image.'],
      ['Images in the PDF', 'Photos go in as JPG, and images with transparency go in as PNG. Both are saved again from the pixels, with the photo orientation applied.'],
      ['PDF details', 'The PDF has no title or author taken from your file names. FileOrca is only named as the program that made it.'],
      ['Batch', 'No limit on the number of images. A batch always gives one PDF.'],
      ['Metadata', 'Exif, XMP, IPTC and GPS never reach the PDF.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'How do I put several images into one PDF?',
      a: 'Drop them all together. Oli puts one image on each page, in the order of the list, and gives you one PDF.',
    },
    {
      q: 'Which page size should I choose?',
      a: 'Image size makes each page the size of its picture, which suits photos you only want to view. Letter and A4 are standard sheets for printing, or for forms that ask for a normal page; the image sits inside the sheet with a margin.',
    },
    {
      q: 'How do I change the order of the pages?',
      a: 'The pages follow the order of the list on screen. If a page is in the wrong place, press Start over and add the files again in the order you want.',
    },
    {
      q: 'Will my photos lose quality in the PDF?',
      a: 'A photo is saved again as a JPG when it goes in, which can cost a little quality. An image with transparency goes in as a PNG, without loss.',
    },
    {
      q: 'Does the PDF include the location of my photos?',
      a: 'No. Images go into the PDF from their pixels and not from the original file, so Exif and GPS data are not carried over. The PDF also has no title or author taken from your file names.',
    },
    {
      q: 'Why is my PDF so big?',
      a: 'A PDF is about as heavy as the images inside it. Use Compress image or Resize image on the photos first, then build the PDF from the lighter copies.',
    },
    {
      q: 'Can I put HEIC photos from my iPhone into a PDF?',
      a: 'Not directly. Convert them with HEIC to JPG first, then add the JPG files here.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your images are put into the PDF on your device and never sent to a server. The PDF leaves out the photo metadata, including the GPS location.',
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
