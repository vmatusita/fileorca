import type { HomeTexts } from '../types.ts';

export default {
  title: 'FileOrca: ferramentas grátis que nunca enviam seus arquivos',
  description:
    'Ferramentas grátis que rodam no navegador, sem cadastro e sem upload. Seus arquivos ficam no seu aparelho, e você mesmo confere na aba Rede do navegador.',
  h1: 'Ferramentas grátis que rodam no seu navegador',
  intro: 'Sem cadastro, sem upload e sem processamento em servidor. Escolha uma ferramenta e o trabalho acontece no seu aparelho.',
  toolsHeading: 'Escolha uma ferramenta',
  hubLink: 'Ver todas as ferramentas de imagem e os tamanhos mais comuns',
  pdf: {
    heading: 'Mexa num PDF',
    intro: 'Junte, divida, comprima, gire, proteja e assine PDFs, ou transforme as páginas em imagens. O PDF é lido e gravado no seu aparelho, e a senha nunca sai dele.',
    hubLink: 'Ver todas as ferramentas de PDF',
  },
  money: {
    heading: 'Faça as contas de um financiamento',
    intro: 'Financiamento imobiliário em SAC e PRICE, carro, empréstimo e cartão: a parcela, os juros, o CET e o cronograma inteiro. Seus números ficam no seu aparelho.',
    hubLink: 'Ver todas as calculadoras financeiras',
  },
  privacyHeading: 'Seus arquivos ficam com você',
  privacyBody:
    'Seus arquivos nunca saem do seu aparelho. O FileOrca faz o trabalho no navegador, e você mesmo pode conferir: abra a aba Rede do navegador enquanto usa uma ferramenta e veja que nenhuma requisição leva o seu arquivo.',
  qr: {
    heading: 'Crie um QR code',
    intro: 'Transforme um link ou um texto curto num QR code com a Oli no centro e baixe em PNG ou SVG. O texto fica no seu aparelho.',
  },
  // F11 (decisão 7): a seção "Leia um guia"; {n} é o número de guias do idioma, lido dos registros.
  guides: {
    heading: 'Leia um guia',
    intro: 'Cada guia responde a uma pergunta com números e traz a ferramenta dentro.',
    hubLink: 'Ver os {n} guias',
  },
} satisfies HomeTexts;
