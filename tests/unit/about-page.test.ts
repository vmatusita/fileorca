// The About page and the author's photo (F19a, decision 5; DECISOES § 758 and § 762):
//  - the day the site went live comes from LAUNCH_DATE (src/platform/site.ts), in the long form of the language, in a
//    <time datetime>, and is never typed in the texts; the same paragraph links to What's new and How it works;
//  - with no files of `pnpm sobre:foto` in public/about/, the page has no photo, no empty <img>, no box kept for one, and
//    the Person of the JSON-LD has no image; with the files, the photo is there (WebP with its JPG, 160 × 160, the alt with
//    Victor's name), the Person has its image, and the author box of the guides shows it at 64 × 64.
// The two cases are rendered with the Astro container, the photo of the build standing in for the files
// (src/platform/about-photo.ts); the built pages, made with no files, are read from dist/ too.
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/preact/container-renderer';
import { loadRenderers } from 'astro:container';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { LANGS, pathFor, type Lang } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { longDate } from '../../src/i18n/dates.ts';
import { AUTHOR, LAUNCH_DATE } from '../../src/platform/site.ts';
import type { AboutPhoto } from '../../src/platform/about-photo.ts';
import type * as AboutPhotoModule from '../../src/platform/about-photo.ts';
import AboutView from '../../src/views/AboutView.astro';
import AuthorBox from '../../src/components/AuthorBox.astro';

const photoState = vi.hoisted(() => ({ photo: null as AboutPhoto | null }));
vi.mock('../../src/platform/about-photo.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof AboutPhotoModule>()),
  aboutPhoto: () => photoState.photo,
}));

const PHOTO: AboutPhoto = {
  about: { webp: '/about/victor-320.webp', jpg: '/about/victor-320.jpg', width: 160, height: 160 },
  author: { webp: '/about/victor-128.webp', jpg: '/about/victor-128.jpg', width: 64, height: 64 },
};

type Component = Parameters<AstroContainer['renderToString']>[0];
let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create({ renderers: await loadRenderers([getContainerRenderer()]) });
});
beforeEach(() => {
  photoState.photo = null;
});

const about = async (lang: Lang): Promise<HTMLElement> => parse(await container.renderToString(AboutView as Component, { props: { lang } }));
const person = (root: HTMLElement): Record<string, unknown> | undefined =>
  root.querySelectorAll('script[type="application/ld+json"]').flatMap((script) => (JSON.parse(script.text) as { '@graph'?: Record<string, unknown>[] })['@graph'] ?? []).find((node) => node['@type'] === 'Person');

describe('the About page says when the site went live, from LAUNCH_DATE (DECISOES § 758)', () => {
  for (const lang of LANGS) {
    it(`writes the long date in a <time> and links to What's new and How it works (${lang})`, async () => {
      const root = await about(lang);
      const since = root.querySelector('main [data-about="since"]');
      const time = since?.querySelector('time');
      expect(time?.getAttribute('datetime'), lang).toBe(LAUNCH_DATE);
      expect(time?.text, lang).toBe(longDate(LAUNCH_DATE, lang));
      const hrefs = since?.querySelectorAll('a').map((link) => link.getAttribute('href'));
      expect(hrefs, lang).toEqual(expect.arrayContaining([pathFor('whats-new', lang), pathFor('how-it-works', lang)]));
      expect(since?.text, lang).not.toMatch(/\{\w+\}/);
    });
  }

  it('never types the date in the texts: it comes from LAUNCH_DATE', () => {
    for (const lang of LANGS) {
      const text = JSON.stringify(TEXTS[lang].about);
      expect(text, lang).not.toContain(longDate(LAUNCH_DATE, lang));
      expect(text, lang).not.toMatch(/\b2026\b|\b31\b/);
      expect(TEXTS[lang].about.since, lang).toContain('{date}');
    }
  });
});

