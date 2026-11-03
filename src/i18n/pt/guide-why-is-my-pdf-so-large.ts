import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Por que meu PDF está tão grande? O que ocupa espaço e o que deixa o arquivo menor',
  description: 'O que ocupa espaço dentro de um PDF, medido nos nossos PDFs de teste, e o que cada nível da Comprimir PDF fez com eles, até quando o arquivo voltou igual.',
  h1: 'Por que meu PDF está tão grande?',
  lead: 'Um PDF é um recipiente, e o tamanho depende do que foi colocado nele. Descubra qual parte pesa antes de tentar diminuir o arquivo.',
  changed: 'Primeira versão, com as medidas de {date}.',
  intro: [
    'Um PDF pesa o que foi colocado nele. Nos {spaceFiles_word} PDFs de teste cujo conteúdo pesamos, os mais pesados devem a maior parte do peso às imagens, e um documento escaneado também é imagem, uma por página. Depois vêm as fontes. O guia da Adobe aponta as mesmas duas causas: diz que a resolução e a profundidade de bits de uma imagem podem afetar diretamente o tamanho do arquivo, e que adicionar uma fonte pode aumentar esse tamanho de forma significativa.',
    'O e-mail é um dos limites em que você pode esbarrar. Uma conta pessoal do Gmail envia anexos de até {gmailLimit}, e o Outlook.com aceita anexos de até {outlookLimit}. Acima disso, o arquivo precisa ficar menor, ser dividido ou ir como link.',
  ],
  toolHeading: 'Comprima seu PDF aqui',
  toolIntro: 'Solte um PDF e ele é comprimido nesta aba do navegador, começando pela compressão Recomendada. Troque o nível para ver cada resultado. Nada é enviado.',
  sections: [
    {
      heading: 'Onde estão os bytes',
      paragraphs: [
        'Abrimos os PDFs dos nossos testes e somamos os bytes de cada tipo de conteúdo. Na página de livro escaneada, a única imagem é {scanImagesShare} do arquivo. Num PDF feito de fotos, é {photosImagesShare}. Esses arquivos são grandes porque as imagens deles são grandes, e o resto pesa pouco.',
        'O relatório da NASA escaneado tem {reportPages} páginas, e cada página é uma imagem em preto e branco. As imagens são {reportImagesShare} dele, e o resto é a estrutura que mantém tantas páginas juntas. O formulário do IRS não tem imagem nenhuma: as {formFontCount} fontes incorporadas são {formFontsShare} do arquivo, e os campos do formulário e o texto das páginas formam os outros {formOtherShare}.',
        'As notas de aula misturam tudo: {bookImageCount} imagens são {bookImagesShare} do arquivo, {bookFontCount} fontes incorporadas são outros {bookFontsShare}, e as {bookPages} páginas de texto e desenhos são o resto. A tabela em "O que medimos" traz cada arquivo.',
      ],
    },
    {
      heading: 'Imagens: o peso dos nossos PDFs mais pesados',
      paragraphs: [
        'Uma foto tirada no celular tem milhões de pixels, muito mais do que uma página precisa na tela ou mesmo no papel. Quando uma foto dessas entra num PDF no tamanho original, o PDF carrega cada pixel. Um escaneamento faz o mesmo: escanear em alta resolução, em cores, transforma cada página numa imagem grande.',
        'É aqui que a compressão Recomendada e a Forte da Comprimir PDF podem ajudar, porque as imagens podem perder detalhes que ninguém vê. Um PDF sem imagens só fica mais leve com uma reescrita da estrutura, e o quanto isso rendeu nos nossos arquivos está na próxima seção.',
      ],
    },
    {
      heading: 'Fontes, formulários e estrutura',
      paragraphs: [
        'Um PDF leva junto as fontes de que precisa, para aparecer igual em qualquer computador. Um documento composto em muitas fontes, ou que incorpora fontes inteiras em vez de só as letras que usa, fica mais pesado por isso. Formulários somam o próprio peso: cada campo é um objeto, e alguns formulários levam uma segunda descrição de si mesmos para programas antigos.',
        'Nada disso pode ser espremido como uma foto. Uma reescrita sem perda arruma a estrutura de forma mais compacta e tira o que está repetido, e o ganho depende de como o arquivo foi escrito. Nosso PDF longo só com texto, que o nosso script de teste escreveu sem compactar nada, perdeu {textOnlyLosslessRatio_off} do tamanho com ela. As notas de aula, um documento real, perderam só {bookLosslessSaved} de {bookTotal}.',
      ],
    },
    {
      heading: 'O que cada nível da Comprimir PDF fez',
      paragraphs: [
        'A compressão Sem perda reescreve o arquivo sem mexer em nenhuma imagem. Ela tirou {reportLosslessRatio_off} do relatório escaneado e {formLosslessRatio_off} do formulário de imposto. No PDF de fotos, cujo peso está nas imagens, ela economizou só {photosLosslessSaved_exact} de {photosTotal}.',
        'A Recomendada também comprime de novo as fotos coloridas e em tons de cinza que estão lá dentro, sem passar da resolução de que uma página precisa. No PDF de fotos ela tirou {photosRecommendedRatio_off}, e na página de livro escaneada, {scanRecommendedRatio_off}. No relatório escaneado, deu o mesmo resultado da Sem perda, porque os escaneamentos em preto e branco são guardados de um jeito que esse nível não comprime de novo.',
        'A Forte transforma cada página numa imagem. No PDF de fotos ela tirou {photosStrongChromiumRatio_off}, e na página de livro escaneada, {scanStrongChromiumRatio_off}. Isso tem um custo: o texto não pode mais ser selecionado nem buscado, e os campos de formulário, os links e os marcadores se perdem.',
      ],
    },
    {
      heading: 'Quando o arquivo volta igual',
      paragraphs: [
        'A Comprimir PDF nunca devolve um arquivo maior do que o que você deu a ela. Quando um nível não consegue deixar o arquivo menor, você recebe o original de volta, byte por byte. Dos {accepted} arquivos que comprimimos, a Sem perda devolveu {losslessUnchanged_word} deles sem mudança, e a Recomendada, {recommendedUnchanged_word}: um PDF que já estava tão pequeno quanto a reescrita consegue deixar.',
        'A Forte devolveu {strongUnchangedChromium_word} dos {accepted_word} sem mudança. Páginas de texto desenhadas como imagem pesam mais que o próprio texto, e um escaneamento em preto e branco guardado como imagem da página já é menor que uma foto da mesma página. Nos nossos testes, a Forte superou a Recomendada só no PDF de fotos e na página de livro escaneada.',
      ],
    },
    {
      heading: 'Se ainda estiver grande demais',
      paragraphs: [
        'Se o PDF for quase todo texto e ainda passar do limite depois da Sem perda, divida o arquivo em partes e envie cada uma separada, ou tire as páginas que não precisam ir. Se for quase todo foto, comprima as fotos antes de colocá-las no PDF, num tamanho que caiba na página.',
        'Num documento que você ainda vai escanear, uma resolução menor e tons de cinza em vez de cores fazem de cada página uma imagem menor desde o começo. E quando o arquivo precisa ficar inteiro, um link para uma cópia compartilhada chega aonde um anexo não chega.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'O que medimos',
  measuredIntro: 'Primeiro, quanto pesa cada tipo de conteúdo em {spaceFiles_word} dos nossos PDFs de teste. Depois, cada nível da Comprimir PDF nos {accepted} PDFs dos nossos testes que a ferramenta aceita, com a parte do tamanho original que sobra.',
  measuredNote: 'Medido em {date}. As páginas escaneadas, o relatório da NASA, o formulário do IRS e as notas de aula são documentos reais; os outros PDFs de teste foram escritos pelo nosso próprio script de teste. O que ocupa espaço foi lido com a pdf-lib, a biblioteca com que o motor abre os arquivos. A Sem perda e a Recomendada rodaram no Node com o motor deste site, que dá os mesmos bytes que o navegador; a Forte desenha as páginas no canvas, então foi medida pela página da Comprimir PDF no Chromium {chromiumVersion} e no WebKit {webkitVersion}, no {system}. A tabela mostra o Chromium.',
  tables: [
    {
      heading: 'O que ocupa espaço',
      caption: 'Nossos PDFs de teste: páginas, tamanho e quanto dele é imagem, fonte e todo o resto',
      head: ['Arquivo', 'Páginas', 'Tamanho', 'Imagens', 'Fontes', 'Todo o resto'],
    },
    {
      heading: 'A Comprimir PDF, nível por nível',
      caption: 'Cada PDF dos nossos testes que a Comprimir PDF aceita: o tamanho antes e depois de cada nível, com a parte do original que sobra',
      head: ['Arquivo', 'Antes', 'Sem perda', 'Recomendada', 'Forte'],
    },
  ],
  sourcesHeading: 'Fontes',
  sources: [
    { id: 'gmail', label: 'Ajuda do Gmail: Enviar anexos na mensagem do Gmail', href: 'https://support.google.com/mail/answer/6584?hl=pt-BR', read: '2026-11-03' },
    { id: 'outlook', label: 'Suporte da Microsoft: Limites de envio no Outlook.com', href: 'https://support.microsoft.com/pt-br/outlook/sending-limits-in-outlook-com', read: '2026-11-03' },
    { id: 'adobe', label: 'Adobe: Por que meu PDF está tão grande', href: 'https://www.adobe.com/br/acrobat/hub/why-is-pdf-so-big.html', read: '2026-11-03' },
  ],
  facts: {
    gmailLimit: { text: '25 MB', source: 'gmail' },
    outlookLimit: { text: '25 MB', source: 'outlook' },
  },
  names: [],
  relatedHeading: 'Ferramentas e guias relacionados',
};

export default texts;
