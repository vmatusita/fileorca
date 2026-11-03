import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Cómo unir PDF en el celular, en un iPhone o en Android',
  description: 'Las formas de juntar varios PDF en uno solo en un iPhone o en un celular Android, cuánto pesa el archivo unido y qué conserva de cada PDF.',
  h1: 'Cómo unir PDF en el celular',
  lead: 'Tienes algunos PDF en el celular y necesitas enviarlos como uno solo. Estas son las formas de hacerlo ahí mismo, sin computadora, y lo que puedes esperar del resultado.',
  changed: 'Primera versión, con las mediciones del {date}.',
  intro: [
    'Formularios, recibos, una página firmada y el escaneo de una identificación pueden llegar como PDF separados, y el lugar al que tienes que enviarlos acepta un solo archivo. En una computadora hay muchas formas de juntarlos. En un celular hay menos, y dependen del teléfono.',
    'Esta guía cubre la forma que Apple documenta para el iPhone, la forma que funciona en el navegador de cualquier celular y lo que medimos al unir {pairs_word} pares de nuestros PDF de prueba.',
  ],
  toolHeading: 'Une tus PDF aquí',
  toolIntro: 'Elige dos o más PDF de tu celular, arrástralos al orden que quieras y toca el botón. Se unen en esta pestaña del navegador, en el propio celular, y no se sube nada.',
  sections: [
    {
      heading: 'En un iPhone, con Vista Previa',
      paragraphs: [
        'El Manual de uso del iPhone de Apple explica cómo agregar páginas a un PDF en la app Vista Previa: abre el PDF, mantén presionada una miniatura de página y toca Insertar desde archivo para traer otro PDF o una imagen. Para cambiar el orden, mantén presionada una miniatura y arrástrala por encima o por debajo de otra.',
        'Esto funciona bien para agregar un archivo a otro. Para varios archivos, repites la inserción con cada uno, y el resultado es el PDF del que partiste con las páginas nuevas agregadas.',
      ],
    },
    {
      heading: 'En un celular Android',
      paragraphs: [
        'La ayuda de Google para la app de Google Drive explica cómo escanear papel a un PDF: escaneas una página, presionas Agregar para escanear otra y guardas el resultado como PDF. Es una buena forma de convertir varias hojas de papel en un solo archivo, pero crea un PDF nuevo con la cámara. No une los PDF que ya tienes en el teléfono.',
        'Para los archivos que ya son PDF, el navegador es el lugar más simple para hacerlo en Android, con la herramienta de esta página.',
      ],
    },
    {
      heading: 'En cualquier celular, en el navegador',
      paragraphs: [
        'Unir PDF, en esta página, funciona en el navegador del celular, así que hace lo mismo en un iPhone y en un teléfono Android. Toca para elegir los archivos, desde la app Archivos en el iPhone o desde tus descargas en Android, ponlos en orden y toca el botón. El PDF unido se descarga como cualquier otro archivo.',
        'Los archivos no se suben a ningún servidor: el celular hace el trabajo, así que los documentos privados se quedan en él.',
      ],
    },
    {
      heading: 'Cuánto pesa el archivo unido',
      paragraphs: [
        'Unimos {pairs} pares de nuestros PDF de prueba y comparamos cada archivo unido con los dos archivos de los que salió. El archivo unido nunca pesó más que los dos juntos, y salió más pequeño en {smaller} de los {pairs} pares, aunque por márgenes muy distintos.',
        'Nuestro PDF de fotos con la página de libro escaneada, y el informe de la NASA escaneado con esa misma página, quedaron justo por debajo de la suma de sus tamaños: {photosScanMerged_exact} contra {photosScanInputs_exact}, y {reportScanMerged_exact} contra {reportScanInputs_exact}. Un PDF tiene algo de estructura alrededor de sus páginas, y el archivo unido necesita esa estructura una vez en lugar de dos; las imágenes quedan como estaban. Los apuntes de clase con el formulario del IRS salieron un {bookFormRatio_off} más pequeños.',
      ],
    },
    {
      heading: 'Cuando el archivo unido es claramente más pequeño',
      paragraphs: [
        'La unión de la página de libro escaneada con el formulario del IRS salió un {scanFormRatio_off} más pequeña que los dos archivos juntos. El formulario lleva una segunda descripción de sí mismo, en un formato llamado XFA, que solo leen algunos programas, y Unir PDF la deja fuera; el resultado te lo avisa junto al archivo. Los campos del formulario se conservan, así que el formulario se puede seguir llenando. Nuestro PDF con páginas de tamaños distintos y nuestro PDF con enlaces y acciones salieron un {mixedActionsRatio_off} más pequeños juntos: nuestro script de prueba los escribió sin empaquetar su estructura, y el archivo unido se escribe empaquetado.',
        'No se descarta nada más a propósito. Los marcadores y los enlaces se mantienen, y a un campo cuyo nombre ya existe en otro archivo se le agrega un número para que ambos sigan funcionando.',
      ],
    },
    {
      heading: 'Antes de unir',
      paragraphs: [
        'Pon los archivos en el orden en que quien los reciba debe verlos, y quita antes las páginas que no hacen falta: un PDF unido es más fácil de revisar que de arreglar. Un PDF que pide contraseña tiene que guardarse sin ella antes de unirlo, y eso lo hace Desbloquear PDF; Unir PDF te dice qué archivo está bloqueado.',
        'Si el archivo unido pesa demasiado para enviarlo, comprímelo después. Unir no hace más ligeros los archivos por sí mismo, aparte del ahorro que viste arriba.',
      ],
    },
    {
      heading: 'Cómo enviar el PDF unido',
      paragraphs: [
        'Una cuenta personal de Gmail envía archivos adjuntos de hasta {gmailLimit}; por encima de eso, Gmail convierte el adjunto en un vínculo de Google Drive. Si tu PDF unido está cerca del límite, Comprimir PDF puede dejarlo por debajo. En las mediciones de nuestra guía sobre los PDF pesados, dejó mucho más ligeros un PDF de fotos y una página escaneada a color, y apenas un poco más ligero un escaneo en blanco y negro; esa guía muestra cada nivel en cada archivo.',
        'Revisa el archivo unido antes de enviarlo: ábrelo, recorre todas las páginas y confirma que el orden es el correcto. Es rápido, y es mucho más fácil que explicar después una página que falta.',
      ],
    },
  ],
  half: 4,
  measuredHeading: 'Lo que medimos',
  measuredIntro: 'Unimos {pairs_word} pares formados con {pdfs_word} PDF de nuestras pruebas, en el orden que se muestra. El cambio compara el archivo unido con los dos archivos juntos.',
  measuredNote: 'Medido el {date} en Node con el motor de este sitio, que da los mismos bytes que el navegador, sobre pares de los PDF de nuestras pruebas.',
  tables: [
    {
      heading: 'Pares unidos',
      caption: 'Cada par de PDF: los dos archivos juntos, el archivo unido y el cambio',
      head: ['Archivos', 'Juntos', 'Unido', 'Cambio'],
    },
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    { id: 'google-drive-scan', label: 'Ayuda de Drive: Cómo escanear documentos con Google Drive (Android)', href: 'https://support.google.com/drive/answer/3145835?hl=es-419&co=GENIE.Platform%3DAndroid', read: '2026-11-03' },
    { id: 'gmail', label: 'Ayuda de Gmail: Cómo enviar archivos adjuntos en un mensaje de Gmail', href: 'https://support.google.com/mail/answer/6584?hl=es-419', read: '2026-11-03' },
    { id: 'apple-preview', label: 'Manual de uso del iPhone: Agregar, eliminar, girar, transferir o recortar páginas de archivos PDF en Vista Previa en el iPhone', href: 'https://support.apple.com/es-us/guide/iphone/iphbf4977cff/ios', read: '2026-11-03' },
    { id: 'apple-files', label: 'Soporte técnico de Apple: Buscar archivos en el iPhone o iPad', href: 'https://support.apple.com/es-lamr/102570', read: '2026-11-03' },
  ],
  facts: {
    gmailLimit: { text: '25 MB', source: 'gmail' },
  },
  names: [],
  relatedHeading: 'Herramientas y guías relacionadas',
};

export default texts;
