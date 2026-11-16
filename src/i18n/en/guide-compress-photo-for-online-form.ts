// F19b, slice 1: the minimal text of guides-compress-photo-for-online-form in en, so the page builds; the front E writes the guide.
import type { FileGuideTexts } from '../types.ts';

export default {
  title: "Photo for an online form | FileOrca",
  description: "What the size limit of a form means, and what a phone photo gives up to fit under it.",
  h1: "Photo for an online form",
  lead: "What the size limit of a form means, and what a phone photo gives up to fit under it.",
  changed: "First published {published}.",
  intro: ["This guide is being written."],
  toolHeading: "Photo for an online form",
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
  // F19b (front M1): the shape of the table, which the front E rewrites in words and keeps.
  tables: [
    {
      heading: "Each photo under each limit",
      caption: "What Up to a size gave each phone photo under each limit in Chromium: the file, its dimensions, the quality it reached, and the highest quality at which the whole photo would have fit at its full size",
      head: ["Limit", "Photo", "File", "Dimensions in pixels", "Quality reached", "Full size fits up to quality"],
    },
  ],
  sourcesHeading: "Sources",
  sources: [],
  facts: {},
  names: [],
  relatedHeading: "Related tools and guides",
} satisfies FileGuideTexts;
