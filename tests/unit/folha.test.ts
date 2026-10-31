import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { POSES } from '../../src/oli/poses.ts';
import { FOLHA_PATH, folhaInput, renderFolhaFile } from '../../scripts/design/folha.ts';
import { renderFolha } from '../../scripts/lib/folha.ts';

const html = renderFolhaFile();
const sections = html.split('<section ').slice(1);
const count = (text: string, part: string) => text.split(part).length - 1;

describe('folha da Oli', () => {
  it('is up to date with the sprite: run "node scripts/design/folha.ts" if this fails', () => {
    expect(html).toBe(readFileSync(FOLHA_PATH, 'utf8'));
  });

  it('is deterministic and uses LF line endings', () => {
    expect(renderFolha(folhaInput())).toBe(html);
    expect(html).not.toContain('\r');
    expect(html.endsWith('</html>\n')).toBe(true);
    expect(html).toContain('<html lang="pt-BR">');
    expect(html).toContain('<title>Folha da Oli · FileOrca</title>');
  });

  it('opens from file:// with no network: no http(s) URL, no <link>, no <script>', () => {
    // Only the first offending text is compared, so a failure does not dump the whole page.
    for (const forbidden of [/https?:\/\/[^\s"')]*/i, /<link[\s>]/i, /<script[\s>]/i, /@import/i, /\burl\((?!#)[^)]*/i]) {
      expect(forbidden.exec(html)?.[0], String(forbidden)).toBeUndefined();
    }
    for (const match of html.matchAll(/\s(?:src|href)="([^"]*)"/g)) {
      const value = match[1] ?? '';
      expect(value.startsWith('#') || value.startsWith('data:image/svg+xml;base64,'), value.slice(0, 40)).toBe(true);
    }
  });

  it('carries the sprite once, hidden off-screen', () => {
    expect(count(html, 'class="fo-sprite"')).toBe(1);
    expect(count(html, 'id="oli-clip"')).toBe(1);
    expect(html).toContain('.fo-sprite{position:absolute;width:0;height:0;overflow:hidden}');
    for (const pose of POSES) expect(count(html, `<symbol id="oli-${pose}"`), pose).toBe(1);
    const ids = [...html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1] ?? '');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('shows the nine poses at 32, 64 and 512 px on a light and a dark background', () => {
    expect(sections).toHaveLength(2);
    expect(sections[0]).toContain('class="fundo fundo--claro"');
    expect(sections[1]).toContain('class="fundo fundo--escuro"');
    for (const section of sections) {
      for (const pose of POSES) {
        for (const size of [32, 64, 512]) {
          const height = pose === 'peek' ? (size * 80) / 128 : size;
          const cell = `<svg width="${size}" height="${height}" aria-hidden="true"><use href="#oli-${pose}"/></svg><figcaption>${pose}</figcaption>`;
          expect(count(section, cell), `${pose} ${size}`).toBe(1);
        }
      }
      expect(count(section, '<use ')).toBe(27);
    }
  });

  it('shows the app icon at 16 and 32 px, as an image with a data URI, in both sections', () => {
    for (const section of sections) {
      expect(count(section, '<img ')).toBe(2);
      for (const size of [16, 32]) {
        expect(section).toMatch(new RegExp(`<img src="data:image/svg\\+xml;base64,[A-Za-z0-9+/=]+" width="${size}" height="${size}" alt="[^"]+">`));
      }
    }
    const icon = /data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)/.exec(html)?.[1] ?? '';
    expect(Buffer.from(icon, 'base64').toString('utf8')).toBe(readFileSync('docs/design/assets/Logo/app-icon.svg', 'utf8'));
  });

  it('uses the colors of the design tokens and rejects anything else', () => {
    expect(html).toContain('.fundo--claro{background:#F7FAFD;color:#0F1B2D}');
    expect(html).toContain('.fundo--escuro{background:#0B1524;color:#F7FAFD}');
    const input = folhaInput();
    expect(() => renderFolha({ ...input, colors: { ...input.colors, muted: 'red; }' } })).toThrow(/cor muted inválida/);
  });

  it('says what the sheet is for', () => {
    expect(html).toContain('Google Lens');
    expect(html).toContain('F2');
    expect(html).toContain('run 1c');
  });
});
