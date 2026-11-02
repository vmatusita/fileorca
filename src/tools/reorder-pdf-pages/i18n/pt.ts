import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { ReorderTexts } from '../../pdf/option-texts.ts';

// Blocos da página Organizar páginas do PDF (data-content: how, specs, faq, privacy, related) e os textos do painel que
// a ilha de PDF mostra. As linhas de especificação dizem o que o motor faz de verdade (src/engine/pdf/): se ele mudar
// lá, mude aqui e no inglês.
const texts: PdfToolTexts<ReorderTexts> = {
  title: 'Organizar páginas do PDF: mude a ordem das páginas no navegador',
  description:
    'Mude a ordem das páginas de um PDF arrastando as miniaturas, com as setas ou pelo teclado. Tudo acontece no seu navegador, e nada é enviado.',
  h1: 'Organizar páginas do PDF',
  howHeading: 'Como funciona',
  howSteps: [
    'Solte um PDF na caixa, escolha o arquivo ou cole: a Oli trabalha com um PDF por vez e mostra uma miniatura de cada página.',
    'Arraste uma página para o novo lugar, use as setas dela ou o teclado (Espaço pega, as setas movem, Espaço solta), ou aperte Inverter a ordem para virar o PDF inteiro.',
    'Aperte Salvar a nova ordem e baixe o PDF novo, enquanto o seu arquivo original continua intacto.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Organizar páginas do PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Arquivos', 'Um PDF por vez. A Oli confere que é um PDF pelo que há dentro do arquivo, não pelo nome.'],
      ['Miniaturas', 'A Oli desenha uma imagem pequena de cada página com o PDF.js, para você ver o que está movendo.'],
      ['Mover páginas', 'Arraste uma página para o novo lugar, ou use os botões de cada página para mover uma posição para antes ou para depois.'],
      ['Teclado', 'As setas andam entre as páginas. Espaço pega uma página, as setas a movem e Espaço a solta.'],
      ['Inverter a ordem', 'Um botão põe a última página primeiro e a primeira página por último.'],
      ['O que muda', 'Só a ordem das páginas. As páginas em si, os links, os marcadores e os campos de formulário ficam iguais.'],
      ['O que fica', 'As propriedades e os metadados do documento ficam como eram, e a Oli não acrescenta data nem informação do aparelho. Só a camada de formulário XFA, que a maioria dos programas de PDF não lê, sai; os campos de formulário comuns continuam funcionando.'],
      ['PDFs protegidos ou danificados', 'Um PDF com senha para abrir, ou com restrições, é recusado com um link para Desbloquear PDF. Um índice danificado é consertado enquanto as páginas são lidas.'],
      ['O que você recebe', 'Um PDF novo, com as páginas na sua ordem. O seu arquivo original não muda.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Como mudo a ordem das páginas de um PDF?',
      a: 'Solte o PDF e arraste cada página para onde você quer, ou use as setas da página. Quando a ordem estiver certa, aperte Salvar a nova ordem e baixe o arquivo novo. Inverter a ordem vira o documento inteiro de uma vez.',
    },
    {
      q: 'Dá para mover as páginas pelo teclado?',
      a: 'Dá. Use as setas para andar entre as páginas, aperte Espaço para pegar uma, use as setas para mover e aperte Espaço para soltar. Os botões de cada página também funcionam pelo teclado.',
    },
    {
      q: 'Os links, os marcadores e os campos de formulário continuam funcionando?',
      a: 'Sim. Organizar muda só a ordem das páginas, então os links e os marcadores continuam levando às mesmas páginas, e os campos de formulário ficam no mesmo lugar delas. Os números de página que já estão impressos nas páginas ficam onde estão, então podem sair da sequência.',
    },
    {
      q: 'Meu PDF é enviado para algum lugar?',
      a: 'Não. A Oli lê e grava o PDF no seu aparelho, no navegador. O PDF.js desenha as miniaturas, e o arquivo novo é montado ali mesmo. Abra a aba Rede do navegador enquanto usa a ferramenta: nenhuma requisição leva os seus arquivos.',
    },
    {
      q: 'Dá para organizar um PDF que tem senha?',
      a: 'Direto, não. Um PDF que pede senha para abrir, ou que tem restrições, é recusado com um link para Desbloquear PDF. Tire a proteção lá primeiro e depois volte para organizar as páginas.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seu PDF é lido e gravado no seu aparelho, no navegador, e nunca é enviado a um servidor. As miniaturas também são desenhadas ali.',
  relatedHeading: 'Ferramentas relacionadas',
  panel: {
    suffix: 'organizado',
    note: 'um PDF por vez',
    progressLabel: 'Organizando as páginas',
    done: 'Prontinho! A Oli pôs suas páginas na nova ordem.',
    doneMany: 'Prontinho! A Oli pôs as páginas de {count} PDFs na nova ordem.',
    action: 'Salvar a nova ordem',
    options: {
      help: 'Arraste uma página para o novo lugar, ou use as setas de cada página.',
      reverse: 'Inverter a ordem',
      unchanged: 'Mova uma página para salvar uma nova ordem.',
    },
  },
};

export default texts;
