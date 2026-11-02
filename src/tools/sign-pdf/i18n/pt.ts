// Blocos da página Assinar PDF (how, specs, faq, privacy) e os textos que esta ferramenta soma aos do painel de PDF. A
// assinatura entra na página como imagem, nunca como assinatura digital: o aviso e as perguntas dizem isso e não dão
// orientação jurídica. As linhas de especificação dizem o que o motor faz de verdade (src/engine/pdf/).
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { SignTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<SignTexts> = {
  title: 'Assinar PDF: coloque sua assinatura num PDF no navegador',
  description:
    'Assine um PDF no navegador: desenhe, escolha uma imagem ou digite sua assinatura e coloque na página. Nada é enviado, e sua assinatura não fica guardada.',
  h1: 'Assinar PDF',
  howHeading: 'Como funciona',
  howSteps: [
    'Solte seu PDF na caixa ou escolha o arquivo, porque aqui a Oli trabalha com um PDF por vez.',
    'Desenhe sua assinatura, escolha uma imagem dela ou digite seu nome, e arraste a caixa até o lugar onde ela deve ficar.',
    'Escolha as páginas que recebem a assinatura e aperte Assinar PDF: a Oli desenha a assinatura nelas no seu navegador.',
    'Baixe o seu PDF, e o seu arquivo original continua intacto.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Assinar PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['O que aceita', 'Um PDF por vez. A Oli confere o que há dentro do arquivo, não o nome dele. Um segundo arquivo pede para você começar de novo.'],
      ['Assinatura desenhada', 'Desenhe na caixa com o dedo, uma caneta ou o mouse.'],
      ['Imagem da assinatura', 'Um PNG ou JPG que você escolhe. A Oli salva a imagem de novo, sem os metadados, antes de ela ir para a página.'],
      ['Nome digitado', 'A Oli desenha o seu nome como imagem, com a fonte do site.'],
      ['Páginas', 'Esta página, todas as páginas ou só as páginas que você escolher.'],
      ['Posição', 'Arraste a caixa na prévia, mova com as setas do teclado (+ e − mudam o tamanho) ou digite o X, o Y e a largura em porcentagem. A posição segue cada página como ela aparece na tela, com a área de corte e o giro.'],
      ['Como entra', 'A assinatura é desenhada na página como imagem. Ela não é um campo de formulário nem uma assinatura digital.'],
      ['O que fica', 'Os campos de formulário, os links, os marcadores e os dados do documento ficam como eram. Só a camada de formulário XFA, que poucos programas de computador leem, sai; os campos de formulário comuns continuam funcionando.'],
      ['Sua assinatura', 'Ela não fica guardada em lugar nenhum e não sai do seu aparelho.'],
      ['Senha ou restrições', 'Um PDF que pede senha para abrir, ou que tem restrições de edição, é recusado com um link para Desbloquear PDF.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Isto é uma assinatura digital?',
      a: 'Não. A Assinar PDF coloca uma imagem da sua assinatura na página, como um carimbo. Ela não é uma assinatura digital com certificado e não prova quem assinou nem se o arquivo mudou depois. O FileOrca não dá orientação jurídica: onde uma assinatura com certificado for exigida, use um serviço feito para isso.',
    },
    {
      q: 'Como assino um PDF sem imprimir?',
      a: 'Desenhe sua assinatura, escolha uma imagem dela ou digite seu nome, e arraste a caixa até o lugar da prévia onde ela deve ficar. Escolha as páginas e aperte Assinar PDF. A Oli desenha a assinatura na página e entrega um PDF novo para você baixar.',
    },
    {
      q: 'Dá para colocar a assinatura em todas as páginas?',
      a: 'Dá. Em Páginas, escolha Todas as páginas para repetir a assinatura no mesmo lugar, ou Escolher páginas para dizer quais recebem. A posição segue cada página como ela aparece na tela, então uma página girada também recebe a assinatura onde você vê.',
    },
    {
      q: 'Minha assinatura fica guardada em algum lugar?',
      a: 'Não. O seu desenho, a sua imagem ou o nome que você digitou servem para assinar só este PDF e não são guardados nem enviados a lugar nenhum. Nada fica para a próxima vez, então você coloca a assinatura de novo no próximo arquivo.',
    },
    {
      q: 'Meu PDF é enviado para algum lugar?',
      a: 'Não. A Oli lê o PDF, mostra a prévia com o PDF.js e grava a cópia assinada no seu aparelho, no navegador. Nada vai para um servidor, e a sua assinatura também fica no seu aparelho.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seu PDF é assinado no seu aparelho e nunca é enviado a um servidor. A sua assinatura não fica guardada em lugar nenhum.',
  relatedHeading: 'Ferramentas relacionadas',
  panel: {
    suffix: 'assinado',
    note: 'um PDF por vez',
    progressLabel: 'Assinando o seu PDF',
    done: 'Prontinho! A Oli colocou sua assinatura no PDF.',
    doneMany: 'Prontinho! A Oli colocou sua assinatura no PDF.',
    action: 'Assinar PDF',
    options: {
      modeLegend: 'Assinatura',
      draw: 'Desenhar',
      upload: 'Imagem',
      type: 'Digitar',
      drawLabel: 'Desenhe sua assinatura',
      drawHelp: 'Use o dedo, uma caneta ou o mouse.',
      clear: 'Limpar',
      uploadLabel: 'Escolher a imagem da assinatura',
      uploadHelp: 'Um PNG ou JPG. A Oli salva a imagem de novo, sem os metadados.',
      uploadError: 'Aqui a Oli só consegue usar um PNG ou JPG. Escolha outra imagem.',
      typeLabel: 'Digite seu nome',
      typeHelp: 'A Oli desenha o nome como imagem, com a fonte do site.',
      missing: 'Desenhe, escolha uma imagem ou digite sua assinatura antes.',
      placeLegend: 'Posição',
      boxLabel: 'Posição da assinatura',
      boxValue: '{x}% da esquerda, {y}% do topo, {width}% de largura',
      keyboardHelp: 'Arraste a caixa na prévia. No teclado, as setas movem a caixa, + aumenta e − diminui.',
      x: 'Da esquerda',
      y: 'Do topo',
      width: 'Largura',
      pct: '%',
      invalid: 'Digite uma porcentagem que deixe a caixa inteira dentro da página.',
      pagesLegend: 'Páginas',
      thisPage: 'Esta página',
      allPages: 'Todas as páginas',
      pickPages: 'Escolher páginas',
      previewLabel: 'Prévia da página',
      previewPage: 'Página {n} de {total}',
      notice:
        'Isto coloca uma imagem da sua assinatura na página. Não é uma assinatura digital com certificado, e o FileOrca não dá orientação jurídica. Onde uma assinatura com certificado for exigida, use um serviço feito para isso.',
    },
  },
};

export default texts;
