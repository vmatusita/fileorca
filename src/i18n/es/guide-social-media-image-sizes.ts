import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Tamaños de imagen para redes sociales, según la ayuda de cada red',
  description: 'Los tamaños de imagen que publican Instagram, Facebook, X, LinkedIn, YouTube y Pinterest, y cómo se ven y cuánto pesan fotos reales al redimensionarlas.',
  h1: 'Tamaños de imagen para redes sociales',
  lead: 'Cada red publica los tamaños que quiere y redimensiona lo que no encaja. Aquí están los tamaños de sus propias páginas de ayuda y en qué se convierte una foto con cada uno.',
  changed: 'Primera versión, con las mediciones del {date}. Las páginas de ayuda se leyeron en la fecha que aparece junto a cada fuente.',
  intro: [
    'Cada red social toma una foto, la ajusta a su propio marco y la vuelve a comprimir. Si la foto es mucho más grande que el marco, la red descarta píxeles con sus propios ajustes. Si tiene la forma equivocada, la red la recorta donde decide. Subir una foto que ya tiene el tamaño y la forma correctos deja esas decisiones en tus manos.',
    'Los tamaños de abajo vienen solo de las páginas de ayuda o para desarrolladores de cada red, leídas en la fecha que aparece al final de esta página. Cuando una red publica una cifra solo para anuncios, la tabla lo dice. TikTok no está en la tabla: las páginas de ayuda que leímos no dan ningún tamaño para fotos.',
  ],
  toolHeading: 'Redimensiona tus fotos aquí',
  toolIntro: 'Elige Por tamaño, escribe el ancho y el alto del tamaño que necesitas y suelta tus fotos. Cada una cabe dentro de ese recuadro, conserva sus proporciones y se queda en esta pestaña del navegador.',
  sections: [
    {
      heading: 'Lo que piden las redes',
      paragraphs: [
        'Instagram es preciso con la forma. Su servicio de ayuda dice que las fotos conservan su tamaño cuando tienen entre {igMinWidth} y {igMaxWidth} de ancho, que se reducen por encima de eso y que mantienen el encuadre completo cuando la forma está entre {igRatios}. Una foto más alta o más ancha se recorta. LinkedIn recomienda un ancho de {liPostWidth} para las fotos de las publicaciones, Facebook da tamaños exactos para la foto del perfil y la portada de una página, y X los da para la foto de perfil y el encabezado.',
        'La tabla de "Lo que medimos" muestra cada tamaño con la red y el uso, y el archivo más pesado que dieron nuestras fotos con ese tamaño. Los límites de la última columna son el archivo más pesado que permite cada página, cuando lo indica.',
      ],
    },
    {
      heading: 'Encajar dentro o llenar el marco',
      paragraphs: [
        'Redimensionar imagen conserva las proporciones de la foto. La foto entra en el recuadro que escribes, lo más grande que puede, y nunca se estira. Nuestra foto vertical tiene la misma forma que el marco más vertical de Instagram, así que salió con exactamente {instagramPortraitWidth} × {instagramPortraitHeight}. Una foto horizontal en el mismo recuadro salió con {instagramLandscapeWidth} × {instagramLandscapeHeight}, porque es más ancha que alta.',
        'Por eso solo {exactFrames_wordf} de nuestras {outputs} fotos redimensionadas salió con el tamaño exacto que indica la red. Para una portada de Facebook, una foto horizontal salió con {facebookCoverLandscapeWidth} × {facebookCoverLandscapeHeight}: cabe, pero no llena el marco ancho, y la red rellena o recorta el resto.',
        'Para llenar un marco exacto, primero recorta y después redimensiona. Recortar imagen trae listos un marco cuadrado, uno vertical y uno ancho, y un recuadro libre para cualquier otra forma. Redimensiona la foto recortada al tamaño de la tabla, y la red ya no tiene nada que cambiar.',
      ],
    },
    {
      heading: 'La miniatura de YouTube en un solo paso',
      paragraphs: [
        'La página de ayuda de YouTube recomienda {ytRecommended} píxeles para las miniaturas de video, con un ancho mínimo de {ytMinWidth}, y sugiere la forma {ytRatio}. Si se sube desde la app del celular, una miniatura puede pesar hasta {ytPhoneLimit}.',
        'El ajuste predefinido Miniatura de YouTube hace el recorte y el cambio de tamaño a la vez: corta la foto a {ytRatio} alrededor del centro y la deja en {thumbnailWidth} × {thumbnailHeight}, menos que el tamaño recomendado, así que el archivo queda muy por debajo del límite de la app del celular. Nuestras {thumbnailExactChromium_wordf} fotos salieron con ese tamaño, y la más pesada pesó {thumbnailMaxChromium}.',
      ],
    },
    {
      heading: 'El peso del archivo no fue un problema con nuestras fotos',
      paragraphs: [
        'Llevar una foto a un tamaño de redes sociales la aligera mucho, porque se va la mayor parte de sus píxeles. De nuestras fotos redimensionadas, {underLimit} eran para un tamaño con un límite publicado, y las {underLimit} quedaron por debajo de él. El archivo más pesado que hicimos pesó {largestOutput}.',
        'La cifra más ajustada es la de la portada de Facebook: Facebook dice que carga más rápido cuando pesa menos de {fbCoverLimit}. Nuestra portada más pesada pesó {facebookCoverMaxChromium}. Si una portada todavía pesa demasiado, comprímela después de redimensionarla.',
      ],
    },
    {
      heading: 'Antes de subir',
      paragraphs: [
        'Las fotos de perfil pueden mostrarse en un círculo. Facebook, por ejemplo, dice que la foto del perfil de una página se muestra en {fbProfileDesktop} píxeles en la computadora y en {fbProfilePhone} en el celular, recortada en forma de círculo, así que deja la cara en el centro del cuadrado y lejos de las esquinas.',
        'Parte siempre de la foto original y redimensiónala una sola vez. Una foto redimensionada dos veces, o sacada de una captura de pantalla de otra publicación, ya perdió detalle que la red no puede recuperar.',
        'Usa JPG para las fotos y PNG para logotipos, texto y colores planos, que se mantienen nítidos en PNG. Y revisa lo que la foto dice de ti: la copia redimensionada se escribe a partir de sus píxeles, así que deja atrás la ubicación y los datos de la cámara del original.',
      ],
    },
  ],
  half: 2,
  measuredHeading: 'Lo que medimos',
  measuredIntro: 'Cada tamaño publicado en las páginas de las propias redes, los tamaños con que salieron nuestras {photos_wordf} fotos de celular con Redimensionar imagen y el archivo más pesado de cada tamaño. La fila de la miniatura de YouTube da el tamaño que recomienda YouTube y el que hizo el ajuste predefinido Miniatura de YouTube.',
  measuredNote: 'Medido el {date} en Chromium {chromiumVersion} y en WebKit {webkitVersion} en {system}, con la herramienta Redimensionar imagen de este sitio (Por tamaño) y su ajuste predefinido Miniatura de YouTube, sobre nuestras fotos reales de celular, en vertical y en horizontal. La tabla muestra Chromium; WebKit escribió archivos un poco más grandes con los mismos tamaños.',
  tables: [
    {
      heading: 'Los tamaños y en qué se convirtieron nuestras fotos',
      caption: 'Cada tamaño de una red: la red, el uso, el tamaño oficial, los tamaños con que salieron nuestras fotos, el archivo más pesado y el límite publicado',
      head: ['Red', 'Uso', 'Tamaño oficial', 'Así salieron nuestras fotos', 'Archivo más pesado', 'Límite'],
    },
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    { id: 'instagram-feed', label: 'Servicio de ayuda de Instagram: Resolución de las fotos que compartes en Instagram', href: 'https://help.instagram.com/1631821640426723/?locale=es_LA', read: '2026-11-03' },
    { id: 'instagram-reel-cover', label: 'Servicio de ayuda de Instagram: Tamaño y relación de aspecto de los reels en Instagram', href: 'https://help.instagram.com/1038071743007909/?locale=es_LA', read: '2026-11-03' },
    { id: 'facebook-page', label: 'Servicio de ayuda de Facebook: Dimensiones de las fotos del perfil y de portada de una página de Facebook', href: 'https://www.facebook.com/help/125379114252045?locale=es_LA', read: '2026-11-03' },
    { id: 'facebook-link', label: 'Meta for Developers: Imágenes en enlaces compartidos', href: 'https://developers.facebook.com/documentation/sharing/webmasters/images?locale=es_LA', read: '2026-11-03' },
    { id: 'x-profile', label: 'Centro de ayuda de X: Fotos de perfil y encabezado en X', href: 'https://help.x.com/es/managing-your-account/common-issues-when-uploading-profile-photo', read: '2026-11-03' },
    { id: 'linkedin-post', label: 'Ayuda de LinkedIn: Compartir fotos en LinkedIn', href: 'https://www.linkedin.com/help/lms/answer/a527229?lang=es', read: '2026-11-03' },
    { id: 'linkedin-profile-cover', label: 'Ayuda de LinkedIn: Añadir o cambiar la imagen de portada de tu perfil', href: 'https://www.linkedin.com/help/linkedin/answer/a568217/add-or-change-the-background-photo-on-your-profile?lang=es', read: '2026-11-03' },
    { id: 'linkedin-page-cover', label: 'Ayuda de LinkedIn: Especificaciones de imagen para tus páginas de LinkedIn y de empleo', href: 'https://www.linkedin.com/help/linkedin/answer/a563309/image-specifications-for-your-linkedin-pages-and-career-pages?lang=es', read: '2026-11-03' },
    { id: 'youtube-banner', label: 'Ayuda de YouTube: Administra el desarrollo de la marca de tu canal', href: 'https://support.google.com/youtube/answer/10456525?hl=es-419', read: '2026-11-03' },
    { id: 'youtube-thumbnail', label: 'Ayuda de YouTube: Agrega miniaturas personalizadas en YouTube', href: 'https://support.google.com/youtube/answer/72431?hl=es-419', read: '2026-11-03' },
    { id: 'pinterest-pin', label: 'Ayuda sobre Pinterest para empresas: Revisar las especificaciones de los anuncios', href: 'https://help.pinterest.com/es/business/article/pinterest-product-specs', read: '2026-11-03' },
  ],
  facts: {
    igMinWidth: { text: '320', source: 'instagram-feed' },
    igMaxWidth: { text: '1,080 píxeles', source: 'instagram-feed' },
    igRatios: { text: '1.91:1 y 3:4', source: 'instagram-feed' },
    liPostWidth: { text: '1,080 píxeles', source: 'linkedin-post' },
    ytRatio: { text: '16:9', source: 'youtube-thumbnail' },
    ytMinWidth: { text: '640 píxeles', source: 'youtube-thumbnail' },
    ytRecommended: { text: '3,840 × 2,160', source: 'youtube-thumbnail' },
    ytPhoneLimit: { text: '2 MB', source: 'youtube-thumbnail' },
    fbCoverLimit: { text: '100 KB', source: 'facebook-page' },
    fbProfileDesktop: { text: '176 × 176', source: 'facebook-page' },
    fbProfilePhone: { text: '196 × 196', source: 'facebook-page' },
  },
  names: [],
  relatedHeading: 'Herramientas y guías relacionadas',
  measuredTerms: {
    'Feed photo at its tallest ratio, 3:4': 'Foto del feed en su proporción más vertical, 3:4',
    'Reel cover photo': 'Foto de portada de un reel',
    'Page profile picture': 'Foto del perfil de una página',
    'Page cover photo, fastest under 100 KB': 'Foto de portada de una página, carga más rápido con menos de 100 KB',
    'Image of a shared link': 'Imagen de un enlace compartido',
    'Profile photo': 'Foto de perfil',
    'Header photo': 'Foto de encabezado',
    'Photo in a post, recommended width at the tallest ratio, 4:5': 'Foto en una publicación, ancho recomendado en la proporción más vertical, 4:5',
    'Profile cover image': 'Imagen de portada del perfil',
    'Page cover image': 'Imagen de portada de la página',
    'Channel banner, smallest upload': 'Banner del canal, tamaño mínimo para subir',
    'Pin, uploaded from a computer': 'Pin subido desde una computadora',
    'Video thumbnail, recommended size, uploaded from the phone app': 'Miniatura de video, tamaño recomendado, subida desde la app del celular',
  },
};

export default texts;
