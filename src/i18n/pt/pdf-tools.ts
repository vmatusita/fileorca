// O hub de PDF /pt/ferramentas-pdf/ em português (F6, decisão 4; o modelo é o hub /pdf-tools/, F5a e DECISOES § 96): a
// faixa, a grade das ferramentas de PDF, o guia de qual ferramenta faz cada tarefa e como os arquivos ficam no aparelho.
// Os guias de arquivo não existem em português, então este hub não fala deles.
import type { PdfToolsTexts } from '../types.ts';

const texts: PdfToolsTexts = {
  title: 'Ferramentas de PDF: juntar, dividir, comprimir e mais, no navegador',
  description:
    'Ferramentas de PDF grátis que rodam no navegador: junte, divida, comprima, converta para JPG, gire, numere, assine e proteja PDFs sem enviar nada.',
  eyebrow: 'PDF',
  h1: 'Ferramentas de PDF grátis que nunca enviam seus arquivos',
  intro: 'Junte, divida, comprima, converta, numere, assine e proteja PDFs. Toda ferramenta funciona no seu aparelho: sem conta, sem upload e sem limite de arquivos.',
  toolsHeading: 'Todas as ferramentas de PDF',
  guideHeading: 'De qual ferramenta você precisa?',
  guideIntro: 'A maioria das tarefas com PDF é uma destas. Escolha a linha que parece com a sua.',
  guide: [
    { before: 'Vários PDFs que deviam ser um arquivo só, numa ordem certa:', tool: 'merge-pdf', after: 'junta todos e mantém os marcadores e os campos de formulário.' },
    { before: 'Um PDF longo do qual você só precisa de algumas páginas, ou de cada página separada:', tool: 'split-pdf', after: 'divide por intervalos, pelas páginas escolhidas ou página por página.' },
    { before: 'Um PDF grande demais para mandar por e-mail ou anexar num formulário:', tool: 'compress-pdf', after: 'arruma a estrutura dele e, na compressão Recomendada, deixa as fotos mais leves.' },
    { before: 'Páginas que você quer como imagem, para um slide ou uma mensagem:', tool: 'pdf-to-jpg', after: 'desenha cada página como JPG ou PNG, na resolução que você escolher.' },
    { before: 'Fotos ou digitalizações que deviam virar um PDF:', tool: 'image-to-pdf', after: 'põe uma imagem em cada página, na ordem da lista.' },
    { before: 'Uma digitalização que saiu de lado ou de cabeça para baixo:', tool: 'rotate-pdf', after: 'gira todas as páginas, ou só as que precisam, sem redesenhar nada.' },
    { before: 'Páginas em branco ou que sobram no meio:', tool: 'delete-pdf-pages', after: 'tira essas páginas e deixa todo o resto como estava.' },
    { before: 'Páginas para mover, girar e tirar do mesmo PDF:', tool: 'organize-pdf', after: 'faz as três coisas numa grade só e salva um PDF novo.' },
    { before: 'Páginas fora de ordem:', tool: 'reorder-pdf-pages', after: 'deixa você arrastar as páginas ou mover cada uma pelos botões ou pelo teclado.' },
    { before: 'Um relatório ou um TCC que precisa de páginas numeradas:', tool: 'add-page-numbers-to-pdf', after: 'escreve os números onde você quiser, num dos quatro formatos.' },
    { before: 'Um documento para marcar como rascunho ou como confidencial:', tool: 'watermark-pdf', after: 'carimba o seu texto no meio de todas as páginas.' },
    { before: 'Um formulário ou uma carta para assinar e devolver:', tool: 'sign-pdf', after: 'coloca uma assinatura desenhada, em imagem ou digitada nas páginas que você escolher.' },
    { before: 'Um PDF que só deve abrir com senha:', tool: 'protect-pdf', after: 'tranca o arquivo com criptografia AES-256.' },
    { before: 'Um PDF seu que pede senha toda vez:', tool: 'unlock-pdf', after: 'tira a senha, depois que você digita, ou as restrições de edição.' },
  ],
  guideOutro: 'As ferramentas combinam bem: junte primeiro, depois numere as páginas e por fim comprima o resultado. Cada uma entrega um arquivo novo e deixa o seu original como era.',
  privacyHeading: 'Seus PDFs ficam no seu aparelho',
  privacy: [
    'Toda ferramenta de PDF daqui lê e grava o arquivo dentro do seu navegador. O PDF é aberto com o PDF.js, o leitor que o Firefox usa, e alterado com o pdf-lib e o qpdf, compilados para rodar na página. Nada é enviado a um servidor, então não há envio para esperar nem cópia do seu arquivo em outro lugar.',
    'A senha que você digita para proteger ou abrir um PDF fica na página enquanto você usa a ferramenta e some quando você fecha a página. A assinatura que você desenha, escolhe em imagem ou digita também não fica guardada. Abra a aba Rede do navegador enquanto uma ferramenta trabalha: nenhuma requisição leva o seu arquivo, a sua senha ou o seu texto.',
  ],
  // F18 (decision 5; DECISOES § 725 and § 736): the table of the presets of the PDF tools, with their links.
  presetsHeading: 'Ajustes prontos',
  presetsCaption: 'Ajustes prontos das ferramentas de PDF e o que cada ajuste entrega',
  presetsHead: ['Ajuste pronto', 'O que você recebe'],
};

export default texts;
