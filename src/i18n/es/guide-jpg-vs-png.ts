import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'JPG o PNG: cuál usar, medido con las mismas fotos',
  description: 'Cuándo guardar en JPG y cuándo en PNG, con los tamaños que medimos en las mismas fotos en los dos formatos y lo que le pasa a una imagen transparente.',
  h1: 'JPG o PNG: cuál usar',
  lead: 'Los dos formatos se abren en todas partes, así que la elección depende de lo que muestra la imagen. Aquí está la regla y lo que medimos cuando las mismas fotos hicieron el viaje de ida y vuelta.',
  changed: 'Primera versión de esta guía, publicada el {published} con las mediciones del {measured}.',
  intro: [
    'La respuesta corta: las fotos van en JPG y los gráficos van en PNG. Las capturas de pantalla, los logotipos, los diagramas, el texto y todo lo que tenga fondo transparente son gráficos. Una foto de una cámara o de un teléfono es una foto, aunque muestre un documento.',
    'La respuesta larga tiene que ver con lo que guarda cada formato. Uno se mantiene pequeño porque descarta detalle que casi no vas a notar; el otro conserva cada píxel tal cual y lo paga en tamaño. Cuál te conviene depende de la imagen y de lo que vaya a pasar con ella después.',
  ],
  toolHeading: 'Cambia entre PNG y JPG aquí',
  toolIntro: 'Suelta un PNG y se vuelve JPG; suelta un JPG y se vuelve PNG. Cada archivo se convierte en esta pestaña del navegador, así que nada se sube, y un lote llega en un solo ZIP.',
  sections: [
    {
      heading: 'Cómo guarda la imagen cada formato',
      paragraphs: [
        'PNG es sin pérdida. Su especificación, publicada por el W3C, dice que la compresión debe conservar toda la información, y admite un canal alfa opcional, que es donde se guarda la transparencia. Un PNG que se abre y se vuelve a guardar es la misma imagen, píxel por píxel.',
        'JPG es con pérdida. El comité JPEG lo describe como un formato de imagen con pérdida basado en la DCT: divide la imagen en bloques pequeños, conserva las formas y los colores generales de cada uno y descarta el detalle fino que el ojo nota menos. Por eso una foto es mucho más pequeña en JPG, y por eso los bordes nítidos y los colores planos pueden mostrar pequeñas manchas a su alrededor.',
      ],
    },
    {
      heading: 'Una foto guardada como PNG es más grande, no mejor',
      paragraphs: [
        'Tomamos nuestras {photos_wordf} fotos reales de celular, que salieron de las cámaras como JPG, y las guardamos como PNG con la herramienta de arriba. Juntos, los JPG pesaban {jpgTotal}. En PNG pesaron {pngTotalChromium} en Chromium, {pngRatioChromium_times} lo que pesaban los JPG.',
        'Los PNG no se veían mejor. Cada uno tenía exactamente los mismos píxeles que el JPG del que salió: los comparamos píxel por píxel, y {pngIdenticalChromium_word} de ellos eran idénticos. Un PNG no puede recuperar el detalle que la cámara ya descartó al escribir el JPG. Solo guarda lo que queda, sin perder más.',
      ],
    },
    {
      heading: 'Los navegadores escriben el PNG de forma distinta',
      paragraphs: [
        'Las mismas fotos guardadas como PNG en WebKit pesaron {pngTotalWebkit}, {pngRatioWebkit_times} lo que pesaban los JPG, frente a {pngRatioChromium_times} en Chromium. Los PNG de los dos navegadores tienen exactamente los mismos píxeles. La diferencia está solo en cuánto se esfuerza cada navegador para comprimirlos, y eso muestra que dos PNG de una misma imagen pueden pesar muy distinto y seguir siendo la misma imagen.',
      ],
    },
    {
      heading: 'De vuelta a JPG: cerca, pero no igual',
      paragraphs: [
        'Después guardamos esos PNG otra vez como JPG. Los JPG nuevos pesaron {backTotalChromium}, menos que los originales de las cámaras, porque la herramienta guarda con alta calidad, pero no tan alta como la de las cámaras.',
        'No son los archivos originales, ni del todo las imágenes originales. Medido contra los píxeles originales, el viaje de ida y vuelta dio entre {backPsnrMinChromium} y {backPsnrMaxChromium} de PSNR, una medida de cuánto se parecen dos imágenes. A ese nivel, las diferencias son muy difíciles de ver, pero cada vez que guardas con pérdida se suma un poco más. Conserva tus originales y convierte a partir de ellos.',
      ],
    },
    {
      heading: 'La transparencia decide',
      paragraphs: [
        'JPG no tiene transparencia. Nuestro PNG de prueba tiene esquinas transparentes, {transparentCornersBefore_wordf} en total, y en el JPG las {transparentCornersWhiteChromium_wordf} quedaron blancas, como te avisa la herramienta junto al archivo. El archivo pasó de {transparentPngBytes} a {transparentJpgBytesChromium}.',
        'Eso está bien para una imagen que va sobre una página blanca, y mal para un logotipo que tiene que ir sobre un fondo de color o encima de una foto. Si una imagen tiene una transparencia que quieres conservar, déjala en PNG.',
      ],
    },
    {
      heading: 'Una regla para recordar',
      paragraphs: [
        'Usa JPG para las fotos que compartes, envías por correo o subes, sobre todo cuando el tamaño importa. Usa PNG para capturas de pantalla, texto, logotipos, íconos y todo lo que tenga transparencia, y para una imagen que vas a editar una y otra vez, porque cada vez que guardas un JPG se pierde un poco.',
        'Cuando un sitio no acepta tu PNG, o una foto en PNG pesa demasiado para enviarla, conviértela a JPG. Cuando necesitas que un gráfico siga nítido, no lo conviertas a JPG.',
      ],
    },
    {
      heading: '¿Y WebP?',
      paragraphs: [
        'WebP puede hacer los dos trabajos. Google lo describe como un formato con compresión con pérdida, como JPG, y con compresión sin pérdida y transparencia, como PNG. Los sitios web lo usan porque pesa poco. Se abre en los navegadores, pero algunas apps y formularios todavía lo rechazan; nuestra guía sobre WebP explica dónde se abre y cómo guardarlo como JPG.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'Lo que medimos',
  sheet: {
    stats: [
      { label: 'Nuestras fotos en PNG, en total', value: '{pngRatioChromium_times}', from: '{jpgTotal}', to: '{pngTotalChromium}' },
      { label: 'PNG con los mismos píxeles que el JPG', value: '{pngIdenticalChromium} de {photos}' },
    ],
    sample: '{photos} fotos de celular, de JPG a PNG y de vuelta.',
    link: 'Mira la tabla',
  },
  tableHeading: 'Foto por foto',
  measuredIntro: 'Nuestras {photos_wordf} fotos reales de celular, del JPG de la cámara a PNG con la herramienta de arriba, y de vuelta a JPG. La última columna compara el JPG final con los píxeles originales.',
  measuredNote: 'Medido el {date} con la herramienta PNG a JPG de este sitio en Chromium {chromiumVersion} y en WebKit {webkitVersion} en {system}. Los píxeles se compararon en Node, con el mismo decodificador para el original y la copia. Los tamaños de vuelta a JPG fueron iguales en los dos navegadores.',
  tables: [
    {
      heading: 'Las mismas fotos en los dos formatos',
      caption: 'Cada foto: el JPG de la cámara, el PNG hecho a partir de él en Chromium y en WebKit, el JPG hecho de nuevo a partir del PNG y cuánto se parece ese JPG al original',
      head: ['Foto', 'JPG', 'PNG en Chromium', 'PNG en WebKit', 'De vuelta a JPG', 'Frente al original'],
    },
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    { id: 'w3c-png', label: 'W3C: Especificación del formato PNG (en inglés)', href: 'https://www.w3.org/TR/png-3/', read: '2026-11-03' },
    { id: 'google-webp', label: 'Google for Developers: Un formato de imagen para la Web', href: 'https://developers.google.com/speed/webp?hl=es-419', read: '2026-11-03' },
    { id: 'jpeg-org', label: 'Comité JPEG: JPEG 1 (en inglés)', href: 'https://jpeg.org/jpeg/', read: '2026-11-03' },
  ],
  facts: {},
  names: ['W3C', 'JPEG 1'],
  relatedHeading: 'Herramientas y guías relacionadas',
};

export default texts;
