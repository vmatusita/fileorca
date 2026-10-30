import type { CompressImageTexts } from '../../../i18n/types.ts';

export default {
  title: 'Comprimir imagem online, sem upload',
  description:
    'Comprima um JPG, PNG ou WebP no navegador. O arquivo é processado no seu aparelho, nunca é enviado, e os dados de GPS da foto são removidos.',
  h1: 'Comprimir imagem',
  drop: {
    title: 'Solte uma imagem aqui',
    choose: 'Escolher imagem',
    helpDesktop: 'ou cole com {kbd} · JPG, PNG ou WebP, uma por vez',
    help: 'JPG, PNG ou WebP, uma por vez',
    pasteKey: 'Ctrl V',
    over: 'Pode soltar, a Oli está pronta',
    overHelp: 'Uma imagem',
    errorTitle: 'Ops, a Oli não conseguiu ler esse arquivo',
    errorHelp: '{name} não é uma imagem que a Oli consiga ler. Tente um JPG ou PNG.',
    chooseAnother: 'Escolher outro arquivo',
  },
  options: {
    legend: 'Compressão',
    recommended: 'Recomendada',
    recommendedHelp: 'melhor equilíbrio',
    strong: 'Forte',
    strongHelp: 'menor tamanho',
  },
  progress: {
    label: 'Comprimindo a imagem',
    working: 'A Oli está cuidando disso…',
  },
  result: {
    done: 'Prontinho! Sua imagem ficou {percent} mais leve.',
    unchanged: 'Essa imagem já estava otimizada, então a Oli manteve o original.',
    placardLabel: 'mais leve',
    before: 'Antes',
    after: 'Depois',
    size: 'Tamanho',
    download: 'Baixar',
    startOver: 'Começar de novo',
    to: 'para',
  },
  next: { label: 'A seguir:', moreTools: 'Mais ferramentas' },
  howHeading: 'Como funciona',
  howSteps: [
    'Solte uma imagem JPG, PNG ou WebP na caixa, escolha o arquivo ou cole a imagem.',
    'A Oli redesenha a imagem no seu navegador e a salva de novo com a compressão que você escolheu.',
    'Baixe a cópia mais leve. O arquivo original continua intacto.',
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'A imagem é processada no seu aparelho e nunca é enviada a um servidor. A cópia salva também deixa de fora os metadados da foto, inclusive a localização GPS.',
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Minha imagem é enviada para algum lugar?',
      a: 'Não. A compressão acontece no seu aparelho, dentro do navegador. Abra a aba Rede do navegador enquanto comprime: nenhuma requisição leva o seu arquivo.',
    },
    {
      q: 'Por que o arquivo voltou com o mesmo tamanho?',
      a: 'Algumas imagens já estão bem comprimidas. Quando a nova cópia não ficaria menor, a Oli devolve o original em vez de um arquivo maior.',
    },
    {
      q: 'O que acontece com os dados de localização da minha foto?',
      a: 'A cópia comprimida é salva sem os metadados da foto, então a localização GPS, o modelo da câmera e a data ficam de fora.',
    },
  ],
} satisfies CompressImageTexts;
