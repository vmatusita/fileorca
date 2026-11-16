import type { FileGuideTexts } from '../types.ts';

// F19b (front E5): guide 5, the size of a QR code. The texts typed into the QR code generator, the version and the squares
// each one took, the PNG of each at the three sizes, and the read-back with Oli in the middle. Every number is a placeholder
// of data/guides-measured.json, an official figure of `facts` (DENSO WAVE, read on the day each source gives) or a technical
// name of `names`. The printed size is only a calculation, with the worked example of DENSO WAVE; no page read gives a
// smallest size for scanning, so the guide gives none. The share of level H is left to the page of the QR code generator.
const texts: FileGuideTexts = {
  title: 'QR Code Size: How Your Text Sets It, and How to Size the Print',
  description: 'How the length of a link or text sets the squares of a QR code, measured on our texts, what that does to the PNG, and how to work out a printed size.',
  h1: 'QR code size: how your text sets it',
  lead: 'More text, more squares. Here is what our texts took, what that did to the PNG, and how to work out a printed size.',
  changed: 'First version of this guide, published on {published}.',
  intro: [
    'A QR code has no fixed size. It is a grid of squares, which the standard calls modules, and DENSO WAVE, whose site qrcode.com documents the QR code, puts it plainly: once the version and the size of a module are set, the size of the code is set. Your text decides the version; you, or your printer, decide the size of a square.',
    'To see what a text does to the grid, we typed {texts_word} texts into the generator above: a short link, a sentence in Portuguese without its accents, the same sentence with them, and a long link full of campaign tags. We saved each code as a PNG at Small, Medium and Large, with Oli in the middle, and read every PNG back with a QR reader.',
  ],
  // Two lines at 360 px beside the Oli of the QR panel, who rises 86 px above it (guide-page.spec.ts: the Oli clear of the sheet).
  toolHeading: 'Make a QR code and see its size here',
  toolIntro: 'Each character you add redraws the code. The counter under the box tallies what the code will store, and each PNG size shows the pixels its file will have.',
  sections: [
    {
      heading: 'Versions: a grid that grows in steps',
      paragraphs: [
        'DENSO WAVE numbers the versions of the QR code {densoVersions}, from a grid of {densoSmallestGrid} squares to one of {densoLargestGrid}, each version adding {densoStep} squares to a side. How much a version holds depends on the amount of data, the kind of characters and the error correction level.',
        'The generator picks the version from the text. Our short link, {shortBytes_exact} long, took version {shortVersionChromium}, with {shortModulesChromium} squares a side; the long link, at {longBytes_exact}, took version {longVersionChromium}, with {longModulesChromium} squares a side.',
      ],
    },
    {
      heading: 'Accents: the same sentence, more bytes',
      paragraphs: [
        'The tool counts bytes, not letters, since the text goes into the code as UTF-8. Without its accents, our sentence had {plainChars} characters and took {plainBytes_exact}. With them, it had the same {accentsChars} characters, {accentsMultibyte_word} of them letters with accents, and took {accentsBytes_exact}.',
        'Those extra bytes moved the code from version {plainVersionChromium} to {accentsVersionChromium}, and from {plainModulesChromium} to {accentsModulesChromium} squares a side. Each version has a limit, so a text near it crosses into the next with a few bytes more, while a text far from it stays put: another sentence could gain the same bytes and keep its version.',
      ],
    },
    {
      heading: 'What the PNG sizes did with our texts',
      paragraphs: [
        'Small, Medium and Large are targets, not exact widths. The tool scales the code by whole pixels per square, so the side of the PNG moved with the text: at Small, from {plainSmallSideChromium} pixels for the sentence without accents to {longSmallSideChromium} for the long link. The panel writes the side beside each size.',
        'What changed most was the size of a square: from {smallPerModuleMinChromium} to {smallPerModuleMaxChromium} pixels at Small, the long link getting the fewest, and from {largePerModuleMinChromium} to {largePerModuleMaxChromium} at Large. The files weighed from {shortSmallBytesChromium} to {longLargeBytesChromium} in Chromium. For print, though, what counts is the millimeters of a square.',
      ],
    },
    {
      heading: 'Oli in the middle, and error correction H',
      paragraphs: [
        'A QR code carries extra data that lets a reader rebuild a damaged part. DENSO WAVE describes the levels of this error correction as L, M, Q and H: a higher level corrects more and makes the code bigger. It names M as the level selected most frequently, and Q or H for places where codes get dirty.',
        'The generator always uses H, and puts some of that correction to work for Oli: it leaves out the squares under her frame and lets the error correction stand in for them. DENSO WAVE warns that an illustration over a code calls on its error correction and can make it read slowly or not at all. Oli covered between {hiddenShareMinChromium} and {hiddenShareMaxChromium} of the dark squares of our texts, and the reader read back {readChromium} of {pngsChromium} PNGs in Chromium and {readWebkit} of {pngsWebkit} in WebKit.',
        'Those shares count dark squares, not the codewords that error correction works on, and jsQR read clean files, not a print through a phone camera. How much level H can rebuild, and when to turn Oli off, is on the page of the generator; a test scan of your printed proof tells you more than our table.',
      ],
    },
    {
      heading: 'Working out the printed size',
      paragraphs: [
        'On paper, the side of a code is the squares across, margin included, times the size of a square. DENSO WAVE asks for a clear margin {densoMargin} wide on every side, and the generator draws one into every file: we measured {quietZoneChromium} squares at each side. With it, our short link is {shortSideChromium} squares across and the long link {longSideChromium}.',
        'DENSO WAVE works an example through: a code of version {densoExampleVersion}, {densoExampleModules} modules a side, printed at {densoDpi} with {densoDots} to a module, has modules of {densoModuleMm}, so the code is {densoCodeMm} across and needs {densoAreaMm} with its margin. Our short link has that same version and grid, so printed that way it would take that same area.',
        'Its page on module size recommends {densoMinDots} of the printer for each module, and printing the code as large as the space allows, since a larger module reads more easily. Its FAQ puts the smallest module a common laser printer makes at about {densoLaserModule}, which makes a code of {densoSmallestGrid} modules about {densoSmallestCode} across. That is what a printer can draw, not what a phone can read from across a room: none of the DENSO WAVE pages we read gives a minimum size for scanning or a reading distance, so this guide gives neither.',
      ],
    },
    {
      heading: 'Fewer squares, bigger squares',
      paragraphs: [
        'In the same space, fewer squares means bigger squares. The text is the part you control: our long link spent most of its {longBytes_exact} on campaign tags, the part after the question mark.',
      ],
      list: [
        'Shorten the text before you make the code: drop the tags you do not need, and use a shorter address for the page when it has one.',
        'Keep the margin clear on paper too, with no text, frame or picture inside it.',
        'Print a proof at the size you plan, and scan it with a phone from where people will stand.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'What we measured',
  sheet: {
    stats: [
      { label: 'Squares per side, short link to long link', value: '{shortModulesChromium} to {longModulesChromium}' },
      { label: 'PNGs read back with Oli in the middle', value: '{readChromium} of {pngsChromium}' },
    ],
    sample: '{texts} texts, each saved as a PNG at Small, Medium and Large.',
    link: 'See the table',
  },
  tableHeading: 'Text by text',
  measuredIntro: 'The first table holds our {texts_word} texts and the code each one became, the second the PNG of each text at each size. The version is the one the reader found, and the squares per side leave out the margin.',
  measuredNote: 'Measured on {date}, through the QR code generator page of this site, in Chromium {chromiumVersion} and in WebKit {webkitVersion} on {system}. Both browsers drew the same code for every text, and the tables show Chromium; only the PNG files differed, lighter in WebKit, where the short link at Small weighed {shortSmallBytesWebkit} against {shortSmallBytesChromium}. Characters and bytes were counted in Node, where jsQR, a QR reader in JavaScript, read each PNG back and gave its version.',
  // F19b (front M5): the shape of the tables (the labels name the texts, in the order of the measurement: the short link,
  // the sentence without accents, the same sentence with them, the long link).
  tables: [
    {
      heading: 'The texts and their codes',
      caption: 'Each text typed into the QR code generator, in Chromium: its characters, the bytes the tool counts, the version the reader found, the squares on a side without the margin and the dark squares under Oli',
      head: ['Text', 'Characters', 'Bytes', 'Version', 'Squares per side', 'Dark squares under Oli'],
      labels: ['Short link', 'Sentence without accents', 'Same sentence with accents', 'Long link'],
    },
    {
      heading: 'The PNG of each text at each size',
      caption: 'The PNG of each text at each size of the QR code generator, in Chromium: its pixels, the pixels of each square and the size of the file',
      head: ['Text', 'PNG size', 'Pixels', 'Pixels per square', 'File'],
    },
  ],
  sourcesHeading: 'Sources',
  sources: [
    { id: 'denso-version', label: 'DENSO WAVE: Information capacity and versions of QR Code', href: 'https://www.qrcode.com/en/about/version.html', read: '2026-11-16' },
    { id: 'denso-error', label: 'DENSO WAVE: Error correction feature', href: 'https://www.qrcode.com/en/about/error_correction.html', read: '2026-11-16' },
    { id: 'denso-faq', label: 'DENSO WAVE: FAQ', href: 'https://www.qrcode.com/en/faq.html', read: '2026-11-16' },
    { id: 'denso-area', label: 'DENSO WAVE: Point for determining the code area', href: 'https://www.qrcode.com/en/howto/code.html', read: '2026-11-16' },
    { id: 'denso-module', label: 'DENSO WAVE: Point for setting the module size', href: 'https://www.qrcode.com/en/howto/cell.html', read: '2026-11-16' },
  ],
  facts: {
    densoVersions: { text: '1 to 40', source: 'denso-version' },
    densoSmallestGrid: { text: '21 × 21', source: 'denso-version' },
    densoLargestGrid: { text: '177 × 177', source: 'denso-version' },
    densoStep: { text: '4', source: 'denso-version' },
    densoMargin: { text: '4 modules', source: 'denso-area' },
    densoExampleVersion: { text: '3', source: 'denso-area' },
    densoExampleModules: { text: '29', source: 'denso-area' },
    densoDpi: { text: '400 dpi', source: 'denso-area' },
    densoDots: { text: '4 dots', source: 'denso-area' },
    densoModuleMm: { text: '0.254 mm', source: 'denso-area' },
    densoCodeMm: { text: '7.366 mm', source: 'denso-area' },
    densoAreaMm: { text: '9.398 mm', source: 'denso-area' },
    densoMinDots: { text: '4 or more dots', source: 'denso-module' },
    densoLaserModule: { text: '0.17 mm', source: 'denso-faq' },
    densoSmallestCode: { text: '3.57 mm', source: 'denso-faq' },
  },
  names: ['UTF-8'],
  relatedHeading: 'Related tools and guides',
};

export default texts;
