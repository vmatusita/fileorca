// Split PDF page blocks (how, specs, faq, privacy, related) and the panel bits its island shows, in Spanish
// (docs/i18n/es.md). The specs rows state the real behaviour of the PDF engine (src/engine/pdf/), as the English file
// does: when it changes there, change them here and in en.ts.
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { SplitTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<SplitTexts> = {
  title: 'Dividir PDF: separa páginas o rangos en tu navegador',
  description:
    'Divide un PDF en páginas sueltas, rangos o las páginas que elijas. Funciona en tu navegador, sin subir nada, y conserva los formularios y los marcadores.',
  h1: 'Dividir PDF',
  howHeading: 'Cómo funciona',
  howSteps: [
    'Suelta un PDF en el cuadro, elígelo o pégalo.',
    'Elige cómo dividirlo: cada página en su propio archivo, rangos de páginas como 1-3, 5, 8-10, o las páginas que marques en la cuadrícula de miniaturas.',
    'Presiona Dividir PDF y Oli corta el archivo en tu navegador.',
    'Descarga el resultado: un solo archivo se descarga por separado, y varios archivos llegan juntos en un ZIP.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Dividir PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Qué acepta', 'Un PDF a la vez. Oli revisa lo que hay dentro del archivo, no su nombre ni su extensión.'],
      ['Cada página', 'Cada página se convierte en su propio PDF, con el nombre de tu archivo y -pagina-1, -pagina-2 y así sucesivamente.'],
      ['Rangos de páginas', 'Escribe rangos como 1-3, 5, 8-10 y cada rango se convierte en un PDF. Se llaman -parte-1, -parte-2 en el orden en que los escribiste, sean cuales sean los números de página.'],
      ['Elegir páginas', 'Marca páginas en la cuadrícula de miniaturas y van juntas a un solo PDF, con -seleccionadas en el nombre.'],
      ['Lo que descargas', 'Un solo archivo se descarga por separado. Varios archivos llegan juntos en un ZIP.'],
      ['Campos de formulario', 'Cada parte conserva los campos de formulario de sus propias páginas. Se quita la capa XFA, que solo leen las aplicaciones de Adobe.'],
      ['Marcadores y enlaces', 'Cada parte conserva los marcadores y los enlaces entre páginas que apuntan a sus propias páginas. Los enlaces a una dirección web se quedan, y los enlaces a páginas que no entraron en esa parte desaparecen.'],
      ['Información del documento', 'Cada parte toma el título, el autor y los demás metadatos de tu PDF. Oli no agrega fecha, ni el nombre de un programa, ni nada de tu dispositivo.'],
      ['PDF con contraseña', 'Un PDF con contraseña para abrirlo, o con restricciones de edición, se rechaza con un enlace a Desbloquear PDF.'],
      ['Archivos dañados', 'Un archivo vacío, cortado o que no es un PDF se rechaza. Un archivo con el índice dañado se repara mientras Oli lo lee.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Cómo divido un PDF en páginas sueltas?',
      a: 'Elige la opción Cada página y presiona Dividir PDF. Oli guarda cada página como su propio PDF, con el nombre de tu archivo y -pagina-1, -pagina-2 y así sucesivamente, y los archivos llegan juntos en un ZIP.',
    },
    {
      q: '¿Cómo divido un PDF por números de página?',
      a: 'Elige Rangos de páginas y escríbelos como 1-3, 5, 8-10. Recibes un PDF por cada rango: aquí, las páginas 1 a 3, después la página 5 y después las páginas 8 a 10. Los archivos se llaman -parte-1, -parte-2 y -parte-3, en el orden en que escribiste los rangos.',
    },
    {
      q: '¿Puedo sacar solo algunas páginas a un PDF nuevo?',
      a: 'Sí. Con la opción Elegir páginas, marca en la cuadrícula de miniaturas las páginas que quieres, y Oli las junta en un solo PDF con -seleccionadas en el nombre. Las páginas mantienen el orden que tienen en el original.',
    },
    {
      q: '¿Los formularios y los marcadores sobreviven a la división?',
      a: 'Cada parte conserva los campos de formulario, los marcadores y los enlaces entre páginas que pertenecen a sus propias páginas. Un enlace a una página que quedó en otra parte no tiene adónde ir, así que se descarta. Los enlaces a la web se quedan.',
    },
    {
      q: '¿Mi PDF se sube a algún lugar?',
      a: 'No. El PDF se lee y se escribe en tu dispositivo, dentro de tu navegador, y nada se envía a un servidor. Abre la pestaña Red de tu navegador mientras divides: ninguna solicitud lleva tu archivo.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Tu PDF se lee y se corta en tu dispositivo y nunca se envía a un servidor. Cada parte también se crea en tu navegador.',
  relatedHeading: 'Herramientas relacionadas',
  panel: {
    suffix: 'dividido',
    note: 'un PDF a la vez',
    progressLabel: 'Dividiendo el PDF',
    done: '¡Listo! Oli dividió tu PDF.',
    doneMany: '¡Listo! Oli hizo {count} PDF a partir de tu archivo.',
    action: 'Dividir PDF',
    options: {
      legend: 'Dividir por',
      each: 'Cada página',
      ranges: 'Rangos de páginas',
      pick: 'Elegir páginas',
      rangesLabel: 'Páginas de cada archivo',
      rangesHelp: 'Un archivo por cada rango, por ejemplo 1-3, 5, 8-10',
      rangesError: 'Escribe números de página como 1-3, 5, 8-10, solo con páginas que tenga el PDF.',
      pickHelp: 'Elige las páginas que quieres. Van juntas a un PDF nuevo.',
      pickNone: 'Primero elige al menos una página.',
    },
  },
};

export default texts;
