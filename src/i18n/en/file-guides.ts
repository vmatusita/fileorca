import type { FileGuidesSharedTexts } from '../types.ts';

/** What every file guide shares (F5b). The fixture names are what the tables call each test file. */
const texts: FileGuidesSharedTexts & { names: string[] } = {
  reviewed: 'Reviewed by {name} on {date}.',
  firstPublished: 'First published {date}.',
  openTool: 'Open the {name} tool',
  readOn: 'Read on {date}.',
  samePixels: 'Same pixels',
  yes: 'Yes',
  no: 'No',
  none: 'None',
  sameFile: 'Same file back',
  adSpec: '(ad specs)',
  notStated: 'Not stated',
  notComparable: 'Not comparable',
  becomes: 'to',
  gps: { real: 'Yes', none: 'None', empty: 'Empty tag', zeroed: 'Zeroed', kept: 'Kept' },
  fixtures: {
    'jpg-01-pixel2-retrato-gps.jpg': 'Google Pixel 2, portrait',
    'jpg-02-iphone6-paisagem-gps.jpg': 'iPhone 6, landscape',
    'jpg-03-iphone5-paisagem-orientacao3-gps.jpg': 'iPhone 5, landscape, stored upside down',
    'pdf-escaneado-01-pagina-livro-cor.pdf': 'Scanned book page in color',
    'pdf-escaneado-02-relatorio-nasa-150p.pdf': 'Scanned NASA report, black and white',
    'pdf-formulario-irs-1040-2019.pdf': 'IRS Form 1040',
    'pdf-grande-fontes-embutidas-117p.pdf': 'Lecture notes with embedded fonts',
    'gen-fotos.pdf': 'PDF made of photos',
    'gen-ja-otimizado.pdf': 'PDF that is already optimized',
    'gen-acoes.pdf': 'PDF with links and actions',
    'gen-paginas-300.pdf': 'Long text-only PDF',
    'gen-paginas-mistas.pdf': 'PDF with pages of mixed sizes',
    'gen-xref-estragada.pdf': 'PDF with a damaged index',
  },
  guideLink: 'Read the guide: {title}',
  hubGuidesHeading: 'Guides',
  numbers: {
    masculine: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
    feminine: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
  },
  times: '{n} times',
  timesOne: '{n} times',
  bytes: '{n} bytes',
  ppi: '{n} ppi',
  // The technical names above that carry digits (tests/unit/guides-numbers.test.ts).
  names: ['Pixel 2', 'iPhone 6', 'iPhone 5', 'Form 1040'],
};

export default texts;
