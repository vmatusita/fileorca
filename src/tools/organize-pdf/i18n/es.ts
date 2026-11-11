import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { ReorderTexts } from '../../pdf/option-texts.ts';

// Organize PDF page blocks (data-content: how, specs, faq, privacy, related) and the panel bits the shared PDF island shows
// (F18, decision 6), in Spanish (docs/i18n/es.md). The new PDF is built the way Delete PDF pages builds it (the engine's
// assemble.ts, DECISOES § 145), so the rows on forms, bookmarks and links follow that tool's. The specs rows state the
// real behaviour of the engine, as the English file does: when it changes there, change them here and in en.ts. F18
// placeholder: the option texts are Reorder's shape until front O gives the grid mode its own (OrganizeTexts).
const texts: PdfToolTexts<ReorderTexts> = {
  title: 'Organizar PDF: mueve, gira y quita las páginas en tu navegador',
  description:
    'Mueve, gira y quita las páginas de un PDF en una cuadrícula de miniaturas y guarda un PDF nuevo. Todo pasa en tu navegador y no se sube nada.',
  h1: 'Organizar PDF',
  howHeading: 'Cómo funciona',
  howSteps: [
    'Suelta un PDF en el cuadro, elígelo o pégalo. Oli trabaja con un PDF a la vez y muestra una miniatura de cada página; la lupa de una página la abre en tamaño grande.',
    'Elige páginas tocándolas o escribiendo números como 1-3, 5, y usa la barra de arriba de la cuadrícula para girarlas a la derecha o a la izquierda, o para quitarlas del PDF nuevo.',
    'Mueve una página con sus flechas o arrástrala con el mouse. Una página que quitaste se queda en la cuadrícula, atenuada, hasta que la restaures.',
    'Presiona Guardar los cambios y descarga el PDF nuevo; tu archivo original no se toca.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Organizar PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Archivos', 'Un PDF a la vez. Oli comprueba que es un PDF por lo que hay dentro del archivo, no por su nombre.'],
      ['La cuadrícula', 'Oli dibuja una miniatura de cada página con PDF.js. La lupa de una página la abre en tamaño grande, y allí Anterior y Siguiente siguen el orden que elegiste.'],
      ['Elegir páginas', 'Toca las páginas para elegirlas, usa "Elegir todas", "Desmarcar todas" o "Invertir selección", o escribe números y rangos de página como 1-3, 5.'],
      ['Girar páginas', '"Girar a la derecha" y "Girar a la izquierda" giran las páginas elegidas un cuarto de vuelta cada vez, sumado al giro que ya tienen.'],
      ['Quitar páginas', '"Quitar" saca las páginas elegidas del PDF nuevo. Se quedan en la cuadrícula, atenuadas, y "Restaurar" las vuelve a poner. Al menos una página tiene que quedar.'],
      ['Mover páginas', 'Las flechas de cada página la mueven un lugar antes o después, y el mouse puede arrastrarla a su nuevo lugar.'],
      ['El archivo nuevo', 'Oli copia las páginas que conservas a un PDF nuevo, en tu orden y con tus giros, como lo hace Eliminar páginas de PDF. Lo que solo usaban las páginas quitadas queda fuera.'],
      ['Formularios', 'Los campos de formulario de las páginas que quedan se conservan. Se quita la capa de formulario XFA, que solo leen las aplicaciones de Adobe; los campos de formulario normales siguen funcionando.'],
      ['Marcadores y enlaces', 'Los marcadores y los enlaces entre páginas se quedan cuando apuntan a una página que conservas, y siguen llevando a esa página en su nuevo lugar. Los enlaces a la web se quedan. Los enlaces a una página que quitaste se eliminan.'],
      ['Lo que se conserva', 'El PDF nuevo conserva los campos de información y los metadatos XMP de tu archivo. Oli no agrega fecha, ni el campo Producer, ni nada de tu dispositivo.'],
      ['Archivos que rechaza', 'Un PDF que necesita contraseña para abrirse, o que tiene restricciones de edición, se rechaza con un enlace a Desbloquear PDF. También se rechaza un archivo vacío o cortado, o uno que no es un PDF. Un archivo con el índice (xref) dañado se repara mientras Oli lo lee.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Cuál es la diferencia entre Organizar PDF y Ordenar páginas de PDF?',
      a: 'Ordenar páginas de PDF solo cambia el orden de las páginas. Organizar PDF cambia el orden de las páginas, las gira y las quita en la misma cuadrícula, y guarda todo en un PDF nuevo, así que un archivo que necesita los tres arreglos pasa por una herramienta en lugar de tres.',
    },
    {
      q: '¿Cuándo conviene usar Eliminar páginas de PDF o Rotar PDF?',
      a: 'Usa Eliminar páginas de PDF cuando solo necesitas quitar páginas, y Rotar PDF cuando solo necesitas girar páginas, o girar las páginas de varios PDF a la vez. Organizar PDF trabaja con un PDF a la vez y sirve para un archivo que necesita más de uno de estos arreglos.',
    },
    {
      q: '¿Puedo deshacer un cambio antes de guardar?',
      a: 'Sí. Una página que quitaste se queda en la cuadrícula, atenuada: elígela y presiona "Restaurar". Un giro se deshace con un giro en el otro sentido, y una página que moviste vuelve con las flechas. Después del resultado, la cuadrícula sigue en pantalla, y cualquier cambio trae de vuelta el botón para guardar otro PDF. Tu archivo original nunca cambia.',
    },
    {
      q: '¿Los formularios, los enlaces y los marcadores siguen funcionando?',
      a: 'En las páginas que conservas, sí. Los campos de formulario se quedan, los marcadores y los enlaces entre páginas siguen llevando a las mismas páginas en su nuevo lugar, y los enlaces a la web se quedan. Un enlace a una página que quitaste se elimina, porque esa página ya no está en el archivo.',
    },
    {
      q: '¿Mi PDF se sube a algún lugar?',
      a: 'No. FileOrca lee y escribe tu PDF en tu dispositivo, en tu navegador, y PDF.js también dibuja allí las miniaturas. Abre la pestaña Red de tu navegador mientras organizas las páginas: ninguna solicitud lleva tus archivos.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Tu PDF se lee y se vuelve a armar en tu dispositivo, en tu navegador, y nunca se envía a un servidor. Las miniaturas y la vista grande de una página también se dibujan allí.',
  relatedHeading: 'Herramientas relacionadas',
  panel: {
    suffix: 'organizado',
    note: 'un PDF a la vez',
    progressLabel: 'Organizando las páginas',
    done: '¡Listo! Oli guardó tus páginas en un PDF nuevo.',
    doneMany: '¡Listo! Oli organizó las páginas de {count} PDF.',
    action: 'Guardar los cambios',
    options: {
      help: 'Elige páginas para girarlas o quitarlas, y mueve una página con sus flechas.',
      reverse: 'Invertir el orden',
      reversed: 'Páginas invertidas.',
      unchanged: 'Mueve, gira o quita una página para guardar un PDF nuevo.',
    },
  },
};

export default texts;
