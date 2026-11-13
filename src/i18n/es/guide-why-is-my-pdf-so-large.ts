import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: '¿Por qué mi PDF pesa tanto? Qué ocupa el espacio y qué lo reduce',
  description: 'Qué ocupa el espacio dentro de un PDF, medido en nuestros PDF de prueba, y qué hizo con ellos cada nivel de Comprimir PDF, incluso cuando el archivo volvió igual.',
  h1: '¿Por qué mi PDF pesa tanto?',
  lead: 'Un PDF es un contenedor, y su tamaño depende de lo que le pusieron dentro. Descubre qué parte pesa antes de intentar reducirlo.',
  changed: 'Primera versión de esta guía, publicada el {published}. Los números se midieron de nuevo el {measured}.',
  intro: [
    'Un PDF pesa lo que pesa su contenido. En los {spaceFiles_word} PDF de prueba cuyo contenido pesamos, los más pesados deben la mayor parte de su peso a las imágenes, y un escaneo también está hecho de imágenes, una por página. Después vienen las fuentes. La guía de Adobe, en inglés, nombra las mismas causas: dice que la resolución y la profundidad de bits de una imagen pueden afectar directamente el tamaño del archivo, y que agregar una sola fuente a veces puede aumentarlo de forma considerable.',
    'El correo electrónico pone un límite con el que te puedes topar. Una cuenta personal de Gmail envía archivos adjuntos de hasta {gmailLimit}, y Outlook.com acepta adjuntos de hasta {outlookLimit}. Por encima de eso, el archivo tiene que quedar más pequeño, dividirse o viajar como enlace.',
  ],
  toolHeading: 'Comprime tu PDF aquí',
  toolIntro: 'Suelta un PDF y se comprime en esta pestaña del navegador, con la compresión Recomendada para empezar. Cambia la compresión para ver cada resultado. No se sube nada.',
  sections: [
    {
      heading: 'Dónde están los bytes',
      paragraphs: [
        'Abrimos los PDF de nuestras pruebas y sumamos los bytes de cada tipo de contenido. En la página de libro escaneada, la única imagen es el {scanImagesShare} del archivo. En un PDF hecho de fotos es el {photosImagesShare}. Estos archivos son grandes porque sus imágenes son grandes, y lo demás importa poco.',
        'El informe de la NASA escaneado tiene {reportPages} páginas, y cada una es una imagen en blanco y negro. Las imágenes son el {reportImagesShare} del archivo, y el resto es la estructura que mantiene unidas tantas páginas. El formulario del IRS no tiene ninguna imagen: sus {formFontCount} fuentes incrustadas son el {formFontsShare} del archivo, y los campos del formulario y el texto de las páginas forman el otro {formOtherShare}.',
        'Los apuntes de clase lo mezclan todo: {bookImageCount} imágenes son el {bookImagesShare} del archivo, {bookFontCount} programas de fuentes incrustados son otro {bookFontsShare}, y las {bookPages} páginas de texto y dibujos son el resto. La tabla de "Lo que medimos" tiene cada archivo.',
      ],
    },
    {
      heading: 'Imágenes: el peso de nuestros PDF más pesados',
      paragraphs: [
        'Una foto recién salida del celular tiene millones de píxeles, muchos más de los que una página necesita en una pantalla o incluso impresa. Cuando una foto así entra en un PDF a tamaño completo, el PDF carga con cada píxel. Un escaneo hace lo mismo: escanear a alta resolución y a color convierte cada página en una imagen grande.',
        'Aquí es donde pueden ayudar Recomendada y Fuerte, en Comprimir PDF, porque las imágenes pueden perder detalle que nadie ve. Un PDF sin imágenes solo puede aligerarse con una reescritura de su estructura, y lo que eso dio en nuestros archivos está en la sección siguiente.',
      ],
    },
    {
      heading: 'Fuentes, formularios y estructura',
      paragraphs: [
        'Un PDF lleva las fuentes que necesita, para verse igual en cualquier computadora. Un documento compuesto con muchas tipografías, o uno que incrusta fuentes enteras en lugar de solo las letras que usa, se vuelve más pesado por eso. Los formularios suman su propio peso: cada campo es un objeto, y algunos formularios llevan una segunda descripción de sí mismos para programas antiguos.',
        'Nada de esto se puede apretar como una foto. Una reescritura sin pérdida empaqueta la estructura de forma más compacta y descarta lo repetido, y lo que eso da depende de cómo se escribió el archivo. Nuestro PDF largo solo con texto, que nuestro script de prueba escribió sin empaquetar nada, perdió así el {textOnlyLosslessRatio_off} de su tamaño. Los apuntes de clase, un documento real, perdieron apenas {bookLosslessSaved} de {bookTotal}.',
      ],
    },
    {
      heading: 'Qué hizo cada nivel de Comprimir PDF',
      paragraphs: [
        'Sin pérdida reescribe el archivo sin tocar ninguna imagen. Al informe escaneado le quitó un {reportLosslessRatio_off}, y al formulario de impuestos, un {formLosslessRatio_off}. En el PDF de fotos, cuyo peso está en las imágenes, ahorró solo {photosLosslessSaved_exact} de {photosTotal}.',
        'Recomendada, además, vuelve a comprimir las fotos en color y en escala de grises que hay dentro, sin pasar de la resolución que una página necesita. Al PDF de fotos le quitó un {photosRecommendedRatio_off}, y a la página de libro escaneada, un {scanRecommendedRatio_off}. En el informe escaneado dio el mismo resultado que Sin pérdida, porque los escaneos en blanco y negro se guardan de una forma que este nivel no vuelve a comprimir.',
        'Fuerte convierte cada página en una imagen. Al PDF de fotos le quitó un {photosStrongChromiumRatio_off}, y a la página de libro escaneada, un {scanStrongChromiumRatio_off}. Tiene un costo: el texto ya no se puede seleccionar ni buscar, y se pierden los campos de formulario, los enlaces y los marcadores.',
      ],
    },
    {
      heading: 'Cuando el archivo vuelve igual',
      paragraphs: [
        'Comprimir PDF nunca te devuelve un archivo más grande que el que le diste. Cuando un nivel no logra reducir el archivo, recibes el original de vuelta, byte por byte. De los {accepted} PDF que comprimimos, Sin pérdida devolvió sin cambios {losslessUnchanged_word} PDF, y Recomendada, {recommendedUnchanged_word} PDF: en ambos casos, un PDF que ya estaba tan compacto como lo deja la reescritura.',
        'Fuerte devolvió sin cambios {strongUnchangedChromium_word} PDF de los {accepted_word}. Las páginas de texto dibujadas como imágenes pesan más que el propio texto, y un escaneo en blanco y negro guardado como imagen de una página ya es más pequeño que una foto de esa misma página. En nuestras pruebas, Fuerte le ganó a Recomendada solo en el PDF de fotos y en la página de libro escaneada.',
      ],
    },
    {
      heading: 'Si todavía pesa demasiado',
      paragraphs: [
        'Si el PDF es casi todo texto y sigue por encima del límite después de Sin pérdida, divídelo en partes y envíalas por separado, o quita las páginas que no hacen falta. Si es casi todo fotos, comprime las fotos antes de que entren en el PDF, a un tamaño que se ajuste a la página.',
        'Para un escaneo que todavía vas a hacer, una resolución más baja y la escala de grises en lugar del color hacen de cada página una imagen más pequeña desde el principio. Y cuando el archivo tiene que quedar entero, un enlace a una copia compartida puede ir donde no cabe un adjunto.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'Lo que medimos',
  sheet: {
    stats: [
      { label: 'La imagen de la página escaneada', value: '{scanImagesShare}', sub: '{scanImages} de {scanTotal}' },
      { label: 'Recomendado en nuestro PDF de fotos', value: '{photosRecommendedRatio_change}', from: '{photosTotal}', to: '{photosRecommended}' },
    ],
    sample: '{spaceFiles} PDF de prueba abiertos y {accepted} comprimidos.',
    link: 'Mira las tablas',
  },
  tableHeading: 'Archivo por archivo',
  measuredIntro: 'Primero, lo que pesa cada tipo de contenido en {spaceFiles_word} PDF de nuestras pruebas. Después, cada nivel de Comprimir PDF en los {accepted} PDF de nuestras pruebas que la herramienta acepta, con la parte del tamaño original que queda.',
  measuredNote: 'Medido el {date}. Las páginas escaneadas, el informe de la NASA, el formulario del IRS y los apuntes de clase son documentos reales; los otros PDF de prueba los escribió nuestro propio script de prueba. Lo que ocupa el espacio se leyó con pdf-lib, la biblioteca con la que el motor abre los archivos. Sin pérdida y Recomendada corrieron en Node con el motor de este sitio, que da los mismos bytes que el navegador; Fuerte dibuja las páginas en el canvas, así que se midió en la página de Comprimir PDF, en Chromium {chromiumVersion} y en WebKit {webkitVersion}, con {system}. La tabla muestra Chromium.',
  tables: [
    {
      heading: 'Qué ocupa el espacio',
      caption: 'Nuestros PDF de prueba: páginas, tamaño y cuánto de él son imágenes, fuentes y todo lo demás',
      head: ['Archivo', 'Páginas', 'Tamaño', 'Imágenes', 'Fuentes', 'Todo lo demás'],
    },
    {
      heading: 'Comprimir PDF, nivel por nivel',
      caption: 'Cada PDF de nuestras pruebas que Comprimir PDF acepta: su tamaño antes y después de cada nivel, con la parte del original que queda',
      head: ['Archivo', 'Antes', 'Sin pérdida', 'Recomendada', 'Fuerte'],
    },
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    { id: 'gmail', label: 'Ayuda de Gmail: Cómo enviar archivos adjuntos en un mensaje de Gmail', href: 'https://support.google.com/mail/answer/6584?hl=es-419', read: '2026-11-03' },
    { id: 'outlook', label: 'Soporte de Microsoft: Límites de envío en Outlook.com', href: 'https://support.microsoft.com/es-es/outlook/sending-limits-in-outlook-com', read: '2026-11-03' },
    { id: 'adobe', label: 'Adobe Acrobat: por qué un PDF pesa tanto y cómo trabajar con un PDF grande (en inglés)', href: 'https://www.adobe.com/acrobat/hub/why-is-pdf-so-big.html', read: '2026-11-03' },
  ],
  facts: {
    gmailLimit: { text: '25 MB', source: 'gmail' },
    outlookLimit: { text: '25 MB', source: 'outlook' },
  },
  names: [],
  relatedHeading: 'Herramientas y guías relacionadas',
};

export default texts;
