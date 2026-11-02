import type { ImageToolsTexts } from '../types.ts';

export default {
  title: 'Herramientas de imagen: ocho gratis, sin subir archivos',
  description:
    'Comprime, redimensiona, recorta, rota, convierte y pasa imágenes a PDF. Ocho herramientas de imagen gratis en tu navegador, sin subir nada ni crear cuenta.',
  eyebrow: 'Herramientas de imagen',
  h1: 'Ocho herramientas de imagen, sin subir nada',
  intro: 'Ocho herramientas para comprimir, redimensionar, recortar, rotar, convertir y combinar imágenes, todo en tu navegador y sin subir nada.',
  toolsHeading: 'Todas las herramientas de imagen',
  presetsHeading: 'Tamaños y límites comunes',
  presetsCaption: 'Ajustes predefinidos para tamaños comunes y límites de archivo',
  presetsHead: ['Ajuste predefinido', 'Qué obtienes'],
  guideHeading: '¿Qué herramienta necesitas?',
  guideIntro:
    'Todas las herramientas funcionan igual. Sueltas una imagen o un lote entero, Oli procesa cada archivo en tu dispositivo, y descargas los resultados uno por uno o juntos en un ZIP. No se sube nada, así que el tamaño de un lote depende solo de tu dispositivo.',
  guide: [
    { before: 'Un formulario o un correo rechaza una foto grande:', tool: 'compress-image', after: 'hace que el archivo pese menos, y los ajustes predefinidos de arriba apuntan a 100 KB o 1 MB.' },
    { before: 'Un sitio pide dimensiones exactas:', tool: 'resize-image', after: 'fija el ancho y el alto en píxeles o por porcentaje.' },
    { before: 'Solo importa una parte de la imagen:', tool: 'crop-image', after: 'conserva esa parte, en cuadrado, 4:5, 16:9 o en forma libre.' },
    { before: 'Una foto salió de lado:', tool: 'rotate-image', after: 'la gira 90° o 180°, o la refleja.' },
    { before: 'Una foto del iPhone no se abre en tu computadora:', tool: 'heic-to-jpg', after: 'convierte el archivo HEIC en un JPG o un PNG.' },
    { before: 'Una imagen WebP tiene que ser un JPG o un PNG:', tool: 'webp-to-jpg', after: 'la convierte.' },
    { before: 'Un PNG tiene que ser un JPG, o un JPG un PNG:', tool: 'png-to-jpg', after: 'lo convierte en cualquiera de los dos sentidos.' },
    { before: 'Varias imágenes tienen que ir en un solo documento:', tool: 'image-to-pdf', after: 'las pone en un solo PDF, una imagen por página.' },
  ],
  guideOutro:
    'Además, cada herramienta deja los metadatos de la foto fuera de la copia que descargas, así que la ubicación GPS de una foto del teléfono se queda contigo.',
} satisfies ImageToolsTexts;
