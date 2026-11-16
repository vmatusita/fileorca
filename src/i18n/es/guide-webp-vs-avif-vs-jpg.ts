import type { FileGuideTexts } from '../types.ts';

// F19b (front T2): guide 2 in Spanish, the English text of the front E2 adapted with docs/i18n/es.md. Every number is a
// placeholder of data/guides-measured.json, an official figure of `facts` (MDN, whose page has no version in Spanish, so
// the label says "en inglés"; a no-break space before "%") or a technical name of `names`.
const texts: FileGuideTexts = {
  title: 'WebP, AVIF o JPG: cuándo usar cada uno, medido con nuestras fotos',
  description: 'Cuánto pesaron las mismas fotos de celular en JPG, WebP y AVIF, qué formato conservó el fondo transparente y cuándo usar cada uno.',
  h1: 'WebP, AVIF o JPG: cuándo usar cada uno',
  lead: 'Las mismas fotos en cada formato: cuánto pesó cada copia, cuál conservó el fondo transparente y cuándo elegir cada uno.',
  changed: 'Primera versión de esta guía, publicada el {published}.',
  intro: [
    'JPG, WebP y AVIF guardan una foto dejando fuera detalles difíciles de ver, y así es como el archivo queda pequeño. WebP y AVIF vienen del video: MDN describe el WebP con pérdida como basado en el códec de video VP8, y el AVIF como un formato de archivo para imágenes codificadas en AV1, un formato pensado primero para video. Los dos también pueden guardar una imagen sin pérdida, y los dos pueden mantener un fondo transparente. JPG no tiene transparencia.',
    '¿Entonces cuál? Envía un JPG cuando no sepas con qué se va a abrir el archivo. Usa WebP o AVIF para las imágenes de un sitio web que administras, con un formato de respaldo, y para un gráfico con fondo transparente, cuando el archivo tiene que seguir siendo ligero. Para ver cuánto pesa esa elección, tomamos nuestras {photos_wordf} fotos reales de celular, que salieron de las cámaras como JPG, y guardamos cada una de nuevo como JPG con Comprimir imagen y como WebP y como AVIF con Convertir a WebP, siempre con la compresión Recomendada, la predeterminada. Hicimos lo mismo con un PNG que tiene las esquinas transparentes.',
  ],
  toolHeading: 'Crea imágenes WebP o AVIF aquí',
  toolIntro: 'Suelta tus imágenes JPG o PNG y cada una vuelve como WebP. Elige el formato AVIF para obtener un AVIF, y la compresión Fuerte para el archivo más pequeño.',
  sections: [
    {
      heading: 'Cuánto pesaron las mismas fotos',
      paragraphs: [
        'Juntos, los originales de las cámaras pesaban {originalTotal}. Guardados de nuevo como JPG con Comprimir imagen, quedaron en {jpgTotalChromium}, el {jpgRatioChromium} de los originales. Esa primera caída no tiene nada que ver con el formato: es el mismo formato, guardado otra vez con la compresión Recomendada. Como WebP, las fotos pesaron {webpTotalChromium}, y como AVIF, {avifTotalChromium}, el {avifRatioChromium} de los originales.',
        'Frente a las copias en JPG, las copias en WebP pesaron un {webpVsJpgChromium_off} menos y las de AVIF un {avifVsJpgChromium_off} menos, lo que también deja al AVIF un {avifVsWebpChromium_off} por debajo del WebP. Foto por foto, el orden no cambió: el AVIF fue la copia más pequeña de cada foto, y el WebP quedó entre él y el JPG. Las proporciones sí variaron de una foto a otra: cada AVIF quedó entre el {avifRatioMinChromium} y el {avifRatioMaxChromium} de su original, y cada WebP, entre el {webpRatioMinChromium} y el {webpRatioMaxChromium}.',
      ],
    },
    {
      heading: 'Tamaños con la opción predeterminada, no con el mismo aspecto',
      paragraphs: [
        'Estos tamaños comparan configuraciones, no copias de igual calidad. La Recomendada es la opción predeterminada de las dos herramientas, y la mantuvimos: no ajustamos ninguna de las dos hasta que las copias se parecieran entre sí, y no medimos cuánto se parece cada copia al original.',
        'MDN compara los formatos con un nivel de compresión visualmente parecido, y dice que el WebP con pérdida pesa en promedio {mdnWebpSmaller} menos que el JPEG, y el AVIF con pérdida, alrededor de un {mdnAvifSmaller} menos. Nuestras fotos fueron en la misma dirección, con el AVIF por delante del WebP, pero {photos_wordf} fotos con la opción predeterminada no ponen a prueba esas cifras. Otra foto puede quedar en otras proporciones, como les pasó a las nuestras entre sí.',
      ],
    },
    {
      heading: 'Convertir con la herramienta de arriba',
      paragraphs: [
        'La herramienta Convertir a WebP recibe imágenes JPG y PNG y te devuelve un WebP, o un AVIF si lo eliges. La Recomendada es la opción que medimos. La Fuerte da el archivo más pequeño, y esa no la medimos; prueba las dos con una de tus imágenes y quédate con la que todavía se vea bien.',
        'Convierte a partir del archivo original siempre que lo tengas. Cada vez que guardas con pérdida se deja fuera un poco más de detalle, así que un WebP hecho del original de la cámara conserva más que uno hecho de un JPG ya reducido para un correo. Guarda también ese original: un WebP que algún programa rechace puede volver a JPG, pero sin el detalle que la conversión dejó fuera.',
      ],
    },
    {
      heading: 'Transparencia: donde el JPG se queda fuera',
      paragraphs: [
        'MDN señala que el JPEG no tiene canal alfa, la parte del archivo de imagen que guarda la transparencia, así que un conversor tiene que rellenar las zonas transparentes con un color. Nuestro PNG de prueba tiene {pngClearCorners_wordf} esquinas transparentes y pesaba {pngBytes}. Comprimir imagen guarda un PNG como PNG con la Recomendada, así que hicimos su JPG con PNG a JPG, la herramienta para ese trabajo. El JPG pesó {pngJpgBytesChromium}, todas las esquinas quedaron blancas, y la herramienta lo avisó junto al archivo.',
        'Convertir a WebP conservó la transparencia. El WebP pesó {pngWebpBytesChromium} y el AVIF, {pngAvifBytesChromium}, y en los dos, cada esquina que era transparente en el PNG lo siguió siendo. Para un logotipo o un recorte que tiene que ir sobre un fondo de color, esa es la diferencia entre un borde limpio y un recuadro blanco, y esas copias pesaron el {pngWebpRatioChromium} y el {pngAvifRatioChromium} del PNG del que salieron.',
      ],
    },
    {
      heading: 'Dónde se abre cada formato',
      paragraphs: [
        'En los navegadores, MDN indica JPG en todas las versiones de Chrome, Edge, Firefox, Opera y Safari, y WebP en todas las versiones de esos mismos navegadores, con una condición en la Mac: {webpSafari} o posterior, en {webpMacos} o posterior. Para AVIF, las primeras versiones que indica son {avifVersions}.',
        'El navegador no es el único lugar adonde va una imagen. Un formulario para subir archivos, un programa de correo, una imprenta o un editor de fotos antiguo pueden aceptar solo JPG o PNG, y un archivo que rechacen no sirve de nada ahí. En la web, MDN aconseja un formato de respaldo para los dos formatos más nuevos: un JPEG o PNG detrás de un WebP, y un WebP, JPEG o PNG detrás de un AVIF, ofrecidos con el elemento picture.',
      ],
    },
    {
      heading: 'Cuál usar',
      paragraphs: ['Ningún formato gana en todas partes. Lo que decide es adónde va el archivo después y qué tiene que conservar.'],
      list: [
        'JPG, para una foto que sale de tus manos: un archivo adjunto, un formulario para subir archivos, un pedido de impresión, una app que no has probado. Fue la copia más pesada de cada una de nuestras fotos, y no puede guardar transparencia.',
        'WebP, cuando tú controlas dónde se muestra la imagen y puedes dejar un JPG o PNG detrás, y para un logotipo que necesita su transparencia. Con nuestras fotos quedó entre el AVIF y el JPG.',
        'AVIF, cuando lo que más importa es el archivo más pequeño y hay un formato de respaldo. En cada foto y en el PNG, su archivo pesó menos que el de los otros formatos.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'Lo que medimos',
  sheet: {
    stats: [
      { label: 'WebP frente a JPG, con las mismas fotos', value: '{webpVsJpgChromium_change}', from: '{jpgTotalChromium}', to: '{webpTotalChromium}' },
      { label: 'AVIF frente a JPG, con las mismas fotos', value: '{avifVsJpgChromium_change}', from: '{jpgTotalChromium}', to: '{avifTotalChromium}' },
    ],
    sample: '{photos} fotos de celular, cada una guardada como JPG, WebP y AVIF.',
    link: 'Mira la tabla',
  },
  tableHeading: 'Foto por foto',
  measuredIntro: 'La primera tabla muestra nuestras {photos_wordf} fotos de celular, y la segunda, nuestro PNG con las esquinas transparentes. Junto a cada tamaño está la parte que representa del archivo del que salió.',
  measuredNote: 'Medido el {date} en las páginas de Comprimir imagen, de Convertir a WebP y de PNG a JPG de este sitio, en Chromium {chromiumVersion} y en WebKit {webkitVersion} en {system}. Con las fotos, los dos navegadores escribieron los mismos bytes en todos los formatos. Con el PNG hubo una pequeña diferencia: en WebKit, su JPG, su WebP y su AVIF pesaron {pngJpgBytesWebkit}, {pngWebpBytesWebkit} y {pngAvifBytesWebkit}, y las tablas muestran Chromium. La transparencia se comprobó en Node, en los propios archivos: en el canal alfa del WebP y del AVIF y en los píxeles de las esquinas de cada copia.',
  tables: [
    {
      heading: 'Nuestras fotos en cada formato',
      caption: 'Cada foto de celular: el original de la cámara, luego el JPG de Comprimir imagen y el WebP y el AVIF de Convertir a WebP, con la compresión Recomendada, en Chromium, cada uno con su parte del original',
      head: ['Foto', 'Original', 'JPG', 'WebP', 'AVIF'],
    },
    {
      heading: 'El PNG con las esquinas transparentes',
      caption: 'El PNG con las esquinas transparentes guardado como JPG con PNG a JPG y como WebP y AVIF con Convertir a WebP, en Chromium: el tamaño con su parte del PNG y si la transparencia se conservó',
      head: ['Guardado como', 'Tamaño', 'Transparencia conservada'],
      labels: ['JPG', 'WebP', 'AVIF'],
    },
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    { id: 'mdn', label: 'MDN: Guía de tipos y formatos de archivo de imagen (en inglés)', href: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types', read: '2026-11-16' },
  ],
  facts: {
    mdnWebpSmaller: { text: 'entre un 25 y un 35 %', source: 'mdn' },
    mdnAvifSmaller: { text: '50 %', source: 'mdn' },
    webpSafari: { text: 'Safari 14', source: 'mdn' },
    webpMacos: { text: 'macOS Big Sur (11)', source: 'mdn' },
    avifVersions: { text: 'Chrome 85, Edge 121, Opera 71, Firefox 93 y Safari 16.1', source: 'mdn' },
  },
  names: ['VP8', 'AV1'],
  relatedHeading: 'Herramientas y guías relacionadas',
};

export default texts;
