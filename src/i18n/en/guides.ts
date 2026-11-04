// The guides hub /guides/ in English (F11, decision 5; DECISOES § 364): the band, the shortcuts to the three groups, the
// headings of the groups and "How these guides are made", with the texts of the specification
// (docs/propostas/ux-v2/guides-hub.html, alternative A). The guides themselves come from the registries, with the names
// and descriptions of their cards (common.fileGuides and common.guides). {n} is the number of guides of the language.
import type { GuidesHubTexts } from '../types.ts';

const texts: GuidesHubTexts = {
  title: 'Guides: image, PDF and money questions, with the numbers',
  description: '{n} guides to common questions about images, PDFs and loans, with the numbers measured or worked out and the tool inside each one.',
  eyebrow: 'Guides',
  h1: 'Answers that show the numbers',
  intro: '{n} guides to common questions about images, PDFs and loans. Each one says where its numbers come from and has the tool inside, so you can try it on the same page.',
  jumpLabel: 'Guide groups',
  groups: {
    image: { jump: 'Image', heading: 'Image guides' },
    pdf: { jump: 'PDF', heading: 'PDF guides' },
    money: { jump: 'Money', heading: 'Money guides' },
  },
  howHeading: 'How these guides are made',
  how: 'The image and PDF guides are measured on real test files, with the same engine that runs the tools on this site. Each guide lists the files it used, the day it was measured and who reviewed it. The money guides work out each example with the calculator inside them. Nothing you put into a tool leaves your device.',
  // The guide card (F11, decision 6): the kind that opens its name, the measure of a file guide ({n} test files, read from
  // data/guides-measured.json) or of a money guide, and the label of the tool at its foot.
  card: {
    kind: 'Guide',
    measured: 'Measured on {n} test files',
    workedOut: 'Numbers worked out',
    tool: 'Tool in the guide',
  },
};

export default texts;
