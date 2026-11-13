import type { WhatsNewTexts } from '../types.ts';

// F19a (decisión 2; DECISOES § 752): la página Novedades. Las entradas (fecha, PR, páginas) están en src/platform/changelog.ts.
export default {
  title: 'Novedades de FileOrca',
  description: 'Cada cambio que ves en FileOrca desde que el sitio salió al aire: herramientas, idiomas y guías nuevas, cada uno con el día en que llegó al sitio.',
  h1: 'Novedades',
  intro: 'Cada cambio que ves en FileOrca, del más nuevo al más antiguo, con el día en que llegó al sitio y los enlaces a las páginas que cambió.',
  more: 'y {n} más',
  entries: {},
} satisfies WhatsNewTexts;
