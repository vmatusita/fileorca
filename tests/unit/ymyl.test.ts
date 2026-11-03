import { describe, expect, it } from 'vitest';
import { BANNED, BANNED_HEALTH, OFFICIAL_SOURCES, checkYmylPage, countProblems, expectedYmylPages } from '../../scripts/lib/ymyl.ts';
import { ROUTES, languagesOf, ymylHubOf, type RouteId } from '../../src/i18n/routes.ts';
import {
  BR_CALC_IDS,
  BR_HUB_ID,
  CALC_PAGE_IDS,
  GUIDE_IDS,
  HEALTH_CALC_IDS,
  HEALTH_HUB_ID,
  HOUSE_CALC_IDS,
  HOUSE_HUB_ID,
  isBrCalc,
} from '../../src/tools/calc/registry.ts';

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

describe('as fontes de casa e de saúde (F7, decisão 7)', () => {
  const withSource = (href: string) => good.replace('https://www.consumerfinance.gov/owning-a-home/', href);

  it('takes Energy Star, energy.gov and NIST as the official sources of the home pages, and nothing that only looks like them', () => {
    expect(OFFICIAL_SOURCES.house).toEqual(['energystar.gov', 'energy.gov', 'nist.gov']);
    for (const href of ['https://www.energystar.gov/products/room_air_conditioners', 'https://www.energy.gov/energysaver/insulation', 'https://www.nist.gov/pml/owm/si-units-length']) {
      expect(checkYmylPage(withSource(href), 'house'), href).toEqual([]);
    }
    for (const href of ['https://www.cdc.gov/bmi/', 'https://www.consumerfinance.gov/', 'https://energystar.gov.evil.test/', 'https://www.homedepot.com/c/calculators', 'https://notnist.gov/']) {
      expect(checkYmylPage(withSource(href), 'house').join(), href).toMatch(/fonte oficial/);
    }
  });

  it('asks a health page for a health source, never a home one', () => {
    expect(checkYmylPage(withSource('https://www.nist.gov/pml/owm/si-units-mass'), 'health').join()).toMatch(/fonte oficial/);
    expect(checkYmylPage(withSource('https://www.cdc.gov/bmi/adult-calculator/'), 'health')).toEqual([]);
  });

  it('refuses on a health page a weight goal, a diet, a calorie deficit and the cycle as birth control, and lets the plain words through', () => {
    const health = withSource('https://www.cdc.gov/bmi/adult-calculator/');
    // Positive controls: each one is refused.
    const refused = [
      'Your ideal weight is 150 lb.',
      'You should lose some weight.',
      'Set a weight-loss goal for the month.',
      'Lose 10 pounds by summer.',
      'The healthy weight range for your height is 128 to 168 lb.',
      'Keep a calorie deficit of 500 kcal a day.',
      'Eat 1,800 calories a day to lose weight.',
      'Follow this meal plan.',
      'Track your macros.',
      'Use the fertile window as birth control.',
      'These are your safe days.',
    ];
    for (const text of refused) expect(checkYmylPage(health.replace('</main>', `<p>${text}</p></main>`), 'health').join(), text).toMatch(/proibido/);
    // Negative controls: the words of the health pages, with the CDC category names, pass.
    const allowed = [
      'In the CDC categories for adults, a BMI of 23.6 is in Healthy Weight, the range from 18.5 to 24.9.',
      'At rest the equation gives 1,376 kcal a day; times an activity level of 1.6, that is 2,202 kcal a day.',
      'It cannot tell you when you will or will not get pregnant: do not use it to prevent pregnancy.',
      'Talk with a doctor or a registered dietitian about your own needs.',
      'Weight in pounds and height in inches.',
    ];
    for (const text of allowed) expect(checkYmylPage(health.replace('</main>', `<p>${text}</p></main>`), 'health'), text).toEqual([]);
    // Each pattern refuses at least one sample, and the money pages keep their own list.
    for (const pattern of BANNED_HEALTH) expect(refused.some((text) => pattern.test(text)), String(pattern)).toBe(true);
    expect(checkYmylPage(good.replace('</main>', '<p>Track your macros.</p></main>'), 'money')).toEqual([]);
  });

  it('reads the hub of each page from the route map: money, home or health', () => {
    expect(ymylHubOf('mortgage-calculator')).toBe('money');
    expect(ymylHubOf(BR_HUB_ID)).toBe('money');
    expect(ymylHubOf(HOUSE_HUB_ID)).toBe('house');
    expect(ymylHubOf(HEALTH_HUB_ID)).toBe('health');
    for (const id of HOUSE_CALC_IDS) expect(ymylHubOf(id), id).toBe('house');
    for (const id of HEALTH_CALC_IDS) expect(ymylHubOf(id), id).toBe('health');
    for (const id of ['compress-image', 'merge-pdf', 'qr-code-generator', 'privacy'] as RouteId[]) expect(ymylHubOf(id), id).toBeNull();
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
    // F7 (decision 1): the two hubs and the 11 home and health calculators, in English only (DECISOES § 259).
    const life = 2 + HOUSE_CALC_IDS.length + HEALTH_CALC_IDS.length;
    expect(life).toBe(13);
    // The languages adjustment (decision 4): Spanish has the hub, the 18 calculator pages and the 5 money guides.
    expect(expectedYmylPages(routes)).toBe(english + 1 + CALC_PAGE_IDS.length + GUIDE_IDS.length + brazilian + life);
  });

  it('accepts a count equal to the routes, and refuses zero pages and any other count', () => {
    expect(countProblems(24, 24)).toEqual([]);
    expect(countProblems(0, 24).join()).toMatch(/nenhuma página/);
    expect(countProblems(0, 0).join()).toMatch(/nenhuma página/);
    expect(countProblems(23, 24).join()).toMatch(/23 página\(s\) conferida\(s\), mas o mapa de rotas tem 24/);
  });
});
