import type { ImageToolTexts, SaveAsOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'WebP to JPG online, no upload',
  description:
    'Convert WebP images to JPG or PNG in your browser. No upload, no limit on images, an animated WebP becomes its first frame, and GPS data is removed.',
  h1: 'WebP to JPG',
  howHeading: 'How to convert WebP to JPG',
  howSteps: [
    'Drop your WebP images on the box, choose them, or paste them with Ctrl V.',
    'Keep JPG, or pick PNG.',
    'Download the converted image.',
  ],
  specsHeading: 'Specifications',
  specs: {
    caption: 'WebP to JPG: formats taken, output and limits',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'WebP files, still or animated, recognized from the file content and not from the name.'],
      ['Output', 'JPG, which is the default, or PNG. One file comes out for each WebP.'],
      ['Transparency', 'JPG has no transparency, so it turns white. PNG keeps it.'],
      ['Animated WebP', 'It becomes its first frame, and the result says so.'],
      ['Size', 'A JPG of the same picture is often larger than the WebP, and a PNG is larger still for photos.'],
      ['Batch', 'No limit on the number of images. One image downloads directly, and several come in one ZIP.'],
      ['Metadata', 'Exif, XMP, IPTC and GPS are removed, and the photo orientation is applied.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Why do websites save images as WebP?',
      a: 'Pages that use WebP load faster, so many sites send it to browsers that support it, and your browser then saves what it received. A JPG made from it opens in every editor and form.',
    },
    {
      q: 'Can I convert an animated WebP to JPG?',
      a: 'Yes, but a JPG is a single picture, so the movement is lost. To keep it, keep the WebP.',
    },
    {
      q: 'Why is the JPG bigger than the WebP?',
      a: 'WebP is a newer format that stores the same picture in fewer bytes than JPG. Going back to JPG gives up part of that saving in exchange for a file that every app and website accepts.',
    },
    {
      q: 'Can I just rename the .webp file to .jpg?',
      a: 'No. Renaming changes only the name, and the data inside is still WebP, so some apps and forms still refuse it. Converting writes a real JPG.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your images are converted on your device and never sent to a server.',
  relatedHeading: 'More image tools',
  panel: {
    formats: 'WebP',
    progressLabel: 'Converting images',
    done: 'Done! Your image is converted.',
    doneMany: 'Done! Your {count} images are converted.',
    options: {
      legend: 'Save as',
      jpg: 'JPG',
      png: 'PNG',
      help: 'JPG opens everywhere, and it can come out bigger than the WebP. Transparency turns white. PNG keeps transparency, but the file is bigger.',
    },
  },
} satisfies ImageToolTexts<SaveAsOptionsTexts>;
