import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Como assinar um PDF sem imprimir e o que é essa assinatura',
  description: 'Assine um PDF desenhando, escolhendo uma imagem ou digitando seu nome: o que é essa assinatura, como ela difere da que tem certificado e o que mudou nos nossos PDFs.',
  h1: 'Como assinar um PDF sem imprimir',
  lead: 'Desenhe, escolha uma imagem ou digite: a assinatura vai para a página como imagem. O que ela é, o que não é e o que mudou nos nossos arquivos.',
  changed: 'Primeira versão deste guia, publicada em {published}.',
  intro: [
    'Você não precisa de impressora para assinar um PDF. No papel, você imprime as páginas, assina com caneta e escaneia de volta, e o que você manda é uma foto de cada folha. Assinar o próprio PDF mantém as páginas como estão e acrescenta a sua assinatura por cima das que você escolher.',
    'Essa assinatura é uma imagem. Um PDF também pode levar outro tipo, a assinatura digital com certificado, que esta ferramenta não faz.',
  ],
  toolHeading: 'Assine o PDF aqui',
  toolIntro: 'Solte um PDF, faça a sua assinatura do jeito que preferir, coloque-a na prévia e aperte Assinar PDF. Você recebe uma cópia assinada para baixar.',
  sections: [
    {
      heading: 'A assinatura na página e a assinatura digital',
      paragraphs: [
        'O que a Assinar PDF põe na página é uma imagem: os traços que você desenhou, a imagem que você escolheu ou o seu nome desenhado com a fonte do site. Ela fica na página como um carimbo fica no papel. Quem abre o PDF a vê, e nada no arquivo a liga a você ou ao momento em que você assinou.',
        'Uma assinatura digital é outra coisa. O NIST, a agência de padrões dos Estados Unidos, diz no seu padrão de assinatura digital que as assinaturas digitais servem para detectar modificações não autorizadas nos dados e para autenticar a identidade de quem assina. Uma assinatura assim é feita a partir dos bytes do arquivo com uma chave privada que só quem assina controla, e um certificado liga a chave pública correspondente ao seu dono.',
        'A Assinar PDF não guarda chave nem certificado, então não consegue fazer esse tipo de assinatura. Para ter uma assim, você precisa de um serviço de assinatura que trabalhe com certificados.',
      ],
    },
    {
      heading: 'O que a assinatura mudou nos nossos arquivos',
      paragraphs: [
        'Assinamos {files_word} PDFs de teste em todas as páginas, uma vez de cada um dos {modes_word} jeitos, no Chromium e no WebKit, e lemos de volta cada cópia assinada. Cada página assinada ganhou uma imagem, e o texto dela ficou como estava: o texto que um leitor extrai de cada página foi o mesmo nas {textKeptChromium_wordf} cópias assinadas no Chromium e nas {textKeptWebkit_wordf} assinadas no WebKit. Ele ainda pode ser buscado, selecionado e copiado.',
        'O nosso Formulário 1040 do IRS tem {formFields} campos para preencher, e todos eles continuavam em cada cópia assinada. A camada XFA dele, uma segunda cópia do formulário que alguns programas de computador leem, não sobreviveu: a Assinar PDF a tirou e avisou isso ao lado do arquivo nas {formXfaNoteChromium_wordf} cópias assinadas no Chromium.',
        'Também procuramos um dicionário de assinatura e um intervalo de bytes, as partes de um PDF que guardam uma assinatura digital e o trecho de bytes que ela sela. Nas cópias assinadas no Chromium, contamos {newSigDictsChromium} dicionários de assinatura novos e {newByteRangesChromium} intervalos de bytes novos.',
      ],
    },
    {
      heading: 'Desenhar, escolher uma imagem ou digitar: o que cada jeito acrescentou',
      paragraphs: [
        'Desenhar: assine na caixa com o dedo, uma caneta ou o mouse. Nos nossos arquivos, uma assinatura desenhada acrescentou de {drawAddedMinChromium} a {drawAddedMaxChromium} no Chromium. Os mesmos traços, desenhados pelo mesmo script no WebKit, pesaram mais: de {drawAddedMinWebkit} a {drawAddedMaxWebkit}.',
        'Imagem: escolha um PNG ou um JPG da sua assinatura. Um PNG com fundo transparente põe na página só a tinta, enquanto um JPG leva junto o retângulo inteiro. A nossa imagem de teste não é uma assinatura de verdade, mas uma imagem de {signatureImageWidth} por {signatureImageHeight} pixels, com {signatureImageBytes} em PNG, e a ferramenta a salva de novo antes de ela ir para a página. O PDF de {mixedPages_wordf} páginas cresceu {mixedUploadAddedChromium_exact} e o formulário de {formPages_wordf} páginas, {formUploadAddedChromium_exact}, quase o mesmo: a imagem entrou uma vez só em cada arquivo, não importa quantas páginas a mostrem. Mesmo assim, ela levou o nosso PDF de páginas de tamanhos diferentes de {mixedBefore} para {mixedUploadChromium}, então recorte a foto ou o escaneamento da sua assinatura até a tinta antes de escolher a imagem.',
        'Digitar: escreva o seu nome, e a ferramenta o desenha como imagem, com a fonte do site. Em cada um dos nossos PDFs, foi o jeito que menos acrescentou: de {typeAddedMinChromium} a {typeAddedMaxChromium} no Chromium.',
        'Depois, arraste a caixa até o lugar certo e escolha as páginas: esta página, todas as páginas ou as que você marcar. Quando mais de uma pessoa precisa assinar, a primeira assina e baixa, e a seguinte abre aqui a cópia assinada e acrescenta a assinatura dela.',
      ],
    },
    {
      heading: 'Assinar um arquivo que já está assinado',
      paragraphs: [
        'O formulário do IRS da nossa amostra já trazia um selo do tipo digital: uma assinatura de direitos de uso, com um intervalo de bytes que cobria o arquivo inteiro. Depois da Assinar PDF, esse selo continuava dentro das {formUsageRightsAfterChromium_wordf} cópias assinadas no Chromium, mas o intervalo de bytes dele já não cobria o arquivo. Uma assinatura digital é feita para notar mudanças, e pôr uma imagem na página é uma mudança.',
        'Então, antes de assinar aqui um PDF que já tem uma assinatura digital, pergunte a quem mandou o arquivo como ele deve ser assinado.',
      ],
    },
    {
      heading: 'O PDF assinado vai ser aceito?',
      paragraphs: [
        'No Brasil, a Lei nº 14.063 trata da assinatura eletrônica nas interações com os entes públicos. Ela define a assinatura eletrônica como os dados em formato eletrônico que se ligam ou estão logicamente associados a outros dados em formato eletrônico e que o signatário usa para assinar. E separa a assinatura simples, que permite identificar quem assina; a avançada, associada a quem assina de maneira unívoca e na qual qualquer modificação posterior é detectável; e a qualificada, que usa um certificado digital da ICP-Brasil. O nível mínimo exigido é fixado por ato de cada Poder, e a qualificada é admitida em qualquer interação eletrônica com um ente público.',
        'A mesma lei diz que essas regras não se aplicam à interação entre pessoas naturais ou entre pessoas jurídicas de direito privado. Já a Medida Provisória nº 2.200-2, que criou a ICP-Brasil, trata dos documentos eletrônicos públicos ou particulares: as declarações de um documento feito com a certificação dela se presumem verdadeiras em relação a quem assinou, e isso não impede outro meio de comprovar a autoria e a integridade, desde que as partes o admitam como válido ou que a pessoa a quem o documento for oposto o aceite. A assinatura feita pela Assinar PDF não usa certificado nenhum.',
        'Então, se o seu PDF assinado vai ser aceito depende de quem o recebe, do tipo de documento e da lei do lugar, que fora do Brasil é outra. Este guia não é orientação jurídica, e nenhum arquivo garante que uma assinatura vale. Quando isso importar, pergunte à pessoa ou ao órgão que pede a sua assinatura qual tipo aceita: uma imagem na página ou uma assinatura digital com certificado.',
      ],
    },
  ],
  half: 2,
  measuredHeading: 'O que medimos',
  sheet: {
    stats: [
      { label: 'Peso da assinatura desenhada', value: '{drawAddedMinChromium} a {drawAddedMaxChromium}' },
      { label: 'Assinaturas digitais novas', value: '{newSigDictsChromium}', sub: 'em {signedChromium} cópias assinadas de {files} PDFs' },
    ],
    sample: '{files} PDFs de teste, com cada página assinada dos {modes_word} jeitos.',
    link: 'Veja a tabela',
  },
  tableHeading: 'PDF por PDF',
  measuredIntro: 'Na tabela, cada linha é um dos nossos {files_word} PDFs de teste assinado de um dos jeitos, no Chromium; com o PNG que escolhemos, a amostra tem {testFiles_word} arquivos. Antes da assinatura, o PDF com páginas de tamanhos diferentes pesava {mixedBefore}, o PDF feito de fotos {photosBefore} e o formulário {formBefore}.',
  measuredNote: 'Medido em {date} pela página Assinar PDF deste site, no Chromium {chromiumVersion} e no WebKit {webkitVersion} no {system}, com a assinatura desenhada com o mouse por um script e o nome digitado como Oli Orca. As cópias assinadas foram lidas de volta no Node com o PDF.js e o pdf-lib. A tabela mostra as cópias assinadas no Chromium.',
  tables: [
    {
      heading: 'Cada PDF assinado de cada jeito',
      caption: 'Cada PDF de teste assinado em todas as páginas no Chromium, jeito por jeito: o tamanho do arquivo assinado e o que a assinatura acrescentou',
      head: ['PDF', 'Assinatura', 'Arquivo assinado', 'Acrescentado'],
      labels: ['Desenhada', 'Imagem escolhida', 'Nome digitado'],
    },
  ],
  sourcesHeading: 'Fontes',
  sources: [
    { id: 'lei-14063', label: 'Planalto: Lei nº 14.063, de 23 de setembro de 2020', href: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/lei/L14063.htm', read: '2026-11-16' },
    { id: 'mp-2200-2', label: 'Planalto: Medida Provisória nº 2.200-2, de 24 de agosto de 2001', href: 'https://www.planalto.gov.br/ccivil_03/mpv/antigas_2001/2200-2.htm', read: '2026-11-16' },
    { id: 'nist-fips-186-5', label: 'NIST: FIPS 186-5, o padrão de assinatura digital (em inglês)', href: 'https://csrc.nist.gov/pubs/fips/186-5/final', read: '2026-11-16' },
    { id: 'nist-certificate', label: 'Glossário do NIST CSRC: certificado de chave pública (em inglês)', href: 'https://csrc.nist.gov/glossary/term/public_key_certificate', read: '2026-11-16' },
  ],
  facts: {},
  names: ['Lei nº 14.063, de 23 de setembro de 2020', 'Medida Provisória nº 2.200-2, de 24 de agosto de 2001', 'Lei nº 14.063', 'Medida Provisória nº 2.200-2', 'FIPS 186-5', 'Formulário 1040'],
  relatedHeading: 'Ferramentas e guias relacionados',
};

export default texts;
