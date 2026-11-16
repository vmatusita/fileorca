import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Cómo firmar un PDF sin imprimirlo y qué tipo de firma es',
  description: 'Firma un PDF dibujando, eligiendo una imagen o escribiendo tu nombre: qué es esa firma, en qué se diferencia de una con certificado y qué cambió en nuestros PDF.',
  h1: 'Cómo firmar un PDF sin imprimirlo',
  lead: 'Dibuja, elige una imagen o escribe tu firma, y llega a la página como una imagen. Qué es esa imagen, qué no es y qué cambió en nuestros archivos.',
  changed: 'Primera versión de esta guía, publicada el {published}.',
  intro: [
    'No necesitas una impresora para firmar un PDF. En papel, imprimes las páginas, las firmas con un bolígrafo y las vuelves a escanear, y lo que envías es una foto de cada hoja. Firmar el PDF mismo deja sus páginas como están y agrega tu firma encima de las que elijas.',
    'Esa firma es una imagen. Un PDF también puede llevar otro tipo, una firma digital con certificado, que esta herramienta no hace.',
  ],
  toolHeading: 'Firma tu PDF aquí',
  toolIntro: 'Suelta un PDF, haz tu firma de la forma que prefieras, colócala en la vista previa y presiona Firmar PDF. Recibes una copia firmada para descargar.',
  sections: [
    {
      heading: 'La firma en la página y la firma digital',
      paragraphs: [
        'Lo que Firmar PDF pone en la página es una imagen: los trazos que dibujaste, la imagen que elegiste o tu nombre dibujado con la fuente del sitio. Queda en la página como un sello queda en el papel. Quien abre el PDF la ve, y nada en el archivo la vincula contigo ni con el momento en que firmaste.',
        'Una firma digital es otra cosa. El NIST, la agencia de normas de Estados Unidos, dice en su estándar de firma digital que las firmas digitales sirven para detectar modificaciones no autorizadas en los datos y para autenticar la identidad de quien firma. Una firma así se hace a partir de los bytes del archivo con una clave privada que solo controla quien firma, y un certificado vincula la clave pública correspondiente con su dueño.',
        'Firmar PDF no guarda ninguna clave ni ningún certificado, así que no puede hacer ese tipo de firma. Para tener una así, necesitas un servicio de firma que trabaje con certificados.',
      ],
    },
    {
      heading: 'Lo que la firma cambió en nuestros archivos',
      paragraphs: [
        'Firmamos {files_word} PDF de prueba en todas las páginas, una vez de cada una de las {modes_wordf} formas, en Chromium y en WebKit, y volvimos a leer cada copia firmada. Cada página firmada ganó una imagen, y su texto quedó como estaba: el texto que un lector extrae de cada página fue el mismo en las {textKeptChromium_wordf} copias firmadas en Chromium y en las {textKeptWebkit_wordf} firmadas en WebKit. Todavía se puede buscar, seleccionar y copiar.',
        'Nuestro Formulario 1040 del IRS tiene {formFields} campos para llenar, y todos ellos seguían en cada copia firmada. Su capa XFA, una segunda copia del formulario que leen algunas aplicaciones de escritorio, no sobrevivió: Firmar PDF la quitó y lo avisó junto al archivo en las {formXfaNoteChromium_wordf} copias firmadas en Chromium.',
        'También buscamos un diccionario de firma y un rango de bytes, las partes de un PDF que guardan una firma digital y el tramo de bytes que esa firma sella. En las copias firmadas en Chromium, contamos {newSigDictsChromium} diccionarios de firma nuevos y {newByteRangesChromium} rangos de bytes nuevos.',
      ],
    },
    {
      heading: 'Dibujar, elegir una imagen o escribir: lo que agregó cada forma',
      paragraphs: [
        'Dibujar: firma en el recuadro con el dedo, un lápiz óptico o el mouse. En nuestros archivos, una firma dibujada agregó de {drawAddedMinChromium} a {drawAddedMaxChromium} en Chromium. Los mismos trazos, dibujados por el mismo script en WebKit, agregaron más, de {drawAddedMinWebkit} a {drawAddedMaxWebkit}.',
        'Imagen: elige un PNG o un JPG de tu firma. Un PNG con fondo transparente pone en la página solo la tinta, mientras que un JPG lleva consigo todo su rectángulo. Nuestra imagen de prueba no es una firma de verdad sino una imagen de {signatureImageWidth} por {signatureImageHeight} píxeles, de {signatureImageBytes} en PNG, y la herramienta la vuelve a guardar antes de ponerla en la página. El PDF de {mixedPages_wordf} páginas creció {mixedUploadAddedChromium_exact} y el formulario de {formPages_wordf} páginas, {formUploadAddedChromium_exact}, casi lo mismo: la imagen entró una sola vez en cada archivo, sin importar cuántas páginas la muestren. Aun así, llevó nuestro PDF de páginas de tamaños distintos de {mixedBefore} a {mixedUploadChromium}, así que recorta la foto o el escaneo de tu firma hasta la tinta antes de elegir la imagen.',
        'Escribir: escribe tu nombre, y la herramienta lo dibuja como una imagen, con la fuente del sitio. En cada uno de nuestros PDF fue la forma que menos agregó: de {typeAddedMinChromium} a {typeAddedMaxChromium} en Chromium.',
        'Después, arrastra el recuadro hasta su lugar y elige las páginas: esta página, todas las páginas o las que marques. Cuando más de una persona tiene que firmar, la primera firma y descarga, y la siguiente abre aquí esa copia firmada y agrega su firma.',
      ],
    },
    {
      heading: 'Firmar un archivo que ya está firmado',
      paragraphs: [
        'El formulario del IRS de nuestra muestra ya llevaba un sello de tipo digital: una firma de derechos de uso, con un rango de bytes que cubría todo el archivo. Después de Firmar PDF, ese sello seguía dentro de las {formUsageRightsAfterChromium_wordf} copias firmadas en Chromium, pero su rango de bytes ya no cubría el archivo. Una firma digital está hecha para notar los cambios, y poner una imagen en la página es un cambio.',
        'Así que, antes de firmar aquí un PDF que ya lleva una firma digital, pregúntale a la persona que te lo mandó cómo quiere que lo firmes.',
      ],
    },
    {
      heading: '¿Van a aceptar tu PDF firmado?',
      paragraphs: [
        'En la Unión Europea, el Reglamento (UE) n.º 910/2014, sobre la identificación electrónica y los servicios de confianza, define la firma electrónica como los datos en formato electrónico anejos a otros datos electrónicos o asociados de manera lógica con ellos que utiliza el firmante para firmar. Y dice que no se denegarán efectos jurídicos ni admisibilidad como prueba en procedimientos judiciales a una firma electrónica por el mero hecho de ser una firma electrónica o porque no cumpla los requisitos de la firma electrónica cualificada.',
        'El mismo reglamento pide a la firma avanzada que esté vinculada al firmante de manera única y a los datos firmados de modo que cualquier modificación posterior sea detectable. Llama cualificada a la firma avanzada creada con un dispositivo cualificado y basada en un certificado cualificado, y dice que una firma electrónica cualificada tiene un efecto jurídico equivalente al de una firma manuscrita. La imagen que pone Firmar PDF no lleva ningún certificado ni permite detectar un cambio posterior en el archivo.',
        'Así que aceptar o no tu PDF firmado depende de quién lo recibe, del tipo de documento y de la ley del lugar, que fuera de la Unión Europea es otra. Esta guía no es asesoría legal, y ningún archivo puede prometer que una firma es válida. Cuando sea importante, pregunta a la persona o a la oficina que pide tu firma qué tipo acepta: una imagen en la página o una firma digital con certificado.',
      ],
    },
  ],
  half: 2,
  measuredHeading: 'Lo que medimos',
  sheet: {
    stats: [
      { label: 'Peso de la firma dibujada', value: '{drawAddedMinChromium} a {drawAddedMaxChromium}' },
      { label: 'Firmas digitales nuevas', value: '{newSigDictsChromium}', sub: 'en {signedChromium} copias firmadas de {files} PDF' },
    ],
    sample: '{files} PDF de prueba, con cada página firmada de las {modes_wordf} formas.',
    link: 'Mira la tabla',
  },
  tableHeading: 'PDF por PDF',
  measuredIntro: 'En la tabla, cada fila es uno de nuestros {files_word} PDF de prueba firmado de una de las formas, en Chromium; con el PNG que elegimos, la muestra es de {testFiles_word} archivos. Antes de firmar, el PDF con páginas de tamaños distintos pesaba {mixedBefore}, el PDF hecho de fotos {photosBefore} y el formulario {formBefore}.',
  measuredNote: 'Medido el {date} en la página Firmar PDF de este sitio, en Chromium {chromiumVersion} y en WebKit {webkitVersion} en {system}, con la firma dibujada con el mouse por un script y el nombre escrito como Oli Orca. Las copias firmadas se volvieron a leer en Node con PDF.js y pdf-lib. La tabla muestra las copias firmadas en Chromium.',
  tables: [
    {
      heading: 'Cada PDF firmado de cada forma',
      caption: 'Cada PDF de prueba firmado en todas las páginas en Chromium, forma por forma: el tamaño del archivo firmado y lo que la firma agregó',
      head: ['PDF', 'Firma', 'Archivo firmado', 'Agregado'],
      labels: ['Dibujada', 'Imagen elegida', 'Nombre escrito'],
    },
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    { id: 'eur-lex-910-2014', label: 'EUR-Lex: Reglamento (UE) n.º 910/2014 del Parlamento Europeo y del Consejo, texto consolidado', href: 'https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:02014R0910-20241018', read: '2026-11-16' },
    { id: 'nist-fips-186-5', label: 'NIST: FIPS 186-5, el estándar de firma digital (en inglés)', href: 'https://csrc.nist.gov/pubs/fips/186-5/final', read: '2026-11-16' },
    { id: 'nist-certificate', label: 'Glosario del NIST CSRC: certificado de clave pública (en inglés)', href: 'https://csrc.nist.gov/glossary/term/public_key_certificate', read: '2026-11-16' },
  ],
  facts: {},
  names: ['Reglamento (UE) n.º 910/2014', 'FIPS 186-5', 'Formulario 1040'],
  relatedHeading: 'Herramientas y guías relacionadas',
};

export default texts;
