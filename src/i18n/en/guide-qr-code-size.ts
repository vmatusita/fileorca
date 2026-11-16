// F19b (front M5): the minimal text of guides-qr-code-size in en, so the page builds; the front E writes the guide.
import type { FileGuideTexts } from '../types.ts';

export default {
  title: "QR code size | FileOrca",
  description: "How the text you type sets the number of squares in a QR code, and what that means for the PNG and for print.",
  h1: "QR code size",
  lead: "How the text you type sets the number of squares in a QR code, and what that means for the PNG and for print.",
  changed: "First published {published}.",
  intro: ["This guide is being written."],
  // Two lines at 360 px beside the Oli of the QR panel, who rises 86 px above it (guide-page.spec.ts: the Oli clear of the sheet).
  toolHeading: "Make a QR code and see its size here",
  toolIntro: "This guide is being written.",
  sections: [
    { heading: "Part 1", paragraphs: ["This guide is being written."] },
    { heading: "Part 2", paragraphs: ["This guide is being written."] },
    { heading: "Part 3", paragraphs: ["This guide is being written."] },
  ],
  half: 1,
  measuredHeading: "What we measured",
  sheet: {
    stats: [
      { label: "What we measured", value: "This guide is being written." },
      { label: "What we measured", value: "This guide is being written." },
    ],
    sample: "This guide is being written.",
    link: "See the table",
  },
  tableHeading: "The measurement",
  measuredIntro: "This guide is being written.",
  measuredNote: "Measured on {date}.",
  // F19b (front M5): the shape of the tables, which the front E rewrites in words and keeps (the labels name the texts, in
  // the order of the measurement: the short link, the sentence without accents, the same sentence with them, the long link).
  tables: [
    {
      heading: "The texts and their codes",
      caption: "Each text typed into the QR code generator, in Chromium: its characters, what the tool counts, the version the reader found, the squares on a side and the dark squares under Oli",
      head: ["Text", "Characters", "Counted by the tool", "Version", "Squares per side", "Dark squares under Oli"],
      labels: ["Short link", "Sentence without accents", "Same sentence with accents", "Long link"],
    },
    {
      heading: "The PNG of each text at each size",
      caption: "The PNG of each text at each size of the QR code generator, in Chromium: its pixels, the pixels of each square and the file",
      head: ["Text", "PNG size", "Pixels", "Pixels per square", "File"],
    },
  ],
  sourcesHeading: "Sources",
  sources: [],
  facts: {},
  names: [],
  relatedHeading: "Related tools and guides",
} satisfies FileGuideTexts;
