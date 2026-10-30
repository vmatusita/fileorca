// Hydrates the tool panel island. Astro renders ToolPanel to static HTML; this one module script
// hydrates it with Preact, so the tool page loads a single JS file (DECISOES § 23: an Astro
// client:load island costs five files, which breaks the 3-request budget of the next page).
import { h, hydrate } from 'preact';
import ToolPanel, { type ToolPanelProps } from './ToolPanel.tsx';

const root = document.getElementById('fo-tool-root');
if (root?.dataset['props']) {
  const props = JSON.parse(root.dataset['props']) as ToolPanelProps;
  hydrate(h(ToolPanel, props), root);
  root.dataset['hydrated'] = 'true';
}
