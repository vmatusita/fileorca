import type { ImageToolTexts, NoteOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'PNG to JPG online, no upload',
  description:
    'Turn PNG images into JPG, or JPG images into PNG, in your browser. No upload, no limit on images, transparency turns white and GPS data is removed.',
  h1: 'PNG to JPG',
  howHeading: 'How to convert PNG to JPG',
  howSteps: [
    'Drop your PNG or JPG images on the box, choose them, or paste them with Ctrl V.',
    'Oli converts each file, and there is nothing to set.',
    'Download the converted image.',
  ],
  specsHeading: 'Specifications',
  specs: {
    caption: 'PNG to JPG: formats taken, output and limits',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'PNG and JPG files, recognized from the file content and not from the name.'],
      ['Direction', 'It comes from the file: a PNG becomes a JPG, and a JPG becomes a PNG.'],
      ['PNG to JPG', 'Transparency turns white. The file is usually much lighter for photos.'],
      ['JPG to PNG', 'No loss: the PNG holds exactly the pixels of the JPG. The file is usually much bigger, and detail the JPG already lost does not come back.'],
      ['Mixed batch', 'A batch can hold both formats, and each file goes the other way.'],
      ['Batch', 'No limit on the number of images. One image downloads directly, and several come in one ZIP.'],
      ['Metadata', 'Exif, XMP, IPTC and GPS are removed, and the photo orientation is applied.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Why does the transparent part of my PNG turn black?',
      a: 'Some converters fill it with black, because a JPG must have a color in every pixel. To keep the transparency, keep the PNG.',
    },
    {
      q: 'Does PNG to JPG lower the quality?',
      a: 'A little, because JPG compresses with loss. For photos the difference is small. For screenshots, logos and text with sharp edges, JPG can add faint blur around the edges, so keep the PNG for those.',
    },
    {
      q: 'Why is my PNG so much bigger than a JPG?',
      a: 'PNG stores every pixel without loss, which suits logos and screenshots but is heavy for photos, while JPG drops detail the eye barely notices.',
    },
    {
      q: 'Does turning a JPG into a PNG improve the quality?',
      a: 'No. Use it when an app or a form asks for a PNG, or before you edit the picture.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your images are converted on your device and never sent to a server.',
  relatedHeading: 'More image tools',
  panel: {
    formats: 'PNG or JPG',
    progressLabel: 'Converting images',
    done: 'Done! Your image is converted.',
    doneMany: 'Done! Your {count} images are converted.',
    options: {
      note: 'A PNG becomes a JPG, with transparency turned white. A JPG becomes a PNG, without loss.',
    },
  },
} satisfies ImageToolTexts<NoteOptionsTexts>;
