import type { CompressImageTexts } from '../../../i18n/types.ts';

export default {
  title: 'Compress image online, no upload',
  description:
    'Compress a JPG, PNG or WebP image in your browser. The file is processed on your device, never uploaded, and the GPS data in the photo is removed.',
  h1: 'Compress image',
  fileFallback: 'image',
  drop: {
    title: 'Drop an image here',
    choose: 'Choose image',
    helpDesktop: 'or paste with {kbd} · JPG, PNG or WebP, one at a time',
    help: 'JPG, PNG or WebP, one at a time',
    pasteKey: 'Ctrl V',
    over: "Let go, Oli's ready",
    overHelp: 'One image',
    errorTitle: "Oops, Oli couldn't read this file",
    errorHelp: "{name} isn't an image Oli can read. Try a JPG or PNG.",
    chooseAnother: 'Choose another file',
  },
  options: {
    legend: 'Compression',
    recommended: 'Recommended',
    recommendedHelp: 'best balance',
    strong: 'Strong',
    strongHelp: 'smallest',
    pngNote: 'PNG is saved without loss, so the level only changes JPG and WebP.',
  },
  progress: {
    label: 'Compressing image',
    working: 'Oli is on it…',
  },
  result: {
    done: 'Done! Your image is {percent} lighter.',
    unchanged: 'This image was already optimized, so Oli kept the original image, without the photo metadata.',
    cannotEncode: "This browser can't save {format} files, so Oli kept the original image, without the photo metadata.",
    placardLabel: 'lighter',
    before: 'Before',
    after: 'After',
    size: 'Size',
    download: 'Download',
    startOver: 'Start over',
    to: 'to',
  },
  next: { label: 'Next:', moreTools: 'More tools' },
  howHeading: 'How it works',
  howSteps: [
    'Drop a JPG, PNG or WebP image on the box, choose it, or paste it.',
    'Oli redraws the image in your browser and saves it again with the compression you picked.',
    'Download the lighter copy. Your original file stays untouched.',
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'The image is processed on your device and is never sent to a server. The saved copy also leaves out the photo metadata, including the GPS location.',
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Does my image get uploaded anywhere?',
      a: "No. FileOrca compresses the image on your device, in your browser. Open your browser's Network tab while you compress: no request carries your file.",
    },
    {
      q: 'Why did the file come back the same size?',
      a: 'Some images are already well compressed. When the new copy would not be smaller, Oli gives you back the original instead of a bigger file.',
    },
    {
      q: 'What happens to the location data in my photo?',
      a: 'The compressed copy is saved without the photo metadata, so the GPS location, the camera model and the date are left out.',
    },
  ],
} satisfies CompressImageTexts;
