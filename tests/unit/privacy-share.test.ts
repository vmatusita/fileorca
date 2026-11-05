// What the Privacy page says about files shared with the installed app (F8, decision 18; review F8 a-1 and a-2,
// DECISOES § 307), in the three languages. The service worker keeps them in the inbox and nothing goes up, but only
// while it is installed: after the site data is cleared (or with the kill switch on), Android sends the files of a
// share to fileorca.com, which answers 405 (the final review measured the request reaching the server). And the
// worker deletes an inbox past its hour on the next visit, not on its own. The page says both, and no longer "never uploaded" or
// "after an hour" alone.
import { describe, expect, it } from 'vitest';
import en from '../../src/i18n/en/privacy.ts';
import pt from '../../src/i18n/pt/privacy.ts';
import es from '../../src/i18n/es/privacy.ts';
import enOpenWith from '../../src/i18n/en/open-with.ts';
import { IMAGE_PANEL_TEXTS } from '../../src/tools/image/texts.ts';

const TEXTS = { en, pt, es };
const SAYS = {
  en: {
    android: 'On Android', next: /the next time you open FileOrca after an hour/, cleared: /[Ii]f you clear the site data, open fileorca\.com once before you share again/, sent: /Android sends the shared files to fileorca\.com, which refuses them/, never: /never uploaded/,
    chip: /^When you tap a next-step suggestion that takes your result along, such as Resize this image/, chipNotes: /which tool you chose and which tool the file came from, and nothing else/,
    kept: /^Offline copy:/, keptChip: /Results taken along to the next tool are deleted when that tool takes them/,
  },
  pt: {
    android: 'No Android', next: /na próxima vez que você abrir o FileOrca depois de uma hora/, cleared: /[Ss]e você limpar os dados do site, abra o fileorca\.com uma vez antes de compartilhar de novo/, sent: /o Android envia os arquivos compartilhados ao fileorca\.com, que os recusa/, never: /nunca são enviados/,
    chip: /^Quando você toca numa sugestão de próximo passo que leva o resultado junto, como Redimensionar esta imagem/, chipNotes: /qual ferramenta você escolheu e de qual ferramenta o arquivo veio, e nada mais/,
    kept: /^Cópia offline:/, keptChip: /Os resultados levados para a próxima ferramenta são apagados quando ela os recebe/,
  },
  es: {
    android: 'En Android', next: /la próxima vez que abras FileOrca después de una hora/, cleared: /[Ss]i borras los datos del sitio, abre fileorca\.com una vez antes de volver a compartir/, sent: /Android envía los archivos compartidos a fileorca\.com, que los rechaza/, never: /Nunca se suben/,
    chip: /^Cuando tocas una sugerencia de siguiente paso que lleva tu resultado, como Redimensionar esta imagen/, chipNotes: /qué herramienta elegiste y de qué herramienta vino el archivo, y nada más/,
    kept: /^Copia sin conexión:/, keptChip: /Los resultados llevados a la siguiente herramienta se borran cuando esa herramienta los recibe/,
  },
} as const;

describe('the Privacy page on files shared with the app', () => {
  for (const lang of ['en', 'pt', 'es'] as const) {
    it(`${lang}: says when they are deleted and when they would leave the device`, () => {
      const paragraphs = TEXTS[lang].sections.flatMap((section) => [...(section.paragraphs ?? []), ...(section.list ?? [])]);
      const share = paragraphs.find((text) => text.startsWith(SAYS[lang].android));
      expect(share, 'the paragraph on sharing').toBeDefined();
      expect(share).toMatch(SAYS[lang].next);
      expect(share).toMatch(SAYS[lang].cleared);
      expect(share).toMatch(SAYS[lang].sent);
      expect(share).not.toMatch(SAYS[lang].never);
      // F13a (UX-14; DECISOES § 504 and § 505): the paragraph of the result a next-step chip takes along says the
      // same hour, so there are three: the share, the chip and the line of how long data is kept (which says both, in one
      // string). The chip's paragraph is its own: it names the example chip and the note of where the file came from.
      const retention = paragraphs.filter((text) => SAYS[lang].next.test(text));
      expect(retention, 'the paragraph of the share, the one of the chip and the line of how long data is kept').toHaveLength(3);
      const chip = retention.find((text) => SAYS[lang].chip.test(text));
      expect(chip, 'the paragraph on the result a chip takes along').toBeDefined();
      expect(chip).toMatch(SAYS[lang].chipNotes);
      // The example is the label the chip shows in that language.
      expect(chip).toContain(IMAGE_PANEL_TEXTS[lang].carry.chips['resize-image'].one);
      expect(retention.find((text) => SAYS[lang].kept.test(text)), 'the line of how long data is kept says both').toMatch(SAYS[lang].keptChip);
    });
  }

  it('the Open with page does not promise the files never go anywhere', () => {
    expect(enOpenWith.description).not.toMatch(/never go anywhere/);
  });
});
