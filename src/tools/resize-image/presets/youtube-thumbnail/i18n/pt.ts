import type { ImageToolTexts, PresetOptionsTexts } from '../../../../../i18n/types.ts';

export default {
  title: 'Miniatura do YouTube em 1280 × 720, online e sem upload',
  description:
    'Faça uma miniatura do YouTube de 1280 × 720 com qualquer imagem, no navegador: um JPG com menos de 2 MB, cortado a partir do centro. Sem upload e sem GPS.',
  h1: 'Miniatura do YouTube',
  howHeading: 'Como fazer uma miniatura do YouTube',
  howSteps: [
    'Solte suas fotos na caixa, escolha os arquivos ou cole com Ctrl V.',
    'A Oli faz a miniatura, e não há nada para escolher.',
    'Baixe a miniatura e adicione no YouTube Studio.',
  ],
  specsHeading: 'O tamanho da miniatura',
  specs: {
    caption: 'O que a Miniatura do YouTube faz e as regras que ela segue',
    head: ['Detalhe', 'O que a Oli faz'],
    rows: [
      ['Tamanho', '1280 × 720 pixels, uma imagem 16:9.'],
      ['Formato', 'Sempre um JPG, salvo para ficar abaixo de 2 MB.'],
      ['Imagem que não é 16:9', 'É cortada a partir do centro para preencher o quadro, e uma linha no resultado avisa. A imagem nunca fica deformada.'],
      ['Outra parte da imagem', 'Corte a imagem antes na ferramenta Cortar imagem para escolher a parte que fica, e depois traga para cá.'],
      ['Transparência', 'As áreas transparentes ficam brancas, porque o JPG não tem transparência.'],
      ['Dados da foto', 'Exif, XMP, IPTC e GPS ficam fora de toda miniatura.'],
    ],
  },
  faqHeading: 'Perguntas sobre miniaturas',
  faq: [
    {
      q: 'Qual é o tamanho de uma miniatura do YouTube?',
      a: 'A Ajuda do YouTube (https://support.google.com/youtube/answer/72431, consultada em 31 de outubro de 2026) pede uma imagem 16:9 com pelo menos 640 pixels de largura, em JPG ou PNG, e recomenda 3840 × 2160 para vídeos. O tamanho que esta ferramenta faz fica dentro dessas regras.',
    },
    {
      q: 'Por que o YouTube diz que minha miniatura é grande demais?',
      a: 'A causa mais comum é o tamanho do arquivo: a Ajuda do YouTube indica 2 MB para uma miniatura personalizada adicionada pelo celular, e um PNG de 1280 × 720 pode passar disso.',
    },
    {
      q: 'Por que minha miniatura fica borrada?',
      a: 'Uma miniatura fica borrada quando a imagem de origem é pequena, porque há poucos pixels para ficar nítida em 1280 × 720. Uma imagem menor que 1280 × 720 é ampliada para preencher o quadro, o resultado avisa, e ela pode ficar menos nítida. Comece com uma imagem de pelo menos 1280 pixels de largura.',
    },
    {
      q: 'É melhor usar 1280 × 720 ou 3840 × 2160?',
      a: 'Os dois são 16:9, então o YouTube aceita qualquer um. O 3840 × 2160 guarda mais detalhe numa tela grande, e o 1280 × 720 faz um arquivo mais leve, que carrega rápido.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Suas imagens viram miniaturas no seu aparelho e nunca são enviadas a um servidor.',
  relatedHeading: 'Mais ferramentas de imagem',
  panel: {
    formats: 'JPG, PNG ou WebP',
    progressLabel: 'Fazendo as miniaturas',
    done: 'Prontinho! Sua miniatura está em 1280 × 720.',
    doneMany: 'Prontinho! Suas {count} miniaturas estão em 1280 × 720.',
    options: {
      note: 'Cada imagem sai como um JPG de 1280 × 720, cortado a partir do centro para preencher o 16:9. Use antes a ferramenta Cortar imagem para escolher a parte que fica.',
    },
  },
} satisfies ImageToolTexts<PresetOptionsTexts>;
