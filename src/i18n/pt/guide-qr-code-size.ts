import type { FileGuideTexts } from '../types.ts';

// F19b (front T5): guide 5 in Portuguese, the English text of the front E5 adapted with docs/i18n/pt.md. Every number is
// a placeholder of data/guides-measured.json, an official figure of `facts` (DENSO WAVE, whose site qrcode.com has no
// version in Portuguese, so each label says "em inglês"; a no-break space between a number and its unit) or a technical
// name of `names`. The sizes of the PNG go in lower case in the prose, as the specifications of the QR code page write
// them ("no pequeno, no médio e no grande"); the tables show the names of the panel.
const texts: FileGuideTexts = {
  title: 'Tamanho do QR code: como o texto o define e como calcular a impressão',
  description: 'Como o comprimento de um link ou de um texto define os quadradinhos de um QR code, medido nos nossos textos, o que isso muda no PNG e como calcular a impressão.',
  h1: 'Tamanho do QR code: como o texto o define',
  lead: 'Mais texto, mais quadradinhos. O que os nossos textos ocuparam, o efeito no PNG e a conta da impressão.',
  changed: 'Primeira versão deste guia, publicada em {published}.',
  intro: [
    'Um QR code não tem um tamanho fixo. Ele é uma grade de quadradinhos, que o padrão chama de módulos, e a DENSO WAVE, cujo site qrcode.com documenta o QR code, diz isso sem rodeios: definidos a versão e o tamanho de um módulo, o tamanho do código está definido. O seu texto decide a versão, e você, ou a sua impressora, decide o tamanho de um quadradinho.',
    'Para ver o que um texto faz com a grade, digitamos {texts_word} textos no gerador acima: um link curto, uma frase em português sem os acentos, a mesma frase com eles e um link longo cheio de parâmetros de campanha. Salvamos cada código como PNG nos tamanhos pequeno, médio e grande, com a Oli no centro, e lemos cada PNG de volta com um leitor de QR code.',
  ],
  // Two lines at 360 px beside the Oli of the QR panel, who rises 86 px above it (guide-page.spec.ts: the Oli clear of the sheet).
  toolHeading: 'Faça um QR code e veja o tamanho aqui',
  toolIntro: 'Cada caractere que você acrescenta redesenha o código. O contador embaixo da caixa soma o que o código vai guardar, e cada tamanho de PNG mostra os pixels que o arquivo dele vai ter.',
  sections: [
    {
      heading: 'Versões: uma grade que cresce em degraus',
      paragraphs: [
        'A DENSO WAVE numera as versões do QR code de {densoVersions}, de uma grade de {densoSmallestGrid} quadradinhos a uma de {densoLargestGrid}, e cada versão acrescenta {densoStep} quadradinhos a cada lado. Quanto cabe numa versão depende da quantidade de dados, do tipo de caractere e do nível de correção de erros.',
        'O gerador escolhe a versão pelo texto. O nosso link curto, de {shortBytes_exact}, ficou na versão {shortVersionChromium}, com {shortModulesChromium} quadradinhos de lado; o link longo, de {longBytes_exact}, ficou na versão {longVersionChromium}, com {longModulesChromium} quadradinhos de lado.',
      ],
    },
    {
      heading: 'Acentos: a mesma frase, mais bytes',
      paragraphs: [
        'A ferramenta conta bytes, não letras, porque o texto entra no código em UTF-8. Sem os acentos, a nossa frase tinha {plainChars} caracteres e ocupou {plainBytes_exact}. Com eles, tinha os mesmos {accentsChars} caracteres, incluídas {accentsMultibyte_wordf} letras com acento ou cedilha, e ocupou {accentsBytes_exact}.',
        'Esses bytes a mais levaram o código da versão {plainVersionChromium} para a {accentsVersionChromium}, e de {plainModulesChromium} para {accentsModulesChromium} quadradinhos de lado. Cada versão tem um limite, então um texto perto dele passa para a versão seguinte com poucos bytes a mais, enquanto um texto longe dele fica onde está: outra frase poderia ganhar os mesmos bytes e manter a versão.',
      ],
    },
    {
      heading: 'O que os tamanhos de PNG fizeram com os nossos textos',
      paragraphs: [
        'Os tamanhos pequeno, médio e grande são uma largura de referência, não uma largura exata. A ferramenta amplia o código em pixels inteiros por quadradinho, então o lado do PNG mudou com o texto: no pequeno, de {plainSmallSideChromium} pixels na frase sem acentos a {longSmallSideChromium} no link longo. O painel mostra a medida do lado junto de cada tamanho.',
        'O que mais mudou foi o tamanho de um quadradinho: de {smallPerModuleMinChromium} a {smallPerModuleMaxChromium} pixels no pequeno, o menor no link longo, e de {largePerModuleMinChromium} a {largePerModuleMaxChromium} no grande. Os arquivos pesaram de {shortSmallBytesChromium} a {longLargeBytesChromium} no Chromium. Para imprimir, porém, o que conta são os milímetros de um quadradinho.',
      ],
    },
    {
      heading: 'A Oli no centro e a correção de erros no nível H',
      paragraphs: [
        'Um QR code leva dados extras que deixam um leitor reconstruir uma parte danificada. A DENSO WAVE descreve os níveis dessa correção de erros como L, M, Q e H: um nível mais alto corrige mais e deixa o código maior. Ela aponta o M como o nível mais escolhido, e o Q ou o H para lugares onde os códigos se sujam.',
        'O gerador sempre usa o H e põe parte dessa correção a serviço da Oli: ele não desenha os quadradinhos embaixo do quadrado branco dela e conta com a correção de erros para supri-los. A DENSO WAVE avisa que uma ilustração sobre um código aciona a correção de erros dele e pode deixar a leitura lenta ou impossível. A Oli cobriu entre {hiddenShareMinChromium} e {hiddenShareMaxChromium} dos quadradinhos escuros dos nossos textos, e o leitor leu de volta {readChromium} de {pngsChromium} PNGs no Chromium e {readWebkit} de {pngsWebkit} no WebKit.',
        'Essas porcentagens contam quadradinhos escuros, não as palavras de código com que a correção de erros trabalha, e o jsQR leu arquivos limpos, não uma impressão vista pela câmera de um celular. Quanto o nível H consegue reconstruir, e quando desligar a Oli, está na página do gerador; escanear uma prova impressa diz mais que a nossa tabela.',
      ],
    },
    {
      heading: 'Calculando o tamanho impresso',
      paragraphs: [
        'No papel, o lado de um código é o número de quadradinhos de uma borda à outra, com a margem, vezes o tamanho de um quadradinho. A DENSO WAVE pede uma margem livre de {densoMargin} de largura em todos os lados, e o gerador desenha uma em todo arquivo: medimos {quietZoneChromium} quadradinhos de cada lado. Com ela, o nosso link curto tem {shortSideChromium} quadradinhos de largura, e o link longo, {longSideChromium}.',
        'A DENSO WAVE resolve um exemplo: um código da versão {densoExampleVersion}, com {densoExampleModules} módulos de lado, impresso a {densoDpi} com {densoDots} por módulo, tem módulos de {densoModuleMm}, então o código mede {densoCodeMm} de lado e precisa de {densoAreaMm} com a margem. O nosso link curto tem essa mesma versão e essa mesma grade, então, impresso desse jeito, ocuparia essa mesma área.',
        'A página dela sobre o tamanho do módulo recomenda {densoMinDots} da impressora para cada módulo, e imprimir o código tão grande quanto o espaço permitir, já que um módulo maior é lido com mais facilidade. As perguntas frequentes dela põem o menor módulo que uma impressora a laser comum faz em cerca de {densoLaserModule}, o que dá a um código de {densoSmallestGrid} módulos cerca de {densoSmallestCode} de lado. Isso é o que uma impressora consegue desenhar, não o que um celular consegue ler do outro lado de uma sala: nenhuma das páginas da DENSO WAVE que lemos dá um tamanho mínimo para a leitura nem uma distância de leitura, então este guia não dá nenhum dos dois.',
      ],
    },
    {
      heading: 'Menos quadradinhos, quadradinhos maiores',
      paragraphs: [
        'No mesmo espaço, menos quadradinhos significam quadradinhos maiores. O texto é a parte que você controla: o nosso link longo gastou a maior parte dos seus {longBytes_exact} em parâmetros de campanha, a parte depois do ponto de interrogação.',
      ],
      list: [
        'Encurte o texto antes de criar o código: tire os parâmetros de que você não precisa e use um endereço mais curto da página, quando ela tiver um.',
        'Deixe a margem livre também no papel, sem texto, moldura ou imagem dentro dela.',
        'Imprima uma prova no tamanho que você planeja e escaneie com um celular de onde as pessoas vão estar.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'O que medimos',
  sheet: {
    stats: [
      { label: 'Quadradinhos por lado nos links', value: '{shortModulesChromium} a {longModulesChromium}' },
      { label: 'PNGs lidos com a Oli no centro', value: '{readChromium} de {pngsChromium}' },
    ],
    sample: '{texts} textos, cada um salvo em PNG pequeno, médio e grande.',
    link: 'Veja a tabela',
  },
  tableHeading: 'Texto a texto',
  measuredIntro: 'A primeira tabela traz os nossos {texts_word} textos e o código em que cada um se transformou, e a segunda, o PNG de cada texto em cada tamanho. A versão é a que o leitor encontrou, e os quadradinhos por lado não contam a margem.',
  measuredNote: 'Medido em {date} na página do Gerador de QR code deste site, no Chromium {chromiumVersion} e no WebKit {webkitVersion}, no {system}. Os dois navegadores desenharam o mesmo código para cada texto, e as tabelas mostram o Chromium; só os arquivos PNG foram diferentes, mais leves no WebKit, onde o link curto no tamanho pequeno pesou {shortSmallBytesWebkit}, contra {shortSmallBytesChromium}. Os caracteres e os bytes foram contados no Node, onde o jsQR, um leitor de QR code em JavaScript, leu cada PNG de volta e deu a versão dele.',
  // The shape of the front M5: the labels name the texts in the order of the measurement (the short link, the sentence
  // without accents, the same sentence with them, the long link).
  tables: [
    {
      heading: 'Os textos e os códigos deles',
      caption: 'Cada texto digitado no Gerador de QR code, no Chromium: os caracteres, os bytes que a ferramenta conta, a versão que o leitor encontrou, os quadradinhos de cada lado sem a margem e os quadradinhos escuros sob a Oli',
      head: ['Texto', 'Caracteres', 'Bytes', 'Versão', 'Quadradinhos por lado', 'Quadradinhos escuros sob a Oli'],
      labels: ['Link curto', 'Frase sem acentos', 'A mesma frase com acentos', 'Link longo'],
    },
    {
      heading: 'O PNG de cada texto em cada tamanho',
      caption: 'O PNG de cada texto em cada tamanho do Gerador de QR code, no Chromium: os pixels, os pixels de cada quadradinho e o tamanho do arquivo',
      head: ['Texto', 'Tamanho do PNG', 'Pixels', 'Pixels por quadradinho', 'Arquivo'],
    },
  ],
  sourcesHeading: 'Fontes',
  sources: [
    { id: 'denso-version', label: 'DENSO WAVE: Capacidade de informação e versões do QR code (em inglês)', href: 'https://www.qrcode.com/en/about/version.html', read: '2026-11-16' },
    { id: 'denso-error', label: 'DENSO WAVE: O recurso de correção de erros (em inglês)', href: 'https://www.qrcode.com/en/about/error_correction.html', read: '2026-11-16' },
    { id: 'denso-faq', label: 'DENSO WAVE: Perguntas frequentes (em inglês)', href: 'https://www.qrcode.com/en/faq.html', read: '2026-11-16' },
    { id: 'denso-area', label: 'DENSO WAVE: Como determinar a área do código (em inglês)', href: 'https://www.qrcode.com/en/howto/code.html', read: '2026-11-16' },
    { id: 'denso-module', label: 'DENSO WAVE: Como definir o tamanho do módulo (em inglês)', href: 'https://www.qrcode.com/en/howto/cell.html', read: '2026-11-16' },
  ],
  facts: {
    densoVersions: { text: '1 a 40', source: 'denso-version' },
    densoSmallestGrid: { text: '21 × 21', source: 'denso-version' },
    densoLargestGrid: { text: '177 × 177', source: 'denso-version' },
    densoStep: { text: '4', source: 'denso-version' },
    densoMargin: { text: '4 módulos', source: 'denso-area' },
    densoExampleVersion: { text: '3', source: 'denso-area' },
    densoExampleModules: { text: '29', source: 'denso-area' },
    densoDpi: { text: '400 dpi', source: 'denso-area' },
    densoDots: { text: '4 pontos', source: 'denso-area' },
    densoModuleMm: { text: '0,254 mm', source: 'denso-area' },
    densoCodeMm: { text: '7,366 mm', source: 'denso-area' },
    densoAreaMm: { text: '9,398 mm', source: 'denso-area' },
    densoMinDots: { text: '4 ou mais pontos', source: 'denso-module' },
    densoLaserModule: { text: '0,17 mm', source: 'denso-faq' },
    densoSmallestCode: { text: '3,57 mm', source: 'denso-faq' },
  },
  names: ['UTF-8'],
  relatedHeading: 'Ferramentas e guias relacionados',
};

export default texts;
