import type { ConvertToOptionsTexts, ImageToolTexts } from '../../../i18n/types.ts';

export default {
  title: 'Convertir a WebP en línea, sin subir archivos',
  description:
    'Convierte JPG y PNG a WebP o AVIF más ligeros en tu navegador. Sin subir nada y sin límite de imágenes; se conserva la transparencia y se quitan los datos GPS.',
  h1: 'Convertir a WebP',
  howHeading: 'Cómo convertir una imagen a WebP',
  howSteps: [
    'Suelta tus imágenes JPG o PNG en el cuadro, elígelas o pégalas con Ctrl V.',
    'Deja WebP o elige AVIF, y luego la compresión Recomendada o la Fuerte.',
    'Descarga la imagen convertida, o el ZIP si convertiste varias.',
  ],
  specsHeading: 'Especificaciones',
  specs: {
    caption: 'Convertir a WebP: formatos que acepta, resultado y límites',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Acepta', 'JPG y PNG, reconocidos por el contenido del archivo y no por el nombre. Las fotos HEIC pasan primero por HEIC a JPG, y los archivos AVIF por AVIF a JPG.'],
      ['Resultado', 'WebP, que es la opción predeterminada, o AVIF. Sale un archivo por cada imagen.'],
      ['Compresión', 'La Recomendada equilibra tamaño y aspecto, y la Fuerte da el archivo más pequeño.'],
      ['Transparencia', 'Se conserva, tanto en WebP como en AVIF.'],
      ['Velocidad', 'El AVIF tarda más en guardarse que el WebP, y la diferencia crece con el tamaño de la foto.'],
      ['Compatibilidad', 'El WebP se abre en todos los navegadores actuales. El AVIF se abre en las versiones actuales de Chrome, Edge, Firefox y Safari, pero algunas apps y algunos editores antiguos no pueden leerlo.'],
      ['Lote', 'Sin límite de imágenes. Una imagen se descarga directamente, y varias llegan en un solo ZIP.'],
      ['Metadatos', 'Se eliminan Exif, XMP, IPTC y GPS, y se aplica la orientación de la foto.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Cuánto menos pesa un WebP que un JPG?',
      a: 'A menudo pesa entre un cuarto y un tercio menos con un aspecto parecido, y el AVIF puede ir más lejos. El ahorro depende de la imagen, así que la comparación de antes y después en el resultado muestra los tamaños reales.',
    },
    {
      q: '¿Elijo WebP o AVIF?',
      a: 'El WebP es la opción segura: todos los navegadores actuales lo abren, y se guarda rápido. El AVIF da archivos más pequeños, pero tarda más en guardarse, y algunas apps antiguas no pueden abrirlo.',
    },
    {
      q: '¿El WebP conserva la transparencia de un PNG?',
      a: 'Sí, y el AVIF también. Un PNG con fondo transparente lo conserva cuando lo conviertes a cualquiera de los dos formatos.',
    },
    {
      q: '¿Todos los sitios web aceptan un archivo WebP?',
      a: 'No siempre. Los navegadores y la mayoría de los sitios modernos sí, pero algunos formularios en línea y editores antiguos solo aceptan JPG o PNG. En ese caso, WebP a JPG hace el camino de vuelta.',
    },
    {
      q: '¿Para qué convertir mis imágenes a WebP?',
      a: 'Las imágenes más ligeras hacen que una página cargue más rápido y ocupan menos espacio. Convertir un JPG o PNG a WebP es una forma rápida de lograr ese ahorro.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus imágenes se convierten en tu navegador, y tus archivos nunca salen de tu dispositivo ni llegan a un servidor. Los archivos nuevos omiten los metadatos de la foto, incluida la ubicación GPS.',
  relatedHeading: 'Más herramientas de imagen',
  panel: {
    formats: 'JPG o PNG',
    progressLabel: 'Convirtiendo las imágenes',
    done: '¡Listo! Tu imagen quedó convertida.',
    doneMany: '¡Listo! Tus {count} imágenes quedaron convertidas.',
    options: {
      formatLegend: 'Formato',
      webp: 'WebP',
      avif: 'AVIF',
      levelLegend: 'Compresión',
      recommended: 'Recomendada',
      recommendedHelp: 'mejor equilibrio',
      strong: 'Fuerte',
      strongHelp: 'archivo más pequeño',
      now: '{format} · {level}',
    },
  },
} satisfies ImageToolTexts<ConvertToOptionsTexts>;
