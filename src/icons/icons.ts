// Every icon of docs/design/assets/Icons, read at build (server only: never import this from an island,
// it would ship all 44 to the browser; the island imports single files with `?raw`).
import { ICON_NAMES, iconInner, type IconName } from './svg.ts';

const files = import.meta.glob<string>('/docs/design/assets/Icons/*.svg', { query: '?raw', import: 'default', eager: true });

export const ICONS = Object.fromEntries(
  ICON_NAMES.map((name) => {
    const raw = files[`/docs/design/assets/Icons/${name}.svg`];
    if (raw === undefined) throw new Error(`icon ${name}: missing in docs/design/assets/Icons`);
    return [name, iconInner(raw)];
  }),
) as Record<IconName, string>;
