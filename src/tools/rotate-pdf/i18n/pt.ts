import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { RotatePdfTexts } from '../../pdf/option-texts.ts';

// Blocos da página Girar PDF (how, specs, faq, privacy, related) e os textos do painel que a ilha de PDF mostra. As
// linhas de especificação dizem o que o motor faz de verdade (src/engine/pdf/operations.ts): só o /Rotate muda.
const texts: PdfToolTexts<RotatePdfTexts> = {
  title: 'Girar PDF: gire páginas de PDF em 90° ou 180° no navegador',
  description:
    'Gire todas as páginas de um PDF, ou só algumas, 90° à direita, 90° à esquerda ou 180°, no navegador. Nada é redesenhado nem enviado, e a qualidade fica igual.',
  h1: 'Girar PDF',
  howHeading: 'Como funciona',
  howSteps: [
    'Solte seus PDFs na caixa, escolha os arquivos ou cole, quantos quiser.',
    'Escolha um giro (90° à direita, 180° ou 90° à esquerda) ou, com um arquivo só, gire página por página pelo botão de cada miniatura, e a lupa abre a página em tamanho grande.',
    'Baixe o PDF girado ou todos juntos num ZIP, e os seus arquivos originais continuam intactos.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Girar PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Arquivos que aceita', 'Arquivos PDF, quantos quiser. A Oli confere o que há dentro do arquivo, não o nome dele.'],
      ['Giros', '90° à direita (o padrão), 180° ou 90° à esquerda.'],
      ['Sem perda', 'Só muda a configuração de giro de cada página. Nada é redesenhado, então o texto, as imagens e a qualidade ficam exatamente como eram.'],
      ['Todas as páginas', 'Todas as páginas do arquivo giram do mesmo jeito. Num lote, é isso que acontece com cada arquivo.'],
      ['Página por página', 'Com um arquivo só, a grade mostra todas as páginas, e um botão em cada miniatura gira só aquela página.'],
      ['Lote', 'Sem limite de arquivos. Cada um ganha o próprio download, e dois ou mais vêm juntos num ZIP só.'],
      [
        'O que fica',
        'Os formulários, os links, os marcadores, os campos de informação e os metadados XMP do seu PDF ficam. A Oli não acrescenta data, nome de programa (Producer) nem nada do seu aparelho.',
      ],
      ['Camada de formulário', 'A camada de formulário XFA, que só os programas da Adobe leem, sai. Os campos de formulário comuns continuam funcionando.'],
      [
        'Senhas e restrições',
        'Um PDF que pede senha para abrir, ou que tem restrições de edição, é recusado na própria linha, com um link para Desbloquear PDF. Os outros arquivos seguem.',
      ],
      [
        'Arquivos danificados',
        'Um arquivo vazio, cortado ou que não é PDF é recusado na própria linha. Um arquivo com o índice (xref) danificado é consertado enquanto a Oli lê.',
      ],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Girar um PDF diminui a qualidade dele?',
      a: 'Não. A Oli muda só a configuração de giro de cada página. Nada é redesenhado nem comprimido de novo, então o texto continua nítido e selecionável, e as imagens mantêm todos os pixels.',
    },
    {
      q: 'Dá para girar só uma página?',
      a: 'Dá, quando você trabalha com um PDF só. Escolha Página por página, e cada miniatura ganha um botão que gira aquela página. Com vários arquivos de uma vez, a Oli gira todas as páginas de cada arquivo, então gire páginas soltas um arquivo por vez.',
    },
    {
      q: 'Os formulários, os links e os marcadores continuam funcionando?',
      a: 'Sim. Eles ficam no arquivo, assim como os metadados. A única coisa que a Oli tira é a camada de formulário XFA, que só os programas da Adobe leem; os campos de formulário comuns continuam funcionando.',
    },
    {
      q: 'Por que meu PDF foi recusado?',
      a: 'Um PDF que pede senha para abrir, ou que tem restrições de edição, é recusado com um link para Desbloquear PDF. Um arquivo vazio ou cortado, ou que não é PDF, também é recusado. Os outros arquivos do lote seguem.',
    },
    {
      q: 'Meu PDF é enviado para algum lugar?',
      a: 'Não. O FileOrca lê e grava o seu PDF no seu aparelho, no navegador, e o PDF.js desenha as miniaturas das páginas ali também. Abra a aba Rede do navegador enquanto gira: nenhuma requisição leva os seus arquivos.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote: 'Os PDFs são girados no seu aparelho, no navegador, e nunca são enviados a um servidor. Os seus arquivos originais continuam intactos.',
  relatedHeading: 'Ferramentas relacionadas',
  panel: {
    suffix: 'girado',
    note: 'PDFs, quantos quiser',
    progressLabel: 'Girando os PDFs',
    done: 'Prontinho! A Oli girou as {pages} páginas do seu PDF {turn}.',
    doneMany: 'Prontinho! A Oli girou seus {count} PDFs {turn}.',
    options: {
      turnLegend: 'Girar',
      right: '90° à direita',
      half: '180°',
      left: '90° à esquerda',
      scopeLegend: 'Páginas',
      all: 'Todas as páginas',
      pick: 'Página por página',
      pickHelp: 'Use o botão de giro de uma miniatura para girar aquela página.',
      batchNote: 'Página por página funciona com um arquivo só. Com vários arquivos, a Oli gira todas as páginas de cada um.',
      doneOne: 'Prontinho! A Oli girou a página do seu PDF {turn}.',
      donePicked: 'Prontinho! A Oli girou {count} das {pages} páginas.',
      rightTurn: '90° para a direita',
      halfTurn: '180°',
      leftTurn: '90° para a esquerda',
    },
  },
};

export default texts;
