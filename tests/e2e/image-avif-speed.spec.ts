import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { imageSize, sniff } from './lib/images.ts';
import { expectNoMetadata, filesOf, openTool, oracle, takeDownload } from './lib/matrix.ts';

// F17 (decision 10; DECISOES § 712): the measure of the AVIF encoder on a 12 MP photo, the one the F2 took out of the
// matrix for time (§ 85 and § 88). Convert to WebP gets the 12 MP photo with AVIF chosen, once per browser, and the line
// "[avif 12 MP] <browser> <seconds>" is printed, from the gesture (the file goes in) to the Download on screen. The time
// is a measure, not a criterion (as money-speed.spec.ts on WebKit), and the test stays in the CI so every full run logs
// the number of its runner. What it asserts is only the output: an AVIF of the display size of the oracle, with no Exif,
// XMP, IPTC or GPS (the photo has GPS). The matrix gives the AVIF to the small fixtures only (image-matrix.spec.ts).

const PHOTO = 'jpg-01-pixel2-retrato-gps.jpg'; // 3024 × 4032, 12 MP, 4.3 MB, with GPS

test('[avif 12 MP] Convert to WebP writes the 12 MP photo as an AVIF of its size, with no metadata', async ({ page, browserName }) => {
  await openTool(page, '/convert-to-webp/');
  await page.locator('.fo-seg__opt', { hasText: 'AVIF' }).click();
  await expect(page.locator('input[name="cw-format"][value="avif"]')).toBeChecked();

  const started = Date.now();
  await page.setInputFiles('input[type="file"]', resolve('fixtures/images', PHOTO));
  await expect(page.locator('.fo-btn--download')).toBeVisible({ timeout: 55_000 });
  const seconds = (Date.now() - started) / 1000;
  console.log(`[avif 12 MP] ${browserName} ${seconds.toFixed(1)}`);
  test.info().annotations.push({ type: 'avif 12 MP', description: `${browserName} ${seconds.toFixed(1)} s` });

  const [out, ...more] = filesOf(await takeDownload(page));
  expect(more, 'one file out').toEqual([]);
  if (!out) throw new Error('no output');
  expect(out.name).toBe('jpg-01-pixel2-retrato-gps.avif');
  expect(sniff(out.bytes), 'an AVIF by its bytes').toBe('avif');
  const size = imageSize(out.bytes);
  const entry = oracle(PHOTO);
  expect([size.displayWidth, size.displayHeight], 'the display size of the photo').toEqual([entry.displayWidth, entry.displayHeight]);
  expectNoMetadata(out);
});
