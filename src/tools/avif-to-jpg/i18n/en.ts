import type { ImageToolTexts, NoteOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'AVIF to JPG online, no upload',
  description:
    'Convert AVIF images to JPG in your browser. No upload, no limit on images, transparency turns white and GPS data is removed.',
  h1: 'AVIF to JPG',
  howHeading: 'How to convert AVIF to JPG',
  howSteps: [
    'Drop your AVIF images on the box, choose them, or paste them with Ctrl V.',
    'Oli turns each one into a JPG, and there is nothing to set.',
    'Download the JPG, or the ZIP when you converted several.',
  ],
  specsHeading: 'Specifications',
  specs: {
    caption: 'AVIF to JPG: formats taken, output and limits',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'AVIF files, recognized from the file content and not from the name.'],
      ['Output', 'JPG. One file comes out for each AVIF.'],
      ['Transparency', 'JPG has no transparency, so it turns white, and the result says so.'],
      ['Size', 'A JPG of the same picture is usually larger than the AVIF, because AVIF compresses better.'],
      ['Batch', 'No limit on the number of images. One image downloads directly, and several come in one ZIP.'],
      ['Metadata', 'Exif, XMP, IPTC and GPS are removed, and the photo orientation is applied.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'How do I open an AVIF file on Windows?',
      a: 'Current versions of Chrome, Edge and Firefox open AVIF, so you can drag the file into one of them. Some editors and older apps cannot open it, and a JPG made from the file opens everywhere.',
    },
    {
      q: 'Why does a website refuse my AVIF image?',
      a: 'Many upload forms and older apps accept only JPG, PNG or similar formats. Renaming .avif to .jpg does not help, because the data inside is still AVIF. Converting writes a real JPG.',
    },
    {
      q: 'Does converting AVIF to JPG lose quality?',
      a: 'JPG compresses with loss, so the new file is not a perfect copy, and it is usually larger than the AVIF. Keep the AVIF if you need the original.',
    },
    {
      q: 'What happens to a transparent background?',
      a: 'JPG cannot store transparency, so FileOrca fills those areas with white, and the result tells you so.',
    },
    {
      q: 'Why do some images come as AVIF?',
      a: 'AVIF files are often much smaller than JPG files at a similar look, so many websites send them to browsers that support the format, and your browser saves what it received.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your images are converted on your device and never sent to a server. The JPG files leave out the photo metadata, including the GPS location.',
  relatedHeading: 'More image tools',
  panel: {
    formats: 'AVIF',
    progressLabel: 'Converting images',
    done: 'Done! Your image is converted.',
    doneMany: 'Done! Your {count} images are converted.',
    options: {
      note: 'Each AVIF becomes a JPG, with transparency turned white.',
    },
  },
} satisfies ImageToolTexts<NoteOptionsTexts>;
