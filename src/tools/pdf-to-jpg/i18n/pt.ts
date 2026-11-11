// Blocos da página PDF para JPG (how, specs, faq, privacy, related) e os textos do painel que a ilha mostra. As linhas
// de especificação dizem o que o motor de PDF faz de verdade (src/engine/pdf/): se ele mudar lá, mude aqui e no inglês.
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { ImagesTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<ImagesTexts> = {
  title: 'PDF para JPG: transforme páginas de PDF em imagens no navegador',
  description:
    'Transforme as páginas de um PDF em imagens JPG ou PNG a 72, 150 ou 300 ppi. Tudo no navegador, sem upload, e as imagens saem sem Exif e sem GPS.',
  h1: 'PDF para JPG',
  howHeading: 'Como funciona',
  howSteps: [
    'Escolha JPG ou PNG, uma resolução e todas as páginas ou um intervalo como 1-3, 5, 8-10.',
    'Solte seus PDFs na caixa, escolha os arquivos ou cole, quantos quiser.',
    'A Oli desenha cada página como imagem no seu navegador, um PDF depois do outro.',
    'Baixe uma imagem ou todas juntas num ZIP.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a PDF para JPG recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['O que aceita', 'Arquivos PDF, quantos quiser. A Oli confere o que há dentro de cada arquivo, não o nome nem a extensão.'],
      ['O que sai', 'Uma imagem para cada página, com o nome do PDF e -pagina-1, -pagina-2 e assim por diante, como relatorio-pagina-1.jpg.'],
      ['Formatos', 'JPG com qualidade 92, ou PNG. O JPG dá arquivos menores, e o PNG deixa o texto e as linhas finas bem nítidos.'],
      ['Resolução', '72 ppi para a tela, 150 ppi para uso geral (o padrão) ou 300 ppi para imprimir.'],
      ['Páginas', 'Todas as páginas, ou um intervalo como 1-3, 5, 8-10. O mesmo intervalo vale para todos os PDFs.'],
      ['Muitas imagens', 'Várias imagens são baixadas juntas num ZIP só.'],
      ['Páginas muito grandes', 'Uma página grande demais para o navegador desenhar (acima de 16,7 megapixels) sai numa resolução menor, e o resultado avisa.'],
      ['Metadados', 'As imagens saem sem metadados: sem dados Exif e sem localização GPS.'],
      ['PDFs com restrições', 'Um PDF que só tem restrições de edição, e não pede senha para abrir, é desenhado do mesmo jeito. Um PDF com senha para abrir é recusado, com um link para Desbloquear PDF.'],
      ['Arquivos danificados', 'Um arquivo vazio, cortado ou que não é PDF é recusado na própria linha. Um arquivo com o índice danificado é consertado enquanto a Oli lê.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Qual resolução devo escolher?',
      a: 'Use 72 ppi para ver as páginas na tela, 150 ppi para uso geral e 300 ppi quando for imprimir. Uma resolução maior dá imagens mais nítidas, mas arquivos maiores, que demoram mais para sair. Uma página muito grande, acima de 16,7 megapixels, é desenhada numa resolução menor, porque o navegador não consegue desenhá-la maior, e o resultado avisa.',
    },
    {
      q: 'Dá para converter só algumas páginas?',
      a: 'Dá. Escolha Intervalo de páginas e digite as páginas, como 1-3, 5, 8-10. A Oli faz imagens só dessas páginas. Quando você põe vários PDFs, o mesmo intervalo vale para cada um deles.',
    },
    {
      q: 'Escolho JPG ou PNG?',
      a: 'O JPG, salvo com qualidade 92, dá arquivos menores e combina com páginas que têm fotos. O PNG não perde nada, então o texto e as linhas finas da página ficam nítidos, mas os arquivos ficam maiores. Nos dois casos, o texto da página vira parte da imagem e não dá mais para selecionar nem buscar.',
    },
    {
      q: 'Dá para converter um PDF com restrições de edição ou com senha?',
      a: 'Um PDF que só tem restrições de edição é desenhado como aparece na tela. Um PDF que pede senha para abrir é recusado, com um link para Desbloquear PDF: lá você tira a senha primeiro e depois traz o resultado de volta para cá.',
    },
    {
      q: 'Meu PDF é enviado para algum lugar?',
      a: 'Não. O PDF.js desenha as páginas no seu aparelho, dentro do navegador, e as imagens também são feitas ali. Nada vai para um servidor. Abra a aba Rede do navegador enquanto converte: nenhuma requisição leva os seus arquivos.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seus PDFs são desenhados no seu aparelho e nunca são enviados a um servidor. As imagens saem sem dados Exif e sem localização GPS.',
  relatedHeading: 'Ferramentas relacionadas',
  // F18 (decision 5; DECISOES § 725): the table of the presets of this tool, with their links.
  presets: {
    heading: 'Ajustes prontos',
    caption: 'Ajustes prontos da PDF para JPG e o que cada um faz',
    head: ['Ajuste pronto', 'O que faz'],
  },
  panel: {
    suffix: 'pagina',
    note: 'PDFs, quantos quiser',
    progressLabel: 'Transformando as páginas em imagens',
    // {count} é o número de imagens, de um PDF ou de vários (DECISOES § 178).
    done: 'Prontinho! A Oli transformou seu PDF numa imagem.',
    doneMany: 'Prontinho! A Oli transformou as páginas em {count} imagens.',
    options: {
      formatLegend: 'Formato da imagem',
      jpg: 'JPG',
      png: 'PNG',
      formatHelp: 'O JPG dá arquivos menores (qualidade 92). O PNG não perde nada, então o texto e as linhas finas ficam nítidos, mas os arquivos ficam maiores.',
      resolutionLegend: 'Resolução',
      low: '72 ppi',
      lowHelp: 'para a tela',
      medium: '150 ppi',
      mediumHelp: 'uso geral',
      high: '300 ppi',
      highHelp: 'para imprimir',
      pagesLegend: 'Páginas',
      all: 'Todas as páginas',
      range: 'Intervalo de páginas',
      rangeLabel: 'Páginas que viram imagens',
      rangeHelp: 'Por exemplo, 1-3, 5, 8-10. O mesmo intervalo vale para todos os PDFs.',
      rangeError: 'Digite números de página como 1-3, 5, 8-10, só com páginas que o PDF tem.',
    },
  },
};

export default texts;
