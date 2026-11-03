import type { OfflineTexts } from '../types.ts';

// The offline page (F8, decision 8; DECISOES § 289): the service worker shows it for a page it did not keep.
export default {
  title: 'Offline',
  description:
    'FileOrca keeps the pages you open with internet on this device, so they work offline. This page was not saved yet, so it needs a connection.',
  h1: "You're offline",
  says: "No internet, and this page isn't saved yet.",
  saysDetail: 'The pages you opened here with internet still work.',
  savedHeading: 'Saved on this device',
  savedEmpty: 'Nothing saved yet. Open a tool with internet and it stays here.',
  homeLink: 'Go to the home page',
} satisfies OfflineTexts;
