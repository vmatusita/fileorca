import type { ImageToolTexts, PdfOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'Imagen a PDF en línea, sin subir archivos',
  description:
    'Convierte imágenes JPG, PNG y WebP en un solo PDF en tu navegador, una por página. Sin subir nada, sin límite y sin datos GPS ni nombres de archivo en el PDF.',
  h1: 'Imagen a PDF',
  howHeading: 'Cómo convertir imágenes en un PDF',
  howSteps: [
    'Suelta tus imágenes en el cuadro, elígelas o pégalas con Ctrl V.',
    'Elige Tamaño de la imagen, Carta o A4 para las páginas, y deja la lista en el orden que quieras: arrastra una fila o presiona sus botones de flecha (también funcionan con el teclado).',
    'Descarga tu PDF.',
  ],
  specsHeading: 'Especificaciones',
  specs: {
    caption: 'Imagen a PDF: formatos que acepta, resultado y límites',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Acepta', 'JPG, PNG y WebP, reconocidos por el contenido del archivo y no por el nombre. Las fotos HEIC pasan antes por HEIC a JPG, y los archivos AVIF, por AVIF a JPG.'],
      ['Resultado', 'Un solo PDF para todo el lote, con una imagen por página, en el orden de la lista.'],
      ['Tamaño de la imagen', 'La opción predeterminada. Cada página toma el tamaño de su imagen, sin borde blanco.'],
      ['Carta y A4', 'La imagen entera cabe dentro de la hoja con un margen de 0.5 pulgadas, que son 36 puntos. La hoja gira para coincidir con cada imagen.'],
      ['Imágenes en el PDF', 'Las fotos entran como JPG, y las imágenes con transparencia entran como PNG. Las dos se guardan de nuevo a partir de los píxeles, con la orientación de la foto aplicada.'],
      ['Datos del PDF', 'El PDF no tiene título ni autor tomados de los nombres de tus archivos. FileOrca solo aparece como el programa que lo creó.'],
      ['Lote', 'Sin límite de imágenes. Un lote siempre da un solo PDF.'],
      ['Metadatos', 'Exif, XMP, IPTC y GPS nunca llegan al PDF.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Cómo pongo varias imágenes en un solo PDF?',
      a: 'Suéltalas todas juntas. Oli pone una imagen en cada página, en el orden de la lista, y te da un solo PDF.',
    },
    {
      q: '¿Qué tamaño de página debo elegir?',
      a: 'Tamaño de la imagen hace que cada página tenga el tamaño de su imagen, lo que sirve para fotos que solo quieres ver. Carta y A4 son hojas estándar para imprimir, o para formularios que piden una página normal; la imagen queda dentro de la hoja con un margen.',
    },
    {
      q: '¿Cómo cambio el orden de las páginas?',
      a: 'Las páginas siguen el orden de la lista en la pantalla. Arrastra una fila a otro lugar o presiona sus botones de flecha para subirla o bajarla; también funcionan con el teclado. La papelera de una fila saca esa imagen de la lista, y Deshacer la devuelve. Si el PDF ya está listo, Oli lo rehace en el orden nuevo, sin preparar las imágenes otra vez.',
    },
    {
      q: '¿Mis fotos pierden calidad en el PDF?',
      a: 'Una foto se guarda de nuevo como JPG cuando entra, lo que puede costar un poco de calidad. Una imagen con transparencia entra como PNG, sin pérdida.',
    },
    {
      q: '¿El PDF incluye la ubicación de mis fotos?',
      a: 'No. Las imágenes entran al PDF a partir de sus píxeles y no del archivo original, así que los datos Exif y GPS no pasan. El PDF tampoco tiene título ni autor tomados de los nombres de tus archivos.',
    },
    {
      q: '¿Por qué mi PDF pesa tanto?',
      a: 'Un PDF pesa más o menos lo mismo que las imágenes que lleva dentro. Usa antes Comprimir imagen o Redimensionar imagen en las fotos, y después arma el PDF con las copias más ligeras.',
    },
    {
      q: '¿Puedo poner en un PDF las fotos HEIC de mi iPhone?',
      a: 'No directamente. Conviértelas antes con HEIC a JPG, y después agrega aquí los archivos JPG.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Oli arma el PDF con tus imágenes en tu navegador, y tus archivos nunca salen de tu dispositivo ni llegan a un servidor. El PDF omite los metadatos de la foto, incluida la ubicación GPS.',
  relatedHeading: 'Más herramientas de imagen',
  panel: {
    formats: 'JPG, PNG o WebP',
    progressLabel: 'Armando tu PDF',
    done: '¡Listo! Ya tienes tu PDF.',
    doneMany: '¡Listo! Ya tienes tu PDF de {count} páginas.',
    options: {
      legend: 'Tamaño de página',
      image: 'Tamaño de la imagen',
      letter: 'Carta',
      a4: 'A4',
      help: 'Una imagen por página, en el orden de la lista. Carta y A4 dejan un margen de 0.5 pulgadas.',
    },
  },
} satisfies ImageToolTexts<PdfOptionsTexts>;
