import type { ImageToolTexts, PresetOptionsTexts } from '../../../../../i18n/types.ts';

export default {
  title: 'Compress image to 100 KB online, no upload',
  description:
    'Compress a JPG, PNG or WebP image to 100 KB or less in your browser, for forms that set a size limit. No upload, no limit on images, and GPS data is removed.',
  h1: 'Compress image to 100 KB',
  howHeading: 'How to get an image under 100 KB',
  howSteps: [
    'Drop the images that a form refused on the box, choose them, or paste them with Ctrl V.',
    'Oli saves each one as a JPG of 100 KB or less, and makes the picture smaller too when the detail is too much.',
    'Check the new size on the result, then download the image or the ZIP.',
  ],
  specsHeading: 'The 100 KB target',
  specs: {
    caption: 'What the 100 KB preset guarantees and what it changes',
    head: ['Detail', 'What Oli does'],
    rows: [
      ['Target', 'Every file is 100,000 bytes or smaller.'],
      ['Which KB', 'KB is read as 1,000 bytes, the smaller of the two readings, so the file also passes forms that count 1,024 bytes per KB.'],
      ['Output format', 'Always a JPG, the format that forms and portals ask for most. JPG, PNG and WebP go in.'],
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
      a: 'JPG is the format that forms ask for most, and it reaches a small size far better than PNG for photos. A PNG photo of a few megabytes cannot be squeezed to 100 KB without changing its pixels. Transparent areas turn white, because JPG has no transparency.',
    },
    {
      q: 'Will the picture look worse at 100 KB?',
      a: 'A little, because the file gets much smaller. When the image is large, Oli first reduces its dimensions, which keeps it sharp, and then searches for the best quality that still fits. The before and after slider shows you the difference.',
    },
    {
      q: 'What if the form also asks for an exact size in pixels?',
      a: 'Use Resize image to set the width and the height first, then come back here for the file size. If the picture is very detailed, Oli may reduce the dimensions a bit more, and it tells you the new size.',
    },
    {
      q: 'What if my image is already under 100 KB?',
      a: 'It comes back as it was, in its own format, without the photo metadata. Oli never gives you a file bigger than the one you dropped.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your images are shrunk to 100 KB on your device and never sent to a server. The new files leave out the photo metadata, including the GPS location.',
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
