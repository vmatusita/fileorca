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
    'Suelta un PDF en el cuadro, elígelo o pégalo: Oli muestra una miniatura de cada página, con una lupa que la abre en tamaño grande.',
    'Pon las páginas en el orden que quieras, con el mouse, las flechas de cada página o el teclado, o pon todo el PDF al revés con Invertir el orden.',
    'Presiona Guardar el nuevo orden y descarga el PDF nuevo.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Ordenar páginas de PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Archivos', 'Un PDF a la vez. Oli comprueba que es un PDF por lo que hay dentro del archivo, no por su nombre.'],
      ['Miniaturas', 'Oli dibuja una imagen pequeña de cada página con PDF.js, para que veas lo que estás moviendo.'],
      ['Mover páginas', 'Arrastra una página a su nuevo lugar o usa los botones de cada página para moverla un lugar antes o después.'],
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
      q: '¿También puedo girar o quitar páginas aquí?',
      a: 'Aquí no: esta herramienta solo cambia el orden. Organizar PDF mueve, gira y quita páginas en una sola cuadrícula.',
    },
    {
      q: '¿Puedo mover páginas con el teclado?',
      a: 'Sí. Usa las flechas para pasar de una página a otra, presiona Espacio para tomar una, muévela con las flechas y presiona Espacio para soltarla. Los botones de cada página también funcionan con el teclado.',
    },
    {
      q: '¿Y los números de página impresos en las páginas?',
      a: 'Son parte de cada página y se mueven con ella, así que después del nuevo orden quizá ya no vayan seguidos.',
    },
    {
      q: '¿Puedo ordenar un PDF que tiene contraseña?',
      a: 'Tal como está, no. Quita la protección en Desbloquear PDF primero y después vuelve para ordenar las páginas.',
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
