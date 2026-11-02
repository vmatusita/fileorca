import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { CompressPdfTexts } from '../../pdf/option-texts.ts';

// Compress PDF page blocks (how, specs, faq, privacy, related) and the panel bits the shared PDF island shows, in
// Spanish (docs/i18n/es.md). The specs rows state the real behaviour of the engine (src/engine/pdf/process.ts), as the
// English file does: when the modes, the JPEG quality or the resolutions change there, change them here and in en.ts.
const texts: PdfToolTexts<CompressPdfTexts> = {
  title: 'Comprimir PDF: haz tus archivos PDF más pequeños en tu navegador',
  description:
    'Haz tus PDF más pequeños en el navegador, uno o todo un lote. Elige sin pérdida, recomendada o fuerte. No se sube nada y nunca recibes un archivo más grande.',
  h1: 'Comprimir PDF',
  howHeading: 'Cómo funciona',
  howSteps: [
    'Suelta tus archivos PDF en el cuadro, elígelos o pégalos, todos los que quieras.',
    'Elige Sin pérdida, Recomendada o Fuerte, y Oli comprime cada PDF en tu navegador, uno tras otro, y rehace el lote si cambias el nivel.',
    'Descarga un PDF o todos juntos en un ZIP; tus archivos originales no se tocan.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Comprimir PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Archivos que acepta', 'Archivos PDF, todos los que quieras. Oli revisa lo que hay dentro del archivo, no su nombre.'],
      [
        'Sin pérdida',
        'qpdf ordena la estructura del archivo: agrupa los objetos, vuelve a comprimir los flujos con zlib en el nivel 9 y descarta lo que sobra. Nada de lo que ves cambia.',
      ],
      [
        'Recomendada',
        'La opción predeterminada. Hace lo mismo que Sin pérdida y, además, vuelve a guardar las fotos JPEG en color y en escala de grises con MozJPEG, con calidad 75. Una foto con más de 150 ppp en su tamaño más grande en la página se reduce a 150 ppp (píxeles por pulgada). Las demás imágenes quedan como están, y una foto solo se reemplaza si la nueva es más pequeña.',
      ],
      [
        'Fuerte',
        'Cada página se convierte en una imagen JPG a 100 ppp. El texto ya no se puede seleccionar ni buscar, y se pierden los campos de formulario, los enlaces y los marcadores. Oli te lo avisa antes de que lo elijas.',
      ],
      ['Ya optimizado', 'Si el resultado no fuera más pequeño, recibes tu original de vuelta, byte por byte. Oli nunca te da un archivo más grande.'],
      ['Lote', 'Sin límite de archivos. Cada uno tiene su propia descarga, y dos o más llegan juntos en un ZIP.'],
      [
        'Lo que se conserva',
        'En Sin pérdida y Recomendada, el texto, los formularios, los enlaces y los marcadores quedan como están, igual que los campos de información y los metadatos XMP de tu PDF. Oli no agrega fecha, ni el campo Producer, ni nada de tu dispositivo.',
      ],
      [
        'Contraseñas y restricciones',
        'Un PDF que necesita contraseña para abrirse, o que tiene restricciones de edición, se rechaza en su propia línea, con un enlace a Desbloquear PDF. Los demás archivos siguen adelante.',
      ],
      [
        'Archivos dañados',
        'Un archivo vacío, cortado o que no es un PDF se rechaza en su propia línea. Un archivo con el índice (xref) dañado se repara mientras Oli lo lee.',
      ],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Cuánto más pequeño quedará mi PDF?',
      a: 'Depende de lo que tenga dentro. Un PDF lleno de fotos puede reducirse mucho con Recomendada, mientras que un PDF casi todo de texto tiene poco que quitar. Oli muestra el tamaño de antes y de después de cada archivo, para que veas el ahorro real, y Fuerte es el nivel que más reduce.',
    },
    {
      q: '¿Comprimir baja la calidad de mi PDF?',
      a: 'Sin pérdida no cambia nada de lo que ves. Recomendada vuelve a guardar las fotos como JPEG con calidad 75, lo que puede costar un poco de detalle fino, pero el texto sigue nítido y se puede seleccionar. Fuerte convierte cada página en una imagen a 100 ppp, así que la letra pequeña se ve menos nítida al hacer zoom.',
    },
    {
      q: '¿Puedo seguir seleccionando el texto y usando el formulario después de comprimir?',
      a: 'Sí con Sin pérdida y Recomendada. Con Fuerte, no: cada página se convierte en una imagen, así que el texto no se puede seleccionar ni buscar, y se pierden los campos de formulario, los enlaces y los marcadores. Oli te avisa antes de que lo elijas. Si necesitas el texto, quédate en Recomendada.',
    },
    {
      q: '¿Por qué mi PDF volvió con el mismo tamaño?',
      a: 'Algunos PDF ya están bien compactados. Cuando el resultado no sería más pequeño, Oli te devuelve el original, byte por byte, en lugar de un archivo más grande, y te dice que ya estaba optimizado. Si puedes aceptar imágenes en lugar de texto, Fuerte quizá lo reduzca de todos modos.',
    },
    {
      q: '¿Mi PDF se sube a algún lugar?',
      a: 'No. FileOrca lee y escribe tu PDF en tu dispositivo, en tu navegador, con qpdf y PDF.js. Abre la pestaña Red de tu navegador mientras comprimes: ninguna solicitud lleva tus archivos.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Los PDF se comprimen en tu dispositivo, en tu navegador, y nunca se envían a un servidor. Tus archivos originales no se tocan.',
  relatedHeading: 'Herramientas relacionadas',
  panel: {
    suffix: 'comprimido',
    note: 'Archivos PDF, todos los que quieras',
    progressLabel: 'Comprimiendo los PDF',
    done: '¡Listo! Tu PDF quedó un {percent} más ligero.',
    doneMany: '¡Listo! Tus {count} PDF quedaron un {percent} más ligeros.',
    placardLabel: 'más ligero',
    options: {
      legend: 'Compresión',
      lossless: 'Sin pérdida',
      losslessHelp: 'sin cambios visibles',
      recommended: 'Recomendada',
      recommendedHelp: 'fotos más ligeras',
      strong: 'Fuerte',
      strongHelp: 'archivo más pequeño',
      strongWarning: 'Fuerte convierte cada página en una imagen. El texto ya no se puede seleccionar ni buscar, y se pierden los campos de formulario, los enlaces y los marcadores.',
    },
  },
};

export default texts;
