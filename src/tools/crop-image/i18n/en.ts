import type { CropOptionsTexts, ImageToolTexts } from '../../../i18n/types.ts';

export default {
  title: 'Crop image online, no upload',
  description:
    'Crop a JPG, PNG or WebP image to a square, 4:5, 16:9 or free shape in your browser. No upload, no limit on images, and photo metadata like GPS is removed.',
  h1: 'Crop image',
  howHeading: 'How to crop an image',
  howSteps: [
    'Drop your images on the box, choose them, or paste them with Ctrl V.',
    'Pick Square, 4:5, 16:9 or Free, then drag the box or its corners, or type its position and size.',
    'Download the cropped image, or the ZIP when you cropped several.',
  ],
  specsHeading: 'Specifications',
  specs: {
    caption: 'Crop image: formats taken, output and limits',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'JPG, PNG and WebP, recognized from the file content and not from the name. HEIC and AVIF photos go through HEIC to JPG or AVIF to JPG first.'],
      ['Shapes', 'Square, which is the default, 4:5, 16:9 or Free. The box opens centered, so a result is ready as soon as you drop an image.'],
      ['Moving the box', 'Drag the box or its corners, or focus it and use the arrow keys. Shift with the arrow keys changes its size.'],
      ['Exact values', 'Type the x, y, width and height of the box in pixels of the image, which is the way to crop without a pointer.'],
      ['Batch', 'Each image gets the centered crop in the shape you picked. Pick an image in the list to adjust its own box.'],
      ['Output', 'The same format as the file you dropped, with the pixels of the box and no scaling. PNG and WebP keep their transparency.'],
      ['Quality', 'JPG and WebP are saved again after the cut. PNG is saved without loss.'],
      ['Metadata', 'Exif, XMP, IPTC and GPS are removed, and the photo orientation is applied before you crop.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'How do I crop a photo to a square?',
      a: 'Square is the default shape. The box opens centered with equal sides, so you can download right away, or drag it over the part of the photo you want to keep.',
    },
    {
      q: 'How do I crop an image to 4:5 for Instagram?',
      a: 'Pick 4:5 and drag the box over the part you want to keep. A 4:5 image is taller than it is wide, and the box keeps that shape as you resize it. If the app asks for exact pixels, send the cropped image to Resize image.',
    },
    {
      q: 'Does cropping lower the quality of an image?',
      a: 'Cropping cuts pixels away and does not stretch the ones that stay, so the part you keep is as sharp as the original. JPG and WebP are saved again after the cut, which is the only change. PNG is saved without loss.',
    },
    {
      q: 'Can I crop without a fixed shape?',
      a: 'Yes. Pick Free and drag any side or corner of the box. With Free the width and the height change independently.',
    },
    {
      q: 'Can I crop with the keyboard?',
      a: 'Yes. Focus the crop box, move it with the arrow keys, and hold Shift with the arrow keys to change its size. You can also type the x, y, width and height of the box in the fields below the image.',
    },
    {
      q: 'Can I crop many photos at once?',
      a: 'Yes. Drop them all and each one gets the centered crop in the shape you picked. Pick one in the list to move its box, and the other photos keep theirs.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your images are cropped on your device and never sent to a server. The saved copies leave out the photo metadata, including the GPS location.',
  relatedHeading: 'More image tools',
  panel: {
    formats: 'JPG, PNG or WebP',
    progressLabel: 'Cropping images',
    done: 'Done! Your image is cropped.',
    doneMany: 'Done! Your {count} images are cropped.',
    options: {
      legend: 'Aspect ratio',
      square: 'Square',
      portrait: '4:5',
      wide: '16:9',
      free: 'Free',
      boxLabel: 'Crop area',
      keyboardHelp: 'Arrow keys move the box. Shift with the arrow keys changes its size.',
      x: 'X',
      y: 'Y',
      width: 'Width',
      height: 'Height',
      px: 'px',
      invalid: 'Type a whole number that keeps the box inside the image.',
      batchNote: 'Each image gets the centered crop. Pick an image in the list to adjust its box.',
    },
  },
} satisfies ImageToolTexts<CropOptionsTexts>;
