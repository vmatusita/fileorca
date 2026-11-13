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
    'Solte seus PDFs na caixa, escolha os arquivos ou cole.',
    'Escolha um giro (90° à direita, 180° ou 90° à esquerda) ou, com um arquivo só, gire página por página pelo botão de cada miniatura, e a lupa abre a página em tamanho grande.',
    'Baixe os PDFs girados.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Girar PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Arquivos que aceita', 'Arquivos PDF, quantos quiser. A Oli confere o que há dentro do arquivo, não o nome dele.'],
      ['Giros', '90° à direita (o padrão), 180° ou 90° à esquerda.'],
      ['Todas as páginas', 'Todas as páginas do arquivo giram do mesmo jeito. Num lote, é isso que acontece com cada arquivo.'],
      ['Página por página', 'Com um arquivo só, a grade mostra todas as páginas, e um botão em cada miniatura gira só aquela página.'],
      ['Lote', 'Sem limite de arquivos. Cada um ganha o próprio download, e dois ou mais vêm juntos num ZIP só. Os seus arquivos originais continuam intactos.'],
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
      q: 'O que acontece com uma página que já estava girada?',
      a: 'O giro novo soma com o que ela já tem: uma página salva a 90° que ganha 90° à direita termina a 180°.',
    },
    {
      q: 'Dá para endireitar uma digitalização torta em poucos graus?',
      a: 'Não. O padrão do PDF só gira uma página em quartos de volta, múltiplos de 90°. Endireitar uma digitalização torta pede desenhar a página de novo, e esta ferramenta não faz isso.',
    },
    {
      q: 'Dá para girar um PDF que tem senha?',
      a: 'Do jeito que ele está, não. Tire a senha na Desbloquear PDF primeiro e depois traga a cópia desbloqueada de volta para cá.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote: 'Os PDFs são girados no seu aparelho, no navegador, e nunca são enviados a um servidor.',
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
