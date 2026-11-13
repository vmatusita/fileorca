import type { CompressOptionsTexts, ImageToolTexts } from '../../../i18n/types.ts';

// Compress image page blocks (data-content: how, specs, faq, privacy, related) and the panel bits the
// shared island shows. The specs rows state the real behaviour of the engine (src/engine/image/): when the
// quality numbers or the encoders change there, change them here.
export default {
  title: 'Compress image online, free, no upload',
  description:
    'Compress JPG, PNG and WebP images in your browser, one or a whole batch. Nothing is uploaded, and the photo metadata, GPS location included, is removed.',
  h1: 'Compress image',
  howHeading: 'How it works',
  howSteps: [
    'Drop your images on the box, choose them, or paste them.',
    'Pick Recommended or Strong, or Up to a size and type the maximum in KB. Oli compresses each image, one after another, and redoes the batch if you change the level.',
    'Download the compressed images.',
  ],
  specsHeading: 'What goes in and what comes out',
  specs: {
    caption: 'What Compress image takes in and gives back',
    head: ['Detail', 'What happens'],
    rows: [
      ['Formats it takes', 'JPG, PNG and WebP. Oli checks what is inside the file, not its name.'],
      ['JPG', 'Saved again with MozJPEG, an encoder built to make smaller JPG files.'],
      ['PNG', 'Optimized with OxiPNG, with no loss of quality. Recommended and Strong do not change it; Up to a size turns it into a JPG.'],
      ['WebP', 'Saved again as WebP, at the quality of Recommended or Strong; Up to a size turns it into a JPG.'],
      ['Recommended', 'JPG and WebP at quality 75: the best balance between size and looks.'],
      ['Strong', 'JPG and WebP at quality 55: the smallest file, with some loss in fine detail.'],
      ['Up to a size', 'Each image comes out as a JPG of the size you type or less (1 KB = 1,000 bytes), from 20 to 10,000 KB. Oli lowers the quality first, and the dimensions only if it has to. Transparent areas turn white.'],
      ['Batch', 'No limit on the number of images. Several images download together as one ZIP.'],
      ['Already small', 'If the new copy would not be smaller, you get the original back, without its photo metadata.'],
      ['Photo metadata', 'Camera model, date and GPS location are removed from every file.'],
    ],
  },
  presets: {
    heading: 'Compress to a target size',
    lead: 'For any other limit, use Up to a size above.',
    caption: 'Presets of Compress image and what each one does',
    head: ['Preset', 'What it does'],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Does compressing an image reduce its quality?',
      a: 'JPG and WebP lose a little detail, because the file is saved again with some information left out. At Recommended the difference is hard to see at normal size, and the before and after slider on the result shows it up close. Your original file is never changed, so you can always go back to it.',
    },
    {
      q: 'Why does my PNG barely get smaller?',
      a: 'A photo saved as PNG is large because its tiny color changes are hard to pack, and Oli only tidies the file, which often saves a little. If it is a photo and you do not need transparency, PNG to JPG or Convert to WebP usually makes a much smaller file.',
    },
    {
      q: 'Why did the file come back the same size?',
      a: 'Some images are already well compressed by the phone, the camera or the app that saved them, so there is little left to take out.',
    },
    {
      q: 'Can I compress an iPhone photo in HEIC?',
      a: 'Not here. Turn it into a JPG with HEIC to JPG first, then compress the JPG if you want it smaller. An AVIF goes through AVIF to JPG the same way.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Images are processed on your device and are never sent to a server.',
  relatedHeading: 'More image tools',
  panel: {
    formats: 'JPG, PNG or WebP',
    progressLabel: 'Compressing images',
    done: 'Done! Your image is {percent} lighter.',
    doneMany: 'Done! Your {count} images are {percent} lighter.',
    placardLabel: 'lighter',
    adjustHelp: 'Changing the level redoes the image right away.',
    options: {
      legend: 'Compression',
      recommended: 'Recommended',
      recommendedHelp: 'best balance',
      strong: 'Strong',
      strongHelp: 'smallest',
      pngNote: 'PNG is saved without loss, so the level only changes JPG and WebP.',
      // F15 (PLANO-UX-QV, section D; DECISOES § 656 and § 660): the third choice and its field.
      size: 'Up to a size',
      sizeHelp: 'limit in KB',
      maxLabel: 'Maximum size',
      kb: 'KB',
      maxHelp: 'Each image comes out as a JPG of that size or less, and transparency turns white. An image that already fits comes back the same, only without the photo metadata.',
      maxInvalid: 'Type a whole number from {min} to {max}.',
      upTo: 'Up to {n} KB',
    },
  },
} satisfies ImageToolTexts<CompressOptionsTexts>;
