// F19b (front T1): guide 1 in Spanish, a phone photo under the size limit of an online form, with Compress image open on
// Up to a size. The same keys, placeholders, parts and table as the English text; every number is a placeholder of
// data/guides-measured.json, an official figure of `facts` with its source, or a technical name of `names`
// (tests/unit/guides-numbers.test.ts). The counts in words of photos are feminine here (fotos), and numbers follow the
// US format, as the whole Spanish site does.
import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Foto para un formulario en línea: cómo dejarla dentro del límite de tamaño',
  description: 'Qué cuenta un límite en KB y qué perdieron nuestras fotos de celular, en píxeles y en calidad, para quedar por debajo de él con Comprimir imagen.',
  h1: 'Cómo ajustar una foto al límite de un formulario',
  lead: 'Qué cuenta un límite en KB y qué perdieron nuestras fotos de celular, en píxeles y en calidad, para caber en él.',
  changed: 'Primera versión de esta guía, publicada el {published}.',
  intro: [
    'Un formulario que pide una foto y pone un límite de tamaño rechaza el archivo que lo supera, por buena que sea la foto. Nuestras {photos_wordf} fotos reales de celular pesan de {photoMin} a {photoMax}: cada una pesa varias veces lo que cabe en un límite de {limit500}, y mucho más de {limit100}.',
    'Para quedar por debajo de un límite, un JPG puede ceder calidad, píxeles o las dos cosas. Pasamos cada foto por la opción Hasta un tamaño con {limit100}, {limit200} y {limit500}, y leímos lo que salió: los bytes, el ancho y el alto, y la calidad que usó el codificador. Todos los archivos cupieron. Con {limit100} y {limit200}, todas las fotos también perdieron píxeles.',
  ],
  toolHeading: 'Ajusta tu foto a un límite',
  toolIntro: 'El panel se abre en Hasta un tamaño. Escribe el límite de tu formulario en KB y suelta la foto: el resultado muestra el nuevo tamaño del archivo y, cuando la foto tuvo que achicarse, el nuevo ancho y el nuevo alto.',
  sections: [
    {
      heading: 'Qué cuenta un límite en KB',
      paragraphs: [
        'Un límite en kilobytes es un límite para los bytes del archivo, no para su ancho y su alto. Comprimir imagen cuenta un kilobyte como {kilo} bytes, como dice la tabla de la herramienta, y eso es lo que quiere decir el prefijo kilo en el Sistema Internacional de Unidades. En la herramienta, un límite de {limit100} equivale a {limit100_exact}.',
        'Un kilobyte también se puede leer a la manera binaria. El NIST, el instituto de normas de Estados Unidos, cuenta que en la informática se empezó a usar kilo para decir {kibi}. Para acabar con la confusión, la IEC les dio nombres propios a los múltiplos binarios en {iecDate}, y kibi, que se escribe Ki, vale {kibi}.',
        'Puede que un formulario no diga qué lectura usa, y la menor es la segura. Un archivo de {limit100_exact} o menos queda por debajo de {limit100} cuente como cuente el formulario, porque {limit100} binarios admiten un poco más. Un administrador de archivos que cuenta a la manera binaria también muestra el archivo con menos kilobytes que la herramienta: esa diferencia está en la cuenta, no en el archivo.',
      ],
    },
    {
      heading: 'Qué pasó en cada límite',
      paragraphs: [
        'Con {limit100}, las {photos_wordf} fotos cupieron, de {at100MinChromium_exact} a {at100MaxChromium_exact}, y las {photos_wordf} perdieron píxeles. La foto del Pixel 2 pasó de {pixelWidth} × {pixelHeight} a {pixelAt100WidthChromium} × {pixelAt100HeightChromium}; la del iPhone 6 salió con {iphone6At100WidthChromium} × {iphone6At100HeightChromium}, cuando antes tenía {iphone6Width} × {iphone6Height}.',
        'Con {limit200}, las fotos perdieron menos píxeles, pero aun así perdieron algunos. La del iPhone 6 salió con {iphone6At200WidthChromium} × {iphone6At200HeightChromium}, en {iphone6At200Chromium_exact}, a unos pocos cientos de bytes del límite.',
        'Con {limit500}, solo {at500KeptChromium_wordf} foto de {photos_wordf} conservó su tamaño original: la del iPhone 5, con {iphone5Width} × {iphone5Height}, en {iphone5At500Chromium_exact}. La del Pixel 2 todavía salió con {pixelAt500WidthChromium} × {pixelAt500HeightChromium}, y la del iPhone 6 también perdió píxeles, por un motivo que explica la parte siguiente.',
      ],
    },
    {
      heading: 'Cómo la opción Hasta un tamaño baja del límite',
      paragraphs: [
        'Según la tabla de la herramienta, Hasta un tamaño baja primero la calidad, y las dimensiones solo si hace falta. La página no muestra la calidad, así que la leímos en los propios archivos.',
        'Con {limit100} y {limit200}, ese orden se cumplió en nuestra muestra: ninguna de las {photos_wordf} fotos habría cabido en su tamaño original con ninguna de las calidades que usa la herramienta, así que las dimensiones tuvieron que bajar. Con {limit500} no se cumplió del todo. La foto del iPhone 6 salió con {iphone6At500WidthChromium} × {iphone6At500HeightChromium} y calidad {iphone6At500QualityChromium}, aunque la foto entera habría cabido con calidad {iphone6At500FullQuality}: la herramienta mantuvo la calidad más alta y cedió píxeles a cambio.',
        'La foto del iPhone 5 muestra el otro lado. Conservó su tamaño original con calidad {iphone5At500QualityChromium} y usó la menor parte de su límite en nuestra muestra, {at500FillMinChromium}. En su tamaño original, esa foto habría cabido con una calidad de hasta {iphone5At500FullQuality}, así que la herramienta se detuvo por debajo de lo que el límite permitía.',
      ],
    },
    {
      heading: 'Un límite mayor compró píxeles, no calidad',
      paragraphs: [
        'En nuestra muestra, un límite mayor no compró un JPG de mejor aspecto: compró una foto más grande. La foto del Pixel 2 salió con calidad {pixelAt100QualityChromium} en el límite de {limit100}, {pixelAt200QualityChromium} en el de {limit200} y {pixelAt500QualityChromium} en el de {limit500}, mientras su ancho crecía de {pixelAt100WidthChromium} a {pixelAt200WidthChromium} y luego a {pixelAt500WidthChromium} píxeles.',
        'En las {photos_wordf} fotos, la calidad con {limit100} fue de {at100QualityMinChromium} a {at100QualityMaxChromium}, y con {limit500}, de {at500QualityMinChromium} a {at500QualityMaxChromium}. Los rangos se superponen: aquí un límite menor no siempre significó una calidad menor, pero sí significó menos píxeles en todas las fotos. Si tu foto tiene que mostrar letra pequeña, como la de un documento o una tarjeta, revisa el nuevo ancho y el nuevo alto: con menos píxeles, la letra pequeña se lee peor.',
      ],
    },
    {
      heading: 'Cuando el formulario también pide píxeles',
      paragraphs: [
        'Hasta un tamaño elige las dimensiones por su cuenta, así que no puede darte el ancho y el alto exactos que pida el formulario. Si el formulario pide un tamaño exacto en píxeles, fíjalo primero con Redimensionar imagen y luego trae la foto redimensionada al panel de arriba para ocuparte del tamaño del archivo.',
        'Redimensionar imagen deja fijas las proporciones y encaja la foto dentro del ancho y el alto que escribas, así que una foto de otra forma sale más pequeña de un lado. Para un cuadrado u otra forma fija, recorta primero la foto a esa forma con Recortar imagen y después redimensiónala.',
        'Si la foto redimensionada todavía pasa del límite, Hasta un tamaño puede quitarle más píxeles, y la foto deja de tener el tamaño que fijaste. Compara el ancho y el alto del resultado con lo que pide el formulario antes de subirla.',
      ],
    },
    {
      heading: 'Antes de subir la foto',
      paragraphs: [
        'Mira el formato que pide el formulario. Hasta un tamaño entrega un JPG, y las áreas transparentes de un PNG quedan blancas, así que sirve para un formulario que pide JPG o JPEG. Comprimir imagen acepta JPG, PNG y WebP, así que una foto de iPhone guardada en HEIC pasa primero por HEIC a JPG.',
        'Escribe el límite que da el formulario, tal cual, porque la herramienta ya usa la lectura menor. Si aun así el formulario rechaza el archivo, puede que lo pese a su manera: escribe un límite menor y vuelve a intentarlo.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'Lo que medimos',
  sheet: {
    stats: [
      { label: 'Pixel 2 con límite de {limit100}', value: '{pixelAt100ShareChromium_change}', from: '{pixelBytes}', to: '{pixelAt100Chromium}' },
      { label: 'Fotos enteras con límite de {limit500}', value: '{at500KeptChromium} de {photos}' },
    ],
    sample: '{photos} fotos de celular, cada una comprimida hasta {limit100}, {limit200} y {limit500}.',
    link: 'Mira la tabla',
  },
  tableHeading: 'Foto por foto, límite por límite',
  measuredIntro: 'Cada una de nuestras {photos} fotos reales de celular pasó sola por Hasta un tamaño, una vez por límite. La última columna es la calidad más alta con la que la foto habría cabido en el límite sin perder ningún píxel. "Nada" quiere decir que ni la calidad más baja que usa la herramienta habría alcanzado.',
  measuredNote: 'Medido el {date} en la página Comprimir imagen de este sitio, en Chromium {chromiumVersion} y en WebKit {webkitVersion}, en {system}; la tabla muestra Chromium. La calidad se leyó en Node en las tablas de cuantización de cada JPG, que coinciden con el codificador del sitio en una sola calidad, y la última columna sale de ese codificador, ejecutado en Node. WebKit dio el mismo ancho y el mismo alto en {sameDimensions} de los {outputs} archivos; allí, la foto del iPhone 6 con {limit100} salió con {iphone6At100WidthWebkit} × {iphone6At100HeightWebkit}.',
  tables: [
    {
      heading: 'Cada foto en cada límite',
      caption: 'Cada foto de celular en cada límite, en Chromium: los bytes del JPG, su ancho y su alto, la calidad a la que llegó y la calidad más alta que habría conservado todos los píxeles',
      head: ['Límite', 'Foto', 'Archivo', 'Dimensiones en píxeles', 'Calidad alcanzada', 'El tamaño original cabe hasta la calidad'],
    },
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    { id: 'nist-binary', label: 'NIST: Definiciones de las unidades del SI: los prefijos binarios (en inglés)', href: 'https://physics.nist.gov/cuu/Units/binary.html', read: '2026-11-16' },
  ],
  facts: {
    kilo: { text: '1,000', source: 'nist-binary' },
    kibi: { text: '1,024', source: 'nist-binary' },
    iecDate: { text: 'diciembre de 1998', source: 'nist-binary' },
  },
  names: ['Pixel 2', 'iPhone 6', 'iPhone 5'],
  relatedHeading: 'Herramientas y guías relacionadas',
};

export default texts;
