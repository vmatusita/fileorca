import type { CropOptionsTexts, ImageToolTexts } from '../../../i18n/types.ts';

export default {
  title: 'Cortar imagem online, sem upload',
  description:
    'Corte uma imagem JPG, PNG ou WebP em quadrado, 4:5, 16:9 ou formato livre, no navegador. Sem upload, sem limite de imagens e sem metadados como o GPS.',
  h1: 'Cortar imagem',
  howHeading: 'Como cortar uma imagem',
  howSteps: [
    'Solte as imagens na caixa, escolha os arquivos ou cole com Ctrl V.',
    'Escolha Quadrado, 4:5, 16:9 ou Livre e arraste a área do corte ou os cantos dela, ou digite a posição e o tamanho.',
    'Baixe a imagem cortada.',
  ],
  specsHeading: 'Especificações',
  specs: {
    caption: 'Cortar imagem: formatos aceitos, saída e limites',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Aceita', 'JPG, PNG e WebP, reconhecidos pelo conteúdo do arquivo e não pelo nome. Fotos HEIC passam antes pela ferramenta HEIC para JPG, e arquivos AVIF, pela ferramenta AVIF para JPG.'],
      ['Proporções', 'Quadrado, 4:5, 16:9 ou Livre.'],
      ['Mover a área', 'Arraste a área do corte ou os cantos dela, ou dê foco nela e use as setas do teclado. Shift com as setas muda o tamanho.'],
      ['Valores exatos', 'Digite x, y, largura e altura da área do corte em pixels da imagem, que é o jeito de cortar sem arrastar nada.'],
      ['Lote', 'Cada imagem recebe o corte centralizado na proporção escolhida. Escolha uma imagem na lista para ajustar a área dela, e as outras mantêm as suas. Várias imagens vêm num só ZIP.'],
      ['Saída', 'O mesmo formato do arquivo que você soltou, com os pixels da área do corte e sem mudar a escala. PNG e WebP mantêm a transparência.'],
      ['Qualidade', 'JPG e WebP são salvos de novo depois do corte. O PNG é salvo sem perda.'],
      ['Metadados', 'Exif, XMP, IPTC e GPS são removidos, e a orientação da foto é aplicada antes do corte.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Como corto uma foto em quadrado?',
      a: 'Quadrado é a proporção padrão, e a área do corte abre centralizada, então um resultado fica pronto assim que você solta a foto. Baixe como está ou mova a área antes.',
    },
    {
      q: 'Como corto uma imagem em 4:5 para o Instagram?',
      a: 'Escolha 4:5 e arraste a área do corte sobre a parte que você quer manter. Uma imagem 4:5 é mais alta do que larga, e a área mantém essa forma quando você muda o tamanho dela. Se o app pedir pixels exatos, leve a imagem cortada para a ferramenta Redimensionar imagem.',
    },
    {
      q: 'Cortar diminui a qualidade da imagem?',
      a: 'Cortar tira pixels e não estica os que ficam, então a parte que você mantém fica tão nítida quanto o original.',
    },
    {
      q: 'Dá para cortar sem uma proporção fixa?',
      a: 'Dá. Escolha Livre e arraste qualquer lado ou canto da área do corte. No Livre, a largura e a altura mudam de forma independente.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Suas imagens são cortadas no seu aparelho e nunca são enviadas a um servidor.',
  relatedHeading: 'Mais ferramentas de imagem',
  panel: {
    formats: 'JPG, PNG ou WebP',
    progressLabel: 'Cortando as imagens',
    done: 'Prontinho! Sua imagem foi cortada.',
    doneMany: 'Prontinho! Suas {count} imagens foram cortadas.',
    options: {
      legend: 'Proporção',
      square: 'Quadrado',
      portrait: '4:5',
      wide: '16:9',
      free: 'Livre',
      boxLabel: 'Área do corte',
      boxValue: '{width} por {height} pixels, em {x}, {y}',
      keyboardHelp: 'As setas movem a área do corte. Shift com as setas muda o tamanho.',
      x: 'X',
      y: 'Y',
      width: 'Largura',
      height: 'Altura',
      px: 'px',
      invalid: 'Digite um número inteiro que mantenha a área do corte dentro da imagem.',
      batchNote: 'Cada imagem recebe o corte centralizado. Escolha uma imagem na lista para ajustar a área dela.',
    },
  },
} satisfies ImageToolTexts<CropOptionsTexts>;
