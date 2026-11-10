import type { ImageToolTexts, PdfOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'Imagem para PDF online, sem upload',
  description:
    'Transforme imagens JPG, PNG e WebP num PDF só, no navegador, uma imagem por página. Sem upload, sem limite de imagens, e sem GPS nem nome de arquivo no PDF.',
  h1: 'Imagem para PDF',
  howHeading: 'Como transformar imagens em PDF',
  howSteps: [
    'Solte as imagens na caixa, escolha os arquivos ou cole com Ctrl V.',
    'Escolha "Tamanho da imagem", "Carta" ou "A4" para as páginas e deixe a lista na ordem que você quer: arraste uma linha ou use as setas dela (elas funcionam pelo teclado também).',
    'Baixe o seu PDF.',
  ],
  specsHeading: 'Especificações',
  specs: {
    caption: 'Imagem para PDF: formatos aceitos, saída e limites',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Aceita', 'JPG, PNG e WebP, reconhecidos pelo conteúdo do arquivo e não pelo nome. Fotos HEIC passam antes pela ferramenta HEIC para JPG, e arquivos AVIF, pela ferramenta AVIF para JPG.'],
      ['Saída', 'Um PDF para o lote inteiro, com uma imagem por página, na ordem da lista.'],
      ['Tamanho da imagem', 'O padrão. Cada página fica do tamanho da imagem dela, sem borda branca.'],
      ['Carta e A4', 'A imagem inteira cabe dentro da folha, com uma margem de 0,5 polegada, que são 36 pontos. A folha fica em pé ou deitada conforme cada imagem.'],
      ['Imagens no PDF', 'As fotos entram como JPG, e as imagens com transparência entram como PNG. As duas são salvas de novo a partir dos pixels, com a orientação da foto aplicada.'],
      ['Dados do PDF', 'O PDF não tem título nem autor tirados dos nomes dos seus arquivos. O FileOrca só aparece como o programa que o criou.'],
      ['Lote', 'Sem limite de imagens. Um lote sempre dá um PDF só.'],
      ['Metadados', 'Exif, XMP, IPTC e GPS nunca chegam ao PDF.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Como coloco várias imagens num PDF só?',
      a: 'Solte todas juntas. A Oli põe uma imagem em cada página, na ordem da lista, e entrega um PDF só.',
    },
    {
      q: 'Qual tamanho de página devo escolher?',
      a: 'Tamanho da imagem deixa cada página do tamanho da foto dela, o que serve para fotos que você só quer ver. Carta e A4 são folhas padrão para imprimir, ou para formulários que pedem uma página normal; a imagem fica dentro da folha, com margem.',
    },
    {
      q: 'Como mudo a ordem das páginas?',
      a: 'As páginas seguem a ordem da lista na tela. Arraste uma linha para outro lugar ou aperte as setas da linha para subir ou descer; elas funcionam pelo teclado também. A lixeira de uma linha tira essa imagem da lista, e o Desfazer a devolve. Se o PDF já estiver pronto, a Oli o refaz na ordem nova, sem preparar as imagens de novo.',
    },
    {
      q: 'Minhas fotos perdem qualidade no PDF?',
      a: 'Uma foto é salva de novo como JPG quando entra, o que pode custar um pouco de qualidade. Uma imagem com transparência entra como PNG, sem perda.',
    },
    {
      q: 'O PDF inclui a localização das minhas fotos?',
      a: 'Não. As imagens entram no PDF a partir dos pixels, e não do arquivo original, então os dados Exif e de GPS não vão junto. O PDF também não tem título nem autor tirados dos nomes dos seus arquivos.',
    },
    {
      q: 'Por que meu PDF ficou tão grande?',
      a: 'Um PDF pesa mais ou menos o mesmo que as imagens que estão dentro dele. Use antes a ferramenta Comprimir imagem ou Redimensionar imagem nas fotos, e depois monte o PDF com as cópias mais leves.',
    },
    {
      q: 'Dá para pôr fotos HEIC do iPhone num PDF?',
      a: 'Não diretamente. Converta as fotos antes com a ferramenta HEIC para JPG, e depois adicione os arquivos JPG aqui.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Suas imagens viram um PDF no seu aparelho e nunca são enviadas a um servidor. O PDF deixa de fora os metadados da foto, inclusive a localização GPS.',
  relatedHeading: 'Mais ferramentas de imagem',
  panel: {
    formats: 'JPG, PNG ou WebP',
    progressLabel: 'Montando o seu PDF',
    done: 'Prontinho! Aqui está o seu PDF.',
    doneMany: 'Prontinho! Aqui está o seu PDF com {count} páginas.',
    options: {
      legend: 'Tamanho da página',
      image: 'Tamanho da imagem',
      letter: 'Carta',
      a4: 'A4',
      help: 'Uma imagem por página, na ordem da lista. Carta e A4 deixam uma margem de 0,5 polegada.',
    },
  },
} satisfies ImageToolTexts<PdfOptionsTexts>;
