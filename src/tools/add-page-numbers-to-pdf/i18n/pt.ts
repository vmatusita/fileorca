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
    'Solte seus PDFs na caixa, escolha os arquivos ou cole com Ctrl V.',
    'Escolha onde o número fica, o formato e o número de partida, e a Oli numera cada arquivo, refazendo o lote se você mudar uma escolha.',
    'Baixe os PDFs numerados.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Numerar páginas do PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['O que aceita', 'Arquivos PDF, quantos quiser. A Oli confere o que há dentro do arquivo, não o nome dele. Dois ou mais voltam juntos num ZIP só, e os seus arquivos originais continuam intactos.'],
      ['Posição', 'Seis lugares: em cima ou embaixo, e à esquerda, no centro ou à direita. O padrão é embaixo no centro.'],
      ['Formato', 'Quatro formatos: "1", "Página 1", "Página 1 de 12" e "1 de 12". As palavras "Página" e "de" saem em português, como nos exemplos.'],
      ['Primeiro número', 'Qualquer número inteiro de 1 a 9.999. O padrão é 1.'],
      ['Pular a primeira página', 'A primeira página fica sem número, e a segunda recebe o primeiro número que você escolheu. Nos formatos com "de", o total é o número da última página.'],
      ['Aparência do número', 'Helvetica, 10 pt, preto, a 28 pt da borda da página.'],
      ['O que fica', 'Os campos de formulário, os links, os marcadores e os dados do documento ficam como eram. Só a camada de formulário XFA, que poucos programas de computador leem, sai; os campos de formulário comuns continuam funcionando.'],
      ['Dados do documento', 'O título, o autor e os dados XMP do seu arquivo ficam. A Oli não acrescenta data, nome de programa nem nada do seu aparelho.'],
      ['Senha ou restrições', 'Um PDF que pede senha para abrir, ou que tem restrições de edição, é recusado na própria linha, com um link para Desbloquear PDF. Os outros arquivos seguem.'],
      ['Arquivos danificados', 'Um arquivo com o índice danificado é consertado durante a leitura. Um arquivo vazio, cortado ou que não é PDF é recusado na própria linha.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Dá para numerar só algumas páginas?',
      a: 'Só a primeira página pode ficar sem número. Para numerar só uma parte do arquivo, tire essa parte com a Dividir PDF, numere aqui e depois junte as partes de novo com a Juntar PDF.',
    },
    {
      q: 'A numeração pode continuar a de outro arquivo?',
      a: 'Pode, pelo primeiro número. Se a parte um tem 30 páginas, dê à parte dois o primeiro número 31, e as páginas dela mostram 31, 32 e assim por diante.',
    },
    {
      q: 'O que acontece com páginas giradas ou cortadas?',
      a: 'A Oli posiciona o número pela página como ela aparece na sua tela, usando a área de corte e o giro de cada página. Uma página girada também recebe o número no canto que você escolheu, do jeito que você vê.',
    },
    {
      q: 'O número vai cobrir alguma coisa nas minhas páginas?',
      a: 'Pode, quando uma página tem conteúdo bem na borda: o número fica na margem, onde a maioria dos documentos deixa espaço. Confira o resultado antes de mandar; outro canto costuma resolver.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote: 'Seus PDFs são numerados no seu aparelho e nunca são enviados a um servidor.',
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
      firstLegend: 'Primeira página',
      numberIt: 'Numerar',
      skipIt: 'Pular',
    },
  },
};

export default texts;
