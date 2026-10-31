import { dirname, relative, resolve } from 'node:path';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import type { Rule } from 'eslint';

// src/engine/image/ becomes open source after the F5: nothing in it may import from outside the
// folder (PLANO "Estrutura do repositório"; ADR-001, item 4). Packages are fine; relative paths
// that leave the folder and absolute project paths are not. src/engine/pdf/ (the seed of the F5 PDF
// engine) follows the same rule.
const ENGINES = ['src/engine/image', 'src/engine/pdf'];

const selfContained: Rule.RuleModule = {
  meta: { type: 'problem', messages: { outside: '{{folder}}/ cannot import "{{source}}" from outside the folder.' }, schema: [{ type: 'string' }] },
  create(context) {
    const file = context.filename.split('\\').join('/');
    const folder = String(context.options[0]);
    const root = resolve(folder);
    const check = (node: Rule.Node, source: unknown) => {
      if (typeof source !== 'string') return;
      const isPath = source.startsWith('.') || source.startsWith('/') || source.startsWith('src/');
      if (!isPath) return;
      const target = source.startsWith('.') ? resolve(dirname(file), source) : resolve(source.replace(/^\//, ''));
      if (relative(root, target).startsWith('..')) context.report({ node, messageId: 'outside', data: { source, folder } });
    };
    return {
      ImportDeclaration: (node) => check(node as Rule.Node, node.source.value),
      ExportNamedDeclaration: (node) => node.source && check(node as Rule.Node, node.source.value),
      ExportAllDeclaration: (node) => check(node as Rule.Node, node.source.value),
      ImportExpression: (node) => node.source.type === 'Literal' && check(node as Rule.Node, node.source.value),
    };
  },
};

export default defineConfig(
  { ignores: ['dist/**', '.astro/**', 'node_modules/**', 'docs/**', 'fixtures/**', '.cache/**', 'playwright-report/**', 'test-results/**', '.lighthouseci/**', '.claude/**'] },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  ...ENGINES.map((folder) => ({
    files: [`${folder}/**/*.ts`],
    plugins: { fileorca: { rules: { 'engine-self-contained': selfContained } } },
    rules: { 'fileorca/engine-self-contained': ['error', folder] as ['error', string] },
  })),
);
