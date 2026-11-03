// Pinned external tools for the gates, downloaded once into .cache/ (outside git) and checked
// by SHA-256 before use. Same code on Windows and Linux (CLAUDE.md: no bash in package scripts).
// The CI caches .cache/ keyed on this file, so changing a version or hash refreshes it.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const CACHE = '.cache';

interface Asset {
  url: string;
  sha256: string;
  /** Path of the wanted file inside the extracted archive. */
  entry: string;
}

type Platform = 'win32-x64' | 'linux-x64';

interface Tool {
  name: string;
  version: string;
  assets: Partial<Record<Platform, Asset>>;
}

export const ACTIONLINT: Tool = {
  name: 'actionlint',
  version: '1.7.12',
  assets: {
    'linux-x64': {
      url: 'https://github.com/rhysd/actionlint/releases/download/v1.7.12/actionlint_1.7.12_linux_amd64.tar.gz',
      sha256: '8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8',
      entry: 'actionlint',
    },
    'win32-x64': {
      url: 'https://github.com/rhysd/actionlint/releases/download/v1.7.12/actionlint_1.7.12_windows_amd64.zip',
      sha256: '6e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9',
      entry: 'actionlint.exe',
    },
  },
};

/**
 * gitleaks (MIT) for the public-repository audit (`pnpm publico:auditar`): scans the whole
 * history of a mirror clone and the exported tree. Hashes from gitleaks_8.30.1_checksums.txt.
 */
export const GITLEAKS: Tool = {
  name: 'gitleaks',
  version: '8.30.1',
  assets: {
    'linux-x64': {
      url: 'https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_linux_x64.tar.gz',
      sha256: '551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb',
      entry: 'gitleaks',
    },
    'win32-x64': {
      url: 'https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_windows_x64.zip',
      sha256: 'd29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e',
      entry: 'gitleaks.exe',
    },
  },
};

/** shellcheck for actionlint, pinned so the local gate checks run: blocks like the CI does. */
export const SHELLCHECK: Tool = {
  name: 'shellcheck',
  version: '0.11.0',
  assets: {
    'linux-x64': {
      url: 'https://github.com/koalaman/shellcheck/releases/download/v0.11.0/shellcheck-v0.11.0.linux.x86_64.tar.gz',
      sha256: 'b7af85e41cc99489dcc21d66c6d5f3685138f06d34651e6d34b42ec6d54fe6f6',
      entry: 'shellcheck-v0.11.0/shellcheck',
    },
    'win32-x64': {
      url: 'https://github.com/koalaman/shellcheck/releases/download/v0.11.0/shellcheck-v0.11.0.zip',
      sha256: '8a4e35ab0b331c85d73567b12f2a444df187f483e5079ceffa6bda1faa2e740e',
      entry: 'shellcheck.exe',
    },
  },
};

/** Official LanguageTool distribution (LGPL-2.1, run locally; never distributed with the site). */
export const LANGUAGETOOL: Tool = {
  name: 'languagetool',
  version: '6.6',
  assets: {
    'linux-x64': {
      url: 'https://languagetool.org/download/LanguageTool-6.6.zip',
      sha256: '53600506b399bb5ffe1e4c8dec794fd378212f14aaf38ccef9b6f89314d11631',
      entry: 'LanguageTool-6.6/languagetool-server.jar',
    },
    'win32-x64': {
      url: 'https://languagetool.org/download/LanguageTool-6.6.zip',
      sha256: '53600506b399bb5ffe1e4c8dec794fd378212f14aaf38ccef9b6f89314d11631',
      entry: 'LanguageTool-6.6/languagetool-server.jar',
    },
  },
};

/** Eclipse Temurin JRE 21, only when no Java 17+ is installed (the CI runner has one). */
export const JRE: Tool = {
  name: 'jre',
  version: '21.0.13+9',
  assets: {
    'linux-x64': {
      url: 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.13%2B9/OpenJDK21U-jre_x64_linux_hotspot_21.0.13_9.tar.gz',
      sha256: 'a535a1df9c6284d9618872984e026ae0352d1f7e9e0605425c0e6114f47351dd',
      entry: 'jdk-21.0.13+9-jre/bin/java',
    },
    'win32-x64': {
      url: 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.13%2B9/OpenJDK21U-jre_x64_windows_hotspot_21.0.13_9.zip',
      sha256: '2332c0b4cff6bed722da3567c91d5e47568bcba863fa4945d0a8d6fc76158628',
      entry: 'jdk-21.0.13+9-jre/bin/java.exe',
    },
  },
};

export function platform(): Platform {
  const key = `${process.platform}-${process.arch}`;
  if (key !== 'win32-x64' && key !== 'linux-x64') throw new Error(`plataforma sem binário fixado: ${key}`);
  return key;
}

export function sha256File(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    createReadStream(path).on('data', (chunk) => hash.update(chunk)).on('error', reject).on('end', () => resolve(hash.digest('hex')));
  });
}

async function download(url: string, target: string): Promise<void> {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok || !response.body) throw new Error(`download falhou (${response.status}): ${url}`);
  writeFileSync(target, Buffer.from(await response.arrayBuffer()));
}

/** Windows ships bsdtar (reads zip and tar.gz); Linux uses tar for .tar.gz and unzip for .zip. */
function extract(archive: string, into: string): void {
  mkdirSync(into, { recursive: true });
  if (process.platform === 'win32') {
    const tar = join(process.env['SystemRoot'] ?? 'C:\\Windows', 'System32', 'tar.exe');
    execFileSync(tar, ['-xf', archive, '-C', into], { stdio: 'inherit' });
  } else if (archive.endsWith('.zip')) {
    execFileSync('unzip', ['-q', '-o', archive, '-d', into], { stdio: 'inherit' });
  } else {
    execFileSync('tar', ['-xzf', archive, '-C', into], { stdio: 'inherit' });
  }
}

/** Returns the path of the tool's entry file, downloading and verifying it on first use. */
export async function ensureTool(tool: Tool): Promise<string> {
  const asset = tool.assets[platform()];
  if (!asset) throw new Error(`${tool.name} sem binário para ${platform()}`);
  const dir = join(CACHE, `${tool.name}-${tool.version}`);
  const entry = join(dir, asset.entry);
  if (existsSync(entry)) return entry;
  const downloads = join(CACHE, 'downloads');
  mkdirSync(downloads, { recursive: true });
  const archive = join(downloads, decodeURIComponent(asset.url.split('/').pop() ?? tool.name));
  if (!existsSync(archive) || (await sha256File(archive)) !== asset.sha256) {
    console.log(`baixando ${tool.name} ${tool.version}: ${asset.url}`);
    await download(asset.url, `${archive}.part`);
    renameSync(`${archive}.part`, archive);
  }
  const actual = await sha256File(archive);
  if (actual !== asset.sha256) {
    rmSync(archive, { force: true });
    throw new Error(`SHA-256 de ${tool.name} não confere: esperado ${asset.sha256}, recebido ${actual}`);
  }
  const staging = `${dir}.tmp`;
  rmSync(staging, { recursive: true, force: true });
  extract(archive, staging);
  rmSync(dir, { recursive: true, force: true });
  renameSync(staging, dir);
  if (!existsSync(entry)) throw new Error(`${entry} não está no pacote (${readdirSync(dir).join(', ')})`);
  return entry;
}
