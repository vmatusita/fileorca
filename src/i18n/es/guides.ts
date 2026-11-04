// El hub de guías /es/guias/ en español (F11, decisión 5; DECISOES § 364): la franja, los atajos de los tres grupos, los
// títulos de los grupos y "Cómo se hacen estas guías", con los textos de la especificación
// (docs/propostas/ux-v2/guides-hub.html, alternativa A). Las guías vienen de los registros, con el nombre y la descripción de
// sus tarjetas (common.fileGuides y common.guides). {n} es el número de guías del idioma.
import type { GuidesHubTexts } from '../types.ts';

const texts: GuidesHubTexts = {
  title: 'Guías: dudas de imagen, PDF y dinero, con los números',
  description: '{n} guías sobre dudas comunes de imágenes, PDF y préstamos, con los números medidos o calculados y la herramienta dentro de cada una.',
  eyebrow: 'Guías',
  h1: 'Respuestas que muestran los números',
  intro: '{n} guías sobre dudas comunes de imágenes, PDF y préstamos. Cada una dice de dónde salen sus números y trae la herramienta dentro, para que la pruebes en la misma página.',
  jumpLabel: 'Grupos de guías',
  groups: {
    image: { jump: 'Imagen', heading: 'Guías de imagen' },
    pdf: { jump: 'PDF', heading: 'Guías de PDF' },
    money: { jump: 'Dinero', heading: 'Guías de dinero' },
  },
  howHeading: 'Cómo se hacen estas guías',
  how: 'Las guías de imagen y PDF se miden sobre archivos de prueba reales, con el mismo motor que hace funcionar las herramientas de este sitio. Cada guía indica los archivos que usó, el día de la medición y quién la revisó. Las guías de dinero calculan cada ejemplo con la calculadora que llevan dentro. Nada de lo que pones en una herramienta sale de tu dispositivo.',
  // La tarjeta de guía (F11, decisión 6): el tipo que abre su nombre, la medida de una guía de archivo ({n} archivos de prueba,
  // leídos de data/guides-measured.json) o de una de dinero, y la etiqueta de la herramienta al pie.
  card: {
    kind: 'Guía',
    measured: 'Medida con {n} archivos de prueba',
    workedOut: 'Números calculados',
    tool: 'Herramienta en la guía',
  },
};

export default texts;
