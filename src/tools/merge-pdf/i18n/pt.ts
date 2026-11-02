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
    'Deixe os arquivos na ordem que você quer: arraste uma linha, use as setas dela ou mova a linha pelo teclado.',
    'Aperte Juntar PDFs, e a Oli junta os arquivos no seu navegador, na ordem da lista.',
    'Baixe o PDF juntado, e os seus arquivos originais continuam intactos.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Juntar PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['O que aceita', 'Dois ou mais PDFs. A Oli confere o que há dentro de cada arquivo, não o nome nem a extensão.'],
      ['Ordem', 'As páginas seguem a ordem da lista. Cada linha mostra o nome do arquivo, o número de páginas e o tamanho.'],
      ['Quantos arquivos', 'Sem limite de arquivos. O limite é o seu próprio aparelho.'],
      ['Campos de formulário', 'Os campos das páginas copiadas continuam. Quando dois arquivos têm um campo com o mesmo nome, o do arquivo que vem depois ganha " (2)" no fim.'],
      ['Marcadores e links', 'Os marcadores que apontam para uma página copiada continuam, assim como os links entre as páginas copiadas. Os links para endereços da web também ficam.'],
      ['Formulários XFA', 'A camada XFA, que só os programas da Adobe leem, sai. Os campos de formulário comuns continuam funcionando.'],
      ['Dados do documento', 'O PDF juntado fica com o título, o autor e os outros metadados do primeiro arquivo. A Oli não acrescenta data, nome de programa nem nada do seu aparelho.'],
      ['PDFs com senha', 'Um PDF com senha para abrir, ou com restrições de edição, é recusado na própria linha, com um link para Desbloquear PDF.'],
      ['Arquivos danificados', 'Um arquivo vazio, cortado ou que não é PDF é recusado na própria linha. Um arquivo com o índice danificado é consertado enquanto a Oli lê.'],
      ['O resultado', 'Um arquivo só, com o nome do primeiro PDF e -juntado no fim, como relatorio-juntado.pdf.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Como mudo a ordem dos arquivos?',
      a: 'Arraste uma linha para outro lugar ou aperte as setas da linha para subir ou descer. Também dá para mover a linha pelo teclado. A Oli junta os arquivos na ordem que a lista mostra quando você aperta Juntar PDFs.',
    },
    {
      q: 'Os campos de formulário, os marcadores e os links continuam funcionando depois de juntar?',
      a: 'Sim, nas páginas que a Oli copia. Os campos de formulário dessas páginas ficam, assim como os marcadores que apontam para elas e os links entre elas. Os links para a web também ficam, e um link para uma página que não está no arquivo juntado some. Se dois arquivos têm um campo com o mesmo nome, o segundo ganha " (2)" no nome, e cada um guarda o próprio valor.',
    },
    {
      q: 'Posso juntar um PDF que tem senha?',
      a: 'Do jeito que ele está, não. A Oli recusa um PDF que pede senha para abrir, ou que tem restrições de edição, e mostra um link para Desbloquear PDF. Tire a senha lá primeiro e depois ponha o resultado na sua lista aqui.',
    },
    {
      q: 'Tem limite de quantos PDFs posso juntar?',
      a: 'A Oli não põe limite no número de arquivos. O limite é o seu aparelho: uma lista longa de PDFs grandes pede mais memória e mais tempo no celular do que no computador.',
    },
    {
      q: 'Meu PDF é enviado para algum lugar?',
      a: 'Não. Os PDFs são lidos e gravados no seu aparelho, dentro do navegador, e nada vai para um servidor. Abra a aba Rede do navegador enquanto junta: nenhuma requisição leva os seus arquivos.',
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
      help: 'Arraste uma linha para mover, ou use as setas dela. No teclado, Espaço pega a linha, as setas a movem e Espaço a solta. Os arquivos são juntados na ordem desta lista.',
      needMore: 'Adicione pelo menos mais um PDF para juntar.',
    },
  },
};

export default texts;
