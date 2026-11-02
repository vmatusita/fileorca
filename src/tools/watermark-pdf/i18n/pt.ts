import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { WatermarkTexts } from '../../pdf/option-texts.ts';

// Blocos da página Marca d'água no PDF (data-content: how, specs, faq, privacy, related) e os textos do painel que a ilha
// de PDF mostra. As linhas de especificação dizem o que o motor faz de verdade (src/engine/pdf/operations.ts): se os
// tamanhos, as opacidades ou a fonte mudarem lá, mude aqui e no inglês. O texto padrão vai para dentro do PDF, então só
// usa caracteres WinAnsi (F6, decisão 4).
const texts: PdfToolTexts<WatermarkTexts> = {
  title: "Marca d'água no PDF: carimbe um texto nas páginas no navegador",
  description:
    "Carimbe uma marca d'água de texto, como CONFIDENCIAL, em todas as páginas dos seus PDFs, com o tamanho, a opacidade e a direção. Nada sai do seu aparelho.",
  h1: "Marca d'água no PDF",
  howHeading: 'Como funciona',
  howSteps: [
    'Solte seus PDFs na caixa, escolha os arquivos ou cole, quantos quiser.',
    "Digite o texto da marca d'água e escolha o tamanho, a força e se ela fica na diagonal ou na horizontal.",
    "Aperte Adicionar marca d'água: a Oli carimba o texto em todas as páginas no seu navegador, e você baixa um PDF ou todos juntos num ZIP.",
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: "O que a Marca d'água no PDF recebe e entrega",
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Arquivos', 'Arquivos PDF, quantos quiser. A Oli confere o que há dentro de cada arquivo, não o nome dele. Vários resultados são baixados juntos num ZIP só.'],
      ['Tipo de marca', "Só texto. Esta ferramenta não coloca marca d'água de imagem."],
      ['Onde fica', 'No centro de cada página, em cinza. A posição segue a página como ela aparece na tela, com a área de corte e o giro.'],
      ['Tamanho', 'Pequeno, Médio ou Grande: o texto ocupa cerca de 35%, 55% ou 80% da diagonal da página, ou da largura quando a marca é horizontal. Uma palavra curta nunca fica mais alta que um terço da página.'],
      ['Opacidade', 'A opção Clara é 15%, a Média é 30% (o padrão) e a Forte é 50%. Quanto mais clara a marca, mais fácil ler a página por baixo.'],
      ['Direção', 'A diagonal fica a 45° na tela. A horizontal atravessa a página em linha reta.'],
      ['Fonte e caracteres', 'Helvetica Bold. Funcionam as letras do alfabeto latino básico e os acentos comuns, e as aspas curvas e os travessões viram aspas retas e hífen. Os outros caracteres ficam de fora da marca, e a ajuda embaixo do campo de texto avisa.'],
      ['Como entra', 'A marca é desenhada na própria página, não numa camada que sai com um clique. Quem tem um editor de PDF ainda consegue tirar a marca, então ela identifica o arquivo, mas não tranca.'],
      ['O que fica', 'Os campos de formulário, os links, os marcadores e as propriedades do documento ficam como eram. Só a camada de formulário XFA, que a maioria dos programas de PDF não lê, sai; os campos de formulário comuns continuam funcionando.'],
      ['PDFs protegidos', 'Um PDF com senha para abrir, ou com restrições, é recusado com um link para Desbloquear PDF. Os seus arquivos originais nunca mudam.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: "Posso usar uma imagem ou um logo como marca d'água?",
      a: "Aqui não. Esta ferramenta só coloca marca d'água de texto, como CONFIDENCIAL, RASCUNHO ou um nome. Se você precisa de um logo em todas as páginas, use um editor de PDF.",
    },
    {
      q: "Alguém consegue tirar a marca d'água?",
      a: 'A marca é desenhada no conteúdo de cada página, então ela não sai com um clique, como sairia uma camada separada. Quem tem um editor de PDF ainda consegue tirar a marca. Se o objetivo é impedir que as pessoas abram o arquivo, coloque uma senha.',
    },
    {
      q: "Por que faltam alguns caracteres na minha marca d'água?",
      a: 'A Oli desenha a marca em Helvetica Bold, que cobre o alfabeto latino básico e as letras com os acentos comuns. Outros caracteres, como letras cirílicas, gregas ou chinesas, ficam de fora, e a ajuda embaixo do campo de texto avisa quando isso acontece. Se não sobrar nada para desenhar, a Oli pede outro texto.',
    },
    {
      q: 'Meu PDF é enviado para algum lugar?',
      a: "Não. A Oli lê cada PDF e grava o novo no seu aparelho, no navegador. Nada vai para um servidor, e o texto que você digita para a marca d'água também fica no seu aparelho.",
    },
    {
      q: "A marca d'água muda o resto do meu PDF?",
      a: 'Não. Os campos de formulário, os links, os marcadores e as propriedades do documento ficam como eram, e a marca é desenhada por cima da página. A única coisa que sai é a camada de formulário XFA, que a maioria dos programas de PDF não lê; os campos de formulário comuns continuam funcionando.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    "Seus PDFs e o texto da marca d'água são tratados no seu aparelho, no navegador, e nunca são enviados a um servidor.",
  relatedHeading: 'Ferramentas relacionadas',
  panel: {
    suffix: 'marca-dagua',
    note: 'PDFs, quantos quiser',
    progressLabel: "Colocando as marcas d'água",
    done: "Prontinho! A Oli colocou a marca d'água no seu PDF.",
    doneMany: "Prontinho! A Oli colocou a marca d'água em {count} PDFs.",
    action: "Adicionar marca d'água",
    options: {
      textLabel: "Texto da marca d'água",
      textHelp: 'Funcionam as letras do alfabeto latino básico e os acentos comuns. Os outros caracteres ficam de fora da marca.',
      textError: 'A marca precisa de um texto que a Oli consiga desenhar. Digite letras ou números do alfabeto latino básico.',
      defaultText: 'CONFIDENCIAL',
      sizeLegend: 'Tamanho',
      small: 'Pequeno',
      medium: 'Médio',
      large: 'Grande',
      opacityLegend: 'Opacidade',
      light: 'Clara',
      mediumOpacity: 'Média',
      strong: 'Forte',
      directionLegend: 'Direção',
      diagonal: 'Diagonal',
      horizontal: 'Horizontal',
    },
  },
};

export default texts;
