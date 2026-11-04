import type { FileGuidesSharedTexts } from '../types.ts';

/** O que todo guia de arquivo em português compartilha. Os nomes das fixtures são como as tabelas chamam cada arquivo de teste. */
const texts: FileGuidesSharedTexts & { names: string[] } = {
  reviewed: 'Revisado por {name} em {date}.',
  firstPublished: 'Publicado pela primeira vez em {date}.',
  openTool: 'Abrir a ferramenta {name}',
  readOn: 'Lido em {date}.',
  samePixels: 'Mesmos pixels',
  yes: 'Sim',
  no: 'Não',
  none: 'Nada',
  sameFile: 'O mesmo arquivo de volta',
  adSpec: '(especificação de anúncio)',
  notStated: 'Não informado',
  notComparable: 'Não comparável',
  becomes: 'para',
  gps: { real: 'Sim', none: 'Sem GPS', empty: 'Campo vazio', zeroed: 'Zerado', kept: 'Mantido' },
  fixtures: {
    'jpg-01-pixel2-retrato-gps.jpg': 'Google Pixel 2, retrato',
    'jpg-02-iphone6-paisagem-gps.jpg': 'iPhone 6, paisagem',
    'jpg-03-iphone5-paisagem-orientacao3-gps.jpg': 'iPhone 5, paisagem, gravada de cabeça para baixo',
    'pdf-escaneado-01-pagina-livro-cor.pdf': 'Página de livro escaneada em cores',
    'pdf-escaneado-02-relatorio-nasa-150p.pdf': 'Relatório da NASA escaneado, em preto e branco',
    'pdf-formulario-irs-1040-2019.pdf': 'Formulário 1040 do IRS',
    'pdf-grande-fontes-embutidas-117p.pdf': 'Notas de aula com fontes incorporadas',
    'gen-fotos.pdf': 'PDF feito de fotos',
    'gen-ja-otimizado.pdf': 'PDF já otimizado',
    'gen-acoes.pdf': 'PDF com links e ações',
    'gen-paginas-300.pdf': 'PDF longo só com texto',
    'gen-paginas-mistas.pdf': 'PDF com páginas de tamanhos diferentes',
    'gen-xref-estragada.pdf': 'PDF com o índice danificado',
  },
  hubGuidesHeading: 'Guias',
  numbers: {
    masculine: ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze'],
    feminine: ['zero', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze'],
  },
  times: '{n} vezes',
  timesOne: '{n} vez',
  bytes: '{n} bytes',
  ppi: '{n} ppi',
  // Os nomes técnicos acima que têm algarismo (tests/unit/guides-numbers.test.ts).
  names: ['Pixel 2', 'iPhone 6', 'iPhone 5', 'Formulário 1040'],
};

export default texts;
