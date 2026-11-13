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
    'Suelta tus archivos PDF en el cuadro, elígelos o pégalos.',
    'Elige Sin pérdida, Recomendada o Fuerte, y Oli comprime cada PDF, uno tras otro, y rehace el lote si cambias el nivel.',
    'Descarga los PDF comprimidos.',
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
      ['Lote', 'Sin límite de archivos. Cada uno tiene su propia descarga, y dos o más llegan juntos en un ZIP. Tus archivos originales no se tocan.'],
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
      a: 'Depende de lo que tenga dentro. Un PDF lleno de fotos puede reducirse mucho con Recomendada, mientras que un PDF casi todo de texto tiene poco que quitar. Oli muestra el tamaño de antes y de después de cada archivo, para que veas el ahorro real, y en un PDF de fotos Fuerte es el nivel que más reduce.',
    },
    {
      q: '¿Comprimir baja la calidad de mi PDF?',
      a: 'Con Sin pérdida, no. Con Recomendada, una foto guardada de nuevo puede perder un poco de detalle fino, y el texto sigue nítido y se puede seleccionar. Con Fuerte, la letra pequeña se ve menos nítida al hacer zoom, porque pasó a ser parte de una imagen.',
    },
    {
      q: '¿Puedo comprimir un PDF que tiene contraseña?',
      a: 'Tal como está, no. Quita la contraseña en Desbloquear PDF, comprime aquí la copia desbloqueada y después vuelve a ponerle una contraseña con Proteger PDF.',
    },
    {
      q: '¿Por qué mi PDF volvió con el mismo tamaño?',
      a: 'Algunos PDF ya están bien compactados. Fuerte tampoco ayuda siempre: en una página de texto, la imagen de la página puede pesar más que el texto que reemplaza.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Los PDF se comprimen en tu dispositivo, en tu navegador, y nunca se envían a un servidor.',
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
