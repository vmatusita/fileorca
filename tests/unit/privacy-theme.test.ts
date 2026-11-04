// The privacy policy names the theme key in the three languages (F11, decision 2; DECISOES § 387): in the summary of the
// intro, next to the cookie choice and in the list of how long data is kept. It says what is kept (fo-theme, with light or
// dark, only when the person picks Light or Dark), that it stays on the device and goes nowhere, that it does not depend on
// the cookie notice, and how to delete it (back to System, or clearing the site data).
import { describe, expect, it } from 'vitest';
import { LANGS } from '../../src/i18n/routes.ts';
import { TEXTS } from '../../src/i18n/texts.ts';
import { THEME_CHOICES, THEME_STORAGE_KEY } from '../../src/platform/theme.ts';

/** The words of each language for "stays on the device", "never sent", "cookie notice" and "clear the site data". */
const WORDS = {
  en: { theme: /theme/i, device: /stays on your device/, sent: /never sent anywhere/, notice: /does not depend on the cookie notice/, clear: /clear the site data/ },
  pt: { theme: /tema/i, device: /fica no seu aparelho/, sent: /nunca é enviado a lugar nenhum/, notice: /não depende do aviso de cookies/, clear: /limpe os dados do site/ },
  es: { theme: /tema/i, device: /se queda en tu dispositivo/i, sent: /nunca se envía a ningún lugar/, notice: /no depende del aviso de cookies/, clear: /elimina los datos del sitio/ },
} as const;

describe('the theme in the privacy policy', () => {
  for (const lang of LANGS) {
    it(`${lang}: the summary, the paragraph next to the cookie choice and the line of how long it is kept`, () => {
      const privacy = TEXTS[lang].privacy;
      const words = WORDS[lang];
      // The names of the three states, as the theme button says them ("Theme: light" gives "light").
      const state = (name: string) => new RegExp(`\\b${name.split(': ')[1] ?? name}\\b`, 'iu');
      const names = TEXTS[lang].common.header.theme;
      expect(privacy.intro, lang).toMatch(words.theme);
      const section = privacy.sections.find((candidate) => candidate.paragraphs.some((paragraph) => paragraph.includes(THEME_STORAGE_KEY)));
      expect(section, lang).toBeDefined();
      // Next to the cookie choice: the same section keeps the paragraph of the cookie notice's record.
      expect(section?.paragraphs.some((paragraph) => /cookie/i.test(paragraph) && !paragraph.includes(THEME_STORAGE_KEY)), lang).toBe(true);
      const paragraph = section?.paragraphs.find((candidate) => candidate.includes(THEME_STORAGE_KEY)) ?? '';
      for (const choice of THEME_CHOICES) expect(paragraph, `${lang} ${choice}`).toMatch(new RegExp(`\\b${choice}\\b`));
      for (const name of [names.system, names.light, names.dark]) expect(paragraph, `${lang} ${name}`).toMatch(state(name));
      for (const [what, pattern] of Object.entries(words)) expect(paragraph, `${lang} ${what}`).toMatch(pattern);
      const kept = privacy.sections.flatMap((candidate) => candidate.list ?? []).filter((item) => item.includes(THEME_STORAGE_KEY));
      expect(kept, lang).toHaveLength(1);
      expect(kept[0], lang).toMatch(state(names.system));
    });
  }
});
