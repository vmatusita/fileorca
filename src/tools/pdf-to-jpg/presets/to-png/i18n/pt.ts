// PDF to PNG (F18, decisions 5 and 8): a preset of PDF to JPG with PNG fixed. Page blocks (how, specs, faq, privacy,
// related) with at least three of their own (gate:conteudo, MIN_OWN_BLOCKS) and the panel bits of the shared PDF island,
// in Portuguese (docs/i18n/pt.md). The specs rows state the real behaviour of the PDF engine (src/engine/pdf/): when it
// changes there, change them here and in en.ts. Every sentence on the size of the files is checked against the matrix
// (tests/e2e/pdf-matrix.spec.ts, DECISOES § 729). The options are PngTexts: no format choice, so no legend and no "JPG".
import type { PdfToolTexts } from '../../../../../i18n/types.ts';
import type { PngTexts } from '../../../../pdf/option-texts.ts';

const texts: PdfToolTexts<PngTexts> = {
  title: 'PDF para PNG: transforme páginas de PDF em imagens nítidas no navegador',
  description:
    'Converta as páginas de um PDF em imagens PNG a 72, 150 ou 300 ppi, no navegador. O PNG deixa nítidos o texto e as linhas finas. Sem upload, sem Exif nem GPS.',
  h1: 'PDF para PNG',
  howHeading: 'Como converter um PDF em PNG',
  howSteps: [
    'Escolha uma resolução e todas as páginas ou um intervalo como 2-4, 7.',
    'Solte seus PDFs na caixa, escolha os arquivos ou cole. A Oli transforma cada página num PNG assim que o arquivo é lido.',
    'Baixe o PNG, ou todas as imagens juntas num ZIP.',
  ],
  specsHeading: 'Como são os arquivos PNG',
  specs: {
    caption: 'O que a PDF para PNG recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['O que aceita', 'Arquivos PDF, quantos quiser. A Oli lê o que há dentro de cada arquivo, não o nome.'],
      ['Formato', 'Sempre PNG, que é salvo sem perda: sem ajuste de qualidade e sem borrão em volta das letras e das linhas.'],
      ['Resolução', '72 ppi para a tela, 150 ppi para uso geral (o padrão) ou 300 ppi para imprimir.'],
      ['Páginas', 'Todas as páginas, ou um intervalo como 2-4, 7, que vale para cada PDF que você puser.'],
      ['O que sai', 'Um PNG para cada página, com o nome do PDF e -pagina-1, -pagina-2 e assim por diante, como relatorio-pagina-1.png. Várias imagens são baixadas juntas num ZIP só.'],
      ['Fundo', 'Cada página é desenhada sobre branco, como um leitor de PDF mostra, então o PNG não tem áreas transparentes.'],
      ['Tamanho do arquivo', 'Numa página com fotos, o PNG tem várias vezes o tamanho do JPG da mesma página. Numa página de texto e linhas, os dois têm tamanhos parecidos: o PNG tem aproximadamente entre a metade e o dobro do tamanho do JPG, e pode até ser o arquivo menor.'],
      ['Páginas muito grandes', 'Uma página acima de 16,7 megapixels na resolução escolhida é grande demais para o navegador desenhar, então sai menor, e o resultado avisa.'],
      ['Metadados', 'Os arquivos PNG saem sem metadados: sem dados Exif e sem localização GPS.'],
      ['PDFs com restrições', 'Um PDF que só tem restrições de edição é desenhado do mesmo jeito. Um PDF com senha para abrir é recusado, com um link para Desbloquear PDF.'],
    ],
  },
  faqHeading: 'Perguntas sobre PNG',
  faq: [
    {
      q: 'Quando o PNG é melhor que o JPG para uma página de PDF?',
      a: 'Para páginas de texto, tabelas, gráficos e desenhos de linhas. O PNG é salvo sem perda, então as letras, as linhas finas e as bordas continuam bem definidas, sem o borrão que o JPG pode deixar em volta delas. Para páginas que são quase só fotos, a PDF para JPG dá um arquivo menor com a mesma aparência.',
    },
    {
      q: 'Os arquivos PNG são maiores que os JPG?',
      a: 'Nas páginas com fotos, sim, várias vezes maiores: o PNG guarda cada detalhe da imagem, e o JPG descarta detalhes que o olho quase não vê para ocupar menos espaço. Nas páginas de texto e linhas, nem sempre: o PNG tem aproximadamente entre a metade e o dobro do tamanho do JPG, e pode até ser o arquivo menor. Quando a página tem fotos e um arquivo pequeno importa mais do que um texto nítido, use a PDF para JPG.',
    },
    {
      q: 'Qual resolução escolher para as imagens PNG?',
      a: 'Use 72 ppi para mostrar as páginas numa tela, 150 ppi para uso geral e 300 ppi quando for imprimir. O dobro de ppi dá quatro vezes mais pixels, então os arquivos crescem rápido a 300 ppi.',
    },
    {
      q: 'Ainda dá para selecionar o texto no PNG?',
      a: 'Não. O texto da página vira parte da imagem, então não dá mais para selecionar, buscar nem copiar. Guarde o PDF quando você precisar do texto em si.',
    },
    {
      q: 'Meu PDF é enviado para fazer os arquivos PNG?',
      a: 'Não. O PDF.js desenha cada página no seu aparelho, dentro do navegador, e os arquivos PNG também são feitos ali. Nada vai para um servidor, como a aba Rede do navegador mostra.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote: 'Seus PDFs viram arquivos PNG no seu aparelho e nunca são enviados a um servidor. As imagens saem sem dados Exif e sem localização GPS.',
  relatedHeading: 'Ferramentas relacionadas',
  panel: {
    suffix: 'pagina',
    note: 'PDFs, quantos quiser',
    progressLabel: 'Transformando as páginas em imagens PNG',
    // {count} is the number of images, for one PDF or several (DECISOES § 178).
    done: 'Prontinho! A Oli transformou seu PDF numa imagem PNG.',
    doneMany: 'Prontinho! A Oli transformou as páginas em {count} imagens PNG.',
    options: {
      png: 'PNG',
      formatHelp: 'Cada página sai em PNG, sem perda.',
      resolutionLegend: 'Resolução',
      low: '72 ppi',
      lowHelp: 'para a tela',
      medium: '150 ppi',
      mediumHelp: 'uso geral',
      high: '300 ppi',
      highHelp: 'para imprimir',
      pagesLegend: 'Páginas',
      all: 'Todas as páginas',
      range: 'Intervalo de páginas',
      rangeLabel: 'Páginas que viram imagens',
      rangeHelp: 'Por exemplo, 1-3, 5, 8-10. O mesmo intervalo vale para todos os PDFs.',
      rangeError: 'Digite números de página como 1-3, 5, 8-10, só com páginas que o PDF tem.',
    },
  },
};

export default texts;
