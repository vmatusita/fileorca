import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Como remover a localização das fotos antes de compartilhar',
  description: 'Onde a foto guarda o lugar em que foi tirada, como impedir ou esconder isso no iPhone e no Android e como tirar o dado do arquivo sem mudar um pixel.',
  h1: 'Como remover a localização das fotos antes de compartilhar',
  lead: 'Uma foto de celular pode levar o lugar exato em que foi tirada. Veja como tirar esse dado antes de compartilhar.',
  changed: 'Primeira versão deste guia, publicada em {published} com as medidas de {measured}.',
  intro: [
    'O celular grava informações sobre cada foto dentro do próprio arquivo: a câmera, a data e a hora e, com a localização ligada, as coordenadas de GPS de onde você estava. A Apple diz isso com todas as letras: essas coordenadas são incorporadas a cada foto e vídeo. Quem recebe o arquivo original consegue ler esses dados, e com poucos cliques eles viram um ponto no mapa.',
    'Alguns apps tiram esses dados quando você publica, e outros não. E-mail, transferência de arquivos, pastas na nuvem e muitos apps de conversa mandam o arquivo do jeito que ele está. Se uma foto mostra a sua casa, a escola do seu filho ou qualquer lugar que você prefira não marcar, tire a localização antes de o arquivo sair das suas mãos.',
  ],
  toolHeading: 'Tire os metadados',
  toolIntro: 'Esta é a Redimensionar imagem, na opção {winnerOption}: cada foto mantém todos os pixels e volta sem a localização, a câmera e a data. Ela roda nesta aba do navegador, então as fotos nunca são enviadas.',
  sections: [
    {
      heading: 'O que as nossas fotos levavam',
      paragraphs: [
        'Todas as {withGps_wordf} fotos de celular de verdade que usamos em JPG tinham coordenadas de GPS, {withCamera_wordf} traziam o modelo da câmera e {withDate_wordf} tinham a data e a hora em que foram tiradas. São fotos de teste antigas, de um Google Pixel e de iPhones, e os dados continuavam todos lá.',
        'Das nossas {heicFiles} fotos HEIC de teste, {heicWithGps} tinham coordenadas de GPS de verdade, e todas as {heicWithCamera} traziam o modelo da câmera. O HEIC é o formato que o iPhone usa por padrão, e ele guarda o mesmo tipo de dado que um JPG.',
      ],
    },
    {
      heading: 'Impeça a câmera de salvar a localização',
      paragraphs: [
        'O jeito mais seguro é nunca gravar o dado. No iPhone, os passos da Apple são: abra Ajustes, depois Privacidade e Segurança, depois Serviços de Localização, depois Câmera, e toque em Nunca. A Apple lembra que os metadados de localização só podem ser coletados se a Câmera tiver acesso aos Serviços de Localização.',
        'No Android, depende do celular. A ajuda do Google diz que você controla se a câmera adiciona informações de local às fotos, e dá passos diferentes para cada fabricante, com um nome diferente para a opção em cada marca. Num celular Pixel, os passos do Google são abrir o app Câmera, tocar em Configurações e em Mais configurações e desativar a opção Salvar local.',
      ],
    },
    {
      heading: 'Compartilhe sem a localização pelo celular',
      paragraphs: [
        'No iPhone, você pode deixar a localização de fora a cada compartilhamento. Os passos da Apple: selecione as fotos, toque no botão de compartilhamento, toque em Opções e desative a opção Localização. A tela passa a mostrar "Localização não incluída" acima do botão Opções. Para uma foto que já está na biblioteca, toque em Ajustar Informações, depois em Ajustar Localização e depois em Sem Localização.',
        'O Google Fotos deixa os locais particulares por padrão, segundo a central de ajuda dele. Ele pode remover um local que ele mesmo estimou, mas, se a localização foi adicionada pela câmera, o Google diz que não dá para atualizar nem remover essa informação no Google Fotos. Para esses arquivos, tire os dados do próprio arquivo.',
      ],
    },
    {
      heading: 'Tire do arquivo sem mudar a foto',
      paragraphs: [
        'Toda ferramenta deste site que grava uma imagem grava a partir dos pixels, e isso deixa os metadados para trás. Quase todas também mudam a imagem: comprimem, cortam, giram ou trocam o formato. Então medimos qual delas muda menos a foto, por uma regra fixada antes da medida: o mesmo quadro, o mesmo formato e os pixels mais próximos do original.',
        'A Redimensionar imagem, na opção {winnerOption}, venceu. Uma foto que já tem o tamanho pedido não é decodificada nem codificada de novo: a ferramenta copia os dados da imagem como estão e deixa os metadados de fora. Os pixels voltaram idênticos em {resizeImageIdenticalChromium_wordf} das nossas fotos, e os arquivos ficaram só {resizeImageRatioChromium_off} mais leves, que é o peso dos metadados.',
      ],
    },
    {
      heading: 'O que as outras ferramentas fizeram',
      paragraphs: [
        'A Comprimir imagem também tirou a localização e deixou as fotos {compressImageRatioChromium_off} mais leves, mas porque comprimiu as fotos de novo. A nota mais baixa dela nas nossas fotos foi {compressImagePsnrMinChromium} de PSNR. O PSNR mede o quanto duas imagens se parecem, e quanto maior o número, mais parecidas elas são. Serve para mandar, não para guardar. A Cortar imagem e a Girar imagem mudam o quadro de propósito, e a PNG para JPG transformou as fotos em arquivos PNG com {pngToJpgRatioChromium_times} o tamanho no Chromium e {pngToJpgRatioWebkit_times} no WebKit.',
        'Nenhuma delas deixou coordenadas de GPS, nomes de câmera ou datas nas fotos, e o PDF da Imagem para PDF também não levou GPS. A tabela em "O que medimos" mostra cada ferramenta.',
      ],
    },
    {
      heading: 'O que fica, e o que a foto ainda mostra',
      paragraphs: [
        'Duas coisas ficam de propósito. Uma foto guardada de cabeça para baixo mantém uma pequena marcação que diz qual lado é o de cima, para não aparecer virada: essa marcação ficou em {resizeImageOrientationChromium_wordf} das nossas fotos. O perfil de cor também fica, para as cores não mudarem.',
        'Tirar os dados não esconde o que aparece na imagem. A ajuda do Google avisa que as pessoas ainda podem descobrir onde uma foto foi tirada pelo que ela mostra, como um ponto turístico. Olhe a própria foto antes de compartilhar.',
      ],
    },
    {
      heading: 'Para fotos HEIC',
      paragraphs: [
        'A Redimensionar imagem aceita JPG, PNG e WebP. Para fotos HEIC do iPhone, use a HEIC para JPG: ela também grava cada JPG a partir dos pixels, e nenhuma das nossas fotos HEIC de teste manteve dado de GPS depois da conversão. O nosso guia de HEIC para JPG traz essas medidas.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'O que medimos',
  sheet: {
    stats: [
      { label: 'Fotos ainda com GPS', value: '{resizeImageGpsChromium} de {photos}' },
      { label: 'Fotos com os mesmos pixels', value: '{resizeImageIdenticalChromium} de {photos}', sub: '{resizeImageRatioChromium_off} mais leves' },
    ],
    sample: '{photos} fotos de celular, na Redimensionar imagem acima.',
    link: 'Veja a tabela',
  },
  tableHeading: 'Ferramenta por ferramenta',
  measuredIntro: 'Nossas {photos_wordf} fotos de celular de verdade passaram por cada ferramenta de imagem que aceita JPG, cada uma na opção que muda menos a foto. A porcentagem compara o tamanho depois com o dos originais, e a coluna dos pixels compara cada cópia com o original na pior das fotos.',
  measuredNote: 'Medido em {date} pelas páginas das ferramentas deste site no Chromium {chromiumVersion} e no WebKit {webkitVersion}, no {system}. Os dois navegadores gravaram arquivos do mesmo tamanho em {browsersSameSize_wordf} das {candidates_wordf} ferramentas; na ferramenta {browsersDiffer}, os tamanhos foram diferentes. Os metadados e os pixels foram lidos no Node, com o mesmo decodificador para o original e para a cópia. A tabela mostra o Chromium.',
  tables: [
    {
      heading: 'Cada ferramenta nas nossas fotos',
      caption: 'Cada ferramenta de imagem que aceita JPG: o tamanho depois, o formato, se o quadro continua o mesmo, o quanto os pixels se parecem na pior foto e quantas fotos ficaram com GPS',
      head: ['Ferramenta', 'Tamanho depois', 'Formato', 'Mesmo quadro', 'Pixels, pior foto', 'Fotos que ficaram com GPS'],
      constant: 'Nenhuma ferramenta deixou dado de GPS em nenhuma foto.',
    },
  ],
  sourcesHeading: 'Fontes',
  sources: [
    { id: 'apple-location', label: 'Suporte da Apple: Gerenciar os metadados de localização no app Fotos', href: 'https://support.apple.com/pt-br/guide/personal-safety/ips0d7a5df82/web', read: '2026-11-03' },
    { id: 'google-photos-location', label: 'Ajuda do Google Fotos: Entender, encontrar e editar os locais das suas fotos', href: 'https://support.google.com/photos/answer/6153599?hl=pt-BR&co=GENIE.Platform%3DAndroid', read: '2026-11-03' },
    { id: 'google-photos-privacy', label: 'Ajuda do Google Fotos: Como o Google Fotos protege os dados de local', href: 'https://support.google.com/photos/answer/11190100?hl=pt-BR', read: '2026-11-03' },
    { id: 'google-camera-location', label: 'Ajuda do Google Fotos: Mudar as configurações de localização da sua câmera', href: 'https://support.google.com/photos/answer/9921876?hl=pt-BR', read: '2026-11-03' },
    { id: 'pixel-camera', label: 'Ajuda do Câmera Pixel: Mudar as configurações do app Câmera', href: 'https://support.google.com/pixelcamera/answer/2838995?hl=pt-BR', read: '2026-11-03' },
  ],
  facts: {},
  names: [],
  relatedHeading: 'Ferramentas e guias relacionados',
  measuredTerms: {
    'PNG to JPG': 'PNG para JPG',
    'By percentage, 100': 'Por porcentagem, 100%',
  },
};

export default texts;
