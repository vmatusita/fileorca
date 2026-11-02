import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { DeleteTexts } from '../../pdf/option-texts.ts';

// Delete PDF pages page blocks (how, specs, faq, privacy, related) and the panel bits the shared PDF island shows, in
// Spanish (docs/i18n/es.md). The specs rows state the real behaviour of the engine (src/engine/pdf/process.ts), as the
// English file does: the pages you keep are copied into a new document.
const texts: PdfToolTexts<DeleteTexts> = {
  title: 'Eliminar páginas de PDF: quita páginas de un PDF en tu navegador',
  description:
    'Quita páginas de un PDF en tu navegador. Elígelas en una cuadrícula de miniaturas o escribe números como 1-3, 5. No se sube nada y tu original no cambia.',
  h1: 'Eliminar páginas de PDF',
  howHeading: 'Cómo funciona',
  howSteps: [
    'Suelta un PDF en el cuadro, elígelo o pégalo.',
    'Elige en la cuadrícula de miniaturas las páginas que quieres eliminar o escribe sus números, como 1-3, 5.',
    'Presiona Eliminar páginas y Oli crea un PDF nuevo con las páginas que quedan.',
    'Descarga el PDF nuevo; tu archivo original no se toca.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Eliminar páginas de PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Archivos que acepta', 'Un PDF a la vez. Oli revisa lo que hay dentro del archivo, no su nombre.'],
      ['Elegir páginas', 'Elige páginas en la cuadrícula de miniaturas o escribe números y rangos de página como 1-3, 5.'],
      ['Todas las páginas', 'No se pueden eliminar todas las páginas: un PDF necesita al menos una página, así que una tiene que quedar sin elegir.'],
      [
        'El archivo nuevo',
        'Oli copia las páginas que conservas a un PDF nuevo. Las páginas eliminadas, y lo que solo ellas usaban, quedan fuera, así que el archivo queda más pequeño.',
      ],
      ['Formularios', 'Los campos de formulario de las páginas que quedan se conservan. Se quita la capa de formulario XFA, que solo leen las aplicaciones de Adobe; los campos de formulario normales siguen funcionando.'],
      [
        'Marcadores y enlaces',
        'Se quedan los marcadores que apuntan a las páginas que quedan, y también los enlaces entre esas páginas. Los enlaces a la web se quedan. Los enlaces a una página eliminada se quitan.',
      ],
      [
        'Lo que se conserva',
        'El PDF nuevo conserva los campos de información y los metadatos XMP de tu archivo. Oli no agrega fecha, ni el campo Producer, ni nada de tu dispositivo.',
      ],
      [
        'Archivos que rechaza',
        'Un PDF que necesita contraseña para abrirse, o que tiene restricciones de edición, se rechaza con un enlace a Desbloquear PDF. También se rechaza un archivo vacío o cortado, o uno que no es un PDF. Un archivo con el índice (xref) dañado se repara mientras Oli lo lee.',
      ],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Puedo eliminar varias páginas a la vez, como de la 2 a la 5?',
      a: 'Sí. Elige las miniaturas en la cuadrícula o escribe los números en el campo de abajo, como 2-5 o 1-3, 7. Oli las elige por ti, y todavía puedes agregar o quitar páginas sueltas antes de presionar Eliminar páginas.',
    },
    {
      q: '¿Puedo deshacerlo si elimino las páginas equivocadas?',
      a: 'Tu archivo original nunca cambia, porque Oli escribe un PDF nuevo. Si el nuevo no es lo que querías, presiona Empezar de nuevo, vuelve a elegir el original y marca otras páginas.',
    },
    {
      q: '¿Los formularios, los enlaces y los marcadores sobreviven?',
      a: 'Sí, en las páginas que quedan. Los campos de formulario se quedan, los marcadores que apuntan a páginas conservadas se quedan, y también los enlaces a la web y los enlaces entre páginas conservadas. Los enlaces a una página que eliminaste se quitan, porque ya no tienen adónde ir.',
    },
    {
      q: '¿Por qué el PDF nuevo es más pequeño?',
      a: 'Las páginas eliminadas salen del archivo, y también todo lo que solo ellas usaban, como sus propias imágenes. Lo que también usa una página que conservas se queda, así que el ahorro depende de cuánto pesaban las páginas eliminadas.',
    },
    {
      q: '¿Mi PDF se sube a algún lugar?',
      a: 'No. FileOrca lee y escribe tu PDF en tu dispositivo, en tu navegador, y PDF.js también dibuja allí las miniaturas de las páginas. Abre la pestaña Red de tu navegador mientras eliminas páginas: ninguna solicitud lleva tus archivos.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Tu PDF se lee y se vuelve a escribir en tu dispositivo, en tu navegador, y nunca se envía a un servidor. Tu archivo original no se toca.',
  relatedHeading: 'Herramientas relacionadas',
  panel: {
    suffix: 'editado',
    note: 'un PDF a la vez',
    progressLabel: 'Eliminando las páginas',
    done: '¡Listo! Las páginas ya no están.',
    doneMany: '¡Listo! Las páginas ya no están en {count} archivos.',
    action: 'Eliminar páginas',
    options: {
      help: 'Elige en la cuadrícula las páginas que quieres eliminar o escribe sus números en el campo de abajo.',
      actionCount: 'Eliminar {count} páginas',
      actionOne: 'Eliminar 1 página',
      allPicked: 'Un PDF necesita al menos una página: deja una sin elegir.',
      nonePicked: 'Elige al menos una página para eliminar.',
    },
  },
};

export default texts;
