import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { CompressPdfTexts } from '../../pdf/option-texts.ts';

// Blocos da página Comprimir PDF (how, specs, faq, privacy, related) e os textos do painel que a ilha de PDF mostra. As
// linhas de especificação dizem o que o motor faz de verdade (src/engine/pdf/process.ts): se os modos, a qualidade do
// JPEG ou as resoluções mudarem lá, mude aqui e no inglês.
const texts: PdfToolTexts<CompressPdfTexts> = {
  title: 'Comprimir PDF: deixe arquivos PDF menores no navegador',
  description:
    'Deixe PDFs menores no navegador, um ou o lote inteiro, em Sem perda, Recomendada ou Forte. Nada é enviado, e você nunca recebe um arquivo maior.',
  h1: 'Comprimir PDF',
  howHeading: 'Como funciona',
  howSteps: [
    'Solte seus PDFs na caixa, escolha os arquivos ou cole, quantos quiser.',
    'Escolha Sem perda, Recomendada ou Forte, e a Oli comprime cada PDF no seu navegador, um depois do outro, refazendo o lote se você mudar o nível.',
    'Baixe um PDF ou todos juntos num ZIP, e os seus arquivos originais continuam intactos.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Comprimir PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Arquivos que aceita', 'Arquivos PDF, quantos quiser. A Oli confere o que há dentro do arquivo, não o nome dele.'],
      [
        'Sem perda',
        'O qpdf arruma a estrutura do arquivo: junta os objetos, comprime de novo os fluxos com o zlib no nível 9 e tira as sobras. Nada do que você vê muda.',
      ],
      [
        'Recomendada',
        'O padrão. Faz o mesmo que Sem perda e também salva de novo as fotos JPEG coloridas e em tons de cinza com o MozJPEG, na qualidade 75. Uma foto com mais de 150 ppi no maior tamanho em que aparece na página é reduzida para 150 ppi. As outras imagens ficam como estão, e uma foto só é trocada se a nova ficar menor.',
      ],
      [
        'Forte',
        'Cada página vira uma imagem JPG a 100 ppi. O texto não pode mais ser selecionado nem buscado, e os campos de formulário, os links e os marcadores se perdem. A Oli avisa antes de você escolher.',
      ],
      ['Já otimizado', 'Se o resultado não ficar menor, você recebe o original de volta, byte por byte. A Oli nunca entrega um arquivo maior.'],
      ['Lote', 'Sem limite de arquivos. Cada um ganha o próprio download, e dois ou mais vêm juntos num ZIP só.'],
      [
        'O que fica',
        'Em Sem perda e Recomendada, o texto, os formulários, os links e os marcadores ficam como estão, assim como os campos de informação e os metadados XMP do seu PDF. A Oli não acrescenta data, nome de programa (Producer) nem nada do seu aparelho.',
      ],
      [
        'Senhas e restrições',
        'Um PDF que pede senha para abrir, ou que tem restrições de edição, é recusado na própria linha, com um link para Desbloquear PDF. Os outros arquivos seguem.',
      ],
      [
        'Arquivos danificados',
        'Um arquivo vazio, cortado ou que não é PDF é recusado na própria linha. Um arquivo com o índice (xref) danificado é consertado enquanto a Oli lê.',
      ],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Quanto menor meu PDF vai ficar?',
      a: 'Depende do que há dentro dele. Um PDF cheio de fotos pode diminuir bastante na Recomendada, enquanto um PDF quase só de texto tem pouco para tirar. A Oli mostra o tamanho antes e depois de cada arquivo, então você vê a economia de verdade, e a Forte é o nível que vai mais longe.',
    },
    {
      q: 'Comprimir diminui a qualidade do meu PDF?',
      a: 'A Sem perda não muda nada do que você vê. A Recomendada salva as fotos de novo como JPEG na qualidade 75, o que pode custar um pouco de detalhe fino, mas o texto continua nítido e selecionável. A Forte transforma cada página numa imagem a 100 ppi, então a letra miúda fica menos nítida quando você amplia.',
    },
    {
      q: 'Ainda dá para selecionar o texto e usar o formulário depois de comprimir?',
      a: 'Na Sem perda e na Recomendada, sim. Na Forte, não: cada página vira uma imagem, então o texto não pode ser selecionado nem buscado, e os campos de formulário, os links e os marcadores se perdem. A Oli avisa antes de você escolher. Se você precisa do texto, fique na Recomendada.',
    },
    {
      q: 'Por que meu PDF voltou com o mesmo tamanho?',
      a: 'Alguns PDFs já estão bem compactados. Quando o resultado não ficaria menor, a Oli devolve o original, byte por byte, em vez de um arquivo maior, e avisa que ele já estava otimizado. Se você aceita imagens no lugar do texto, a Forte ainda pode deixar o arquivo menor.',
    },
    {
      q: 'Meu PDF é enviado para algum lugar?',
      a: 'Não. O FileOrca lê e grava o seu PDF no seu aparelho, no navegador, com o qpdf e o PDF.js. Abra a aba Rede do navegador enquanto comprime: nenhuma requisição leva os seus arquivos.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote: 'Os PDFs são comprimidos no seu aparelho, no navegador, e nunca são enviados a um servidor. Os seus arquivos originais continuam intactos.',
  relatedHeading: 'Ferramentas relacionadas',
  panel: {
    suffix: 'comprimido',
    note: 'PDFs, quantos quiser',
    progressLabel: 'Comprimindo os PDFs',
    done: 'Prontinho! Seu PDF ficou {percent} mais leve.',
    doneMany: 'Prontinho! Seus {count} PDFs ficaram {percent} mais leves.',
    placardLabel: 'mais leve',
    options: {
      legend: 'Compressão',
      lossless: 'Sem perda',
      losslessHelp: 'nada muda à vista',
      recommended: 'Recomendada',
      recommendedHelp: 'fotos mais leves',
      strong: 'Forte',
      strongHelp: 'menor arquivo',
      strongWarning: 'A Forte transforma cada página numa imagem. O texto não pode mais ser selecionado nem buscado, e os campos de formulário, os links e os marcadores se perdem.',
    },
  },
};

export default texts;
