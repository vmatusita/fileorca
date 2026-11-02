import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { RotatePdfTexts } from '../../pdf/option-texts.ts';

// Rotate PDF page blocks (how, specs, faq, privacy, related) and the panel bits the shared PDF island shows, in Spanish
// (docs/i18n/es.md). The specs rows state the real behaviour of the engine (src/engine/pdf/operations.ts), as the
// English file does: only /Rotate changes.
const texts: PdfToolTexts<RotatePdfTexts> = {
  title: 'Rotar PDF: gira las páginas 90° o 180° en tu navegador',
  description:
    'Gira todas las páginas de un PDF, o una por una, 90° a la derecha, 90° a la izquierda o 180°, en tu navegador. Nada se vuelve a dibujar ni se sube.',
  h1: 'Rotar PDF',
  howHeading: 'Cómo funciona',
  howSteps: [
    'Suelta tus archivos PDF en el cuadro, elígelos o pégalos, todos los que quieras.',
    'Elige un giro (90° a la derecha, 180° o 90° a la izquierda) o, con un solo archivo, gira página por página con el botón de cada miniatura.',
    'Descarga el PDF girado o todos juntos en un ZIP; tus archivos originales no se tocan.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Rotar PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Archivos que acepta', 'Archivos PDF, todos los que quieras. Oli revisa lo que hay dentro del archivo, no su nombre.'],
      ['Giros', '90° a la derecha (la opción predeterminada), 180° o 90° a la izquierda.'],
      ['Sin pérdida', 'Solo cambia el ajuste de rotación de cada página. Nada se vuelve a dibujar, así que el texto, las imágenes y la calidad quedan exactamente como estaban.'],
      ['Todas las páginas', 'Todas las páginas del archivo giran igual. En un lote, esto es lo que pasa con cada archivo.'],
      ['Página por página', 'Con un solo archivo, la cuadrícula muestra todas las páginas, y un botón en cada miniatura gira solo esa página.'],
      ['Lote', 'Sin límite de archivos. Cada uno tiene su propia descarga, y dos o más llegan juntos en un ZIP.'],
      [
        'Lo que se conserva',
        'Se quedan los formularios, los enlaces, los marcadores, los campos de información y los metadatos XMP de tu PDF. Oli no agrega fecha, ni el campo Producer, ni nada de tu dispositivo.',
      ],
      ['Capa de formulario', 'Se quita la capa de formulario XFA, que solo leen las aplicaciones de Adobe. Los campos de formulario normales siguen funcionando.'],
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
      q: '¿Rotar un PDF baja su calidad?',
      a: 'No. Oli solo cambia el ajuste de rotación de cada página. Nada se vuelve a dibujar ni a comprimir, así que el texto sigue nítido y se puede seleccionar, y las imágenes conservan cada píxel.',
    },
    {
      q: '¿Puedo rotar solo una página?',
      a: 'Sí, cuando trabajas con un solo PDF. Elige Página por página y cada miniatura tendrá un botón que gira esa página. Con varios archivos a la vez, Oli gira todas las páginas de cada archivo, así que para girar páginas sueltas trabaja con un archivo a la vez.',
    },
    {
      q: '¿Los formularios, los enlaces y los marcadores siguen funcionando?',
      a: 'Sí. Se quedan en el archivo, igual que los metadatos. Lo único que Oli quita es la capa de formulario XFA, que solo leen las aplicaciones de Adobe; los campos de formulario normales siguen funcionando.',
    },
    {
      q: '¿Por qué se rechazó mi PDF?',
      a: 'Un PDF que necesita contraseña para abrirse, o que tiene restricciones de edición, se rechaza con un enlace a Desbloquear PDF. También se rechaza un archivo vacío o cortado, o uno que no es un PDF. Los demás archivos del lote siguen adelante.',
    },
    {
      q: '¿Mi PDF se sube a algún lugar?',
      a: 'No. FileOrca lee y escribe tu PDF en tu dispositivo, en tu navegador, y PDF.js también dibuja allí las miniaturas de las páginas. Abre la pestaña Red de tu navegador mientras giras las páginas: ninguna solicitud lleva tus archivos.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Los PDF se giran en tu dispositivo, en tu navegador, y nunca se envían a un servidor. Tus archivos originales no se tocan.',
  relatedHeading: 'Herramientas relacionadas',
  panel: {
    suffix: 'rotado',
    note: 'Archivos PDF, todos los que quieras',
    progressLabel: 'Rotando los PDF',
    done: '¡Listo! Oli giró tu PDF.',
    doneMany: '¡Listo! Oli giró tus {count} PDF.',
    options: {
      turnLegend: 'Rotar',
      right: '90° a la derecha',
      half: '180°',
      left: '90° a la izquierda',
      scopeLegend: 'Páginas',
      all: 'Todas las páginas',
      pick: 'Página por página',
      pickHelp: 'Usa el botón de girar de una miniatura para girar esa página.',
      batchNote: 'Página por página funciona con un solo archivo. Con varios archivos, Oli gira todas las páginas de cada uno.',
    },
  },
};

export default texts;
