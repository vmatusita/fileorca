// The texts of the coffee ask (F12, decisions 7 and 10; DECISOES § 441). They are read from the table of
// PLANO-MELHORIAS.md, section C, so a comma changed on either side reprovaria here: the result card, its button, the footer
// line, the Menu row, the title and the text of the support page, in en, pt and es. The one new text, the sentence after
// "Don't show this again", is the one of the specification (docs/propostas/ux-v2/coffee.html). Then the rules of every
// coffee text, in the three languages: no exclamation mark (the Oli's "Done!" is the only one on the screen), never
// "click", "clique" or "clic" (without case, inside a word too), no deadline, no count of uses, and no word about ads in
// the result card or in the footer (the support page keeps "Ads cover the costs", the text of section C as it is).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LANGS, type Lang } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { IMAGE_PANEL_TEXTS } from '../../src/tools/image/texts.ts';
import { PDF_PANEL_TEXTS } from '../../src/tools/pdf/texts.ts';

type Row = 'card' | 'button' | 'footer' | 'menu' | 'title' | 'body';
const ROWS: Record<string, Row> = {
  'Card de resultado': 'card',
  Botão: 'button',
  Rodapé: 'footer',
  'Menu do cabeçalho': 'menu',
  'Título da página de apoio': 'title',
  'Texto da página de apoio': 'body',
};

/** The table of section C of PLANO-MELHORIAS.md: row → [en, pt, es]. */
function sectionC(): Record<Row, Record<Lang, string>> {
  const plan = readFileSync('PLANO-MELHORIAS.md', 'utf8').split(/\r?\n/);
  const start = plan.findIndex((line) => /^### C\. Café/.test(line));
  expect(start, 'section C of PLANO-MELHORIAS.md').toBeGreaterThan(0);
  const table: Partial<Record<Row, Record<Lang, string>>> = {};
  for (const line of plan.slice(start + 1)) {
    if (/^#{2,3}\s/.test(line)) break;
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    const row = ROWS[cells[0] ?? ''];
    if (row && cells.length === 4) table[row] = { en: cells[1] ?? '', pt: cells[2] ?? '', es: cells[3] ?? '' };
  }
  expect(Object.keys(table).sort()).toEqual(Object.values(ROWS).sort());
  return table as Record<Row, Record<Lang, string>>;
}

const C = sectionC();
/** Section C gives two Portuguese buttons: the Ko-fi one (support page) and the Pix one (the result card; § 368). */
const [ptKofi, ptPix] = C.button.pt.split(' · ');

/** The sentence after "Don't show this again" (coffee.html, "Textos", the one new text). */
const CONFIRMATION: Record<Lang, string> = {
  en: "Got it, I won't ask here again. The coffee link stays in the footer.",
  pt: 'Combinado, não peço mais aqui. O link do café fica no rodapé.',
  es: 'Entendido, no vuelvo a pedirlo aquí. El enlace del café queda en el pie de página.',
};

/** The coffee texts of a language, by where they show. */
function coffeeTexts(lang: Lang): { card: Record<string, string>; footer: string; support: Record<string, string> } {
  const image = IMAGE_PANEL_TEXTS[lang].result.coffee;
  const pdf = PDF_PANEL_TEXTS[lang].result.coffee;
  const support = TEXTS[lang].support;
  return {
    card: { 'image.text': image.text, 'image.button': image.button, 'image.hide': image.hide, 'image.done': image.done, 'pdf.text': pdf.text, 'pdf.button': pdf.button, 'pdf.hide': pdf.hide, 'pdf.done': pdf.done },
    footer: TEXTS[lang].common.footer.coffee,
    support: { h1: support.h1, body: support.body, button: support.button },
  };
}

describe('the coffee texts are the ones of PLANO-MELHORIAS section C, without a comma changed', () => {
  it('reads the table of section C, with the two Portuguese buttons', () => {
    expect(C.card.en.startsWith('FileOrca is made by one person')).toBe(true);
    expect([ptKofi, ptPix]).toEqual(['Me ajude com um café (Ko-fi)', 'Pagar um café no Pix']);
  });

  for (const lang of LANGS) {
    it(`${lang}: the result card of the image and the PDF tools, the footer, the Menu and the support page`, () => {
      for (const panel of [IMAGE_PANEL_TEXTS[lang], PDF_PANEL_TEXTS[lang]]) {
        expect(panel.result.coffee.text).toBe(C.card[lang]);
        // In Portuguese the card carries one button, the Pix one (the specification and § 368); elsewhere Ko-fi's.
        expect(panel.result.coffee.button).toBe(lang === 'pt' ? ptPix : C.button[lang]);
        expect(panel.result.coffee.done).toBe(CONFIRMATION[lang]);
      }
      expect(TEXTS[lang].common.footer.coffee).toBe(C.footer[lang]);
      expect(TEXTS[lang].common.header.support).toBe(C.menu[lang]);
      expect(TEXTS[lang].support.h1).toBe(C.title[lang]);
      expect(TEXTS[lang].support.body).toBe(C.body[lang]);
      expect(TEXTS[lang].support.button).toBe(lang === 'pt' ? ptKofi : C.button[lang]);
    });
  }
});

/** "click", "clique" and "clic", without case and inside a word too ("clicar", "cliquear", "clicking"). */
const CLICK = ['click', 'clique', 'clic'];
/** A deadline or a count of uses: a digit, or a word of time or of times, in the three languages. */
const DEADLINE_OR_COUNT = /\d|(?<![\p{L}\p{N}])(today|now|tonight|soon|last|left|before|until|hours?|days?|times|uses|hoje|agora|já|logo|antes|até|horas?|dias?|vezes|usos|hoy|ahora|pronto|hasta|veces)(?![\p{L}\p{N}])/iu;
/** Ads, in the three languages. */
const ADS = /(?<![\p{L}\p{N}])(ads?|advert\p{L}*|anúncios?|anuncios?|publicidade|publicidad|propaganda)(?![\p{L}\p{N}])/iu;

describe('the rules of every coffee text, in the three languages', () => {
  it('controls: the patterns catch what they are for', () => {
    for (const text of ['Click here', 'Clique aqui', 'Haz clic', 'cliquear', 'Clicking helps']) expect(CLICK.some((word) => text.toLowerCase().includes(word)), text).toBe(true);
    for (const text of ['Only 2 days left', 'Ajude hoje', 'Você já usou 10 vezes', 'Antes de las 10']) expect(DEADLINE_OR_COUNT.test(text), text).toBe(true);
    for (const text of ['The ads pay', 'Os anúncios pagam', 'Los anuncios', 'sem publicidade']) expect(ADS.test(text), text).toBe(true);
    expect(DEADLINE_OR_COUNT.test(C.card.pt)).toBe(false);
  });

  for (const lang of LANGS) {
    it(`${lang}: no exclamation, no "click", no deadline and no count of uses; the card and the footer say nothing of ads`, () => {
      const { card, footer, support } = coffeeTexts(lang);
      const all = { ...card, footer, ...Object.fromEntries(Object.entries(support).map(([key, text]) => [`support.${key}`, text])) };
      for (const [where, text] of Object.entries(all)) {
        expect(text, where).not.toMatch(/[!¡]/);
        expect(CLICK.filter((word) => text.toLowerCase().includes(word)), where).toEqual([]);
        expect(text, where).not.toMatch(DEADLINE_OR_COUNT);
      }
      for (const [where, text] of Object.entries({ ...card, footer })) expect(text, where).not.toMatch(ADS);
    });
  }
});
