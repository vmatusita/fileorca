import type { QrPageTexts } from '../types.ts';

export default {
  title: 'Gerador de QR code para links e textos, em PNG ou SVG',
  description:
    'Crie um QR code de um link ou de qualquer texto no navegador, com a Oli no centro ou sem ela, e baixe em PNG ou SVG. Grátis, sem cadastro e sem upload.',
  h1: 'Gerador de QR code',
  seal: 'Seu texto nem sai do aparelho',
  howHeading: 'Como criar um QR code',
  howSteps: [
    'Digite ou cole um link, ou qualquer texto, na caixa. O código aparece enquanto você digita.',
    'Escolha se a Oli fica no centro e o tamanho do PNG.',
    'Baixe o PNG ou o SVG.',
    'Escaneie o código com a câmera do celular antes de compartilhar ou imprimir.',
  ],
  specsHeading: 'Especificações',
  specs: {
    caption: 'Gerador de QR code: o que aceita, o que gera e os limites',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Aceita', 'Um link ou qualquer texto, de até 1.273 caracteres. Cada letra com acento (como á, ç ou õ) conta como 2, e cada emoji conta como 4, porque o código guarda o texto em bytes UTF-8.'],
      ['Correção de erros', 'Nível H, o mais alto. O código continua legível com cerca de 30% dele coberto, e é isso que abre espaço para a Oli no centro.'],
      ['A Oli no centro', 'Vem ligada. O ícone do FileOrca fica num quadrado branco com cerca de 22% da largura do código. Desligue a opção para ter um código simples.'],
      ['PNG', 'Em três tamanhos: perto de 512 pixels de largura no pequeno, 1.024 no médio e 2.048 no grande. Cada quadradinho do código ganha um número inteiro de pixels, no mínimo 4, então o tamanho real aparece embaixo de cada opção.'],
      ['SVG', 'Um arquivo vetorial com os mesmos quadradinhos e a mesma Oli. Ele fica nítido em qualquer tamanho, de um cartão de visita a um pôster.'],
      ['Cores', 'Quadradinhos pretos sobre fundo branco, com uma margem branca de 4 quadradinhos em volta, como pede o padrão do QR code.'],
      ['Nomes dos arquivos', 'Sempre qr-code.png e qr-code.svg, nunca o seu texto.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Esses QR codes expiram?',
      a: 'Não. São códigos estáticos: cada um guarda o próprio link ou texto, sem passar por um link encurtado num servidor e sem rastreamento, então ninguém consegue desativá-lo depois. Ele funciona enquanto o link que está dentro dele funcionar.',
    },
    {
      q: 'Posso mudar o link depois de imprimir o código?',
      a: 'Não. Crie um código novo com o link novo e imprima esse.',
    },
    {
      q: 'O código continua funcionando com a Oli no centro?',
      a: 'Sim. Nos nossos testes, códigos de todos os tamanhos foram lidos de volta com a Oli no centro. Numa impressão muito pequena, desligue a Oli.',
    },
    {
      q: 'Por que um texto longo deixa o código mais denso?',
      a: 'Um QR code cresce conforme o que ele guarda. Um link curto como https://fileorca.com/pt/ cabe numa grade de 29 quadradinhos de lado, e o texto mais longo ocupa 177. Menos quadradinhos significam quadradinhos maiores, que a câmera lê de mais longe.',
    },
    {
      q: 'Devo baixar o PNG ou o SVG?',
      a: 'O PNG serve para uma tela, um slide ou um documento. O SVG serve para impressão e para programas de design.',
    },
    {
      q: 'Posso usar o código em produtos ou na minha empresa?',
      a: "Pode. O código é seu para usar onde quiser, sem marca d'água e sem precisar dar crédito.",
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seu texto fica no seu aparelho. O código é criado no seu navegador, e o texto nunca entra no endereço da página, em evento de medição, em cookie nem no armazenamento do navegador. O FileOrca nunca abre o link que você digita e nunca faz requisição a ele.',
  relatedHeading: 'Mais ferramentas',
  panel: {
    file: 'qr-code',
    field: {
      label: 'Link ou texto',
      placeholder: 'https://fileorca.com',
      help: 'Até {max} caracteres. Cada letra com acento (como á, ç ou õ) conta como 2, e cada emoji conta como 4.',
      count: '{count} de {max}',
    },
    oli: { legend: 'A Oli no centro', on: 'Ligada', off: 'Desligada' },
    size: {
      legend: 'Tamanho do PNG',
      small: 'Pequeno',
      medium: 'Médio',
      large: 'Grande',
      px: '{side} px',
      note: 'Cada quadradinho do código ganha pixels inteiros, então as bordas ficam nítidas.',
    },
    preview: {
      label: 'Prévia do seu QR code',
      empty: 'Seu QR code aparece aqui enquanto você digita.',
      ready: 'Seu QR code está pronto para baixar.',
    },
    download: { png: 'Baixar PNG', svg: 'Baixar SVG', pngMeta: '{side} × {side} px', wait: 'Ainda não há o que baixar: digite um link ou um texto.' },
    errors: {
      empty: 'Ops, ainda não há nada para pôr no código. Digite um link ou um texto.',
      long: 'Ops, esse texto passou de {max} caracteres, o máximo de um QR code. Cada letra com acento (como á, ç ou õ) conta como 2, e cada emoji conta como 4. Encurte o texto para continuar.',
      png: 'Ops, a Oli não conseguiu gerar o PNG. Tente um tamanho menor ou baixe o SVG.',
    },
  },
} satisfies QrPageTexts;
