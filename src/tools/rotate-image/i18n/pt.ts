// F6: esqueleto copiado do inglês até a tradução substituir este arquivo (o english-leak.test.ts reprova o que sobrar).
import type { ImageToolTexts, RotateOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'Rotate image online, no upload',
  description:
    'Rotate or mirror a JPG, PNG or WebP image in your browser: 90° left or right, 180°, horizontal or vertical. No upload, no limit, and GPS data is removed.',
  h1: 'Rotate image',
  howHeading: 'How to rotate an image',
  howSteps: [
    'Drop your images on the box, choose them, or paste them with Ctrl V.',
    'Pick Right 90°, Left 90° or 180°, and add a mirror if you want one.',
    'Download the rotated image, or the ZIP when you rotated several.',
  ],
  specsHeading: 'Specifications',
  specs: {
    caption: 'Rotate image: formats taken, output and limits',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'JPG, PNG and WebP, recognized from the file content and not from the name. HEIC photos go through HEIC to JPG first, and AVIF files are not accepted.'],
      ['Rotate', 'Right 90°, which is the default, Left 90° or 180°.'],
      ['Mirror', 'None, which is the default, Horizontal or Vertical. The mirror combines with the rotation.'],
      ['Batch', 'The rotation and the mirror you pick apply to every image in the batch. No limit on the number of images.'],
      ['Starting point', 'The photo orientation is applied first, so you rotate the image as a normal viewer shows it and not its raw pixels.'],
      ['Output', 'The same format as the file you dropped, with the same pixels turned. A 90° turn swaps the width and the height. PNG and WebP keep their transparency.'],
      ['Quality', 'JPG and WebP are saved again after the turn. PNG is saved without loss.'],
      ['Metadata', 'Exif, XMP, IPTC and GPS are removed, and no orientation tag is left to be read twice.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'Why does my photo look sideways in one app and upright in another?',
      a: 'Many phones and cameras save the pixels in one direction and add a small tag, called orientation, that says how to turn the picture. Apps that read the tag show it upright, and apps that ignore it show it sideways. FileOrca applies the tag when it saves the new file, so the pixels are right and no tag is left to misread.',
    },
    {
      q: 'Does rotating a JPG lower its quality?',
      a: 'A JPG or a WebP is saved again after the turn, so it goes through lossy compression one more time. PNG is saved without loss. Keep your original and rotate once instead of in several steps.',
    },
    {
      q: 'How do I rotate several photos at once?',
      a: 'Drop them all together. The rotation and the mirror you pick apply to the whole batch, and the download is one ZIP.',
    },
    {
      q: 'What is the difference between rotating and mirroring?',
      a: 'Rotating turns the image around its center, like turning a print on a table. Mirroring flips it as if you saw it in a mirror: Horizontal swaps left and right, and Vertical swaps top and bottom. Text in a mirrored image reads backward.',
    },
    {
      q: 'Can I rotate an image by 45° or another angle?',
      a: 'Not here. Right 90°, Left 90° and 180° keep every pixel of the picture. A free angle would leave empty corners to fill, so it is not part of this tool.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your images are rotated on your device and never sent to a server. The saved copies leave out the photo metadata, including the GPS location.',
  relatedHeading: 'More image tools',
  panel: {
    formats: 'JPG, PNG or WebP',
    progressLabel: 'Rotating images',
    done: 'Done! Your image is rotated.',
    doneMany: 'Done! Your {count} images are rotated.',
    options: {
      turnLegend: 'Rotate',
      right: 'Right 90°',
      left: 'Left 90°',
      half: '180°',
      flipLegend: 'Mirror',
      none: 'None',
      horizontal: 'Horizontal',
      vertical: 'Vertical',
    },
  },
} satisfies ImageToolTexts<RotateOptionsTexts>;
