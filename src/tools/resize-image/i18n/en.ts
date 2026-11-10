import type { ImageToolTexts, ResizeOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'Resize image online, no upload',
  description:
    'Resize a JPG, PNG or WebP image by pixels or by percentage in your browser. No upload, no limit on images, and photo metadata like GPS is removed.',
  h1: 'Resize image',
  howHeading: 'How to resize an image',
  howSteps: [
    'Drop your images on the box, choose them, or paste them with Ctrl V.',
    'Pick By size and type a width and a height, or pick By percentage and type a number.',
    'Download the resized image, or the ZIP when you resized several.',
  ],
  specsHeading: 'Specifications',
  specs: {
    caption: 'Resize image: formats taken, output and limits',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'JPG, PNG and WebP, recognized from the file content and not from the name. HEIC photos go through HEIC to JPG first, and AVIF files through AVIF to JPG.'],
      ['By size', 'You type a width and a height in pixels. The proportions stay locked, and each image fits inside that box.'],
      ['By percentage', 'You type a percentage of the current width and height, the same for every image in the batch.'],
      ['Never enlarges', 'If you ask for more pixels than the image has, it keeps its original size, and the result says so.'],
      ['Output', 'The same format as the file you dropped. PNG and WebP keep their transparency.'],
      ['Quality', 'JPG and WebP are saved again after the resize. PNG is saved without loss.'],
      ['Batch', 'No limit on the number of images. One image downloads directly, and several come in one ZIP.'],
      ['Large photos', 'Images above 16,777,216 pixels, about 16.8 megapixels, are resized without the browser canvas, so they work too.'],
      ['Metadata', 'Exif, XMP, IPTC and GPS are removed, and the photo orientation is applied.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'How do I resize an image to a specific size in pixels?',
      a: 'Choose By size, then type the width and the height you need. The proportions stay locked, so each image fits inside that box: a 4000 × 3000 photo in a 1000 × 1000 box comes out as 1000 × 750.',
    },
    {
      q: 'Does resizing lower the quality of an image?',
      a: 'Making an image smaller keeps it sharp at its new size. Making it larger can only stretch the pixels it already has, which looks blurry, so Resize image never enlarges: if you ask for more pixels than the image has, you get the original size back and the result tells you so.',
    },
    {
      q: 'Should I resize by pixels or by percentage?',
      a: 'Use pixels when a form or a website asks for a size, such as 800 × 600. Use a percentage when you only want everything smaller by the same amount, such as 50% for half the width and half the height. In a batch of mixed photos, a percentage shrinks each one by the same amount, while a size makes each one fit the same box.',
    },
    {
      q: 'Does changing the DPI change the size of an image?',
      a: 'DPI is a print setting, and what counts on a screen is the number of pixels. Resize image changes the pixels, so it changes how large the image looks on a web page and how heavy the file is.',
    },
    {
      q: 'Will the file be lighter after I resize it?',
      a: 'Usually yes, because fewer pixels make a smaller file. For an exact file size, such as 100 KB, use Compress image to 100 KB.',
    },
    {
      q: 'Does my image get uploaded anywhere?',
      a: "No. FileOrca resizes the image on your device, in your browser. Open your browser's Network tab while you resize: no request carries your file.",
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your images are resized on your device and never sent to a server. The saved copies leave out the photo metadata, including the GPS location.',
  relatedHeading: 'More image tools',
  presets: {
    heading: 'Ready-made sizes',
    caption: 'Presets of Resize image and what each one does',
    head: ['Preset', 'What it does'],
  },
  panel: {
    formats: 'JPG, PNG or WebP',
    progressLabel: 'Resizing images',
    done: 'Done! Your image is resized.',
    doneMany: 'Done! Your {count} images are resized.',
    options: {
      legend: 'Resize',
      bySize: 'By size',
      byPercent: 'By percentage',
      width: 'Width',
      height: 'Height',
      percent: 'Percentage',
      px: 'px',
      pct: '%',
      fitNote: 'Each image fits inside this box and keeps its proportions.',
      invalid: 'Type a whole number from 1 to {max}.',
    },
  },
} satisfies ImageToolTexts<ResizeOptionsTexts>;
