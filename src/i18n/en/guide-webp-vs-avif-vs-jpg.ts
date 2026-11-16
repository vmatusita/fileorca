import type { FileGuideTexts } from '../types.ts';

// F19b (front E2): guide 2, the same phone photos as JPG, WebP and AVIF, and a PNG with transparent corners in each
// format. Every number is a placeholder of data/guides-measured.json, an official figure of `facts` (MDN, read on the
// day of the source) or a technical name of `names`; the browser support is MDN's alone.
const texts: FileGuideTexts = {
  title: 'WebP vs AVIF vs JPG: When to Use Each, Measured on Our Photos',
  description: 'What the same phone photos weighed as JPG, WebP and AVIF, which format kept a transparent background, and when each one is the one to use.',
  h1: 'WebP vs AVIF vs JPG: when to use each',
  lead: 'The same photos, saved in each format: what each one weighed, what kept a transparent background, and when to pick which.',
  changed: 'First version of this guide, published on {published}.',
  intro: [
    'JPG, WebP and AVIF can all store a photo by leaving out detail that is hard to see, which is how they keep the file small. WebP and AVIF come from video: MDN describes lossy WebP as based on the VP8 video codec, and AVIF as a file format for pictures coded in AV1, a format first designed for video. Both can also save a picture without loss, and both can keep a transparent background. JPG has no transparency at all.',
    'So which one? Send a JPG when you do not know what will open the file. Use WebP or AVIF for pictures on a website you run, with a fallback in place, and for a graphic with a transparent background, when the file has to stay light. To see what that choice weighs, we took our {photos_word} real phone photos, which came out of the cameras as JPGs, and saved each one again as a JPG with Compress image and as a WebP and an AVIF with Convert to WebP, always at Recommended, the default. We did the same with a PNG that has transparent corners.',
  ],
  toolHeading: 'Make WebP or AVIF images here',
  toolIntro: 'Drop JPG or PNG images and each one comes back as a WebP. Pick AVIF under Format for the other format, and Strong under Compression for the smallest file.',
  sections: [
    {
      heading: 'What the same photos weighed',
      paragraphs: [
        'Together, the camera originals weighed {originalTotal}. Saved again as JPG by Compress image, they came to {jpgTotalChromium}, {jpgRatioChromium} of the originals. That first drop is not about the format at all: it is the same format, saved again at the setting of Recommended. As WebP the photos weighed {webpTotalChromium}, and as AVIF {avifTotalChromium}, {avifRatioChromium} of the originals.',
        'Measured against the JPG copies, the WebP copies were {webpVsJpgChromium_off} lighter and the AVIF copies {avifVsJpgChromium_off} lighter, which also puts AVIF {avifVsWebpChromium_off} below WebP. Photo by photo, the order did not change: the AVIF was the smallest copy of each photo, and the WebP sat between it and the JPG. The proportions did move from one photo to another, with each AVIF between {avifRatioMinChromium} and {avifRatioMaxChromium} of its original, and each WebP between {webpRatioMinChromium} and {webpRatioMaxChromium}.',
      ],
    },
    {
      heading: 'Sizes at the default, not at the same look',
      paragraphs: [
        'These sizes compare settings, not copies of equal quality. Recommended is the default of both tools, and we kept it: we did not tune either tool until the copies looked alike, and we did not score how close each copy came to the original.',
        'MDN compares the formats at a visually similar level of compression, and gives lossy WebP as {mdnWebpSmaller} smaller than JPEG on average, and lossy AVIF as around {mdnAvifSmaller} smaller. Our photos leaned the same way, with AVIF further ahead than WebP, but {photos_word} photos at the default settings are no test of those figures. Another photo can land at other proportions, as ours did among themselves.',
      ],
    },
    {
      heading: 'Converting with the tool above',
      paragraphs: [
        'Convert to WebP takes JPG and PNG images and gives back a WebP, or an AVIF if you pick it. Recommended is the setting we measured. Strong makes the smallest file, and we did not measure it; try both on one of your pictures and keep the one that still looks right to you.',
        'Convert from the original file whenever you have it. Each lossy save leaves out a little more detail, so a WebP made from the camera original keeps more than one made from a JPG already squeezed for an email. Keep that original too: a WebP that some program refuses can go back to JPG, but without the detail the conversion left out.',
      ],
    },
    {
      heading: 'Transparency: where JPG drops out',
      paragraphs: [
        'MDN notes that JPEG has no alpha channel, the part of an image file that stores transparency, so a converter has to fill the transparent areas with a color. Our test PNG has {pngClearCorners_word} transparent corners and weighed {pngBytes}. Compress image at Recommended keeps a PNG as a PNG, so we made its JPG with PNG to JPG, the tool for that job. The JPG weighed {pngJpgBytesChromium}, every corner had turned white, and the tool said so next to the file.',
        'Convert to WebP kept the transparency. The WebP weighed {pngWebpBytesChromium} and the AVIF {pngAvifBytesChromium}, and in both, every corner that was transparent in the PNG still was. For a logo or a cut-out that has to sit on a colored background, that is the difference between a clean edge and a white box, and those copies weighed {pngWebpRatioChromium} and {pngAvifRatioChromium} of the PNG they came from.',
      ],
    },
    {
      heading: 'Where each format opens',
      paragraphs: [
        'For browsers, MDN lists JPG in all versions of Chrome, Edge, Firefox, Opera and Safari, and WebP in all versions of the same browsers, with one condition on a Mac: {webpSafari} or later, on {webpMacos} or later. For AVIF, the first versions it lists are {avifVersions}.',
        'A browser is not the only place a picture goes. An upload form, an email program, a print shop or an older photo editor may accept only JPG or PNG, and a file it refuses is of no use there. On the web, MDN advises a fallback for both newer formats: a JPEG or PNG behind a WebP, and a WebP, JPEG or PNG behind an AVIF, offered with the picture element.',
      ],
    },
    {
      heading: 'Which one to use',
      paragraphs: ['No format wins everywhere. What decides is where the file goes next, and what it has to keep.'],
      list: [
        'JPG, for a photo that leaves your hands: an attachment, an upload form, a print order, an app you have not tried. It was the heaviest copy of each of our photos, and it cannot keep transparency.',
        'WebP, when you control where the picture is shown and can keep a JPG or PNG behind it, and for a logo that needs its transparency. On our photos it sat between AVIF and JPG.',
        'AVIF, when the smallest file matters most and a fallback is in place. On our photos and on the PNG it came out lightest.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'What we measured',
  sheet: {
    stats: [
      { label: 'WebP against JPG, on the same photos', value: '{webpVsJpgChromium_change}', from: '{jpgTotalChromium}', to: '{webpTotalChromium}' },
      { label: 'AVIF against JPG, on the same photos', value: '{avifVsJpgChromium_change}', from: '{jpgTotalChromium}', to: '{avifTotalChromium}' },
    ],
    sample: '{photos} phone photos, each saved as JPG, WebP and AVIF.',
    link: 'See the table',
  },
  tableHeading: 'Photo by photo',
  measuredIntro: 'The first table holds our {photos_word} phone photos, the second our PNG with transparent corners. Beside each size is its share of the file it was made from.',
  measuredNote: 'Measured on {date}, through the Compress image, Convert to WebP and PNG to JPG pages of this site, in Chromium {chromiumVersion} and in WebKit {webkitVersion} on {system}. For the photos, both browsers wrote the same bytes in every format. For the PNG they differed a little: in WebKit its JPG, WebP and AVIF weighed {pngJpgBytesWebkit}, {pngWebpBytesWebkit} and {pngAvifBytesWebkit}, and the tables show Chromium. Transparency was read in Node from the files themselves, in the alpha channel of the WebP and the AVIF and in the corner pixels of every copy.',
  tables: [
    {
      heading: 'Our photos in each format',
      caption: 'Each phone photo: the camera original, then the JPG from Compress image and the WebP and AVIF from Convert to WebP, at Recommended, in Chromium, each with its share of the original',
      head: ['Photo', 'Original', 'JPG', 'WebP', 'AVIF'],
    },
    {
      heading: 'The PNG with transparent corners',
      caption: 'The PNG with transparent corners saved as JPG by PNG to JPG and as WebP and AVIF by Convert to WebP, in Chromium: the size with its share of the PNG, and whether the transparency stayed',
      head: ['Saved as', 'Size', 'Transparency kept'],
      labels: ['JPG', 'WebP', 'AVIF'],
    },
  ],
  sourcesHeading: 'Sources',
  sources: [
    { id: 'mdn', label: 'MDN: Image file type and format guide', href: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types', read: '2026-11-16' },
  ],
  facts: {
    mdnWebpSmaller: { text: '25 to 35%', source: 'mdn' },
    mdnAvifSmaller: { text: '50%', source: 'mdn' },
    webpSafari: { text: 'Safari 14', source: 'mdn' },
    webpMacos: { text: 'macOS Big Sur (11)', source: 'mdn' },
    avifVersions: { text: 'Chrome 85, Edge 121, Opera 71, Firefox 93 and Safari 16.1', source: 'mdn' },
  },
  names: ['VP8', 'AV1'],
  relatedHeading: 'Related tools and guides',
};

export default texts;
