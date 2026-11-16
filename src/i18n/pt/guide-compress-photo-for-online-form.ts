// F19b (front T1): guide 1 in Portuguese, a phone photo under the size limit of an online form, with Compress image open
// on Up to a size. The same keys, placeholders, parts and table as the English text; every number is a placeholder of
// data/guides-measured.json, an official figure of `facts` with its source, or a technical name of `names`
// (tests/unit/guides-numbers.test.ts). The counts in words of photos are feminine here (fotos).
import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Foto para formulário online: como deixá-la dentro do limite de tamanho',
  description: 'O que um limite em KB conta e o que nossas fotos de celular perderam, em pixels e em qualidade, para ficar abaixo dele na Comprimir imagem.',
  h1: 'Como fazer a foto caber no limite de um formulário',
  lead: 'O que conta um limite em KB e o que nossas fotos de celular perderam, em pixels e em qualidade, para caber nele.',
  changed: 'Primeira versão deste guia, publicada em {published}.',
  intro: [
    'Um formulário que pede uma foto e põe um limite de tamanho recusa o arquivo que passa dele, por melhor que a foto seja. Nossas {photos_wordf} fotos de celular de verdade pesam de {photoMin} a {photoMax}: cada uma pesa várias vezes o que cabe num limite de {limit500}, e muito mais que {limit100}.',
    'Para ficar abaixo de um limite, um JPG pode abrir mão de qualidade, de pixels ou dos dois. Passamos cada foto pela opção "Até um tamanho" com {limit100}, {limit200} e {limit500} e lemos o que saiu: os bytes, a largura e a altura, e a qualidade que o codificador usou. Todos os arquivos couberam. Com {limit100} e {limit200}, todas as fotos também perderam pixels.',
  ],
  toolHeading: 'Faça sua foto caber no limite',
  toolIntro: 'O painel abre em "Até um tamanho". Digite o limite do seu formulário em KB e solte a foto: o resultado mostra o tamanho novo do arquivo e, quando a foto precisou encolher, a largura e a altura novas.',
  sections: [
    {
      heading: 'O que um limite em KB conta',
      paragraphs: [
        'Um limite em quilobytes é um limite para os bytes do arquivo, não para a largura e a altura dele. A Comprimir imagem conta um quilobyte como {kilo} bytes, como diz a tabela da ferramenta, e é isso que o prefixo quilo quer dizer no Sistema Internacional de Unidades. Na ferramenta, um limite de {limit100} equivale a {limit100_exact}.',
        'Um quilobyte também pode ser lido do jeito binário. O NIST, o instituto de padrões dos Estados Unidos, conta que o pessoal da computação passou a usar quilo para dizer {kibi}. Para acabar com a confusão, a IEC deu nomes próprios aos múltiplos binários em {iecDate}, e kibi, escrito Ki, vale {kibi}.',
        'O formulário pode não dizer qual leitura usa, e a menor é a segura. Um arquivo de no máximo {limit100_exact} fica abaixo de {limit100} do jeito que o formulário contar, porque {limit100} binários comportam um pouco mais. Um gerenciador de arquivos que conta do jeito binário também mostra o arquivo com menos quilobytes que a ferramenta: essa diferença é da contagem, não do arquivo.',
      ],
    },
    {
      heading: 'O que aconteceu em cada limite',
      paragraphs: [
        'Com {limit100}, as {photos_wordf} fotos couberam, de {at100MinChromium_exact} a {at100MaxChromium_exact}, e as {photos_wordf} perderam pixels. A foto do Pixel 2 foi de {pixelWidth} × {pixelHeight} para {pixelAt100WidthChromium} × {pixelAt100HeightChromium}; a do iPhone 6 saiu com {iphone6At100WidthChromium} × {iphone6At100HeightChromium}, quando antes tinha {iphone6Width} × {iphone6Height}.',
        'Com {limit200}, as fotos perderam menos pixels, mas ainda perderam alguns. A do iPhone 6 saiu com {iphone6At200WidthChromium} × {iphone6At200HeightChromium}, em {iphone6At200Chromium_exact}, a poucas centenas de bytes do limite.',
        'Com {limit500}, só {at500KeptChromium_wordf} foto de {photos_wordf} manteve o tamanho original: a do iPhone 5, com {iphone5Width} × {iphone5Height}, em {iphone5At500Chromium_exact}. A do Pixel 2 ainda saiu com {pixelAt500WidthChromium} × {pixelAt500HeightChromium}, e a do iPhone 6 também perdeu pixels, por um motivo que a próxima parte explica.',
      ],
    },
    {
      heading: 'Como "Até um tamanho" fica abaixo do limite',
      paragraphs: [
        'Pela tabela da ferramenta, "Até um tamanho" baixa a qualidade primeiro, e as dimensões só se precisar. A página não mostra a qualidade, então nós a lemos nos próprios arquivos.',
        'Com {limit100} e {limit200}, essa ordem valeu na nossa amostra: nenhuma das {photos_wordf} fotos caberia no tamanho original em nenhuma das qualidades que a ferramenta usa, então as dimensões tiveram de cair. Com {limit500}, ela não valeu inteira. A foto do iPhone 6 saiu com {iphone6At500WidthChromium} × {iphone6At500HeightChromium} e qualidade {iphone6At500QualityChromium}, embora a foto inteira coubesse na qualidade {iphone6At500FullQuality}: a ferramenta segurou a qualidade mais alta e cedeu pixels.',
        'A foto do iPhone 5 mostra o outro lado. Ela manteve o tamanho original na qualidade {iphone5At500QualityChromium} e usou a menor parte do limite na nossa amostra, {at500FillMinChromium}. No tamanho original, essa foto caberia até a qualidade {iphone5At500FullQuality}, então a ferramenta parou abaixo do que o limite permitia.',
      ],
    },
    {
      heading: 'Um limite maior comprou pixels, não qualidade',
      paragraphs: [
        'Na nossa amostra, um limite maior não comprou um JPG de aparência melhor: comprou uma foto maior. A foto do Pixel 2 saiu na qualidade {pixelAt100QualityChromium} no limite de {limit100}, {pixelAt200QualityChromium} no de {limit200} e {pixelAt500QualityChromium} no de {limit500}, enquanto a largura dela cresceu de {pixelAt100WidthChromium} para {pixelAt200WidthChromium} e depois para {pixelAt500WidthChromium} pixels.',
        'Nas {photos_wordf} fotos, a qualidade com {limit100} foi de {at100QualityMinChromium} a {at100QualityMaxChromium}, e com {limit500}, de {at500QualityMinChromium} a {at500QualityMaxChromium}. As faixas se sobrepõem: aqui, um limite menor nem sempre quis dizer uma qualidade menor, mas quis dizer menos pixels em todas as fotos. Se a sua foto precisa mostrar letras pequenas, como as de um documento ou de um cartão, olhe a largura e a altura novas: com menos pixels, a letra pequena fica mais difícil de ler.',
      ],
    },
    {
      heading: 'Quando o formulário também pede pixels',
      paragraphs: [
        'A opção "Até um tamanho" escolhe as dimensões sozinha, então não entrega uma largura e uma altura que o formulário determine. Se o formulário pede um tamanho exato em pixels, acerte isso antes na Redimensionar imagem e depois traga a foto redimensionada para o painel acima, para cuidar do tamanho do arquivo.',
        'A Redimensionar imagem trava a proporção e encaixa a foto dentro da largura e da altura que você digitar, então uma foto de outro formato sai menor de um lado. Para um quadrado, ou outro formato fixo, corte antes a foto nesse formato com a Cortar imagem e depois redimensione.',
        'Se a foto redimensionada ainda passar do limite, "Até um tamanho" pode tirar mais pixels, e a foto perde o tamanho que você definiu. Compare a largura e a altura do resultado com o que o formulário pede antes de enviar.',
      ],
    },
    {
      heading: 'Antes de enviar a foto',
      paragraphs: [
        'Veja o formato que o formulário pede. "Até um tamanho" entrega um JPG, e as áreas transparentes de um PNG ficam brancas, então ela serve a um formulário que quer JPG ou JPEG. A Comprimir imagem aceita JPG, PNG e WebP, então uma foto de iPhone salva em HEIC passa antes pela HEIC para JPG.',
        'Digite o limite que o formulário dá, do jeito que está, porque a ferramenta já usa a leitura menor. Se mesmo assim o formulário recusar o arquivo, ele pode pesar o arquivo do próprio jeito: digite um limite menor e tente de novo.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'O que medimos',
  sheet: {
    stats: [
      { label: 'Pixel 2 no limite de {limit100}', value: '{pixelAt100ShareChromium_change}', from: '{pixelBytes}', to: '{pixelAt100Chromium}' },
      { label: 'Fotos inteiras no limite de {limit500}', value: '{at500KeptChromium} de {photos}' },
    ],
    sample: '{photos} fotos de celular, cada uma comprimida até {limit100}, {limit200} e {limit500}.',
    link: 'Veja a tabela',
  },
  tableHeading: 'Foto a foto, limite a limite',
  measuredIntro: 'Cada uma das nossas {photos} fotos de celular de verdade passou sozinha por "Até um tamanho", uma vez em cada limite. A última coluna é a qualidade mais alta em que a foto caberia no limite sem perder nenhum pixel. "Nada" quer dizer que nem a qualidade mais baixa que a ferramenta usa bastaria.',
  measuredNote: 'Medido em {date} pela página Comprimir imagem deste site no Chromium {chromiumVersion} e no WebKit {webkitVersion}, no {system}; a tabela mostra o Chromium. A qualidade foi lida no Node nas tabelas de quantização de cada JPG, que batem com o codificador do site em uma qualidade só, e a última coluna vem desse codificador, rodado no Node. O WebKit deu a mesma largura e a mesma altura em {sameDimensions} dos {outputs} arquivos; nele, a foto do iPhone 6 com {limit100} saiu com {iphone6At100WidthWebkit} × {iphone6At100HeightWebkit}.',
  tables: [
    {
      heading: 'Cada foto em cada limite',
      caption: 'Cada foto de celular em cada limite, no Chromium: os bytes do JPG, a largura e a altura, a qualidade a que ele chegou e a qualidade mais alta que teria mantido todos os pixels',
      head: ['Limite', 'Foto', 'Arquivo', 'Dimensões em pixels', 'Qualidade alcançada', 'Tamanho original cabe até a qualidade'],
    },
  ],
  sourcesHeading: 'Fontes',
  sources: [
    { id: 'nist-binary', label: 'NIST: Definições das unidades do SI: os prefixos binários (em inglês)', href: 'https://physics.nist.gov/cuu/Units/binary.html', read: '2026-11-16' },
  ],
  facts: {
    kilo: { text: '1.000', source: 'nist-binary' },
    kibi: { text: '1.024', source: 'nist-binary' },
    iecDate: { text: 'dezembro de 1998', source: 'nist-binary' },
  },
  names: ['Pixel 2', 'iPhone 6', 'iPhone 5'],
  relatedHeading: 'Ferramentas e guias relacionados',
};

export default texts;
