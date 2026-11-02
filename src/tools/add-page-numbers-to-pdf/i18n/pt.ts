// Blocos da página Numerar páginas do PDF (how, specs, faq, privacy) e os textos que esta ferramenta soma aos do painel
// de PDF. As linhas de especificação dizem o que o motor faz de verdade (src/engine/pdf/): se a fonte, o tamanho, a
// margem ou os formatos mudarem lá, mude aqui e no inglês. As palavras da numeração ("Página" e "de") vão para dentro
// do PDF, então só usam caracteres WinAnsi (F6, decisão 4).
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { NumbersTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<NumbersTexts> = {
  title: 'Numerar páginas do PDF: ponha número nas páginas no navegador',
  description:
    'Numere as páginas de PDFs no navegador, escolhendo a posição, o formato e o primeiro número. Sem upload, e os formulários, links e marcadores ficam no lugar.',
  h1: 'Numerar páginas do PDF',
  howHeading: 'Como funciona',
  howSteps: [
    'Solte seus PDFs na caixa, escolha os arquivos ou cole com Ctrl V, quantos quiser.',
    'Escolha onde o número fica, o formato e o número de partida, e a Oli numera cada arquivo no seu navegador, refazendo o lote se você mudar uma escolha.',
    'Baixe um PDF ou todos juntos num ZIP, e os seus arquivos originais continuam intactos.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Numerar páginas do PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['O que aceita', 'Arquivos PDF, quantos quiser. A Oli confere o que há dentro do arquivo, não o nome dele.'],
      ['Posição', 'Seis lugares: em cima ou embaixo, e à esquerda, no centro ou à direita. O padrão é embaixo no centro.'],
      ['Formato', 'Quatro formatos: "1", "Página 1", "Página 1 de 12" e "1 de 12". As palavras "Página" e "de" saem em português, como nos exemplos.'],
      ['Primeiro número', 'Qualquer número inteiro de 1 a 9.999. O padrão é 1.'],
      ['Pular a primeira página', 'A primeira página fica sem número, e a segunda recebe o primeiro número que você escolheu. Nos formatos com "de", o total é o número da última página.'],
      ['Aparência do número', 'Helvetica, 10 pt, preto, a 28 pt da borda da página. A medida vale para a página como ela aparece na tela, com a área de corte e o giro de cada página.'],
      ['O que fica', 'Os campos de formulário, os links, os marcadores e os dados do documento ficam como eram. Só a camada de formulário XFA, que poucos programas de computador leem, sai; os campos de formulário comuns continuam funcionando.'],
      ['Dados do documento', 'O título, o autor e os dados XMP do seu arquivo ficam. A Oli não acrescenta data, nome de programa nem nada do seu aparelho.'],
      ['Senha ou restrições', 'Um PDF que pede senha para abrir, ou que tem restrições de edição, é recusado na própria linha, com um link para Desbloquear PDF. Os outros arquivos seguem.'],
      ['Arquivos danificados', 'Um arquivo com o índice danificado é consertado durante a leitura. Um arquivo vazio, cortado ou que não é PDF é recusado na própria linha.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Como numero as páginas de um PDF?',
      a: 'Solte o PDF, escolha onde o número fica e qual formato ele usa e baixe o resultado. A Oli escreve os números nas páginas no seu navegador e entrega um arquivo novo, e o seu original fica como era.',
    },
    {
      q: 'Dá para começar a numeração por um número diferente de 1?',
      a: 'Dá. Digite qualquer número inteiro de 1 a 9.999 como primeiro número. Para deixar uma capa sem número, escolha pular a primeira página: aí a segunda página recebe o primeiro número que você escolheu.',
    },
    {
      q: 'O que acontece com páginas giradas ou cortadas?',
      a: 'A Oli posiciona o número pela página como ela aparece na sua tela, usando a área de corte e o giro de cada página. Uma página girada também recebe o número no canto que você escolheu, do jeito que você vê.',
    },
    {
      q: 'O número vai cobrir alguma coisa nas minhas páginas?',
      a: 'O número é pequeno, preto, a 28 pt da borda, o que cabe na margem da maioria dos documentos. Se uma página tem conteúdo bem na borda, o número pode ficar por cima, então confira o resultado antes de mandar. Outro canto costuma resolver.',
    },
    {
      q: 'Meu PDF é enviado para algum lugar?',
      a: 'Não. A Oli lê e grava o PDF no seu aparelho, no navegador, e nada vai para um servidor. Abra a aba Rede do navegador enquanto trabalha: nenhuma requisição leva o seu arquivo.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seus PDFs são numerados no seu aparelho e nunca são enviados a um servidor. O arquivo novo mantém os dados do original e não leva nada do seu aparelho.',
  relatedHeading: 'Ferramentas relacionadas',
  panel: {
    suffix: 'numerado',
    note: 'PDFs, quantos quiser',
    progressLabel: 'Numerando as páginas',
    done: 'Prontinho! A Oli numerou suas páginas.',
    doneMany: 'Prontinho! A Oli numerou as páginas de {count} PDFs.',
    options: {
      positionLegend: 'Posição',
      topLeft: 'Em cima à esquerda',
      topCenter: 'Em cima no centro',
      topRight: 'Em cima à direita',
      bottomLeft: 'Embaixo à esquerda',
      bottomCenter: 'Embaixo no centro',
      bottomRight: 'Embaixo à direita',
      formatLegend: 'Formato',
      n: '1',
      pageN: 'Página 1',
      pageNofTotal: 'Página 1 de 12',
      nOfTotal: '1 de 12',
      pageWord: 'Página',
      ofWord: 'de',
      startLabel: 'Primeiro número',
      startError: 'Digite um número inteiro de 1 a 9.999.',
      skipFirst: 'Pular a primeira página',
    },
  },
};

export default texts;
