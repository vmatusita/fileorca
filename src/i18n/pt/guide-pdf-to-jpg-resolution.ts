import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Qual resolução escolher ao converter PDF para JPG, com os pixels e os tamanhos',
  description: 'O que a resolução muda ao converter PDF para JPG, medido nos nossos PDFs de teste: os pixels da página, o peso do arquivo e quando escolher JPG ou PNG.',
  h1: 'Qual resolução escolher ao converter PDF para JPG',
  lead: 'Uma página de PDF só ganha pixels ao ser desenhada. A resolução decide quantos, e quanto a imagem pesa.',
  changed: 'Primeira versão deste guia, publicada em {published} com as medidas de {measured}.',
  intro: [
    'Texto e desenhos num PDF são guardados como formas, não como pontos. Para transformar uma página em JPG, um programa desenha a página numa grade de pixels, e a resolução, em pixels por polegada, define o quão fina é essa grade. Peça mais e cada letra ganha mais pixels, e o arquivo cresce junto.',
    'A ferramenta PDF para JPG oferece {lowPpi} para a tela, {mediumPpi} para uso geral e {highPpi} para imprimir. Veja o que cada opção deu em {files_word} dos nossos PDFs de teste, para você escolher a menor que resolve o seu caso.',
  ],
  toolHeading: 'PDF em imagens',
  toolIntro: 'Solte um PDF e cada página vira um JPG a {mediumPpi}, nesta aba do navegador, sem nada ser enviado. Mude a resolução ou o formato e as imagens são feitas de novo; várias páginas vêm juntas num ZIP só.',
  sections: [
    {
      heading: 'Os pixels crescem com o quadrado da resolução',
      paragraphs: [
        'A resolução conta os pixels ao longo de uma polegada, e uma página tem largura e altura. Por isso, dobrar a resolução dobra a largura e a altura, e multiplica os pixels por quatro. A primeira página do Formulário 1040 do IRS saiu com {formWidth72} × {formHeight72} pixels a {lowPpi}, {formWidth150} × {formHeight150} a {mediumPpi} e {formWidth300} × {formHeight300} a {highPpi}.',
        'Passar de {mediumPpi} para {highPpi} deu {formPixels300vs150_times} o número de pixels nessa página, e o mesmo em todos os PDFs que testamos. O arquivo não cresceu no mesmo ritmo: o JPG dessa página foi de {formJpg150Chromium} para {formJpg300Chromium}, {formJpg300vs150Chromium_times} o peso.',
      ],
    },
    {
      heading: 'Para a tela',
      paragraphs: [
        'A resolução de {lowPpi} dá as menores imagens. Isso basta para uma prévia, uma miniatura ou uma imagem numa conversa, e os arquivos ficam pequenos: a primeira página do formulário pesou {formJpg72Chromium}, e a primeira página das notas de aula, {bookJpg72Chromium}.',
        'Letra miúda fica difícil de ler nessa opção quando você amplia a imagem. Se alguém precisa ler o texto da imagem, suba um degrau.',
      ],
    },
    {
      heading: 'Para uso geral',
      paragraphs: [
        'A resolução de {mediumPpi} é o padrão, e a escolha certa quando você está em dúvida. O texto continua legível quando você amplia no celular, e os arquivos continuam fáceis de mandar. Passar de {lowPpi} para {mediumPpi} deixou o JPG da primeira página do formulário com {formJpg150vs72Chromium_times} o peso, em troca de uma página que se lê bem em qualquer tela.',
      ],
    },
    {
      heading: 'Para imprimir',
      paragraphs: [
        'A resolução de {highPpi} é para o papel. Texto impresso e linhas finas precisam dos pixels a mais para sair nítidos, e o peso a mais é o preço: a primeira página das notas de aula foi de {bookJpg150Chromium} a {mediumPpi} para {bookJpg300Chromium} a {highPpi}.',
        'Mais resolução só ajuda quando o PDF tem detalhe para dar. Nossa página de livro escaneada guarda uma única imagem de {scanImageWidth} pixels de largura, o que dá {scanImagePpi} na largura da página. A {highPpi}, essa imagem só é esticada sobre o dobro de pixels em cada direção: a imagem cresceu de {scanJpg150Chromium} para {scanJpg300Chromium} e não mostrou nada novo. Num PDF escaneado, use a resolução do escaneamento, ou fique abaixo dela.',
      ],
    },
    {
      heading: 'JPG ou PNG para uma página',
      paragraphs: [
        'A ferramenta também salva cada página em PNG, que não perde nada. Numa página de fotos, isso sai caro: a primeira página do nosso PDF de fotos pesou {photosPng150Chromium} em PNG contra {photosJpg150Chromium} em JPG a {mediumPpi}, {photosPngVsJpg150Chromium_times} o peso.',
        'Em páginas de texto a diferença é menor, e depende do navegador que escreve o PNG. Na primeira página do formulário a {mediumPpi}, o PNG teve {formPngVsJpg150Chromium_times} o tamanho do JPG no Chromium e {formPngVsJpg150Webkit_times} no WebKit. O PNG mantém o texto perfeitamente nítido, então, numa página de texto ou num diagrama, vale testar os dois formatos.',
        'Escaneamentos em preto e branco podem virar o jogo. Na primeira página do relatório da NASA escaneado a {highPpi}, o PNG pesou {reportPng300Chromium} contra {reportJpg300Chromium} do JPG no Chromium: uma página de letras pretas em papel branco se compacta bem sem perda, e o JPG gasta bytes com borrões em volta de cada letra.',
      ],
    },
    {
      heading: 'Um jeito rápido de escolher',
      paragraphs: [
        'Escolha {lowPpi} para prévias e conversas, {mediumPpi} para ler na tela e para enviar a sites e formulários, e {highPpi} só para imprimir ou para uma página com detalhe fino que alguém vai ampliar. Escolha JPG para fotos e escaneamentos coloridos, e teste o PNG para texto, gráficos e formulários.',
        'Se você só precisa de algumas páginas, transforme só essas em imagens com a opção Intervalo de páginas, em vez de converter todas na resolução mais alta.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'O que medimos',
  sheet: {
    stats: [
      { label: 'JPG de uma página: {mediumPpi} a {highPpi}', value: '{formJpg300vs150Chromium_times}', from: '{formJpg150Chromium}', to: '{formJpg300Chromium}' },
      { label: 'Pixels nessa página', value: '{formPixels300vs150_times}' },
    ],
    sample: 'Numa página só, a primeira do Formulário 1040 do IRS.',
    link: 'Veja os {files} PDFs na tabela',
  },
  tableHeading: 'Arquivo por arquivo',
  measuredIntro: 'A primeira página de cada PDF em cada resolução da ferramenta, em JPG e em PNG. As medidas em pixels vêm em largura por altura.',
  measuredNote: 'Medido em {date} pela página PDF para JPG deste site, no Chromium {chromiumVersion} e no WebKit {webkitVersion}, no {system}, na primeira e na segunda página de {files_word} PDFs dos nossos testes: os documentos reais e um PDF feito de fotos (o livro escaneado tem uma página só). Os pixels foram os mesmos em ambos os navegadores; a tabela mostra os arquivos do Chromium.',
  tables: [
    {
      heading: 'A primeira página em cada resolução',
      caption: 'A primeira página de cada PDF em cada resolução: o tamanho em pixels e o peso do JPG e do PNG',
      head: ['Arquivo', 'Resolução', 'Pixels', 'JPG', 'PNG'],
    },
  ],
  sourcesHeading: 'Fontes',
  sources: [
    { id: 'w3c-png', label: 'W3C: Especificação do formato PNG (em inglês)', href: 'https://www.w3.org/TR/png-3/', read: '2026-11-03' },
    { id: 'jpeg-org', label: 'Comitê JPEG: JPEG 1 (em inglês)', href: 'https://jpeg.org/jpeg/', read: '2026-11-03' },
  ],
  facts: {},
  names: ['Formulário 1040', 'W3C', 'JPEG 1'],
  relatedHeading: 'Ferramentas e guias relacionados',
};

export default texts;
