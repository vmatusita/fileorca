import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { UnlockTexts } from '../../pdf/option-texts.ts';

// Unlock PDF page blocks (data-content: how, specs, faq, privacy, related) and the panel bits the shared PDF island
// shows, in Spanish (docs/i18n/es.md). The specs rows state the real behaviour of the engine (src/engine/pdf/), as the
// English file does: when it changes there, change them here and in en.ts.
const texts: PdfToolTexts<UnlockTexts> = {
  title: 'Desbloquear PDF: quita la contraseña de un PDF en tu navegador',
  description:
    'Abre un PDF protegido con contraseña o quítale las restricciones, en tu navegador. El archivo y la contraseña se quedan en tu dispositivo y nunca se suben.',
  h1: 'Desbloquear PDF',
  howHeading: 'Cómo funciona',
  howSteps: [
    'Suelta un PDF en el cuadro, elígelo o pégalo; Oli trabaja con un PDF a la vez, porque cada archivo tiene su propia contraseña.',
    'Si el PDF solo tiene restricciones, Oli las quita enseguida, y si necesita contraseña para abrirse, escríbela en el cuadro y presiona Quitar la contraseña.',
    'Descarga el PDF nuevo, que se abre sin contraseña; tu archivo original no se toca.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Desbloquear PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Archivos', 'Un PDF a la vez. Oli comprueba que es un PDF por lo que hay dentro del archivo, no por su nombre.'],
      ['Solo restricciones', 'Un PDF que se abre libremente pero bloquea cosas como editar, imprimir o copiar pierde esas restricciones de inmediato. Oli no te pide nada.'],
      ['Contraseña para abrir', 'Un PDF que pide contraseña al abrirlo necesita esa contraseña aquí. Escríbela en el cuadro y presiona Quitar la contraseña.'],
      ['Contraseña incorrecta', 'Oli te dice que la contraseña no abrió el archivo, y puedes volver a intentarlo todas las veces que necesites.'],
      ['Tipos de protección', 'AES-256, AES-128 y la antigua protección RC4, que procesa qpdf funcionando en tu navegador.'],
      ['Sin adivinar', 'Sin la contraseña correcta, el archivo sigue cerrado: Oli no adivina ni rompe contraseñas. Usa esto solo con archivos que tienes derecho a abrir y modificar.'],
      ['Lo que se conserva', 'Las páginas, el texto, las imágenes, los campos de formulario, los enlaces, los marcadores y las propiedades del documento quedan como estaban. Solo se va la protección.'],
      ['Lo que recibes', 'Un PDF nuevo sin contraseña y sin restricciones. Tu archivo original no cambia.'],
      ['Nada que quitar', 'Un PDF sin contraseña y sin restricciones no tiene nada que quitar, así que Oli te lo dice en lugar de devolverte el mismo archivo.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Qué diferencia hay entre una contraseña para abrir y las restricciones?',
      a: 'Una contraseña para abrir impide que alguien lea el PDF, así que aquí la necesitas. Las restricciones las pone quien creó el archivo: puedes leerlo, pero cosas como editar, imprimir o copiar texto están bloqueadas. Oli quita las restricciones por su cuenta y solo pide contraseña cuando el archivo la necesita para abrirse.',
    },
    {
      q: '¿Puedo abrir un PDF si olvidé la contraseña?',
      a: 'No. Oli necesita la contraseña correcta y no adivina ni rompe contraseñas, así que un archivo sin ella sigue cerrado. Si tienes derecho a abrir el archivo, pídele la contraseña a quien lo creó, o una copia sin ella.',
    },
    {
      q: '¿Está bien quitarle la contraseña a cualquier PDF?',
      a: 'Usa esto solo con archivos que tienes derecho a abrir y modificar, como tus propios documentos o archivos cuyo dueño lo permitió. Quitar una contraseña no te da permiso para compartir ni editar el trabajo de otra persona. Si tienes dudas, pregúntale primero al dueño.',
    },
    {
      q: '¿Mi PDF o mi contraseña se suben a algún lugar?',
      a: 'No. Oli lee y escribe el PDF en tu dispositivo, en tu navegador, con qpdf funcionando dentro de la página. Ni el archivo ni la contraseña que escribes se envían a ningún lugar. Abre la pestaña Red de tu navegador mientras usas la herramienta: ninguna solicitud lleva tus archivos.',
    },
    {
      q: '¿Qué tipos de protección acepta?',
      a: 'AES-256, AES-128 y la protección RC4, más antigua. Oli quita solo la protección, así que las páginas, el texto, los formularios, los enlaces y los marcadores quedan como estaban.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Tu PDF y la contraseña que escribes se procesan en tu dispositivo, en tu navegador, y nunca se envían a un servidor. Oli no los guarda.',
  relatedHeading: 'Herramientas relacionadas',
  panel: {
    suffix: 'desbloqueado',
    note: 'un PDF a la vez',
    progressLabel: 'Quitando la protección',
    done: '¡Listo! Oli le quitó la protección a tu PDF.',
    doneMany: '¡Listo! Oli les quitó la protección a {count} PDF.',
    options: {
      passwordLabel: 'Contraseña para abrir el PDF',
      rule: 'Escribe la contraseña de este PDF para continuar.',
      submit: 'Quitar la contraseña',
      ask: 'Este PDF necesita una contraseña para abrirse. Escríbela y presiona Quitar la contraseña.',
    },
  },
};

export default texts;
