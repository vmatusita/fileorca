import type { ConvertToOptionsTexts, ImageToolTexts } from '../../../i18n/types.ts';

export default {
  title: 'Convert to WebP online, no upload',
  description:
    'Convert JPG and PNG images to smaller WebP or AVIF files in your browser. No upload, no limit on images, transparency is kept and GPS data is removed.',
  h1: 'Convert to WebP',
  howHeading: 'How to convert an image to WebP',
  howSteps: [
    'Drop your JPG or PNG images on the box, choose them, or paste them with Ctrl V.',
    'Pick WebP or AVIF, then Recommended or Strong.',
    'Download the converted image, or the ZIP when you converted several.',
  ],
  specsHeading: 'Specifications',
  specs: {
    caption: 'Convert to WebP: formats taken, output and limits',
    head: ['Detail', 'What happens'],
    rows: [
      ['Takes', 'JPG and PNG, recognized from the file content and not from the name. HEIC photos go through HEIC to JPG first.'],
      ['Output', 'WebP, which is the default, or AVIF. One file comes out for each image.'],
      ['Compression', 'Recommended balances size and looks, and Strong makes the smallest file.'],
      ['Transparency', 'Kept, in both WebP and AVIF.'],
      ['Speed', 'AVIF takes longer to save than WebP, and the difference grows with the size of the photo.'],
      ['Support', 'WebP opens in every current browser. AVIF opens in current versions of Chrome, Edge, Firefox and Safari, but some older apps and editors cannot read it.'],
      ['Batch', 'No limit on the number of images. One image downloads directly, and several come in one ZIP.'],
      ['Metadata', 'Exif, XMP, IPTC and GPS are removed, and the photo orientation is applied.'],
    ],
  },
  faqHeading: 'Questions',
  faq: [
    {
      q: 'How much smaller is WebP than JPG?',
      a: 'Often a quarter to a third smaller at a similar look, and AVIF can go further. The saving depends on the picture, so the before and after comparison on the result shows the real sizes.',
    },
    {
      q: 'Should I choose WebP or AVIF?',
      a: 'WebP is the safe choice: every current browser opens it, and it saves quickly. AVIF gives smaller files but takes longer to save, and some older apps cannot open it.',
    },
    {
      q: 'Does WebP keep the transparency of a PNG?',
      a: 'Yes, and so does AVIF. A PNG with a transparent background keeps it when you convert it to either format.',
    },
    {
      q: 'Will every website accept a WebP file?',
      a: 'Not always. Browsers and most modern sites do, but some upload forms and older editors accept only JPG or PNG. When that happens, WebP to JPG takes the file back.',
    },
    {
      q: 'Why would I convert my images to WebP?',
      a: 'Lighter images make a page load faster and use less storage. Converting a JPG or PNG to WebP is a quick way to get that saving.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your images are converted on your device and never sent to a server. The new files leave out the photo metadata, including the GPS location.',
  relatedHeading: 'More image tools',
  panel: {
    formats: 'JPG or PNG',
    progressLabel: 'Converting images',
    done: 'Done! Your image is converted.',
    doneMany: 'Done! Your {count} images are converted.',
    options: {
      formatLegend: 'Format',
      webp: 'WebP',
      avif: 'AVIF',
      levelLegend: 'Compression',
      recommended: 'Recommended',
      recommendedHelp: 'best balance',
      strong: 'Strong',
      strongHelp: 'smallest',
    },
  },
} satisfies ImageToolTexts<ConvertToOptionsTexts>;
