import type { ImageToolTexts, PresetOptionsTexts } from '../../../../../i18n/types.ts';

export default {
  title: 'Compress image to 100 KB online, no upload',
  description:
    'Compress a JPG, PNG or WebP image to 100 KB or less in your browser, for forms that set a size limit. No upload, no limit on images, and GPS data is removed.',
  h1: 'Compress image to 100 KB',
  howHeading: 'How to get an image under 100 KB',
  howSteps: [
    'Drop the images that a form refused on the box, choose them, or paste them with Ctrl V.',
    'Oli compresses each one, and there is nothing to set.',
    'Check the new size on the result, then download the image.',
  ],
  specsHeading: 'The 100 KB target',
  specs: {
    caption: 'What the 100 KB preset guarantees and what it changes',
    head: ['Detail', 'What Oli does'],
    rows: [
      ['Target', 'Every file is 100 KB or smaller.'],
      ['Output format', 'Always a JPG. JPG, PNG and WebP go in.'],
      ['Transparency', 'Transparent areas turn white, because JPG has no transparency.'],
      ['Image that already fits', 'It comes back as it was, in its own format, without the photo metadata.'],
      ['Very detailed image', 'When the quality alone cannot reach the target, Oli also reduces the dimensions and shows you the new width and height.'],
      ['Privacy of the file', 'Exif, XMP, IPTC and GPS are left out of every new file.'],
    ],
  },
  faqHeading: 'Questions about 100 KB',
  faq: [
    {
      q: 'Why does a form ask for an image under 100 KB?',
      a: 'Application forms, exam portals and ID uploads often set small limits, so their servers can store and load millions of files quickly. The limit is usually on the file size, sometimes together with a size in pixels, so read what your form asks for.',
    },
    {
      q: 'Is 100 KB the same as 100,000 bytes?',
      a: 'It depends on the form. By the standard, 1 KB is 1,000 bytes, but some systems, Windows among them, count 1,024 bytes per KB. Oli aims for 100,000 bytes, so the file passes with either count.',
    },
    {
      q: 'Why is the result a JPG, even if I dropped a PNG?',
      a: 'JPG is the format that forms ask for most, and it reaches a small size far better than PNG for photos: a PNG photo of a few megabytes cannot be squeezed to 100 KB without changing its pixels.',
    },
    {
      q: 'Will the picture look worse at 100 KB?',
      a: 'A little, because the file gets much smaller. The before and after slider shows you the difference.',
    },
    {
      q: 'What if the form also asks for an exact size in pixels?',
      a: 'Use Resize image to set the width and the height first, then come back here for the file size.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your images are shrunk to 100 KB on your device and never sent to a server.',
  relatedHeading: 'More image tools',
  panel: {
    formats: 'JPG, PNG or WebP',
    progressLabel: 'Compressing images',
    done: 'Done! Your image is {percent} lighter and fits in 100 KB.',
    doneMany: 'Done! Your {count} images are ready, each 100 KB or less.',
    placardLabel: 'lighter',
    options: {
      note: 'Each image comes out as a JPG of 100 KB or less. Transparency turns white.',
    },
  },
} satisfies ImageToolTexts<PresetOptionsTexts>;
