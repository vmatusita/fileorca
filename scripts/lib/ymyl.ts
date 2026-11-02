// Content check for money and health pages (PLANO "Confiança em dinheiro e saúde"). Every page of
// those hubs must carry, in the HTML: the formula, the premises and a worked example; a link to an
// official source; the author (Person schema) and "Revisado em" with what changed; the short
// educational disclaimer. Pages mark each block with data-ymyl="…" so the check does not depend
// on wording. Rates of the day, rate forecasts and product recommendations are refused.
import { parse } from 'node-html-parser';

export type YmylHub = 'money' | 'health';

export const REQUIRED_BLOCKS = ['formula', 'premises', 'example', 'reviewed', 'disclaimer'] as const;

/**
 * F6 (decision 5): planalto.gov.br, where the Brazilian laws and decrees are published (Lei 14.690/2023, Decreto
 * 6.306/2007), is an official source of the money pages, next to the Banco Central (bcb.gov.br).
 */
export const OFFICIAL_SOURCES: Record<YmylHub, string[]> = {
  money: ['consumerfinance.gov', 'federalreserve.gov', 'bcb.gov.br', 'planalto.gov.br'],
  health: ['cdc.gov', 'who.int', 'nih.gov', 'gov.br'],
};

export const BANNED = [
  /today'?s (?:mortgage |interest )?rates?/i,
  /taxa (?:de juros )?(?:de|do) hoje/i,
  /taxa do dia/i,
  /tasas? (?:de inter[eé]s )?(?:de|del) hoy/i,
  /we recommend (?:this|the) (?:bank|lender|card|loan)/i,
  /rates? (?:will|are expected to) (?:rise|fall|drop|go)/i,
  // F6: the Portuguese and Spanish forms the lines above miss (docs/i18n/pt.md and es.md, "Nunca"): the plural "taxas de
  // hoje", "os juros de hoje" and "las tasas de hoy" with an article, a forecast of the rates and a recommendation.
  /\btaxas (?:de juros )?(?:de|do) hoje\b/i,
  /\bjuros (?:de|do) hoje\b/i,
  /\b(?:as )?taxas(?: de juros)? (?:v[aã]o|devem|tendem a|v[aã]o voltar a) (?:subir|cair|baixar)\b/i,
  /\b(?:os )?juros (?:v[aã]o|devem|tendem a) (?:subir|cair|baixar)\b/i,
  /\b(?:las )?tasas(?: de inter[eé]s)? (?:subir[aá]n|bajar[aá]n|van a (?:subir|bajar)|deber[ií]an (?:subir|bajar))\b/i,
  /\brecomendamos (?:este|esse|o|a|el|la) (?:banco|financeira|cart[aã]o|empr[eé]stimo|financiamento|prestamista|tarjeta|pr[eé]stamo)\b/i,
];

export function checkYmylPage(html: string, hub: YmylHub): string[] {
  const problems: string[] = [];
  const root = parse(html);
  for (const block of REQUIRED_BLOCKS) {
    const node = root.querySelector(`[data-ymyl="${block}"]`);
    if (!node || node.text.trim().length < 10) problems.push(`sem o bloco ${block}`);
  }
  const reviewed = root.querySelector('[data-ymyl="reviewed"] time[datetime]');
  if (!reviewed || !/^\d{4}-\d{2}-\d{2}$/.test(reviewed.getAttribute('datetime') ?? '')) problems.push('"Revisado em" sem <time datetime="AAAA-MM-DD">');
  const links = root.querySelectorAll('[data-ymyl="source"] a[href], a[data-ymyl="source"][href]').map((a) => a.getAttribute('href') ?? '');
  const official = links.some((href) => {
    try {
      const host = new URL(href).hostname;
      return OFFICIAL_SOURCES[hub].some((domain) => host === domain || host.endsWith(`.${domain}`));
    } catch {
      return false;
    }
  });
  if (!official) problems.push('sem link para fonte oficial');
  const author = root.querySelectorAll('script[type="application/ld+json"]').some((script) => {
    const text = script.text;
    return text.includes('"Person"') && text.includes('Victor Yuki Matusita');
  });
  if (!author) problems.push('sem autor (schema Person Victor Yuki Matusita)');
  const text = root.querySelector('main')?.text ?? root.text;
  for (const pattern of BANNED) if (pattern.test(text)) problems.push(`texto proibido: ${pattern}`);
  return problems;
}

/** A route as the count needs it: its ad area and whether it is indexed. */
export interface YmylRoute {
  adArea?: string;
  indexable: boolean;
  /** Number of languages the route exists in. */
  languages: number;
}

/** The money and health pages the gate must check: every indexed route of those areas, in every language (F4). */
export function expectedYmylPages(routes: readonly YmylRoute[]): number {
  return routes.filter((route) => route.indexable && (route.adArea === 'dinheiro' || route.adArea === 'casa-saude')).reduce((sum, route) => sum + route.languages, 0);
}

/**
 * The count check: zero pages fails (a gate that checks nothing proves nothing, F4 decision 9), and so does a
 * count different from the money and health routes of the route map.
 */
export function countProblems(checked: number, expected: number): string[] {
  if (checked === 0) return ['nenhuma página de dinheiro ou saúde foi conferida'];
  if (checked !== expected) return [`${checked} página(s) conferida(s), mas o mapa de rotas tem ${expected}`];
  return [];
}
