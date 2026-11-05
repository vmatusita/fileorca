import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Como abrir imagens WebP e salvar como JPG',
  description: 'O que é um arquivo WebP, onde ele abre sem programa extra e o que muda no tamanho, na animação e na localização quando você o salva como JPG.',
  h1: 'Como abrir imagens WebP e salvar como JPG',
  lead: 'Você salvou uma imagem de um site e recebeu um .webp que seus outros apps não aceitam. Veja onde ele abre e como virar JPG.',
  changed: 'Primeira versão deste guia, publicada em {published} com as medidas de {measured}.',
  intro: [
    'WebP é um formato de imagem criado pelo Google para a web. Os sites usam esse formato porque ele é leve, e as páginas carregam mais rápido. É por isso que uma imagem salva do navegador pode chegar como um arquivo .webp, e não como JPG ou PNG.',
    'O navegador de onde você salvou mostra a imagem sem problema. O problema começa quando o arquivo sai do navegador: um editor de fotos mais antigo, um formulário que pede JPG ou uma gráfica podem recusar o arquivo. Salvar como JPG faz a imagem abrir em quase qualquer lugar, mas não a deixa melhor nem menor.',
  ],
  toolHeading: 'Salve suas imagens WebP como JPG aqui',
  toolIntro: 'Solte um WebP ou um lote inteiro. Cada um vira JPG nesta aba do navegador, então nada é enviado, e um lote volta num só ZIP. Se precisar manter a transparência, escolha PNG.',
  sections: [
    {
      heading: 'O que é um arquivo WebP',
      paragraphs: [
        'O Google descreve o WebP como um formato com compressão com perda e sem perda. O WebP com perda faz o papel do JPG, para fotos; o WebP sem perda faz o papel do PNG, para gráficos e ilustrações. Ele também pode manter a transparência e guardar uma animação, como um GIF.',
        'O Google informa que as imagens WebP com perda são {googleSmaller} menores que imagens JPEG comparáveis, com a mesma qualidade visual. É por isso que os sites preferem esse formato: a mesma imagem custa menos para baixar.',
      ],
    },
    {
      heading: 'Onde o WebP abre sem conversor',
      paragraphs: [
        'Nos aparelhos da Apple, o suporte ao WebP chegou com o Safari 14, que veio com o iOS 14 e o macOS Big Sur 11, segundo as notas de lançamento da Apple. No Windows, a Extensão de Imagem WebP, da Microsoft, permite ver imagens WebP no Explorador de Arquivos do Windows, no aplicativo Fotos e em outros aplicativos do Windows.',
        'Então, se você só precisa ver a imagem, talvez não precise converter nada. Arraste o arquivo para o navegador de onde você o salvou e ele abre. Você precisa de um JPG quando o arquivo tem de ir para algum lugar que não aceita WebP.',
      ],
    },
    {
      heading: 'Como testamos',
      paragraphs: [
        'Pegamos as nossas {photos_wordf} fotos de celular de verdade, salvamos como WebP com o motor deste site, na qualidade padrão de WebP dele, e depois salvamos esses WebP como JPG com a ferramenta acima. Também passamos pela mesma ferramenta um WebP com dados de GPS e um WebP animado.',
        'Nossas cópias em WebP pesaram {webpTotal}, contra {jpgTotal} dos JPGs originais das câmeras. Não tire muita conclusão dessa diferença: as câmeras salvaram os JPGs numa qualidade maior que a das nossas cópias em WebP, então essa não é uma corrida justa entre os formatos. O que ela mostra é quanto as nossas cópias em WebP mantiveram na qualidade do codificador deste site: {webpRatio} do peso dos originais.',
      ],
    },
    {
      heading: 'O JPG fica maior que o WebP',
      paragraphs: [
        'Quando salvamos as cópias em WebP como JPG, os JPGs pesaram {backTotalChromium}, ou seja, {backRatioChromium_times} o peso dos arquivos WebP. O JPG guarda a imagem de um jeito menos compacto que o WebP, e a ferramenta salva numa qualidade alta, então o detalhe que sobrou é mantido, e não espremido de novo.',
        'Os JPGs também pesaram {backVsOriginalChromium} dos JPGs originais das câmeras, e eles se parecem com o WebP, não com o original. Converter não traz de volta o detalhe que o WebP já tinha jogado fora. Se você tem a foto original, use a foto no lugar do WebP.',
      ],
    },
    {
      heading: 'Animação e transparência',
      paragraphs: [
        'Um JPG guarda uma só imagem parada. Nosso WebP animado tem {animatedFrames} quadros, e o JPG ficou só com o primeiro; o resultado avisa isso ao lado do arquivo. Se você precisa da animação, guarde o WebP ou transforme a imagem em vídeo ou GIF com outra ferramenta.',
        'O JPG também não tem transparência. As partes transparentes de um WebP ficam brancas no JPG. Se a imagem é um logo ou um recorte que precisa do fundo transparente, escolha PNG na ferramenta.',
      ],
    },
    {
      heading: 'A localização fica para trás',
      paragraphs: [
        'O formato WebP pode guardar metadados Exif e XMP, segundo a especificação de contêiner do Google, então um WebP pode trazer a posição de GPS e os dados da câmera de uma foto. Nosso WebP de teste com dados de GPS saiu da ferramenta como um JPG com {exifGpsAfterChromium_word} dados de GPS.',
        'Isso acontece porque cada JPG é gravado a partir dos pixels da imagem, e não copiado do arquivo. É o que você quer quando compartilha uma imagem sem os detalhes dela, mas também significa que o JPG é um arquivo novo: guarde o WebP se precisar do original como ele era.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'O que medimos',
  sheet: {
    stats: [
      { label: 'O JPG feito a partir do WebP', value: '{backRatioChromium_times}', from: '{webpTotal}', to: '{backTotalChromium}' },
      { label: 'Comparado aos originais da câmera', value: '{backVsOriginalChromium}', sub: '{backTotalChromium} de {jpgTotal}' },
    ],
    sample: '{photos} fotos de celular, salvas como WebP e de volta como JPG.',
    link: 'Veja a tabela',
  },
  tableHeading: 'Foto a foto',
  measuredIntro: 'Nossas {photos_wordf} fotos de celular de verdade, salvas como WebP pelo motor deste site e depois salvas como JPG com a ferramenta acima. A porcentagem entre parênteses compara com o JPG original da câmera.',
  measuredNote: 'Medido em {date}. As cópias em WebP foram gravadas no Node com o codificador WebP do motor deste site; os JPGs foram feitos pela página WebP para JPG no Chromium {chromiumVersion} e no WebKit {webkitVersion}, no {system}, que deram os mesmos tamanhos. A tabela mostra o Chromium.',
  tables: [
    {
      heading: 'Nossas fotos em WebP e de volta em JPG',
      caption: 'Cada foto: o JPG original, a cópia em WebP e o JPG feito a partir do WebP, com a porcentagem do tamanho original',
      head: ['Foto', 'JPG original', 'Em WebP', 'De volta em JPG'],
    },
  ],
  sourcesHeading: 'Fontes',
  sources: [
    { id: 'google-webp', label: 'Google for Developers: Um formato de imagem para a Web', href: 'https://developers.google.com/speed/webp?hl=pt-br', read: '2026-11-03' },
    { id: 'google-webp-container', label: 'Google for Developers: Especificação de contêiner WebP', href: 'https://developers.google.com/speed/webp/docs/riff_container?hl=pt-br', read: '2026-11-03' },
    { id: 'ms-webp', label: 'Microsoft Store: Extensão de Imagem WebP', href: 'https://apps.microsoft.com/detail/9pg2dk419drg?hl=pt-BR&gl=BR', read: '2026-11-03' },
    { id: 'apple-safari', label: 'Apple Developer: Notas de Lançamento do Safari 14', href: 'https://developer.apple.com/br/documentation/safari-release-notes/safari-14-release-notes', read: '2026-11-03' },
  ],
  facts: {
    googleSmaller: { text: '25% a 34%', source: 'google-webp' },
  },
  names: ['Safari 14', 'iOS 14', 'macOS Big Sur 11'],
  relatedHeading: 'Ferramentas e guias relacionados',
};

export default texts;
