import { expect, type Page } from '@playwright/test';

// F15 (frente L; DECISOES § 659): what the tool says, one sentence per gesture. A MutationObserver on the tool root writes
// down every new non-empty text of a [role="status"] in it: the status region of the island (p.fo-sr) and the region of a
// line that a row left (the Undo of Merge PDF and of the image list), each with where it was said. A region emptied and
// set again with the same sentence counts twice (that is what a screen reader says twice).

export interface Said {
  /** "region": the status region of the island; "line": the region of the line of a row that left; "other": anything else. */
  where: 'region' | 'line' | 'other';
  text: string;
}

/** Starts writing down, from now on. Call again to start over with an empty log. */
export async function recordStatus(page: Page): Promise<void> {
  await page.evaluate(() => {
    const root = document.querySelector('#fo-tool-root');
    if (!root) throw new Error('no tool root');
    const state = window as unknown as { __said: { where: string; text: string }[]; __saidStop?: () => void };
    state.__saidStop?.();
    const log: { where: string; text: string }[] = [];
    state.__said = log;
    const last = new WeakMap<Element, string>();
    for (const region of root.querySelectorAll('[role="status"]')) last.set(region, (region.textContent ?? '').trim());
    const check = () => {
      for (const region of root.querySelectorAll('[role="status"]')) {
        const text = (region.textContent ?? '').trim();
        if (text === (last.get(region) ?? '')) continue;
        last.set(region, text);
        if (!text) continue;
        const where = region.matches('.fo-tool-island > p.fo-sr') ? 'region' : region.closest('.fo-filelist__undo, .fo-merge__undo') ? 'line' : 'other';
        log.push({ where, text });
      }
    };
    const observer = new MutationObserver(check);
    observer.observe(root, { childList: true, characterData: true, subtree: true });
    state.__saidStop = () => observer.disconnect();
  });
}

/** Everything said since recordStatus. */
export const saidSoFar = (page: Page): Promise<Said[]> => page.evaluate(() => ((window as unknown as { __said?: Said[] }).__said ?? []).slice());

/**
 * What was said since recordStatus, once `last` has been said and a beat has passed for a second, wrong sentence (a
 * region is set 50 ms after it is emptied; the bundle made again after a gesture must add nothing).
 */
export async function saidAfter(page: Page, last: string, beat = 300): Promise<Said[]> {
  await expect.poll(async () => (await saidSoFar(page)).some((said) => said.text === last), { message: `"${last}" said`, timeout: 15_000 }).toBe(true);
  await page.waitForTimeout(beat);
  return saidSoFar(page);
}
