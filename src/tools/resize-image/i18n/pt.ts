import type { ImageToolTexts, ResizeOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'Redimensionar imagem online, sem upload',
  description:
    'Redimensione uma imagem JPG, PNG ou WebP em pixels ou por porcentagem, no navegador. Sem upload, sem limite de imagens e sem metadados como o GPS.',
  h1: 'Redimensionar imagem',
  howHeading: 'Como redimensionar uma imagem',
  howSteps: [
    'Solte as imagens na caixa, escolha os arquivos ou cole com Ctrl V.',
    'Escolha Por tamanho e digite a largura e a altura, ou escolha Por porcentagem e digite um número.',
    'Baixe a imagem redimensionada, ou o ZIP quando tiver redimensionado várias.',
  ],
  specsHeading: 'Especificações',
  specs: {
    caption: 'Redimensionar imagem: formatos aceitos, saída e limites',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Aceita', 'JPG, PNG e WebP, reconhecidos pelo conteúdo do arquivo e não pelo nome. Fotos HEIC passam antes pela ferramenta HEIC para JPG, e arquivos AVIF, pela ferramenta AVIF para JPG.'],
      ['Por tamanho', 'Você digita a largura e a altura em pixels. A proporção fica travada, e cada imagem cabe dentro dessa caixa.'],
      ['Por porcentagem', 'Você digita uma porcentagem da largura e da altura atuais, a mesma para todas as imagens do lote.'],
      ['Nunca amplia', 'Se você pedir mais pixels do que a imagem tem, ela fica no tamanho original, e o resultado avisa.'],
      ['Saída', 'O mesmo formato do arquivo que você soltou. PNG e WebP mantêm a transparência.'],
      ['Qualidade', 'JPG e WebP são salvos de novo depois do redimensionamento. O PNG é salvo sem perda.'],
      ['Lote', 'Sem limite de imagens. Uma imagem é baixada direto, e várias vêm num só ZIP.'],
      ['Fotos grandes', 'Imagens acima de 16.777.216 pixels, cerca de 16,8 megapixels, são redimensionadas sem o canvas do navegador, então também funcionam.'],
      ['Metadados', 'Exif, XMP, IPTC e GPS são removidos, e a orientação da foto é aplicada.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Como redimensiono uma imagem para um tamanho exato em pixels?',
      a: 'Escolha Por tamanho e digite a largura e a altura de que você precisa. A proporção fica travada, então cada imagem cabe dentro dessa caixa: uma foto de 4000 × 3000 numa caixa de 1000 × 1000 sai com 1000 × 750.',
    },
    {
      q: 'Redimensionar diminui a qualidade da imagem?',
      a: 'Diminuir uma imagem mantém a nitidez no tamanho novo. Aumentar só consegue esticar os pixels que ela já tem, o que deixa tudo borrado, por isso a Redimensionar imagem nunca amplia: se você pedir mais pixels do que a imagem tem, recebe o tamanho original de volta, e o resultado avisa.',
    },
    {
      q: 'É melhor redimensionar por pixels ou por porcentagem?',
      a: 'Use pixels quando um formulário ou um site pede um tamanho, como 800 × 600. Use porcentagem quando você só quer tudo menor na mesma medida, como 50% para metade da largura e metade da altura. Num lote de fotos variadas, a porcentagem diminui cada uma na mesma medida, enquanto o tamanho faz cada uma caber na mesma caixa.',
    },
    {
      q: 'Mudar o DPI muda o tamanho da imagem?',
      a: 'O DPI é uma configuração de impressão, e o que conta na tela é o número de pixels. A Redimensionar imagem muda os pixels, então muda o tamanho com que a imagem aparece numa página da web e o peso do arquivo.',
    },
    {
      q: 'O arquivo fica mais leve depois de redimensionar?',
      a: 'Normalmente sim, porque menos pixels dão um arquivo menor. Para um tamanho de arquivo exato, como 100 KB, use a ferramenta Comprimir imagem para 100 KB.',
    },
    {
      q: 'Minha imagem é enviada para algum lugar?',
      a: 'Não. O FileOrca redimensiona a imagem no seu aparelho, dentro do navegador. Abra a aba Rede do navegador enquanto redimensiona: nenhuma requisição leva o seu arquivo.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Suas imagens são redimensionadas no seu aparelho e nunca são enviadas a um servidor. As cópias salvas deixam de fora os metadados da foto, inclusive a localização GPS.',
  relatedHeading: 'Mais ferramentas de imagem',
  presets: {
    heading: 'Tamanhos prontos',
    caption: 'Ajustes prontos da Redimensionar imagem e o que cada um faz',
    head: ['Ajuste pronto', 'O que faz'],
  },
  panel: {
    formats: 'JPG, PNG ou WebP',
    progressLabel: 'Redimensionando as imagens',
    done: 'Prontinho! Sua imagem foi redimensionada.',
    doneMany: 'Prontinho! Suas {count} imagens foram redimensionadas.',
    options: {
      legend: 'Redimensionar',
      bySize: 'Por tamanho',
      byPercent: 'Por porcentagem',
      width: 'Largura',
      height: 'Altura',
      percent: 'Porcentagem',
      px: 'px',
      pct: '%',
      fitNote: 'Cada imagem cabe dentro desta caixa e mantém a proporção.',
      invalid: 'Digite um número inteiro de 1 a {max}.',
    },
  },
} satisfies ImageToolTexts<ResizeOptionsTexts>;
