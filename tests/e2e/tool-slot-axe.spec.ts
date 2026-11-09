import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { violationsEverywhere } from './lib/axe.ts';
import { animationsDone, dismissCookies, dragOver, generatedJpeg, hydrated, openAdjust, openCompare, slowEngine } from './lib/page.ts';
import { SW_ENABLED } from '../../src/platform/site.ts';
import { arriveFrom } from './lib/inbox.ts';
import { pdfFile } from './lib/pdf-tools.ts';
import { controlled } from './lib/sw.ts';

// F13a · axe in every state of the image island of the UX-04 A (decision 5 and criterion 9 of the run; DECISOES
// § 474): at rest, with a file over the rectangle, processing, with the result, with the result and the comparison and
// "Adjust" open, and in the three errors (a file that is no image, a .png whose content is no image, a PNG on HEIC to JPG),
// in both themes at 360 and 1280px, in both browsers. The behaviour of the same states is in tool-slot.spec.ts. This file
// carries the heavy axe runs on its own, in a light part of the CI (the name puts it there; the § says which).

test.use({ reducedMotion: 'reduce' });

const fixture = (name: string, as: string, mimeType: string) => ({ name: as, mimeType, buffer: readFileSync(resolve('fixtures/images', name)) });

test('at rest, with a file over the rectangle and processing: no axe violation', async ({ page }) => {
  await page.goto('/compress-image/');
  await hydrated(page);
  await dismissCookies(page);
  await animationsDone(page);
  expect(await violationsEverywhere(page), 'repouso').toEqual([]);
  await dragOver(page);
  expect(await violationsEverywhere(page), 'arquivo em cima').toEqual([]);
  await page.dispatchEvent('.fo-drop', 'dragleave');
  await expect(page.locator('.fo-drop[data-state="over"]')).toHaveCount(0);
  const engine = await slowEngine(page);
  await page.setInputFiles('input[type="file"]', { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: await generatedJpeg(page) });
  await expect(page.locator('.fo-level')).toBeVisible();
  const found = await violationsEverywhere(page);
  engine.release();
  expect(found, 'processando').toEqual([]);
  await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
});

test('with the result, then with the comparison and "Adjust" open: no axe violation', async ({ page }) => {
  await page.goto('/compress-image/');
  await hydrated(page);
  await dismissCookies(page);
  await page.setInputFiles('input[type="file"]', { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: await generatedJpeg(page) });
  await expect(page.locator('.fo-btn--download')).toBeFocused({ timeout: 30_000 });
  await animationsDone(page);
  expect(await violationsEverywhere(page), 'resultado').toEqual([]);
  await openCompare(page);
  await openAdjust(page);
  await animationsDone(page);
  expect(await violationsEverywhere(page), 'resultado com o antes e depois e o Ajustar abertos').toEqual([]);
});

test('the three errors (no image, a .png with no image inside, a PNG on HEIC to JPG): no axe violation', async ({ page }) => {
  for (const [path, file, label] of [
    ['/compress-image/', { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello, this is not an image') }, 'não é imagem'],
    ['/compress-image/', fixture('gen-texto-extensao-png.png', 'notes.png', 'image/png'), 'a extensão não bate com o conteúdo'],
    ['/heic-to-jpg/', fixture('gen-png-transparente.png', 'notes.png', 'image/png'), 'um PNG no HEIC para JPG'],
  ] as const) {
    await page.goto(path);
    await hydrated(page);
    await dismissCookies(page);
    await page.setInputFiles('input[type="file"]', file);
    await expect(page.locator('.fo-drop[data-state="error"]')).toBeVisible({ timeout: 30_000 });
    await animationsDone(page);
    expect(await violationsEverywhere(page), label).toEqual([]);
  }
});

// F15 (frente L; DECISOES § 651 and § 652): the list of Image to PDF with the arrows and the bin outside each card, then the
// line a row leaves with its Undo, in both themes at 360 and 1280px.
test('the list of Image to PDF with its arrows and bins, and the line of a row that left: no axe violation', async ({ page }) => {
  await page.goto('/image-to-pdf/');
  await hydrated(page);
  await dismissCookies(page);
  const photo = await generatedJpeg(page);
  await page.setInputFiles('input[type="file"]', ['photo-1.jpg', 'photo-2.jpg', 'photo-3.jpg'].map((name) => ({ name, mimeType: 'image/jpeg', buffer: photo })));
  await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.fo-filelist .fo-filelist__remove')).toHaveCount(3);
  await animationsDone(page);
  expect(await violationsEverywhere(page), 'a lista com as setas e as lixeiras').toEqual([]);
  await page.getByRole('button', { name: 'Remove photo-2.jpg', exact: true }).click();
  await expect(page.locator('.fo-filelist__undo [role="status"]')).toHaveText('photo-2.jpg is out of the list.');
  expect(await violationsEverywhere(page), 'a linha do Desfazer').toEqual([]);
});

// F15 (decision 13 of the run; DECISOES § 655): the PDFs a next-step chip brought wait for the action in Merge PDF (the list,
// the count and the button) and in Protect PDF (the ready card and the fields of the password), and the result of Image to
// PDF shows the three chips that take the PDF along with the PDF line under them (a service worker in control). The inbox is
// written in the page as a chip writes it (tests/e2e/lib/inbox.ts), with service workers allowed (the Cache Storage of the
// WebKit of Playwright does not outlive a reload otherwise).
test.describe('the chip that takes the PDF along and its arrival at a tool with an action', () => {
  test.use({ serviceWorkers: 'allow' });

  test('the PDFs that came wait in Merge PDF and in Protect PDF: no axe violation', async ({ page }) => {
    for (const [tool, files, ready] of [
      ['merge-pdf', [pdfFile('gen-paginas-mistas.pdf', 'first.pdf'), pdfFile('gen-acoes.pdf', 'second.pdf')], '#fo-tool-root .fo-merge-panel .fo-btn--brand'],
      ['protect-pdf', [pdfFile('gen-paginas-mistas.pdf', 'pages.pdf')], '#fo-tool-root .fo-ready .fo-btn--brand'],
    ] as const) {
      await page.goto(`/${tool}/`);
      await hydrated(page);
      await dismissCookies(page);
      await arriveFrom(page, tool, 'compress-pdf', files);
      await expect(page.locator(ready)).toBeVisible({ timeout: 30_000 });
      await expect(page.locator('#fo-tool-root .fo-pdf-island > p.fo-sr[role="status"]')).toContainText('Compress PDF');
      await animationsDone(page);
      expect(await violationsEverywhere(page), `a chegada no ${tool}`).toEqual([]);
    }
  });

  test('the result of Image to PDF with the chips that take the PDF and the PDF line: no axe violation', async ({ page }) => {
    test.skip(!SW_ENABLED, 'the kill switch is on: a chip only links (handoff.spec.ts proves the worker is gone)');
    await page.goto('/image-to-pdf/');
    await hydrated(page);
    await dismissCookies(page);
    await controlled(page);
    await page.reload();
    await hydrated(page);
    await page.setInputFiles('input[type="file"]', { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: await generatedJpeg(page) });
    await expect(page.locator('.fo-btn--download')).toBeFocused({ timeout: 30_000 });
    await expect(page.locator('nav.fo-next a.fo-chip[data-carry]')).toHaveCount(3);
    await expect(page.locator('.fo-band__now .fo-carry')).toBeVisible();
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'os chips da Imagem para PDF que levam o PDF').toEqual([]);
  });
});
