// The browser half of the measurements: the site's dist/ served the way Cloudflare serves it (scripts/serve-dist.ts),
// opened in Chromium and in WebKit by Playwright, with the tool pages used as a person uses them: the options are
// clicked, the files go into the file picker, the result shows and the Download button hands the file over. The
// bytes are what the person gets, written by the browser's own canvas where the site uses it.
import { spawn, type ChildProcess } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { release } from 'node:os';
import { chromium, expect, webkit, type Browser, type BrowserContext, type Page } from '@playwright/test';
import type { Method } from '../../../src/tools/guides/measured-types.ts';
import { readZip } from '../../../tests/e2e/lib/zip.ts';
import type { TestFile } from '../../../tests/e2e/lib/page.ts';

export type BrowserName = 'chromium' | 'webkit';
export const BROWSERS: readonly BrowserName[] = ['chromium', 'webkit'];

const PORT = Number(process.env['FO_PORT'] ?? 4173);
export const ORIGIN = `http://127.0.0.1:${PORT}`;
/** A batch of three 12 MP photos in the WebKit of Windows (no OffscreenCanvas in the worker: the page does the work). */
const RESULT_TIMEOUT = 300_000;
/** Google's domains are never reached from a measurement (docs/claude/anuncios.md, F3). */
const GOOGLE = /google|googletagmanager|google-analytics|doubleclick|gstatic|googlesyndication/;

export function osName(): string {
  if (process.platform === 'win32') return `Windows ${release()}`;
  if (process.platform === 'darwin') return `macOS ${release()}`;
  return `Linux ${release()}`;
}

async function up(): Promise<boolean> {
  try {
    return (await fetch(`${ORIGIN}/`)).ok;
  } catch {
    return false;
  }
}

/** Serves dist/ on the port unless something already does; the function returned stops what this started. */
export async function serve(): Promise<() => void> {
  if (await up()) return () => {};
  const server: ChildProcess = spawn(process.execPath, ['scripts/serve-dist.ts'], { stdio: 'ignore', env: { ...process.env, PORT: String(PORT) } });
  for (let i = 0; i < 100 && !(await up()); i++) await new Promise((resolve) => setTimeout(resolve, 100));
  if (!(await up())) throw new Error(`dist/ is not served on ${ORIGIN}`);
  return () => server.kill();
}

export interface Session {
  name: BrowserName;
  version: string;
  browser: Browser;
}

export async function openSession(name: BrowserName): Promise<Session> {
  const browser = await (name === 'chromium' ? chromium : webkit).launch();
  return { name, version: browser.version(), browser };
}

export function method(session: Session, path: string): Method {
  return { runner: 'playwright', browser: session.name, version: session.version, os: osName(), path };
}

export interface Tab {
  context: BrowserContext;
  page: Page;
  close(): Promise<void>;
}

/** A fresh context on a tool page: cookies declined beforehand (no notice over the page), Google blocked, the island hydrated. */
export async function openTool(session: Session, path: string): Promise<Tab> {
  const context = await session.browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  await context.route(GOOGLE, (route) => route.abort());
  await context.addInitScript(() => localStorage.setItem('fo-consent', 'denied'));
  const page = await context.newPage();
  const response = await page.goto(`${ORIGIN}${path}`);
  if (response?.status() !== 200) throw new Error(`${path}: status ${response?.status()}`);
  await page.waitForSelector('#fo-tool-root[data-hydrated="true"]', { state: 'attached' });
  return { context, page, close: () => context.close() };
}

/** Clicks a segmented option by its visible label (the radio itself is hidden). */
export async function option(page: Page, label: string): Promise<void> {
  await page.locator('.fo-seg__opt').filter({ hasText: label }).first().click();
}

/** Types a number into a field and leaves it, which commits it. */
export async function typeField(page: Page, selector: string, value: string): Promise<void> {
  const field = page.locator(selector);
  await field.fill(value);
  await field.press('Tab');
}

export function fileOf(path: string, name = path.split('/').pop() ?? path): TestFile {
  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  const mimeType = ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', pdf: 'application/pdf' } as Record<string, string>)[extension] ?? 'application/octet-stream';
  return { name, mimeType, buffer: readFileSync(path) };
}

export const bytesFile = (name: string, bytes: Uint8Array, mimeType: string): TestFile => ({ name, mimeType, buffer: Buffer.from(bytes) });

export async function drop(page: Page, files: TestFile[]): Promise<void> {
  await page.setInputFiles('#fo-tool-root input[type="file"]', files);
}

export interface Out {
  name: string;
  bytes: Uint8Array;
}

/** Waits for the result and its Download button, clicks it and reads the saved file: the ZIP's entries, or the file. */
export async function download(page: Page): Promise<{ delivered: Out; files: Out[] }> {
  const button = page.locator('#fo-tool-root .fo-btn--download').first();
  await expect(button).toBeVisible({ timeout: RESULT_TIMEOUT });
  const [saved] = await Promise.all([page.waitForEvent('download', { timeout: RESULT_TIMEOUT }), button.click()]);
  const path = await saved.path();
  if (!path) throw new Error('the download has no file');
  const delivered = { name: saved.suggestedFilename(), bytes: new Uint8Array(readFileSync(path)) };
  const files = delivered.name.endsWith('.zip') ? readZip(delivered.bytes).map((entry) => ({ name: entry.name, bytes: entry.bytes })) : [delivered];
  return { delivered, files };
}

/** The result of an image tool: the card is on screen once the whole batch is done. */
export async function imageResult(page: Page): Promise<{ files: Out[]; notes: string }> {
  await expect(page.locator('.fo-result')).toBeVisible({ timeout: RESULT_TIMEOUT });
  const notes = (await page.locator('.fo-result__notes li').allTextContents()).join(' | ');
  const { files } = await download(page);
  return { files, notes };
}

/** The base name of a file without its extension: the outputs keep it. */
export const stem = (name: string): string => name.replace(/\.[^.]+$/, '');
