import type { ImageToolTexts, NoteOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'AVIF para JPG online, sem upload',
  description:
    'Converta imagens AVIF em JPG no navegador. Sem upload, sem limite de imagens, a transparência fica branca e os dados de GPS são removidos.',
  h1: 'AVIF para JPG',
  howHeading: 'Como converter AVIF em JPG',
  howSteps: [
    'Solte as imagens AVIF na caixa, escolha os arquivos ou cole com Ctrl V.',
    'A Oli transforma cada uma em JPG, e não há nada para escolher.',
    'Baixe o JPG, ou o ZIP quando tiver convertido várias.',
  ],
  specsHeading: 'Especificações',
  specs: {
    caption: 'AVIF para JPG: formatos aceitos, saída e limites',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Aceita', 'Arquivos AVIF, reconhecidos pelo conteúdo do arquivo e não pelo nome.'],
      ['Saída', 'JPG. Sai um arquivo para cada AVIF.'],
      ['Transparência', 'O JPG não tem transparência, então ela fica branca, e o resultado avisa.'],
      ['Tamanho', 'Um JPG da mesma imagem costuma ficar maior que o AVIF, porque o AVIF comprime melhor.'],
      ['Lote', 'Sem limite de imagens. Uma imagem é baixada direto, e várias vêm num só ZIP.'],
      ['Metadados', 'Exif, XMP, IPTC e GPS são removidos, e a orientação da foto é aplicada.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Como abro um arquivo AVIF no Windows?',
      a: 'As versões atuais do Chrome, do Edge e do Firefox abrem AVIF, então dá para arrastar o arquivo para um deles. Alguns editores e apps mais antigos não conseguem abrir esse formato, e um JPG feito a partir do arquivo abre em todo lugar.',
    },
    {
      q: 'Por que um site recusa a minha imagem AVIF?',
      a: 'Muitos formulários de envio e apps mais antigos aceitam só JPG, PNG ou formatos parecidos. Renomear .avif para .jpg não resolve, porque os dados lá dentro continuam sendo AVIF. Converter grava um JPG de verdade.',
    },
    {
      q: 'Converter AVIF em JPG diminui a qualidade?',
      a: 'O JPG comprime com perda, então o arquivo novo não é uma cópia perfeita, e ele costuma ficar maior que o AVIF. Guarde o AVIF se você precisar do original.',
    },
    {
      q: 'O que acontece com um fundo transparente?',
      a: 'O JPG não guarda transparência, então o FileOrca preenche essas áreas com branco, e o resultado avisa.',
    },
    {
      q: 'Por que algumas imagens vêm em AVIF?',
      a: 'Um arquivo AVIF muitas vezes é bem menor que um JPG de aparência parecida, então muitos sites mandam AVIF para os navegadores que aceitam o formato, e o seu navegador salva o que recebeu.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Suas imagens são convertidas no seu aparelho e nunca são enviadas a um servidor. Os arquivos JPG deixam de fora os metadados da foto, inclusive a localização GPS.',
  relatedHeading: 'Mais ferramentas de imagem',
  panel: {
    formats: 'AVIF',
    progressLabel: 'Convertendo as imagens',
    done: 'Prontinho! Sua imagem foi convertida.',
    doneMany: 'Prontinho! Suas {count} imagens foram convertidas.',
    options: {
      note: 'Cada AVIF vira JPG, com a transparência em branco.',
    },
  },
} satisfies ImageToolTexts<NoteOptionsTexts>;
