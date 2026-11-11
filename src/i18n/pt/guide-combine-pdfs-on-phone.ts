import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Como juntar PDFs no celular, no iPhone ou no Android',
  description: 'Os jeitos de juntar vários PDFs num só no iPhone ou num celular Android, quanto pesa o arquivo juntado e o que ele mantém de cada PDF.',
  h1: 'Como juntar PDFs no celular',
  lead: 'Você tem alguns PDFs no celular e precisa enviar tudo como um arquivo só. Veja os jeitos de fazer isso no próprio celular, sem computador, e o que esperar do resultado.',
  changed: 'Primeira versão deste guia, publicada em {published}. Os números foram medidos de novo em {measured}.',
  intro: [
    'Formulários, recibos, uma página assinada e o escaneamento de um documento de identidade podem chegar como PDFs separados, e o lugar para onde você precisa mandar aceita um arquivo só. No computador, há muitos jeitos de juntar tudo. No celular há menos, e eles dependem do aparelho.',
    'Este guia mostra o jeito que a Apple documenta para o iPhone, o jeito que funciona no navegador de qualquer celular e o que medimos ao juntar {pairs_word} pares dos nossos PDFs de teste.',
  ],
  toolHeading: 'Junte seus PDFs aqui',
  toolIntro: 'Escolha os PDFs no seu celular, arraste cada um para a ordem que você quer e toque em Juntar PDFs. Eles são juntados nesta aba do navegador, no próprio celular, e nada é enviado.',
  sections: [
    {
      heading: 'No iPhone, com o app Pré-Visualização',
      paragraphs: [
        'O Manual de Uso do iPhone, da Apple, explica como adicionar páginas a um PDF no app Pré-Visualização: abra o PDF, mantenha o toque sobre a miniatura de uma página e toque em Inserir de Arquivo para trazer outro PDF ou uma imagem. Para mudar a ordem, mantenha o toque numa miniatura e arraste para cima ou para baixo de outra.',
        'Isso funciona bem para acrescentar um arquivo a outro. Com vários arquivos, você repete a inserção para cada um, e o resultado é o PDF do começo com as páginas novas acrescentadas.',
      ],
    },
    {
      heading: 'Num celular Android',
      paragraphs: [
        'A ajuda do app Google Drive explica como digitalizar papel para um PDF: você digitaliza uma página, toca em Adicionar para digitalizar outra e salva o resultado em PDF. É um bom jeito de transformar várias folhas de papel num arquivo só, mas ele cria um PDF novo a partir da câmera. Ele não junta os PDFs que você já tem no celular.',
        'Para arquivos que já são PDF, o navegador é o lugar mais simples para fazer isso no Android, com a ferramenta desta página.',
      ],
    },
    {
      heading: 'Em qualquer celular, no navegador',
      paragraphs: [
        'A Juntar PDF desta página roda no navegador do celular, então funciona igual no iPhone e no Android. Toque para escolher os arquivos, no app Arquivos do iPhone ou entre os arquivos que você baixou no Android, coloque-os em ordem e toque em Juntar PDFs. O PDF juntado é baixado como qualquer outro arquivo.',
        'Os arquivos não são enviados a nenhum servidor: o celular faz o trabalho, então documentos particulares ficam nele.',
      ],
    },
    {
      heading: 'Quanto pesa o arquivo juntado',
      paragraphs: [
        'Juntamos {pairs} pares dos nossos PDFs de teste e comparamos o arquivo juntado com os dois arquivos de origem. O arquivo juntado nunca ficou maior que os dois somados, e saiu menor em {smaller} dos {pairs} pares, com diferenças bem desiguais.',
        'Nosso PDF de fotos com a página de livro escaneada, e o relatório da NASA escaneado com essa mesma página, saíram logo abaixo da soma dos dois: {photosScanMerged_exact} contra {photosScanInputs_exact}, e {reportScanMerged_exact} contra {reportScanInputs_exact}. Um PDF tem alguma estrutura em volta das páginas, e o arquivo juntado precisa dessa estrutura uma vez em vez de duas; as imagens ficam como estavam. As notas de aula com o formulário do IRS saíram {bookFormRatio_off} menores.',
      ],
    },
    {
      heading: 'Quando o arquivo juntado fica bem menor',
      paragraphs: [
        'A página de livro escaneada com o formulário do IRS saiu {scanFormRatio_off} menor que os dois arquivos somados. O formulário leva uma segunda descrição de si mesmo, num formato chamado XFA, que só alguns programas leem, e a Juntar PDF deixa essa descrição de fora; o resultado avisa isso ao lado do arquivo. Os campos do formulário em si continuam lá, então o formulário ainda pode ser preenchido. Nosso PDF com páginas de tamanhos diferentes e nosso PDF com links e ações saíram {mixedActionsRatio_off} menores juntos: o nosso script de teste escreveu os dois sem compactar a estrutura, e o arquivo juntado é escrito compactado.',
        'Nada mais fica de fora de propósito. Os marcadores e os links vêm junto, e um campo cujo nome já existe em outro arquivo ganha um número no nome, para os dois continuarem funcionando.',
      ],
    },
    {
      heading: 'Antes de juntar',
      paragraphs: [
        'Coloque os arquivos na ordem em que a pessoa deve ler, e tire antes as páginas que não precisam ir: um PDF juntado é mais fácil de conferir do que de consertar. Um PDF que pede senha precisa ser salvo sem ela antes de entrar na junção, e a Desbloquear PDF faz isso; a Juntar PDF avisa qual arquivo está bloqueado.',
        'Se o arquivo juntado ficar grande demais para enviar, comprima depois. Juntar não deixa os arquivos mais leves por si só, fora a economia que vimos acima.',
      ],
    },
    {
      heading: 'Como mandar o PDF juntado',
      paragraphs: [
        'Uma conta pessoal do Gmail envia anexos de até {gmailLimit}; acima disso, o Gmail troca o anexo por um link do Google Drive. Se o seu PDF juntado estiver perto do limite, a Comprimir PDF pode deixá-lo abaixo. Nas medidas do nosso guia sobre PDFs grandes, ela deixou bem mais leves um PDF de fotos e uma página colorida escaneada, e um escaneamento em preto e branco só um pouco; aquele guia traz cada nível em cada arquivo.',
        'Confira o arquivo juntado antes de mandar: abra, passe por todas as páginas e veja se a ordem está certa. Leva um minuto, e é muito mais fácil do que explicar depois uma página que ficou faltando.',
      ],
    },
  ],
  half: 4,
  measuredHeading: 'O que medimos',
  sheet: {
    stats: [
      { label: 'Pares que ficaram menores', value: '{smaller} de {pairs}' },
      { label: 'A página escaneada com o formulário', value: '{scanFormRatio_change}', from: '{scanFormInputs}', to: '{scanFormMerged}' },
    ],
    sample: '{pairs} pares feitos com {pdfs} dos nossos PDFs de teste.',
    link: 'Veja a tabela',
  },
  tableHeading: 'Par a par',
  measuredIntro: 'Juntamos {pairs_word} pares feitos com {pdfs_word} dos nossos PDFs de teste, na ordem mostrada. A variação compara o arquivo juntado com os dois arquivos somados.',
  measuredNote: 'Medido em {date} no Node com o motor deste site, que dá os mesmos bytes que o navegador, em pares dos PDFs dos nossos testes.',
  tables: [
    {
      heading: 'Pares juntados',
      caption: 'Cada par de PDFs: os dois arquivos somados, o arquivo juntado e a variação',
      head: ['Arquivos', 'Somados', 'Juntado', 'Variação'],
    },
  ],
  sourcesHeading: 'Fontes',
  sources: [
    { id: 'google-drive-scan', label: 'Ajuda do Google Drive: Digitalizar documentos com o Google Drive', href: 'https://support.google.com/drive/answer/3145835?hl=pt-BR&co=GENIE.Platform%3DAndroid', read: '2026-11-03' },
    { id: 'gmail', label: 'Ajuda do Gmail: Enviar anexos na mensagem do Gmail', href: 'https://support.google.com/mail/answer/6584?hl=pt-BR', read: '2026-11-03' },
    { id: 'apple-preview', label: 'Manual de Uso do iPhone: Adicione, apague, gire, mova ou recorte páginas em PDFs no app Pré-Visualização do iPhone', href: 'https://support.apple.com/pt-br/guide/iphone/iphbf4977cff/ios', read: '2026-11-03' },
    { id: 'apple-files', label: 'Manual de Uso do iPhone: Organize arquivos e pastas no app Arquivos do iPhone', href: 'https://support.apple.com/pt-br/guide/iphone/iphab82e0798/ios', read: '2026-11-03' },
  ],
  facts: {
    gmailLimit: { text: '25 MB', source: 'gmail' },
  },
  names: [],
  relatedHeading: 'Ferramentas e guias relacionados',
};

export default texts;
