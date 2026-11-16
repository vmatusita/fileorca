// F19b (DECISOES § 796): the steps a person takes in the tools of the new file guides between choosing the file and the
// button, shared by tool-guides.spec.ts and guide-page.spec.ts: Sign PDF needs a signature (a typed name, as the PDF
// matrix signs: tests/e2e/pdf-matrix.spec.ts, signEveryPage), Protect PDF the password typed twice. The labels are the
// tool's own texts in the language of the page; the name and the password are sentinels that no request may carry.
import { expect, type Page } from '@playwright/test';
import type { Lang } from '../../../src/i18n/routes.ts';
import signEn from '../../../src/tools/sign-pdf/i18n/en.ts';
import signPt from '../../../src/tools/sign-pdf/i18n/pt.ts';
import signEs from '../../../src/tools/sign-pdf/i18n/es.ts';
import protectEn from '../../../src/tools/protect-pdf/i18n/en.ts';
import protectPt from '../../../src/tools/protect-pdf/i18n/pt.ts';
import protectEs from '../../../src/tools/protect-pdf/i18n/es.ts';

const SIGN_TEXTS = { en: signEn, pt: signPt, es: signEs } as const;
const PROTECT_TEXTS = { en: protectEn, pt: protectPt, es: protectEs } as const;

/** The name typed as the signature. */
export const SIGNER = 'Orca Guide Signer';
/** The password typed twice. */
export const PASSWORD = 'Orca-Guide-Sentinel-4826-Qx';

/** The name of the signed copy of a PDF in a language: the suffix of the tool's texts ("signed", "assinado", "firmado"). */
export const signedName = (stem: string, lang: Lang): string => `${stem}-${SIGN_TEXTS[lang].panel.suffix}.pdf`;
/** The name of the protected copy ("protected", "protegido"). */
export const protectedName = (stem: string, lang: Lang): string => `${stem}-${PROTECT_TEXTS[lang].panel.suffix}.pdf`;

/** Clicks the label of a segmented option of the embedded panel (the radio itself is hidden). */
const segment = (page: Page, label: string) => page.locator('#fo-tool-root .fo-seg__opt').filter({ hasText: label }).first().click();

/** The run button of a PDF tool, which these two tools have: the panel is ready when it shows (the file is read). */
function actionOf(texts: { action?: string }): string {
  if (!texts.action) throw new Error('this tool has no run button');
  return texts.action;
}

/** Sign PDF, once its file is read: the Type mode, the name, and the box of the signature on the preview of the page. */
export async function signWithTypedName(page: Page, lang: Lang): Promise<void> {
  const texts = SIGN_TEXTS[lang].panel;
  const root = page.locator('#fo-tool-root');
  await expect(root.getByRole('button', { name: actionOf(texts) })).toBeVisible({ timeout: 30_000 });
  await segment(page, texts.options.type);
  const name = root.getByLabel(texts.options.typeLabel, { exact: true });
  await name.fill(SIGNER);
  await name.blur();
  await expect(root.locator('.fo-sign__box')).toBeVisible({ timeout: 30_000 });
}

/** Protect PDF, once its file is read: the same password in the two fields. */
export async function typePasswordTwice(page: Page, lang: Lang): Promise<void> {
  const texts = PROTECT_TEXTS[lang].panel;
  const root = page.locator('#fo-tool-root');
  await expect(root.getByRole('button', { name: actionOf(texts) })).toBeVisible({ timeout: 30_000 });
  await root.getByLabel(texts.options.passwordLabel, { exact: true }).fill(PASSWORD);
  await root.getByLabel(texts.options.confirmLabel, { exact: true }).fill(PASSWORD);
}
