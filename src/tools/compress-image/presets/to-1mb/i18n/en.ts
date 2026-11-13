import type { ImageToolTexts, PresetOptionsTexts } from '../../../../../i18n/types.ts';

export default {
  title: 'Compress image to 1 MB online, no upload',
  description:
    'Compress a JPG, PNG or WebP image to 1 MB or less in your browser, for uploads with a size limit. No upload, no limit on images, and GPS data is removed.',
  h1: 'Compress image to 1 MB',
  howHeading: 'How to get an image under 1 MB',
  howSteps: [
    'Drop the photos that are too big on the box, choose them, or paste them with Ctrl V.',
    'Oli brings each one under the limit, and there is nothing to set.',
    'Download the compressed image.',
  ],
  specsHeading: 'The 1 MB target',
  specs: {
    caption: 'What the 1 MB preset guarantees and what it changes',
    head: ['Detail', 'What Oli does'],
    rows: [
      ['Target', 'Every file is 1 MB or smaller.'],
      ['Output format', 'Always a JPG. JPG, PNG and WebP go in.'],
      ['Transparency', 'Transparent areas turn white, because JPG has no transparency.'],
      ['Image already under 1 MB', 'It comes back unchanged except for the metadata, in its own format.'],
      ['Photo that is too detailed', 'If the quality alone cannot reach the target, Oli also reduces the dimensions and tells you the new width and height.'],
      ['Batch', 'Several images download together as one ZIP.'],
      ['Metadata', 'Exif, XMP, IPTC and GPS are not kept in the new files.'],
    ],
  },
  faqHeading: 'Questions about 1 MB',
  faq: [
    {
      q: 'Why does my upload say the file is over 1 MB?',
      a: 'Phone and camera photos are commonly several megabytes, while profile pictures, support tickets and application forms often take only 1 MB. Compressing to 1 MB gets the same photo through.',
    },
    {
      q: 'Is 1 MB the same as 1,024 KB?',
      a: 'Not exactly. By the standard, 1 MB is 1,000,000 bytes, while 1,024 KB is 1,048,576 bytes, about 5% more. Oli targets 1,000,000 bytes, so the file fits under both.',
    },
    {
      q: 'Can I keep the original format, such as PNG?',
      a: 'Not for a file that has to shrink: a PNG photo cannot be squeezed to a set size without changing its pixels, and JPG is accepted nearly everywhere.',
    },
    {
      q: 'How much quality do I lose at 1 MB?',
      a: 'Often very little, because a large photo has more detail than a screen shows. Oli searches for the best quality that fits under 1 MB, and the before and after slider lets you check the result.',
    },
    {
      q: 'Why did my picture also get smaller in pixels?',
      a: 'Lowering the quality further would make a very detailed image look blocky, and fewer pixels at a good quality look better.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your photos are shrunk to 1 MB on your device and never sent to a server.',
  relatedHeading: 'More image tools',
  panel: {
    formats: 'JPG, PNG or WebP',
    progressLabel: 'Compressing images',
    done: 'Done! Your image is {percent} lighter and fits in 1 MB.',
    doneMany: 'Done! Your {count} images are ready, each 1 MB or less.',
    placardLabel: 'lighter',
    options: {
      note: 'Each image comes out as a JPG of 1 MB or less. Transparency turns white.',
    },
  },
} satisfies ImageToolTexts<PresetOptionsTexts>;
