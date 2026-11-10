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
    'Solte as imagens JPG, PNG ou WebP na caixa, escolha os arquivos ou cole as imagens. Quantas quiser.',
    'Escolha Recomendada ou Forte, ou "Até um tamanho" com o máximo em KB. A Oli comprime cada imagem no seu navegador, uma depois da outra, e refaz o lote se você mudar o nível.',
    'Baixe uma imagem ou todas juntas num ZIP. Os arquivos originais continuam intactos.',
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
      ['HEIC e AVIF', 'Não são comprimidos aqui. Transforme o HEIC em JPG antes, com a ferramenta HEIC para JPG, e o AVIF, com a ferramenta AVIF para JPG.'],
    ],
  },
  presets: {
    heading: 'Comprimir para um tamanho certo',
    lead: 'Para qualquer outro limite, escolha "Até um tamanho" acima e digite o máximo em KB, de 20 a 10.000.',
    caption: 'Ajustes prontos da Comprimir imagem e o que cada um faz',
    head: ['Ajuste pronto', 'O que faz'],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Comprimir diminui a qualidade da imagem?',
      a: 'No JPG e no WebP um pouco de detalhe se perde, porque o arquivo é salvo de novo com parte da informação de fora. Na compressão Recomendada a diferença é difícil de notar no tamanho normal, e a Forte troca mais detalhe pelo menor arquivo possível. O PNG não perde nada, porque a Oli o salva sem perda. O arquivo original nunca é alterado, então dá para voltar a ele sempre que quiser.',
    },
    {
      q: 'Como deixo uma imagem dentro de um limite, como 200 KB?',
      a: 'Escolha "Até um tamanho" e digite o limite no campo "Tamanho máximo", em KB. A Oli deixa cada imagem desse tamanho ou menos, em JPG. Um formulário que conta 1 KB como 1.024 bytes também a aceita, porque a Oli conta 1 KB como 1.000 bytes, a leitura menor. Um PNG com transparência ganha fundo branco.',
    },
    {
      q: 'Por que meu PNG quase não diminui?',
      a: 'O PNG guarda cada pixel exatamente como está, então sobra pouco para tirar, e uma foto em PNG fica grande porque as pequenas mudanças de cor são difíceis de compactar. A Oli só arruma o arquivo, o que costuma economizar um pouco. Se for uma foto e você não precisa de transparência, salvar como JPG ou WebP costuma dar um arquivo bem menor.',
    },
    {
      q: 'O que acontece com a localização GPS da minha foto?',
      a: 'A Oli salva cada cópia comprimida só a partir dos pixels, então a localização GPS, o modelo da câmera e a data da foto não vão para o arquivo novo. Vale também quando o original volta sem mudança por já estar pequeno: essa cópia também sai sem os metadados da foto.',
    },
    {
      q: 'Dá para comprimir várias imagens de uma vez?',
      a: 'Dá. Solte ou cole quantas imagens quiser: a Oli comprime uma depois da outra, e cada uma ganha o próprio download. Para levar todas, um botão entrega um ZIP. Um lote grande de fotos pesadas demora mais no celular do que no computador, porque quem faz o trabalho é o seu aparelho.',
    },
    {
      q: 'Minha imagem é enviada para algum lugar?',
      a: 'Não. A compressão acontece no seu aparelho, dentro do navegador. Abra a aba Rede do navegador enquanto comprime: nenhuma requisição leva os seus arquivos.',
    },
    {
      q: 'Por que o arquivo voltou com o mesmo tamanho?',
      a: 'Algumas imagens já estão bem comprimidas. Quando a nova cópia não ficaria menor, a Oli devolve o original em vez de um arquivo maior, e essa cópia também sai sem os metadados da foto.',
    },
    {
      q: 'Posso comprimir uma foto do iPhone em HEIC?',
      a: 'Aqui não: a Comprimir imagem aceita JPG, PNG e WebP. Primeiro transforme o HEIC em JPG com a ferramenta HEIC para JPG, e depois comprima o JPG se quiser que ele fique menor.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'As imagens são processadas no seu aparelho e nunca são enviadas a um servidor. Cada cópia salva também deixa de fora os metadados da foto, inclusive a localização GPS.',
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
