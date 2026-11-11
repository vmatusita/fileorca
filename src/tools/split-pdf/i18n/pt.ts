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
    'Escolha como dividir: cada página num arquivo, intervalos de páginas como 1-3, 5, 8-10, ou as páginas que você marcar na grade de miniaturas, onde a lupa abre cada página em tamanho grande.',
    'Aperte Dividir PDF, e a Oli corta o arquivo no seu navegador.',
    'Baixe o resultado: um arquivo sai sozinho, e vários arquivos vêm juntos num ZIP.',
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
      q: 'Como divido um PDF em páginas soltas?',
      a: 'Escolha Cada página e aperte Dividir PDF. A Oli salva cada página como um PDF, com o nome do seu arquivo e -pagina-1, -pagina-2 e assim por diante, e os arquivos vêm juntos num ZIP.',
    },
    {
      q: 'Como divido um PDF pelos números das páginas?',
      a: 'Escolha Intervalos de páginas e digite os intervalos assim: 1-3, 5, 8-10. Você recebe um PDF para cada intervalo: no exemplo, as páginas 1 a 3, depois a página 5 e depois as páginas 8 a 10. Os arquivos se chamam -parte-1, -parte-2 e -parte-3, na ordem em que você digitou os intervalos.',
    },
    {
      q: 'Dá para tirar só algumas páginas para um PDF novo?',
      a: 'Dá. Use a opção Escolher páginas, marque as páginas que você quer na grade de miniaturas, e a Oli junta todas num PDF só, com -selecionadas no nome. As páginas mantêm a ordem que têm no original.',
    },
    {
      q: 'Os formulários e os marcadores continuam depois de dividir?',
      a: 'Cada parte fica com os campos de formulário, os marcadores e os links entre páginas que pertencem às próprias páginas. Um link para uma página que foi para outra parte não tem para onde levar, então sai. Os links para a web ficam.',
    },
    {
      q: 'Meu PDF é enviado para algum lugar?',
      a: 'Não. O PDF é lido e gravado no seu aparelho, dentro do navegador, e nada vai para um servidor. Abra a aba Rede do navegador enquanto divide: nenhuma requisição leva o seu arquivo.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seu PDF é lido e cortado no seu aparelho e nunca é enviado a um servidor. Cada parte também é montada no seu navegador.',
  relatedHeading: 'Ferramentas relacionadas',
  // F18 placeholder: front T writes the pt text.
  // F18 (decision 5; DECISOES § 725): the table of the presets of this tool, with their links.
  presets: {
    heading: 'Ready-made settings',
    caption: 'Presets of Split PDF and what each one does',
    head: ['Preset', 'What it does'],
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
