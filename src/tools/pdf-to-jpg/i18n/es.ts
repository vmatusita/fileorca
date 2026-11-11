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
    'Elige JPG o PNG, una resolución, y todas las páginas o un rango como 1-3, 5, 8-10.',
    'Suelta tus PDF en el cuadro, elígelos o pégalos, todos los que quieras.',
    'Oli dibuja cada página como una imagen en tu navegador, un PDF tras otro.',
    'Descarga una imagen o todas juntas en un ZIP.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que PDF a JPG recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Qué acepta', 'Archivos PDF, todos los que quieras. Oli revisa lo que hay dentro de cada archivo, no su nombre ni su extensión.'],
      ['Qué sale', 'Una imagen por página, con el nombre del PDF y -pagina-1, -pagina-2 y así sucesivamente, como informe-pagina-1.jpg.'],
      ['Formatos', 'JPG con calidad 92, o PNG. En las páginas con fotos, los archivos JPG son mucho más pequeños; el PNG mantiene nítidos el texto y las líneas finas.'],
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
      a: 'Usa 72 ppp para ver las páginas en una pantalla, 150 ppp para uso general y 300 ppp si piensas imprimirlas. Una resolución más alta da imágenes más nítidas, pero archivos más grandes que tardan más en crearse. Una página muy grande, de más de 16.7 megapíxeles, se dibuja con una resolución menor porque el navegador no puede dibujarla más grande, y el resultado lo dice.',
    },
    {
      q: '¿Puedo convertir solo algunas páginas?',
      a: 'Sí. Elige Rango de páginas y escribe las páginas, como 1-3, 5, 8-10. Oli crea imágenes solo de esas páginas. Si agregas varios PDF, el mismo rango se aplica a cada uno.',
    },
    {
      q: '¿Elijo JPG o PNG?',
      a: 'El JPG, guardado con calidad 92, va bien con páginas que tienen fotos: en ellas, el PNG tiene varias veces el peso del JPG. El PNG no pierde nada, así que el texto y las líneas finas de la página quedan nítidos, y en las páginas de texto y líneas los dos tienen tamaños mucho más parecidos. En los dos casos el texto de la página pasa a ser parte de la imagen, así que ya no se puede seleccionar ni buscar.',
    },
    {
      q: '¿Puedo convertir un PDF con restricciones de edición o con contraseña?',
      a: 'Un PDF que solo tiene restricciones de edición se dibuja tal como se ve en pantalla. Un PDF que necesita contraseña para abrirse se rechaza con un enlace a Desbloquear PDF, donde puedes quitar la contraseña primero y después traer el resultado aquí.',
    },
    {
      q: '¿Mi PDF se sube a algún lugar?',
      a: 'No. PDF.js dibuja las páginas en tu dispositivo, dentro de tu navegador, y las imágenes también se crean allí. Nada se envía a un servidor. Abre la pestaña Red de tu navegador mientras conviertes: ninguna solicitud lleva tus archivos.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Tus PDF se dibujan en tu dispositivo y nunca se envían a un servidor. Las imágenes salen sin datos Exif ni ubicación GPS.',
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
