// Remove EXIF data (F18, decision 10): JPG, PNG and WebP lose their metadata and keep their pixels, with no decoding and
// no new encoding (src/engine/image/strip.ts, DECISOES § 33 and § 100). A rotated JPG keeps a tiny Exif block with only the
// Orientation, so it still shows upright: the reading of "no Exif" the site uses since § 33, said plainly in the FAQ.
// The Spanish text says what the English one says, in the words of docs/i18n/es.md (DECISOES § 736).
import type { ImageToolTexts, NoteOptionsTexts } from '../../../i18n/types.ts';

export default {
  title: 'Quitar metadatos de la foto en línea, sin subir archivos',
  description:
    'Quita el Exif y los demás metadatos de fotos JPG, PNG y WebP en tu navegador: ubicación GPS, fecha, cámara y más. Los píxeles no cambian. Sin subir nada.',
  h1: 'Quitar metadatos de la foto',
  howHeading: 'Cómo quitar los metadatos de una foto',
  howSteps: [
    'Suelta tus fotos en el cuadro, elígelas o pégalas con Ctrl V.',
    'Oli quita los metadatos de cada archivo, y no hay nada que ajustar.',
    'Descarga la foto limpia, o el ZIP si limpiaste varias.',
  ],
  specsHeading: 'Especificaciones',
  specs: {
    caption: 'Quitar metadatos de la foto: formatos que acepta, qué se quita y qué se queda',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Acepta', 'JPG, PNG y WebP, reconocidos por el contenido del archivo y no por el nombre. Las fotos HEIC y AVIF se rechazan con un enlace a HEIC a JPG o a AVIF a JPG, que también omiten los metadatos.'],
      ['Qué se quita', 'Los datos Exif, con la ubicación GPS, la fecha y la hora, el teléfono o la cámara y sus ajustes, la miniatura y el nombre del dueño; los datos XMP e IPTC; los comentarios; y las notas de texto que puede llevar un PNG.'],
      ['Qué se queda', 'La imagen en sí, byte por byte: no se decodifica ni se guarda de nuevo, así que no se pierde nada. El perfil de color también se queda, así que los colores se ven iguales.'],
      ['Fotos rotadas', 'Un JPG guardado de lado conserva un bloque Exif mínimo, solo con su orientación, para seguir viéndose derecho. No queda nada más de los datos Exif.'],
      ['Imágenes extra', 'Algunos teléfonos guardan más cosas dentro del JPG, después de la foto, como una segunda imagen o el video de una foto en movimiento, cada una con sus propios metadatos. Esa parte se omite, y la foto se queda.'],
      ['Animación', 'Un WebP animado sigue animado, con todos sus cuadros.'],
      ['Resultado', 'El mismo formato del archivo que soltaste. El archivo pierde solo el peso de lo que se quitó, y queda igual cuando no había nada que quitar.'],
      ['Lote', 'Sin límite de fotos. Una foto se descarga directamente, y varias llegan en un solo ZIP.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Qué son los datos EXIF?',
      a: 'EXIF es información que un teléfono o una cámara escribe dentro del archivo de la foto: cuándo y, a menudo, dónde se tomó, el dispositivo y sus ajustes, y una miniatura. No se ve en la imagen, pero cualquiera que reciba el archivo puede leerla.',
    },
    {
      q: '¿Quitar los datos EXIF cambia mi foto?',
      a: 'No. Oli quita solo los metadatos y copia los datos de la imagen tal como están, sin decodificarlos ni guardarlos de nuevo, así que cada píxel sigue igual y no hay pérdida de calidad.',
    },
    {
      q: '¿Por qué un JPG rotado conserva un poco de Exif?',
      a: 'Muchos teléfonos guardan la imagen de lado y agregan una etiqueta, la orientación, que les dice a las apps cómo girarla. Sin la etiqueta, la foto se vería de lado, y girar los píxeles obligaría a guardar el JPG de nuevo, con algo de pérdida. Por eso un JPG rotado conserva un bloque Exif mínimo, solo con la orientación, y nada más: ni ubicación, ni fecha, ni cámara.',
    },
    {
      q: '¿Puedo quitar la ubicación de una foto HEIC o AVIF?',
      a: 'En esta página no. HEIC a JPG y AVIF a JPG convierten esas fotos en archivos JPG, y el JPG que crean no lleva metadatos, ni siquiera la ubicación.',
    },
    {
      q: '¿Puedo limpiar muchas fotos a la vez?',
      a: 'Sí. Suéltalas juntas. Cada foto sale por separado, en el mismo formato, y la descarga es un solo ZIP cuando son varias.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus fotos se limpian en tu dispositivo y nunca se envían a un servidor, así que la ubicación y los demás datos que llevan tampoco salen de él.',
  relatedHeading: 'Más herramientas de imagen',
  panel: {
    formats: 'JPG, PNG o WebP',
    progressLabel: 'Quitando los metadatos',
    done: '¡Listo! Tu foto ya no tiene metadatos.',
    doneMany: '¡Listo! Tus {count} fotos ya no tienen metadatos.',
    options: {
      note: 'Cada foto conserva sus píxeles y pierde sus metadatos: la ubicación, la fecha, la cámara y lo demás.',
    },
  },
} satisfies ImageToolTexts<NoteOptionsTexts>;
