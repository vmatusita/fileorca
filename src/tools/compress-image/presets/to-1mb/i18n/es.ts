import type { ImageToolTexts, PresetOptionsTexts } from '../../../../../i18n/types.ts';

export default {
  title: 'Comprimir imagen a 1 MB en línea, sin subir archivos',
  description:
    'Comprime una imagen JPG, PNG o WebP a 1 MB o menos en tu navegador, para sitios que limitan el tamaño. Sin subir nada, sin límite de imágenes y sin datos GPS.',
  h1: 'Comprimir imagen a 1 MB',
  howHeading: 'Cómo dejar una imagen en menos de 1 MB',
  howSteps: [
    'Suelta en el cuadro las fotos que pesan demasiado, elígelas o pégalas con Ctrl V.',
    'Oli deja cada una por debajo del límite, y no hay nada que ajustar.',
    'Descarga la imagen comprimida.',
  ],
  specsHeading: 'El objetivo de 1 MB',
  specs: {
    caption: 'Lo que garantiza el ajuste de 1 MB y lo que cambia',
    head: ['Detalle', 'Qué hace Oli'],
    rows: [
      ['Objetivo', 'Cada archivo pesa 1 MB o menos.'],
      ['Formato de salida', 'Siempre un JPG. Entran JPG, PNG y WebP.'],
      ['Transparencia', 'Las zonas transparentes quedan blancas, porque el JPG no tiene transparencia.'],
      ['Imagen que ya pesa menos de 1 MB', 'Vuelve sin cambios, salvo los metadatos, en su propio formato.'],
      ['Foto con demasiado detalle', 'Si la calidad sola no alcanza el objetivo, Oli también reduce las dimensiones y te dice el nuevo ancho y el nuevo alto.'],
      ['Lote', 'Varias imágenes se descargan juntas en un solo ZIP.'],
      ['Metadatos', 'Exif, XMP, IPTC y GPS no se conservan en los archivos nuevos.'],
    ],
  },
  faqHeading: 'Preguntas sobre 1 MB',
  faq: [
    {
      q: '¿Por qué el sitio dice que mi archivo pasa de 1 MB?',
      a: 'Las fotos del teléfono y de la cámara suelen pesar varios megabytes, mientras que las fotos de perfil, los tickets de soporte y los formularios de solicitud a menudo aceptan solo 1 MB. Comprimir a 1 MB hace que la misma foto pase.',
    },
    {
      q: '¿1 MB es lo mismo que 1,024 KB?',
      a: 'No exactamente. Según el estándar, 1 MB son 1,000,000 bytes, mientras que 1,024 KB son 1,048,576 bytes, alrededor de un 5 % más. Oli apunta a 1,000,000 bytes, así que el archivo cabe con las dos cuentas.',
    },
    {
      q: '¿Puedo mantener el formato original, como PNG?',
      a: 'No cuando el archivo tiene que achicarse: una foto PNG no se puede reducir a un tamaño fijo sin cambiar sus píxeles, y el JPG se acepta casi en todas partes.',
    },
    {
      q: '¿Cuánta calidad pierdo a 1 MB?',
      a: 'A menudo muy poca, porque una foto grande tiene más detalle del que muestra una pantalla. Oli busca la mejor calidad que cabe en 1 MB, y el control de antes y después te deja revisar el resultado.',
    },
    {
      q: '¿Por qué mi imagen también quedó más pequeña en píxeles?',
      a: 'Bajar todavía más la calidad haría que una imagen con mucho detalle se viera cuadriculada, y menos píxeles con buena calidad se ven mejor.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Oli reduce tus fotos a 1 MB en tu navegador, y tus archivos nunca salen de tu dispositivo ni llegan a un servidor.',
  relatedHeading: 'Más herramientas de imagen',
  panel: {
    formats: 'JPG, PNG o WebP',
    progressLabel: 'Comprimiendo las imágenes',
    done: '¡Listo! Quedó un {percent} más ligera y cabe en 1 MB.',
    doneMany: '¡Listo! Tus {count} imágenes pesan 1 MB o menos cada una.',
    placardLabel: 'más ligera',
    options: {
      note: 'Cada imagen sale como un JPG de 1 MB o menos. La transparencia queda blanca.',
    },
  },
} satisfies ImageToolTexts<PresetOptionsTexts>;
