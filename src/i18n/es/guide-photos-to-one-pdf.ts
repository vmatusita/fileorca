import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Cómo convertir fotos en un solo PDF que pese poco para enviarlo',
  description: 'Cómo juntar varias fotos en un solo PDF en el celular o en la computadora, cuánto pesa ese PDF y qué cambia si comprimes las fotos antes.',
  h1: 'Cómo convertir fotos en un solo PDF',
  lead: 'Recibos, páginas de un contrato, unas fotos para un formulario: un solo PDF es más fácil de enviar y de imprimir que un montón de imágenes. Aquí ves cómo hacerlo y cuánto llega a pesar.',
  changed: 'Primera versión, con las mediciones del {date}.',
  intro: [
    'Un PDF de fotos las mantiene en orden, imprime cada una en su propia página y se abre en cualquier computadora o teléfono. Muchos formularios y oficinas piden justo eso: un solo PDF, no un grupo de imágenes.',
    'El problema es el tamaño. En un solo PDF, nuestras {photos_wordf} fotos de celular dieron un archivo que pesaba el {pdfRatioChromium} de lo que pesaban las propias fotos. Medimos qué pasa con el tamaño, con y sin comprimir antes las fotos.',
  ],
  toolHeading: 'Convierte tus fotos en un solo PDF aquí',
  toolIntro: 'Suelta tus fotos en el orden que quieras, o arrástralas para ordenarlas. Cada una se vuelve una página, el PDF se crea en esta pestaña del navegador y nada se sube.',
  sections: [
    {
      heading: 'En un iPhone',
      paragraphs: [
        'La app Vista Previa del iPhone puede exportar una imagen como PDF, y Apple indica que también puede comprimir el archivo. Para agregar más fotos, el manual de Apple explica cómo insertar una imagen en un PDF: mantén presionada la miniatura de una página y toca Insertar desde archivo. Así se arma un PDF de fotos, una inserción a la vez.',
      ],
    },
    {
      heading: 'En una computadora',
      paragraphs: [
        'Windows incluye una impresora llamada Microsoft Print To PDF, que Microsoft describe como parte de Windows 10 y Windows 11. Desde una app que imprima tus fotos, elígela en la lista de impresoras y las páginas se guardan como PDF en lugar de imprimirse. El tamaño de página y los márgenes salen de la configuración de impresión, así que revísalos antes de guardar.',
        'La herramienta de esta página funciona igual en una computadora y en un teléfono, en el navegador: suelta las fotos, elige el tamaño de página si necesitas Carta o A4 y descarga un solo PDF.',
      ],
    },
    {
      heading: 'Lo que hace la herramienta con cada foto',
      paragraphs: [
        'De forma predeterminada, cada página tiene el tamaño de su foto, así que no se recorta nada ni se agrega un borde blanco. También puedes elegir Carta o A4, y entonces cada foto queda en la página con un margen. Las fotos se escriben en el PDF como JPG de alta calidad; una imagen con transparencia entra como PNG, para que las partes transparentes sigan transparentes.',
        'Cada foto se escribe de nuevo a partir de sus píxeles. Eso es lo que deja la ubicación y los datos de la cámara fuera del PDF: nuestro PDF llevaba {pdfGpsChromium_word} datos GPS, aunque todas las fotos que pusimos los tenían.',
      ],
    },
    {
      heading: 'Cuánto pesa el PDF',
      paragraphs: [
        'Nuestras {photos_wordf} fotos reales de celular pesaban {photosTotal} en total. Puestas directamente en un solo PDF, dieron un archivo de {pdfChromium}, es decir, el {pdfRatioChromium} de lo que pesaban las fotos. Casi todo ese peso son las propias fotos: las imágenes dentro del PDF pesaban {pdfImagesChromium}.',
        'El PDF salió un poco más ligero que las fotos solo porque la herramienta guarda las imágenes con su propia calidad, un poco más baja que la que usaron las cámaras de los teléfonos. No es una compresión en ningún sentido real.',
      ],
    },
    {
      heading: 'Comprime antes las fotos',
      paragraphs: [
        'Después pasamos las mismas fotos primero por Comprimir imagen, en el nivel Recomendada. Salieron con {compressedChromium}, un {compressedRatioChromium_off} más ligeras que los originales. Convertidas en un solo PDF, dieron un archivo de {pdfAfterChromium}, el {pdfAfterRatioChromium} de lo que pesaban las fotos originales.',
        'Ese PDF todavía pesa un {pdfAfterVsCompressedChromium_more} más que las fotos comprimidas de las que salió. La razón es el paso de arriba: Imagen a PDF escribe cada foto de nuevo con su propia calidad alta, y eso se lleva parte del ahorro. El orden igual vale la pena, pero si el PDF tiene que ser lo más pequeño posible, comprime también el PDF terminado.',
      ],
    },
    {
      heading: 'Fotos de documentos',
      paragraphs: [
        'Cuando las fotos son de papel, un poco de cuidado antes del PDF da un archivo mejor. Recorta cada foto a la hoja, para que la mesa, el piso y tus dedos queden fuera, y gira cualquier foto que haya salido de lado. Recortar imagen y Rotar imagen hacen las dos cosas en el navegador, antes de que las fotos entren al PDF.',
        'Toma las fotos con buena luz y justo desde arriba. Una foto nítida de una página se lee bien con un tamaño mucho menor que una borrosa, así que también se comprime mejor.',
      ],
    },
    {
      heading: 'Fotos de un iPhone',
      paragraphs: [
        'Imagen a PDF acepta JPG, PNG y WebP. Un iPhone guarda las fotos en HEIC de forma predeterminada, así que primero conviértelas en JPG con HEIC a JPG y luego pon los JPG en un solo PDF. Nuestra guía para convertir HEIC a JPG explica los formatos y los ajustes que evitan el HEIC por completo.',
      ],
    },
    {
      heading: 'Una rutina corta',
      paragraphs: [
        'Pon las fotos en orden, comprímelas si el PDF se va a enviar por correo y luego conviértelas en un solo PDF. Si todavía pesa demasiado, pásalo por Comprimir PDF: nuestra guía sobre los PDF que pesan mucho muestra lo que hace cada modo con un PDF de fotos.',
        'Guarda las fotos originales. El PDF es para enviar e imprimir; las fotos son la copia a la que siempre puedes volver.',
      ],
    },
  ],
  half: 4,
  measuredHeading: 'Lo que medimos',
  measuredIntro: 'Nuestras {photos_wordf} fotos reales de celular, directo a un solo PDF, y otra vez después de Comprimir imagen. El porcentaje es frente a las fotos originales.',
  measuredNote: 'Medido el {date} con las herramientas Imagen a PDF y Comprimir imagen de este sitio en Chromium {chromiumVersion} y en WebKit {webkitVersion} en {system}, que dieron los mismos tamaños, sobre nuestras fotos reales de celular con los ajustes predeterminados. Las imágenes dentro del PDF se contaron con pdf-lib.',
  tables: [
    {
      heading: 'Las fotos y el PDF',
      caption: 'Cada paso: las fotos originales, el PDF hecho con ellas, las fotos después de Comprimir imagen y el PDF hecho con esas fotos, con el porcentaje del tamaño original',
      head: ['Paso', 'Tamaño', 'De las fotos originales'],
      labels: ['Las fotos originales', 'Un PDF con las fotos', 'Las fotos después de Comprimir imagen', 'Un PDF con las fotos comprimidas'],
    },
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    { id: 'apple-preview-export', label: 'Manual de uso del iPhone: Exportar o comprimir PDF e imágenes en Vista Previa en el iPhone', href: 'https://support.apple.com/es-us/guide/iphone/iph61c20afe1/ios', read: '2026-11-03' },
    { id: 'apple-preview-pages', label: 'Manual de uso del iPhone: Agregar, eliminar, girar, transferir o recortar páginas de archivos PDF en Vista Previa en el iPhone', href: 'https://support.apple.com/es-us/guide/iphone/iphbf4977cff/ios', read: '2026-11-03' },
    { id: 'ms-print-to-pdf', label: 'Soporte de Microsoft: Guardar un mensaje de Outlook como archivo .eml, PDF o borrador', href: 'https://support.microsoft.com/es-es/outlook/mail/save-an-outlook-message-as-a-eml-file-a-pdf-file-or-as-a-draft', read: '2026-11-03' },
  ],
  facts: {},
  names: ['Windows 10', 'Windows 11', 'A4'],
  relatedHeading: 'Herramientas y guías relacionadas',
};

export default texts;
