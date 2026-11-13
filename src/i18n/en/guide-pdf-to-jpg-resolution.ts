import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Which Resolution to Choose for PDF to JPG, With the Pixels and Sizes',
  description: 'What the resolution of a PDF to JPG conversion changes, measured on our test PDFs: the pixels of each page, the size of the file, and when JPG or PNG is the better pick.',
  h1: 'Which resolution to choose for PDF to JPG',
  lead: 'A PDF page has no pixels until something draws it. The resolution you pick decides how many it gets, and how heavy the images will be.',
  changed: 'First version of this guide, published on {published}. The numbers were measured again on {measured}.',
  intro: [
    'Text and drawings in a PDF are stored as shapes, not as dots. To turn a page into a JPG, a program draws the page onto a grid of pixels, and the resolution, in pixels per inch, sets how fine that grid is. Ask for more and every letter gets more pixels, and the file gets bigger.',
    'PDF to JPG offers {lowPpi} for the screen, {mediumPpi} for general use and {highPpi} for printing. Here is what each one gave on {files_word} of our test PDFs, so you can pick the smallest that does the job.',
  ],
  toolHeading: 'Turn PDF pages into images',
  toolIntro: 'Drop a PDF and each page becomes a JPG at {mediumPpi}, in this browser tab, with nothing uploaded. Change the resolution or the format and the images are made again; several pages come back as one ZIP.',
  sections: [
    {
      heading: 'Pixels grow with the square of the resolution',
      paragraphs: [
        'Resolution counts pixels along one inch, and a page has two sides. So doubling the resolution doubles the width and the height, and multiplies the pixels by four. The first page of the IRS Form 1040 came out at {formWidth72} × {formHeight72} pixels at {lowPpi}, {formWidth150} × {formHeight150} at {mediumPpi} and {formWidth300} × {formHeight300} at {highPpi}.',
        'Going from {mediumPpi} to {highPpi} gave {formPixels300vs150_times} the pixels on that page, and the same on every PDF we tried. The file did not grow quite as fast: the JPG of that page went from {formJpg150Chromium} to {formJpg300Chromium}, {formJpg300vs150Chromium_times} as heavy.',
      ],
    },
    {
      heading: 'For the screen',
      paragraphs: [
        '{lowPpi} gives the smallest images. That is enough for a preview, a thumbnail or a picture in a chat, and the files are small: the first page of the form weighed {formJpg72Chromium}, and the first page of the lecture notes {bookJpg72Chromium}.',
        'Small print gets hard to read at this setting once you zoom in. If someone needs to read the text in the image, go up one step.',
      ],
    },
    {
      heading: 'For most uses',
      paragraphs: [
        '{mediumPpi} is the default, and the right choice when you are not sure. Text stays readable when you zoom in on a phone, and the files stay easy to send. Going from {lowPpi} to {mediumPpi} made the JPG of the form’s first page {formJpg150vs72Chromium_times} as heavy, for a page that reads well on any screen.',
      ],
    },
    {
      heading: 'For printing',
      paragraphs: [
        '{highPpi} is for paper. Printed text and fine lines need the extra pixels to look sharp, and the extra weight is the cost: the first page of the lecture notes went from {bookJpg150Chromium} at {mediumPpi} to {bookJpg300Chromium} at {highPpi}.',
        'More resolution only helps when the PDF has the detail to give. Our scanned book page holds one picture {scanImageWidth} pixels wide, which is {scanImagePpi} over the width of the page. At {highPpi} that picture is simply stretched over twice as many pixels in each direction: the image grew from {scanJpg150Chromium} to {scanJpg300Chromium} and showed nothing new. For a scanned PDF, match the resolution of the scan, or stay below it.',
      ],
    },
    {
      heading: 'JPG or PNG for a page',
      paragraphs: [
        'The tool can also save each page as PNG, which loses nothing. For a page of photos that is costly: the first page of our PDF of photos weighed {photosPng150Chromium} as PNG against {photosJpg150Chromium} as JPG at {mediumPpi}, {photosPngVsJpg150Chromium_times} as much.',
        'For pages of text the gap is smaller, and it depends on the browser that writes the PNG. On the form’s first page at {mediumPpi}, the PNG was {formPngVsJpg150Chromium_times} the JPG in Chromium and {formPngVsJpg150Webkit_times} in WebKit. PNG keeps text perfectly crisp, so for a page of text or a diagram it is worth trying both.',
        'Black and white scans can tip the other way. On the first page of the scanned NASA report at {highPpi}, the PNG weighed {reportPng300Chromium} against {reportJpg300Chromium} for the JPG in Chromium: a page of black text on white paper packs well without loss, and JPG spends bytes on smudges around every letter.',
      ],
    },
    {
      heading: 'A quick way to choose',
      paragraphs: [
        'Pick {lowPpi} for previews and chats, {mediumPpi} for reading on a screen and for most uploads, and {highPpi} only for printing or for a page with fine detail that someone will zoom into. Choose JPG for photos and scans in color, and try PNG for text, charts and forms.',
        'If you only need some pages, turn just those into images with the page range, rather than every page at the highest setting.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'What we measured',
  sheet: {
    stats: [
      { label: 'JPG of one page: {mediumPpi} to {highPpi}', value: '{formJpg300vs150Chromium_times}', from: '{formJpg150Chromium}', to: '{formJpg300Chromium}' },
      { label: 'Pixels on that page', value: '{formPixels300vs150_times}' },
    ],
    sample: 'Both on a single page, the first of the IRS Form 1040.',
    link: 'See all {files} PDFs in the table',
  },
  tableHeading: 'File by file',
  measuredIntro: 'The first page of each PDF at the three resolutions of the tool, in JPG and PNG. Pixels are width by height.',
  measuredNote: 'Measured on {date} through the PDF to JPG page of this site in Chromium {chromiumVersion} and in WebKit {webkitVersion} on {system}, on the first and the second page of {files_word} PDFs of our tests, the real documents and a PDF of photos (the scanned book has a single page). The pixels were the same in both browsers; the table shows the Chromium files.',
  tables: [
    {
      heading: 'The first page at each resolution',
      caption: 'The first page of each PDF at each resolution: its size in pixels, and the size of the JPG and of the PNG',
      head: ['File', 'Resolution', 'Pixels', 'JPG', 'PNG'],
    },
  ],
  sourcesHeading: 'Sources',
  sources: [
    { id: 'w3c-png', label: 'W3C: Portable Network Graphics (PNG) Specification', href: 'https://www.w3.org/TR/png-3/', read: '2026-11-01' },
    { id: 'jpeg-org', label: 'JPEG committee: JPEG 1', href: 'https://jpeg.org/jpeg/', read: '2026-11-01' },
  ],
  facts: {},
  names: ['Form 1040', 'W3C', 'JPEG 1'],
  relatedHeading: 'Related tools and guides',
};

export default texts;
