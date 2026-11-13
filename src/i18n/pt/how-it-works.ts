import type { HowItWorksTexts } from '../types.ts';

// F19a (decisão 7; DECISOES § 759 a § 761): a página Como funciona, com as mesmas chaves do inglês. Cada frase tem a prova
// dela no tests/unit/how-it-works.test.ts; os passos de cada navegador vêm da documentação oficial lida em 13/nov/2026
// (§ 760), com os nomes da interface em português onde a documentação traz (a ferramenta Rede e a coluna Domínio do Edge,
// a opção do Safari) e uma descrição onde ela só existe em inglês (o monitor de rede do Firefox, a aba de rede do Safari).
export default {
  title: 'Como o FileOrca funciona: o que acontece com o seu arquivo',
  description: 'O que acontece com o arquivo que você abre no FileOrca, o que roda em WebAssembly, o que vai pela rede e o que nunca vai, e como conferir no navegador.',
  h1: 'Como o FileOrca funciona',
  intro: 'As ferramentas do FileOrca rodam no seu navegador. Esta página mostra o que acontece com o seu arquivo, que código faz o trabalho, o que passa pela rede e o que nunca passa, e como você mesmo pode conferir.',
  file: {
    heading: 'O que acontece com o seu arquivo',
    paragraphs: [
      {
        open: 'Quando você abre uma ferramenta, o navegador baixa a página e o código dela de fileorca.com.',
        read: 'Quando você escolhe ou solta um arquivo, o navegador lê esse arquivo na própria memória, no seu aparelho.',
        work: 'A ferramenta faz o trabalho ali mesmo, com o código que o navegador baixou de fileorca.com.',
        result: 'O resultado também nasce ali, e o Baixar salva esse resultado da memória do navegador no seu aparelho.',
        nothing: 'O arquivo em si nunca é enviado: nenhuma requisição da página leva o arquivo.',
      },
      {
        numbers: 'As calculadoras fazem o mesmo com os números que você digita: eles ficam no seu aparelho.',
        address: 'Eles nunca entram no endereço da página, e nenhum evento do Analytics leva esses números.',
        hash: 'O Copiar link põe os números depois do # do link copiado, a parte do endereço que o navegador guarda para si e nunca manda a um servidor.',
      },
      {
        qr: 'O gerador de QR code desenha o código no seu navegador, e o texto que você digita não vai a lugar nenhum.',
      },
    ],
  },
  wasm: {
    heading: 'O que roda em WebAssembly',
    paragraphs: [
      {
        what: 'Parte do trabalho é feita por bibliotecas compiladas para WebAssembly, que o navegador roda como o resto do código da página.',
        table: 'A tabela lista essas bibliotecas e é montada a partir dos arquivos que o site serve: cada arquivo de WebAssembly tem a sua linha, e cada linha tem os seus arquivos.',
        same: 'Cada um desses arquivos é o que a biblioteca publica, sem mudança nenhuma, e vem de fileorca.com.',
      },
    ],
    table: {
      caption: 'As bibliotecas que fazem o trabalho no seu navegador',
      library: 'Biblioteca',
      does: 'O que faz',
      tools: 'Ferramentas que podem usar',
      wasm: 'WebAssembly',
      js: 'JavaScript',
      files: 'Arquivos: {files}',
      license: 'Licença: {pkg}',
    },
    does: {
      mozjpeg: 'Lê e grava arquivos JPEG.',
      libwebp: 'Lê e grava arquivos WebP.',
      oxipng: 'Deixa um PNG menor sem mudar nenhum pixel.',
      resize: 'Redimensiona uma imagem.',
      libheif: 'Lê fotos HEIC.',
      libavif: 'Lê e grava arquivos AVIF.',
      qpdf: 'Reescreve e comprime arquivos PDF, e põe ou tira uma senha.',
      jbig2: 'Dentro do PDF.js, lê as imagens JBIG2 e CCITT de um PDF.',
      openjpeg: 'Dentro do PDF.js, lê as imagens JPEG 2000 de um PDF.',
      pdfjs: 'Desenha as páginas de um PDF.',
      'pdf-lib': 'Monta e edita arquivos PDF.',
    },
    after: [
      {
        native: 'Para ler uma imagem, a ferramenta pede primeiro ao navegador; o WebAssembly entra quando a imagem é grande demais para o navegador desenhar de uma vez e quando o navegador não lê o formato dela.',
        js: 'O PDF.js, que desenha as páginas de um PDF, e o pdf-lib, que monta e edita arquivos PDF, são JavaScript; só os dois decodificadores de imagem de dentro do PDF.js são WebAssembly.',
        threads: 'Nenhuma biblioteca daqui usa memória compartilhada, então nenhuma página precisa dos cabeçalhos de isolamento que alguns sites pedem ao navegador.',
        licenses: 'A página {licenses} traz a licença de cada biblioteca; a libheif, que é LGPL-3.0, fica num arquivo separado, sem mudança.',
      },
    ],
  },
  network: {
    heading: 'O que vai pela rede e o que nunca vai',
    paragraphs: [
      {
        page: 'O navegador baixa de fileorca.com os arquivos de cada página que você abre: a página, os scripts, os estilos e as fontes e, na primeira vez que você usa uma ferramenta, o motor dela.',
        analytics: 'Em fileorca.com, a página também carrega o Google Analytics, que conta as visitas e uma lista curta e fechada de eventos, como o nome da ferramenta que você usou.',
        consent: 'O aviso de cookies decide só o que o Google Analytics pode guardar no navegador: recusar não desliga o Analytics, que passa a funcionar sem cookies.',
        ads: 'Quando os anúncios estiverem ligados, o Google vai mostrá-los em páginas como as das ferramentas e dos guias, como a página {privacy} descreve; esta página não tem anúncio.',
      },
      {
        never: 'O que nunca sai do seu aparelho: o arquivo, o nome dele, a senha de um PDF e os números e textos que você digita.',
        privacy: 'A página {privacy} conta tudo o que é coletado, por quem e quais são os seus direitos.',
      },
    ],
  },
  check: {
    heading: 'Como conferir no navegador',
    paragraphs: [
      {
        intro: 'As ferramentas de desenvolvedor do navegador listam as requisições que a página faz, então você pode ver o que a ferramenta envia enquanto trabalha.',
      },
    ],
    chrome: {
      heading: 'Chrome e Edge',
      steps: {
        open: 'Abra a ferramenta, pressione Ctrl+Shift+J, ou Command+Option+J no Mac, e clique na aba Rede.',
        before: 'A lista só se preenche com essas ferramentas abertas, então abra antes de escolher o arquivo.',
        domain: 'Para ver aonde vai cada requisição, clique com o botão direito no cabeçalho da lista e escolha Domínio.',
      },
    },
    firefox: {
      heading: 'Firefox',
      steps: {
        open: 'Abra a ferramenta e pressione Ctrl+Shift+E, ou Cmd+Opt+E no Mac, para abrir o monitor de rede.',
        before: 'Ele registra as requisições enquanto essas ferramentas estão abertas, então abra antes de escolher o arquivo.',
        domain: 'A coluna do domínio mostra aonde vai cada requisição; com o botão direito no cabeçalho da lista, você mostra ou esconde uma coluna.',
      },
    },
    safari: {
      heading: 'Safari no Mac',
      steps: {
        settings: 'Escolha Safari > Ajustes, clique em Avançado e marque a opção "Mostre recursos para desenvolvedores da web".',
        open: 'Abra a ferramenta, pressione Option+Command+I para abrir o Web Inspector e clique na aba de rede.',
        before: 'Essa aba lista as requisições feitas desde que o Web Inspector abriu, com o domínio de cada uma, então abra antes de escolher o arquivo.',
      },
    },
    watch: {
      heading: 'Depois, em qualquer um deles',
      steps: {
        use: 'Escolha o arquivo e deixe a ferramenta trabalhar.',
        rows: 'As requisições novas são arquivos de fileorca.com de que a ferramenta precisa, como o motor dela, e, em fileorca.com, os eventos do Analytics da parte anterior.',
        none: 'Nenhuma delas leva o seu arquivo.',
      },
    },
    phone: {
      heading: 'No celular',
      steps: {
        load: 'Abra a ferramenta com a internet ligada e use uma vez com um arquivo, para a página e o motor dela carregarem.',
        airplane: 'Ligue o modo avião e use a ferramenta com outro arquivo: ela continua funcionando, sem rede nenhuma.',
      },
    },
  },
  limits: {
    heading: 'O que o teste não prova',
    paragraphs: [
      {
        extension: 'Uma extensão instalada no navegador pode ler as páginas que você abre, esta também: o teste vale para a página, não para tudo o que roda no navegador.',
        again: 'Ele também vale só para a página que você tem aberta, então você pode refazer o teste quando quiser.',
      },
    ],
  },
} satisfies HowItWorksTexts;
