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
    'Solte seu PDF na caixa ou escolha o arquivo.',
    'Desenhe sua assinatura, escolha uma imagem dela ou digite seu nome, e arraste a caixa até o lugar onde ela deve ficar.',
    'Escolha as páginas que recebem a assinatura (a lupa de cada página abre a página em tamanho grande) e aperte Assinar PDF.',
    'Baixe o seu PDF assinado.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Assinar PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['O que aceita', 'Um PDF por vez. A Oli confere o que há dentro do arquivo, não o nome dele. Um segundo arquivo pede para você começar de novo. O seu arquivo original continua intacto.'],
      ['Assinatura desenhada', 'Desenhe na caixa com o dedo, uma caneta ou o mouse.'],
      ['Imagem da assinatura', 'Um PNG ou JPG que você escolhe. A Oli salva a imagem de novo, sem os metadados, antes de ela ir para a página.'],
      ['Nome digitado', 'A Oli desenha o seu nome como imagem, com a fonte do site.'],
      ['Páginas', 'Esta página, todas as páginas ou só as páginas que você escolher.'],
      ['Posição', 'Arraste a caixa na prévia, mova com as setas do teclado (+ e − mudam o tamanho) ou digite o X, o Y e a largura em porcentagem.'],
      ['Como entra', 'A assinatura é desenhada na página como imagem, não como um campo de formulário.'],
      ['O que fica', 'Os campos de formulário, os links, os marcadores e os dados do documento ficam como eram. Só a camada de formulário XFA, que poucos programas de computador leem, sai; os campos de formulário comuns continuam funcionando.'],
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
      q: 'Dá para colocar a assinatura em todas as páginas?',
      a: 'Dá. Escolha Todas as páginas, e a assinatura vai para o mesmo lugar em cada uma. O lugar é medido em cada página como ela aparece na tela, com a área de corte e o giro, então uma página girada recebe a assinatura onde você vê.',
    },
    {
      q: 'Que imagem escolher para a assinatura?',
      a: 'Um PNG com fundo transparente, que entra na página só com a tinta. O JPG não tem transparência, então o fundo branco dele cobre o que estiver embaixo da caixa. Uma imagem com mais de 1200 pixels de largura é reduzida para essa largura.',
    },
    {
      q: 'Duas pessoas podem assinar o mesmo PDF?',
      a: 'Podem, uma depois da outra. Assine e baixe o PDF, depois abra aqui a cópia assinada e ponha a segunda assinatura.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seu PDF é assinado no seu aparelho e nunca é enviado a um servidor. A sua assinatura não fica guardada em lugar nenhum, então você a coloca de novo no próximo arquivo.',
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
      keyboardHelp: 'Arraste a caixa na prévia. No teclado, as setas movem a caixa (com Shift, 10 vezes mais longe), + ou = aumenta e − diminui.',
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
