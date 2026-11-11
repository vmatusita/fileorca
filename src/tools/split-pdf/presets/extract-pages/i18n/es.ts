// Extract pages from PDF (F18, decisions 5 and 7): a preset of Split PDF in its Pick mode only, with one PDF out. Page
// blocks (how, specs, faq, privacy, related) with at least three of their own (gate:conteudo, MIN_OWN_BLOCKS) and the panel
// bits of the shared PDF island, in Spanish (docs/i18n/es.md; the suffix "-extraido" is in the glossary, DECISOES § 724).
// The specs rows state the real behaviour of the PDF engine (src/engine/pdf/): when it changes there, change them here and
// in en.ts. F18: front P refines the option texts (no mode segment).
import type { PdfToolTexts } from '../../../../../i18n/types.ts';
import type { ExtractTexts } from '../../../../pdf/option-texts.ts';

const texts: PdfToolTexts<ExtractTexts> = {
  title: 'Extraer páginas de PDF: guarda las que elijas en un PDF nuevo',
  description:
    'Extrae páginas de un PDF en tu navegador: elígelas en una cuadrícula de miniaturas o escribe números como 2-4, 7, y recíbelas en un PDF nuevo. No se sube nada.',
  h1: 'Extraer páginas de PDF',
  howHeading: 'Cómo extraer páginas de un PDF',
  howSteps: [
    'Suelta un PDF en el cuadro, elígelo o pégalo. Oli muestra una miniatura de cada página, y la lupa abre una página en tamaño grande.',
    'Elige en la cuadrícula las páginas que quieres, o escribe sus números, como 2-4, 7.',
    'Presiona Extraer páginas. Oli copia las páginas elegidas a un PDF nuevo, en el orden que tienen en tu archivo.',
    'Descarga el PDF nuevo, con el nombre de tu archivo y -extraido. Tu original conserva todas sus páginas.',
  ],
  specsHeading: 'Lo que conserva el PDF extraído',
  specs: {
    caption: 'Lo que Extraer páginas de PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Qué acepta', 'Un PDF a la vez. Oli lee lo que hay dentro del archivo, no su nombre ni su extensión.'],
      ['Elegir las páginas', 'Toca las páginas en la cuadrícula de miniaturas, o escribe números y rangos como 2-4, 7, y Oli las elige por ti. "Elegir todas", "Desmarcar todas" e "Invertir selección" funcionan en toda la cuadrícula.'],
      ['Lo que recibes', 'Un PDF con las páginas elegidas, en el orden que tienen en tu archivo, con -extraido en el nombre. Las páginas se copian, así que tu original las conserva todas.'],
      ['Campos de formulario', 'El PDF nuevo conserva los campos de formulario de las páginas extraídas. Se quita la capa XFA, que solo leen las aplicaciones de Adobe.'],
      ['Marcadores y enlaces', 'Los marcadores y los enlaces entre páginas se quedan cuando apuntan a una página extraída. Los enlaces a una dirección web también se quedan, y los enlaces a las páginas que no se extrajeron desaparecen.'],
      ['Datos del documento', 'El PDF nuevo toma el título, el autor y los demás metadatos de tu archivo. Oli no agrega fecha, ni nombre de programa, ni nada de tu dispositivo.'],
      ['PDF bloqueados', 'Un PDF con contraseña para abrirlo, o con restricciones de edición, se rechaza con un enlace a Desbloquear PDF.'],
      ['Archivos dañados', 'Se rechaza un archivo vacío, cortado o que no es un PDF. Un índice dañado se repara mientras Oli lee el archivo.'],
    ],
  },
  faqHeading: 'Preguntas sobre extraer páginas',
  faq: [
    {
      q: '¿Cuál es la diferencia entre extraer páginas y dividir un PDF?',
      a: 'Extraer páginas de PDF te da un PDF con las páginas que elijas. Dividir PDF también puede poner cada página en un archivo propio, o cortar el PDF en varios archivos por rangos como 1-3, 4-6. Para sacar unas pocas páginas en un solo archivo, Extraer páginas de PDF tiene menos pasos.',
    },
    {
      q: '¿Conviene más usar Eliminar páginas de PDF?',
      a: 'Usa Eliminar páginas de PDF cuando sea más rápido elegir las páginas que se van que las que se quedan: te da tu PDF sin las páginas que elijas. Extraer páginas de PDF hace lo contrario y te da solo las páginas que elijas.',
    },
    {
      q: '¿Puedo poner las páginas extraídas en otro orden?',
      a: 'Salen en el orden que tienen en tu archivo. Para cambiar el orden, girar una página o quitar otra también, abre el PDF nuevo en Organizar PDF.',
    },
    {
      q: '¿Mi PDF original pierde las páginas que extraigo?',
      a: 'No. Oli copia las páginas elegidas a un archivo nuevo y nunca cambia el tuyo, que conserva todas las páginas que tenía.',
    },
    {
      q: '¿Mi PDF se sube a algún lugar para extraer las páginas?',
      a: 'No. El PDF se lee y el archivo nuevo se escribe en tu dispositivo, en tu navegador, y no se envía nada a un servidor. Abre la pestaña Red de tu navegador mientras extraes las páginas: ninguna solicitud lleva tu archivo.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Las páginas que extraes se copian en tu dispositivo, en tu navegador, y tu PDF nunca se envía a un servidor.',
  relatedHeading: 'Herramientas relacionadas',
  panel: {
    suffix: 'extraido',
    note: 'un PDF a la vez',
    progressLabel: 'Extrayendo las páginas',
    done: '¡Listo! Oli puso tus páginas en un PDF nuevo.',
    doneMany: '¡Listo! Oli hizo {count} PDF a partir de tu archivo.',
    action: 'Extraer páginas',
    options: {
      pickHelp: 'Elige las páginas que quieres. Van juntas a un PDF nuevo, en el orden de tu archivo.',
      pickNone: 'Primero elige al menos una página.',
    },
  },
};

export default texts;
