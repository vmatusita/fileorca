import type { ImageToolTexts, PresetOptionsTexts } from '../../../../../i18n/types.ts';

export default {
  title: 'Comprimir imagen a 100 KB en línea, sin subir archivos',
  description:
    'Comprime una imagen JPG, PNG o WebP a 100 KB o menos en tu navegador, para formularios con límite de tamaño. Sin subir nada, sin límite de imágenes y sin GPS.',
  h1: 'Comprimir imagen a 100 KB',
  howHeading: 'Cómo dejar una imagen en menos de 100 KB',
  howSteps: [
    'Suelta en el cuadro las imágenes que un formulario rechazó, elígelas o pégalas con Ctrl V.',
    'Oli guarda cada una como un JPG de 100 KB o menos, y también reduce sus dimensiones cuando tiene demasiado detalle.',
    'Revisa el tamaño nuevo en el resultado y descarga la imagen o el ZIP.',
  ],
  specsHeading: 'El objetivo de 100 KB',
  specs: {
    caption: 'Lo que garantiza el ajuste de 100 KB y lo que cambia',
    head: ['Detalle', 'Qué hace Oli'],
    rows: [
      ['Objetivo', 'Cada archivo pesa 100,000 bytes o menos.'],
      ['Qué KB', 'El KB se cuenta como 1,000 bytes, la menor de las dos lecturas, así que el archivo también pasa en los formularios que cuentan 1,024 bytes por KB.'],
      ['Formato de salida', 'Siempre un JPG, el formato que más piden los formularios y los portales. Entran JPG, PNG y WebP.'],
      ['Transparencia', 'Las zonas transparentes quedan blancas, porque el JPG no tiene transparencia.'],
      ['Imagen que ya cabe', 'Vuelve tal como estaba, en su propio formato, sin los metadatos de la foto.'],
      ['Imagen con mucho detalle', 'Cuando la calidad sola no alcanza el objetivo, Oli también reduce las dimensiones y te muestra el nuevo ancho y el nuevo alto.'],
      ['Privacidad del archivo', 'Exif, XMP, IPTC y GPS quedan fuera de cada archivo nuevo.'],
    ],
  },
  faqHeading: 'Preguntas sobre 100 KB',
  faq: [
    {
      q: '¿Por qué un formulario pide una imagen de menos de 100 KB?',
      a: 'Los formularios de solicitud, los portales de exámenes y los envíos de documentos de identidad suelen poner límites pequeños, para que sus servidores guarden y carguen millones de archivos con rapidez. El límite casi siempre es el peso del archivo, a veces junto con un tamaño en píxeles, así que lee lo que pide tu formulario.',
    },
    {
      q: '¿100 KB es lo mismo que 100,000 bytes?',
      a: 'Depende del formulario. Según el estándar, 1 KB son 1,000 bytes, pero algunos sistemas, entre ellos Windows, cuentan 1,024 bytes por KB. Oli apunta a 100,000 bytes, así que el archivo pasa con cualquiera de las dos cuentas.',
    },
    {
      q: '¿Por qué el resultado es un JPG, aunque haya soltado un PNG?',
      a: 'El JPG es el formato que más piden los formularios, y en las fotos llega a un tamaño pequeño mucho mejor que el PNG. Una foto PNG de unos cuantos megabytes no se puede reducir a 100 KB sin cambiar sus píxeles. Las zonas transparentes quedan blancas, porque el JPG no tiene transparencia.',
    },
    {
      q: '¿La imagen se verá peor a 100 KB?',
      a: 'Un poco, porque el archivo queda mucho más pequeño. Cuando la imagen es grande, Oli primero reduce sus dimensiones, lo que la mantiene nítida, y después busca la mejor calidad que todavía cabe. El control de antes y después te muestra la diferencia.',
    },
    {
      q: '¿Y si el formulario también pide un tamaño exacto en píxeles?',
      a: 'Usa primero Redimensionar imagen para fijar el ancho y el alto, y después vuelve aquí para el peso del archivo. Si la imagen tiene mucho detalle, Oli puede reducir un poco más las dimensiones, y te dice el tamaño nuevo.',
    },
    {
      q: '¿Y si mi imagen ya pesa menos de 100 KB?',
      a: 'Vuelve tal como estaba, en su propio formato, sin los metadatos de la foto. Oli nunca te da un archivo más grande que el que soltaste.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Oli reduce tus imágenes a 100 KB en tu navegador, y tus archivos nunca salen de tu dispositivo ni llegan a un servidor. Los archivos nuevos omiten los metadatos de la foto, incluida la ubicación GPS.',
  relatedHeading: 'Más herramientas de imagen',
  panel: {
    formats: 'JPG, PNG o WebP',
    progressLabel: 'Comprimiendo las imágenes',
    done: '¡Listo! Quedó un {percent} más ligera y cabe en 100 KB.',
    doneMany: '¡Listo! Tus {count} imágenes pesan 100 KB o menos cada una.',
    placardLabel: 'más ligera',
    options: {
      note: 'Cada imagen sale como un JPG de 100 KB o menos. La transparencia queda blanca.',
    },
  },
} satisfies ImageToolTexts<PresetOptionsTexts>;
