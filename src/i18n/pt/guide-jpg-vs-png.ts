import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'JPG ou PNG: qual usar, medido nas mesmas fotos',
  description: 'Quando salvar em JPG e quando em PNG, com os tamanhos que medimos nas mesmas fotos nos dois formatos e o que acontece com uma imagem transparente.',
  h1: 'JPG ou PNG: qual usar',
  lead: 'Os dois formatos abrem em qualquer lugar, então a escolha depende do que a imagem é. Veja a regra e o que medimos quando as mesmas fotos foram de um formato para o outro.',
  changed: 'Primeira versão deste guia, publicada em {published} com as medidas de {measured}.',
  intro: [
    'A resposta curta: foto vai em JPG, e imagem gráfica vai em PNG. Capturas de tela, logos, gráficos, textos e qualquer imagem com fundo transparente são imagens gráficas. Uma foto tirada com câmera ou celular é foto, mesmo que mostre um documento.',
    'A resposta longa fala do que cada formato guarda. Um fica pequeno jogando fora detalhes que você mal percebe; o outro guarda cada pixel exatamente e paga por isso em tamanho. A troca certa depende da imagem e do que vai acontecer com ela depois.',
  ],
  toolHeading: 'Troque entre PNG e JPG aqui',
  toolIntro: 'Solte um PNG e ele vira JPG; solte um JPG e ele vira PNG. Cada arquivo é convertido nesta aba do navegador, então nada é enviado, e um lote volta num só ZIP.',
  sections: [
    {
      heading: 'Como cada formato guarda uma imagem',
      paragraphs: [
        'O PNG é sem perda. A especificação dele, publicada pelo W3C, diz que a compressão deve preservar toda a informação, e o formato aceita um canal alfa opcional, que é onde fica a transparência. Um PNG aberto e salvo de novo é a mesma imagem, pixel por pixel.',
        'O JPG é com perda. O comitê JPEG descreve esse formato como uma compressão com perda baseada em DCT: ele divide a imagem em blocos pequenos e guarda as formas e as cores gerais de cada um, jogando fora os detalhes finos que o olho menos percebe. É por isso que uma foto fica bem menor em JPG, e é por isso que bordas nítidas e cores chapadas podem mostrar pequenas manchas em volta.',
      ],
    },
    {
      heading: 'Uma foto salva em PNG fica maior, não melhor',
      paragraphs: [
        'Pegamos as nossas {photos_wordf} fotos de celular de verdade, que saíram das câmeras em JPG, e salvamos em PNG com a ferramenta acima. Juntos, os JPGs pesavam {jpgTotal}. Em PNG, pesaram {pngTotalChromium} no Chromium, {pngRatioChromium_times} o peso dos JPGs.',
        'Os PNGs não ficaram nem um pouco melhores. Cada um guardou exatamente os mesmos pixels do JPG de onde veio: comparamos pixel por pixel, e {pngIdenticalChromium_word} deles eram idênticos. Um PNG não traz de volta o detalhe que a câmera já jogou fora quando gravou o JPG. Ele só guarda o que sobrou, sem perder mais nada.',
      ],
    },
    {
      heading: 'Cada navegador grava o PNG de um jeito',
      paragraphs: [
        'As mesmas fotos salvas em PNG no WebKit pesaram {pngTotalWebkit}, {pngRatioWebkit_times} o peso dos JPGs, contra {pngRatioChromium_times} no Chromium. Os dois PNGs guardam exatamente os mesmos pixels. A diferença está só no esforço de cada navegador para compactar esses pixels, o que mostra que dois PNGs da mesma imagem podem ter tamanhos bem diferentes e continuar sendo a mesma imagem.',
      ],
    },
    {
      heading: 'De volta ao JPG: perto, mas não igual',
      paragraphs: [
        'Depois salvamos esses PNGs de volta em JPG. Os JPGs novos pesaram {backTotalChromium}, menos que os originais das câmeras, porque a ferramenta salva numa qualidade alta, mas não tão alta quanto a das câmeras.',
        'Eles não são os arquivos originais, nem exatamente as imagens originais. Comparada com os pixels originais, a ida e volta ficou entre {backPsnrMinChromium} e {backPsnrMaxChromium} de PSNR, uma medida de quanto duas imagens se parecem. Nesse nível as diferenças são muito difíceis de ver, mas cada salvamento com perda acrescenta um pouco mais. Guarde seus originais e converta a partir deles.',
      ],
    },
    {
      heading: 'A transparência decide',
      paragraphs: [
        'O JPG não tem transparência. Nosso PNG de teste tem cantos transparentes, {transparentCornersBefore_word} ao todo, e no JPG os {transparentCornersWhiteChromium_word} ficaram brancos, como a ferramenta avisa ao lado do arquivo. O arquivo foi de {transparentPngBytes} para {transparentJpgBytesChromium}.',
        'Isso não é problema para uma imagem que fica sobre uma página branca, mas é errado para um logo que precisa ficar sobre um fundo colorido ou em cima de uma foto. Se a imagem tem uma transparência que você quer manter, deixe em PNG.',
      ],
    },
    {
      heading: 'Uma regra para guardar',
      paragraphs: [
        'Use JPG para as fotos que você compartilha, manda por e-mail ou envia a um site, principalmente quando o tamanho importa. Use PNG para capturas de tela, textos, logos, ícones e tudo o que tem transparência, e para uma imagem que você vai editar várias vezes, já que cada salvamento em JPG perde um pouco.',
        'Quando um site não aceita o seu PNG, ou uma foto em PNG fica grande demais para mandar, converta para JPG. Quando uma imagem gráfica precisa continuar nítida, não converta para JPG.',
      ],
    },
    {
      heading: 'E o WebP?',
      paragraphs: [
        'O WebP faz os dois papéis. O Google o descreve como um formato com compressão com perda, como o JPG, e sem perda e com transparência, como o PNG. Os sites usam esse formato porque ele é leve. Ele abre nos navegadores, mas alguns apps e formulários ainda recusam o arquivo; o nosso guia sobre WebP mostra onde ele abre e como salvar como JPG.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'O que medimos',
  sheet: {
    stats: [
      { label: 'Nossas fotos em PNG, no total', value: '{pngRatioChromium_times}', from: '{jpgTotal}', to: '{pngTotalChromium}' },
      { label: 'PNGs com os mesmos pixels do JPG', value: '{pngIdenticalChromium} de {photos}' },
    ],
    sample: '{photos} fotos de celular, de JPG para PNG e de volta.',
    link: 'Veja a tabela',
  },
  tableHeading: 'Foto a foto',
  measuredIntro: 'Nossas {photos_wordf} fotos de celular de verdade, do JPG da câmera para PNG com a ferramenta acima, e de volta para JPG. A última coluna compara o JPG final com os pixels originais.',
  measuredNote: 'Medido em {date} pela página PNG para JPG deste site no Chromium {chromiumVersion} e no WebKit {webkitVersion}, no {system}. Os pixels foram comparados no Node, com o mesmo decodificador para o original e para a cópia. Os tamanhos de volta em JPG foram iguais nos dois navegadores.',
  tables: [
    {
      heading: 'As mesmas fotos nos dois formatos',
      caption: 'Cada foto: o JPG da câmera, o PNG feito a partir dele no Chromium e no WebKit, o JPG feito de volta a partir do PNG e o quanto esse JPG se parece com o original',
      head: ['Foto', 'JPG', 'PNG no Chromium', 'PNG no WebKit', 'De volta em JPG', 'Comparado ao original'],
    },
  ],
  sourcesHeading: 'Fontes',
  sources: [
    { id: 'w3c-png', label: 'W3C: Especificação do formato PNG (em inglês)', href: 'https://www.w3.org/TR/png-3/', read: '2026-11-03' },
    { id: 'google-webp', label: 'Google for Developers: Um formato de imagem para a Web', href: 'https://developers.google.com/speed/webp?hl=pt-br', read: '2026-11-03' },
    { id: 'jpeg-org', label: 'Comitê JPEG: JPEG 1 (em inglês)', href: 'https://jpeg.org/jpeg/', read: '2026-11-03' },
  ],
  facts: {},
  names: ['W3C', 'JPEG 1'],
  relatedHeading: 'Ferramentas e guias relacionados',
};

export default texts;
