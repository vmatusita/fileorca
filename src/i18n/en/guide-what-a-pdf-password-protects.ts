// F19b, slice 1: the minimal text of guides-what-a-pdf-password-protects in en, so the page builds; the front E writes the guide.
import type { FileGuideTexts } from '../types.ts';

export default {
  title: "What a PDF password protects | FileOrca",
  description: "What the password to open does, what the restrictions do not, and why a short password is a weak one.",
  h1: "What a PDF password protects",
  lead: "What the password to open does, what the restrictions do not, and why a short password is a weak one.",
  changed: "First published {published}.",
  intro: ["This guide is being written."],
  toolHeading: "What a PDF password protects",
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
  // F19b (front M1): the shape of the tables, which the front E rewrites in words and keeps.
  tables: [
    {
      heading: "Three PDFs with a password",
      caption: "Three PDFs protected by Protect PDF: their pages, the file before and after, and the bytes the encryption added",
      head: ["PDF", "Pages", "Before", "After", "Added"],
    },
    {
      heading: "Restrictions without a password",
      caption: "The PDF with restrictions and no password to open, as it came and after Unlock PDF, beside a PDF after Protect PDF: the file, whether a reader opened it with no password, and the actions it blocks",
      head: ["File", "Size", "Opens with no password", "Actions blocked"],
      labels: ["Restrictions only, as it came", "The same PDF after Unlock PDF", "A PDF after Protect PDF"],
    },
  ],
  sourcesHeading: "Sources",
  sources: [],
  facts: {},
  names: [],
  relatedHeading: "Related tools and guides",
} satisfies FileGuideTexts;
