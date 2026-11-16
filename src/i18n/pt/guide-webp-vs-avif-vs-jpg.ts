import type { FileGuideTexts } from '../types.ts';

// F19b (front T2): guide 2 in Portuguese, the English text of the front E2 adapted with docs/i18n/pt.md. Every number is
// a placeholder of data/guides-measured.json, an official figure of `facts` (MDN, whose page has no version in Portuguese,
// so the label says "em inglês") or a technical name of `names`. The formats keep the masculine article ("o WebP").
const texts: FileGuideTexts = {
  title: 'WebP, AVIF ou JPG: quando usar cada um, medido nas nossas fotos',
  description: 'Quanto as mesmas fotos de celular pesaram em JPG, WebP e AVIF, qual formato manteve o fundo transparente e quando usar cada um.',
  h1: 'WebP, AVIF ou JPG: quando usar cada um',
  lead: 'As mesmas fotos em cada formato: quanto cada cópia pesou, qual manteve o fundo transparente e quando escolher cada um.',
  changed: 'Primeira versão deste guia, publicada em {published}.',
  intro: [
    'O JPG, o WebP e o AVIF guardam uma foto deixando de fora detalhes difíceis de ver, e é assim que o arquivo fica pequeno. O WebP e o AVIF vêm do vídeo: o MDN descreve o WebP com perda como baseado no codec de vídeo VP8, e o AVIF como um formato de arquivo para imagens codificadas em AV1, um formato criado primeiro para vídeo. Os dois também salvam uma imagem sem perda, e os dois podem guardar um fundo transparente. O JPG não tem transparência nenhuma.',
    'Então, qual usar? Mande um JPG quando você não sabe o que vai abrir o arquivo. Use WebP ou AVIF nas imagens de um site que você mantém, com um formato de reserva no lugar, e numa imagem gráfica com fundo transparente, quando o arquivo precisa ficar leve. Para ver quanto essa escolha pesa, pegamos as nossas {photos_wordf} fotos de celular de verdade, que saíram das câmeras em JPG, e salvamos cada uma de novo em JPG com o Comprimir imagem e em WebP e em AVIF com o Converter para WebP, sempre na compressão Recomendada, que é a padrão. Fizemos o mesmo com um PNG que tem os cantos transparentes.',
  ],
  toolHeading: 'Crie imagens WebP ou AVIF aqui',
  toolIntro: 'Solte imagens JPG ou PNG e cada uma volta em WebP. Escolha o formato AVIF para ter um AVIF, e a compressão Forte para o menor arquivo.',
  sections: [
    {
      heading: 'Quanto as mesmas fotos pesaram',
      paragraphs: [
        'Juntos, os originais das câmeras pesavam {originalTotal}. Salvos de novo em JPG pelo Comprimir imagem, ficaram com {jpgTotalChromium}, {jpgRatioChromium} dos originais. Essa primeira queda não tem nada a ver com o formato: é o mesmo formato, salvo de novo na compressão Recomendada. Em WebP, as fotos pesaram {webpTotalChromium}, e em AVIF, {avifTotalChromium}, {avifRatioChromium} dos originais.',
        'Comparadas com as cópias em JPG, as cópias em WebP ficaram {webpVsJpgChromium_off} mais leves, e as em AVIF, {avifVsJpgChromium_off} mais leves, o que também põe o AVIF {avifVsWebpChromium_off} abaixo do WebP. Foto a foto, a ordem não mudou: o AVIF foi a menor cópia de cada foto, e o WebP ficou entre ele e o JPG. As proporções mudaram de uma foto para outra: cada AVIF ficou entre {avifRatioMinChromium} e {avifRatioMaxChromium} do seu original, e cada WebP, entre {webpRatioMinChromium} e {webpRatioMaxChromium}.',
      ],
    },
    {
      heading: 'Tamanhos na opção padrão, não na mesma aparência',
      paragraphs: [
        'Esses tamanhos comparam configurações, não cópias de qualidade igual. A Recomendada é a opção padrão das duas ferramentas, e ficamos com ela: não ajustamos nenhuma das duas até as cópias ficarem parecidas, e não medimos o quanto cada cópia se parece com o original.',
        'O MDN compara os formatos num nível de compressão visualmente parecido e diz que o WebP com perda fica, em média, de {mdnWebpSmaller} menor que o JPEG, e o AVIF com perda, cerca de {mdnAvifSmaller} menor. As nossas fotos foram na mesma direção, com o AVIF à frente do WebP, mas {photos_wordf} fotos na opção padrão não servem de teste para esses números. Outra foto pode chegar a outras proporções, como as nossas chegaram entre si.',
      ],
    },
    {
      heading: 'Convertendo com a ferramenta acima',
      paragraphs: [
        'O Converter para WebP recebe imagens JPG e PNG e devolve um WebP, ou um AVIF, se você escolher esse formato. A Recomendada é a opção que medimos. A Forte faz o menor arquivo, e essa nós não medimos; teste as duas numa imagem sua e fique com a que ainda parecer boa para você.',
        'Converta a partir do arquivo original sempre que você o tiver. Cada salvamento com perda deixa de fora um pouco mais de detalhe, então um WebP feito do original da câmera guarda mais do que um feito de um JPG já espremido para caber num e-mail. Guarde esse original também: um WebP que algum programa recusa pode voltar a ser JPG, mas sem o detalhe que a conversão deixou de fora.',
      ],
    },
    {
      heading: 'Transparência: onde o JPG fica de fora',
      paragraphs: [
        'O MDN observa que o JPEG não tem canal alfa, a parte do arquivo de imagem que guarda a transparência, então um conversor precisa preencher as áreas transparentes com uma cor. Nosso PNG de teste tem {pngClearCorners_word} cantos transparentes e pesava {pngBytes}. Na Recomendada, o Comprimir imagem mantém um PNG como PNG, então fizemos o JPG dele com o PNG para JPG, a ferramenta para esse trabalho. O JPG pesou {pngJpgBytesChromium}, todos os cantos ficaram brancos, e a ferramenta avisou isso ao lado do arquivo.',
        'Já o Converter para WebP manteve a transparência. O WebP pesou {pngWebpBytesChromium} e o AVIF, {pngAvifBytesChromium}, e nos dois todos os cantos que eram transparentes no PNG continuaram transparentes. Para um logo ou um recorte que precisa ficar sobre um fundo colorido, essa é a diferença entre uma borda limpa e uma caixa branca, e essas cópias pesaram {pngWebpRatioChromium} e {pngAvifRatioChromium} do PNG de onde vieram.',
      ],
    },
    {
      heading: 'Onde cada formato abre',
      paragraphs: [
        'Nos navegadores, o MDN lista o JPG em todas as versões do Chrome, do Edge, do Firefox, do Opera e do Safari, e o WebP em todas as versões dos mesmos navegadores, com uma condição no Mac: o {webpSafari} ou mais novo, no {webpMacos} ou mais novo. Para o AVIF, as primeiras versões que ele lista são {avifVersions}.',
        'O navegador não é o único lugar para onde uma imagem vai. Um formulário de envio, um programa de e-mail, uma gráfica ou um editor de fotos mais antigo pode aceitar só JPG ou PNG, e um arquivo recusado ali não serve para nada. Na web, o MDN recomenda um formato de reserva para os dois formatos mais novos: um JPEG ou PNG atrás de um WebP, e um WebP, JPEG ou PNG atrás de um AVIF, oferecidos com o elemento picture.',
      ],
    },
    {
      heading: 'Qual usar',
      paragraphs: ['Nenhum formato ganha em todo lugar. O que decide é para onde o arquivo vai depois e o que ele precisa guardar.'],
      list: [
        'JPG, para uma foto que sai das suas mãos: um anexo, um formulário de envio, um pedido de impressão, um app que você nunca testou. Foi a cópia mais pesada de cada uma das nossas fotos, e ele não guarda transparência.',
        'WebP, quando você controla onde a imagem aparece e pode deixar um JPG ou PNG atrás dela, e para um logo que precisa da transparência. Nas nossas fotos, ficou entre o AVIF e o JPG.',
        'AVIF, quando o menor arquivo é o que mais importa e há um formato de reserva no lugar. No PNG e em cada foto, o arquivo dele saiu mais leve que o dos outros formatos.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'O que medimos',
  sheet: {
    stats: [
      { label: 'WebP contra JPG, nas mesmas fotos', value: '{webpVsJpgChromium_change}', from: '{jpgTotalChromium}', to: '{webpTotalChromium}' },
      { label: 'AVIF contra JPG, nas mesmas fotos', value: '{avifVsJpgChromium_change}', from: '{jpgTotalChromium}', to: '{avifTotalChromium}' },
    ],
    sample: '{photos} fotos de celular, cada uma salva em JPG, WebP e AVIF.',
    link: 'Veja a tabela',
  },
  tableHeading: 'Foto a foto',
  measuredIntro: 'A primeira tabela traz as nossas {photos_wordf} fotos de celular, e a segunda, o nosso PNG com os cantos transparentes. Ao lado de cada tamanho está a parte que ele representa do arquivo de onde veio.',
  measuredNote: 'Medido em {date} nas páginas deste site do Comprimir imagem, do Converter para WebP e do PNG para JPG, no Chromium {chromiumVersion} e no WebKit {webkitVersion}, no {system}. Nas fotos, os dois navegadores gravaram os mesmos bytes em todos os formatos. No PNG houve uma pequena diferença: no WebKit, o JPG, o WebP e o AVIF dele pesaram {pngJpgBytesWebkit}, {pngWebpBytesWebkit} e {pngAvifBytesWebkit}, e as tabelas mostram o Chromium. A transparência foi conferida no Node, nos próprios arquivos: no canal alfa do WebP e do AVIF e nos pixels dos cantos de cada cópia.',
  tables: [
    {
      heading: 'As nossas fotos em cada formato',
      caption: 'Cada foto de celular: o original da câmera, depois o JPG do Comprimir imagem e o WebP e o AVIF do Converter para WebP, na compressão Recomendada, no Chromium, cada um com a sua parte do original',
      head: ['Foto', 'Original', 'JPG', 'WebP', 'AVIF'],
    },
    {
      heading: 'O PNG com os cantos transparentes',
      caption: 'O PNG com os cantos transparentes salvo em JPG pelo PNG para JPG e em WebP e AVIF pelo Converter para WebP, no Chromium: o tamanho com a parte do PNG e se a transparência ficou',
      head: ['Salvo como', 'Tamanho', 'Transparência mantida'],
      labels: ['JPG', 'WebP', 'AVIF'],
    },
  ],
  sourcesHeading: 'Fontes',
  sources: [
    { id: 'mdn', label: 'MDN: Guia de tipos e formatos de arquivo de imagem (em inglês)', href: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types', read: '2026-11-16' },
  ],
  facts: {
    mdnWebpSmaller: { text: '25% a 35%', source: 'mdn' },
    mdnAvifSmaller: { text: '50%', source: 'mdn' },
    webpSafari: { text: 'Safari 14', source: 'mdn' },
    webpMacos: { text: 'macOS Big Sur (11)', source: 'mdn' },
    avifVersions: { text: 'o Chrome 85, o Edge 121, o Opera 71, o Firefox 93 e o Safari 16.1', source: 'mdn' },
  },
  names: ['VP8', 'AV1'],
  relatedHeading: 'Ferramentas e guias relacionados',
};

export default texts;
