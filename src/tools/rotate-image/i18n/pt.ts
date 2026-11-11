import type { ImageToolTexts, RotateOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'Girar imagem online, sem upload',
  description:
    'Gire ou espelhe uma imagem JPG, PNG ou WebP no navegador: 90° à esquerda ou à direita, 180°, na horizontal ou na vertical. Sem upload, sem limite e sem GPS.',
  h1: 'Girar imagem',
  howHeading: 'Como girar uma imagem',
  howSteps: [
    'Solte as imagens na caixa, escolha os arquivos ou cole com Ctrl V.',
    'Escolha 90° à direita, 90° à esquerda ou 180° e, se quiser, acrescente um espelhamento.',
    'Baixe a imagem girada, ou o ZIP quando tiver girado várias.',
  ],
  specsHeading: 'Especificações',
  specs: {
    caption: 'Girar imagem: formatos aceitos, saída e limites',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Aceita', 'JPG, PNG e WebP, reconhecidos pelo conteúdo do arquivo e não pelo nome. Fotos HEIC passam antes pela ferramenta HEIC para JPG, e arquivos AVIF, pela ferramenta AVIF para JPG.'],
      ['Girar', '90° à direita, que é o padrão, 90° à esquerda ou 180°.'],
      ['Espelhar', 'Nenhum, que é o padrão, Horizontal ou Vertical. O espelhamento se soma ao giro.'],
      ['Lote', 'O giro e o espelhamento escolhidos valem para todas as imagens do lote. Sem limite de imagens.'],
      ['Ponto de partida', 'A orientação da foto é aplicada primeiro, então você gira a imagem como um visualizador comum a mostra, e não os pixels crus.'],
      ['Saída', 'O mesmo formato do arquivo que você soltou, com os mesmos pixels girados. Um giro de 90° troca a largura pela altura. PNG e WebP mantêm a transparência.'],
      ['Qualidade', 'JPG e WebP são salvos de novo depois do giro. O PNG é salvo sem perda.'],
      ['Metadados', 'Exif, XMP, IPTC e GPS são removidos, e nenhuma marcação de orientação fica para ser lida duas vezes.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Por que minha foto aparece de lado num app e em pé em outro?',
      a: 'Muitos celulares e câmeras salvam os pixels numa direção e acrescentam uma pequena marcação, chamada orientação, que diz como girar a imagem. Os apps que leem essa marcação mostram a foto em pé, e os que a ignoram mostram de lado. O FileOrca aplica a marcação ao salvar o arquivo novo, então os pixels ficam certos e não sobra marcação para ser lida errado.',
    },
    {
      q: 'Girar um JPG diminui a qualidade?',
      a: 'Um JPG ou um WebP é salvo de novo depois do giro, então passa mais uma vez por uma compressão com perda. O PNG é salvo sem perda. Guarde o original e gire uma vez só, em vez de girar em várias etapas.',
    },
    {
      q: 'Como giro várias fotos de uma vez?',
      a: 'Solte todas juntas. O giro e o espelhamento escolhidos valem para o lote inteiro, e você baixa tudo num ZIP só.',
    },
    {
      q: 'Qual é a diferença entre girar e espelhar?',
      a: 'Girar roda a imagem em torno do centro, como virar uma foto impressa em cima da mesa. Espelhar inverte a imagem como se você a visse num espelho: a opção Horizontal troca a esquerda pela direita, e a opção Vertical troca o alto pelo baixo. Um texto numa imagem espelhada fica ao contrário.',
    },
    {
      q: 'Dá para girar uma imagem em 45° ou em outro ângulo?',
      a: 'Aqui não. 90° à direita, 90° à esquerda e 180° mantêm todos os pixels da imagem. Um ângulo livre deixaria cantos vazios para preencher, então ele não faz parte desta ferramenta.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Suas imagens são giradas no seu aparelho e nunca são enviadas a um servidor. As cópias salvas deixam de fora os metadados da foto, inclusive a localização GPS.',
  relatedHeading: 'Mais ferramentas de imagem',
  // F18 placeholder: front T writes the pt text.
  // F18 (decision 5; DECISOES § 725): the table of the presets of this tool, with their links.
  presets: {
    heading: 'Ready-made settings',
    caption: 'Presets of Rotate image and what each one does',
    head: ['Preset', 'What it does'],
  },
  panel: {
    formats: 'JPG, PNG ou WebP',
    progressLabel: 'Girando as imagens',
    done: 'Prontinho! Sua imagem foi girada.',
    doneMany: 'Prontinho! Suas {count} imagens foram giradas.',
    options: {
      turnLegend: 'Girar',
      right: '90° à direita',
      left: '90° à esquerda',
      half: '180°',
      flipLegend: 'Espelhar',
      none: 'Nenhum',
      horizontal: 'Horizontal',
      vertical: 'Vertical',
    },
  },
} satisfies ImageToolTexts<RotateOptionsTexts>;
