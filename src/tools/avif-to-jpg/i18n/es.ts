import type { ImageToolTexts, NoteOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'AVIF a JPG en línea, sin subir archivos',
  description:
    'Convierte imágenes AVIF a JPG en tu navegador. Sin subir nada y sin límite de imágenes; la transparencia queda blanca y se quitan los datos GPS.',
  h1: 'AVIF a JPG',
  howHeading: 'Cómo convertir AVIF a JPG',
  howSteps: [
    'Suelta tus imágenes AVIF en el cuadro, elígelas o pégalas con Ctrl V.',
    'Oli convierte cada una en JPG, y no hay nada que ajustar.',
    'Descarga el JPG, o el ZIP si convertiste varias.',
  ],
  specsHeading: 'Especificaciones',
  specs: {
    caption: 'AVIF a JPG: formatos que acepta, resultado y límites',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Acepta', 'Archivos AVIF, reconocidos por el contenido del archivo y no por el nombre.'],
      ['Resultado', 'JPG. Sale un archivo por cada AVIF.'],
      ['Transparencia', 'El JPG no tiene transparencia, así que queda blanca, y el resultado te lo dice.'],
      ['Tamaño', 'Un JPG de la misma imagen suele pesar más que el AVIF, porque el AVIF comprime mejor.'],
      ['Lote', 'Sin límite de imágenes. Una imagen se descarga directamente, y varias llegan en un solo ZIP.'],
      ['Metadatos', 'Se eliminan Exif, XMP, IPTC y GPS, y se aplica la orientación de la foto.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Cómo abro un archivo AVIF en Windows?',
      a: 'Las versiones actuales de Chrome, Edge y Firefox abren AVIF, así que puedes arrastrar el archivo a uno de ellos. Algunos editores y algunas apps antiguas no pueden abrirlo, y un JPG hecho a partir del archivo se abre en todas partes.',
    },
    {
      q: '¿Por qué un sitio web rechaza mi imagen AVIF?',
      a: 'Muchos formularios en línea y muchas apps antiguas solo aceptan JPG, PNG o formatos parecidos. Cambiar el nombre de .avif a .jpg no sirve, porque los datos de adentro siguen siendo AVIF. Convertir escribe un JPG de verdad.',
    },
    {
      q: '¿Convertir AVIF a JPG baja la calidad?',
      a: 'El JPG comprime con pérdida, así que el archivo nuevo no es una copia perfecta, y suele pesar más que el AVIF. Conserva el AVIF si necesitas el original.',
    },
    {
      q: '¿Qué pasa con un fondo transparente?',
      a: 'El JPG no puede guardar transparencia, así que FileOrca rellena esas zonas con blanco, y el resultado te lo dice.',
    },
    {
      q: '¿Por qué algunas imágenes llegan en AVIF?',
      a: 'Un archivo AVIF a menudo pesa mucho menos que un JPG de aspecto parecido, así que muchos sitios envían AVIF a los navegadores que lo admiten, y tu navegador guarda lo que recibió.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus imágenes se convierten en tu navegador, y tus archivos nunca salen de tu dispositivo ni llegan a un servidor. Los archivos JPG omiten los metadatos de la foto, incluida la ubicación GPS.',
  relatedHeading: 'Más herramientas de imagen',
  panel: {
    formats: 'AVIF',
    progressLabel: 'Convirtiendo las imágenes',
    done: '¡Listo! Tu imagen quedó convertida.',
    doneMany: '¡Listo! Tus {count} imágenes quedaron convertidas.',
    options: {
      note: 'Cada AVIF se vuelve JPG, con la transparencia en blanco.',
    },
  },
} satisfies ImageToolTexts<NoteOptionsTexts>;
