// Remove EXIF data (F18, decision 10): JPG, PNG and WebP lose their metadata and keep their pixels, with no decoding and
// no new encoding (src/engine/image/strip.ts, DECISOES § 33 and § 100). A rotated JPG keeps a tiny Exif block with only the
// Orientation, so it still shows upright: the reading of "no Exif" the site uses since § 33, said plainly in the FAQ.
import type { ImageToolTexts, NoteOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'Remove EXIF data online, no upload',
  description:
    'Remove EXIF data from JPG, PNG and WebP photos in your browser: the GPS location, the date, the camera and more. The pixels stay the same. No upload, no limit.',
  h1: 'Remove EXIF data',
  howHeading: 'How to remove EXIF data from a photo',
  howSteps: [
    'Drop your photos on the box, choose them, or paste them with Ctrl V.',
    'Oli takes the metadata out of each file, and there is nothing to set.',
    'Download the clean photo, or the ZIP when you cleaned several.',
  ],
  specsHeading: 'Specifications',
  specs: {
    caption: 'Remove EXIF data: formats taken, what goes and what stays',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'JPG, PNG and WebP, recognized from the file content and not from the name. HEIC and AVIF photos are turned away with a link to HEIC to JPG or AVIF to JPG, which leave the metadata out too.'],
      ['What goes', 'The Exif data, with the GPS location, the date and time, the phone or camera and its settings, the small preview picture and the owner name; the XMP and IPTC data; comments; and the text notes a PNG can carry.'],
      ['What stays', 'The picture itself, byte for byte: it is not decoded or saved again, so nothing is lost. The color profile stays too, so the colors look the same.'],
      ['Rotated photos', 'A JPG that is stored sideways keeps a tiny Exif block with only its orientation, so it still shows upright. Nothing else of the Exif data stays.'],
      ['Extra pictures', 'Some phones put more inside a JPG after the photo, such as a second picture or the video of a motion photo, each with its own metadata. That part is left out, and the photo stays.'],
      ['Animation', 'An animated WebP stays animated, with every frame.'],
      ['Output', 'The same format as the file you dropped. It is smaller by the size of what was taken out, and the same when there was nothing to take out.'],
      ['Batch', 'No limit on the number of photos. One photo downloads directly, and several come in one ZIP.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'What is EXIF data?',
      a: 'EXIF is information a phone or a camera writes inside the photo file: when and often where it was taken, the device and its settings, and a small preview picture. It does not show on the picture, but anyone who gets the file can read it.',
    },
    {
      q: 'Does removing EXIF data change my photo?',
      a: 'No. Oli takes out only the metadata and copies the picture data as it is, without decoding it or saving it again, so every pixel stays the same and there is no loss of quality. The color profile stays too, so the colors look the same.',
    },
    {
      q: 'Why does a rotated JPG keep a little Exif data?',
      a: 'Many phones store the picture sideways and add a tag, the orientation, that tells apps how to turn it. Without the tag the photo would show sideways, and turning the pixels would mean saving the JPG again, with some loss. So a rotated JPG keeps a tiny Exif block with only the orientation, and nothing else: no location, no date and no camera.',
    },
    {
      q: 'Can I remove the location from a HEIC or AVIF photo?',
      a: 'Not on this page. HEIC to JPG and AVIF to JPG turn those photos into JPG files, and the JPG they make carries no metadata, the location included.',
    },
    {
      q: 'Can I clean many photos at once?',
      a: 'Yes. Drop them together. Each photo comes out on its own, in the same format, and the download is one ZIP when there are several.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your photos are cleaned on your device and never sent to a server, so the location and the other details in them never leave it either.',
  relatedHeading: 'More image tools',
  panel: {
    formats: 'JPG, PNG or WebP',
    progressLabel: 'Removing metadata',
    done: 'Done! The location and the other metadata are out of your photo, and the picture did not change.',
    doneMany: 'Done! The location and the other metadata are out of your {count} photos, and the pictures did not change.',
    options: {
      note: 'Each photo keeps its pixels and loses its metadata: the location, the date, the camera and the rest.',
    },
  },
} satisfies ImageToolTexts<NoteOptionsTexts>;
