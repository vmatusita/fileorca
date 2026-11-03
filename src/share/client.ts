// The script of the "Open with" page (F8, decision 1; DECISOES § 290). It reads the share inbox the service worker
// filled (names, sizes and the first bytes of each file, which never leave the device), shows the files and the
// tools that take at least one of them, and, when the person picks a tool, writes in this tab's sessionStorage which
// tool and in what order; the tool's island then takes the files (src/tools/image/inbox.ts). The names the page and
// the worker agree on come from the page's data attributes, so nothing of the island chunk is loaded here.
import { FORMAT_LABEL, deliveryOrder, formatOfBytes, sizeLabel, takes, type OpenWithLang } from './logic.ts';

interface Shared {
  name: string;
  size: number;
  format: string;
}

const HEAD_BYTES = 64 * 1024;

function fill(template: string, values: Record<string, number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => (key in values ? String(values[key]) : whole));
}

async function readInbox(root: HTMLElement): Promise<Shared[]> {
  const data = root.dataset;
  const inboxName = data['inbox'] ?? '';
  if (typeof caches === 'undefined' || !(await caches.has(inboxName))) return [];
  const inbox = await caches.open(inboxName);
  const prefix = data['entryPrefix'] ?? '';
  const indexOf = (url: string) => Number(new URL(url).pathname.slice(prefix.length));
  const requests = [...(await inbox.keys())].filter((request) => new URL(request.url).pathname.startsWith(prefix)).sort((a, b) => indexOf(a.url) - indexOf(b.url));
  const now = Date.now();
  const shared: Shared[] = [];
  for (const request of requests) {
    const response = await inbox.match(request);
    if (!response) continue;
    const stored = Number(response.headers.get(data['timeHeader'] ?? '') ?? NaN);
    if (!Number.isFinite(stored) || now - stored > Number(data['ttl'] ?? 0)) continue;
    const blob = await response.blob();
    let name = '';
    try {
      name = decodeURIComponent(response.headers.get(data['nameHeader'] ?? '') ?? '');
    } catch {
      name = '';
    }
    const head = new Uint8Array(await blob.slice(0, HEAD_BYTES).arrayBuffer());
    shared.push({ name, size: blob.size, format: formatOfBytes(head) });
  }
  return shared;
}

function show(root: HTMLElement, shared: Shared[]): void {
  const data = root.dataset;
  const lang = (data['lang'] ?? 'en') as OpenWithLang;
  const list = root.querySelector<HTMLUListElement>('[data-files]');
  for (const file of shared) {
    const item = document.createElement('li');
    const name = document.createElement('span');
    name.className = 'fo-shared__name';
    name.textContent = file.name || (data['unnamed'] ?? '');
    const meta = document.createElement('span');
    meta.className = 'fo-shared__meta';
    meta.textContent = `${sizeLabel(file.size, lang)} · ${FORMAT_LABEL[file.format] ?? data['unknown'] ?? ''}`;
    item.append(name, meta);
    list?.append(item);
  }
  const formats = shared.map((file) => file.format);
  let shown = 0;
  for (const group of root.querySelectorAll<HTMLElement>('[data-group]')) {
    let inGroup = 0;
    for (const card of group.querySelectorAll<HTMLElement>('[data-tool]')) {
      const accepts = (card.dataset['accepts'] ?? '').split(' ');
      const single = card.dataset['single'] === 'true';
      const count = takes(accepts, single, formats);
      if (count === 0) continue;
      const label = card.querySelector<HTMLElement>('[data-takes]');
      if (label) {
        const total = shared.length;
        label.textContent = total === 1 ? (data['takesThis'] ?? '') : count === total ? fill(data['takesAll'] ?? '', { total }) : fill(data['takesSome'] ?? '', { count, total });
      }
      card.hidden = false;
      card.querySelector('a')?.addEventListener('click', () => {
        try {
          sessionStorage.setItem(data['toolKey'] ?? '', JSON.stringify({ tool: card.dataset['tool'], order: deliveryOrder(accepts, formats) }));
        } catch {
          // Without sessionStorage the tool opens empty, and the person drops the files there.
        }
      });
      inGroup += 1;
    }
    group.hidden = inGroup === 0;
    shown += inGroup;
  }
  root.querySelector<HTMLElement>('[data-no-tool]')?.toggleAttribute('hidden', shown > 0);
  for (const empty of root.querySelectorAll<HTMLElement>('[data-empty]')) empty.hidden = true;
  root.querySelector<HTMLElement>('[data-shared]')?.removeAttribute('hidden');
}

/** No files (opened directly, or a browser without the worker): the page explains and leads to the hubs. */
function showEmpty(root: HTMLElement): void {
  for (const empty of root.querySelectorAll<HTMLElement>('[data-empty]')) empty.hidden = false;
}

const root = document.querySelector<HTMLElement>('[data-open-with]');
if (root) {
  void readInbox(root)
    .then((shared) => (shared.length > 0 ? show(root, shared) : showEmpty(root)))
    .catch(() => showEmpty(root));
}
