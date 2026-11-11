// F18 placeholder: front T writes the es text
// Flip image (F18, decision 9): a preset of Rotate image with the mirror alone, Horizontal (the default) or Vertical, and no
// turn. Page blocks with at least three of their own (gate:conteudo, MIN_OWN_BLOCKS) and the panel bits.
import type { FlipOptionsTexts, ImageToolTexts } from '../../../../../i18n/types.ts';

export default {
  title: 'Flip image online, no upload',
  description:
    'Flip a JPG, PNG or WebP image in your browser: mirror it left to right or top to bottom, with no rotation. No upload, no limit, and GPS data is removed.',
  h1: 'Flip image',
  howHeading: 'How to flip an image',
  howSteps: [
    'Drop your images on the box, choose them, or paste them with Ctrl V.',
    'Keep Horizontal to swap left and right, or pick Vertical to swap top and bottom.',
    'Download the flipped image, or the ZIP when you flipped several.',
  ],
  specsHeading: 'What the flip does',
  specs: {
    caption: 'Flip image: formats taken, the two mirrors and the output',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'JPG, PNG and WebP, recognized from the file content and not from the name. HEIC photos go through HEIC to JPG first, and AVIF files through AVIF to JPG.'],
      ['Horizontal', 'The default. Left and right swap places, as in a mirror held beside the picture.'],
      ['Vertical', 'Top and bottom swap places, as in the reflection of the picture in still water.'],
      ['No rotation', 'The picture is only mirrored, never turned. To turn it as well, Rotate image combines a turn with a mirror.'],
      ['Starting point', 'The photo orientation is applied first, so the mirror flips the picture as you see it and not its raw pixels.'],
      ['Batch', 'The mirror you pick applies to every image in the batch, with no limit on the number of images.'],
      ['Output', 'The same format and the same width and height as the picture you see. PNG and WebP keep their transparency.'],
      ['Quality', 'JPG and WebP are saved again after the flip. PNG is saved without loss.'],
      ['Metadata', 'Exif, XMP, IPTC and GPS are removed, and no orientation tag is left to be read twice.'],
    ],
  },
  faqHeading: 'Questions about flipping',
  faq: [
    {
      q: 'What is the difference between flipping and rotating an image?',
      a: 'Rotating turns the picture around its center. Flipping mirrors it: Horizontal swaps left and right, and Vertical swaps top and bottom. Text in a flipped image reads backward.',
    },
    {
      q: 'How do I fix a selfie that came out mirrored?',
      a: 'Keep Horizontal. Left and right swap places, so text that read backward in the photo reads the right way again.',
    },
    {
      q: 'Is a vertical flip the same as turning the image upside down?',
      a: 'No. A turn of 180° also swaps left and right, while a vertical flip keeps them where they are and only swaps top and bottom. For a photo that is upside down, use 180° in Rotate image.',
    },
    {
      q: 'Does flipping a JPG lower its quality?',
      a: 'A JPG or a WebP is saved again after the flip, so it goes through lossy compression once more. PNG is saved without loss. Flip once from your original rather than several times.',
    },
    {
      q: 'Can I flip several images at once?',
      a: 'Yes. Drop them together. The mirror you pick applies to the whole batch, and the download is one ZIP.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your images are flipped on your device and never sent to a server. The flipped copies leave out the photo metadata, including the GPS location.',
  relatedHeading: 'More image tools',
  panel: {
    formats: 'JPG, PNG or WebP',
    progressLabel: 'Flipping images',
    done: 'Done! Your image is flipped.',
    doneMany: 'Done! Your {count} images are flipped.',
    options: {
      legend: 'Mirror',
      horizontal: 'Horizontal',
      vertical: 'Vertical',
    },
  },
} satisfies ImageToolTexts<FlipOptionsTexts>;
