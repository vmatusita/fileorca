// Flip image (F18, decision 9): a preset of Rotate image with the mirror alone, Horizontal (the default) or Vertical, and no
// turn. Page blocks with at least three of their own (gate:conteudo, MIN_OWN_BLOCKS) and the panel bits. The Spanish text
// says what the English one says, with "Reflejar" of the "Mirror" row of docs/i18n/es.md (DECISOES § 736).
import type { FlipOptionsTexts, ImageToolTexts } from '../../../../../i18n/types.ts';

export default {
  title: 'Reflejar imagen en línea, sin subir archivos',
  description:
    'Refleja una imagen JPG, PNG o WebP en tu navegador: intercambia la izquierda y la derecha, o arriba y abajo, sin rotarla. Sin subir nada, sin límite ni GPS.',
  h1: 'Reflejar imagen',
  howHeading: 'Cómo reflejar una imagen',
  howSteps: [
    'Suelta tus imágenes en el cuadro, elígelas o pégalas con Ctrl V.',
    'Deja Horizontal, o elige Vertical.',
    'Descarga la imagen reflejada.',
  ],
  specsHeading: 'Qué hace el reflejo',
  specs: {
    caption: 'Reflejar imagen: formatos que acepta, los dos reflejos y el resultado',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Acepta', 'JPG, PNG y WebP, reconocidos por el contenido del archivo y no por el nombre. Las fotos HEIC pasan antes por HEIC a JPG, y los archivos AVIF, por AVIF a JPG.'],
      ['Horizontal', 'La opción predeterminada. La izquierda y la derecha cambian de lugar, como en un espejo puesto al lado de la imagen.'],
      ['Vertical', 'Arriba y abajo cambian de lugar, como en el reflejo de la imagen en el agua quieta.'],
      ['Sin rotación', 'La imagen solo se refleja, nunca se gira. Para girarla también, Rotar imagen combina un giro con un reflejo.'],
      ['Punto de partida', 'Primero se aplica la orientación de la foto, así que el reflejo voltea la imagen tal como la ves y no sus píxeles en bruto.'],
      ['Lote', 'El reflejo que elijas se aplica a todas las imágenes del lote, sin límite de imágenes, y varias llegan en un solo ZIP.'],
      ['Resultado', 'El mismo formato y el mismo ancho y alto de la imagen que ves. PNG y WebP conservan su transparencia.'],
      ['Calidad', 'JPG y WebP se guardan de nuevo después del reflejo. El PNG se guarda sin pérdida.'],
      ['Metadatos', 'Se eliminan Exif, XMP, IPTC y GPS, y no queda ninguna etiqueta de orientación que se lea dos veces.'],
    ],
  },
  faqHeading: 'Preguntas sobre reflejar',
  faq: [
    {
      q: '¿Cuál es la diferencia entre reflejar y rotar una imagen?',
      a: 'Rotar gira la imagen alrededor de su centro, y reflejar la voltea como un espejo, así que el texto de una imagen reflejada se lee al revés.',
    },
    {
      q: '¿Cómo arreglo una selfie que salió reflejada?',
      a: 'Deja Horizontal: el texto que se leía al revés en la foto vuelve a leerse bien.',
    },
    {
      q: '¿Reflejar en vertical es lo mismo que poner la imagen de cabeza?',
      a: 'No. Un giro de 180° también intercambia la izquierda y la derecha, mientras que el reflejo vertical las deja donde están y solo intercambia arriba y abajo. Para una foto que está de cabeza, usa 180° en Rotar imagen.',
    },
    {
      q: '¿Reflejar un JPG baja su calidad?',
      a: 'Un poco, y la pérdida se suma cada vez que se guarda el archivo, así que refleja una sola vez a partir de tu original en lugar de hacerlo varias veces.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus imágenes se reflejan en tu dispositivo y nunca se envían a un servidor.',
  relatedHeading: 'Más herramientas de imagen',
  panel: {
    formats: 'JPG, PNG o WebP',
    progressLabel: 'Reflejando las imágenes',
    done: '¡Listo! Tu imagen quedó reflejada.',
    doneMany: '¡Listo! Tus {count} imágenes quedaron reflejadas.',
    options: {
      legend: 'Reflejar',
      horizontal: 'Horizontal',
      vertical: 'Vertical',
    },
  },
} satisfies ImageToolTexts<FlipOptionsTexts>;
