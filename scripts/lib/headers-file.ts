// Reads a Cloudflare _headers file back into its rules, for the gates that check what the build wrote
// (gate:cabecalhos) and which headers a page of fileorca.com gets (gate:prontidao).

/** pattern -> header lines ("Name: value"), in file order; comments and blank lines dropped. */
export function headerBlocks(text: string): Map<string, string[]> {
  return new Map(
    text.split(/\n\s*\n/).map((block) => {
      const [pattern = '', ...lines] = block.split('\n').filter((line) => line && !line.startsWith('#'));
      return [pattern.trim(), lines.map((line) => line.trim())] as const;
    }),
  );
}

/**
 * Whether a _headers pattern applies to a path of fileorca.com: `*` takes anything (slashes included) and
 * `:name` one segment, as Cloudflare reads them. An absolute pattern applies only on that host.
 */
export function patternApplies(pattern: string, path: string, origin: string): boolean {
  let local = pattern;
  if (/^https?:\/\//.test(pattern)) {
    if (!pattern.startsWith(`${origin}/`)) return false;
    local = pattern.slice(origin.length);
  }
  const source = local
    .split(/(\*|:[A-Za-z]\w*)/)
    .map((part) => (part === '*' ? '.*' : part.startsWith(':') ? '[^/]+' : part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')))
    .join('');
  return new RegExp(`^${source}$`).test(path);
}
