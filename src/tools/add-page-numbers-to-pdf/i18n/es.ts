// Add page numbers to PDF page blocks (how, specs, faq, privacy) and the panel bits this tool adds to the shared PDF
// panel texts, in Spanish (docs/i18n/es.md). The specs rows state the real behaviour of the engine (src/engine/pdf/), as
// the English file does. `pageWord` and `ofWord` are written into the PDF (WinAnsi: "Página" fits).
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { NumbersTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<NumbersTexts> = {
  title: 'Numerar páginas de PDF: pon números a tus páginas en tu navegador',
  description:
    'Numera las páginas de tus PDF en tu navegador. Elige posición, formato y primer número. No se sube nada, y formularios, enlaces y marcadores se quedan.',
  h1: 'Numerar páginas de PDF',
  howHeading: 'Cómo funciona',
  howSteps: [
    'Suelta tus PDF en el cuadro, elígelos o pégalos con Ctrl V, todos los que quieras.',
    'Elige dónde va el número, qué formato usa y desde qué número empieza, y Oli numera cada archivo en tu navegador y rehace el lote si cambias algo.',
    'Descarga un PDF o todos juntos en un ZIP; tus archivos originales no se tocan.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Numerar páginas de PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Qué acepta', 'Archivos PDF, todos los que quieras. Oli revisa lo que hay dentro del archivo, no su nombre.'],
      ['Posición', 'Seis lugares: arriba o abajo, y a la izquierda, al centro o a la derecha. La opción predeterminada es abajo al centro.'],
      ['Formato', 'Cuatro formatos: 1, Página 1, Página 1 de 12 y 1 de 12. Las palabras "Página" y "de" salen en español.'],
      ['Primer número', 'Cualquier número entero de 1 a 9,999. El predeterminado es 1.'],
      ['Omitir la primera página', 'La primera página no lleva número, y la segunda recibe el primer número que elegiste. En los formatos con "de", el total es el número de la última página.'],
      ['Aspecto del número', 'Helvetica, 10 pt, en negro, a 28 pt del borde de la página. Se mide sobre la página tal como se ve en pantalla, con el área de recorte y la rotación de cada página.'],
      ['Lo que se conserva', 'Los campos de formulario, los enlaces, los marcadores y los datos del documento quedan como estaban. Solo se quita la capa de formulario XFA, que leen algunas aplicaciones de escritorio; los campos de formulario normales siguen funcionando.'],
      ['Datos del documento', 'Se quedan el título, el autor y los datos XMP de tu archivo. Oli no agrega fecha, ni el nombre de un programa, ni nada de tu dispositivo.'],
      ['Contraseña o restricciones', 'Un PDF que necesita contraseña para abrirse, o que tiene restricciones de edición, se rechaza en su propia línea, con un enlace a Desbloquear PDF. Los demás archivos siguen adelante.'],
      ['Archivos dañados', 'Un archivo con el índice dañado se repara mientras se lee. Un archivo vacío, cortado o que no es un PDF se rechaza en su propia línea.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Cómo numero las páginas de un PDF?',
      a: 'Suelta el PDF, elige dónde va el número y qué formato usa, y descarga el resultado. Oli escribe los números en las páginas en tu navegador y te da un archivo nuevo, y tu original queda como estaba.',
    },
    {
      q: '¿Puedo empezar a numerar desde un número distinto de 1?',
      a: 'Sí. Escribe cualquier número entero de 1 a 9,999 como primer número. Para dejar una portada sin número, elige omitir la primera página: así la segunda página recibe el primer número que elegiste.',
    },
    {
      q: '¿Qué pasa con las páginas giradas o recortadas?',
      a: 'Oli coloca el número según la página tal como se ve en tu pantalla, con el área de recorte y la rotación de cada página. Una página girada recibe igual su número en la esquina que elegiste, tal como la ves.',
    },
    {
      q: '¿El número va a tapar algo de mis páginas?',
      a: 'El número va en letra negra pequeña, a 28 pt del borde, y entra en el margen de la mayoría de los documentos. Si una página tiene contenido justo en el borde, el número puede quedar encima, así que revisa el resultado antes de enviarlo. Otra esquina suele dejar el espacio libre.',
    },
    {
      q: '¿Mi PDF se sube a algún lugar?',
      a: 'No. Oli lee y escribe el PDF en tu dispositivo, en tu navegador, y nada se envía a un servidor. Abre la pestaña Red de tu navegador mientras trabajas: ninguna solicitud lleva tu archivo.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus PDF se numeran en tu dispositivo y nunca se envían a un servidor. El archivo nuevo conserva los datos del original y no recibe ninguno de tu dispositivo.',
  relatedHeading: 'Herramientas relacionadas',
  panel: {
    suffix: 'numerado',
    note: 'Archivos PDF, todos los que quieras',
    progressLabel: 'Numerando las páginas',
    done: '¡Listo! Oli numeró tus páginas.',
    doneMany: '¡Listo! Oli numeró las páginas de {count} PDF.',
    options: {
      positionLegend: 'Posición',
      topLeft: 'Arriba a la izquierda',
      topCenter: 'Arriba al centro',
      topRight: 'Arriba a la derecha',
      bottomLeft: 'Abajo a la izquierda',
      bottomCenter: 'Abajo al centro',
      bottomRight: 'Abajo a la derecha',
      formatLegend: 'Formato',
      n: '1',
      pageN: 'Página 1',
      pageNofTotal: 'Página 1 de 12',
      nOfTotal: '1 de 12',
      pageWord: 'Página',
      ofWord: 'de',
      startLabel: 'Primer número',
      startError: 'Escribe un número entero de 1 a 9,999.',
      firstLegend: 'Primera página',
      numberIt: 'Numerar',
      skipIt: 'Omitir',
    },
  },
};

export default texts;
