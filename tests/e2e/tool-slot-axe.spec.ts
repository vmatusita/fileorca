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

// F15, frente Q (DECISOES § 656, § 658 and § 659): Compress image with "Up to a size" and its field open (before the result,
// and in "Adjust" after it), and with the error of the field; the QR code with the new order of the panel (the field, the
// output, the options), with and without a code. Both themes, 360 and 1280 px.
test.describe('F15: Compress "Up to a size" and the QR code in the new order: no axe violation', () => {
  test('Compress image with the field "Maximum size" open, in "Adjust" and with its error', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/compress-image/');
    await hydrated(page);
    await dismissCookies(page);
    await page.locator('.fo-seg__opt', { has: page.locator('input[name="ci-level"][value="size"]') }).click();
    await expect(page.locator('#ci-max')).toBeVisible();
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'o campo aberto antes do arquivo').toEqual([]);
    await page.setInputFiles('input[type="file"]', { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: await generatedJpeg(page) });
    await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 30_000 });
    await openAdjust(page);
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'o campo no Ajustar').toEqual([]);
    await page.locator('#ci-max').fill('5');
    await page.locator('#ci-max').blur();
    await expect(page.locator('#ci-max')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#ci-max-error')).toBeVisible();
    expect(await violationsEverywhere(page), 'o erro do campo').toEqual([]);
  });

  test('the QR code, field, output and options, without a code and with one', async ({ page }) => {
    await page.goto('/qr-code-generator/');
    await hydrated(page);
    await dismissCookies(page);
    await animationsDone(page);
    expect(await violationsEverywhere(page), 'sem código').toEqual([]);
    await page.locator('#fo-qr-text').fill('https://fileorca.com/');
    await expect(page.locator('.fo-qr__code > svg')).toBeVisible();
    expect(await violationsEverywhere(page), 'com código').toEqual([]);
  });
});
