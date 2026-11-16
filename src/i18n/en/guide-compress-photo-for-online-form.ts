// F19b (front E1): guide 1, a phone photo under the size limit of an online form, with Compress image open on Up to a
// size. Every number is a placeholder of data/guides-measured.json, an official figure of `facts` with its source, or a
// technical name of `names` (tests/unit/guides-numbers.test.ts).
import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Photo for an Online Form: How to Fit It Under the Size Limit',
  description: 'What a size limit in KB counts, and what our phone photos gave up, in pixels and in quality, to fit under one with Compress image.',
  h1: "How to fit a photo under a form's size limit",
  lead: 'What a limit in KB counts, and what our phone photos gave up, in pixels and in quality, to get under it.',
  changed: 'First version of this guide, published on {published}.',
  intro: [
    'A form that takes a photo and sets a size limit refuses a file over it, however good the photo is. Our {photos_word} real phone photos weigh from {photoMin} to {photoMax}, each one several times a limit of {limit500} and far above {limit100}.',
    'To get under a limit, a JPG can give up quality, pixels or both. We put each photo through Up to a size at {limit100}, {limit200} and {limit500}, and read what came out: the bytes, the width and height, and the quality the encoder used. Every file fit. At {limit100} and {limit200}, every photo also lost pixels.',
  ],
  toolHeading: 'Fit your photo under a limit',
  toolIntro: 'The panel opens on Up to a size. Type the limit of your form in KB and drop the photo: the result gives the new file size, and the new width and height when the photo had to shrink.',
  sections: [
    {
      heading: 'What a limit in KB counts',
      paragraphs: [
        'A limit in kilobytes is a limit on the bytes of the file, not on its width and height. Compress image counts a kilobyte as {kilo} bytes, as its specs table says, which is what the prefix kilo means in the International System of Units. In the tool, a limit of {limit100} is {limit100_exact}.',
        'A kilobyte can also be read the binary way. NIST, the US standards agency, notes that people in computing began using kilo to mean {kibi}. To end the mix-up, the IEC gave the binary multiples names of their own in {iecDate}, and kibi, written Ki, stands for {kibi}.',
        'A form may not say which reading it uses, and the smaller one is the safe one. A file no larger than {limit100_exact} is under {limit100} whichever way the form counts, since a binary {limit100} holds a little more. A file manager that counts the binary way also shows the file as fewer kilobytes than the tool: that gap is the counting, not the file.',
      ],
    },
    {
      heading: 'What happened at each limit',
      paragraphs: [
        'At {limit100}, all {photos_word} photos fit, from {at100MinChromium_exact} to {at100MaxChromium_exact}, and all {photos_word} lost pixels. The Pixel 2 photo went from {pixelWidth} × {pixelHeight} to {pixelAt100WidthChromium} × {pixelAt100HeightChromium}; the iPhone 6 photo came out at {iphone6At100WidthChromium} × {iphone6At100HeightChromium}, down from {iphone6Width} × {iphone6Height}.',
        'At {limit200}, the photos lost fewer pixels, and still lost some. The iPhone 6 photo came out at {iphone6At200WidthChromium} × {iphone6At200HeightChromium}, in {iphone6At200Chromium_exact}, a few hundred bytes under the limit.',
        'At {limit500}, {at500KeptChromium_word} photo of {photos_word} kept its full size: the iPhone 5 photo, at {iphone5Width} × {iphone5Height}, in {iphone5At500Chromium_exact}. The Pixel 2 photo still came out at {pixelAt500WidthChromium} × {pixelAt500HeightChromium}, and the iPhone 6 photo also lost pixels, for a reason the next part explains.',
      ],
    },
    {
      heading: 'How Up to a size gets under the limit',
      paragraphs: [
        'The specs table of Up to a size says it lowers the quality first, and the dimensions only if it has to. The page does not show the quality, so we read it from the files themselves.',
        'At {limit100} and {limit200} that order held in our sample: none of the {photos_word} photos would have fit at its full size at any quality the tool can use, so the dimensions had to go. At {limit500} it did not quite hold. The iPhone 6 photo came out at {iphone6At500WidthChromium} × {iphone6At500HeightChromium} and quality {iphone6At500QualityChromium}, though the whole photo would have fit at quality {iphone6At500FullQuality}: the tool kept the quality higher and gave up pixels instead.',
        'The iPhone 5 photo shows the other side. It kept its full size at quality {iphone5At500QualityChromium} and used the smallest share of its limit in our sample, {at500FillMinChromium}. At its full size, that photo would have fit up to quality {iphone5At500FullQuality}, so the tool stopped below what the limit allowed.',
      ],
    },
    {
      heading: 'A bigger limit bought pixels, not quality',
      paragraphs: [
        'In our sample, a bigger limit did not buy a better-looking JPG: it bought a bigger photo. The Pixel 2 photo came out at quality {pixelAt100QualityChromium} at {limit100}, {pixelAt200QualityChromium} at {limit200} and {pixelAt500QualityChromium} at {limit500}, while its width grew from {pixelAt100WidthChromium} to {pixelAt200WidthChromium} and then {pixelAt500WidthChromium} pixels.',
        'Across the {photos_word} photos, the quality at {limit100} went from {at100QualityMinChromium} to {at100QualityMaxChromium}, and at {limit500} from {at500QualityMinChromium} to {at500QualityMaxChromium}. The ranges overlap: here a lower limit did not always mean a lower quality, but it meant fewer pixels for every photo. If your photo has to show small print, such as a document or a card, mind the new width and height: fewer pixels make small print harder to read.',
      ],
    },
    {
      heading: 'When the form asks for pixels too',
      paragraphs: [
        'Up to a size picks the dimensions on its own, so it cannot give you a width and a height that the form names. If the form asks for an exact size in pixels, set it first with Resize image, then bring the resized photo to the panel above for the file size.',
        'Resize image keeps the proportions and fits the photo inside the width and height you type, so a photo of another shape comes out smaller on one side. For a square, or another fixed shape, cut the photo to that shape with Crop image first, then resize it.',
        'If the resized photo is still over the limit, Up to a size may take more pixels off, and the photo no longer has the size you set. Check the width and height of the result against the form before you upload.',
      ],
    },
    {
      heading: 'Before you upload',
      paragraphs: [
        'Look at the format the form asks for. Up to a size gives a JPG, and the transparent areas of a PNG turn white, so it suits a form that wants JPG or JPEG. Compress image takes JPG, PNG and WebP, so an iPhone photo saved as HEIC goes through HEIC to JPG first.',
        'Type the limit the form gives, as it is, since the tool already counts the smaller way. If the form still turns the file down, it may weigh the file its own way: type a lower limit and try again.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'What we measured',
  sheet: {
    stats: [
      { label: 'The Pixel 2 photo at {limit100}', value: '{pixelAt100ShareChromium_change}', from: '{pixelBytes}', to: '{pixelAt100Chromium}' },
      { label: 'Full-size photos at {limit500}', value: '{at500KeptChromium} of {photos}' },
    ],
    sample: '{photos} phone photos, each fitted under {limit100}, {limit200} and {limit500}.',
    link: 'See the table',
  },
  tableHeading: 'Photo by photo, limit by limit',
  measuredIntro: 'Each of our {photos} real phone photos went alone through Up to a size, once per limit. The last column is the highest quality at which the whole photo would have fit at its full size; None means not even the lowest quality the tool can use was enough.',
  measuredNote: 'Measured on {date} through the Compress image page of this site in Chromium {chromiumVersion} and in WebKit {webkitVersion} on {system}; the table shows Chromium. The quality was read in Node from the quantization tables of each JPG, which match the encoder of the site at one quality only, and the last column comes from that encoder, run in Node. WebKit gave the same width and height in {sameDimensions} of the {outputs} files; there, the iPhone 6 photo at {limit100} came out at {iphone6At100WidthWebkit} × {iphone6At100HeightWebkit}.',
  tables: [
    {
      heading: 'Each photo under each limit',
      caption: 'Each phone photo under each limit, in Chromium: the bytes of the JPG, its width and height, the quality it got, and the top quality that would have kept every pixel',
      head: ['Limit', 'Photo', 'File', 'Dimensions in pixels', 'Quality reached', 'Full size fits up to quality'],
    },
  ],
  sourcesHeading: 'Sources',
  sources: [
    { id: 'nist-binary', label: 'NIST: Definitions of the SI units: The binary prefixes', href: 'https://physics.nist.gov/cuu/Units/binary.html', read: '2026-11-16' },
  ],
  facts: {
    kilo: { text: '1,000', source: 'nist-binary' },
    kibi: { text: '1,024', source: 'nist-binary' },
    iecDate: { text: 'December 1998', source: 'nist-binary' },
  },
  names: ['Pixel 2', 'iPhone 6', 'iPhone 5'],
  relatedHeading: 'Related tools and guides',
};

export default texts;
