import { describe, expect, it } from 'vitest';
import { BANNED, OFFICIAL_SOURCES, checkYmylPage, countProblems, expectedYmylPages } from '../../scripts/lib/ymyl.ts';
import { ROUTES, languagesOf } from '../../src/i18n/routes.ts';
import { BR_CALC_IDS, BR_HUB_ID, CALC_PAGE_IDS, ES_CALC_IDS, GUIDE_IDS, isBrCalc } from '../../src/tools/calc/registry.ts';

// The F1a has no money or health page yet: the checker is proven on sample pages.
const person = '<script type="application/ld+json">{"@graph":[{"@type":"Person","name":"Victor Yuki Matusita"}]}</script>';
const good = `<html><head>${person}</head><body><main>
  <section data-ymyl="formula"><p>M = P · r(1+r)^n / ((1+r)^n − 1)</p></section>
  <section data-ymyl="premises"><p>Fixed rate typed by you; monthly payments; no fees.</p></section>
  <section data-ymyl="example"><p>US$ 300,000 at 6.5% for 30 years: $1,896.20 a month.</p></section>
  <p data-ymyl="source">Source: <a href="https://www.consumerfinance.gov/owning-a-home/">CFPB</a></p>
  <p data-ymyl="reviewed">Reviewed on <time datetime="2026-11-10">November 10, 2026</time>: first version.</p>
  <p data-ymyl="disclaimer">Educational tool. Not financial advice.</p>
</main></body></html>`;

describe('checador de dinheiro e saúde', () => {
  it('accepts a complete money page', () => {
    expect(checkYmylPage(good, 'money')).toEqual([]);
  });

  it('requires each block', () => {
    for (const block of ['formula', 'premises', 'example', 'reviewed', 'disclaimer']) {
      const html = good.replace(`data-ymyl="${block}"`, 'data-x="y"');
      expect(checkYmylPage(html, 'money').join('\n'), block).toMatch(new RegExp(block));
    }
  });

  it('requires an official source of the right hub', () => {
    expect(checkYmylPage(good.replace('https://www.consumerfinance.gov/owning-a-home/', 'https://bank.example/'), 'money').join()).toMatch(/fonte oficial/);
    expect(checkYmylPage(good, 'health').join()).toMatch(/fonte oficial/);
    expect(checkYmylPage(good.replace('https://www.consumerfinance.gov/owning-a-home/', 'https://www.cdc.gov/bmi/'), 'health')).toEqual([]);
    expect(checkYmylPage(good.replace('https://www.consumerfinance.gov/owning-a-home/', 'https://consumerfinance.gov.evil.test/'), 'money').join()).toMatch(/fonte oficial/);
  });

  it('requires the author and a machine-readable review date', () => {
    expect(checkYmylPage(good.replace(person, ''), 'money').join()).toMatch(/autor/);
    expect(checkYmylPage(good.replace('<time datetime="2026-11-10">November 10, 2026</time>', 'November 10'), 'money').join()).toMatch(/datetime/);
  });

  it('refuses rates of the day, rate forecasts and recommendations', () => {
    for (const text of ["Today's mortgage rates are 6.1%.", 'Rates are expected to fall next year.', 'Veja a taxa do dia.', 'We recommend this bank.']) {
      expect(checkYmylPage(good.replace('</main>', `<p>${text}</p></main>`), 'money').join(), text).toMatch(/proibido/);
    }
  });

  it('refuses the Portuguese and Spanish forms too, and lets the plain words through (F6)', () => {
    // Positive controls: each of these is refused, in the forms docs/i18n/pt.md and es.md list under "Nunca".
    const refused = [
      'Confira as taxas de hoje.', 'Os juros de hoje estão em 1,2% ao mês.', 'A taxa de juros de hoje é 10,5% ao ano.', 'As taxas vão subir em 2027.',
      'As taxas de juros devem cair.', 'Os juros vão subir.', 'Recomendamos este banco.', 'Mira la tasa de hoy.', 'Las tasas de hoy bajaron.',
      'Las tasas subirán el próximo año.', 'Las tasas de interés van a bajar.', 'Recomendamos este prestamista.',
    ];
    for (const text of refused) expect(checkYmylPage(good.replace('</main>', `<p>${text}</p></main>`), 'money').join(), text).toMatch(/proibido/);
    // Negative controls: the words of the glossaries, with no day, forecast or recommendation, pass.
    const allowed = [
      'Juros ao mês: 1,2% (exemplo). Digite a taxa do seu contrato.', 'A taxa de juros do exemplo é 10,5% ao ano.', 'Os juros de cada mês são calculados sobre o saldo devedor.',
      'Se a taxa subir, a parcela muda: refaça a conta.', 'Tasa de interés: 6.5 % (ejemplo).', 'Las tasas cambian: usa la de tu oferta.', 'Hoy puedes calcular tu pago mensual.',
    ];
    for (const text of allowed) expect(checkYmylPage(good.replace('</main>', `<p>${text}</p></main>`), 'money'), text).toEqual([]);
    // Each new pattern has at least one sample that it alone refuses.
    for (const pattern of BANNED.slice(6)) expect(refused.some((text) => pattern.test(text)), String(pattern)).toBe(true);
  });

  it('takes planalto.gov.br as an official money source, the site of the Brazilian laws (F6), and nothing that only looks like it', () => {
    const withSource = (href: string) => good.replace('https://www.consumerfinance.gov/owning-a-home/', href);
    expect(OFFICIAL_SOURCES.money).toContain('planalto.gov.br');
    expect(checkYmylPage(withSource('https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14690.htm'), 'money')).toEqual([]);
    expect(checkYmylPage(withSource('https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20CMN&numero=4881'), 'money')).toEqual([]);
    for (const href of ['https://planalto.gov.br.evil.test/lei/', 'https://notplanalto.gov.br/lei/', 'https://www.planalto.com.br/lei/', 'https://jusbrasil.com.br/legislacao/lei-14690']) {
      expect(checkYmylPage(withSource(href), 'money').join(), href).toMatch(/fonte oficial/);
    }
  });
});

