import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Cómo convertir HEIC a JPG en Windows, foto por foto o todas a la vez',
  description: 'Por qué Windows no abre las fotos de tu iPhone, los ajustes que evitan el HEIC y qué cambia en el tamaño y la ubicación cuando las fotos pasan a JPG.',
  h1: 'Cómo convertir HEIC a JPG en Windows',
  lead: 'Tu iPhone guardó la foto en HEIC, y Windows no la abre o un sitio web no la acepta. Aquí ves por qué pasa y cómo terminar con un JPG.',
  changed: 'Primera versión, con las mediciones del {date}.',
  intro: [
    'HEIC es el archivo que escribe Apple cuando un iPhone o un iPad guarda las fotos con la opción Alta eficiencia, que se basa en HEIF. La imagen es la misma que en un JPG, pero va más comprimida, así que el teléfono guarda más fotos en el mismo espacio. El problema está en todo lo demás: Windows necesita software adicional para mostrarla, y muchos formularios en línea todavía piden un JPG.',
    'Puedes resolverlo en lugares distintos. Puedes enseñarle a Windows a leer HEIC, pedirle al iPhone que deje de escribirlo o convertir los archivos que ya tienes. Cada camino resuelve una parte distinta del problema, y solo el último te da archivos JPG que puedes enviar a cualquier parte.',
  ],
  toolHeading: 'Convierte tus fotos HEIC aquí',
  toolIntro: 'Suelta una foto HEIC o todo un lote. Cada una se vuelve JPG dentro de esta pestaña del navegador, así que las fotos nunca se suben, y un lote llega en un solo ZIP.',
  sections: [
    {
      heading: 'Por qué Windows pide una extensión',
      paragraphs: [
        'Windows no lee HEIC por su cuenta. Cuando abres un archivo HEIC en la aplicación Fotos, Microsoft dice que puedes ver el mensaje "Necesitas una extensión para usar este archivo". La solución que da Microsoft son dos extensiones de Microsoft Store: Extensiones de imagen HEIF, que es {heifPrice}, y Extensiones de vídeo HEVC, que cuesta {hevcPrice}. Según Microsoft, necesitas las dos aunque solo pienses ver fotos, y hay que reiniciar la aplicación Fotos después de instalarlas.',
        'Es una buena solución si solo quieres ver las fotos en tu propia PC. Pero no cambia los archivos. Siguen siendo HEIC, así que el sitio web, la carpeta compartida o la persona a quien se los envías quizá todavía no pueda abrirlos.',
      ],
    },
    {
      heading: 'Haz que el iPhone deje de escribir HEIC',
      paragraphs: [
        'Si tus fotos van a parar sobre todo a una PC con Windows, puedes pasar la cámara a JPG para todo lo que tomes de ahora en adelante. Apple describe el ajuste: abre Configuración, toca Cámara, toca Formatos y luego toca Más compatible. Desde ese momento, la cámara guarda las fotos en JPEG y los videos en H.264. Si eliges Alta eficiencia, vuelves a HEIF y HEVC, que ocupan menos espacio en el teléfono.',
        'Apple también recomienda Más compatible cuando pasas fotos a una PC con Windows, junto con su app Dispositivos Apple de Microsoft Store. Esto solo cambia las fotos que tomes después del cambio. Las que ya están en el teléfono siguen en HEIC.',
      ],
    },
    {
      heading: 'Deja que la transferencia las convierta',
      paragraphs: [
        'Cuando las fotos pasan de un iPhone a una computadora por cable, Apple dice que el contenido puede convertirse a JPEG o H.264 en el camino. El teléfono lo hace a menos que le pidas conservar los originales: abre Configuración, toca Apps, toca Fotos, desplázate hacia abajo y toca Mantener originales. Si dejas ese ajuste desactivado, las copias que llegan a la PC ya pueden ser JPG.',
        'Microsoft señala un camino parecido sin cable: muchos dispositivos convierten las fotos HEIC a un formato más común cuando los archivos se transfieren o se envían por correo, y OneDrive puede convertir los archivos de fotos por su cuenta. Los dos dependen de cómo viajan las fotos, así que conviene conocerlos, pero es difícil contar con ellos para una carpeta de archivos que ya tienes.',
      ],
    },
    {
      heading: 'Convierte los archivos que ya tienes',
      paragraphs: [
        'Para las fotos que ya están en HEIC en tu PC o en una carpeta de descargas, un conversor es el camino directo. La herramienta de esta página lee cada archivo HEIC con libheif, el mismo decodificador abierto en todos los navegadores, pone derecha la imagen principal y escribe un JPG nuevo a partir de sus píxeles. Puedes soltar un archivo o una carpeta entera, y el ZIP conserva los nombres originales con la terminación .jpg.',
        'Nada se envía a ningún lugar. La conversión se hace en la pestaña de tu navegador, y por eso sirve también para fotos privadas: la pestaña Red de tu navegador no muestra ninguna solicitud que lleve el archivo.',
      ],
    },
    {
      heading: 'Lo que la conversión hizo con nuestras fotos',
      paragraphs: [
        'Pasamos por el conversor nuestras {files} fotos HEIC de prueba, tomadas con {cameras} modelos de cámara distintos, desde iPhones hasta un teléfono Samsung y un Apple Vision Pro. Juntos, los archivos HEIC pesaban {heicTotal}. Los JPG pesaron {jpgTotalChromium}, es decir, un {ratioTotalChromium_more} más.',
        'Ese es el precio de la compatibilidad. Foto por foto, el cambio fue de {ratioMinChromium_change} a {ratioMaxChromium_change}, y la mitad de las fotos creció un {ratioMedianChromium_more} o menos. Un JPG guarda la misma imagen con menos compresión que el HEIC, y por eso nuestras fotos salieron más grandes en conjunto, no más pequeñas. Si necesitas un archivo más pequeño, comprime o redimensiona el JPG después.',
        'Los {sameSizeChromium_word} JPG conservaron el tamaño en píxeles que muestra el teléfono, con la foto derecha.',
      ],
    },
    {
      heading: 'La ubicación se queda atrás',
      paragraphs: [
        'Una foto puede llevar el lugar donde se tomó. De nuestras {files} fotos, {gpsBefore} tenían coordenadas reales de GPS, y {gpsTagBefore} tenían una etiqueta GPS de algún tipo, llena o vacía. Después de la conversión, la cantidad de JPG con algún dato GPS fue {gpsAfterChromium}.',
        'Es a propósito: la herramienta escribe cada JPG a partir de los píxeles, así que la ubicación, los datos de la cámara y los demás metadatos del HEIC se quedan atrás. Si quieres conservar la ubicación, para un mapa de fotos o un álbum, guarda el HEIC original o usa la exportación de tu app de fotos.',
      ],
    },
    {
      heading: 'Qué más se queda en el HEIC',
      paragraphs: [
        'Convertir vuelve a codificar la imagen, así que el JPG es un archivo nuevo y no una copia del HEIC con otro nombre. Además, algunos archivos HEIC guardan más de una imagen. Solo la imagen principal se convierte en el JPG: el mapa de profundidad de una foto en modo Retrato y la segunda imagen de una foto espacial quedan fuera.',
        'Tus archivos HEIC nunca cambian. Guárdalos como originales y envía los JPG, y no pierdes nada.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'Lo que medimos',
  measuredIntro: 'Todas las fotos HEIC de prueba de este sitio, convertidas con los valores predeterminados de la herramienta de arriba. El cambio es el del JPG frente al HEIC.',
  measuredNote: 'Medido el {date} en Chromium {chromiumVersion} y en WebKit {webkitVersion} en {system}, con la página HEIC a JPG de este sitio, sobre nuestras {files} fotos HEIC de prueba. La tabla muestra Chromium; WebKit dio los mismos bytes en {identicalBrowsers_wordf} de las {files} fotos.',
  tables: [
    {
      heading: 'Nuestras fotos HEIC en JPG',
      caption: 'Cada foto HEIC de prueba: su cámara, su tamaño en HEIC y en JPG, el cambio, su tamaño en píxeles y su GPS antes y después',
      head: ['Cámara', 'HEIC', 'JPG', 'Cambio', 'Píxeles', 'GPS antes', 'GPS después'],
    },
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    { id: 'ms-photos', label: 'Soporte de Microsoft: Error del Editor de vídeo de la aplicación Fotos, no se puede ver este tipo de archivo', href: 'https://support.microsoft.com/es-es/windows/apps/photos/photos-app-video-editor-error-can-t-view-this-file-type', read: '2026-11-03' },
    { id: 'ms-heif', label: 'Microsoft Store: Extensión de imágenes HEIF', href: 'https://apps.microsoft.com/detail/9pmmsr1cgpwg?hl=es-US&gl=US', read: '2026-11-03' },
    { id: 'apple-heif', label: 'Soporte técnico de Apple: Usa contenido en formato HEIF o HEVC en dispositivos Apple', href: 'https://support.apple.com/es-lamr/116944', read: '2026-11-03' },
    { id: 'apple-transfer', label: 'Soporte técnico de Apple: Transfiere fotos y videos del iPhone o iPad a una Mac o PC', href: 'https://support.apple.com/es-lamr/120267', read: '2026-11-03' },
  ],
  facts: {
    heifPrice: { text: 'gratis', source: 'ms-photos' },
    hevcPrice: { text: '$0.99', source: 'ms-photos' },
  },
  names: ['H.264'],
  relatedHeading: 'Herramientas y guías relacionadas',
};

export default texts;
