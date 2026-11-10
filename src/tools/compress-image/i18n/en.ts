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
    'Drop your JPG, PNG or WebP images on the box, choose them, or paste them. Add as many as you like.',
    'Pick Recommended or Strong, or Up to a size with the maximum in KB. Oli compresses each image in your browser, one after another, and redoes the batch if you change the level.',
    'Download one image, or all of them together in a ZIP. Your original files stay untouched.',
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
      ['HEIC and AVIF', 'Not compressed here. Turn a HEIC into a JPG first with HEIC to JPG. AVIF files are not accepted.'],
    ],
  },
  presets: {
    heading: 'Compress to a target size',
    lead: 'For any other limit, pick Up to a size above and type the maximum in KB, from 20 to 10,000.',
    caption: 'Presets of Compress image and what each one does',
    head: ['Preset', 'What it does'],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Does compressing an image reduce its quality?',
      a: 'JPG and WebP lose a little detail, because the file is saved again with some information left out. At Recommended the difference is hard to see at normal size, and Strong trades more detail for the smallest file. PNG loses nothing, because Oli saves it without loss. Your original file is never changed, so you can always go back to it.',
    },
    {
      q: 'How do I make an image fit a size limit, like 200 KB?',
      a: 'Pick Up to a size and type the limit in the Maximum size box, in KB. Oli brings each image down to that size or less, as a JPG. A form that counts 1 KB as 1,024 bytes takes it too, because Oli counts 1 KB as 1,000 bytes, the smaller reading. A transparent PNG gets a white background.',
    },
    {
      q: 'Why does my PNG barely get smaller?',
      a: 'PNG keeps every pixel exactly as it is, so there is little to take out, and a photo saved as PNG is large because its tiny color changes are hard to pack. Oli only tidies the file, which often saves a little. If it is a photo and you do not need transparency, saving it as a JPG or WebP usually gives a much smaller file.',
    },
    {
      q: 'What happens to the GPS location in my photo?',
      a: 'Oli saves each compressed copy from the pixels alone, so the GPS location, the camera model and the date taken do not travel to the new file. That also holds when the original comes back unchanged because it was already small: that copy leaves without its photo metadata too.',
    },
    {
      q: 'Can I compress many images at once?',
      a: 'Yes. Drop or paste as many images as you like: Oli compresses them one after another, and each one gets its own download. When you want them all, one button gives you a ZIP. A big batch of large photos takes longer on a phone than on a computer, because your own device does the work.',
    },
    {
      q: 'Does my image get uploaded anywhere?',
      a: "No. FileOrca compresses the images on your device, in your browser. Open your browser's Network tab while you compress: no request carries your files.",
    },
    {
      q: 'Why did the file come back the same size?',
      a: 'Some images are already well compressed. When the new copy would not be smaller, Oli gives you back the original instead of a bigger file, and that copy has no photo metadata either.',
    },
    {
      q: 'Can I compress an iPhone photo in HEIC?',
      a: 'Not here: Compress image takes JPG, PNG and WebP. Turn the HEIC into a JPG with HEIC to JPG first, then compress the JPG if you want it smaller.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Images are processed on your device and are never sent to a server. Each saved copy also leaves out the photo metadata, including the GPS location.',
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
