import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/preact/container-renderer';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import FileCard, { type FileCardProps } from '../../src/components/FileCard.tsx';
import { ICONS } from '../../src/icons/icons.ts';

// The FileCard is ready for the F2 queue and no page uses it yet (DECISOES § 53), so this renders the
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
