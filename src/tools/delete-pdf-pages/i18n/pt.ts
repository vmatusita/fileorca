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
    'Marque as páginas que vão sair na grade de miniaturas, ou digite os números delas, como 1-3, 5.',
    'Aperte Excluir páginas, e a Oli monta um PDF novo com as páginas que sobraram.',
    'Baixe o PDF novo, e o seu arquivo original continua intacto.',
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
        'A Oli copia as páginas que ficam para um PDF novo. As páginas excluídas, e o que só elas usavam, ficam de fora, então o arquivo fica menor.',
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
      a: 'Dá. Marque as miniaturas na grade ou digite os números no campo embaixo dela, como 2-5 ou 1-3, 7. A Oli marca as páginas para você, e ainda dá para marcar ou desmarcar páginas soltas antes de apertar Excluir páginas.',
    },
    {
      q: 'Dá para desfazer se eu excluir as páginas erradas?',
      a: 'O seu arquivo original nunca muda, porque a Oli grava um PDF novo. Se o novo não ficou como você queria, aperte Começar de novo, escolha o original outra vez e marque outras páginas.',
    },
    {
      q: 'Os formulários, os links e os marcadores continuam?',
      a: 'Sim, nas páginas que ficam. Os campos de formulário ficam, os marcadores que apontam para as páginas mantidas ficam, e os links para a web e entre as páginas mantidas também. Os links para uma página que você excluiu saem, porque não sobrou nada para onde levar.',
    },
    {
      q: 'Por que o PDF novo ficou menor?',
      a: 'As páginas excluídas saem do arquivo, e tudo o que só elas usavam também, como as próprias imagens. O que uma página mantida também usa fica, então a economia depende de quanto pesavam as páginas excluídas.',
    },
    {
      q: 'Meu PDF é enviado para algum lugar?',
      a: 'Não. O FileOrca lê e grava o seu PDF no seu aparelho, no navegador, e o PDF.js desenha as miniaturas das páginas ali também. Abra a aba Rede do navegador enquanto exclui as páginas: nenhuma requisição leva os seus arquivos.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote: 'Seu PDF é lido e gravado de novo no seu aparelho, no navegador, e nunca é enviado a um servidor. O seu arquivo original continua intacto.',
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
