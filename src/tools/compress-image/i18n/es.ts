import type { CompressOptionsTexts, ImageToolTexts } from '../../../i18n/types.ts';

// Bloques de la página Comprimir imagen (data-content: how, specs, faq, privacy, related) y los textos del
// panel que muestra la isla compartida. Las filas de especificaciones dicen lo que el motor hace de verdad
// (src/engine/image/): si cambian la calidad o los codificadores allí, cámbialos aquí. Desde la F6, los dos
// ajustes predefinidos (a 100 KB y a 1 MB) también existen en español, así que la página muestra su tabla.
export default {
  title: 'Comprimir imagen en línea, gratis y sin subir archivos',
  description:
    'Comprime imágenes JPG, PNG y WebP en tu navegador, una o varias a la vez. No se sube nada y se eliminan los metadatos de la foto, incluida la ubicación GPS.',
  h1: 'Comprimir imagen',
  howHeading: 'Cómo funciona',
  howSteps: [
    'Suelta las imágenes JPG, PNG o WebP en el cuadro, elige los archivos o pega las imágenes. Todas las que quieras.',
    'Elige Recomendada o Fuerte, o Hasta un tamaño con el máximo en KB. Oli comprime cada imagen en tu navegador, una tras otra, y rehace el lote si cambias el nivel.',
    'Descarga una imagen o todas juntas en un ZIP. Tus archivos originales no se tocan.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Comprimir imagen recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Formatos que acepta', 'JPG, PNG y WebP. Oli revisa lo que hay dentro del archivo, no su nombre.'],
      ['JPG', 'Se guarda de nuevo con MozJPEG, un codificador hecho para generar archivos JPG más pequeños.'],
      ['PNG', 'Se optimiza con OxiPNG, sin perder calidad. Recomendada y Fuerte no lo cambian; Hasta un tamaño lo convierte en JPG.'],
      ['WebP', 'Se guarda de nuevo como WebP, con la calidad de Recomendada o Fuerte; Hasta un tamaño lo convierte en JPG.'],
      ['Recomendada', 'JPG y WebP con calidad 75: el mejor equilibrio entre tamaño y aspecto.'],
      ['Fuerte', 'JPG y WebP con calidad 55: el archivo más pequeño, con algo de pérdida en los detalles finos.'],
      ['Hasta un tamaño', 'Cada imagen sale como un JPG del tamaño que escribas o menos (1 KB = 1,000 bytes), de 20 a 10,000 KB. Oli baja primero la calidad, y las dimensiones solo si hace falta. La transparencia queda blanca.'],
      ['Lote', 'Sin límite de imágenes. Varias imágenes se descargan juntas en un solo ZIP.'],
      ['Ya es pequeño', 'Si la copia nueva no queda más pequeña, recibes el original de vuelta, sin los metadatos de la foto.'],
      ['Metadatos de la foto', 'El modelo de la cámara, la fecha y la ubicación GPS se quitan de todos los archivos.'],
      ['HEIC y AVIF', 'No se comprimen aquí. Primero convierte el HEIC en JPG con HEIC a JPG, y el AVIF, con AVIF a JPG.'],
    ],
  },
  presets: {
    heading: 'Comprimir a un tamaño objetivo',
    lead: 'Para cualquier otro límite, elige Hasta un tamaño arriba y escribe el máximo en KB, de 20 a 10,000.',
    caption: 'Ajustes predefinidos de Comprimir imagen y qué hace cada uno',
    head: ['Ajuste predefinido', 'Qué hace'],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Comprimir una imagen baja su calidad?',
      a: 'En JPG y WebP se pierde un poco de detalle, porque el archivo se guarda de nuevo con parte de la información fuera. Con la compresión Recomendada la diferencia cuesta notarla en tamaño normal, y la Fuerte cambia más detalle por el archivo más pequeño posible. El PNG no pierde nada, porque Oli lo guarda sin pérdida. Tu archivo original nunca se modifica, así que siempre puedes volver a él.',
    },
    {
      q: '¿Cómo dejo una imagen dentro de un límite, como 200 KB?',
      a: 'Elige Hasta un tamaño y escribe el límite en el campo Tamaño máximo, en KB. Oli deja cada imagen de ese tamaño o menos, en JPG. Un formulario que cuenta 1 KB como 1,024 bytes también la acepta, porque Oli cuenta 1 KB como 1,000 bytes, la lectura menor. Un PNG con transparencia queda con fondo blanco.',
    },
    {
      q: '¿Por qué mi PNG casi no se reduce?',
      a: 'El PNG guarda cada píxel exactamente como está, así que queda poco que quitar, y una foto en PNG es grande porque los cambios pequeños de color son difíciles de compactar. Oli solo ordena el archivo, y eso suele ahorrar un poco. Si es una foto y no necesitas transparencia, guardarla como JPG o WebP suele dar un archivo mucho más pequeño.',
    },
    {
      q: '¿Qué pasa con la ubicación GPS de mi foto?',
      a: 'Oli guarda cada copia comprimida solo a partir de los píxeles, así que la ubicación GPS, el modelo de la cámara y la fecha de la foto no pasan al archivo nuevo. Vale también cuando el original vuelve sin cambios porque ya era pequeño: esa copia también sale sin los metadatos de la foto.',
    },
    {
      q: '¿Puedo comprimir varias imágenes a la vez?',
      a: 'Sí. Suelta o pega todas las imágenes que quieras: Oli las comprime una tras otra, y cada una tiene su propia descarga. Para llevártelas todas, un botón te da un ZIP. Un lote grande de fotos pesadas tarda más en un dispositivo modesto que en uno potente, porque el trabajo lo hace tu propio dispositivo.',
    },
    {
      q: '¿Mi imagen se sube a algún lugar?',
      a: 'No. La compresión ocurre en tu dispositivo, dentro del navegador. Abre la pestaña Red del navegador mientras comprimes: ninguna solicitud lleva tus archivos.',
    },
    {
      q: '¿Por qué el archivo quedó del mismo tamaño?',
      a: 'Algunas imágenes ya están bien comprimidas. Cuando la nueva copia no sería más pequeña, Oli te devuelve el original en lugar de un archivo más grande, y esa copia también sale sin los metadatos de la foto.',
    },
    {
      q: '¿Puedo comprimir una foto de iPhone en HEIC?',
      a: 'Aquí no: Comprimir imagen acepta JPG, PNG y WebP. Primero convierte el HEIC en JPG con HEIC a JPG, y después comprime el JPG si quieres que quede más pequeño.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Las imágenes se procesan en tu navegador, y tus archivos nunca salen de tu dispositivo ni llegan a un servidor. Cada copia guardada también omite los metadatos de la foto, incluida la ubicación GPS.',
  relatedHeading: 'Más herramientas de imagen',
  panel: {
    formats: 'JPG, PNG o WebP',
    progressLabel: 'Comprimiendo las imágenes',
    done: '¡Listo! Tu imagen quedó un {percent} más ligera.',
    doneMany: '¡Listo! Tus {count} imágenes quedaron un {percent} más ligeras.',
    placardLabel: 'más ligera',
    adjustHelp: 'Cambiar el nivel rehace la imagen al momento.',
    options: {
      legend: 'Compresión',
      recommended: 'Recomendada',
      recommendedHelp: 'mejor equilibrio',
      strong: 'Fuerte',
      strongHelp: 'archivo más pequeño',
      pngNote: 'El PNG se guarda sin pérdida, así que el nivel solo cambia JPG y WebP.',
      // F15 (PLANO-UX-QV, sección D; DECISOES § 656 y § 660): la tercera opción y su campo.
      size: 'Hasta un tamaño',
      sizeHelp: 'límite en KB',
      maxLabel: 'Tamaño máximo',
      kb: 'KB',
      maxHelp: 'Cada imagen sale como un JPG de ese tamaño o menos, y la transparencia queda blanca. Si una imagen ya cabe, vuelve igual, solo sin los metadatos de la foto.',
      maxInvalid: 'Escribe un número entero de {min} a {max}.',
      upTo: 'Hasta {n} KB',
    },
  },
} satisfies ImageToolTexts<CompressOptionsTexts>;
