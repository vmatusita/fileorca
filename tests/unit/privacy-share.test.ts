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

const TEXTS = { en, pt, es };
const SAYS = {
  en: { android: 'On Android', next: /the next time you open FileOrca after an hour/, cleared: /if you clear the site data, open fileorca\.com once before you share again/, sent: /Android sends the shared files to fileorca\.com, which refuses them/, never: /never uploaded/ },
  pt: { android: 'No Android', next: /na próxima vez que você abrir o FileOrca depois de uma hora/, cleared: /se você limpar os dados do site, abra o fileorca\.com uma vez antes de compartilhar de novo/, sent: /o Android envia os arquivos compartilhados ao fileorca\.com, que os recusa/, never: /nunca são enviados/ },
  es: { android: 'En Android', next: /la próxima vez que abras FileOrca después de una hora/, cleared: /si borras los datos del sitio, abre fileorca\.com una vez antes de volver a compartir/, sent: /Android envía los archivos compartidos a fileorca\.com, que los rechaza/, never: /Nunca se suben/ },
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
      const retention = paragraphs.filter((text) => SAYS[lang].next.test(text));
      expect(retention, 'the paragraph and the line of how long data is kept').toHaveLength(2);
    });
  }

  it('the Open with page does not promise the files never go anywhere', () => {
    expect(enOpenWith.description).not.toMatch(/never go anywhere/);
  });
});
