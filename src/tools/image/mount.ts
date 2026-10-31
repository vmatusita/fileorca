// Hydrates the tool panel island. Astro renders the Panel to static HTML; the tool's mount.ts calls this
// with that Panel, and Preact hydrates it from the same data-props the server used. The tool page loads
// two JS files (its mount entry and the shared chunk) instead of the five of an Astro client:load island,
// which would break the 3-request budget of the next page (DECISOES § 23).
import { h, hydrate, type ComponentType } from 'preact';

export function mountIsland<P extends object>(Panel: ComponentType<P>): void {
  const root = document.getElementById('fo-tool-root');
  if (root?.dataset['props']) {
    hydrate(h(Panel, JSON.parse(root.dataset['props']) as P), root);
    root.dataset['hydrated'] = 'true';
  }
}
