// F19b, slice 1: the minimal text of guides-webp-vs-avif-vs-jpg in en, so the page builds; the front E writes the guide.
import type { FileGuideTexts } from '../types.ts';

export default {
  title: "WebP vs AVIF vs JPG | FileOrca",
  description: "How much the same photos weigh in each format, and when each one is the one to use.",
  h1: "WebP vs AVIF vs JPG",
  lead: "How much the same photos weigh in each format, and when each one is the one to use.",
  changed: "First published {published}.",
  intro: ["This guide is being written."],
  toolHeading: "WebP vs AVIF vs JPG",
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
      heading: "The three photos in each format",
      caption: "Each phone photo as JPG from Compress image and as WebP and AVIF from Convert to WebP, at Recommended, in Chromium, with the share of the original",
      head: ["Photo", "Original", "JPG", "WebP", "AVIF"],
    },
    {
      heading: "The PNG with transparent corners",
      caption: "The PNG with transparent corners saved as JPG by PNG to JPG and as WebP and AVIF by Convert to WebP, in Chromium: the file, its share of the PNG, and whether the transparency stayed",
      head: ["Saved as", "File", "Transparency kept"],
      labels: ["JPG", "WebP", "AVIF"],
    },
  ],
  sourcesHeading: "Sources",
  sources: [],
  facts: {},
  names: [],
  relatedHeading: "Related tools and guides",
} satisfies FileGuideTexts;
