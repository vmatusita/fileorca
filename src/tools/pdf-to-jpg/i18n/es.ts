// PDF to JPG page blocks (how, specs, faq, privacy, related) and the panel bits its island shows, in Spanish
// (docs/i18n/es.md). The specs rows state the real behaviour of the PDF engine (src/engine/pdf/), as the English file
// does: when it changes there, change them here and in en.ts. "ppp" is the Spanish for ppi (píxeles por pulgada).
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { ImagesTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<ImagesTexts> = {
  title: 'PDF a JPG: convierte páginas de PDF en imágenes en tu navegador',
  description:
    'Convierte las páginas de un PDF en imágenes JPG o PNG a 72, 150 o 300 ppp. Funciona en tu navegador, sin subir nada, y las imágenes salen sin Exif ni GPS.',
  h1: 'PDF a JPG',
  howHeading: 'Cómo funciona',
  howSteps: [
    'Elige JPG o PNG, una resolución y qué páginas convertir.',
    'Suelta tus PDF en el cuadro, elígelos o pégalos.',
    'Oli dibuja cada página como una imagen, un PDF tras otro.',
    'Descarga las imágenes.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que PDF a JPG recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Qué acepta', 'Archivos PDF, todos los que quieras. Oli revisa lo que hay dentro de cada archivo, no su nombre ni su extensión.'],
      ['Qué sale', 'Una imagen por página, con el nombre del PDF y -pagina-1, -pagina-2 y así sucesivamente, como informe-pagina-1.jpg.'],
      ['Formatos', 'JPG, guardado con calidad 92, o PNG, guardado sin pérdida.'],
      ['Resolución', '72 ppp (píxeles por pulgada) para pantalla, 150 ppp para uso general (la opción predeterminada) o 300 ppp para imprimir.'],
      ['Páginas', 'Todas las páginas, o un rango como 1-3, 5, 8-10. El mismo rango se aplica a cada PDF.'],
      ['Muchas imágenes', 'Varias imágenes se descargan juntas en un ZIP.'],
      ['Páginas muy grandes', 'Una página demasiado grande para que el navegador la dibuje (más de 16.7 megapíxeles) sale con una resolución menor, y el resultado te lo dice.'],
      ['Metadatos', 'Las imágenes salen sin metadatos: sin datos Exif y sin ubicación GPS.'],
      ['PDF con restricciones', 'Un PDF que solo tiene restricciones de edición, sin contraseña para abrirlo, se dibuja igual. Un PDF con contraseña para abrirlo se rechaza, con un enlace a Desbloquear PDF.'],
      ['Archivos dañados', 'Un archivo vacío, cortado o que no es un PDF se rechaza en su propia fila. Un archivo con el índice dañado se repara mientras Oli lo lee.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Qué resolución debo elegir?',
      a: 'La que va con el destino de las imágenes: la más baja para una pantalla, la más alta para imprimir. Cada paso hacia arriba da imágenes más nítidas, pero archivos más grandes que tardan más en crearse: una página tamaño Carta sale de 612 × 792 píxeles con la resolución más baja, de 1275 × 1650 con la predeterminada y de 2550 × 3300 con la más alta.',
    },
    {
      q: '¿Y si uno de mis PDF tiene menos páginas que el rango?',
      a: 'Oli crea imágenes de las páginas del rango que ese PDF tiene. Un PDF sin ninguna página dentro del rango se queda fuera, y su fila te lo dice.',
    },
    {
      q: '¿Elijo JPG o PNG?',
      a: 'Para un PDF de fotos, JPG: los archivos PNG de todas sus páginas, sumados, tienen varias veces el peso de los archivos JPG. Para un PDF de texto y líneas, el PNG mantiene nítidas las líneas finas, y sus archivos, sumados, pesan aproximadamente entre la mitad y el doble que los archivos JPG, así que hasta pueden ser los más pequeños. En los dos formatos el texto de la página pasa a ser parte de la imagen y ya no se puede seleccionar ni buscar.',
    },
    {
      q: '¿Puedo convertir un PDF que necesita contraseña para abrirse?',
      a: 'Tal como está, no. Quita la contraseña en Desbloquear PDF primero y después trae la copia desbloqueada aquí.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Tus PDF se dibujan en tu dispositivo y nunca se envían a un servidor. Las imágenes también se crean allí.',
  relatedHeading: 'Herramientas relacionadas',
  // F18 (decision 5; DECISOES § 725): the table of the presets of this tool, with their links.
  presets: {
    heading: 'Ajustes predefinidos',
    caption: 'Ajustes predefinidos de PDF a JPG y qué hace cada uno',
    head: ['Ajuste predefinido', 'Qué hace'],
  },
  panel: {
    suffix: 'pagina',
    note: 'Archivos PDF, todos los que quieras',
    progressLabel: 'Convirtiendo las páginas en imágenes',
    // {count} is the number of images, for one PDF or several (DECISOES § 178).
    done: '¡Listo! Oli convirtió tu PDF en una imagen.',
    doneMany: '¡Listo! Oli convirtió las páginas en {count} imágenes.',
    options: {
      formatLegend: 'Formato de imagen',
      jpg: 'JPG',
      png: 'PNG',
      formatHelp: 'En las páginas con fotos, los archivos JPG son mucho más pequeños (calidad 92). El PNG no pierde nada, así que el texto y las líneas finas quedan nítidos.',
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
