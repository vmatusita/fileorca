import type { ImageToolTexts, PresetOptionsTexts } from '../../../../../i18n/types.ts';

export default {
  title: 'Miniatura de YouTube de 1280 × 720, en línea y sin subir nada',
  description:
    'Crea una miniatura de YouTube de 1280 × 720 en tu navegador: un JPG de menos de 2 MB, recortado desde el centro. Sin subir nada, sin límite y sin datos GPS.',
  h1: 'Miniatura de YouTube',
  howHeading: 'Cómo hacer una miniatura de YouTube',
  howSteps: [
    'Suelta tus imágenes en el cuadro, elígelas o pégalas con Ctrl V.',
    'Oli crea la miniatura, y no hay nada que ajustar.',
    'Descarga la miniatura y agrégala en YouTube Studio.',
  ],
  specsHeading: 'El tamaño de la miniatura',
  specs: {
    caption: 'Lo que crea el ajuste de miniatura de YouTube y las reglas que sigue',
    head: ['Detalle', 'Qué hace Oli'],
    rows: [
      ['Tamaño', '1280 × 720 píxeles, una imagen 16:9.'],
      ['Formato', 'Siempre un JPG, guardado para quedar por debajo de 2 MB.'],
      ['Imagen que no es 16:9', 'Se recorta desde el centro para llenar el encuadre, y una línea del resultado te lo dice. La forma de la imagen nunca se deforma.'],
      ['Otra parte de la imagen', 'Recorta antes la imagen con Recortar imagen para elegir la parte que se queda, y después tráela aquí.'],
      ['Transparencia', 'Las zonas transparentes quedan blancas, porque el JPG no tiene transparencia.'],
      ['Datos de la foto', 'Exif, XMP, IPTC y GPS quedan fuera de cada miniatura.'],
    ],
  },
  faqHeading: 'Preguntas sobre miniaturas',
  faq: [
    {
      q: '¿De qué tamaño es una miniatura de YouTube?',
      a: 'La Ayuda de YouTube (https://support.google.com/youtube/answer/72431, consultada el 31 de octubre de 2026) pide una imagen 16:9 de al menos 640 píxeles de ancho, en JPG o PNG, y recomienda 3840 × 2160 para los videos. El tamaño que crea este ajuste está dentro de esas reglas.',
    },
    {
      q: '¿Por qué YouTube dice que mi miniatura es demasiado grande?',
      a: 'La causa habitual es el peso del archivo: la Ayuda de YouTube da 2 MB para una miniatura personalizada que se agrega desde un teléfono, y un PNG de 1280 × 720 puede pasar de ese límite.',
    },
    {
      q: '¿Por qué mi miniatura se ve borrosa?',
      a: 'Una miniatura se ve borrosa cuando la imagen de partida es pequeña, porque tiene muy pocos píxeles para verse nítida a 1280 × 720. Una imagen más pequeña que 1280 × 720 se amplía para llenar el encuadre, el resultado te lo dice, y puede verse menos nítida. Empieza con una imagen de al menos 1280 píxeles de ancho.',
    },
    {
      q: '¿Conviene usar 1280 × 720 o 3840 × 2160?',
      a: 'Los dos tamaños son 16:9, así que YouTube acepta cualquiera. El de 3840 × 2160 guarda más detalle en una pantalla grande, y el de 1280 × 720 da un archivo más ligero que carga rápido.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Oli convierte tus imágenes en miniaturas en tu navegador, y tus archivos nunca salen de tu dispositivo ni llegan a un servidor.',
  relatedHeading: 'Más herramientas de imagen',
  panel: {
    formats: 'JPG, PNG o WebP',
    progressLabel: 'Creando las miniaturas',
    done: '¡Listo! Tu miniatura mide 1280 × 720.',
    doneMany: '¡Listo! Tus {count} miniaturas miden 1280 × 720.',
    options: {
      note: 'Cada imagen sale como un JPG de 1280 × 720, recortado desde el centro para llenar el 16:9. Usa antes Recortar imagen para elegir la parte que se queda.',
    },
  },
} satisfies ImageToolTexts<PresetOptionsTexts>;
