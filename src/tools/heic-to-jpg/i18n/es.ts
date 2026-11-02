// F6: esqueleto copiado do inglês até a tradução substituir este arquivo (o english-leak.test.ts reprova o que sobrar).
import type { ImageToolTexts, SaveAsOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'HEIC to JPG online, no upload',
  description:
    'Convert HEIC and HEIF photos from an iPhone or Android phone to JPG or PNG in your browser. No upload, no limit on photos, and the GPS location is removed.',
  h1: 'HEIC to JPG',
  howHeading: 'How to convert HEIC to JPG',
  howSteps: [
    'Drop your HEIC photos on the box, choose them, or paste them with Ctrl V.',
    'Keep JPG, or pick PNG if you want the photo with no further loss.',
    'Download the converted photo, or the ZIP when you converted several.',
  ],
  specsHeading: 'Specifications',
  specs: {
    caption: 'HEIC to JPG: formats taken, output and limits',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'HEIC and HEIF files from iPhones and Android phones, recognized from the file content and not from the name.'],
      ['Output', 'JPG, which is the default, or PNG. One file comes out for each HEIC.'],
      ['Which image', 'The main image of the file. The Live Photo video, the depth map and the HDR map are left out, and a spatial photo from Apple Vision Pro gives its main image.'],
      ['Colors', 'Converted to standard sRGB, the color profile that every browser and app understands.'],
      ['Orientation', 'Applied once, so a portrait photo comes out upright.'],
      ['Batch', 'No limit on the number of photos. One photo downloads directly, and several come in one ZIP.'],
      ['Large photos', 'Photos above 16,777,216 pixels, about 16.8 megapixels, are converted without the browser canvas, so 24-megapixel iPhone photos work too.'],
      ['Metadata', 'Exif, XMP, IPTC and GPS are removed, including the date taken and the camera model.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: "Why can't I open HEIC files on Windows?",
      a: 'HEIC is the format iPhones use for photos. Windows needs extra codec extensions to show it, and many apps and websites refuse it. A JPG made from the photo opens almost everywhere.',
    },
    {
      q: 'Does converting HEIC to JPG lower the quality?',
      a: 'JPG compresses with loss, so the new file is not a bit-for-bit copy of the photo, and for normal viewing the difference is small. Pick PNG for no further loss; the file will be much bigger.',
    },
    {
      q: 'What happens to my Live Photo?',
      a: 'Oli converts only the main image of the file, so you get the still photo. The short video of a Live Photo is not in the JPG, and neither are the depth data of a Portrait photo or the HDR map.',
    },
    {
      q: 'Does the JPG keep the date and the location?',
      a: 'No. The JPG is saved from the pixels alone, so the GPS location, the camera model and the date taken are left out. If you need those details, keep the original HEIC.',
    },
    {
      q: 'Why do the colors look different after converting?',
      a: 'iPhones shoot in a wide color range called Display P3. FileOrca converts it to sRGB, the standard that every screen and app expects, so colors stay consistent. A very saturated photo can look slightly less vivid, because sRGB covers a smaller range.',
    },
    {
      q: 'Can my iPhone save JPG instead of HEIC?',
      a: 'Yes. Open Settings, then Camera, then Formats, and choose Most Compatible. New photos are saved as JPG, but they take more space than HEIC.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your photos are converted on your device and never sent to a server. The new files leave out the photo metadata, including the GPS location.',
  relatedHeading: 'More image tools',
  panel: {
    formats: 'HEIC or HEIF',
    progressLabel: 'Converting images',
    done: 'Done! Your photo is converted.',
    doneMany: 'Done! Your {count} photos are converted.',
    options: {
      legend: 'Save as',
      jpg: 'JPG',
      png: 'PNG',
      help: 'JPG is lighter and opens everywhere. PNG adds no further loss, but the file is much bigger.',
    },
  },
} satisfies ImageToolTexts<SaveAsOptionsTexts>;
