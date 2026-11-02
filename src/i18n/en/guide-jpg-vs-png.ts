import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'JPG or PNG: Which One to Use, Measured on the Same Photos',
  description: 'When to save as JPG and when as PNG, with the sizes we measured on the same photos in both formats and what happens to a transparent image.',
  h1: 'JPG or PNG: which one to use',
  lead: 'Both formats open everywhere, so the choice is about what the picture is. Here is the rule, and what we measured when the same photos went both ways.',
  changed: 'First version, with the measurements of {date}.',
  intro: [
    'The short answer: photos go in JPG, and graphics go in PNG. Screenshots, logos, charts, text and anything with a transparent background are graphics. A photo from a camera or a phone is a photo, even if it shows a document.',
    'The longer answer is about what each format keeps. One stays small by throwing away detail you will hardly notice; the other keeps every pixel exactly and pays for it in size. Which trade is right depends on the picture, and on what happens to it next.',
  ],
  toolHeading: 'Switch between PNG and JPG here',
  toolIntro: 'Drop a PNG and it becomes a JPG; drop a JPG and it becomes a PNG. Each file is converted in this browser tab, so nothing is uploaded, and a batch comes back as one ZIP.',
  sections: [
    {
      heading: 'How each format stores a picture',
      paragraphs: [
        'PNG is lossless. Its specification, published by the W3C, says the compression should preserve all information, and it supports an optional alpha channel, which is how transparency is stored. A PNG opened and saved again is the same picture, pixel for pixel.',
        'JPG is lossy. The JPEG committee describes it as a DCT based lossy image format: it splits the picture into small blocks and keeps the broad shapes and colors of each one, dropping fine detail the eye notices least. That is why a photo is so much smaller as a JPG, and why sharp edges and flat colors can show small smudges around them.',
      ],
    },
    {
      heading: 'A photo saved as PNG is bigger, not better',
      paragraphs: [
        'We took our {photos_word} real phone photos, which came out of the cameras as JPGs, and saved them as PNG with the tool above. Together the JPGs weighed {jpgTotal}. As PNG they weighed {pngTotalChromium} in Chromium, {pngRatioChromium_times} as much.',
        'The PNGs did not look any better. Each one held the same pixels as the JPG it came from, exactly: we compared them pixel by pixel, and {pngIdenticalChromium_word} of them were identical. A PNG cannot bring back the detail the camera already dropped when it wrote the JPG. It only stores what is left without losing more.',
      ],
    },
    {
      heading: 'Browsers write PNG differently',
      paragraphs: [
        'The same photos saved as PNG in WebKit weighed {pngTotalWebkit}, {pngRatioWebkit_times} the JPGs, against {pngRatioChromium_times} in Chromium. Both PNGs hold exactly the same pixels. The difference is only in how hard each browser works to pack them, which shows that two PNGs of one picture can differ a lot in size and still be the same image.',
      ],
    },
    {
      heading: 'Back to JPG: close, but not the same',
      paragraphs: [
        'We then saved those PNGs back as JPG. The new JPGs weighed {backTotalChromium}, less than the camera originals, because the tool saves at a high quality but not as high as the cameras did.',
        'They are not the original files, and not quite the original pictures. Measured against the original pixels, the round trip scored between {backPsnrMinChromium} and {backPsnrMaxChromium} of PSNR, a measure of how close two images are. At that level the differences are very hard to see, but each lossy save adds a little more. Keep your originals, and convert from them.',
      ],
    },
    {
      heading: 'Transparency decides it',
      paragraphs: [
        'JPG has no transparency. Our test PNG has transparent corners, {transparentCornersBefore_word} of them, and in the JPG all {transparentCornersWhiteChromium_word} turned white, as the tool tells you next to the file. The file went from {transparentPngBytes} to {transparentJpgBytesChromium}.',
        'That is fine for a picture that sits on a white page, and wrong for a logo that has to sit on a colored background or on top of a photo. If an image has transparency you want to keep, keep it as PNG.',
      ],
    },
    {
      heading: 'A rule you can keep',
      paragraphs: [
        'Use JPG for photos you share, email or upload, especially when size matters. Use PNG for screenshots, text, logos, icons and anything with transparency, and for a picture you will edit again and again, since every JPG save loses a little.',
        'When a site will not take your PNG, or a PNG photo is too big to send, convert it to JPG. When you need a graphic to stay sharp, do not convert it to JPG at all.',
      ],
    },
    {
      heading: 'And WebP?',
      paragraphs: [
        'WebP can do both jobs. Google describes it as a format with lossy compression, like JPG, and lossless compression with transparency, like PNG. Websites use it because it is small. It opens in browsers, but some apps and upload forms still refuse it; our guide on WebP covers where it opens and how to save it as a JPG.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'What we measured',
  measuredIntro: 'Our {photos_word} real phone photos, from the camera JPG to PNG with the tool above, and back to JPG. The last column compares the final JPG with the original pixels.',
  measuredNote: 'Measured on {date} through the PNG to JPG page of this site in Chromium {chromiumVersion} and in WebKit {webkitVersion} on {system}. Pixels were compared in Node, with the same decoder for the original and the copy. The back to JPG sizes were the same in both browsers.',
  tables: [
    {
      heading: 'The same photos in both formats',
      caption: 'Each photo: the camera JPG, the PNG made from it in Chromium and in WebKit, the JPG made back from the PNG, and how close that JPG is to the original',
      head: ['Photo', 'JPG', 'PNG in Chromium', 'PNG in WebKit', 'Back to JPG', 'Against the original'],
    },
  ],
  sourcesHeading: 'Sources',
  sources: [
    { id: 'w3c-png', label: 'W3C: Portable Network Graphics (PNG) Specification', href: 'https://www.w3.org/TR/png-3/', read: '2026-11-01' },
    { id: 'google-webp', label: 'Google for Developers: An image format for the Web', href: 'https://developers.google.com/speed/webp?hl=en', read: '2026-11-01' },
    { id: 'jpeg-org', label: 'JPEG committee: JPEG 1', href: 'https://jpeg.org/jpeg/', read: '2026-11-01' },
  ],
  facts: {},
  names: ['W3C', 'JPEG 1'],
  relatedHeading: 'Related tools and guides',
};

export default texts;
