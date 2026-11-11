import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { OrganizeTexts } from '../../pdf/option-texts.ts';

// Organize PDF page blocks (data-content: how, specs, faq, privacy, related) and the panel bits the shared PDF island shows
// (F18, decision 6), in Portuguese (docs/i18n/pt.md; the name is "Gerenciar páginas do PDF", since "Organizar páginas do
// PDF" is Reorder's, decision 4). The new PDF is built the way Delete PDF pages builds it (the engine's assemble.ts,
// DECISOES § 145), so the rows on forms, bookmarks and links follow that tool's. The specs rows state the real behaviour of
// the engine, as the English file does: when it changes there, change them here and in en.ts. The suffix is "gerenciado":
// "organizado" is Reorder's (DECISOES § 724).
// Front O wrote the option texts (OrganizeTexts) of the grid mode.
const texts: PdfToolTexts<OrganizeTexts> = {
  title: 'Gerenciar páginas do PDF: mova, gire e tire páginas no navegador',
  description:
    'Mova, gire e tire as páginas de um PDF numa grade de miniaturas e salve um PDF novo. Tudo acontece no seu navegador, e nada é enviado.',
  h1: 'Gerenciar páginas do PDF',
  howHeading: 'Como funciona',
  howSteps: [
    'Solte um PDF na caixa, escolha o arquivo ou cole. A Oli trabalha com um PDF por vez e mostra uma miniatura de cada página; a lupa de uma página abre a página em tamanho grande.',
    'Marque as páginas tocando nelas ou digitando números como 1-3, 5, e use a barra acima da grade para girar as páginas para a direita ou para a esquerda, ou para tirar as páginas do PDF novo.',
    'Mova uma página com as setas dela, ou arraste com o mouse. Uma página que você tirou fica na grade, mais clara, até você devolver.',
    'Aperte Salvar as mudanças e baixe o PDF novo. O seu arquivo original continua intacto.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Gerenciar páginas do PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Arquivos', 'Um PDF por vez. A Oli confere que é um PDF pelo que há dentro do arquivo, não pelo nome.'],
      ['A grade', 'A Oli desenha uma miniatura de cada página com o PDF.js. A lupa de uma página abre a página em tamanho grande, e ali Anterior e Próxima seguem a ordem que você definiu.'],
      ['Marcar páginas', 'Toque nas páginas para marcar, use "Marcar todas", "Desmarcar todas" ou "Inverter seleção", ou digite números e intervalos de páginas como 1-3, 5.'],
      ['Girar páginas', '"Girar à direita" e "Girar à esquerda" giram as páginas marcadas um quarto de volta a cada toque, somando ao giro que elas já têm.'],
      ['Tirar páginas', '"Tirar" tira as páginas marcadas do PDF novo. Elas ficam na grade, mais claras, e "Devolver" põe as páginas de volta. Pelo menos uma página tem de ficar.'],
      ['Mover páginas', 'As setas de cada página movem a página uma posição para antes ou para depois, e o mouse pode arrastar a página para o novo lugar.'],
      ['O arquivo novo', 'A Oli copia as páginas que ficam para um PDF novo, na sua ordem e com os seus giros, do jeito que a Excluir páginas do PDF faz. O que só as páginas tiradas usavam fica de fora.'],
      ['Formulários', 'Os campos de formulário das páginas que ficam continuam. A camada de formulário XFA, que só os programas da Adobe leem, sai; os campos de formulário comuns continuam funcionando.'],
      ['Marcadores e links', 'Os marcadores e os links entre páginas continuam quando apontam para uma página que fica, e ainda levam a essa página no novo lugar dela. Os links para a web ficam. Os links para uma página que você tirou saem.'],
      ['O que fica', 'O PDF novo mantém os campos de informação e os metadados XMP do seu arquivo. A Oli não acrescenta data, nome de programa (Producer) nem nada do seu aparelho.'],
      ['Arquivos recusados', 'Um PDF que pede senha para abrir, ou que tem restrições de edição, é recusado com um link para Desbloquear PDF. Um arquivo vazio ou cortado, ou que não é PDF, também é recusado. Um arquivo com o índice (xref) danificado é consertado enquanto a Oli lê.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Qual é a diferença entre a Gerenciar páginas do PDF e a Organizar páginas do PDF?',
      a: 'A Organizar páginas do PDF só muda a ordem das páginas. A Gerenciar páginas do PDF muda a ordem, gira páginas e tira páginas na mesma grade, e salva tudo num PDF novo, então um arquivo que precisa das três correções passa por uma ferramenta em vez de três.',
    },
    {
      q: 'Quando é melhor usar a Excluir páginas do PDF ou a Girar PDF?',
      a: 'Use a Excluir páginas do PDF quando você só precisa tirar páginas, e a Girar PDF quando só precisa girar páginas, ou girar as páginas de vários PDFs de uma vez. A Gerenciar páginas do PDF trabalha com um PDF por vez e serve para um arquivo que precisa de mais de uma dessas correções.',
    },
    {
      q: 'Dá para desfazer uma mudança antes de salvar?',
      a: 'Dá. Uma página que você tirou fica na grade, mais clara: marque a página e aperte "Devolver". Um giro volta com um giro para o outro lado, e uma página que você moveu volta com as setas. Depois do resultado a grade continua na tela, e qualquer mudança traz o botão de volta para salvar outro PDF. O seu arquivo original nunca muda.',
    },
    {
      q: 'Os formulários, os links e os marcadores continuam funcionando?',
      a: 'Nas páginas que ficam, sim. Os campos de formulário ficam, os marcadores e os links entre páginas ainda levam às mesmas páginas no novo lugar delas, e os links para a web ficam. Um link para uma página que você tirou sai, porque essa página não está mais no arquivo.',
    },
    {
      q: 'Meu PDF é enviado para algum lugar?',
      a: 'Não. O FileOrca lê e grava o seu PDF no seu aparelho, no navegador, e o PDF.js desenha as miniaturas ali também. Abra a aba Rede do navegador enquanto mexe nas páginas: nenhuma requisição leva os seus arquivos.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote: 'Seu PDF é lido e montado de novo no seu aparelho, no navegador, e nunca é enviado a um servidor. As miniaturas e a vista grande de uma página também são desenhadas ali.',
  relatedHeading: 'Ferramentas relacionadas',
  panel: {
    suffix: 'gerenciado',
    note: 'um PDF por vez',
    progressLabel: 'Arrumando as páginas',
    done: 'Prontinho! A Oli salvou suas páginas num PDF novo.',
    doneMany: 'Prontinho! A Oli arrumou as páginas de {count} PDFs.',
    action: 'Salvar as mudanças',
    options: {
      help: 'Marque páginas para girar ou tirar, e mova uma página com as setas dela.',
      unchanged: 'Mova, gire ou tire uma página para salvar um PDF novo.',
      allOut: 'Um PDF precisa de pelo menos uma página: devolva uma.',
    },
  },
};

export default texts;
