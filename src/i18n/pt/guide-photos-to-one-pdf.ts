import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Como transformar fotos em um único PDF leve o bastante para mandar',
  description: 'Como pôr várias fotos num único PDF, no celular ou no computador, quanto o PDF pesa e o que muda quando você comprime as fotos antes.',
  h1: 'Como transformar fotos em um único PDF',
  lead: 'Recibos, páginas de um contrato, algumas fotos para um formulário: um PDF só é mais fácil de mandar e de imprimir que um monte de imagens. Veja como fazer e quanto ele pesa.',
  changed: 'Primeira versão, com as medidas de {date}.',
  intro: [
    'Um PDF de fotos mantém a ordem, imprime cada foto na própria página e abre em qualquer computador ou celular. Muitos formulários e escritórios também pedem exatamente isso: um PDF, e não um conjunto de imagens.',
    'O problema é o tamanho. Postas num PDF só, as nossas {photos_wordf} fotos de celular viraram um arquivo com {pdfRatioChromium} do peso das próprias fotos. Medimos o que acontece com o tamanho, com e sem comprimir as fotos antes.',
  ],
  toolHeading: 'Transforme suas fotos em um único PDF aqui',
  toolIntro: 'Solte as fotos na ordem que você quer, ou arraste para pôr em ordem. Cada uma vira uma página, o PDF é feito nesta aba do navegador e nada é enviado.',
  sections: [
    {
      heading: 'No iPhone',
      paragraphs: [
        'O app Pré-Visualização do iPhone exporta uma imagem como PDF, e a Apple lembra que ele também pode comprimir o arquivo nesse caminho. Para acrescentar mais fotos, o manual da Apple descreve como inserir uma imagem num PDF: mantenha o toque sobre uma miniatura de página e toque em Inserir de Arquivo. Assim você monta um PDF de fotos, uma inserção de cada vez.',
      ],
    },
    {
      heading: 'No computador',
      paragraphs: [
        'O Windows tem uma impressora chamada Microsoft Print to PDF, que a Microsoft descreve como parte do Windows 10 e do Windows 11. Num app que imprime as suas fotos, escolha essa impressora na lista Impressora, e as páginas são salvas como PDF em vez de impressas. O tamanho da página e as margens vêm das configurações de impressão, então confira antes de salvar.',
        'A ferramenta desta página funciona do mesmo jeito no computador e no celular, no navegador: solte as fotos, escolha o tamanho da página se precisar de Carta ou A4 e baixe um PDF só.',
      ],
    },
    {
      heading: 'O que a ferramenta faz com cada foto',
      paragraphs: [
        'Por padrão, cada página tem o tamanho da própria foto, então nada é cortado e nenhuma borda branca é acrescentada. Você também pode escolher Carta ou A4, e cada foto fica na página com uma margem. As fotos entram no PDF como JPG em qualidade alta; uma imagem com transparência entra como PNG, para as partes transparentes continuarem transparentes.',
        'Cada foto é gravada de novo a partir dos pixels. É isso que deixa a localização e os dados da câmera fora do PDF: nosso PDF levou {pdfGpsChromium_word} dados de GPS, embora todas as fotos que pusemos nele tivessem esse dado.',
      ],
    },
    {
      heading: 'Quanto o PDF pesa',
      paragraphs: [
        'Nossas {photos_wordf} fotos de celular de verdade pesavam {photosTotal} juntas. Postas direto num PDF, viraram um arquivo de {pdfChromium}, ou seja, {pdfRatioChromium} do peso das fotos. Quase tudo isso são as próprias fotos: as imagens dentro do PDF pesavam {pdfImagesChromium}.',
        'O PDF saiu um pouco mais leve que as fotos só porque a ferramenta salva as imagens na qualidade dela, um pouco abaixo da que as câmeras dos celulares usaram. Isso não é compressão de verdade.',
      ],
    },
    {
      heading: 'Comprima as fotos antes',
      paragraphs: [
        'Depois passamos as mesmas fotos pela Comprimir imagem, no nível Recomendada. Elas saíram com {compressedChromium}, {compressedRatioChromium_off} mais leves que as originais. Transformadas num PDF, viraram um arquivo de {pdfAfterChromium}, ou seja, {pdfAfterRatioChromium} das fotos originais.',
        'Esse PDF ainda ficou {pdfAfterVsCompressedChromium_more} mais pesado que as fotos comprimidas de onde veio. O motivo é o passo de cima: a Imagem para PDF grava cada foto de novo, na própria qualidade alta, e isso devolve parte da economia. A ordem ainda compensa, mas, se o PDF precisa ficar o menor possível, comprima também o PDF pronto.',
      ],
    },
    {
      heading: 'Fotos de documentos',
      paragraphs: [
        'Quando as fotos são de papel, um pouco de cuidado antes do PDF dá um arquivo melhor. Corte cada foto na folha, para a mesa, o chão e os seus dedos ficarem de fora, e gire qualquer foto que saiu de lado. A Cortar imagem e a Girar imagem fazem as duas coisas no navegador, antes de as fotos irem para o PDF.',
        'Tire as fotos com boa luz e bem de cima. Uma foto nítida de uma página fica legível num tamanho bem menor que uma foto tremida, então ela também comprime melhor.',
      ],
    },
    {
      heading: 'Fotos do iPhone',
      paragraphs: [
        'A Imagem para PDF aceita JPG, PNG e WebP. O iPhone salva as fotos em HEIC por padrão, então transforme as fotos em JPG antes, com a HEIC para JPG, e depois ponha os JPGs num PDF só. O nosso guia de HEIC para JPG explica os formatos e os ajustes que evitam o HEIC de vez.',
      ],
    },
    {
      heading: 'Uma rotina curta',
      paragraphs: [
        'Ponha as fotos em ordem, comprima as fotos se o PDF for por e-mail e depois transforme tudo num PDF só. Se ainda ficar pesado demais, passe o PDF pela Comprimir PDF: o nosso guia de PDFs grandes mostra o que cada modo faz com um PDF de fotos.',
        'Guarde as fotos originais. O PDF é para mandar e imprimir; as fotos são a cópia a que você sempre pode voltar.',
      ],
    },
  ],
  half: 4,
  measuredHeading: 'O que medimos',
  measuredIntro: 'Nossas {photos_wordf} fotos de celular de verdade, direto num PDF só, e de novo depois da Comprimir imagem. A porcentagem compara com as fotos originais.',
  measuredNote: 'Medido em {date} pelas páginas Imagem para PDF e Comprimir imagem deste site no Chromium {chromiumVersion} e no WebKit {webkitVersion}, no {system}, que deram os mesmos tamanhos, nas nossas fotos de celular de verdade, com os ajustes padrão. As imagens dentro do PDF foram contadas com o pdf-lib.',
  tables: [
    {
      heading: 'As fotos e o PDF',
      caption: 'Cada passo: as fotos originais, o PDF feito com elas, as fotos depois da Comprimir imagem e o PDF feito com essas fotos, com a porcentagem do tamanho original',
      head: ['Passo', 'Tamanho', 'Das fotos originais'],
      labels: ['As fotos originais', 'Um PDF com as fotos', 'As fotos depois da Comprimir imagem', 'Um PDF com as fotos comprimidas'],
    },
  ],
  sourcesHeading: 'Fontes',
  sources: [
    { id: 'apple-preview-export', label: 'Manual de Uso do iPhone: Exporte ou comprima PDFs e imagens no app Pré-Visualização no iPhone', href: 'https://support.apple.com/pt-br/guide/iphone/iph61c20afe1/ios', read: '2026-11-03' },
    { id: 'apple-preview-pages', label: 'Manual de Uso do iPhone: Adicione, apague, gire, mova ou recorte páginas em PDFs no app Pré-Visualização do iPhone', href: 'https://support.apple.com/pt-br/guide/iphone/iphbf4977cff/ios', read: '2026-11-03' },
    { id: 'ms-print-to-pdf', label: 'Suporte da Microsoft: Salvar uma mensagem do Outlook como um arquivo .eml, um arquivo PDF ou como um rascunho', href: 'https://support.microsoft.com/pt-br/outlook/mail/save-an-outlook-message-as-a-eml-file-a-pdf-file-or-as-a-draft', read: '2026-11-03' },
  ],
  facts: {},
  names: ['Windows 10', 'Windows 11', 'A4'],
  relatedHeading: 'Ferramentas e guias relacionados',
};

export default texts;
