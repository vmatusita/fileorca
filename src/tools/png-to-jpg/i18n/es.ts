import type { ImageToolTexts, NoteOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'PNG a JPG en línea, sin subir archivos',
  description:
    'Convierte imágenes PNG en JPG, o JPG en PNG, en tu navegador. Sin subir nada y sin límite de imágenes; la transparencia queda blanca y se quitan los datos GPS.',
  h1: 'PNG a JPG',
  howHeading: 'Cómo convertir PNG a JPG',
  howSteps: [
    'Suelta tus imágenes PNG o JPG en el cuadro, elígelas o pégalas con Ctrl V.',
    'Oli convierte cada archivo al otro formato: un PNG se vuelve JPG, y un JPG se vuelve PNG.',
    'Descarga la imagen convertida, o el ZIP si convertiste varias.',
  ],
  specsHeading: 'Especificaciones',
  specs: {
    caption: 'PNG a JPG: formatos que acepta, resultado y límites',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Acepta', 'Archivos PNG y JPG, reconocidos por el contenido del archivo y no por el nombre.'],
      ['Dirección', 'La define el archivo, así que no hay nada que ajustar. Un PNG se vuelve JPG, y un JPG se vuelve PNG.'],
      ['PNG a JPG', 'La transparencia queda blanca. En las fotos, el archivo suele pesar mucho menos.'],
      ['JPG a PNG', 'Sin pérdida: el PNG guarda exactamente los píxeles del JPG. El archivo suele pesar mucho más, y el detalle que el JPG ya perdió no vuelve.'],
      ['Lote mixto', 'Un lote puede tener los dos formatos, y cada archivo pasa al otro.'],
      ['Lote', 'Sin límite de imágenes. Una imagen se descarga directamente, y varias llegan en un solo ZIP.'],
      ['Metadatos', 'Se eliminan Exif, XMP, IPTC y GPS, y se aplica la orientación de la foto.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Por qué la parte transparente de mi PNG se vuelve negra?',
      a: 'El JPG no tiene transparencia, así que un convertidor tiene que elegir un color para ponerlo en su lugar, y algunos eligen el negro. FileOrca la rellena con blanco. Para conservar la transparencia, quédate con el PNG.',
    },
    {
      q: '¿Pasar de PNG a JPG baja la calidad?',
      a: 'Un poco, porque el JPG comprime con pérdida. En las fotos la diferencia es pequeña. En capturas de pantalla, logos y texto con bordes nítidos, el JPG puede agregar un leve desenfoque alrededor de los bordes, así que para esos casos quédate con el PNG.',
    },
    {
      q: '¿Por qué mi PNG pesa mucho más que un JPG?',
      a: 'El PNG guarda cada píxel sin pérdida, lo que sirve para logos y capturas de pantalla, pero pesa mucho en las fotos. El JPG descarta detalle que el ojo casi no nota, así que una foto suele achicarse bastante.',
    },
    {
      q: '¿Convertir un JPG en PNG mejora la calidad?',
      a: 'No. El PNG guarda exactamente lo que tenía el JPG, sin pérdida adicional, pero no puede recuperar el detalle que ya se perdió. Úsalo cuando una app o un formulario pide un PNG, o antes de editar la imagen.',
    },
    {
      q: '¿Mi imagen se sube a algún lugar?',
      a: 'No. FileOrca convierte la imagen en tu dispositivo, dentro del navegador. Abre la pestaña Red del navegador mientras conviertes: ninguna solicitud lleva tu archivo.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus imágenes se convierten en tu navegador, y tus archivos nunca salen de tu dispositivo ni llegan a un servidor. Los archivos nuevos omiten los metadatos de la foto, incluida la ubicación GPS.',
  relatedHeading: 'Más herramientas de imagen',
  panel: {
    formats: 'PNG o JPG',
    progressLabel: 'Convirtiendo las imágenes',
    done: '¡Listo! Tu imagen quedó convertida.',
    doneMany: '¡Listo! Tus {count} imágenes quedaron convertidas.',
    options: {
      note: 'Un PNG se vuelve JPG, con la transparencia en blanco. Un JPG se vuelve PNG, sin pérdida.',
    },
  },
} satisfies ImageToolTexts<NoteOptionsTexts>;
