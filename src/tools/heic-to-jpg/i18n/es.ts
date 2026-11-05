import type { ImageToolTexts, SaveAsOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'HEIC a JPG en línea, sin subir archivos',
  description:
    'Convierte fotos HEIC y HEIF de un iPhone o de un teléfono Android a JPG o PNG en tu navegador. Sin subir nada, sin límite de fotos y sin la ubicación GPS.',
  h1: 'HEIC a JPG',
  howHeading: 'Cómo convertir HEIC a JPG',
  howSteps: [
    'Suelta tus fotos HEIC en el cuadro, elígelas o pégalas con Ctrl V.',
    'Deja JPG, o elige PNG si quieres la foto sin más pérdida.',
    'Descarga la foto convertida, o el ZIP si convertiste varias.',
  ],
  specsHeading: 'Especificaciones',
  specs: {
    caption: 'HEIC a JPG: formatos que acepta, resultado y límites',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Acepta', 'Archivos HEIC y HEIF de iPhone y de teléfonos Android, reconocidos por el contenido del archivo y no por el nombre.'],
      ['Resultado', 'JPG, que es la opción predeterminada, o PNG. Sale un archivo por cada HEIC.'],
      ['Qué imagen', 'La imagen principal del archivo. El video de la Live Photo, el mapa de profundidad y el mapa HDR quedan fuera, y una foto espacial del Apple Vision Pro da su imagen principal.'],
      ['Colores', 'Se convierten al sRGB estándar, el perfil de color que entienden todos los navegadores y todas las apps.'],
      ['Orientación', 'Se aplica una sola vez, así que una foto vertical sale derecha.'],
      ['Lote', 'Sin límite de fotos. Una foto se descarga directamente, y varias llegan en un solo ZIP.'],
      ['Fotos grandes', 'Las fotos de más de 16,777,216 píxeles, unos 16.8 megapíxeles, se convierten sin el canvas del navegador, así que las fotos de 24 megapíxeles del iPhone también funcionan.'],
      ['Metadatos', 'Se eliminan Exif, XMP, IPTC y GPS, incluidos la fecha de la foto y el modelo de la cámara.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Por qué no puedo abrir archivos HEIC en Windows?',
      a: 'HEIC es el formato que usa el iPhone para las fotos. Windows necesita extensiones de códec adicionales para mostrarlo, y muchas apps y sitios web lo rechazan. Un JPG hecho a partir de la foto se abre casi en cualquier lugar.',
    },
    {
      q: '¿Convertir HEIC a JPG baja la calidad?',
      a: 'El JPG comprime con pérdida, así que el archivo nuevo no es una copia bit a bit de la foto, y al verla normalmente la diferencia es pequeña. Elige PNG para no perder más; el archivo será mucho más grande.',
    },
    {
      q: '¿Qué pasa con mi Live Photo?',
      a: 'Oli convierte solo la imagen principal del archivo, así que recibes la foto fija. El video corto de una Live Photo no está en el JPG, y tampoco los datos de profundidad de una foto en modo Retrato ni el mapa HDR.',
    },
    {
      q: '¿El JPG conserva la fecha y la ubicación?',
      a: 'No. El JPG se guarda solo a partir de los píxeles, así que la ubicación GPS, el modelo de la cámara y la fecha de la foto quedan fuera. Si necesitas esos datos, conserva el HEIC original.',
    },
    {
      q: '¿Por qué los colores se ven distintos después de convertir?',
      a: 'El iPhone toma fotos con una gama de color amplia llamada Display P3. FileOrca la convierte a sRGB, el estándar que esperan todas las pantallas y todas las apps, así que los colores se ven iguales en todas partes. Una foto muy saturada puede verse un poco menos viva, porque el sRGB cubre una gama más pequeña.',
    },
    {
      q: '¿Mi iPhone puede guardar JPG en lugar de HEIC?',
      a: 'Sí. Abre Configuración, luego Cámara, luego Formatos, y elige Más compatible. Las fotos nuevas se guardan como JPG, pero ocupan más espacio que en HEIC.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus fotos se convierten en tu navegador, y tus archivos nunca salen de tu dispositivo ni llegan a un servidor. Los archivos nuevos omiten los metadatos de la foto, incluida la ubicación GPS.',
  relatedHeading: 'Más herramientas de imagen',
  panel: {
    formats: 'HEIC o HEIF',
    progressLabel: 'Convirtiendo las imágenes',
    done: '¡Listo! Tu foto quedó convertida.',
    doneMany: '¡Listo! Tus {count} fotos quedaron convertidas.',
    elsewhere: {
      reason: '{name} es un PNG, no una foto HEIC. Para tener un JPG, usa {tool}.',
      label: 'Para un PNG:',
    },
    options: {
      legend: 'Guardar como',
      jpg: 'JPG',
      png: 'PNG',
      help: 'El JPG se abre en todas partes y puede salir más grande que el HEIC. El PNG no suma más pérdida, pero el archivo es mucho más grande.',
    },
  },
} satisfies ImageToolTexts<SaveAsOptionsTexts>;
