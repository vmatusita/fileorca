// Lazy entry of the tool search: bundled on its own (see SearchDialog.astro) and loaded on first
// use; it publishes the API on window because the bundle keeps side effects, not exports.
import { attach, openSearch } from './search.ts';

declare global {
  interface Window {
    foSearch?: { attach: typeof attach; openSearch: typeof openSearch };
  }
}

window.foSearch = { attach, openSearch };
