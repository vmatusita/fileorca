// Pure validators used by the SEO gate (tested in tests/unit/seo-checks.test.ts).

export interface PageHead {
  url: string;
  alternates: { hreflang: string; href: string }[];
}

/**
 * hreflang rules: every indexable page lists itself; every link points to a page in the set that
 * links back with the same cluster; one link per language; x-default present and equal to the
 * English URL of the cluster; only known language tags.
 */
export function validateHreflang(pages: PageHead[], options: { xDefaultLang: string; langTags: string[] }): string[] {
  const problems: string[] = [];
  const byUrl = new Map(pages.map((page) => [page.url, page]));
  for (const page of pages) {
    // A page in a single language carries no hreflang; nothing to check.
    if (page.alternates.length === 0) continue;
    const tags = page.alternates.map((alt) => alt.hreflang);
    const duplicate = tags.find((tag, index) => tags.indexOf(tag) !== index);
    if (duplicate) problems.push(`${page.url}: hreflang ${duplicate} repetido`);
    if (!page.alternates.some((alt) => alt.href === page.url && alt.hreflang !== 'x-default')) {
      problems.push(`${page.url}: hreflang não é autorreferente`);
    }
    const xDefault = page.alternates.filter((alt) => alt.hreflang === 'x-default');
    const english = page.alternates.find((alt) => alt.hreflang === options.xDefaultLang);
    // x-default points to the English page; a cluster without English has none.
    if (english && xDefault.length !== 1) problems.push(`${page.url}: ${xDefault.length} x-default`);
    else if (!english && xDefault.length > 0) problems.push(`${page.url}: x-default sem página em inglês`);
    else if (english && xDefault[0]?.href !== english.href) problems.push(`${page.url}: x-default não aponta o inglês`);
    for (const alt of page.alternates) {
      if (alt.hreflang !== 'x-default' && !options.langTags.includes(alt.hreflang)) problems.push(`${page.url}: hreflang desconhecido ${alt.hreflang}`);
      const target = byUrl.get(alt.href);
      if (!target) {
        problems.push(`${page.url}: hreflang ${alt.hreflang} aponta ${alt.href}, que não é página indexável`);
        continue;
      }
      if (alt.hreflang !== 'x-default' && !target.alternates.some((back) => back.href === page.url)) {
        problems.push(`${page.url}: ${alt.href} não volta (hreflang sem retorno)`);
      }
    }
    const cluster = new Set(page.alternates.map((alt) => `${alt.hreflang} ${alt.href}`));
    for (const alt of page.alternates) {
      const target = byUrl.get(alt.href);
      if (!target) continue;
      const other = new Set(target.alternates.map((back) => `${back.hreflang} ${back.href}`));
      if (cluster.size !== other.size || [...cluster].some((item) => !other.has(item))) {
        problems.push(`${page.url}: conjunto de hreflang diferente do de ${alt.href}`);
        break;
      }
    }
  }
  return problems;
}

/** The hreflang links found in a page against the ones its route requires. */
export function compareAlternates(found: PageHead['alternates'], expected: PageHead['alternates']): string[] {
  const key = (alt: { hreflang: string; href: string }) => `${alt.hreflang} ${alt.href}`;
  const have = new Set(found.map(key));
  const want = new Set(expected.map(key));
  const missing = [...want].filter((item) => !have.has(item));
  const extra = [...have].filter((item) => !want.has(item));
  return [
    ...(missing.length ? [`hreflang ausente: ${missing.join(', ')}`] : []),
    ...(extra.length ? [`hreflang a mais: ${extra.join(', ')}`] : []),
  ];
}

/**
 * robots.txt that blocks no crawler (Googlebot, Mediapartners-Google and the AI crawlers included: no
 * Disallow with a path in any group) and points to the sitemap index (PLANO "Busca com IA").
 */
export function robotsProblems(robots: string, origin: string): string[] {
  const problems: string[] = [];
  if (!/^User-agent: \*$/m.test(robots) || !/^Allow: \/$/m.test(robots) || /^\s*Disallow:\s*\S/im.test(robots)) problems.push('robots.txt não libera tudo');
  if (!robots.includes(`Sitemap: ${origin}/sitemap-index.xml`)) problems.push('robots.txt não aponta o índice de sitemaps');
  return problems;
}

/** A urlset sitemap with the expected absolute URLs, no duplicates, under 50,000 entries. */
export function validateSitemap(xml: string, expected: string[], origin: string): string[] {
  const problems: string[] = [];
  if (!xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) problems.push('sem declaração XML UTF-8');
  if (!xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) problems.push('sem urlset com o namespace');
  if (!xml.trimEnd().endsWith('</urlset>')) problems.push('urlset não fecha');
  const urls = [...xml.matchAll(/<url><loc>([^<]+)<\/loc><\/url>/g)].map((match) => match[1] ?? '');
  const opened = (xml.match(/<url>/g) ?? []).length;
  if (opened !== urls.length) problems.push('entrada <url> sem <loc> simples');
  if (urls.length > 50_000) problems.push('mais de 50.000 URLs');
  if (new Set(urls).size !== urls.length) problems.push('URL repetida');
  for (const url of urls) {
    if (!url.startsWith(`${origin}/`)) problems.push(`URL fora do domínio: ${url}`);
    if (/[&<>"']/.test(url)) problems.push(`URL sem escape: ${url}`);
  }
  const missing = expected.filter((url) => !urls.includes(url));
  const extra = urls.filter((url) => !expected.includes(url));
  if (missing.length) problems.push(`faltam ${missing.join(', ')}`);
  if (extra.length) problems.push(`sobram ${extra.join(', ')}`);
  return problems;
}
