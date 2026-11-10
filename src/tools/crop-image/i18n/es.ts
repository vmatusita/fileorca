import type { CropOptionsTexts, ImageToolTexts } from '../../../i18n/types.ts';

export default {
  title: 'Recortar imagen en línea, sin subir archivos',
  description:
    'Recorta una imagen JPG, PNG o WebP en cuadrado, 4:5, 16:9 o forma libre en tu navegador. Sin subir nada, sin límite de imágenes y sin metadatos como el GPS.',
  h1: 'Recortar imagen',
  howHeading: 'Cómo recortar una imagen',
  howSteps: [
    'Suelta tus imágenes en el cuadro, elígelas o pégalas con Ctrl V.',
    'Elige Cuadrado, 4:5, 16:9 o Libre, y arrastra el recuadro o sus esquinas, o escribe su posición y su tamaño.',
    'Descarga la imagen recortada, o el ZIP si recortaste varias.',
  ],
  specsHeading: 'Especificaciones',
  specs: {
    caption: 'Recortar imagen: formatos que acepta, resultado y límites',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Acepta', 'JPG, PNG y WebP, reconocidos por el contenido del archivo y no por el nombre. Las fotos HEIC pasan antes por HEIC a JPG, y los archivos AVIF, por AVIF a JPG.'],
      ['Formas', 'Cuadrado, que es la opción predeterminada, 4:5, 16:9 o Libre. El recuadro se abre centrado, así que hay un resultado listo en cuanto sueltas una imagen.'],
      ['Mover el recuadro', 'Arrastra el recuadro o sus esquinas, o selecciónalo y usa las flechas del teclado. Mayús con las flechas cambia su tamaño.'],
      ['Valores exactos', 'Escribe la x, la y, el ancho y el alto del recuadro en píxeles de la imagen: así puedes recortar sin un puntero.'],
      ['Lote', 'Cada imagen recibe el recorte centrado en la forma que elegiste. Elige una imagen en la lista para ajustar su propio recuadro.'],
      ['Resultado', 'El mismo formato del archivo que soltaste, con los píxeles del recuadro y sin escalar. PNG y WebP conservan su transparencia.'],
      ['Calidad', 'JPG y WebP se guardan de nuevo después del recorte. El PNG se guarda sin pérdida.'],
      ['Metadatos', 'Se eliminan Exif, XMP, IPTC y GPS, y la orientación de la foto se aplica antes de recortar.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Cómo recorto una foto en cuadrado?',
      a: 'Cuadrado es la forma predeterminada. El recuadro se abre centrado y con los lados iguales, así que puedes descargar enseguida, o arrastrarlo sobre la parte de la foto que quieres conservar.',
    },
    {
      q: '¿Cómo recorto una imagen en 4:5 para Instagram?',
      a: 'Elige 4:5 y arrastra el recuadro sobre la parte que quieres conservar. Una imagen 4:5 es más alta que ancha, y el recuadro mantiene esa forma cuando cambias su tamaño. Si la app pide píxeles exactos, pasa la imagen recortada por Redimensionar imagen.',
    },
    {
      q: '¿Recortar baja la calidad de una imagen?',
      a: 'Al recortar se eliminan píxeles y no se estiran los que quedan, así que la parte que conservas es tan nítida como el original. JPG y WebP se guardan de nuevo después del recorte, y ese es el único cambio. El PNG se guarda sin pérdida.',
    },
    {
      q: '¿Puedo recortar sin una forma fija?',
      a: 'Sí. Elige Libre y arrastra cualquier lado o esquina del recuadro. Con Libre, el ancho y el alto cambian por separado.',
    },
    {
      q: '¿Puedo recortar con el teclado?',
      a: 'Sí. Selecciona el recuadro de recorte, muévelo con las flechas y mantén Mayús con las flechas para cambiar su tamaño. También puedes escribir la x, la y, el ancho y el alto del recuadro en los campos debajo de la imagen.',
    },
    {
      q: '¿Puedo recortar muchas fotos a la vez?',
      a: 'Sí. Suéltalas todas y cada una recibe el recorte centrado en la forma que elegiste. Elige una en la lista para mover su recuadro, y las demás fotos conservan el suyo.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus imágenes se recortan en tu navegador, y tus archivos nunca salen de tu dispositivo ni llegan a un servidor. Las copias guardadas omiten los metadatos de la foto, incluida la ubicación GPS.',
  relatedHeading: 'Más herramientas de imagen',
  panel: {
    formats: 'JPG, PNG o WebP',
    progressLabel: 'Recortando las imágenes',
    done: '¡Listo! Tu imagen quedó recortada.',
    doneMany: '¡Listo! Tus {count} imágenes quedaron recortadas.',
    options: {
      legend: 'Proporción',
      square: 'Cuadrado',
      portrait: '4:5',
      wide: '16:9',
      free: 'Libre',
      boxLabel: 'Área de recorte',
      boxValue: '{width} por {height} píxeles, en {x}, {y}',
      keyboardHelp: 'Las flechas mueven el recuadro. Mayús con las flechas cambia su tamaño.',
      x: 'X',
      y: 'Y',
      width: 'Ancho',
      height: 'Alto',
      px: 'px',
      invalid: 'Escribe un número entero que deje el recuadro dentro de la imagen.',
      batchNote: 'Cada imagen recibe el recorte centrado. Elige una imagen en la lista para ajustar su recuadro.',
    },
  },
} satisfies ImageToolTexts<CropOptionsTexts>;
