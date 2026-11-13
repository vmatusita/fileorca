// Blocos da página Dividir PDF (how, specs, faq, privacy, related) e os textos do painel que a ilha mostra. As linhas de
// especificação dizem o que o motor de PDF faz de verdade (src/engine/pdf/): se ele mudar lá, mude aqui e no inglês.
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { SplitTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<SplitTexts> = {
  title: 'Dividir PDF: separe páginas ou intervalos no navegador',
  description:
    'Divida um PDF em páginas soltas, intervalos de páginas ou nas páginas que você escolher. Tudo no navegador, sem upload, com formulários e marcadores.',
  h1: 'Dividir PDF',
  howHeading: 'Como funciona',
  howSteps: [
    'Solte um PDF na caixa, escolha o arquivo ou cole.',
    'Escolha como dividir: cada página num arquivo, intervalos de páginas que você digita, ou as páginas que você marcar na grade de miniaturas, onde a lupa abre cada página em tamanho grande.',
    'Aperte Dividir PDF, e a Oli corta o arquivo.',
    'Baixe o resultado.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Dividir PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['O que aceita', 'Um PDF por vez. A Oli confere o que há dentro do arquivo, não o nome nem a extensão.'],
      ['Cada página', 'Cada página vira um PDF, com o nome do seu arquivo e -pagina-1, -pagina-2 e assim por diante.'],
      ['Intervalos de páginas', 'Digite intervalos como 1-3, 5, 8-10, e cada intervalo vira um PDF. Os nomes são -parte-1, -parte-2, na ordem em que você digitou, sejam quais forem os números das páginas.'],
      ['Páginas escolhidas', 'Marque as páginas na grade de miniaturas, e elas vão juntas para um PDF só, com -selecionadas no nome.'],
      ['O que você baixa', 'Um arquivo sai sozinho. Vários arquivos vêm juntos num ZIP só.'],
      ['Campos de formulário', 'Cada parte fica com os campos de formulário que estão nas próprias páginas. A camada XFA, que só os programas da Adobe leem, sai.'],
      ['Marcadores e links', 'Cada parte fica com os marcadores e os links entre páginas que apontam para as próprias páginas. Os links para endereços da web ficam, e os links para páginas que ficaram de fora daquela parte somem.'],
      ['Dados do documento', 'Cada parte fica com o título, o autor e os outros metadados do seu PDF. A Oli não acrescenta data, nome de programa nem nada do seu aparelho.'],
      ['PDFs com senha', 'Um PDF com senha para abrir, ou com restrições de edição, é recusado, com um link para Desbloquear PDF.'],
      ['Arquivos danificados', 'Um arquivo vazio, cortado ou que não é PDF é recusado. Um arquivo com o índice danificado é consertado enquanto a Oli lê.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Os intervalos podem se sobrepor ou passar da última página?',
      a: 'Podem se sobrepor, porque cada intervalo vira um arquivo próprio: 1-3 e 2-4 dão dois arquivos, e os dois têm as páginas 2 e 3. Um intervalo precisa ir da página menor para a maior e ficar dentro das páginas que o PDF tem; se não for assim, o campo pede para você corrigir.',
    },
    {
      q: 'Dá para tirar só algumas páginas para um PDF novo?',
      a: 'Dá, com a opção Escolher páginas aqui ou com a Extrair páginas do PDF, que só faz isso. Nos dois casos as páginas saem na ordem que têm no seu arquivo, seja qual for a ordem em que você as marcou.',
    },
    {
      q: 'Cada parte fica menor que o meu PDF?',
      a: 'Quase sempre. Uma parte leva só as próprias páginas e o que elas usam, como as imagens delas. Uma fonte que muitas páginas usam vai para cada parte que precisa dela, então todas as partes somadas podem pesar mais que o seu PDF.',
    },
    {
      q: 'As camadas escondidas continuam escondidas nas partes?',
      a: 'Continuam. Cada parte fica com as camadas que as páginas dela usam, cada uma ligada ou desligada como estava no seu PDF, então uma camada que o autor escondeu continua escondida.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seu PDF é lido e cortado no seu aparelho e nunca é enviado a um servidor. Cada parte também é montada no seu navegador.',
  relatedHeading: 'Ferramentas relacionadas',
  // F18 (decision 5; DECISOES § 725): the table of the presets of this tool, with their links.
  presets: {
    heading: 'Ajustes prontos',
    caption: 'Ajustes prontos da Dividir PDF e o que cada um faz',
    head: ['Ajuste pronto', 'O que faz'],
  },
  panel: {
    suffix: 'dividido',
    note: 'um PDF por vez',
    progressLabel: 'Dividindo o PDF',
    done: 'Prontinho! A Oli dividiu seu PDF.',
    doneMany: 'Prontinho! A Oli fez {count} PDFs com o seu arquivo.',
    action: 'Dividir PDF',
    options: {
      legend: 'Dividir por',
      each: 'Cada página',
      ranges: 'Intervalos de páginas',
      pick: 'Escolher páginas',
      rangesLabel: 'Páginas de cada arquivo',
      rangesHelp: 'Um arquivo para cada intervalo, por exemplo 1-3, 5, 8-10',
      rangesError: 'Digite números de página como 1-3, 5, 8-10, só com páginas que o PDF tem.',
      pickHelp: 'Marque as páginas que você quer. Elas vão juntas para um PDF novo.',
      pickNone: 'Marque pelo menos uma página antes.',
    },
  },
};

export default texts;
