import type { ImageToolTexts, ResizeOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'Redimensionar imagen en línea, sin subir archivos',
  description:
    'Redimensiona una imagen JPG, PNG o WebP por píxeles o por porcentaje en tu navegador. Sin subir nada, sin límite de imágenes y sin metadatos como el GPS.',
  h1: 'Redimensionar imagen',
  howHeading: 'Cómo redimensionar una imagen',
  howSteps: [
    'Suelta tus imágenes en el cuadro, elígelas o pégalas con Ctrl V.',
    'Elige Por tamaño y escribe un ancho y un alto, o elige Por porcentaje y escribe un número.',
    'Descarga la imagen redimensionada, o el ZIP si redimensionaste varias.',
  ],
  specsHeading: 'Especificaciones',
  specs: {
    caption: 'Redimensionar imagen: formatos que acepta, resultado y límites',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Acepta', 'JPG, PNG y WebP, reconocidos por el contenido del archivo y no por el nombre. Las fotos HEIC pasan antes por HEIC a JPG, y los archivos AVIF no se aceptan.'],
      ['Por tamaño', 'Escribes un ancho y un alto en píxeles. Las proporciones quedan fijas, y cada imagen cabe dentro de ese recuadro.'],
      ['Por porcentaje', 'Escribes un porcentaje del ancho y del alto actuales, el mismo para todas las imágenes del lote.'],
      ['Nunca amplía', 'Si pides más píxeles de los que tiene la imagen, conserva su tamaño original, y el resultado te lo dice.'],
      ['Resultado', 'El mismo formato del archivo que soltaste. PNG y WebP conservan su transparencia.'],
      ['Calidad', 'JPG y WebP se guardan de nuevo después de redimensionar. El PNG se guarda sin pérdida.'],
      ['Lote', 'Sin límite de imágenes. Una imagen se descarga directamente, y varias llegan en un solo ZIP.'],
      ['Fotos grandes', 'Las imágenes de más de 16,777,216 píxeles, unos 16.8 megapíxeles, se redimensionan sin el canvas del navegador, así que también funcionan.'],
      ['Metadatos', 'Se eliminan Exif, XMP, IPTC y GPS, y se aplica la orientación de la foto.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Cómo redimensiono una imagen a un tamaño exacto en píxeles?',
      a: 'Elige Por tamaño y escribe el ancho y el alto que necesitas. Las proporciones quedan fijas, así que cada imagen cabe dentro de ese recuadro: una foto de 4000 × 3000 en un recuadro de 1000 × 1000 sale de 1000 × 750.',
    },
    {
      q: '¿Redimensionar baja la calidad de una imagen?',
      a: 'Achicar una imagen la mantiene nítida en su nuevo tamaño. Agrandarla solo puede estirar los píxeles que ya tiene, y eso se ve borroso, así que Redimensionar imagen nunca amplía: si pides más píxeles de los que tiene la imagen, recibes el tamaño original y el resultado te lo dice.',
    },
    {
      q: '¿Conviene redimensionar por píxeles o por porcentaje?',
      a: 'Usa píxeles cuando un formulario o un sitio web pide un tamaño, como 800 × 600. Usa un porcentaje cuando solo quieres que todo quede más pequeño en la misma medida, como 50 % para la mitad del ancho y la mitad del alto. En un lote de fotos distintas, un porcentaje achica cada una en la misma medida, mientras que un tamaño hace que todas quepan en el mismo recuadro.',
    },
    {
      q: '¿Cambiar los DPI cambia el tamaño de una imagen?',
      a: 'Los DPI son un ajuste de impresión, y en una pantalla lo que cuenta es la cantidad de píxeles. Redimensionar imagen cambia los píxeles, así que cambia qué tan grande se ve la imagen en una página web y cuánto pesa el archivo.',
    },
    {
      q: '¿El archivo pesará menos después de redimensionarlo?',
      a: 'Casi siempre sí, porque menos píxeles dan un archivo más pequeño. Para un peso exacto, como 100 KB, usa Comprimir imagen a 100 KB.',
    },
    {
      q: '¿Mi imagen se sube a algún lugar?',
      a: 'No. FileOrca redimensiona la imagen en tu dispositivo, dentro del navegador. Abre la pestaña Red del navegador mientras redimensionas: ninguna solicitud lleva tu archivo.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus imágenes se redimensionan en tu navegador, y tus archivos nunca salen de tu dispositivo ni llegan a un servidor. Las copias guardadas omiten los metadatos de la foto, incluida la ubicación GPS.',
  relatedHeading: 'Más herramientas de imagen',
  presets: {
    heading: 'Tamaños listos',
    caption: 'Ajustes predefinidos de Redimensionar imagen y qué hace cada uno',
    head: ['Ajuste predefinido', 'Qué hace'],
  },
  panel: {
    formats: 'JPG, PNG o WebP',
    progressLabel: 'Redimensionando las imágenes',
    done: '¡Listo! Tu imagen quedó redimensionada.',
    doneMany: '¡Listo! Tus {count} imágenes quedaron redimensionadas.',
    options: {
      legend: 'Redimensionar',
      bySize: 'Por tamaño',
      byPercent: 'Por porcentaje',
      width: 'Ancho',
      height: 'Alto',
      percent: 'Porcentaje',
      px: 'px',
      pct: '%',
      fitNote: 'Cada imagen cabe dentro de este recuadro y conserva sus proporciones.',
      invalid: 'Escribe un número entero de 1 a {max}.',
    },
  },
} satisfies ImageToolTexts<ResizeOptionsTexts>;
