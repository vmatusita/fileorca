import type { WhatsNewTexts } from '../types.ts';

// F19a (decisão 2; DECISOES § 752): a página Novidades. As entradas (data, PR, páginas) estão em src/platform/changelog.ts.
export default {
  title: 'Novidades do FileOrca',
  description: 'Cada mudança que você vê no FileOrca desde que o site entrou no ar: ferramentas, idiomas e guias novos, cada um com o dia em que chegou ao site.',
  h1: 'Novidades',
  intro: 'Cada mudança que você vê no FileOrca, da mais nova para a mais antiga, com o dia em que chegou ao site e os links para as páginas que ela mudou.',
  more: 'e mais {n}',
  entries: {},
} satisfies WhatsNewTexts;
