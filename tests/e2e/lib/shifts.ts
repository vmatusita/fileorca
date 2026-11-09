// F15, frente Q (DECISOES § 662): the layout shifts a page makes without a gesture, from a moment the test chooses. The same
// PerformanceObserver as the watchShifts of tool-slot.spec.ts (which stays there as it was), shared so the blocks of other
// specs can use it: entries with hadRecentInput (the 500 ms after a click, a tap or a key) do not count, everything else
// from the mark on does, with the nodes that moved. Chromium only: the WebKit has no layout-shift entries, and a test there
// proves the same by the boxes that keep their place.
import type { BrowserContext, Page } from '@playwright/test';

export interface ShiftLog {
  cls: number;
  moved: string[];
}

/** Installs the observer in every page of the context, before the page's own scripts. */
export async function recordShifts(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    const log = { cls: 0, moved: [] as string[], from: Infinity };
    (window as unknown as { __foShifts: typeof log }).__foShifts = log;
    if (!PerformanceObserver.supportedEntryTypes.includes('layout-shift')) return;
    type Shift = PerformanceEntry & { value: number; hadRecentInput: boolean; sources: { node: Node | null; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }[] };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Shift[]) {
        if (entry.hadRecentInput || entry.startTime < log.from) continue;
        log.cls += entry.value;
        for (const { node, previousRect, currentRect } of entry.sources) {
          const name = node instanceof Element ? `<${node.tagName.toLowerCase()} class="${node.className}">` : `"${(node?.textContent ?? '').trim().slice(0, 24)}"`;
          log.moved.push(`${entry.value.toFixed(3)} ${name} y ${Math.round(previousRect.y)}→${Math.round(currentRect.y)}`);
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
}

/** Counts from now on (what came before, the load or a gesture already made, stays out). */
export async function shiftsFromNow(page: Page): Promise<void> {
  await page.evaluate(() => {
    const log = (window as unknown as { __foShifts: { cls: number; moved: string[]; from: number } }).__foShifts;
    log.from = performance.now();
    log.cls = 0;
    log.moved = [];
  });
}

/** What moved since the mark. */
export function shiftsSoFar(page: Page): Promise<ShiftLog> {
  return page.evaluate(() => {
    const { cls, moved } = (window as unknown as { __foShifts: ShiftLog }).__foShifts;
    return { cls, moved: [...moved] };
  });
}

/** Whether this browser reports layout shifts at all (Chromium yes, WebKit no). */
export function shiftsSupported(page: Page): Promise<boolean> {
  return page.evaluate(() => PerformanceObserver.supportedEntryTypes.includes('layout-shift'));
}
