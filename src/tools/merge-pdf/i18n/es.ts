// Merge PDF page blocks (how, specs, faq, privacy, related) and the panel bits its island shows, in Spanish
// (docs/i18n/es.md). The specs rows state the real behaviour of the PDF engine (src/engine/pdf/), as the English file
// does: when it changes there, change them here and in en.ts.
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { MergeTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<MergeTexts> = {
  title: 'Unir PDF: combina archivos PDF en tu navegador',
  description:
    'Une archivos PDF en uno solo, en el orden que elijas. Funciona en tu navegador, sin subir nada, y conserva campos de formulario, marcadores y enlaces.',
  h1: 'Unir PDF',
  howHeading: 'Cómo funciona',
  howSteps: [
    'Suelta dos o más PDF en el cuadro, elígelos o pégalos, y usa Agregar más PDF para sumar archivos a la lista.',
    'Pon los archivos en el orden que quieras: arrastra una fila o presiona sus botones de flecha (también funcionan con el teclado).',
    'Presiona Unir PDF y Oli junta los archivos en tu navegador, en el orden de la lista.',
    'Descarga el PDF unido; tus archivos originales no se tocan.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Unir PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Qué acepta', 'Dos o más PDF. Oli revisa lo que hay dentro de cada archivo, no su nombre ni su extensión.'],
      ['Orden', 'Las páginas siguen el orden de la lista. Cada fila muestra el nombre del archivo, su número de páginas y su tamaño.'],
      ['Cuántos archivos', 'Sin límite de archivos. El límite es tu propio dispositivo.'],
      ['Campos de formulario', 'Los campos de las páginas copiadas se conservan. Cuando dos archivos tienen un campo con el mismo nombre, al del segundo se le agrega " (2)".'],
      ['Marcadores y enlaces', 'Se conservan los marcadores que apuntan a una página copiada y los enlaces entre páginas copiadas. Los enlaces a una dirección web también se quedan.'],
      ['Formularios XFA', 'Se quita la capa XFA, que solo leen las aplicaciones de Adobe. Los campos de formulario normales siguen funcionando.'],
      ['Información del documento', 'El PDF unido toma el título, el autor y los demás metadatos del primer archivo. Oli no agrega fecha, ni el nombre de un programa, ni nada de tu dispositivo.'],
      ['PDF con contraseña', 'Un PDF con contraseña para abrirlo, o con restricciones de edición, se rechaza en su propia fila, con un enlace a Desbloquear PDF.'],
      ['Archivos dañados', 'Un archivo vacío, cortado o que no es un PDF se rechaza en su propia fila. Un archivo con el índice dañado se repara mientras Oli lo lee.'],
      ['El resultado', 'Un solo archivo, con el nombre del primer PDF y -unido al final, como informe-unido.pdf.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Cómo cambio el orden de los archivos?',
      a: 'Arrastra una fila a otro lugar o presiona sus botones de flecha para subirla o bajarla; también funcionan con el teclado. Oli junta los archivos en el orden que muestra la lista cuando presionas Unir PDF.',
    },
    {
      q: '¿Los campos de formulario, los marcadores y los enlaces siguen funcionando después de unir?',
      a: 'Sí, en las páginas que Oli copia. Los campos de formulario de esas páginas se quedan, igual que los marcadores que apuntan a ellas y los enlaces entre ellas. Los enlaces a la web también se quedan, mientras que un enlace a una página que no está en el archivo unido desaparece. Si dos archivos tienen un campo con el mismo nombre, el del segundo se renombra con " (2)" para que cada uno conserve su propio valor.',
    },
    {
      q: '¿Puedo unir un PDF que tiene contraseña?',
      a: 'Tal como está, no. Oli rechaza un PDF que necesita contraseña para abrirse, o que tiene restricciones de edición, y muestra un enlace a Desbloquear PDF. Quita allí la contraseña primero y después agrega el resultado a tu lista aquí.',
    },
    {
      q: '¿Hay un límite de PDF que puedo unir?',
      a: 'Oli no pone límite al número de archivos. El límite es tu dispositivo: una lista larga de PDF grandes usa más memoria y tarda más en un teléfono que en una computadora.',
    },
    {
      q: '¿Mi PDF se sube a algún lugar?',
      a: 'No. Los PDF se leen y se escriben en tu dispositivo, dentro de tu navegador, y nada se envía a un servidor. Abre la pestaña Red de tu navegador mientras unes los archivos: ninguna solicitud lleva tus archivos.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Tus PDF se leen y se unen en tu dispositivo y nunca se envían a un servidor. El archivo unido también se crea en tu navegador.',
  relatedHeading: 'Herramientas relacionadas',
  panel: {
    suffix: 'unido',
    note: 'Archivos PDF, todos los que quieras',
    progressLabel: 'Uniendo los PDF',
    done: '¡Listo! Oli juntó tus PDF en uno solo.',
    doneMany: '¡Listo! Oli juntó tus {count} PDF en uno solo.',
    action: 'Unir PDF',
    options: {
      add: 'Agregar más PDF',
      help: 'Oli los une de arriba abajo. Las flechas cambian el orden.',
      needMore: 'Agrega al menos un PDF más para unir.',
      listLabel: 'Archivos, en el orden en que se unen',
      order: 'Orden · {count} archivos',
      orderHelp: 'Cambiar el orden los une de nuevo al momento.',
    },
  },
};

export default texts;
