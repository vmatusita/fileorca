import type { CompressOptionsTexts, ImageToolTexts } from '../../../i18n/types.ts';

// Blocos da página Comprimir imagem (data-content: how, specs, faq, privacy, related) e os textos do painel
// que a ilha compartilhada mostra. As linhas de especificação dizem o que o motor faz de verdade
// (src/engine/image/): se a qualidade ou os codificadores mudarem lá, mude aqui. Desde a F6 todas as ferramentas
// de imagem e os presets existem em português, então a página também mostra a tabela dos presets.
export default {
  title: 'Comprimir imagem online, grátis, sem upload',
  description:
    'Comprima imagens JPG, PNG e WebP no navegador, uma ou várias de uma vez. Nada é enviado, e os metadados da foto, inclusive a localização GPS, são removidos.',
  h1: 'Comprimir imagem',
  howHeading: 'Como funciona',
  howSteps: [
    'Solte as imagens na caixa, escolha os arquivos ou cole as imagens.',
    'Escolha Recomendada ou Forte, ou "Até um tamanho" e digite o máximo em KB. A Oli comprime cada imagem, uma depois da outra, e refaz o lote se você mudar o nível.',
    'Baixe as imagens comprimidas.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Comprimir imagem recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Formatos aceitos', 'JPG, PNG e WebP. A Oli confere o que há dentro do arquivo, não o nome dele.'],
      ['JPG', 'Salvo de novo com o MozJPEG, um codificador feito para gerar JPGs menores.'],
      ['PNG', 'Otimizado com o OxiPNG, sem perder qualidade. Recomendada e Forte não mudam o PNG; "Até um tamanho" o transforma em JPG.'],
      ['WebP', 'Salvo de novo como WebP, na qualidade de Recomendada ou Forte; "Até um tamanho" o transforma em JPG.'],
      ['Recomendada', 'JPG e WebP com qualidade 75: o melhor equilíbrio entre tamanho e aparência.'],
      ['Forte', 'JPG e WebP com qualidade 55: o menor arquivo, com alguma perda nos detalhes finos.'],
      ['Até um tamanho', 'Cada imagem sai como um JPG do tamanho que você digitar ou menos (1 KB = 1.000 bytes), de 20 a 10.000 KB. A Oli baixa a qualidade primeiro, e as dimensões só se precisar. A transparência fica branca.'],
      ['Lote', 'Sem limite de imagens. Várias imagens são baixadas juntas num só ZIP.'],
      ['Já está pequeno', 'Se a cópia nova não ficar menor, você recebe o original de volta, sem os metadados da foto.'],
      ['Metadados da foto', 'Modelo da câmera, data e localização GPS saem de todos os arquivos.'],
    ],
  },
  presets: {
    heading: 'Comprimir para um tamanho certo',
    lead: 'Para qualquer outro limite, use "Até um tamanho" acima.',
    caption: 'Ajustes prontos da Comprimir imagem e o que cada um faz',
    head: ['Ajuste pronto', 'O que faz'],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Comprimir diminui a qualidade da imagem?',
      a: 'No JPG e no WebP um pouco de detalhe se perde, porque o arquivo é salvo de novo com parte da informação de fora. Na Recomendada a diferença é difícil de notar no tamanho normal, e a comparação de antes e depois do resultado mostra a diferença de perto. O arquivo original nunca é alterado, então dá para voltar a ele sempre que quiser.',
    },
    {
      q: 'Por que meu PNG quase não diminui?',
      a: 'Uma foto em PNG fica grande porque as pequenas mudanças de cor são difíceis de compactar, e a Oli só arruma o arquivo, o que costuma economizar um pouco. Se for uma foto e você não precisa de transparência, a PNG para JPG ou a Converter para WebP costuma dar um arquivo bem menor.',
    },
    {
      q: 'Por que o arquivo voltou com o mesmo tamanho?',
      a: 'Algumas imagens já vêm bem comprimidas pelo celular, pela câmera ou pelo app que as salvou, então sobra pouco para tirar.',
    },
    {
      q: 'Posso comprimir uma foto do iPhone em HEIC?',
      a: 'Aqui não. Primeiro transforme o HEIC em JPG com a ferramenta HEIC para JPG, e depois comprima o JPG se quiser que ele fique menor. Um AVIF passa pela ferramenta AVIF para JPG do mesmo jeito.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'As imagens são processadas no seu aparelho e nunca são enviadas a um servidor.',
  relatedHeading: 'Mais ferramentas de imagem',
  panel: {
    formats: 'JPG, PNG ou WebP',
    progressLabel: 'Comprimindo as imagens',
    done: 'Prontinho! Sua imagem ficou {percent} mais leve.',
    doneMany: 'Prontinho! Suas {count} imagens ficaram {percent} mais leves.',
    placardLabel: 'mais leve',
    adjustHelp: 'Mudar o nível refaz a imagem na hora.',
    options: {
      legend: 'Compressão',
      recommended: 'Recomendada',
      recommendedHelp: 'melhor equilíbrio',
      strong: 'Forte',
      strongHelp: 'menor tamanho',
      pngNote: 'O PNG é salvo sem perda, então o nível só muda JPG e WebP.',
      // F15 (PLANO-UX-QV, seção D; DECISOES § 656 e § 660): a terceira escolha e o campo dela.
      size: 'Até um tamanho',
      sizeHelp: 'limite em KB',
      maxLabel: 'Tamanho máximo',
      kb: 'KB',
      maxHelp: 'Cada imagem sai como um JPG desse tamanho ou menos, e a transparência fica branca. Uma imagem que já cabe volta igual, só sem os metadados da foto.',
      maxInvalid: 'Digite um número inteiro de {min} a {max}.',
      upTo: 'Até {n} KB',
    },
  },
} satisfies ImageToolTexts<CompressOptionsTexts>;
