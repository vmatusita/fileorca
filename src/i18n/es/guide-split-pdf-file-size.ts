import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Cómo dividir un PDF y por qué las partes pueden pesar más que el original',
  description: 'Por qué las partes de un PDF dividido pueden sumar mucho más que el original, medido en nuestros PDF de prueba, y cómo dividirlo para que no pase.',
  h1: 'Cómo dividir un PDF y por qué las partes pueden pesar más que el original',
  lead: 'Divides un PDF grande para enviarlo en partes, y las partes suman más que el archivo con el que empezaste. Aquí está por qué pasa eso, y cuándo no pasa.',
  changed: 'Primera versión, con las mediciones del {date}.',
  intro: [
    'Dividir un PDF suena a cortar papel: las páginas van a pilas separadas y no se agrega nada. Un PDF no funciona así. Cada parte tiene que ser un PDF completo por sí mismo, que se pueda abrir en cualquier lugar, así que lleva todo lo que sus páginas necesitan para verse bien, y Dividir PDF además le da a cada parte una copia de la descripción del documento original.',
    'Cuánto suma eso depende del archivo. Dividimos {files_word} PDF de nuestras pruebas, una parte por página, y sumamos las partes. En {bigger_word} PDF, las partes pesaron más que el original: las de los apuntes de clase, {bookRatio_times} su peso; las del informe de la NASA escaneado, un {reportRatio_more} más; y las del PDF de fotos, {photosGrowth_exact} más.',
  ],
  toolHeading: 'Divide tu PDF aquí',
  toolIntro: 'Suelta un PDF, elige dividir cada página o escribe los rangos que quieras, y presiona el botón. Las partes se crean en esta pestaña del navegador y llegan juntas en un ZIP; no se sube nada.',
  sections: [
    {
      heading: 'Cada parte es un PDF entero',
      paragraphs: [
        'Cuando Dividir PDF crea una parte, empieza un PDF nuevo y copia en él las páginas de esa parte, con todo lo que esas páginas usan: las fuentes, las imágenes, los enlaces y los campos de formulario que están en ellas. Una imagen que está en una sola página va a una sola parte. Una fuente que se usa en todas las páginas va a todas las partes.',
        'Ese último punto lo explica todo. Un PDF guarda cada fuente una vez y deja que todas las páginas la compartan. Si lo divides en un archivo por página, cada archivo necesita su propia copia.',
      ],
    },
    {
      heading: 'Dónde crecieron las partes: las fuentes',
      paragraphs: [
        'Nuestros apuntes de clase tienen {bookParts} páginas compuestas con muchas fuentes incrustadas. Divididos en {bookParts} partes, sumaron {bookSum}, {bookRatio_times} el original de {bookTotal}. Casi todo el crecimiento fueron fuentes: el archivo entero tiene {bookFonts} de datos de fuentes, y las partes juntas tenían {bookPartFonts}, {bookFontsRatio_times} esa cantidad.',
        'Las imágenes no crecieron nada. Cada una está en una sola página, así que fue a una sola parte, y las partes tenían {bookPartImages} de imágenes, exactamente lo que tiene el archivo entero. Adobe señala, en inglés, que agregar una sola fuente a un PDF a veces puede aumentar su tamaño de forma considerable; dividir puede repetir ese costo en cada parte que usa esa fuente.',
      ],
    },
    {
      heading: 'Escaneos: lo que repite cada parte',
      paragraphs: [
        'Un documento escaneado es una imagen por página, y cada imagen va a una parte. Nuestro informe de la NASA escaneado tiene {reportParts} páginas; dividido en {reportParts} partes, sumó {reportSum}, un {reportRatio_more} más que el original, con las imágenes en los mismos bytes que antes. La mayor parte del crecimiento, el {reportMetadataShare}, fueron los metadatos del documento: una descripción del archivo en un formato llamado XMP, de {reportMetadata} en el original. Dividir PDF la copia en cada parte, así que las partes tenían {reportPartMetadata} de ella. El resto es la pequeña estructura que cada parte necesita alrededor de su página.',
        'Nuestro PDF de fotos no lleva esa descripción. Dividido en sus {photosParts} páginas, creció apenas {photosGrowth_exact}.',
      ],
    },
    {
      heading: 'Cuando las partes pesan menos',
      paragraphs: [
        'El formulario del IRS fue en la dirección contraria. Al dividirlo en sus {formParts} páginas, las partes sumaron {formSum}, un {formRatio_off} menos que el original. El formulario lleva una segunda descripción de sí mismo, en un formato llamado XFA, que solo leen algunos programas. Dividir PDF no la copia en las partes, y lo avisa junto al archivo; los campos del formulario se conservan.',
        'Además, las partes se escriben con la estructura bien empaquetada, en flujos de objetos comprimidos, y eso explica en parte por qué una parte puede salir más pequeña que su porción del original.',
      ],
    },
    {
      heading: 'Cómo dividir sin el peso extra',
      paragraphs: [
        'Divide en rangos, no en páginas sueltas, cuando las páginas comparten sus fuentes. Un capítulo en una parte lleva sus fuentes una vez, mientras que sus páginas separadas las llevan una vez cada una. Escribe en la herramienta los rangos que necesitas, por ejemplo por capítulo o por sección, en lugar de dividir cada página.',
        'Si divides para no pasarte del límite de un correo, mira el total y no solo cada parte: una parte que cabe puede ser la primera de muchas partes pesadas. Cada parte de nuestro informe escaneado sumó unos {reportGrowthPerPart} al total, y {reportMetadata} de eso es su propia copia de los metadatos; el resto es su estructura. Menos partes, y más grandes, repiten ambas cosas menos veces. Comprimir PDF puede aligerar las imágenes antes de que dividas.',
        'Y si lo que necesitas es un PDF más corto y no varios, mejor elimina las páginas que no te hacen falta. Un archivo entero guarda sus fuentes una vez, sin importar cuántas páginas quites.',
      ],
    },
    {
      heading: 'Lo que medimos en cada archivo',
      paragraphs: [
        'Dividimos {files} PDF en una parte por página, la opción predeterminada de Dividir PDF, y sumamos las partes. Las partes pesaron más que el original en {bigger} de ellos. La tabla muestra cada archivo, con sus fuentes antes y después, porque las fuentes fueron la mayor parte del peso extra en nuestra muestra.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'Lo que medimos',
  measuredIntro: 'Cada PDF dividido en una parte por página, la opción predeterminada de Dividir PDF. El cambio compara todas las partes con el archivo entero; la columna de fuentes muestra los datos de fuentes del archivo entero y después los de todas las partes juntas.',
  measuredNote: 'Medido el {date} en Node con el motor de este sitio, que da los mismos bytes que el navegador, sobre {files_word} PDF de nuestras pruebas: los documentos reales y un PDF de fotos. Las fuentes, las imágenes y los metadatos se contaron con pdf-lib, la biblioteca con la que el motor abre los archivos.',
  tables: [
    {
      heading: 'Una parte por página',
      caption: 'Cada PDF: el número de partes, el tamaño del archivo entero, el tamaño de todas las partes juntas, el cambio y los datos de fuentes antes y después',
      head: ['Archivo', 'Partes', 'Archivo entero', 'Todas las partes', 'Cambio', 'Fuentes'],
    },
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    { id: 'adobe', label: 'Adobe: Why is my PDF so big? (en inglés)', href: 'https://www.adobe.com/acrobat/hub/why-is-pdf-so-big.html', read: '2026-11-03' },
  ],
  facts: {},
  names: [],
  relatedHeading: 'Herramientas y guías relacionadas',
};

export default texts;
