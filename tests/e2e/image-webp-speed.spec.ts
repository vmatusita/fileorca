import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { imageSize, sniff } from './lib/images.ts';
import { expectNoMetadata, filesOf, openTool, oracle, takeDownload } from './lib/matrix.ts';

// F18 (decision 16; DECISOES § 739, the F17 m-1 of group 27): the sibling of image-avif-speed.spec.ts, so the page's "AVIF
// takes longer to save than WebP" can be read against a number of the same runner. Convert to WebP gets the same 12 MP
// photo with WebP (its default), once per browser, and the line "[webp 12 MP] <browser> <seconds>" is printed, from the
// gesture (the file goes in) to the Download on screen. The time is a measure, not a criterion, and the test stays in the
// CI so every full run logs the number of its runner. What it asserts is only the output: a WebP of the display size of the
// oracle, with no Exif, XMP, IPTC or GPS (the photo has GPS).

const PHOTO = 'jpg-01-pixel2-retrato-gps.jpg'; // 3024 × 4032, 12 MP, 4.3 MB, with GPS

test('[webp 12 MP] Convert to WebP writes the 12 MP photo as a WebP of its size, with no metadata', async ({ page, browserName }) => {
  await openTool(page, '/convert-to-webp/');
  await expect(page.locator('input[name="cw-format"][value="webp"]'), 'WebP is the default').toBeChecked();

  const started = Date.now();
  await page.setInputFiles('input[type="file"]', resolve('fixtures/images', PHOTO));
  await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 55_000 });
  const seconds = (Date.now() - started) / 1000;
  console.log(`[webp 12 MP] ${browserName} ${seconds.toFixed(1)}`);
  test.info().annotations.push({ type: 'webp 12 MP', description: `${browserName} ${seconds.toFixed(1)} s` });

  const [out, ...more] = filesOf(await takeDownload(page));
  expect(more, 'one file out').toEqual([]);
  if (!out) throw new Error('no output');
  expect(out.name).toBe('jpg-01-pixel2-retrato-gps.webp');
  expect(sniff(out.bytes), 'a WebP by its bytes').toBe('webp');
  const size = imageSize(out.bytes);
  const entry = oracle(PHOTO);
  expect([size.displayWidth, size.displayHeight], 'the display size of the photo').toEqual([entry.displayWidth, entry.displayHeight]);
  expectNoMetadata(out);
});
