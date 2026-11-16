import type { FileGuideTexts } from '../types.ts';

// F19b (front T5): guide 5 in Spanish, the English text of the front E5 adapted with docs/i18n/es.md. Every number is a
// placeholder of data/guides-measured.json, an official figure of `facts` (DENSO WAVE, whose site qrcode.com has no
// version in Spanish, so each label says "en inglés"; a no-break space between a number and its unit) or a technical name
// of `names`. The sizes of the PNG are the names of the panel: Chico, Mediano and Grande.
const texts: FileGuideTexts = {
  title: 'Tamaño del código QR: cómo lo define tu texto y cómo calcular la impresión',
  description: 'Cómo la longitud de un enlace o un texto define los cuadritos de un código QR, medido con nuestros textos, qué cambia eso en el PNG y cómo calcular la impresión.',
  h1: 'Tamaño del código QR: cómo lo define tu texto',
  lead: 'Más texto, más cuadritos. Lo que ocuparon nuestros textos, su efecto en el PNG y cómo calcular la impresión.',
  changed: 'Primera versión de esta guía, publicada el {published}.',
  intro: [
    'Un código QR no tiene un tamaño fijo. Es una cuadrícula de cuadritos, que el estándar llama módulos, y DENSO WAVE, cuyo sitio qrcode.com documenta el código QR, lo dice sin rodeos: una vez fijados la versión y el tamaño de un módulo, queda fijado el tamaño del código. Tu texto decide la versión, y el tamaño de un cuadrito lo decides tú, o tu impresora.',
    'Para ver qué le hace un texto a la cuadrícula, escribimos {texts_word} textos en el generador de arriba: un enlace corto, una frase en portugués sin sus acentos, la misma frase con ellos y un enlace largo lleno de parámetros de campaña. Guardamos cada código como PNG en los tamaños Chico, Mediano y Grande, con Oli en el centro, y volvimos a leer cada PNG con un lector de códigos QR.',
  ],
  // Two lines at 360 px beside the Oli of the QR panel, who rises 86 px above it (guide-page.spec.ts: the Oli clear of the sheet).
  toolHeading: 'Haz un código QR y mira su tamaño aquí',
  toolIntro: 'Cada carácter que agregas vuelve a dibujar el código. El contador debajo del cuadro suma lo que el código va a guardar, y cada tamaño de PNG muestra los píxeles que tendrá su archivo.',
  sections: [
    {
      heading: 'Versiones: una cuadrícula que crece por escalones',
      paragraphs: [
        'DENSO WAVE numera las versiones del código QR de la {densoVersions}, de una cuadrícula de {densoSmallestGrid} cuadritos a una de {densoLargestGrid}, y cada versión suma {densoStep} cuadritos por lado. Cuánto cabe en una versión depende de la cantidad de datos, del tipo de caracteres y del nivel de corrección de errores.',
        'El generador elige la versión según el texto. Nuestro enlace corto, de {shortBytes_exact}, quedó en la versión {shortVersionChromium}, con {shortModulesChromium} cuadritos por lado; el enlace largo, de {longBytes_exact}, quedó en la versión {longVersionChromium}, con {longModulesChromium} cuadritos por lado.',
      ],
    },
    {
      heading: 'Acentos: la misma frase, más bytes',
      paragraphs: [
        'La herramienta cuenta bytes, no letras, porque el texto entra en el código como UTF-8. Sin sus acentos, nuestra frase tenía {plainChars} caracteres y ocupó {plainBytes_exact}. Con ellos, tenía los mismos {accentsChars} caracteres, incluidas {accentsMultibyte_wordf} letras con acento, tilde o cedilla, y ocupó {accentsBytes_exact}.',
        'Esos bytes de más llevaron el código de la versión {plainVersionChromium} a la {accentsVersionChromium}, y de {plainModulesChromium} a {accentsModulesChromium} cuadritos por lado. Cada versión tiene un límite, así que un texto cerca de él pasa a la siguiente con unos pocos bytes más, mientras que un texto lejos de él se queda donde está: otra frase podría ganar los mismos bytes y conservar su versión.',
      ],
    },
    {
      heading: 'Qué hicieron los tamaños de PNG con nuestros textos',
      paragraphs: [
        'Chico, Mediano y Grande son un ancho de referencia, no un ancho exacto. La herramienta amplía el código con píxeles enteros por cuadrito, así que el lado del PNG cambió con el texto: en Chico, de {plainSmallSideChromium} píxeles en la frase sin acentos a {longSmallSideChromium} en el enlace largo. El panel muestra la medida del lado junto a cada tamaño.',
        'Lo que más cambió fue el tamaño de un cuadrito: de {smallPerModuleMinChromium} a {smallPerModuleMaxChromium} píxeles en Chico, el menor en el enlace largo, y de {largePerModuleMinChromium} a {largePerModuleMaxChromium} en Grande. Los archivos pesaron de {shortSmallBytesChromium} a {longLargeBytesChromium} en Chromium. Para imprimir, en cambio, lo que cuenta son los milímetros de un cuadrito.',
      ],
    },
    {
      heading: 'Oli en el centro y la corrección de errores en nivel H',
      paragraphs: [
        'Un código QR lleva datos extra que le permiten a un lector reconstruir una parte dañada. DENSO WAVE describe los niveles de esta corrección de errores como L, M, Q y H: un nivel más alto corrige más y hace el código más grande. Señala el M como el nivel que más se elige, y el Q o el H para lugares donde los códigos se ensucian.',
        'El generador siempre usa el H y pone parte de esa corrección al servicio de Oli: no dibuja los cuadritos que quedan bajo su cuadro blanco y deja que la corrección de errores los supla. DENSO WAVE advierte que una ilustración sobre un código activa su corrección de errores y puede volver la lectura lenta o imposible. Oli tapó entre el {hiddenShareMinChromium} y el {hiddenShareMaxChromium} de los cuadritos oscuros de nuestros textos, y el lector volvió a leer {readChromium} de {pngsChromium} PNG en Chromium y {readWebkit} de {pngsWebkit} en WebKit.',
        'Esos porcentajes cuentan cuadritos oscuros, no las palabras de código con las que trabaja la corrección de errores, y jsQR leyó archivos limpios, no una impresión vista por la cámara de un teléfono. Cuánto puede reconstruir el nivel H, y cuándo desactivar Oli, está en la página del generador; escanear una prueba impresa te dice más que nuestra tabla.',
      ],
    },
    {
      heading: 'Cómo calcular el tamaño impreso',
      paragraphs: [
        'En papel, el lado de un código es la cantidad de cuadritos de un borde al otro, con el margen, por el tamaño de un cuadrito. DENSO WAVE pide un margen libre de {densoMargin} de ancho en todos los lados, y el generador dibuja uno en cada archivo: medimos {quietZoneChromium} cuadritos en cada lado. Con él, nuestro enlace corto mide {shortSideChromium} cuadritos de ancho, y el enlace largo, {longSideChromium}.',
        'DENSO WAVE resuelve un ejemplo: un código de la versión {densoExampleVersion}, con {densoExampleModules} módulos por lado, impreso a {densoDpi} con {densoDots} por módulo, tiene módulos de {densoModuleMm}, así que el código mide {densoCodeMm} de lado y necesita {densoAreaMm} con su margen. Nuestro enlace corto tiene esa misma versión y esa misma cuadrícula, así que, impreso de esa forma, ocuparía esa misma área.',
        'Su página sobre el tamaño del módulo recomienda {densoMinDots} de la impresora por módulo, e imprimir el código tan grande como lo permita el espacio, ya que un módulo más grande se lee con más facilidad. Sus preguntas frecuentes ponen el módulo más pequeño que hace una impresora láser común en unos {densoLaserModule}, lo que le da a un código de {densoSmallestGrid} módulos unos {densoSmallestCode} de lado. Eso es lo que una impresora puede dibujar, no lo que un teléfono puede leer desde el otro lado de una sala: ninguna de las páginas de DENSO WAVE que leímos da un tamaño mínimo para escanear ni una distancia de lectura, así que esta guía no da ninguno de los dos.',
      ],
    },
    {
      heading: 'Menos cuadritos, cuadritos más grandes',
      paragraphs: [
        'En el mismo espacio, menos cuadritos significan cuadritos más grandes. El texto es la parte que tú controlas: nuestro enlace largo gastó la mayor parte de sus {longBytes_exact} en parámetros de campaña, la parte después del signo de interrogación.',
      ],
      list: [
        'Acorta el texto antes de crear el código: quita los parámetros que no necesites y usa una dirección más corta de la página, si la tiene.',
        'Deja el margen libre también en el papel, sin texto, marco ni imagen dentro de él.',
        'Imprime una prueba del tamaño que planeas y escanéala con un teléfono desde donde va a estar la gente.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'Lo que medimos',
  sheet: {
    stats: [
      { label: 'Cuadritos por lado, enlace corto a largo', value: '{shortModulesChromium} a {longModulesChromium}' },
      { label: 'PNG leídos con Oli en el centro', value: '{readChromium} de {pngsChromium}' },
    ],
    sample: '{texts} textos, cada uno guardado en PNG Chico, Mediano y Grande.',
    link: 'Mira la tabla',
  },
  tableHeading: 'Texto por texto',
  measuredIntro: 'La primera tabla reúne nuestros {texts_word} textos y el código en que se convirtió cada uno, y la segunda, el PNG de cada texto en cada tamaño. La versión es la que encontró el lector, y los cuadritos por lado no cuentan el margen.',
  measuredNote: 'Medido el {date} en la página del Generador de códigos QR de este sitio, en Chromium {chromiumVersion} y en WebKit {webkitVersion}, en {system}. Los dos navegadores dibujaron el mismo código para cada texto, y las tablas muestran Chromium; solo los archivos PNG fueron distintos, más livianos en WebKit, donde el enlace corto en Chico pesó {shortSmallBytesWebkit}, frente a {shortSmallBytesChromium}. Los caracteres y los bytes se contaron en Node, donde jsQR, un lector de códigos QR en JavaScript, volvió a leer cada PNG y dio su versión.',
  // The shape of the front M5: the labels name the texts in the order of the measurement (the short link, the sentence
  // without accents, the same sentence with them, the long link).
  tables: [
    {
      heading: 'Los textos y sus códigos',
      caption: 'Cada texto escrito en el Generador de códigos QR, en Chromium: los caracteres, los bytes que cuenta la herramienta, la versión que encontró el lector, los cuadritos de cada lado sin el margen y los cuadritos oscuros bajo Oli',
      head: ['Texto', 'Caracteres', 'Bytes', 'Versión', 'Cuadritos por lado', 'Cuadritos oscuros bajo Oli'],
      labels: ['Enlace corto', 'Frase sin acentos', 'La misma frase con acentos', 'Enlace largo'],
    },
    {
      heading: 'El PNG de cada texto en cada tamaño',
      caption: 'El PNG de cada texto en cada tamaño del Generador de códigos QR, en Chromium: los píxeles, los píxeles de cada cuadrito y el tamaño del archivo',
      head: ['Texto', 'Tamaño del PNG', 'Píxeles', 'Píxeles por cuadrito', 'Archivo'],
    },
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    { id: 'denso-version', label: 'DENSO WAVE: Capacidad de información y versiones del código QR (en inglés)', href: 'https://www.qrcode.com/en/about/version.html', read: '2026-11-16' },
    { id: 'denso-error', label: 'DENSO WAVE: La función de corrección de errores (en inglés)', href: 'https://www.qrcode.com/en/about/error_correction.html', read: '2026-11-16' },
    { id: 'denso-faq', label: 'DENSO WAVE: Preguntas frecuentes (en inglés)', href: 'https://www.qrcode.com/en/faq.html', read: '2026-11-16' },
    { id: 'denso-area', label: 'DENSO WAVE: Cómo determinar el área del código (en inglés)', href: 'https://www.qrcode.com/en/howto/code.html', read: '2026-11-16' },
    { id: 'denso-module', label: 'DENSO WAVE: Cómo fijar el tamaño del módulo (en inglés)', href: 'https://www.qrcode.com/en/howto/cell.html', read: '2026-11-16' },
  ],
  facts: {
    densoVersions: { text: '1 a la 40', source: 'denso-version' },
    densoSmallestGrid: { text: '21 × 21', source: 'denso-version' },
    densoLargestGrid: { text: '177 × 177', source: 'denso-version' },
    densoStep: { text: '4', source: 'denso-version' },
    densoMargin: { text: '4 módulos', source: 'denso-area' },
    densoExampleVersion: { text: '3', source: 'denso-area' },
    densoExampleModules: { text: '29', source: 'denso-area' },
    densoDpi: { text: '400 dpi', source: 'denso-area' },
    densoDots: { text: '4 puntos', source: 'denso-area' },
    densoModuleMm: { text: '0.254 mm', source: 'denso-area' },
    densoCodeMm: { text: '7.366 mm', source: 'denso-area' },
    densoAreaMm: { text: '9.398 mm', source: 'denso-area' },
    densoMinDots: { text: '4 o más puntos', source: 'denso-module' },
    densoLaserModule: { text: '0.17 mm', source: 'denso-faq' },
    densoSmallestCode: { text: '3.57 mm', source: 'denso-faq' },
  },
  names: ['UTF-8'],
  relatedHeading: 'Herramientas y guías relacionadas',
};

export default texts;
