import type { FileGuidesSharedTexts } from '../types.ts';

/** Lo que comparten todas las guías de archivos en español. Los nombres de las fixtures son como las tablas llaman a cada archivo de prueba. */
const texts: FileGuidesSharedTexts & { names: string[] } = {
  reviewed: 'Revisado por {name} el {date}.',
  firstPublished: 'Publicado por primera vez el {date}.',
  openTool: 'Abrir la herramienta {name}',
  readOn: 'Leído el {date}.',
  samePixels: 'Mismos píxeles',
  yes: 'Sí',
  no: 'No',
  none: 'Nada',
  sameFile: 'El mismo archivo de vuelta',
  adSpec: '(especificación de anuncios)',
  notStated: 'No se indica',
  notComparable: 'No comparable',
  becomes: 'a',
  gps: { real: 'Sí', none: 'Sin GPS', empty: 'Etiqueta vacía', zeroed: 'En cero', kept: 'Se conserva' },
  fixtures: {
    'jpg-01-pixel2-retrato-gps.jpg': 'Google Pixel 2, vertical',
    'jpg-02-iphone6-paisagem-gps.jpg': 'iPhone 6, horizontal',
    'jpg-03-iphone5-paisagem-orientacao3-gps.jpg': 'iPhone 5, horizontal, guardada al revés',
    'pdf-escaneado-01-pagina-livro-cor.pdf': 'Página de libro escaneada a color',
    'pdf-escaneado-02-relatorio-nasa-150p.pdf': 'Informe de la NASA escaneado, en blanco y negro',
    'pdf-formulario-irs-1040-2019.pdf': 'Formulario 1040 del IRS',
    'pdf-grande-fontes-embutidas-117p.pdf': 'Apuntes de clase con fuentes incrustadas',
    'gen-fotos.pdf': 'PDF hecho de fotos',
    'gen-ja-otimizado.pdf': 'PDF ya optimizado',
    'gen-acoes.pdf': 'PDF con enlaces y acciones',
    'gen-paginas-300.pdf': 'PDF largo solo con texto',
    'gen-paginas-mistas.pdf': 'PDF con páginas de tamaños distintos',
    'gen-xref-estragada.pdf': 'PDF con el índice dañado',
  },
  guideLink: 'Lee la guía: {title}',
  hubGuidesHeading: 'Guías',
  numbers: {
    masculine: ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'],
    feminine: ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'],
  },
  times: '{n} veces',
  timesOne: '{n} vez',
  bytes: '{n} bytes',
  // "ppp" (píxeles por pulgada), como la herramienta PDF a JPG lo escribe en la misma página.
  ppi: '{n} ppp',
  // Los nombres técnicos de arriba que tienen dígitos (tests/unit/guides-numbers.test.ts).
  names: ['Pixel 2', 'iPhone 6', 'iPhone 5', 'Formulario 1040'],
};

export default texts;
