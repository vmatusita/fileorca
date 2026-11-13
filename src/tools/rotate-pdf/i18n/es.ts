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
    'Suelta tus archivos PDF en el cuadro, elígelos o pégalos.',
    'Elige un giro (90° a la derecha, 180° o 90° a la izquierda) o, con un solo archivo, gira página por página con el botón de cada miniatura, y la lupa abre la página en tamaño grande.',
    'Descarga los PDF girados.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Rotar PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Archivos que acepta', 'Archivos PDF, todos los que quieras. Oli revisa lo que hay dentro del archivo, no su nombre.'],
      ['Giros', '90° a la derecha (la opción predeterminada), 180° o 90° a la izquierda.'],
      ['Todas las páginas', 'Todas las páginas del archivo giran igual. En un lote, esto es lo que pasa con cada archivo.'],
      ['Página por página', 'Con un solo archivo, la cuadrícula muestra todas las páginas, y un botón en cada miniatura gira solo esa página.'],
      ['Lote', 'Sin límite de archivos. Cada uno tiene su propia descarga, y dos o más llegan juntos en un ZIP. Tus archivos originales no se tocan.'],
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
      q: '¿Qué pasa con una página que ya estaba girada?',
      a: 'El giro nuevo se suma al que ya tiene: una página guardada a 90° que recibe 90° a la derecha termina a 180°.',
    },
    {
      q: '¿Puedo enderezar un escaneo torcido unos pocos grados?',
      a: 'No. El estándar PDF solo gira una página en cuartos de vuelta, múltiplos de 90°. Enderezar un escaneo torcido exige volver a dibujar la página, y esta herramienta no lo hace.',
    },
    {
      q: '¿Puedo rotar un PDF que tiene contraseña?',
      a: 'Tal como está, no. Quita la contraseña en Desbloquear PDF primero y después trae la copia desbloqueada aquí.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Los PDF se giran en tu dispositivo, en tu navegador, y nunca se envían a un servidor.',
  relatedHeading: 'Herramientas relacionadas',
  panel: {
    suffix: 'rotado',
    note: 'Archivos PDF, todos los que quieras',
    progressLabel: 'Rotando los PDF',
    done: '¡Listo! Oli giró las {pages} páginas de tu PDF {turn}.',
    doneMany: '¡Listo! Oli giró tus {count} PDF {turn}.',
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
      doneOne: '¡Listo! Oli giró la página de tu PDF {turn}.',
      donePicked: '¡Listo! Oli giró {count} de las {pages} páginas.',
      rightTurn: '90° a la derecha',
      halfTurn: '180°',
      leftTurn: '90° a la izquierda',
    },
  },
};

export default texts;
