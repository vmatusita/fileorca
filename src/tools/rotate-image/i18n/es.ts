import type { ImageToolTexts, RotateOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'Rotar imagen en línea, sin subir archivos',
  description:
    'Rota o refleja una imagen JPG, PNG o WebP en tu navegador: 90° a la izquierda o a la derecha, 180°, en horizontal o vertical. Sin subir nada, sin límite ni GPS.',
  h1: 'Rotar imagen',
  howHeading: 'Cómo rotar una imagen',
  howSteps: [
    'Suelta tus imágenes en el cuadro, elígelas o pégalas con Ctrl V.',
    'Elige 90° a la derecha, 90° a la izquierda o 180°, y agrega un reflejo si quieres.',
    'Descarga la imagen rotada, o el ZIP si rotaste varias.',
  ],
  specsHeading: 'Especificaciones',
  specs: {
    caption: 'Rotar imagen: formatos que acepta, resultado y límites',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Acepta', 'JPG, PNG y WebP, reconocidos por el contenido del archivo y no por el nombre. Las fotos HEIC pasan antes por HEIC a JPG, y los archivos AVIF, por AVIF a JPG.'],
      ['Rotar', '90° a la derecha, que es la opción predeterminada, 90° a la izquierda o 180°.'],
      ['Reflejar', 'Ninguno, que es la opción predeterminada, Horizontal o Vertical. El reflejo se combina con la rotación.'],
      ['Lote', 'La rotación y el reflejo que elijas se aplican a todas las imágenes del lote. Sin límite de imágenes.'],
      ['Punto de partida', 'Primero se aplica la orientación de la foto, así que rotas la imagen tal como la muestra un visor normal y no sus píxeles en bruto.'],
      ['Resultado', 'El mismo formato del archivo que soltaste, con los mismos píxeles girados. Un giro de 90° intercambia el ancho y el alto. PNG y WebP conservan su transparencia.'],
      ['Calidad', 'JPG y WebP se guardan de nuevo después del giro. El PNG se guarda sin pérdida.'],
      ['Metadatos', 'Se eliminan Exif, XMP, IPTC y GPS, y no queda ninguna etiqueta de orientación que se lea dos veces.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Por qué mi foto se ve de lado en una app y derecha en otra?',
      a: 'Muchos teléfonos y cámaras guardan los píxeles en una dirección y agregan una pequeña etiqueta, llamada orientación, que dice cómo girar la imagen. Las apps que leen la etiqueta la muestran derecha, y las que la ignoran la muestran de lado. FileOrca aplica la etiqueta al guardar el archivo nuevo, así que los píxeles quedan bien y no queda ninguna etiqueta que se pueda leer mal.',
    },
    {
      q: '¿Rotar un JPG baja su calidad?',
      a: 'Un JPG o un WebP se guarda de nuevo después del giro, así que pasa una vez más por una compresión con pérdida. El PNG se guarda sin pérdida. Conserva tu original y rota una sola vez en lugar de hacerlo en varios pasos.',
    },
    {
      q: '¿Cómo roto varias fotos a la vez?',
      a: 'Suéltalas todas juntas. La rotación y el reflejo que elijas se aplican a todo el lote, y la descarga es un solo ZIP.',
    },
    {
      q: '¿Cuál es la diferencia entre rotar y reflejar?',
      a: 'Rotar gira la imagen alrededor de su centro, como girar una foto impresa sobre una mesa. Reflejar la voltea como si la vieras en un espejo: Horizontal intercambia la izquierda y la derecha, y Vertical intercambia arriba y abajo. El texto de una imagen reflejada se lee al revés.',
    },
    {
      q: '¿Puedo rotar una imagen 45° o en otro ángulo?',
      a: 'Aquí no. 90° a la derecha, 90° a la izquierda y 180° conservan todos los píxeles de la imagen. Un ángulo libre dejaría esquinas vacías que habría que rellenar, así que no forma parte de esta herramienta.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus imágenes se rotan en tu navegador, y tus archivos nunca salen de tu dispositivo ni llegan a un servidor. Las copias guardadas omiten los metadatos de la foto, incluida la ubicación GPS.',
  relatedHeading: 'Más herramientas de imagen',
  // F18 placeholder: front T writes the es text.
  // F18 (decision 5; DECISOES § 725): the table of the presets of this tool, with their links.
  presets: {
    heading: 'Ready-made settings',
    caption: 'Presets of Rotate image and what each one does',
    head: ['Preset', 'What it does'],
  },
  panel: {
    formats: 'JPG, PNG o WebP',
    progressLabel: 'Rotando las imágenes',
    done: '¡Listo! Tu imagen quedó rotada.',
    doneMany: '¡Listo! Tus {count} imágenes quedaron rotadas.',
    options: {
      turnLegend: 'Rotar',
      right: '90° a la derecha',
      left: '90° a la izquierda',
      half: '180°',
      flipLegend: 'Reflejar',
      none: 'Ninguno',
      horizontal: 'Horizontal',
      vertical: 'Vertical',
    },
  },
} satisfies ImageToolTexts<RotateOptionsTexts>;
