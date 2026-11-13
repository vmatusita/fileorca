import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { DeleteTexts } from '../../pdf/option-texts.ts';

// Blocos da página Excluir páginas do PDF (how, specs, faq, privacy, related) e os textos do painel que a ilha de PDF
// mostra. As linhas de especificação dizem o que o motor faz de verdade (src/engine/pdf/process.ts): as páginas que
// ficam são copiadas para um documento novo.
const texts: PdfToolTexts<DeleteTexts> = {
  title: 'Excluir páginas do PDF: tire páginas de um PDF no navegador',
  description:
    'Tire páginas de um PDF no navegador: marque na grade de miniaturas ou digite números como 1-3, 5. Nada é enviado, e o seu arquivo original fica como está.',
  h1: 'Excluir páginas do PDF',
  howHeading: 'Como funciona',
  howSteps: [
    'Solte um PDF na caixa, escolha o arquivo ou cole.',
    'Toque nas miniaturas das páginas que vão sair, ou digite os números delas. A lupa de cada página abre a página em tamanho grande, para você conferir antes.',
    'Aperte Excluir páginas, e a Oli monta um PDF novo com as páginas que sobraram.',
    'Baixe o PDF novo.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Excluir páginas do PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Arquivos que aceita', 'Um PDF por vez. A Oli confere o que há dentro do arquivo, não o nome dele.'],
      ['Como marcar as páginas', 'Marque as páginas na grade de miniaturas, ou digite números e intervalos de páginas como 1-3, 5.'],
      ['Todas as páginas', 'Não dá para excluir todas as páginas: um PDF precisa de pelo menos uma página, então uma tem de ficar desmarcada.'],
      [
        'O arquivo novo',
        'A Oli copia as páginas que ficam para um PDF novo.',
      ],
      ['Formulários', 'Os campos de formulário das páginas que ficam continuam. A camada de formulário XFA, que só os programas da Adobe leem, sai; os campos de formulário comuns continuam funcionando.'],
      [
        'Marcadores e links',
        'Os marcadores que apontam para as páginas que ficam continuam, assim como os links entre essas páginas. Os links para a web ficam. Os links para uma página excluída saem.',
      ],
      [
        'O que fica',
        'O PDF novo mantém os campos de informação e os metadados XMP do seu arquivo. A Oli não acrescenta data, nome de programa (Producer) nem nada do seu aparelho.',
      ],
      [
        'Arquivos recusados',
        'Um PDF que pede senha para abrir, ou que tem restrições de edição, é recusado com um link para Desbloquear PDF. Um arquivo vazio ou cortado, ou que não é PDF, também é recusado. Um arquivo com o índice (xref) danificado é consertado enquanto a Oli lê.',
      ],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Dá para excluir várias páginas de uma vez, como da 2 à 5?',
      a: 'Dá. Digite 2-5 no campo embaixo da grade, e a Oli marca essas quatro páginas para você; ainda dá para tocar nas miniaturas e marcar ou desmarcar páginas soltas antes de apertar Excluir páginas.',
    },
    {
      q: 'Dá para desfazer se eu excluir as páginas erradas?',
      a: 'O seu arquivo original nunca muda, porque a Oli grava um PDF novo. Depois do resultado, as páginas continuam à vista: marque ou desmarque outras, e o botão para excluir volta, pronto para fazer outro PDF. Só aperte Começar de novo para escolher outro arquivo.',
    },
    {
      q: 'O que acontece com o marcador de uma página que eu excluí?',
      a: 'Ele sai, a não ser que guarde marcadores de páginas mantidas. Nesse caso, vira um título que não leva a lugar nenhum, acima desses marcadores.',
    },
    {
      q: 'Por que o PDF novo ficou menor?',
      a: 'As páginas excluídas saem do arquivo, e tudo o que só elas usavam também, como as próprias imagens. O que uma página mantida também usa fica, então a economia depende de quanto pesavam as páginas excluídas.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote: 'Seu PDF é lido e gravado de novo no seu aparelho, no navegador, e nunca é enviado a um servidor.',
  relatedHeading: 'Ferramentas relacionadas',
  panel: {
    suffix: 'editado',
    note: 'um PDF por vez',
    progressLabel: 'Excluindo as páginas',
    done: 'Prontinho! As páginas saíram.',
    doneMany: 'Prontinho! As páginas saíram de {count} arquivos.',
    action: 'Excluir páginas',
    options: {
      help: 'Marque na grade as páginas que vão sair, ou digite os números delas no campo abaixo.',
      actionCount: 'Excluir {count} páginas',
      actionOne: 'Excluir 1 página',
      allPicked: 'Um PDF precisa de pelo menos uma página: deixe uma desmarcada.',
      nonePicked: 'Marque pelo menos uma página para excluir.',
    },
  },
};

export default texts;
