import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Cómo quitar la ubicación de las fotos antes de compartirlas',
  description: 'Dónde guarda una foto el lugar en que se tomó, cómo evitarlo u ocultarlo en iPhone y Android, y cómo quitarlo del archivo sin cambiar un solo píxel.',
  h1: 'Cómo quitar la ubicación de las fotos antes de compartirlas',
  lead: 'Una foto tomada con el celular puede llevar el lugar exacto donde se tomó. Aquí ves dónde están esos datos, cómo evitar que se guarden y cómo quitarlos de un archivo que ya tienes.',
  changed: 'Primera versión, con las mediciones del {date}.',
  intro: [
    'Los teléfonos escriben datos de cada foto dentro del propio archivo: la cámara, la fecha y la hora y, si la ubicación está activada, las coordenadas GPS del lugar donde estabas. Apple lo dice con claridad: las coordenadas se incrustan en cada foto y video. Cualquiera que reciba el archivo original puede leerlas, y con unos pocos clics las pone en un mapa.',
    'Algunas apps quitan estos datos cuando publicas, y otras no. El correo, las transferencias de archivos, las carpetas en la nube y muchas apps de chat envían el archivo tal como está. Si una foto muestra tu casa, la escuela de tus hijos o cualquier lugar que prefieras no marcar en un mapa, quita la ubicación antes de que el archivo salga de tus manos.',
  ],
  toolHeading: 'Quita los metadatos de tus fotos aquí',
  toolIntro: 'Es Redimensionar imagen con la opción {winnerOption}: cada foto conserva todos sus píxeles y vuelve sin su ubicación, su cámara ni su fecha. Funciona en esta pestaña del navegador, así que las fotos nunca se suben.',
  sections: [
    {
      heading: 'Lo que llevaban nuestras fotos',
      paragraphs: [
        'Las {withGps_wordf} fotos reales de celular en JPG de nuestras pruebas tenían coordenadas de GPS, {withCamera_wordf} indicaban el modelo de la cámara y {withDate_wordf} tenían la fecha y la hora en que se tomaron. Son fotos de prueba antiguas de un Google Pixel y de iPhones, y los datos seguían todos ahí.',
        'De nuestras {heicFiles} fotos HEIC de prueba, {heicWithGps} tenían coordenadas reales de GPS y las {heicWithCamera} indicaban la cámara. HEIC es el formato que usa el iPhone de forma predeterminada, y lleva el mismo tipo de datos que un JPG.',
      ],
    },
    {
      heading: 'Haz que la cámara no guarde la ubicación',
      paragraphs: [
        'Lo más seguro es no registrarla nunca. En un iPhone, los pasos de Apple son estos: ve a Configuración, luego a Privacidad y seguridad, luego a Localización, luego a Cámara, y toca Nunca. Apple aclara que los metadatos de ubicación de las fotos y los videos solo se recopilan si la app Cámara tiene acceso a Localización.',
        'En Android depende del teléfono. La ayuda de Google dice que puedes controlar si la cámara agrega datos de ubicación a las fotos, y da los pasos por separado para cada marca. En la app Cámara Pixel, los pasos de Google son abrir la configuración de la cámara, entrar en Más parámetros de configuración y desactivar Guardar ubicación.',
      ],
    },
    {
      heading: 'Comparte sin la ubicación desde el teléfono',
      paragraphs: [
        'En un iPhone puedes dejar fuera la ubicación cada vez que compartes. Los pasos de Apple: selecciona las fotos, toca el botón de compartir, elige Opciones y desactiva Ubicación. Arriba del botón Opciones aparece entonces Ubicación no incluida. Para una foto que ya está en la app Fotos, ábrela y toca Ajustar información, luego Ajustar ubicación y luego Sin ubicación.',
        'Google Fotos mantiene privadas las ubicaciones de forma predeterminada, según su centro de ayuda. Deja cambiar o quitar una ubicación aproximada, pero si la cámara agregó la ubicación de forma automática, Google dice que no puedes actualizarla ni quitarla en Google Fotos. Para esos archivos, quita los datos del propio archivo.',
      ],
    },
    {
      heading: 'Quita la ubicación del archivo sin cambiar la foto',
      paragraphs: [
        'Todas las herramientas de este sitio que escriben una imagen la escriben a partir de los píxeles, y eso deja atrás los metadatos. Pero casi todas cambian también la imagen: la comprimen, la recortan, la giran o cambian su formato. Así que medimos cuál cambia menos la foto, con una regla fijada antes de la medición: el mismo encuadre, el mismo formato y los píxeles más parecidos al original.',
        'Ganó Redimensionar imagen, con la opción {winnerOption}.Una foto que ya tiene el tamaño que pides no se decodifica ni se codifica de nuevo: la herramienta copia los datos de la imagen tal como están y deja fuera los metadatos. Nuestras fotos volvieron con píxeles idénticos, las {resizeImageIdenticalChromium_wordf}, y solo un {resizeImageRatioChromium_off} más ligeras, que es lo que pesaban los metadatos.',
      ],
    },
    {
      heading: 'Lo que hicieron las otras herramientas',
      paragraphs: [
        'Comprimir imagen también quitó la ubicación y dejó las fotos un {compressImageRatioChromium_off} más ligeras, pero porque las volvió a comprimir: su puntuación más baja en nuestras fotos fue de {compressImagePsnrMinChromium} de PSNR. El PSNR mide cuánto se parecen dos imágenes, y cuanto más sube, más se parecen. Sirve para enviar, no para guardar. Recortar imagen y Rotar imagen cambian el encuadre por diseño, y PNG a JPG convirtió las fotos en archivos PNG con {pngToJpgRatioChromium_times} el tamaño en Chromium y {pngToJpgRatioWebkit_times} en WebKit.',
        'Ninguna dejó coordenadas de GPS, nombres de cámara ni fechas en las fotos, y el PDF de Imagen a PDF tampoco llevaba GPS. La tabla de "Lo que medimos" muestra cada herramienta.',
      ],
    },
    {
      heading: 'Lo que queda, y lo que la foto todavía muestra',
      paragraphs: [
        'Dos cosas se quedan a propósito. Una foto guardada al revés conserva una pequeña etiqueta que indica dónde está arriba, para que no se vea girada, y {resizeImageOrientationChromium_wordf} de nuestras fotos la conservó. El perfil de color también se queda, para que los colores no cambien.',
        'Quitar los datos no oculta lo que hay en la imagen. La ayuda de Google advierte que otras personas pueden adivinar dónde se tomó una foto a partir de lo que muestra, como un punto de referencia. Mira la foto antes de compartirla.',
      ],
    },
    {
      heading: 'Para fotos HEIC',
      paragraphs: [
        'Redimensionar imagen acepta JPG, PNG y WebP. Para las fotos HEIC de un iPhone, usa HEIC a JPG: también escribe cada JPG a partir de los píxeles, y ninguna de nuestras fotos HEIC de prueba conservó datos GPS después de la conversión. Nuestra guía para convertir HEIC a JPG tiene esas mediciones.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'Lo que medimos',
  measuredIntro: 'Nuestras {photos_wordf} fotos reales de celular, pasadas por cada herramienta de imagen que acepta JPG, cada una con la opción que menos cambia la foto. El porcentaje es el tamaño después frente a los originales, y la columna de píxeles compara cada copia con el original en la peor de las fotos.',
  measuredNote: 'Medido el {date} con las herramientas de este sitio en Chromium {chromiumVersion} y en WebKit {webkitVersion} en {system}. Los dos navegadores escribieron archivos del mismo tamaño con {browsersSameSize_wordf} de las {candidates_wordf} herramientas; con {browsersDiffer}, los tamaños fueron distintos. Los metadatos y los píxeles se leyeron en Node, con el mismo decodificador para el original y la copia. La tabla muestra Chromium.',
  tables: [
    {
      heading: 'Cada herramienta con nuestras fotos',
      caption: 'Cada herramienta de imagen que acepta JPG: el tamaño después, el formato, si el encuadre queda igual, cuánto se parecen los píxeles en la peor foto y cuántas fotos conservaron datos GPS',
      head: ['Herramienta', 'Tamaño después', 'Formato', 'Mismo encuadre', 'Píxeles, peor foto', 'Fotos que conservaron GPS'],
    },
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    { id: 'apple-location', label: 'Soporte técnico de Apple: Administrar los metadatos de la ubicación en Fotos', href: 'https://support.apple.com/es-us/guide/personal-safety/ips0d7a5df82/web', read: '2026-11-03' },
    { id: 'google-photos-location', label: 'Ayuda de Google Fotos: Cómo entender, encontrar y editar las ubicaciones de tus fotos', href: 'https://support.google.com/photos/answer/6153599?hl=es-419&co=GENIE.Platform%3DAndroid', read: '2026-11-03' },
    { id: 'google-photos-privacy', label: 'Ayuda de Google Fotos: Cómo protege Google Fotos tus datos de ubicación', href: 'https://support.google.com/photos/answer/11190100?hl=es-419', read: '2026-11-03' },
    { id: 'google-camera-location', label: 'Ayuda de Google Fotos: Cómo cambiar la configuración de la ubicación de la cámara', href: 'https://support.google.com/photos/answer/9921876?hl=es-419', read: '2026-11-03' },
    { id: 'pixel-camera', label: 'Ayuda de Cámara Pixel: Cómo cambiar la configuración de la app de Cámara', href: 'https://support.google.com/pixelcamera/answer/2838995?hl=es-419', read: '2026-11-03' },
  ],
  facts: {},
  names: [],
  relatedHeading: 'Herramientas y guías relacionadas',
  measuredTerms: {
    'PNG to JPG': 'PNG a JPG',
    'By percentage, 100': 'Por porcentaje, 100 %',
  },
};

export default texts;
