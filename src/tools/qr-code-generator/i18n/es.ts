import type { QrPageTexts } from '../types.ts';

export default {
  title: 'Generador de códigos QR para enlaces y texto, en PNG o SVG',
  description:
    'Crea un código QR de un enlace o cualquier texto en tu navegador, con Oli en el centro o sin ella, y descárgalo en PNG o SVG. Gratis, sin cuenta y sin subidas.',
  h1: 'Generador de códigos QR',
  seal: 'Tu texto nunca sale de tu dispositivo',
  howHeading: 'Cómo crear un código QR',
  howSteps: [
    'Escribe o pega un enlace, o cualquier texto, en el cuadro. El código aparece mientras escribes.',
    'Elige si Oli va en el centro y el tamaño del PNG.',
    'Descarga el PNG para una pantalla o un documento, o el SVG para imprimir en cualquier tamaño.',
    'Escanea el código con la cámara de tu teléfono antes de compartirlo o imprimirlo.',
  ],
  specsHeading: 'Especificaciones',
  specs: {
    caption: 'Generador de códigos QR: qué acepta, qué crea y sus límites',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Acepta', 'Un enlace o cualquier texto, de hasta 1,273 caracteres. Cada letra con acento o tilde (como á, é o ñ) cuenta como 2, y cada emoji cuenta como 4, porque el código guarda el texto en bytes UTF-8.'],
      ['Corrección de errores', 'Nivel H, el más alto. El código se sigue leyendo con cerca del 30 % tapado, y eso es lo que deja lugar para Oli en el centro.'],
      ['Oli en el centro', 'Viene activada. El ícono de FileOrca va en un cuadro blanco de cerca del 22 % del ancho del código. Desactiva la opción para tener un código simple.'],
      ['PNG', 'En tres tamaños: unos 512 píxeles de ancho el pequeño, 1,024 el mediano y 2,048 el grande. Cada cuadrito del código recibe un número entero de píxeles, al menos 4, así que el tamaño real aparece debajo de cada opción.'],
      ['SVG', 'Un archivo vectorial con los mismos cuadritos y la misma Oli. Se ve nítido en cualquier tamaño, desde una tarjeta de presentación hasta un póster.'],
      ['Colores', 'Cuadritos negros sobre fondo blanco, con un margen blanco de 4 cuadritos alrededor, como pide el estándar de los códigos QR.'],
      ['Nombres de los archivos', 'Siempre codigo-qr.png y codigo-qr.svg, nunca tu texto.'],
      ['Tipo de código', 'Un código estático: guarda tu texto tal cual, sin enlace acortado, sin rastreo y sin fecha de vencimiento. Un texto nuevo necesita un código nuevo.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Estos códigos QR vencen?',
      a: 'No. El código guarda tu enlace o tu texto tal cual, no un enlace acortado que pasa por un servidor, así que nadie puede desactivarlo después. Funciona mientras funcione el enlace que lleva dentro.',
    },
    {
      q: '¿Puedo cambiar el enlace después de imprimir el código?',
      a: 'No. Un código que guarda el enlace tal cual no se puede cambiar. Crea un código nuevo con el enlace nuevo e imprime ese.',
    },
    {
      q: '¿El código se puede escanear con Oli en el centro?',
      a: 'Sí. El código usa la corrección de errores H, la más alta, que reconstruye la parte que queda debajo del ícono. En nuestras pruebas, los códigos de todos los tamaños se volvieron a leer con Oli en el centro. Escanea el tuyo antes de imprimirlo y, para una impresión muy pequeña, desactiva la opción de Oli.',
    },
    {
      q: '¿Por qué un texto largo crea un código más denso?',
      a: 'Un código QR crece según lo que guarda. Un enlace corto como https://fileorca.com/es/ cabe en una cuadrícula de 29 cuadritos por lado, y el texto más largo ocupa 177. Menos cuadritos significan cuadritos más grandes, que una cámara lee desde más lejos.',
    },
    {
      q: '¿Descargo el PNG o el SVG?',
      a: 'El PNG sirve para una pantalla, una presentación o un documento. El SVG sirve para imprimir y para programas de diseño, porque se ve nítido en cualquier tamaño.',
    },
    {
      q: '¿Puedo usar el código en productos o en mi negocio?',
      a: 'Sí. El código es tuyo para usarlo donde quieras, gratis, sin marca de agua y sin tener que dar crédito.',
    },
    {
      q: '¿FileOrca ve lo que escribo?',
      a: 'No. El código se crea en tu navegador. Tu texto no se agrega a la dirección de la página, no va en ningún evento de analítica, no se guarda en una cookie ni en el almacenamiento del navegador y no se usa como nombre de archivo. FileOrca nunca abre el enlace que escribes.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tu texto se queda en tu dispositivo. El código se crea en tu navegador, y el texto nunca va a la dirección de la página, a un evento de analítica, a una cookie, al almacenamiento del navegador ni al nombre del archivo. FileOrca nunca abre el enlace que escribes ni le hace ninguna solicitud.',
  relatedHeading: 'Más herramientas',
  panel: {
    file: 'codigo-qr',
    field: {
      label: 'Enlace o texto',
      placeholder: 'https://fileorca.com',
      help: 'Hasta {max} caracteres. Cada letra con acento o tilde (como á, é o ñ) cuenta como 2, y cada emoji cuenta como 4.',
      count: '{count} de {max}',
    },
    oli: { legend: 'Oli en el centro', on: 'Activada', off: 'Desactivada' },
    size: {
      legend: 'Tamaño del PNG',
      small: 'Chico',
      medium: 'Mediano',
      large: 'Grande',
      px: '{side} px',
      note: 'Cada cuadrito del código recibe píxeles enteros, así sus bordes se ven nítidos.',
    },
    preview: {
      label: 'Vista previa de tu código QR',
      empty: 'Tu código QR aparece aquí mientras escribes.',
      ready: 'Tu código QR está listo para descargar.',
    },
    download: { png: 'Descargar PNG', svg: 'Descargar SVG', pngMeta: '{side} × {side} px' },
    errors: {
      empty: 'Uy, todavía no hay nada para poner en el código. Escribe un enlace o un texto.',
      long: 'Uy, este texto pasa de {max} caracteres, el máximo de un código QR. Cada letra con acento o tilde (como á, é o ñ) cuenta como 2, y cada emoji cuenta como 4. Acorta el texto para seguir.',
      png: 'Uy, Oli no pudo crear el PNG. Prueba con un tamaño más pequeño o descarga el SVG.',
    },
  },
} satisfies QrPageTexts;
