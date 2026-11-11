// PDF to PNG (F18, decisions 5 and 8): a preset of PDF to JPG with PNG fixed. Page blocks (how, specs, faq, privacy,
// related) with at least three of their own (gate:conteudo, MIN_OWN_BLOCKS) and the panel bits of the shared PDF island,
// in Spanish (docs/i18n/es.md; "ppp" is the Spanish for ppi, píxeles por pulgada). The specs rows state the real behaviour
// of the PDF engine (src/engine/pdf/): when it changes there, change them here and in en.ts. Every sentence on the size of
// the files is checked against the matrix (front P). F18: front P refines the option texts (no format choice).
import type { PdfToolTexts } from '../../../../../i18n/types.ts';
import type { ImagesTexts } from '../../../../pdf/option-texts.ts';

const texts: PdfToolTexts<ImagesTexts> = {
  title: 'PDF a PNG: convierte páginas de PDF en imágenes nítidas en tu navegador',
  description:
    'Convierte las páginas de un PDF en PNG a 72, 150 o 300 ppp en tu navegador. El PNG deja nítidos el texto y las líneas finas. Sin subir nada, sin Exif ni GPS.',
  h1: 'PDF a PNG',
  howHeading: 'Cómo convertir un PDF a PNG',
  howSteps: [
    'Elige una resolución, y todas las páginas o un rango como 2-4, 7.',
    'Suelta tus PDF en el cuadro, elígelos o pégalos. Oli convierte cada página en un PNG en cuanto lee el archivo.',
    'Descarga el PNG, o todas las imágenes juntas en un ZIP.',
  ],
  specsHeading: 'Cómo son los archivos PNG',
  specs: {
    caption: 'Lo que PDF a PNG recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Qué acepta', 'Archivos PDF, todos los que quieras. Oli lee lo que hay dentro de cada archivo, no su nombre.'],
      ['Formato', 'Siempre PNG, que se guarda sin pérdida: sin ajuste de calidad y sin desenfoque alrededor de las letras y las líneas.'],
      ['Resolución', '72 ppp (píxeles por pulgada) para pantalla, 150 ppp para uso general (la opción predeterminada) o 300 ppp para imprimir.'],
      ['Páginas', 'Todas las páginas, o un rango como 2-4, 7, que se aplica a cada PDF que agregues.'],
      ['Qué sale', 'Un PNG por página, con el nombre del PDF y -pagina-1, -pagina-2 y así sucesivamente, como informe-pagina-1.png. Varias imágenes se descargan juntas en un ZIP.'],
      ['Fondo', 'Cada página se dibuja sobre blanco, como la muestra un lector de PDF, así que el PNG no tiene zonas transparentes.'],
      ['Tamaño del archivo', 'El PNG de una página suele pesar más que el JPG de la misma página, y cuantas más fotos tiene la página, mayor es la diferencia.'],
      ['Páginas muy grandes', 'Una página de más de 16.7 megapíxeles con la resolución elegida es demasiado grande para que el navegador la dibuje, así que sale más pequeña, y el resultado te lo dice.'],
      ['Metadatos', 'Los archivos PNG salen sin metadatos: sin datos Exif y sin ubicación GPS.'],
      ['PDF con restricciones', 'Un PDF que solo tiene restricciones de edición se dibuja igual. Un PDF con contraseña para abrirlo se rechaza, con un enlace a Desbloquear PDF.'],
    ],
  },
  faqHeading: 'Preguntas sobre PNG',
  faq: [
    {
      q: '¿Cuándo conviene el PNG más que el JPG para una página de PDF?',
      a: 'Para páginas de texto, tablas, gráficos y dibujos de líneas. El PNG se guarda sin pérdida, así que las letras, las líneas finas y los bordes se ven bien definidos, sin el desenfoque que el JPG puede dejar alrededor. Para páginas que son casi solo fotos, PDF a JPG da un archivo más pequeño que se ve igual.',
    },
    {
      q: '¿Por qué los archivos PNG pesan más que los JPG?',
      a: 'El PNG guarda cada detalle de la página, mientras que el JPG descarta detalles que el ojo casi no ve para ocupar menos espacio. Por eso el PNG de una página suele ser el archivo más grande, y más aún cuando la página tiene fotos. Si un archivo pequeño importa más que un texto nítido, usa PDF a JPG.',
    },
    {
      q: '¿Qué resolución elijo para las imágenes PNG?',
      a: 'Usa 72 ppp para mostrar las páginas en una pantalla, 150 ppp para uso general y 300 ppp si piensas imprimirlas. El doble de ppp da cuatro veces más píxeles, así que los archivos crecen rápido a 300 ppp.',
    },
    {
      q: '¿Todavía puedo seleccionar el texto en el PNG?',
      a: 'No. El texto de la página pasa a ser parte de la imagen, así que ya no se puede seleccionar, buscar ni copiar. Conserva el PDF cuando necesites el texto en sí.',
    },
    {
      q: '¿Mi PDF se sube a algún lugar para crear los PNG?',
      a: 'No. PDF.js dibuja cada página en tu dispositivo, dentro de tu navegador, y los archivos PNG también se crean allí. Nada se envía a un servidor, como muestra la pestaña Red de tu navegador.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Tus PDF se convierten en archivos PNG en tu dispositivo y nunca se envían a un servidor. Las imágenes salen sin datos Exif ni ubicación GPS.',
  relatedHeading: 'Herramientas relacionadas',
  panel: {
    suffix: 'pagina',
    note: 'Archivos PDF, todos los que quieras',
    progressLabel: 'Convirtiendo las páginas en imágenes PNG',
    // {count} is the number of images, for one PDF or several (DECISOES § 178).
    done: '¡Listo! Oli convirtió tu PDF en una imagen PNG.',
    doneMany: '¡Listo! Oli convirtió las páginas en {count} imágenes PNG.',
    options: {
      formatLegend: 'Formato de imagen',
      jpg: 'JPG',
      png: 'PNG',
      formatHelp: 'Cada página sale como PNG, guardado sin pérdida.',
      resolutionLegend: 'Resolución',
      low: '72 ppp',
      lowHelp: 'para pantalla',
      medium: '150 ppp',
      mediumHelp: 'uso general',
      high: '300 ppp',
      highHelp: 'para imprimir',
      pagesLegend: 'Páginas',
      all: 'Todas las páginas',
      range: 'Rango de páginas',
      rangeLabel: 'Páginas que se convierten en imágenes',
      rangeHelp: 'Por ejemplo 1-3, 5, 8-10. El mismo rango se aplica a cada PDF.',
      rangeError: 'Escribe números de página como 1-3, 5, 8-10, solo con páginas que tenga el PDF.',
    },
  },
};

export default texts;
