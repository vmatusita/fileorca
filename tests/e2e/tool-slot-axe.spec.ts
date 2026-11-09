import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { violationsEverywhere } from './lib/axe.ts';
import { animationsDone, dismissCookies, dragOver, generatedJpeg, hydrated, openAdjust, openCompare, slowEngine } from './lib/page.ts';

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
