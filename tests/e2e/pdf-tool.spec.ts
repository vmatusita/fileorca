import { expect, test } from '@playwright/test';
import { choosePdfs, filesOf, openTool, pdfFile, takePdfDownload } from './lib/pdf-tools.ts';
import { readWithPdfjs } from './lib/pdfjs-read.ts';

// The PDF island in use (F5a): the flows the matrix does not cover, one page load each.

test('Merge PDF: two files in the order of the list, the order changed with the buttons', async ({ page }) => {
  await openTool(page, '/merge-pdf/');
  await choosePdfs(page, [pdfFile('gen-paginas-mistas.pdf'), pdfFile('gen-ja-otimizado.pdf')]);
  const action = page.getByRole('button', { name: 'Merge PDFs' });
  await expect(action).toBeVisible({ timeout: 30_000 });
  // The second file moves up: the merged file starts with its pages.
  await page.getByRole('button', { name: 'Move gen-ja-otimizado.pdf up' }).click();
  await action.click();
  const out = filesOf(await takePdfDownload(page));
  expect(out).toHaveLength(1);
  expect(out[0]?.name).toBe('gen-ja-otimizado-merged.pdf');
  const read = await readWithPdfjs(out[0]?.bytes as Uint8Array);
  expect(read.pages.map((p) => p.marker)).toEqual([...Array.from({ length: 12 }, (_, i) => `Page ${i + 1}`), ...Array.from({ length: 8 }, (_, i) => `Page ${i + 1}`)]);
});
