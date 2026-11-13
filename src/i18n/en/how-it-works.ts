import type { HowItWorksTexts } from '../types.ts';

// F19a (decision 7; DECISOES § 759): the How it works page. Every technical sentence has its proof in
// tests/e2e/launch-claims.spec.ts (the list of the sentences of this page and the test of each); the page never names the
// code host of FileOrca, and tests/unit/how-it-works.test.ts reads it in the three languages.
export default {
  title: 'How FileOrca works: what happens to your file',
  description: 'What happens to a file you open on FileOrca, what runs as WebAssembly, what goes over the network and what never does, and how to check it in your browser.',
  h1: 'How FileOrca works',
  intro: "FileOrca's tools run in your browser. This page shows what happens to your file, which code does the work, what travels over the network and what never does, and how you can check it yourself.",
} satisfies HowItWorksTexts;
