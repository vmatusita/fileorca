// F6: esqueleto copiado do inglês até a tradução substituir este arquivo (o english-leak.test.ts reprova o que sobrar).
import type { ImageToolTexts, PresetOptionsTexts } from '../../../../../i18n/types.ts';

export default {
  title: 'YouTube thumbnail resizer, 1280 × 720 online',
  description:
    'Make a 1280 × 720 YouTube thumbnail from any image in your browser: a JPG under 2 MB, cropped from the center. No upload, no limit, and GPS data is removed.',
  h1: 'YouTube thumbnail resizer',
  howHeading: 'How to make a YouTube thumbnail',
  howSteps: [
    'Drop your pictures on the box, choose them, or paste them with Ctrl V.',
    'Oli crops each one from the center to fill 16:9 and saves it as a 1280 × 720 JPG.',
    'Download the thumbnail, or the ZIP when you made several, and add it in YouTube Studio.',
  ],
  specsHeading: 'The thumbnail size',
  specs: {
    caption: 'What the YouTube thumbnail preset makes and the rules it follows',
    head: ['Detail', 'What Oli does'],
    rows: [
      ['Size', '1280 × 720 pixels, a 16:9 picture.'],
      ['Format', 'Always a JPG, saved to stay under 2 MB, the limit for custom thumbnails added from a phone.'],
      ['Picture that is not 16:9', 'It is cropped from the center to fill the frame, and a line on the result says so. The shape of the picture is never distorted.'],
      ['A different part of the picture', 'Crop the image first with Crop image to choose the part that stays, then bring it here.'],
      ['Transparency', 'Transparent areas turn white, because JPG has no transparency.'],
      ['What YouTube asks', 'YouTube Help, Add custom thumbnails (https://support.google.com/youtube/answer/72431, checked on October 31, 2026): 16:9, at least 640 pixels wide, JPG or PNG, and a recommended 3840 × 2160 for videos. FileOrca makes 1280 × 720, which is within those rules.'],
      ['Photo data', 'Exif, XMP, IPTC and GPS are left out of every thumbnail.'],
    ],
  },
  faqHeading: 'Questions about thumbnails',
  faq: [
    {
      q: 'What size is a YouTube thumbnail?',
      a: 'YouTube Help (https://support.google.com/youtube/answer/72431, checked on October 31, 2026) asks for a 16:9 image at least 640 pixels wide, as a JPG or PNG, and recommends 3840 × 2160 for videos. FileOrca makes 1280 × 720, which is within those rules and keeps the file light.',
    },
    {
      q: 'Why does YouTube say my thumbnail is too big?',
      a: 'The usual cause is the file size: YouTube Help gives 2 MB for a custom thumbnail added from a phone, and a 1280 × 720 PNG can pass that. This preset saves a JPG, which stays far below it.',
    },
    {
      q: 'What happens if my picture is not 16:9?',
      a: 'Oli crops it from the center to fill the frame, so the edges are cut and the shape of the picture is never distorted. If the important part is off-center, use Crop image first to choose the part, then bring the result here.',
    },
    {
      q: 'Why does my thumbnail look blurry?',
      a: 'A thumbnail looks blurry when the picture it starts from is small, because there are too few pixels to look sharp at 1280 × 720. A picture smaller than 1280 × 720 is enlarged to fill the frame, the result says so, and it may look softer. Start from a picture at least 1280 pixels wide.',
    },
    {
      q: 'Can I use a PNG for the thumbnail?',
      a: 'YouTube accepts PNG, but this preset saves a JPG, which keeps the file light. JPG has no transparency, so transparent areas turn white.',
    },
    {
      q: 'Should I use 1280 × 720 or 3840 × 2160?',
      a: 'Both are 16:9, so both fit. YouTube Help recommends 3840 × 2160 for videos, and this preset makes 1280 × 720, a size that loads fast and stays far below the 2 MB phone limit.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your pictures are turned into thumbnails on your device and never sent to a server. The new files leave out the photo metadata, including the GPS location.',
  relatedHeading: 'More image tools',
  panel: {
    formats: 'JPG, PNG or WebP',
    progressLabel: 'Making thumbnails',
    done: 'Done! Your thumbnail is 1280 × 720.',
    doneMany: 'Done! Your {count} thumbnails are 1280 × 720.',
    options: {
      note: 'Each image comes out as a 1280 × 720 JPG, cropped from the center to fill 16:9. Use Crop image first to choose the part that stays.',
    },
  },
} satisfies ImageToolTexts<PresetOptionsTexts>;
