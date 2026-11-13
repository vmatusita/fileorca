import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Como dividir um PDF e por que as partes podem pesar mais que o todo',
  description: 'Por que as partes de um PDF dividido podem somar bem mais que o original, medido nos nossos PDFs de teste, e como dividir para isso não acontecer.',
  h1: 'Como dividir um PDF e por que as partes podem pesar mais que o todo',
  lead: 'Ao dividir um PDF grande, as partes podem somar mais que o arquivo. Veja por que, e quando isso não acontece.',
  changed: 'Primeira versão deste guia, publicada em {published}. Os números foram medidos de novo em {measured}.',
  intro: [
    'Dividir um PDF parece cortar papel: as páginas vão para pilhas separadas e nada é acrescentado. Um PDF não funciona assim. Cada parte precisa ser um PDF completo, que abre em qualquer lugar, então leva tudo de que as páginas dela precisam para aparecer certo, e a Dividir PDF ainda dá a cada parte uma cópia da descrição do documento original.',
    'O quanto isso acrescenta depende do arquivo. Dividimos {files_word} PDFs dos nossos testes, uma parte por página, e somamos as partes. As partes de {bigger_word} deles pesaram mais que o todo: as das notas de aula somaram {bookRatio_times} o original, as do relatório da NASA escaneado ficaram {reportRatio_more} acima dele, e as do PDF de fotos, {photosGrowth_exact} acima.',
  ],
  toolHeading: 'Divida seu PDF aqui',
  toolIntro: 'Solte um PDF, escolha dividir cada página ou digite os intervalos que você quer, e toque no botão. As partes são feitas nesta aba do navegador e vêm juntas num ZIP só; nada é enviado.',
  sections: [
    {
      heading: 'Cada parte é um PDF inteiro',
      paragraphs: [
        'Quando a Dividir PDF faz uma parte, ela começa um PDF novo e copia para ele as páginas dessa parte, com tudo o que essas páginas usam: as fontes, as imagens, os links e os campos de formulário que estão nelas. Uma imagem que aparece numa página só vai para uma parte só. Uma fonte usada em todas as páginas vai para todas as partes.',
        'Esse último ponto explica tudo. Um PDF guarda cada fonte uma vez e deixa todas as páginas usarem a mesma. Divida o arquivo em um PDF por página, e cada arquivo precisa da própria cópia.',
      ],
    },
    {
      heading: 'Onde as partes cresceram: as fontes',
      paragraphs: [
        'Nossas notas de aula têm {bookParts} páginas compostas em muitas fontes incorporadas. Divididas em {bookParts} partes, elas somaram {bookSum}, {bookRatio_times} os {bookTotal} do original. Quase todo o crescimento veio das fontes: o arquivo inteiro guarda {bookFonts} de dados de fonte, e as partes juntas guardaram {bookPartFonts}, {bookFontsRatio_times} esse peso.',
        'As imagens não cresceram nada. Cada uma está numa página só, então foi para uma parte só, e as partes guardaram {bookPartImages} de imagens, exatamente o que o arquivo inteiro guarda. A Adobe observa que adicionar uma fonte pode aumentar significativamente o tamanho de um PDF; dividir pode repetir esse custo em cada parte que usa a fonte.',
      ],
    },
    {
      heading: 'Escaneamentos: o que cada parte repete',
      paragraphs: [
        'Um documento escaneado é uma imagem por página, e cada imagem vai para uma parte. Nosso relatório da NASA escaneado tem {reportParts} páginas; dividido em {reportParts} partes, ele somou {reportSum}, {reportRatio_more} acima do todo, com as imagens nos mesmos bytes de antes. A maior parte do crescimento, {reportMetadataShare}, foram os metadados do documento: uma descrição do arquivo num formato chamado XMP, com {reportMetadata} no original. A Dividir PDF copia essa descrição para cada parte, então as partes guardaram {reportPartMetadata} dela. O resto é a pequena estrutura de que cada parte precisa em volta da página.',
        'Nosso PDF de fotos não leva essa descrição. Separado nas suas {photosParts} páginas, ele cresceu só {photosGrowth_exact}.',
      ],
    },
    {
      heading: 'Quando as partes pesam menos',
      paragraphs: [
        'O formulário do IRS foi pelo caminho contrário. Com as {formParts} páginas separadas, as partes somaram {formSum}, {formRatio_off} abaixo do original. O formulário leva uma segunda descrição de si mesmo, num formato chamado XFA, que só alguns programas leem. A Dividir PDF não copia essa descrição para as partes, e avisa isso ao lado do arquivo; os campos do formulário em si continuam lá.',
        'As partes também são escritas com a estrutura bem compactada, em fluxos de objetos comprimidos, e isso explica em parte por que uma parte pode sair menor que a fatia dela no todo.',
      ],
    },
    {
      heading: 'Como dividir sem o peso extra',
      paragraphs: [
        'Divida por intervalos, e não página por página, quando as páginas compartilham as fontes. Um capítulo numa parte leva as fontes uma vez, enquanto as páginas dele separadas levam as fontes uma vez cada. Digite na ferramenta os intervalos de que você precisa, por capítulo ou por seção, por exemplo, em vez de dividir cada página.',
        'Se você divide para caber num limite de e-mail, confira o total, e não só cada parte: uma parte que cabe ainda pode ser a primeira de muitas partes pesadas. Cada parte do nosso relatório escaneado somou cerca de {reportGrowthPerPart} ao total, e {reportMetadata} disso é a própria cópia dos metadados; o resto é a estrutura dela. Com menos partes, e maiores, os metadados e a estrutura se repetem menos vezes. A Comprimir PDF pode deixar as imagens mais leves antes de você dividir.',
        'E se o que você precisa é de um PDF mais curto, e não de vários, exclua as páginas de que não precisa. Um arquivo só guarda as fontes uma vez, por mais páginas que saiam dele.',
      ],
    },
    {
      heading: 'O que medimos em cada arquivo',
      paragraphs: [
        'Dividimos {files} PDFs em uma parte por página, o padrão da Dividir PDF, e somamos as partes. As partes pesaram mais que o todo em {bigger} deles. A tabela mostra cada arquivo, com as fontes antes e depois, já que as fontes fizeram a maior parte do peso extra na nossa amostra.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'O que medimos',
  sheet: {
    stats: [
      { label: 'As notas de aula, uma parte por página', value: '{bookRatio_times}', from: '{bookTotal}', to: '{bookSum}' },
      { label: 'PDFs cujas partes pesaram mais', value: '{bigger} de {files}' },
    ],
    sample: '{files} PDFs de teste, cada um dividido em uma parte por página.',
    link: 'Veja a tabela',
  },
  tableHeading: 'Arquivo por arquivo',
  measuredIntro: 'Cada PDF dividido em uma parte por página, o padrão da Dividir PDF. A variação compara todas as partes com o arquivo inteiro; a coluna das fontes mostra os dados de fonte do arquivo inteiro e, depois, os de todas as partes juntas.',
  measuredNote: 'Medido em {date} no Node com o motor deste site, que dá os mesmos bytes que o navegador, em {files_word} PDFs dos nossos testes: os documentos reais e um PDF feito de fotos. As fontes, as imagens e os metadados foram contados com a pdf-lib, a biblioteca com que o motor abre os arquivos.',
  tables: [
    {
      heading: 'Uma parte por página',
      caption: 'Cada PDF: o número de partes, o tamanho do arquivo inteiro, o tamanho de todas as partes juntas, a variação e os dados de fonte antes e depois',
      head: ['Arquivo', 'Partes', 'Arquivo inteiro', 'Todas as partes', 'Variação', 'Fontes'],
    },
  ],
  sourcesHeading: 'Fontes',
  sources: [
    { id: 'adobe', label: 'Adobe: Por que meu PDF está tão grande', href: 'https://www.adobe.com/br/acrobat/hub/why-is-pdf-so-big.html', read: '2026-11-03' },
  ],
  facts: {},
  names: [],
  relatedHeading: 'Ferramentas e guias relacionados',
};

export default texts;
