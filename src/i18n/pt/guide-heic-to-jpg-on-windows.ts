import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Como converter HEIC para JPG no Windows, uma foto ou todas de uma vez',
  description: 'Por que o Windows não abre as fotos do iPhone, os ajustes que evitam o HEIC e o que muda no tamanho e na localização quando as fotos viram JPG.',
  h1: 'Como converter HEIC para JPG no Windows',
  lead: 'Seu iPhone salvou a foto em HEIC, e o Windows não abre o arquivo, ou um site não aceita. Veja por que isso acontece e como chegar a um JPG.',
  changed: 'Primeira versão, com as medidas de {date}.',
  intro: [
    'HEIC é o arquivo que a Apple grava quando um iPhone ou iPad salva as fotos no formato Alta Eficiência, que se baseia no HEIF. A imagem é a mesma de um JPG, mas fica guardada de um jeito mais compacto, e por isso cabem mais fotos no mesmo espaço do celular. O problema aparece em todo o resto: o Windows precisa de um programa a mais para mostrar o arquivo, e muitos formulários de envio ainda pedem JPG.',
    'Dá para resolver isso em lugares diferentes. Você pode ensinar o Windows a ler HEIC, pode pedir ao iPhone que pare de gravar nesse formato ou pode converter os arquivos que já tem. Cada caminho resolve uma parte do problema, e só o último entrega arquivos JPG que você pode mandar para qualquer lugar.',
  ],
  toolHeading: 'Converta suas fotos HEIC aqui',
  toolIntro: 'Solte uma foto HEIC ou um lote inteiro. Cada uma vira JPG dentro desta aba do navegador, então as fotos nunca são enviadas, e um lote volta num só ZIP.',
  sections: [
    {
      heading: 'Por que o Windows pede uma extensão',
      paragraphs: [
        'O Windows não lê HEIC sozinho. Quando você abre um arquivo desses no aplicativo Fotos, a Microsoft avisa que pode aparecer a mensagem "Você precisa de uma extensão para usar este arquivo". A solução que a Microsoft dá são duas extensões da Microsoft Store: as Extensões de Imagem HEIF, que são {heifPrice}, e as Extensões de Vídeo HEVC, que custam {hevcPrice}. Segundo a Microsoft, você precisa das duas, mesmo que só pretenda ver fotos, e o aplicativo Fotos tem de ser reiniciado depois da instalação.',
        'É uma boa saída se você só quer ver as fotos no seu próprio computador. Só que ela não muda os arquivos. Eles continuam em HEIC, então o site, a pasta compartilhada ou a pessoa que recebe as fotos pode continuar sem conseguir abrir.',
      ],
    },
    {
      heading: 'Faça o iPhone parar de gravar em HEIC',
      paragraphs: [
        'Se as suas fotos vão parar no Windows, você pode passar a câmera para JPG em tudo o que fotografar daqui em diante. A Apple descreve o ajuste: abra Ajustes, toque em Câmera, toque em Formatos e, em seguida, toque em Mais Compatível. A partir daí, a câmera salva as fotos em JPEG e os vídeos em H.264. Escolher Alta Eficiência volta para HEIF e HEVC, que ocupam menos espaço no celular.',
        'A Apple também recomenda o Mais Compatível para quem transfere fotos para um PC com Windows, junto com o app Dispositivos Apple, da Microsoft Store. Isso só muda as fotos que você tirar depois do ajuste. As que já estão no celular continuam em HEIC.',
      ],
    },
    {
      heading: 'Deixe a transferência converter',
      paragraphs: [
        'Quando as fotos vão do iPhone para o computador pelo cabo, a Apple diz que elas podem ser convertidas em JPEG ou H.264 no caminho. O celular faz isso a não ser que você peça para manter os originais: abra Ajustes, toque em Apps e em Fotos, role para baixo e toque em Manter Originais. Se você não escolher essa opção, as cópias que chegam ao PC já podem ser JPG.',
        'A Microsoft aponta um caminho parecido, sem cabo: muitos aparelhos convertem fotos HEIC para um formato mais comum quando os arquivos são transferidos ou enviados por e-mail, e o OneDrive pode converter arquivos de foto sozinho. Os dois dependem de como as fotos viajam, então vale conhecer, mas é difícil contar com eles para uma pasta de arquivos que você já tem.',
      ],
    },
    {
      heading: 'Converta os arquivos que você já tem',
      paragraphs: [
        'Para fotos que já estão em HEIC no seu computador ou na pasta de downloads, um conversor é o caminho direto. A ferramenta desta página lê cada HEIC com o libheif, um decodificador de código aberto, o mesmo em todos os navegadores, deixa a imagem principal na posição certa e grava um JPG novo a partir dos pixels. Você pode soltar um arquivo ou uma pasta inteira, e o ZIP mantém os nomes originais, com a terminação .jpg.',
        'Nada é enviado a lugar nenhum. A conversão roda na aba do navegador, e é por isso que ela serve para fotos privadas: a aba Rede do navegador não mostra nenhuma requisição levando o arquivo.',
      ],
    },
    {
      heading: 'O que a conversão fez com as nossas fotos',
      paragraphs: [
        'Rodamos o conversor nas nossas {files} fotos HEIC de teste, tiradas com {cameras} modelos de câmera diferentes, de iPhones a um celular Samsung e um Apple Vision Pro. Juntos, os arquivos HEIC pesavam {heicTotal}. Os JPGs pesaram {jpgTotalChromium}, ou seja, {ratioTotalChromium_more} a mais.',
        'Esse é o preço da compatibilidade. Foto a foto, a mudança foi de {ratioMinChromium_change} a {ratioMaxChromium_change}, e metade delas cresceu {ratioMedianChromium_more} ou menos. O JPG guarda a mesma imagem de um jeito menos compacto que o HEIC, e por isso as nossas fotos saíram maiores no total, e não menores. Se você precisa de um arquivo menor, comprima ou redimensione o JPG depois.',
        'Todos os {sameSizeChromium_word} JPGs mantiveram o tamanho em pixels da foto como o celular a mostra, na posição certa.',
      ],
    },
    {
      heading: 'A localização não vem junto',
      paragraphs: [
        'Uma foto pode guardar o lugar onde foi tirada. Das nossas {files} fotos, {gpsBefore} tinham coordenadas de GPS de verdade, e {gpsTagBefore} tinham algum tipo de marcação de GPS, preenchida ou vazia. Depois da conversão, o número de JPGs com algum dado de GPS foi {gpsAfterChromium}.',
        'Isso é de propósito: a ferramenta grava cada JPG a partir dos pixels, então a localização, os dados da câmera e os outros metadados do HEIC ficam para trás. Se você quer manter a localização, para um mapa de fotos ou um álbum, guarde o HEIC original ou use a exportação do seu app de fotos.',
      ],
    },
    {
      heading: 'O que mais fica no HEIC',
      paragraphs: [
        'Converter codifica a imagem de novo, então o JPG é um arquivo novo, e não uma cópia do HEIC com outro nome. Alguns arquivos HEIC também guardam mais de uma imagem. Só a imagem principal vira o JPG: o mapa de profundidade de uma foto de retrato e a segunda imagem de uma foto espacial ficam de fora.',
        'Seus arquivos HEIC nunca são alterados. Guarde os originais e mande os JPGs, e você não perde nada.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'O que medimos',
  measuredIntro: 'Todas as fotos HEIC de teste deste site, convertidas com o padrão da ferramenta acima. A variação compara o JPG com o HEIC.',
  measuredNote: 'Medido em {date} no Chromium {chromiumVersion} e no WebKit {webkitVersion}, no {system}, pela página HEIC para JPG deste site, nas nossas {files} fotos HEIC de teste. A tabela mostra o Chromium; o WebKit deu os mesmos bytes em {identicalBrowsers_wordf} das {files} fotos.',
  tables: [
    {
      heading: 'Nossas fotos HEIC em JPG',
      caption: 'Cada foto HEIC de teste: a câmera, o tamanho em HEIC e em JPG, a variação, o tamanho em pixels e o GPS antes e depois',
      head: ['Câmera', 'HEIC', 'JPG', 'Variação', 'Pixels', 'GPS antes', 'GPS depois'],
    },
  ],
  sourcesHeading: 'Fontes',
  sources: [
    { id: 'ms-photos', label: 'Suporte da Microsoft: Erro do Editor de Vídeo do aplicativo Fotos, não é possível exibir esse tipo de arquivo', href: 'https://support.microsoft.com/pt-br/windows/apps/photos/photos-app-video-editor-error-can-t-view-this-file-type', read: '2026-11-03' },
    { id: 'ms-heif', label: 'Microsoft Store: Extensão da Imagem HEIF', href: 'https://apps.microsoft.com/detail/9pmmsr1cgpwg?hl=pt-BR&gl=BR', read: '2026-11-03' },
    { id: 'apple-heif', label: 'Suporte da Apple: Como usar mídias HEIF ou HEVC em dispositivos Apple', href: 'https://support.apple.com/pt-br/116944', read: '2026-11-03' },
    { id: 'apple-transfer', label: 'Suporte da Apple: Transferir fotos e vídeos do iPhone ou iPad para um Mac ou PC', href: 'https://support.apple.com/pt-br/120267', read: '2026-11-03' },
  ],
  facts: {
    heifPrice: { text: 'grátis', source: 'ms-photos' },
    hevcPrice: { text: 'US$ 0,99', source: 'ms-photos' },
  },
  names: ['H.264'],
  relatedHeading: 'Ferramentas e guias relacionados',
};

export default texts;
