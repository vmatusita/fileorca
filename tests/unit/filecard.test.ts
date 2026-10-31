import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/preact/container-renderer';
import { loadRenderers } from 'astro:container';
import { h } from 'preact';
import { beforeAll, describe, expect, it } from 'vitest';
import FileCard, { type FileCardProps } from '../../src/components/FileCard.tsx';
import { ICONS } from '../../src/icons/icons.ts';

// The FileCard is the row of the F2 queue (DECISOES § 53); this renders the
// component itself and checks it against the markup of docs/design/components/FileCard/preview.html.
const labels = { to: 'to', download: 'Download {name}', cancel: 'Cancel {name}', remove: 'Remove {name}' };
const noop = () => {};
let container: AstroContainer;

async function render(props: FileCardProps): Promise<string> {
  return container.renderToString(FileCard as never, { props: props as never });
}

beforeAll(async () => {
  container = await AstroContainer.create({ renderers: await loadRenderers([getContainerRenderer()]) });
});

describe('FileCard pronto para a F2', () => {
  it('done: the sizes with the arrow icon and "to" for screen readers, the gain with check, a named download', async () => {
    const html = await render({ state: 'done', name: 'IMG_2041.jpg', category: 'image', labels, before: '2.4 MB', after: '780 KB', gain: '−68%', onDownload: noop });
    expect(html).toContain('class="fo-file fo-dogear fo-cat--image"');
    expect(html).toContain('<p class="fo-file__name" title="IMG_2041.jpg">IMG_2041.jpg</p>');
    expect(html).toContain(ICONS['arrow-right']);
    expect(html).toMatch(/fo-icon fo-icon--inline[\s\S]*<span class="fo-sr">to<\/span>/);
    expect(html).toMatch(/class="fo-file__gain">[\s\S]*−68%/);
    expect(html).toContain(ICONS.check);
    expect(html).toContain('aria-label="Download IMG_2041.jpg"');
    expect(html).not.toContain('→');
  });

  it('working: a named progressbar filled by scaleX, and a cancel button', async () => {
    const html = await render({ state: 'working', name: 'beach.png', category: 'image', labels, status: 'Compressing… 5.1 MB', progress: 0.62, onCancel: noop });
    expect(html).toMatch(/class="fo-bar" role="progressbar" aria-label="beach.png" aria-valuemin="0" aria-valuemax="100" aria-valuenow="62" style="--value:0.62"/);
    expect(html).toContain('aria-label="Cancel beach.png"');
    expect(html).toContain('fo-btn--ghost');
  });

  it('error: danger state, the file icon in the thumb, the alert with the reason, a named remove', async () => {
    const html = await render({ state: 'error', name: 'scan.tiff', category: 'image', labels, reason: "TIFF isn't supported yet", onRemove: noop });
    expect(html).toContain('data-state="error"');
    expect(html).toMatch(/class="fo-file__thumb">[\s\S]*?<\/div>/);
    expect(html.match(/class="fo-file__thumb">([\s\S]*?)<\/div>/)?.[1]).toContain(ICONS.file);
    expect(html.match(/class="fo-file__err">([\s\S]*?)<\/span>/)?.[1]).toContain(ICONS.alert);
    expect(html).toContain('aria-label="Remove scan.tiff"');
  });
});

describe('FileCard da fila da F2', () => {
  const queueLabels = { ...labels, select: 'Show {name}' };

  it('waiting: the status, no bar, a named cancel', async () => {
    const html = await render({ state: 'waiting', name: 'b.png', category: 'image', labels, status: 'Waiting', onCancel: noop });
    expect(html).toContain('Waiting');
    expect(html).not.toContain('role="progressbar"');
    expect(html).toContain('aria-label="Cancel b.png"');
  });

  it('done without a gain: a neutral note instead of the check, and the sizes only when there is an "after"', async () => {
    const note = await render({ state: 'done', name: 'IMG_1.heic', category: 'image', labels, before: '2.4 MB', after: '3.1 MB', note: '4032 × 3024', downloadName: 'IMG_1.jpg', onDownload: noop });
    expect(note).toContain('4032 × 3024');
    expect(note).not.toContain('fo-file__gain');
    expect(note).toContain('aria-label="Download IMG_1.jpg"');
    const single = await render({ state: 'done', name: 'a.jpg', category: 'image', labels, before: '2.4 MB', note: 'Already optimized', onDownload: noop });
    expect(single).toContain('2.4 MB');
    expect(single).not.toContain('<span class="fo-sr">to</span>');
    const noDownload = await render({ state: 'done', name: 'page.jpg', category: 'image', labels, before: '1 MB', note: '10 × 10' });
    expect(noDownload).not.toContain('aria-label="Download');
  });

  it('a pick toggle names the file and says whether it is the one shown; without onSelect the thumb is plain', async () => {
    const off = await render({ state: 'done', name: 'a.jpg', category: 'image', labels: queueLabels, before: '1 MB', after: '500 KB', gain: '−50%', onDownload: noop, onSelect: noop });
    expect(off).toContain('class="fo-file__pick"');
    expect(off).toContain('aria-pressed="false"');
    expect(off).toContain('aria-label="Show a.jpg"');
    expect(off).not.toContain('data-selected');
    const on = await render({ state: 'done', name: 'a.jpg', category: 'image', labels: queueLabels, before: '1 MB', after: '500 KB', gain: '−50%', onDownload: noop, onSelect: noop, selected: true });
    expect(on).toContain('aria-pressed="true"');
    expect(on).toContain('data-selected="true"');
    const plain = await render({ state: 'done', name: 'a.jpg', category: 'image', labels, before: '1 MB', after: '500 KB', gain: '−50%', onDownload: noop });
    expect(plain).not.toContain('fo-file__pick');
  });

  it('error: the reason may carry a link to the tool that opens the file', async () => {
    const reason = ['IMG.heic is a HEIC file. Open it in ', h('a', { href: '/heic-to-jpg/' }, 'HEIC to JPG'), '.'];
    const html = await render({ state: 'error', name: 'IMG.heic', category: 'image', labels, reason, onRemove: noop });
    expect(html).toMatch(/class="fo-file__err">[\s\S]*Open it in <a href="\/heic-to-jpg\/">HEIC to JPG<\/a>\./);
  });
});
