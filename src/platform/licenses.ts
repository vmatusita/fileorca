// Licenses of what reaches the browser (DECISOES § 13). Build-time only (reads node_modules).
// /licenses lists `dependencies` plus fonts; the license gate checks both dependency lists.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Licenses allowed by CLAUDE.md. LGPL-3.0 only as a separate file (checked by the gate). */
export const ALLOWED_LICENSES = [
  'MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', '0BSD', 'MPL-2.0', 'OFL-1.1',
] as const;
export const SEPARATE_FILE_ONLY = ['LGPL-3.0', 'LGPL-3.0-only', 'LGPL-3.0-or-later'] as const;

export interface PackageLicense {
  name: string;
  version: string;
  license: string;
  repository: string | null;
  text: string | null;
  font: boolean;
}

interface Manifest {
  name: string;
  version: string;
  license?: string | { type: string };
  repository?: string | { url: string };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function readJson(path: string): Manifest {
  return JSON.parse(readFileSync(path, 'utf8')) as Manifest;
}

function repositoryUrl(repository: Manifest['repository']): string | null {
  const raw = typeof repository === 'string' ? repository : repository?.url;
  if (!raw) return null;
  const cleaned = raw.replace(/^git\+/, '').replace(/\.git$/, '').replace(/^git:\/\//, 'https://');
  if (/^[\w-]+\/[\w.-]+$/.test(cleaned)) return `https://github.com/${cleaned}`;
  return cleaned.startsWith('https://') ? cleaned : null;
}

function licenseText(dir: string): string | null {
  const file = readdirSync(dir).find((entry) => /^(licen[cs]e|copying)(\.(md|txt))?$/i.test(entry));
  return file ? readFileSync(join(dir, file), 'utf8').trim() : null;
}

export function readPackage(name: string, root = process.cwd()): PackageLicense {
  const dir = join(root, 'node_modules', name);
  const manifest = readJson(join(dir, 'package.json'));
  const license = typeof manifest.license === 'string' ? manifest.license : manifest.license?.type ?? 'UNKNOWN';
  return {
    name,
    version: manifest.version,
    license,
    repository: repositoryUrl(manifest.repository),
    text: existsSync(dir) ? licenseText(dir) : null,
    font: name.startsWith('@fontsource'),
  };
}

export function projectManifest(root = process.cwd()): Manifest {
  return readJson(join(root, 'package.json'));
}

/** Packages that reach the browser: the `dependencies` of package.json. */
export function browserPackages(root = process.cwd()): PackageLicense[] {
  return Object.keys(projectManifest(root).dependencies ?? {}).sort().map((name) => readPackage(name, root));
}

export function buildPackages(root = process.cwd()): PackageLicense[] {
  return Object.keys(projectManifest(root).devDependencies ?? {}).sort().map((name) => readPackage(name, root));
}

/** An SPDX expression is allowed when every alternative of an OR, or every term of an AND, is allowed. */
export function isAllowedLicense(expression: string): boolean {
  const clean = expression.replace(/[()]/g, ' ').trim();
  if (/\sOR\s/.test(clean)) return clean.split(/\s+OR\s+/).some((part) => isAllowedLicense(part));
  if (/\sAND\s/.test(clean)) return clean.split(/\s+AND\s+/).every((part) => isAllowedLicense(part));
  return (ALLOWED_LICENSES as readonly string[]).includes(clean);
}

/** Never allowed anywhere in the installed tree, not even in build tools (CLAUDE.md). */
export function isForbiddenLicense(expression: string): boolean {
  return /\b(AGPL|SSPL|BUSL|Elastic|Commons[- ]Clause|CC-BY-NC|NonCommercial|PolyForm-Noncommercial)\b/i.test(expression)
    || /(^|[^L])GPL/.test(expression);
}
