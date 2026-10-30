import type { LegalTexts } from '../types.ts';

export default {
  title: 'Términos de uso',
  description:
    'Los términos para usar FileOrca, herramientas gratis en tu navegador: tus archivos, resultados, calculadoras, anuncios, donaciones y responsabilidad.',
  h1: 'Términos de uso',
  updated: 'Última actualización: 30 de octubre de 2026',
  intro:
    'Estos términos explican cómo puedes usar FileOrca. Al usar el sitio, los aceptas. Si no estás de acuerdo, por favor no uses el sitio.',
  sections: [
    {
      heading: 'Quién ofrece el servicio',
      paragraphs: [
        'FileOrca (fileorca.com) lo hace y lo mantiene una sola persona: Victor Yuki Matusita, desarrollador en Curitiba, Paraná, Brasil. Es persona física, no una empresa.',
        'Cómo trata FileOrca los datos personales se explica en la página de Privacidad.',
      ],
    },
    {
      heading: 'Qué es FileOrca',
      paragraphs: [
        'FileOrca es un sitio con herramientas gratis que funcionan en tu navegador. Está pensado para imágenes, PDF y calculadoras, en inglés, portugués y español. Hoy el sitio tiene una herramienta, que comprime imágenes. Vienen más en camino.',
        'No necesitas una cuenta. Tus archivos se procesan en tu dispositivo, no en un servidor, y nunca se suben.',
      ],
    },
    {
      heading: 'Tus archivos y tu responsabilidad',
      paragraphs: [
        'Los archivos que usas en FileOrca siguen siendo tuyos. FileOrca nunca los recibe y no reclama ningún derecho sobre ellos.',
        'Eres responsable de los archivos que eliges procesar y de lo que haces con los resultados.',
      ],
      list: [
        'Asegúrate de tener derecho a procesar cada archivo.',
        'Guarda tus originales. Revisa el resultado antes de borrar o reemplazar algo.',
        'FileOrca no puede recuperar un archivo perdido, borrado o dañado, porque nunca recibe tus archivos.',
      ],
    },
    {
      heading: 'Resultados sin garantía',
      paragraphs: [
        'FileOrca se ofrece "tal cual" y "según disponibilidad", sin costo. Los resultados varían según el archivo y el navegador, y una herramienta puede funcionar de una forma en tu dispositivo y de otra en el de otra persona.',
        'No hay garantía de que una herramienta funcione con todos los archivos, de que el resultado se ajuste a lo que necesitas ni de que el sitio esté siempre disponible y sin errores.',
        'Revisa cada resultado antes de usarlo.',
      ],
    },
    {
      heading: 'Las calculadoras son educativas, no asesoramiento',
      paragraphs: [
        'FileOrca también tendrá calculadoras. Sirven solo para aprender e informarte. No son asesoramiento financiero, legal ni médico, y no reemplazan a un profesional calificado.',
        'Los resultados son estimaciones hechas con los números que escribes. La vida real puede ser distinta, así que consulta con un profesional calificado antes de tomar una decisión sobre dinero, asuntos legales o salud.',
      ],
    },
    {
      heading: 'Uso aceptable',
      paragraphs: [
        'Usa FileOrca de buena fe y sigue estas reglas.',
        'Los buscadores y otros robots pueden leer e indexar el sitio, siempre que no lo sobrecarguen.',
      ],
      list: [
        'No intentes romper, atacar ni sobrecargar el sitio.',
        'No intentes saltarte las protecciones del sitio.',
        'No uses FileOrca para nada ilegal.',
        'No uses FileOrca para procesar archivos que no tienes derecho a procesar.',
      ],
    },
    {
      heading: 'Anuncios y donaciones',
      paragraphs: [
        'Para seguir siendo gratis, FileOrca muestra, o mostrará, anuncios de Google AdSense. Google es el socio de publicidad. La página de Privacidad explica cómo funcionan los anuncios y las cookies.',
        'Los anuncios, y los sitios a los que llevan, vienen de terceros. FileOrca no controla su contenido y no se hace responsable de él.',
        'Donar es opcional. FileOrca tiene un enlace a Ko-fi, donde puedes dejar una donación. El pago ocurre en Ko-fi, bajo sus propias políticas.',
        'Una donación es voluntaria. No compra nada y no cambia nada en el sitio.',
      ],
    },
    {
      heading: 'Propiedad intelectual',
      paragraphs: [
        'El nombre FileOrca, la mascota Oli, los textos y el diseño del sitio pertenecen a Victor Yuki Matusita. No los copies ni los uses como si fueran tuyos sin permiso.',
        'FileOrca también usa bibliotecas de código abierto. Conservan sus propias licencias, que figuran en la página de Licencias.',
      ],
    },
    {
      heading: 'Limitación de responsabilidad',
      paragraphs: [
        'En la medida en que la ley lo permita, Victor Yuki Matusita, quien mantiene FileOrca, no es responsable de pérdidas ni daños que resulten de usar el sitio o de no poder usarlo. Esto incluye archivos perdidos, borrados o dañados, pérdida de datos y decisiones que tomes a partir de un resultado.',
        'Nada en estos términos te quita los derechos que la ley te da y a los que no se puede renunciar, incluidos los derechos del consumidor.',
      ],
    },
    {
      heading: 'Cambios en estos términos',
      paragraphs: [
        'Estos términos pueden cambiar, por ejemplo cuando el sitio tenga nuevas herramientas. La fecha al inicio de esta página muestra la última actualización.',
        'Si sigues usando FileOrca después de un cambio, los nuevos términos se aplican a ti.',
      ],
    },
    {
      heading: 'Ley aplicable y jurisdicción',
      paragraphs: [
        'Estos términos se rigen por la ley brasileña. Cualquier disputa se llevará ante los tribunales de Curitiba, Paraná, Brasil.',
        'La excepción es cuando la ley de protección al consumidor te da derecho a acudir a los tribunales de tu domicilio. En ese caso, ese derecho se mantiene.',
      ],
    },
    {
      heading: 'Contacto',
      paragraphs: [
        '¿Tienes preguntas sobre estos términos? Escribe a contato@fileorca.com. Los correos se usan solo para responderte.',
      ],
    },
  ],
} satisfies LegalTexts;
