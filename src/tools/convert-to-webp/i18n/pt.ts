import type { ConvertToOptionsTexts, ImageToolTexts } from '../../../i18n/types.ts';

export default {
  title: 'Converter para WebP online, sem upload',
  description:
    'Converta JPG e PNG em arquivos WebP ou AVIF menores, no navegador. Sem upload, sem limite de imagens, a transparência é mantida e os dados de GPS são removidos.',
  h1: 'Converter para WebP',
  howHeading: 'Como converter uma imagem em WebP',
  howSteps: [
    'Solte as imagens JPG ou PNG na caixa, escolha os arquivos ou cole com Ctrl V.',
    'Mantenha o WebP ou escolha AVIF, e depois a compressão Recomendada ou a Forte.',
    'Baixe a imagem convertida, ou o ZIP quando tiver convertido várias.',
  ],
  specsHeading: 'Especificações',
  specs: {
    caption: 'Converter para WebP: formatos aceitos, saída e limites',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Aceita', 'JPG e PNG, reconhecidos pelo conteúdo do arquivo e não pelo nome. Fotos HEIC passam antes pela ferramenta HEIC para JPG, e arquivos AVIF, pela ferramenta AVIF para JPG.'],
      ['Saída', 'WebP, que é o padrão, ou AVIF. Sai um arquivo para cada imagem.'],
      ['Compressão', 'A Recomendada equilibra tamanho e aparência, e a Forte faz o menor arquivo.'],
      ['Transparência', 'Mantida, tanto no WebP quanto no AVIF.'],
      ['Velocidade', 'Uma foto maior demora mais para salvar, nos dois formatos. Qual dos dois salva mais rápido depende do navegador.'],
      ['Compatibilidade', 'O WebP abre em todo navegador atual. O AVIF abre nas versões atuais do Chrome, do Edge, do Firefox e do Safari, mas alguns apps e editores mais antigos não conseguem ler esse formato.'],
      ['Lote', 'Sem limite de imagens. Uma imagem é baixada direto, e várias vêm num só ZIP.'],
      ['Metadados', 'Exif, XMP, IPTC e GPS são removidos, e a orientação da foto é aplicada.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Quanto o WebP é menor que o JPG?',
      a: 'Muitas vezes fica de um quarto a um terço menor, com aparência parecida, e o AVIF pode ir além. A economia depende da imagem, então a comparação de antes e depois no resultado mostra os tamanhos reais.',
    },
    {
      q: 'Escolho WebP ou AVIF?',
      a: 'O WebP é a escolha segura: todo navegador atual abre o formato. O AVIF dá arquivos menores, mas alguns apps mais antigos não conseguem abrir esse formato.',
    },
    {
      q: 'O WebP mantém a transparência de um PNG?',
      a: 'Mantém, e o AVIF também. Um PNG com fundo transparente continua com ele quando você converte para qualquer um dos dois formatos.',
    },
    {
      q: 'Todo site aceita um arquivo WebP?',
      a: 'Nem sempre. Os navegadores e a maioria dos sites modernos aceitam, mas alguns formulários de envio e editores mais antigos aceitam só JPG ou PNG. Nesse caso, a ferramenta WebP para JPG faz o caminho de volta.',
    },
    {
      q: 'Por que converter as minhas imagens para WebP?',
      a: 'Imagens mais leves fazem uma página carregar mais rápido e ocupam menos espaço. Converter um JPG ou PNG em WebP é um jeito rápido de ter essa economia.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Suas imagens são convertidas no seu aparelho e nunca são enviadas a um servidor. Os arquivos novos deixam de fora os metadados da foto, inclusive a localização GPS.',
  relatedHeading: 'Mais ferramentas de imagem',
  panel: {
    formats: 'JPG ou PNG',
    progressLabel: 'Convertendo as imagens',
    done: 'Prontinho! Sua imagem foi convertida.',
    doneMany: 'Prontinho! Suas {count} imagens foram convertidas.',
    options: {
      formatLegend: 'Formato',
      webp: 'WebP',
      avif: 'AVIF',
      levelLegend: 'Compressão',
      recommended: 'Recomendada',
      recommendedHelp: 'melhor equilíbrio',
      strong: 'Forte',
      strongHelp: 'menor tamanho',
      now: '{format} · {level}',
    },
  },
} satisfies ImageToolTexts<ConvertToOptionsTexts>;
