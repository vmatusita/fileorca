import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

// axe-core with WCAG 2.2 AA and the best practices, run the same way in every spec (DECISOES § 83). Legacy mode
// runs axe.run in the page itself: the default mode opens a blank page in the context for every analysis to merge
// the results of each frame, which the site does not need (no page has an iframe in the tests: the ads stay off).
// resultTypes keeps the full rule set and the full list of violations; it only stops axe from collecting the
// nodes of the rules that pass. Together they make each analysis about three times faster, with the same rules.
export const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

export interface AxeViolation {
  id: string;
  targets: string[];
}

export async function axe(page: Page): Promise<AxeViolation[]> {
  const results = await new AxeBuilder({ page }).withTags(TAGS).setLegacyMode(true).options({ resultTypes: ['violations'] }).analyze();
  return results.violations.map((violation) => ({ id: violation.id, targets: violation.nodes.map((node) => node.target.join(' ')) }));
}

/** Violation ids only, for the tests that compare the list with []. */
export async function violationIds(page: Page): Promise<string[]> {
  return (await axe(page)).map((violation) => violation.id);
}

/** One line per violation, with where it was found: "360px dark · color-contrast: .fo-x". */
export async function describedViolations(page: Page, where: string): Promise<string[]> {
  return (await axe(page)).map((violation) => `${where} · ${violation.id}: ${violation.targets.join(', ')}`);
}