describe('the photo only with the files of pnpm sobre:foto (DECISOES § 762)', () => {
  for (const lang of LANGS) {
    it(`with no files: no photo, no empty <img>, no box for one, and the Person has no image (${lang})`, async () => {
      const root = await about(lang);
      const main = root.querySelector('main');
      expect(main?.querySelectorAll('img, picture, [data-photo], .fo-about__photo').length, lang).toBe(0);
      expect(main?.toString(), lang).not.toContain('/about/victor-');
      expect(person(root)?.['image'], lang).toBeUndefined();
    });

    it(`with the files: the WebP and its JPG, 160 × 160, the alt with Victor's name, and the Person's image (${lang})`, async () => {
      photoState.photo = PHOTO;
      const root = await about(lang);
      const picture = root.querySelector('main picture[data-photo="about"]');
      expect(picture?.querySelector('source')?.getAttribute('type'), lang).toBe('image/webp');
      expect(picture?.querySelector('source')?.getAttribute('srcset'), lang).toBe('/about/victor-320.webp');
      const img = picture?.querySelector('img');
      expect(img?.getAttribute('src'), lang).toBe('/about/victor-320.jpg');
      expect([img?.getAttribute('width'), img?.getAttribute('height')], lang).toEqual(['160', '160']);
      expect(img?.getAttribute('alt'), lang).toBe(AUTHOR.name);
      // Under the H1, before the first paragraph.
      const html = root.querySelector('main')?.toString() ?? '';
      expect(html.indexOf('data-photo="about"'), lang).toBeGreaterThan(html.indexOf('</h1>'));
      expect(person(root)?.['image'], lang).toBe('https://fileorca.com/about/victor-320.jpg');
    });
  }

  it('the author box shows the photo at 64 × 64 only with the files', async () => {
    const without = parse(await container.renderToString(AuthorBox as Component, { props: { lang: 'en', kind: 'money' } }));
    expect(without.querySelectorAll('img, picture').length).toBe(0);
    photoState.photo = PHOTO;
    const withPhoto = parse(await container.renderToString(AuthorBox as Component, { props: { lang: 'en', kind: 'money' } }));
    const img = withPhoto.querySelector('picture[data-photo="author"] img');
    expect(img?.getAttribute('src')).toBe('/about/victor-128.jpg');
    expect([img?.getAttribute('width'), img?.getAttribute('height')]).toEqual(['64', '64']);
    expect(withPhoto.querySelector('picture[data-photo="author"] source')?.getAttribute('srcset')).toBe('/about/victor-128.webp');
  });
});

const DIST = 'dist';
const BUILT = existsSync(join(DIST, 'index.html'));

describe.runIf(BUILT)('the About pages of dist/, as public/about/ is', () => {
  // Until Victor runs pnpm sobre:foto the repository has no public/about/, and the pages have no photo; once the four files
  // are there, the next build shows it. The photo of the build is read as the build reads it (findAboutPhoto, not mocked).
  it('have the photo if and only if the four files are in public/about/, and the date of the launch, in the three languages', async () => {
    const { findAboutPhoto } = await vi.importActual<typeof AboutPhotoModule>('../../src/platform/about-photo.ts');
    const files = findAboutPhoto();
    for (const lang of LANGS) {
      const root = parse(readFileSync(join(DIST, ...pathFor('about', lang).split('/').filter(Boolean), 'index.html'), 'utf8'));
      if (files) {
        expect(root.querySelector('main picture[data-photo="about"] img')?.getAttribute('src'), lang).toBe(files.about.jpg);
        expect(person(root)?.['image'], lang).toBe(`https://fileorca.com${files.about.jpg}`);
      } else {
        expect(root.querySelectorAll('main img, main picture, main [data-photo]').length, lang).toBe(0);
        expect(person(root)?.['image'], lang).toBeUndefined();
      }
      expect(root.querySelector('main [data-about="since"] time')?.getAttribute('datetime'), lang).toBe(LAUNCH_DATE);
    }
  });
});
