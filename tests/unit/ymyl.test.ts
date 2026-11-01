import { describe, expect, it } from 'vitest';
import { checkYmylPage, countProblems, expectedYmylPages } from '../../scripts/lib/ymyl.ts';
import { ROUTES, languagesOf } from '../../src/i18n/routes.ts';

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
});

describe('contagem do portão de dinheiro e saúde (F4)', () => {
  it('counts every indexed money and health route in each of its languages', () => {
    expect(expectedYmylPages([{ adArea: 'dinheiro', indexable: true, languages: 1 }, { adArea: 'arquivos', indexable: true, languages: 3 }])).toBe(1);
    expect(expectedYmylPages([{ adArea: 'dinheiro', indexable: false, languages: 1 }, { adArea: 'casa-saude', indexable: true, languages: 3 }])).toBe(3);
    // The real route map: the money hub, the 18 calculators and the 5 guides, in English.
    const routes = ROUTES.map((route) => ({ ...(route.adArea ? { adArea: route.adArea } : {}), indexable: route.indexable, languages: languagesOf(route).length }));
    expect(expectedYmylPages(routes)).toBe(24);
  });

  it('accepts a count equal to the routes, and refuses zero pages and any other count', () => {
    expect(countProblems(24, 24)).toEqual([]);
    expect(countProblems(0, 24).join()).toMatch(/nenhuma página/);
    expect(countProblems(0, 0).join()).toMatch(/nenhuma página/);
    expect(countProblems(23, 24).join()).toMatch(/23 página\(s\) conferida\(s\), mas o mapa de rotas tem 24/);
  });
});
