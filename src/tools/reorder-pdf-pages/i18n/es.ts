import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { ReorderTexts } from '../../pdf/option-texts.ts';

// Reorder PDF pages page blocks (data-content: how, specs, faq, privacy, related) and the panel bits the shared PDF
// island shows, in Spanish (docs/i18n/es.md). The specs rows state the real behaviour of the engine (src/engine/pdf/),
// as the English file does: when it changes there, change them here and in en.ts.
const texts: PdfToolTexts<ReorderTexts> = {
  title: 'Ordenar páginas de PDF: arrástralas a un nuevo orden en tu navegador',
  description:
    'Cambia el orden de las páginas de un PDF arrastrando las miniaturas, con las flechas o con el teclado. Todo pasa en tu navegador y no se sube nada.',
  h1: 'Ordenar páginas de PDF',
  howHeading: 'Cómo funciona',
  howSteps: [
    'Suelta un PDF en el cuadro, elígelo o pégalo: Oli trabaja con un PDF a la vez y muestra una miniatura de cada página, con una lupa que la abre en tamaño grande.',
    'Arrastra una página a su nuevo lugar, usa las flechas de cada página o el teclado (Espacio toma una página, las flechas la mueven y Espacio la suelta), o pon todo el PDF al revés con Invertir el orden.',
    'Presiona Guardar el nuevo orden y descarga el PDF nuevo; tu archivo original no se toca.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Ordenar páginas de PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Archivos', 'Un PDF a la vez. Oli comprueba que es un PDF por lo que hay dentro del archivo, no por su nombre.'],
      ['Miniaturas', 'Oli dibuja una imagen pequeña de cada página con PDF.js, para que veas lo que estás moviendo.'],
      ['Mover páginas', 'Arrastra una página a su nuevo lugar o usa los botones de cada página para moverla un lugar antes o después.'],
      ['Teclado', 'Las flechas del teclado pasan de una página a otra. Espacio toma una página, las flechas la mueven y Espacio la suelta.'],
      ['Invertir el orden', 'Un botón pone la última página primero y la primera página al final.'],
      ['Lo que cambia', 'Solo el orden de las páginas. Las páginas en sí, sus enlaces, sus marcadores y sus campos de formulario siguen iguales.'],
      ['Lo que se conserva', 'Las propiedades y los metadatos del documento quedan como estaban, y Oli no agrega fecha ni datos del dispositivo. Solo se quita la capa de formulario XFA, que la mayoría de las aplicaciones de PDF no puede leer; los campos de formulario normales siguen funcionando.'],
      ['PDF protegidos o dañados', 'Un PDF con contraseña para abrirlo, o con restricciones, se rechaza con un enlace a Desbloquear PDF. Un índice dañado se repara mientras se leen las páginas.'],
      ['Lo que recibes', 'Un PDF nuevo con las páginas en tu orden. Tu archivo original no cambia.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Cómo cambio el orden de las páginas de un PDF?',
      a: 'Suelta el PDF y arrastra cada página adonde la quieras, o usa las flechas de la página. Cuando el orden se vea bien, presiona Guardar el nuevo orden y descarga el archivo nuevo. Con Invertir el orden, todo el documento queda al revés de una sola vez.',
    },
    {
      q: '¿Puedo mover páginas con el teclado?',
      a: 'Sí. Usa las flechas para pasar de una página a otra, presiona Espacio para tomar una, muévela con las flechas y presiona Espacio para soltarla. Los botones de cada página también funcionan con el teclado.',
    },
    {
      q: '¿Los enlaces, los marcadores y los campos de formulario siguen funcionando?',
      a: 'Sí. Ordenar solo cambia el orden de las páginas, así que los enlaces y los marcadores siguen llevando a las mismas páginas y los campos de formulario mantienen su lugar en ellas. Los números de página que ya estaban impresos en las páginas se quedan donde están, así que quizá ya no queden en orden.',
    },
    {
      q: '¿Mi PDF se sube a algún lugar?',
      a: 'No. Oli lee y escribe el PDF en tu dispositivo, en tu navegador. PDF.js dibuja las miniaturas y el archivo nuevo se arma allí mismo. Abre la pestaña Red de tu navegador mientras usas la herramienta: ninguna solicitud lleva tus archivos.',
    },
    {
      q: '¿Puedo ordenar un PDF que tiene contraseña?',
      a: 'No directamente. Un PDF que necesita contraseña para abrirse, o que tiene restricciones, se rechaza con un enlace a Desbloquear PDF. Quita allí la protección primero y después vuelve para ordenar las páginas.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Tu PDF se lee y se escribe en tu dispositivo, en tu navegador, y nunca se envía a un servidor. Las miniaturas también se dibujan allí.',
  relatedHeading: 'Herramientas relacionadas',
  panel: {
    suffix: 'ordenado',
    note: 'un PDF a la vez',
    progressLabel: 'Ordenando las páginas',
    done: '¡Listo! Oli puso tus páginas en el nuevo orden.',
    doneMany: '¡Listo! Oli puso las páginas de {count} PDF en el nuevo orden.',
    action: 'Guardar el nuevo orden',
    options: {
      help: 'Arrastra una página a su nuevo lugar o usa las flechas de cada página.',
      reverse: 'Invertir el orden',
      reversed: 'Páginas invertidas.',
      unchanged: 'Mueve una página para guardar un nuevo orden.',
    },
  },
};

export default texts;
