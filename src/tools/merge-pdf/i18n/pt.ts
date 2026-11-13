// Blocos da página Juntar PDF (how, specs, faq, privacy, related) e os textos do painel que a ilha mostra. As linhas de
// especificação dizem o que o motor de PDF faz de verdade (src/engine/pdf/): se ele mudar lá, mude aqui e no inglês.
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { MergeTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<MergeTexts> = {
  title: 'Juntar PDF: combine arquivos PDF no navegador',
  description:
    'Junte vários PDFs num só, na ordem que você escolher. Tudo acontece no navegador, sem upload, e os campos de formulário, marcadores e links continuam.',
  h1: 'Juntar PDF',
  howHeading: 'Como funciona',
  howSteps: [
    'Solte dois ou mais PDFs na caixa, escolha os arquivos ou cole; com Adicionar mais PDFs, outros arquivos entram na lista.',
    'Deixe os arquivos na ordem que você quer: arraste uma linha ou use as setas dela (elas funcionam pelo teclado também).',
    'Aperte Juntar PDFs para juntar tudo num arquivo só.',
    'Baixe o PDF juntado.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Juntar PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['O que aceita', 'Dois ou mais PDFs. A Oli confere o que há dentro de cada arquivo, não o nome nem a extensão.'],
      ['Ordem', 'As páginas seguem a ordem da lista. Cada linha mostra o nome do arquivo, o número de páginas e o tamanho.'],
      ['Quantos arquivos', 'Sem limite de arquivos. O limite é o seu próprio aparelho.'],
      ['Campos de formulário', 'Os campos das páginas copiadas continuam.'],
      ['Marcadores e links', 'Os marcadores que apontam para uma página copiada continuam, assim como os links entre as páginas copiadas. Os links para endereços da web também ficam.'],
      ['Formulários XFA', 'A camada XFA, que só os programas da Adobe leem, sai. Os campos de formulário comuns continuam funcionando.'],
      ['Dados do documento', 'O PDF juntado fica com o título, o autor e os outros metadados do primeiro arquivo. A Oli não acrescenta data, nome de programa nem nada do seu aparelho.'],
      ['PDFs com senha', 'Um PDF com senha para abrir, ou com restrições de edição, é recusado na própria linha, com um link para Desbloquear PDF.'],
      ['Arquivos danificados', 'Um arquivo vazio, cortado ou que não é PDF é recusado na própria linha. Um arquivo com o índice danificado é consertado enquanto a Oli lê.'],
      ['O resultado', 'Um arquivo só, com o nome do primeiro PDF e -juntado no fim, como relatorio-juntado.pdf. Os seus arquivos originais continuam intactos.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Posso pôr uma imagem, como uma digitalização salva em JPG?',
      a: 'Não diretamente: a Juntar PDF junta só PDFs. Transforme as imagens num PDF com a Imagem para PDF e depois ponha esse arquivo na lista aqui.',
    },
    {
      q: 'Por que um campo de formulário ganhou " (2)" no nome?',
      a: 'Dois dos seus arquivos tinham um campo com o mesmo nome, e campos de mesmo nome num PDF dividem um valor só. A Oli põe " (2)" no nome do campo do arquivo que vem depois, e cada campo guarda o valor do próprio arquivo.',
    },
    {
      q: 'Posso juntar um PDF que tem senha?',
      a: 'Do jeito que ele está, não. Tire a senha na Desbloquear PDF primeiro e depois ponha a cópia desbloqueada na lista aqui.',
    },
    {
      q: 'Uma lista longa demora mais no celular?',
      a: 'Sim. Uma lista longa de PDFs grandes pede mais memória e mais tempo no celular do que no computador.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seus PDFs são lidos e juntados no seu aparelho e nunca são enviados a um servidor. O arquivo juntado também é montado no seu navegador.',
  relatedHeading: 'Ferramentas relacionadas',
  panel: {
    suffix: 'juntado',
    note: 'PDFs, quantos quiser',
    progressLabel: 'Juntando os PDFs',
    done: 'Prontinho! A Oli juntou seus PDFs num só.',
    doneMany: 'Prontinho! A Oli juntou seus {count} PDFs num só.',
    action: 'Juntar PDFs',
    options: {
      add: 'Adicionar mais PDFs',
      help: 'A Oli junta de cima para baixo. As setas mudam a ordem.',
      needMore: 'Adicione pelo menos mais um PDF para juntar.',
      listLabel: 'Arquivos, na ordem em que se juntam',
      order: 'Ordem · {count} arquivos',
      orderHelp: 'Mudar a ordem junta de novo na hora.',
    },
  },
};

export default texts;
