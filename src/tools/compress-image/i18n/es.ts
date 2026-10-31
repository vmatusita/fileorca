import type { CompressImageTexts } from '../../../i18n/types.ts';

export default {
  title: 'Comprimir imagen en línea, sin subir archivos',
  description:
    'Comprime un JPG, PNG o WebP en tu navegador. El archivo se procesa en tu dispositivo, nunca se sube, y se eliminan los datos GPS de la foto.',
  h1: 'Comprimir imagen',
  fileFallback: 'imagen',
  drop: {
    title: 'Suelta una imagen aquí',
    choose: 'Elegir imagen',
    helpDesktop: 'o pégala con {kbd} · JPG, PNG o WebP, una a la vez',
    help: 'JPG, PNG o WebP, una a la vez',
    pasteKey: 'Ctrl V',
    over: 'Suéltalo, Oli está lista',
    overHelp: 'Una imagen',
    errorTitle: 'Uy, Oli no pudo leer este archivo',
    errorHelp: '{name} no es una imagen que Oli pueda leer. Prueba con un JPG o PNG.',
    chooseAnother: 'Elegir otro archivo',
  },
  options: {
    legend: 'Compresión',
    recommended: 'Recomendada',
    recommendedHelp: 'mejor equilibrio',
    strong: 'Fuerte',
    strongHelp: 'menor tamaño',
    pngNote: 'El PNG se guarda sin pérdida, así que el nivel solo cambia JPG y WebP.',
  },
  progress: {
    label: 'Comprimiendo la imagen',
    working: 'Oli se está encargando…',
  },
  result: {
    done: '¡Listo! Tu imagen quedó un {percent} más ligera.',
    unchanged: 'Esta imagen ya estaba optimizada, así que Oli conservó la imagen original, sin los metadatos de la foto.',
    cannotEncode: 'Este navegador no puede guardar archivos {format}, así que Oli conservó la imagen original, sin los metadatos de la foto.',
    placardLabel: 'más ligera',
    before: 'Antes',
    after: 'Después',
    size: 'Tamaño',
    download: 'Descargar',
    startOver: 'Empezar de nuevo',
    to: 'a',
    coffee: {
      text: 'Esta herramienta es gratis, sin límites y nunca sube tus archivos. Si te ahorró tiempo, un café ayuda a mantenerla así.',
      button: 'Invítame un café',
      hide: 'No mostrar de nuevo',
    },
  },
  next: { label: 'Siguiente:', moreTools: 'Más herramientas' },
  howHeading: 'Cómo funciona',
  howSteps: [
    'Suelta una imagen JPG, PNG o WebP en el cuadro, elígela o pégala.',
    'Oli vuelve a dibujar la imagen en tu navegador y la guarda de nuevo con la compresión que elegiste.',
    'Descarga la copia más ligera. Tu archivo original no se toca.',
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'La imagen se procesa en tu dispositivo y nunca se envía a un servidor. La copia guardada también omite los metadatos de la foto, incluida la ubicación GPS.',
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Mi imagen se sube a algún lugar?',
      a: 'No. La compresión ocurre en tu dispositivo, dentro del navegador. Abre la pestaña Red del navegador mientras comprimes: ninguna solicitud lleva tu archivo.',
    },
    {
      q: '¿Por qué el archivo quedó del mismo tamaño?',
      a: 'Algunas imágenes ya están bien comprimidas. Cuando la nueva copia no sería más pequeña, Oli te devuelve el original en lugar de un archivo más grande.',
    },
    {
      q: '¿Qué pasa con los datos de ubicación de mi foto?',
      a: 'La copia comprimida se guarda sin los metadatos de la foto, así que la ubicación GPS, el modelo de la cámara y la fecha quedan fuera.',
    },
  ],
} satisfies CompressImageTexts;
