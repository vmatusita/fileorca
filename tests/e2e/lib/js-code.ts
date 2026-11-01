// A small reader of JavaScript and TypeScript syntax for the hardening tests of the PDF tools (F5a, criterion 7;
// tests/unit/pdf-hardening.test.ts reads the sources and the published PDF.js, tests/e2e/pdf-hardening.spec.ts the
// built site). It uses the TypeScript parser, so a comment or a string that says "eval(" is not a call, and minified code
// reads like any other. It looks; it never runs what it reads.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

export function parseText(path: string, text: string): ts.SourceFile {
  const kind = path.endsWith('.tsx') ? ts.ScriptKind.TSX : /\.m?js$/.test(path) ? ts.ScriptKind.JS : ts.ScriptKind.TS;
  return ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, kind);
}

export const parse = (path: string): ts.SourceFile => parseText(path, readFileSync(path, 'utf8'));

export function visit(node: ts.Node, each: (node: ts.Node) => void): void {
  each(node);
  node.forEachChild((child) => visit(child, each));
}

export const line = (node: ts.Node): number => node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1;

/** The text without any white space, for comparing code that is laid out differently. */
export const squash = (text: string): string => text.replace(/\s+/g, '');

/** The name a call is made through: `eval` for eval(...) and for window.eval(...), `Function` for new Function(...) and the like. */
export function calleeName(expression: ts.Expression): string | null {
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text;
  if (ts.isElementAccessExpression(expression) && ts.isStringLiteralLike(expression.argumentExpression)) return expression.argumentExpression.text;
  return null;
}

export interface Found {
  line: number;
  text: string;
  node: ts.Node;
}

export interface DynamicCode {
  /** eval(...), window.eval(...), globalThis['eval'](...) */
  evals: Found[];
  /** new Function(...) and Function(...) */
  functions: Found[];
  /** setTimeout("code") and setInterval("code"): a string where a function belongs */
  timers: Found[];
  /** import(x) where x is not a string literal (the text is that of x) */
  computedImports: Found[];
}

export function dynamicCode(source: ts.SourceFile): DynamicCode {
  const found: DynamicCode = { evals: [], functions: [], timers: [], computedImports: [] };
  visit(source, (node) => {
    if (!ts.isCallExpression(node) && !ts.isNewExpression(node)) return;
    const hit = { line: line(node), text: node.getText(), node };
    const name = calleeName(node.expression);
    if (ts.isCallExpression(node) && name === 'eval') found.evals.push(hit);
    if (name === 'Function') found.functions.push(hit);
    const first = node.arguments?.[0];
    if (ts.isCallExpression(node) && (name === 'setTimeout' || name === 'setInterval') && first && (ts.isStringLiteralLike(first) || ts.isTemplateExpression(first))) found.timers.push(hit);
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && first && !ts.isStringLiteralLike(first)) found.computedImports.push({ ...hit, text: first.getText() });
  });
  return found;
}

/**
 * The operands of the `a || b || c` that a call ends, in order, as squashed text with every quote turned into '.
 * For core-js's search for the global object this is: the test of globalThis first, an IIFE and `Function('return this')()` last.
 */
export function orChainOf(call: ts.Node): string[] {
  let top: ts.Node = call.parent;
  while (ts.isBinaryExpression(top.parent) && top.parent.operatorToken.kind === ts.SyntaxKind.BarBarToken) top = top.parent;
  const operands = (expression: ts.Node): string[] =>
    ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.BarBarToken ? [...operands(expression.left), ...operands(expression.right)] : [squash(expression.getText()).replace(/[`"]/g, "'")];
  return operands(top);
}

/** The names (identifiers and property names) a source mentions anywhere in code. */
export function namesIn(source: ts.SourceFile): Set<string> {
  const names = new Set<string>();
  visit(source, (node) => {
    if (ts.isIdentifier(node)) names.add(node.text);
  });
  return names;
}

/** Every .ts and .tsx file under a folder (not the .d.ts), sorted. */
export const sources = (folder: string): string[] =>
  readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts'))
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();

/**
 * Every `name: value` that the object literals inside the first argument of the calls of `getDocument` carry, as source text, and
 * how many such calls the file has. Spread parts count: the objects inside them are read too.
 */
export function getDocumentOptions(source: ts.SourceFile): { options: Map<string, string>; calls: number } {
  const options = new Map<string, string>();
  let calls = 0;
  visit(source, (node) => {
    if (!ts.isCallExpression(node) || calleeName(node.expression) !== 'getDocument') return;
    calls += 1;
    const first = node.arguments[0];
    if (!first) return;
    visit(first, (inner) => {
      if (ts.isPropertyAssignment(inner) && (ts.isIdentifier(inner.name) || ts.isStringLiteralLike(inner.name))) options.set(inner.name.text, inner.initializer.getText());
      if (ts.isShorthandPropertyAssignment(inner)) options.set(inner.name.text, inner.name.text);
    });
  });
  return { options, calls };
}
