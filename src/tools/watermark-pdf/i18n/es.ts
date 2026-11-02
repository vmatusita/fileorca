import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { WatermarkTexts } from '../../pdf/option-texts.ts';

// Watermark PDF page blocks (data-content: how, specs, faq, privacy, related) and the panel bits the shared PDF island
// shows, in Spanish (docs/i18n/es.md). The specs rows state the real behaviour of the engine
// (src/engine/pdf/operations.ts), as the English file does. The default mark is written into the PDF, so it stays in
// WinAnsi; the percents take a no-break space before "%", as Spanish writes them.
const texts: PdfToolTexts<WatermarkTexts> = {
  title: 'Marca de agua en PDF: agrega un texto a tus páginas en tu navegador',
  description:
    'Estampa una marca de agua de texto, como CONFIDENCIAL, en cada página de tus PDF. Elige el tamaño, la opacidad y la dirección. Nada sale de tu dispositivo.',
  h1: 'Marca de agua en PDF',
  howHeading: 'Cómo funciona',
  howSteps: [
    'Suelta tus PDF en el cuadro, elígelos o pégalos, todos los que quieras.',
    'Escribe el texto de la marca de agua y elige su tamaño, qué tan fuerte se ve y si va en diagonal o en horizontal.',
    'Presiona Agregar marca de agua para que Oli estampe el texto en cada página en tu navegador, y descarga un PDF o todos juntos en un ZIP.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Marca de agua en PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Archivos', 'Archivos PDF, todos los que quieras. Oli revisa lo que hay dentro de cada archivo, no su nombre. Varios resultados se descargan juntos en un ZIP.'],
      ['Tipo de marca', 'Solo texto. Esta herramienta no agrega marcas de agua con imágenes.'],
      ['Dónde va', 'En el centro de cada página, en gris. La posición sigue la página tal como se ve en pantalla, con su recorte y su rotación.'],
      ['Tamaño', 'Pequeño, Mediano o Grande: el texto ocupa cerca del 35 %, 55 % u 80 % de la diagonal de la página, o del ancho de la página cuando la marca es horizontal. Una palabra corta nunca supera un tercio de la altura de la página.'],
      ['Opacidad', 'Suave es 15 %, Media es 30 % (la predeterminada) y Fuerte es 50 %. Cuanto más suave es la marca, más fácil se lee la página debajo.'],
      ['Dirección', 'Diagonal va a 45° en la pantalla. Horizontal cruza la página en línea recta.'],
      ['Fuente y caracteres', 'Helvetica Bold. Funcionan las letras del alfabeto latino básico y los acentos comunes. Los demás caracteres quedan fuera de la marca, y la ayuda debajo del campo de texto te avisa.'],
      ['Cómo se agrega', 'La marca se dibuja en la página misma, no en una capa que se quita con un clic. Alguien con un editor de PDF todavía puede quitarla, así que una marca de agua identifica un archivo, pero no lo bloquea.'],
      ['Lo que se conserva', 'Los campos de formulario, los enlaces, los marcadores y las propiedades del documento quedan como estaban. Solo se quita la capa de formulario XFA, que la mayoría de las aplicaciones de PDF no puede leer; los campos de formulario normales siguen funcionando.'],
      ['PDF protegidos', 'Un PDF con contraseña para abrirlo, o con restricciones, se rechaza con un enlace a Desbloquear PDF. Tus archivos originales nunca cambian.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Puedo usar una imagen o un logo como marca de agua?',
      a: 'Aquí no. Esta herramienta solo agrega una marca de agua de texto, como CONFIDENCIAL, BORRADOR o un nombre. Si necesitas un logo en cada página, usa un editor de PDF.',
    },
    {
      q: '¿Alguien puede quitar la marca de agua?',
      a: 'La marca se dibuja en el contenido de cada página, así que no sale con un solo clic como una capa aparte. Alguien con un editor de PDF todavía puede quitarla. Si lo que quieres es impedir que abran el archivo, ponle una contraseña.',
    },
    {
      q: '¿Por qué faltan algunos caracteres en mi marca de agua?',
      a: 'Oli dibuja la marca en Helvetica Bold, que cubre el alfabeto latino básico y las letras con acentos comunes. Los demás caracteres, como las letras cirílicas, griegas o chinas, quedan fuera, y la ayuda debajo del campo de texto te avisa cuando pasa. Si no queda nada para dibujar, Oli te pide otro texto.',
    },
    {
      q: '¿Mi PDF se sube a algún lugar?',
      a: 'No. Oli lee cada PDF y escribe el nuevo en tu dispositivo, en tu navegador. Nada se envía a un servidor, y el texto que escribes para la marca de agua también se queda en tu dispositivo.',
    },
    {
      q: '¿La marca de agua cambia el resto de mi PDF?',
      a: 'No. Los campos de formulario, los enlaces, los marcadores y las propiedades del documento quedan como estaban, y la marca de agua se dibuja encima de la página. Lo único que se quita es la capa de formulario XFA, que la mayoría de las aplicaciones de PDF no puede leer; los campos de formulario normales siguen funcionando.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Tus PDF y el texto de la marca de agua se procesan en tu dispositivo, en tu navegador, y nunca se envían a un servidor.',
  relatedHeading: 'Herramientas relacionadas',
  panel: {
    suffix: 'marca-de-agua',
    note: 'Archivos PDF, todos los que quieras',
    progressLabel: 'Agregando las marcas de agua',
    done: '¡Listo! Oli agregó la marca de agua a tu PDF.',
    doneMany: '¡Listo! Oli agregó la marca de agua a {count} PDF.',
    action: 'Agregar marca de agua',
    options: {
      textLabel: 'Texto de la marca de agua',
      textHelp: 'Funcionan las letras del alfabeto latino básico y los acentos comunes. Los demás caracteres quedan fuera de la marca.',
      textError: 'La marca de agua necesita un texto que Oli pueda dibujar. Escribe letras o números del alfabeto latino básico.',
      defaultText: 'CONFIDENCIAL',
      sizeLegend: 'Tamaño',
      small: 'Pequeño',
      medium: 'Mediano',
      large: 'Grande',
      opacityLegend: 'Opacidad',
      light: 'Suave',
      mediumOpacity: 'Media',
      strong: 'Fuerte',
      directionLegend: 'Dirección',
      diagonal: 'Diagonal',
      horizontal: 'Horizontal',
    },
  },
};

export default texts;
