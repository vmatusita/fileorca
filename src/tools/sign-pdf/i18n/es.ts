// Sign PDF page blocks (how, specs, faq, privacy) and the panel bits this tool adds to the shared PDF panel texts, in
// Spanish (docs/i18n/es.md). The signature goes on the page as an image, never as a digital signature: the notice and
// the FAQ say so, and they give no legal advice. The specs rows state the real behaviour of the engine (src/engine/pdf/).
// The percent in `boxValue` takes a no-break space before "%", as Spanish writes it (docs/i18n/es.md).
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { SignTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<SignTexts> = {
  title: 'Firmar PDF: agrega tu firma a un PDF en tu navegador',
  description:
    'Firma un PDF en tu navegador: dibuja tu firma, elige una imagen o escribe tu nombre, y colócala en la página. No se sube nada y tu firma no se guarda.',
  h1: 'Firmar PDF',
  howHeading: 'Cómo funciona',
  howSteps: [
    'Suelta tu PDF en el cuadro o elígelo.',
    'Dibuja tu firma, elige una imagen de ella o escribe tu nombre, y arrastra el recuadro al lugar donde debe ir.',
    'Elige las páginas que la llevan (la lupa de cada página la abre en tamaño grande) y presiona Firmar PDF.',
    'Descarga tu PDF firmado.',
  ],
  specsHeading: 'Qué entra y qué sale',
  specs: {
    caption: 'Lo que Firmar PDF recibe y entrega',
    head: ['Detalle', 'Qué pasa'],
    rows: [
      ['Qué acepta', 'Un PDF a la vez. Oli revisa lo que hay dentro del archivo, no su nombre. Con un segundo archivo, te pide que empieces de nuevo. Tu archivo original no se toca.'],
      ['Firma dibujada', 'Dibújala en el recuadro con el dedo, un lápiz óptico o el mouse.'],
      ['Imagen de una firma', 'Un PNG o JPG que eliges. Oli lo vuelve a guardar sin sus metadatos antes de ponerlo en la página.'],
      ['Nombre escrito', 'Oli dibuja tu nombre como una imagen, con la fuente del sitio.'],
      ['Páginas', 'Esta página, todas las páginas o solo las páginas que elijas.'],
      ['Posición', 'Arrastra el recuadro sobre la vista previa, muévelo con las flechas del teclado (+ y − cambian su tamaño) o escribe la X, la Y y el ancho en porcentaje.'],
      ['Cómo se agrega', 'La firma se dibuja en la página como una imagen, no como un campo de formulario.'],
      ['Lo que se conserva', 'Los campos de formulario, los enlaces, los marcadores y los datos del documento quedan como estaban. Solo se quita la capa de formulario XFA, que leen algunas aplicaciones de escritorio; los campos de formulario normales siguen funcionando.'],
      ['Contraseña o restricciones', 'Un PDF que necesita contraseña para abrirse, o que tiene restricciones de edición, se rechaza con un enlace a Desbloquear PDF.'],
    ],
  },
  faqHeading: 'Preguntas',
  faq: [
    {
      q: '¿Esto es una firma digital?',
      a: 'No. Firmar PDF pone una imagen de tu firma en la página, como un sello. No es una firma digital con certificado, y no prueba quién firmó ni si el archivo cambió después. FileOrca no da asesoría legal: cuando se exige una firma con certificado, usa un servicio hecho para eso.',
    },
    {
      q: '¿Puedo poner mi firma en todas las páginas?',
      a: 'Sí. Elige Todas las páginas, y la firma va en el mismo lugar de cada una. El lugar se mide en cada página tal como se ve en pantalla, con su área de recorte y su rotación, así que una página girada recibe la firma donde la ves.',
    },
    {
      q: '¿Qué imagen elijo para mi firma?',
      a: 'Un PNG con fondo transparente, que llega a la página solo con la tinta. El JPG no tiene transparencia, así que su fondo blanco tapa lo que haya debajo del recuadro. Una imagen de más de 1200 píxeles de ancho se reduce a ese ancho.',
    },
    {
      q: '¿Dos personas pueden firmar el mismo PDF?',
      a: 'Sí, una después de la otra. Firma y descarga el PDF, después abre aquí la copia firmada y agrega la segunda firma.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote: 'Tu PDF se firma en tu dispositivo y nunca se envía a un servidor. Tu firma no se guarda en ningún lugar, así que en el siguiente archivo vuelves a agregarla.',
  relatedHeading: 'Herramientas relacionadas',
  panel: {
    suffix: 'firmado',
    note: 'un PDF a la vez',
    progressLabel: 'Firmando tu PDF',
    done: '¡Listo! Oli puso tu firma en el PDF.',
    doneMany: '¡Listo! Oli puso tu firma en el PDF.',
    action: 'Firmar PDF',
    options: {
      modeLegend: 'Firma',
      draw: 'Dibujar',
      upload: 'Imagen',
      type: 'Escribir',
      drawLabel: 'Dibuja tu firma',
      drawHelp: 'Usa el dedo, un lápiz óptico o el mouse.',
      clear: 'Borrar',
      uploadLabel: 'Elige una imagen de tu firma',
      uploadHelp: 'Un PNG o JPG. Oli lo vuelve a guardar sin sus metadatos.',
      uploadError: 'Aquí Oli solo puede usar un PNG o JPG. Elige otra imagen.',
      typeLabel: 'Escribe tu nombre',
      typeHelp: 'Oli lo dibuja como una imagen, con la fuente del sitio.',
      missing: 'Primero dibuja tu firma, elige una imagen o escribe tu nombre.',
      placeLegend: 'Posición',
      boxLabel: 'Posición de la firma',
      boxValue: '{x} % desde la izquierda, {y} % desde arriba, {width} % de ancho',
      keyboardHelp: 'Arrastra el recuadro sobre la vista previa. Con el teclado, las flechas lo mueven (con Mayús, 10 veces más lejos), + o = lo agranda y − lo achica.',
      x: 'Desde la izquierda',
      y: 'Desde arriba',
      width: 'Ancho',
      pct: '%',
      invalid: 'Escribe un porcentaje que deje todo el recuadro dentro de la página.',
      pagesLegend: 'Páginas',
      thisPage: 'Esta página',
      allPages: 'Todas las páginas',
      pickPages: 'Elegir páginas',
      previewLabel: 'Vista previa de la página',
      previewPage: 'Página {n} de {total}',
      notice:
        'Esto pone una imagen de tu firma en la página. No es una firma digital con certificado, y FileOrca no da asesoría legal. Cuando se exige una firma con certificado, usa un servicio hecho para eso.',
    },
  },
};

export default texts;
