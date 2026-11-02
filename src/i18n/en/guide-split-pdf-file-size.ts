import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'How to Split a PDF, and Why the Parts Can Weigh More Than the Whole',
  description: 'Why the parts of a split PDF can add up to far more than the original, measured on our test PDFs, and how to split so they do not.',
  h1: 'How to split a PDF, and why the parts can weigh more than the whole',
  lead: 'You split a big PDF to send it in pieces, and the pieces add up to more than the file you started with. Here is why that happens, and when it does not.',
  changed: 'First version, with the measurements of {date}.',
  intro: [
    'Splitting a PDF sounds like cutting paper: the pages go into separate piles and nothing is added. A PDF does not work like that. Each part has to be a complete PDF on its own, able to open anywhere, so it carries everything its pages need to show correctly, and Split PDF also gives every part a copy of the description of the original document.',
    'How much that adds depends on the file. We split {files_word} PDFs of our tests, one part per page, and added the parts up. The parts of {bigger_word} of them weighed more than the whole: those of the lecture notes {bookRatio_times} as much, those of the scanned NASA report {reportRatio_more} more, and those of the PDF of photos {photosGrowth_exact} more.',
  ],
  toolHeading: 'Split your PDF here',
  toolIntro: 'Drop a PDF, choose to split every page or type the ranges you want, and press the button. The parts are made in this browser tab and come back as one ZIP; nothing is uploaded.',
  sections: [
    {
      heading: 'Each part is a whole PDF',
      paragraphs: [
        'When Split PDF makes a part, it starts a new PDF and copies into it the pages of that part, with everything those pages use: the fonts, the pictures, the links and the form fields that sit on them. A picture that sits on a single page goes into a single part. A font used on every page goes into every part.',
        'That last point is the whole story. A PDF stores each font once and lets every page share it. Split it into one file per page, and each file needs its own copy.',
      ],
    },
    {
      heading: 'Where the parts grew: fonts',
      paragraphs: [
        'Our lecture notes have {bookParts} pages set in many embedded fonts. Split into {bookParts} parts, they added up to {bookSum}, {bookRatio_times} the original {bookTotal}. Almost all of the growth was fonts: the whole file holds {bookFonts} of font data, and the parts together held {bookPartFonts}, {bookFontsRatio_times} as much.',
        'The pictures did not grow at all. Each one sits on a single page, so it went into a single part, and the parts held {bookPartImages} of pictures, exactly what the whole file holds. Adobe notes that adding a single font to a PDF can sometimes increase its size substantially; splitting can repeat that cost in every part that uses the font.',
      ],
    },
    {
      heading: 'Scans: what every part repeats',
      paragraphs: [
        'A scanned document is one picture per page, and each picture goes into one part. Our scanned NASA report has {reportParts} pages; split into {reportParts} parts, it added up to {reportSum}, {reportRatio_more} more than the whole, with the pictures the same bytes as before. Most of the growth, {reportMetadataShare}, was the metadata of the document: a description of the file in a format called XMP, {reportMetadata} in the original. Split PDF copies it into every part, so the parts held {reportPartMetadata} of it. The rest is the small structure each part needs around its page.',
        'Our PDF of photos carries no such description. Split into its {photosParts} pages, it grew by only {photosGrowth_exact}.',
      ],
    },
    {
      heading: 'When the parts weigh less',
      paragraphs: [
        'The IRS form went the other way. Split into its {formParts} pages, the parts added up to {formSum}, {formRatio_off} less than the original. The form carries a second description of itself, in a format called XFA, that only some programs read. Split PDF does not copy it into the parts, and it says so next to the file; the form fields themselves are kept.',
        'The parts are also written with their structure packed tightly, in compressed object streams, which is part of why a part can come out smaller than its share of the whole.',
      ],
    },
    {
      heading: 'How to split without the extra weight',
      paragraphs: [
        'Split into ranges, not single pages, when the pages share their fonts. A chapter in one part carries its fonts once, where its pages split apart carry them once each. Type the ranges you need in the tool, for example by chapter or by section, instead of splitting every page.',
        'If you split to get under an email limit, check the total, not only each part: a part that fits can still be the first of many heavy ones. Each part of our scanned report added about {reportGrowthPerPart} to the total, and {reportMetadata} of that is its own copy of the metadata; the rest is its structure. Fewer, larger parts repeat both fewer times. Compress PDF can make the pictures lighter before you split.',
        'And if what you need is a shorter PDF rather than several, delete the pages you do not need instead. One file keeps its fonts once, however many pages go.',
      ],
    },
    {
      heading: 'What we measured on each file',
      paragraphs: [
        'We split {files} PDFs into one part per page, the default of Split PDF, and added up the parts. The parts weighed more than the whole in {bigger} of them. The table shows each file, with its fonts before and after, since fonts made most of the extra weight in our sample.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'What we measured',
  measuredIntro: 'Each PDF split into one part per page, the default of Split PDF. Change is all the parts against the whole file; fonts shows the font data of the whole file, then of all the parts together.',
  measuredNote: 'Measured on {date} in Node with the engine of this site, which gives the same bytes as the browser, on {files_word} PDFs of our tests, the real documents and a PDF of photos. Fonts, pictures and metadata were counted with pdf-lib, the library the engine opens files with.',
  tables: [
    {
      heading: 'One part per page',
      caption: 'Each PDF: the number of parts, the size of the whole file, the size of all the parts together, the change, and the font data before and after',
      head: ['File', 'Parts', 'Whole file', 'All parts', 'Change', 'Fonts'],
    },
  ],
  sourcesHeading: 'Sources',
  sources: [
    { id: 'adobe', label: 'Adobe: Why is my PDF so big?', href: 'https://www.adobe.com/acrobat/hub/why-is-pdf-so-big.html', read: '2026-11-01' },
  ],
  facts: {},
  names: [],
  relatedHeading: 'Related tools and guides',
};

export default texts;
