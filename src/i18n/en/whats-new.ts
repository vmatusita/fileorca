import type { WhatsNewTexts } from '../types.ts';

// F19a (decision 2; DECISOES § 752): the What's new page. The entries (date, pull request, pages) are in
// src/platform/changelog.ts; each title and text here says what changed for the person, in the voice of the site
// (docs/design/README.md), with no count of tools, no name of a phase and no number that does not come from a registry.
export default {
  title: "What's new on FileOrca",
  description: 'Every change you can see on FileOrca since the site went live: new tools, new languages and new guides, each with the day it reached the site.',
  h1: "What's new",
  intro: 'Every change you can see on FileOrca, newest first, with the day it reached the site and links to the pages it changed.',
  more: 'and {n} more',
  entries: {},
} satisfies WhatsNewTexts;
