import type { HomeTexts } from '../types.ts';

// F13b (UX-03 B; DECISOES § 567 e § 568) e ajuste-home-cards (§ 602 a § 604): o topo da home e, depois, uma seção por
// categoria com o título, a frase, os ToolCards de src/components/home-bands.ts e o link do hub. Todo número é um
// {placeholder} que o build preenche dos registros (src/components/tool-count.ts e os guias).
export default {
  title: 'FileOrca: ferramentas grátis que nunca enviam seus arquivos',
  description:
    'Ferramentas grátis que rodam no navegador, sem cadastro e sem upload. Seus arquivos ficam no seu aparelho, e você mesmo confere na aba Rede do navegador.',
  h1: '{n} ferramentas.',
  h1Promise: '0 uploads.',
  intro: 'Ferramentas de imagem, PDF e dinheiro que fazem o trabalho no seu aparelho, sem cadastro.',
  toolsHeading: 'Escolha uma ferramenta',
  image: {
    heading: 'Imagem',
    more: 'Cada ferramenta de imagem abre o arquivo nesta aba, faz o trabalho no seu aparelho e entrega uma cópia nova para você salvar.',
    all: 'Todas as ferramentas de imagem e os ajustes prontos',
  },
  pdf: {
    heading: 'PDF',
    more: 'Juntar, dividir e assinar acontecem na mesma aba, e a senha que você digita para um PDF nunca sai dela.',
    all: 'Todas as ferramentas de PDF',
  },
  money: {
    heading: 'Dinheiro',
    more: 'Cada calculadora explica o resultado, que você pode baixar em PDF ou CSV, e os números que você digita ficam no seu aparelho.',
    all: 'As {n} calculadoras financeiras',
  },
  qr: {
    heading: 'QR code',
    more: 'Digite um link ou um texto curto e salve o código em PNG ou SVG, com o texto guardado no seu aparelho.',
  },
  privacyHeading: 'Seus arquivos ficam com você',
  privacyBody:
    'Seus arquivos nunca saem do seu aparelho. O FileOrca faz o trabalho no navegador, e você mesmo pode conferir: abra a aba Rede do navegador enquanto usa uma ferramenta e veja que nenhuma requisição leva o seu arquivo.',
  // F11 (decisão 7): a seção "Leia um guia"; {n} é o número de guias do idioma, lido dos registros.
  guides: {
    heading: 'Leia um guia',
    intro: 'Cada guia responde a uma pergunta com números e traz a ferramenta dentro.',
    hubLink: 'Ver os {n} guias',
  },
} satisfies HomeTexts;
