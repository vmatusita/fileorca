import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'How to Open WebP Images and Save Them as JPG',
  description: 'What a WebP file is, where it opens without extra software, and what changes in size, animation and location when you save it as a JPG.',
  h1: 'How to open WebP images and save them as JPG',
  lead: 'You saved an image from a website as a .webp file, and your other apps will not take it. Here is how to get a JPG.',
  changed: 'First version of this guide, published on {published} with these measurements.',
  intro: [
    'WebP is an image format made by Google for the web. Websites use it because it is small, so pages load faster, and that is why a picture you save from a browser can arrive as a .webp file instead of a JPG or a PNG.',
    'The browser you saved it from shows it without trouble. The trouble starts when the file leaves the browser: an older photo editor, an upload form that asks for a JPG, or a print shop may refuse it. Saving it as a JPG makes it open almost anywhere, but it does not make it better, and it does not make it smaller.',
  ],
  toolHeading: 'Save your WebP images as JPG here',
  toolIntro: 'Drop one WebP or a whole batch. Each one becomes a JPG in this browser tab, so nothing is uploaded, and a batch comes back as one ZIP. You can choose PNG instead if you need the transparency kept.',
  sections: [
    {
      heading: 'What a WebP file is',
      paragraphs: [
        'Google describes WebP as a format with both lossy and lossless compression. Lossy WebP plays the part of a JPG, for photos; lossless WebP plays the part of a PNG, for graphics. It can also keep transparency, and it can hold an animation, the way a GIF does.',
        'Google reports that lossy WebP images are {googleSmaller} smaller than comparable JPG images at the same visual quality. That is the reason websites prefer it: the same picture costs less to download.',
      ],
    },
    {
      heading: 'Where WebP opens without a converter',
      paragraphs: [
        'On Apple devices, WebP support came with Safari 14, which shipped with iOS 14 and macOS Big Sur 11, according to Apple’s release notes. On Windows, Microsoft’s WebP Image Extension lets File Explorer, Photos and other Windows apps show WebP images.',
        'So if you only need to look at the picture, you may not need to convert anything. Drag the file into the browser you saved it from and it opens. You need a JPG when the file has to go somewhere that does not take WebP.',
      ],
    },
    {
      heading: 'What we did to test it',
      paragraphs: [
        'We took our {photos_word} real phone photos, saved them as WebP with the engine of this site at its standard WebP quality, and then saved those WebP files as JPG with the tool above. We also ran a WebP that carries GPS data and an animated WebP through the same tool.',
        'Our WebP copies weighed {webpTotal}, against {jpgTotal} for the original JPGs from the cameras. Do not read too much into that gap: the cameras saved their JPGs at a higher quality than our WebP copies, so this is not a fair race between the formats. What it does show is what our WebP copies kept at the quality of this site’s encoder: {webpRatio} of the weight of the originals.',
      ],
    },
    {
      heading: 'The JPG is bigger than the WebP',
      paragraphs: [
        'When we saved the WebP copies as JPG, the JPGs weighed {backTotalChromium}, which is {backRatioChromium_times} the WebP files. A JPG packs a picture less tightly than WebP, and the tool saves it at a high quality, so the detail that is left is kept rather than squeezed again.',
        'The JPGs also weighed {backVsOriginalChromium} of the original camera JPGs, and they look like the WebP, not like the original. Converting cannot bring back detail the WebP had already dropped. If you have the original photo, use it instead of the WebP.',
      ],
    },
    {
      heading: 'Animation and transparency',
      paragraphs: [
        'A JPG holds one still picture. Our animated WebP has {animatedFrames} frames, and the JPG kept only the first one; the result says so next to the file. If you need the animation, keep the WebP, or turn it into a video or a GIF with another tool.',
        'A JPG has no transparency either. Transparent parts of a WebP turn white in the JPG. If the image is a logo or a cut-out that needs its transparent background, choose PNG in the tool instead.',
      ],
    },
    {
      heading: 'The location stays behind',
      paragraphs: [
        'The WebP format can carry Exif and XMP metadata, according to Google’s container specification, so a WebP can hold the GPS position and the camera details of a photo. Our test WebP with GPS data came out of the tool as a JPG with {exifGpsAfterChromium_word} GPS data.',
        'That happens because each JPG is written from the pixels of the image, not copied from the file. That is what you want when you share a picture and not its details, but it also means the JPG is a new file: keep the WebP if you need the original as it was.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'What we measured',
  sheet: {
    stats: [
      { label: 'The JPG made from the WebP', value: '{backRatioChromium_times}', from: '{webpTotal}', to: '{backTotalChromium}' },
      { label: 'Against the camera originals', value: '{backVsOriginalChromium}', sub: '{backTotalChromium} of {jpgTotal}' },
    ],
    sample: '{photos} phone photos, saved as WebP, then back as JPG.',
    link: 'See the table',
  },
  tableHeading: 'Photo by photo',
  measuredIntro: 'Our {photos_word} real phone photos, saved as WebP by the engine of this site, then saved as JPG with the tool above. The share in brackets is against the original camera JPG.',
  measuredNote: 'Measured on {date}. The WebP copies were written in Node with the WebP encoder of this site’s engine; the JPGs were made through the WebP to JPG page in Chromium {chromiumVersion} and in WebKit {webkitVersion} on {system}, which gave the same sizes. The table shows Chromium.',
  tables: [
    {
      heading: 'Our photos as WebP and back to JPG',
      caption: 'Each photo: the original JPG, its WebP copy and the JPG made from the WebP, with the share of the original size',
      head: ['Photo', 'Original JPG', 'As WebP', 'Back to JPG'],
    },
  ],
  sourcesHeading: 'Sources',
  sources: [
    { id: 'google-webp', label: 'Google for Developers: An image format for the Web', href: 'https://developers.google.com/speed/webp?hl=en', read: '2026-11-01' },
    { id: 'google-webp-container', label: 'Google for Developers: WebP Container Specification', href: 'https://developers.google.com/speed/webp/docs/riff_container?hl=en', read: '2026-11-01' },
    { id: 'ms-webp', label: 'Microsoft Store: WebP Image Extension', href: 'https://apps.microsoft.com/detail/9pg2dk419drg?hl=en-US&gl=US', read: '2026-11-01' },
    { id: 'apple-safari', label: 'Apple Developer: Safari 14 Release Notes', href: 'https://developer.apple.com/documentation/safari-release-notes/safari-14-release-notes', read: '2026-11-01' },
  ],
  facts: {
    googleSmaller: { text: '25 to 34%', source: 'google-webp' },
  },
  names: ['Safari 14', 'iOS 14', 'macOS Big Sur 11'],
  relatedHeading: 'Related tools and guides',
};

export default texts;
