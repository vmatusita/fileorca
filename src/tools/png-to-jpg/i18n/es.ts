import type { ImageToolTexts, NoteOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'PNG a JPG en línea, sin subir archivos',
  description:
    'Convierte imágenes PNG en JPG, o JPG en PNG, en tu navegador. Sin subir nada y sin límite de imágenes; la transparencia queda blanca y se quitan los datos GPS.',
  h1: 'PNG a JPG',
  howHeading: 'Cómo convertir PNG a JPG',
  howSteps: [
    'Suelta tus imágenes PNG o JPG en el cuadro, elígelas o pégalas con Ctrl V.',
    'Oli convierte cada archivo, y no hay nada que ajustar.',
    'Descarga la imagen convertida.',
  ],
  specsHeading: 'Especificaciones',
  specs: {
    caption: 'PNG a JPG: formatos que acepta, resultado y límites',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Acepta', 'Archivos PNG y JPG, reconocidos por el contenido del archivo y no por el nombre.'],
      ['Dirección', 'La define el archivo: un PNG se vuelve JPG, y un JPG se vuelve PNG.'],
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
      a: 'Algunos convertidores la rellenan de negro, porque un JPG necesita un color en cada píxel. Para conservar la transparencia, quédate con el PNG.',
    },
    {
      q: '¿Pasar de PNG a JPG baja la calidad?',
      a: 'Un poco, porque el JPG comprime con pérdida. En las fotos la diferencia es pequeña. En capturas de pantalla, logos y texto con bordes nítidos, el JPG puede agregar un leve desenfoque alrededor de los bordes, así que para esos casos quédate con el PNG.',
    },
    {
      q: '¿Por qué mi PNG pesa mucho más que un JPG?',
      a: 'El PNG guarda cada píxel sin pérdida, lo que sirve para logos y capturas de pantalla, pero pesa mucho en las fotos, mientras que el JPG descarta detalle que el ojo casi no nota.',
    },
    {
      q: '¿Convertir un JPG en PNG mejora la calidad?',
      a: 'No. Úsalo cuando una app o un formulario pide un PNG, o antes de editar la imagen.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus imágenes se convierten en tu navegador, y tus archivos nunca salen de tu dispositivo ni llegan a un servidor.',
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
