import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Cómo abrir imágenes WebP y guardarlas como JPG',
  description: 'Qué es un archivo WebP, dónde se abre sin programas adicionales y qué cambia en el tamaño, la animación y la ubicación cuando lo guardas como JPG.',
  h1: 'Cómo abrir imágenes WebP y guardarlas como JPG',
  lead: 'Guardaste una imagen de un sitio web como .webp y tus otras apps no la aceptan. Aquí ves cómo pasarla a JPG.',
  changed: 'Primera versión de esta guía, publicada el {published} con las mediciones del {measured}.',
  intro: [
    'WebP es un formato de imagen que Google creó para la web. Los sitios web lo usan porque pesa poco y las páginas cargan más rápido, y por eso una imagen que guardas desde el navegador puede llegar como archivo .webp en lugar de JPG o PNG.',
    'El navegador desde el que la guardaste la muestra sin problema. El problema empieza cuando el archivo sale del navegador: un editor de fotos antiguo, un formulario que pide un JPG o una tienda de impresión pueden rechazarlo. Guardarlo como JPG hace que se abra casi en cualquier lugar, pero no lo mejora ni lo hace más pequeño.',
  ],
  toolHeading: 'Guarda tu WebP como JPG',
  toolIntro: 'Suelta un WebP o todo un lote. Cada uno se vuelve JPG en esta pestaña del navegador, así que nada se sube, y un lote llega en un solo ZIP. Si necesitas conservar la transparencia, puedes elegir PNG.',
  sections: [
    {
      heading: 'Qué es un archivo WebP',
      paragraphs: [
        'Google describe WebP como un formato con compresión con pérdida y sin pérdida. El WebP con pérdida cumple el papel de un JPG, para fotos; el WebP sin pérdida cumple el papel de un PNG, para gráficos. También puede conservar la transparencia y guardar una animación, como un GIF.',
        'Google informa que las imágenes WebP con pérdida son {googleSmaller} más pequeñas que imágenes JPEG comparables con la misma calidad visual. Por eso los sitios web lo prefieren: la misma imagen cuesta menos de descargar.',
      ],
    },
    {
      heading: 'Dónde se abre un WebP sin conversor',
      paragraphs: [
        'En los dispositivos Apple, la compatibilidad con WebP llegó con Safari 14, que venía incluido en iOS 14 y macOS Big Sur 11, según las notas de la versión de Apple. En Windows, la Extensión de imagen WebP de Microsoft permite ver imágenes WebP en el Explorador de archivos, en Fotos y en otras aplicaciones de Windows.',
        'Así que, si solo necesitas ver la imagen, quizá no tengas que convertir nada. Arrastra el archivo al navegador desde el que lo guardaste y se abre. Necesitas un JPG cuando el archivo tiene que ir a un lugar que no acepta WebP.',
      ],
    },
    {
      heading: 'Cómo lo probamos',
      paragraphs: [
        'Tomamos nuestras {photos_wordf} fotos reales de celular, las guardamos como WebP con el motor de este sitio en su calidad WebP estándar y luego guardamos esos archivos WebP como JPG con la herramienta de arriba. También pasamos por la misma herramienta un WebP que lleva datos GPS y un WebP animado.',
        'Nuestras copias WebP pesaron {webpTotal}, frente a {jpgTotal} de los JPG originales de las cámaras. No le des demasiada importancia a esa diferencia: las cámaras guardaron sus JPG con más calidad que nuestras copias WebP, así que esta no es una carrera justa entre formatos. Lo que sí muestra es cuánto conservaron nuestras copias WebP con la calidad del codificador de este sitio: el {webpRatio} del peso de los originales.',
      ],
    },
    {
      heading: 'El JPG pesa más que el WebP',
      paragraphs: [
        'Cuando guardamos las copias WebP como JPG, los JPG pesaron {backTotalChromium}, es decir, {backRatioChromium_times} lo que pesaban los archivos WebP. Un JPG guarda la imagen con menos compresión que WebP, y la herramienta lo guarda con alta calidad, así que el detalle que queda se conserva en lugar de comprimirse otra vez.',
        'Los JPG también pesaron el {backVsOriginalChromium} de los JPG originales de las cámaras, y se ven como el WebP, no como el original. Convertir no puede recuperar el detalle que el WebP ya había descartado. Si tienes la foto original, úsala en lugar del WebP.',
      ],
    },
    {
      heading: 'Animación y transparencia',
      paragraphs: [
        'Un JPG guarda una sola imagen fija. Nuestro WebP animado tiene {animatedFrames} cuadros, y el JPG conservó solo el primero; el resultado lo indica junto al archivo. Si necesitas la animación, conserva el WebP o conviértelo en video o en GIF con otra herramienta.',
        'Un JPG tampoco tiene transparencia. Las partes transparentes de un WebP quedan blancas en el JPG. Si la imagen es un logotipo o un recorte que necesita su fondo transparente, elige PNG en la herramienta.',
      ],
    },
    {
      heading: 'La ubicación se queda atrás',
      paragraphs: [
        'El formato WebP puede llevar metadatos Exif y XMP, según la especificación del contenedor de Google, así que un WebP puede guardar la posición GPS y los datos de la cámara de una foto. Nuestro WebP de prueba con datos GPS salió de la herramienta como un JPG con {exifGpsAfterChromium_word} datos GPS.',
        'Eso pasa porque cada JPG se escribe a partir de los píxeles de la imagen, y no se copia del archivo. Es lo que quieres cuando compartes una imagen y no sus datos, pero también significa que el JPG es un archivo nuevo: conserva el WebP si necesitas el original tal como era.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'Lo que medimos',
  sheet: {
    stats: [
      { label: 'El JPG hecho a partir del WebP', value: '{backRatioChromium_times}', from: '{webpTotal}', to: '{backTotalChromium}' },
      { label: 'Frente a los originales', value: '{backVsOriginalChromium}', sub: '{backTotalChromium} de {jpgTotal}' },
    ],
    sample: '{photos} fotos de celular, guardadas como WebP y de vuelta como JPG.',
    link: 'Mira la tabla',
  },
  tableHeading: 'Foto por foto',
  measuredIntro: 'Nuestras {photos_wordf} fotos reales de celular, guardadas como WebP por el motor de este sitio y luego como JPG con la herramienta de arriba. El porcentaje entre paréntesis es frente al JPG original de la cámara.',
  measuredNote: 'Medido el {date}. Las copias WebP se escribieron en Node con el codificador WebP del motor de este sitio; los JPG se hicieron con la herramienta WebP a JPG de este sitio en Chromium {chromiumVersion} y en WebKit {webkitVersion} en {system}, que dieron los mismos tamaños. La tabla muestra Chromium.',
  tables: [
    {
      heading: 'Nuestras fotos en WebP y de vuelta a JPG',
      caption: 'Cada foto: el JPG original, su copia WebP y el JPG hecho a partir del WebP, con el porcentaje del tamaño original',
      head: ['Foto', 'JPG original', 'En WebP', 'De vuelta a JPG'],
    },
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    { id: 'google-webp', label: 'Google for Developers: Un formato de imagen para la Web', href: 'https://developers.google.com/speed/webp?hl=es-419', read: '2026-11-03' },
    { id: 'google-webp-container', label: 'Google for Developers: Especificación del contenedor WebP', href: 'https://developers.google.com/speed/webp/docs/riff_container?hl=es-419', read: '2026-11-03' },
    { id: 'ms-webp', label: 'Microsoft Store: Extensión de imagen WebP', href: 'https://apps.microsoft.com/detail/9pg2dk419drg?hl=es-US&gl=US', read: '2026-11-03' },
    { id: 'apple-safari', label: 'Apple Developer: Safari 14 Release Notes (versión en español)', href: 'https://developer.apple.com/la/documentation/safari-release-notes/safari-14-release-notes', read: '2026-11-03' },
  ],
  facts: {
    googleSmaller: { text: 'entre un 25 y un 34 %', source: 'google-webp' },
  },
  names: ['Safari 14', 'iOS 14', 'macOS Big Sur 11'],
  relatedHeading: 'Herramientas y guías relacionadas',
};

export default texts;