describe('contagem do portão de dinheiro e saúde (F4)', () => {
  it('counts every indexed money and health route in each of its languages', () => {
    expect(expectedYmylPages([{ adArea: 'dinheiro', indexable: true, languages: 1 }, { adArea: 'arquivos', indexable: true, languages: 3 }])).toBe(1);
    expect(expectedYmylPages([{ adArea: 'dinheiro', indexable: false, languages: 1 }, { adArea: 'casa-saude', indexable: true, languages: 3 }])).toBe(3);
    // The real route map: the money hub, the 18 calculators and the 5 guides in English (24, the F4 count), and since the
    // F6 the Spanish hub and the five Spanish calculators (decision 6) and the Brazilian pages, once their rows are in the
    // map (decision 5), each counted in its one language.
    const routes = ROUTES.map((route) => ({ ...(route.adArea ? { adArea: route.adArea } : {}), indexable: route.indexable, languages: languagesOf(route).length }));
    const english = 1 + CALC_PAGE_IDS.length + GUIDE_IDS.length;
    expect(english).toBe(24);
    const brazilian = ROUTES.filter((route) => route.id === BR_HUB_ID || isBrCalc(route.id)).length;
    expect([0, 1 + BR_CALC_IDS.length]).toContain(brazilian);
    expect(expectedYmylPages(routes)).toBe(english + 1 + ES_CALC_IDS.length + brazilian);
  });

  it('accepts a count equal to the routes, and refuses zero pages and any other count', () => {
    expect(countProblems(24, 24)).toEqual([]);
    expect(countProblems(0, 24).join()).toMatch(/nenhuma página/);
    expect(countProblems(0, 0).join()).toMatch(/nenhuma página/);
    expect(countProblems(23, 24).join()).toMatch(/23 página\(s\) conferida\(s\), mas o mapa de rotas tem 24/);
  });
});
