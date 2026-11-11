// Extract pages from PDF (F18, decisions 5 and 7): a preset of Split PDF in its Pick mode only, with one PDF out. Page
// blocks (how, specs, faq, privacy, related) with at least three of their own (gate:conteudo, MIN_OWN_BLOCKS) and the panel
// bits of the shared PDF island, in Portuguese (docs/i18n/pt.md; the suffix "-extraido" is in the glossary, DECISOES § 724).
// The specs rows state the real behaviour of the PDF engine (src/engine/pdf/): when it changes there, change them here and
// in en.ts. F18: front P refines the option texts (no mode segment).
import type { PdfToolTexts } from '../../../../../i18n/types.ts';
import type { ExtractTexts } from '../../../../pdf/option-texts.ts';

const texts: PdfToolTexts<ExtractTexts> = {
  title: 'Extrair páginas do PDF: salve as páginas que escolher num PDF novo',
  description:
    'Extraia páginas de um PDF no navegador: marque na grade de miniaturas ou digite números como 2-4, 7, e receba as páginas num PDF novo. Nada é enviado.',
  h1: 'Extrair páginas do PDF',
  howHeading: 'Como extrair páginas de um PDF',
  howSteps: [
    'Solte um PDF na caixa, escolha o arquivo ou cole. A Oli mostra uma miniatura de cada página, e a lupa abre a página em tamanho grande.',
    'Marque na grade as páginas que você quer, ou digite os números delas, como 2-4, 7.',
    'Aperte Extrair páginas. A Oli copia as páginas marcadas para um PDF novo, na ordem que elas têm no seu arquivo.',
    'Baixe o PDF novo, com o nome do seu arquivo e -extraido. O seu original fica com todas as páginas.',
  ],
  specsHeading: 'O que o PDF extraído mantém',
  specs: {
    caption: 'O que a Extrair páginas do PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['O que aceita', 'Um PDF por vez. A Oli lê o que há dentro do arquivo, não o nome nem a extensão.'],
      ['Escolher as páginas', 'Toque nas páginas da grade de miniaturas, ou digite números e intervalos como 2-4, 7, e a Oli marca as páginas para você. "Marcar todas", "Desmarcar todas" e "Inverter seleção" valem para a grade inteira.'],
      ['O que você recebe', 'Um PDF com as páginas marcadas, na ordem que elas têm no seu arquivo, com -extraido no nome. As páginas são copiadas, então o seu original fica com todas elas.'],
      ['Campos de formulário', 'O PDF novo fica com os campos de formulário que estão nas páginas extraídas. A camada XFA, que só os programas da Adobe leem, sai.'],
      ['Marcadores e links', 'Os marcadores e os links entre páginas ficam quando apontam para uma página extraída. Os links para endereços da web também ficam, e os links para as páginas que ficaram de fora somem.'],
      ['Dados do documento', 'O PDF novo fica com o título, o autor e os outros metadados do seu arquivo. A Oli não acrescenta data, nome de programa nem nada do seu aparelho.'],
      ['PDFs trancados', 'Um PDF com senha para abrir, ou com restrições de edição, é recusado com um link para Desbloquear PDF.'],
      ['Arquivos danificados', 'Um arquivo vazio, cortado ou que não é PDF é recusado. Um índice danificado é consertado enquanto a Oli lê o arquivo.'],
    ],
  },
  faqHeading: 'Perguntas sobre extrair páginas',
  faq: [
    {
      q: 'Qual é a diferença entre extrair páginas e dividir um PDF?',
      a: 'A Extrair páginas do PDF entrega um PDF com as páginas que você marcar. A Dividir PDF também pode pôr cada página num arquivo próprio, ou cortar o PDF em vários arquivos por intervalos como 1-3, 4-6. Para tirar algumas páginas num arquivo só, a Extrair páginas do PDF tem menos passos.',
    },
    {
      q: 'É melhor usar a Excluir páginas do PDF?',
      a: 'Use a Excluir páginas do PDF quando for mais rápido marcar as páginas que saem do que as que ficam: ela entrega o seu PDF sem as páginas marcadas. A Extrair páginas do PDF faz o contrário e entrega só as páginas marcadas.',
    },
    {
      q: 'Dá para pôr as páginas extraídas em outra ordem?',
      a: 'Elas saem na ordem que têm no seu arquivo. Para mudar a ordem, girar uma página ou tirar outra também, abra o PDF novo na Gerenciar páginas do PDF.',
    },
    {
      q: 'O meu PDF original perde as páginas que eu extraio?',
      a: 'Não. A Oli copia as páginas marcadas para um arquivo novo e nunca muda o seu, que fica com todas as páginas que tinha.',
    },
    {
      q: 'Meu PDF é enviado para extrair as páginas?',
      a: 'Não. O PDF é lido e o arquivo novo é gravado no seu aparelho, no navegador, e nada vai para um servidor. Abra a aba Rede do navegador enquanto extrai as páginas: nenhuma requisição leva o seu arquivo.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote: 'As páginas que você extrai são copiadas no seu aparelho, no navegador, e o seu PDF nunca é enviado a um servidor.',
  relatedHeading: 'Ferramentas relacionadas',
  panel: {
    suffix: 'extraido',
    note: 'um PDF por vez',
    progressLabel: 'Extraindo as páginas',
    done: 'Prontinho! A Oli pôs suas páginas num PDF novo.',
    doneMany: 'Prontinho! A Oli fez {count} PDFs com o seu arquivo.',
    action: 'Extrair páginas',
    options: {
      pickHelp: 'Marque as páginas que você quer. Elas vão juntas para um PDF novo, na ordem do seu arquivo.',
      pickNone: 'Marque pelo menos uma página antes.',
    },
  },
};

export default texts;
