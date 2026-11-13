import type { AboutTexts } from '../types.ts';

export default {
  title: 'Acerca de FileOrca y de quien lo hace',
  description:
    'FileOrca es obra de Victor Yuki Matusita, desarrollador en Curitiba, Brasil. Descubre por qué las herramientas son gratis y qué tiene que ver una orca.',
  h1: 'Acerca de FileOrca',
  intro: [
    'FileOrca lo hace y lo mantiene una sola persona: Victor Yuki Matusita, desarrollador en Curitiba, Paraná, Brasil.',
    'Es un conjunto de herramientas gratis que funcionan en tu navegador. En español tienes todas las herramientas de imagen, que son {image}, todas las de PDF, que son {pdf}, las {money} calculadoras de dinero con sus guías, el generador de códigos QR y guías sobre archivos de imagen y PDF. El sitio también está en inglés y en portugués.',
  ],
  whyHeading: 'Por qué existe este sitio',
  why: [
    'FileOrca existe para ofrecer herramientas gratis, sin cuenta, sin subir archivos y sin límites. Sueltas un archivo, la herramienta trabaja en tu navegador y el archivo nunca sale de tu dispositivo.',
    'Los anuncios cubren los costos del sitio y los cafés opcionales pagan nuevas herramientas. Tus archivos no forman parte del trato: el sitio nunca los recibe.',
  ],
  orcaHeading: 'Las orcas son delfines',
  orca: 'Un dato curioso para terminar: la orca no es una ballena. Es un delfín, el miembro más grande de la familia de los delfines oceánicos. Oli, la orca de este sitio, también es un delfín.',
  linksHeading: 'Encuentra a Victor en internet',
  websiteLabel: 'Sitio web de Victor',
  linkedinLabel: 'Victor en LinkedIn',
  // F19a (decisión 5; DECISOES § 758): el día en que el sitio se lanzó viene de LAUNCH_DATE, nunca escrito aquí.
  since:
    'FileOrca se lanzó el {date}. La página {whatsNew} enumera los cambios desde entonces, con sus fechas, y la página {howItWorks} muestra qué pasa con tu archivo y cómo comprobarlo en tu navegador.',
  // F19a (decisión 6; DECISOES § 763): el cuadro del autor al final de cada guía.
  author: {
    heading: 'Sobre el autor',
    who: '{name} es desarrollador en Curitiba, Brasil, y hace y mantiene FileOrca él solo.',
    fileGuide: 'Las cifras de esta guía se midieron el {date} con el motor de las herramientas de este sitio, en los archivos de prueba que la guía enumera.',
    moneyGuide: 'Las cifras de esta guía salen de la calculadora que trae, y sus cuentas se comprueban con un cálculo independiente.',
  },
  stats: {
    heading: 'FileOrca en números',
    image: 'herramientas de imagen',
    pdf: 'herramientas PDF',
    money: 'calculadoras de dinero',
    languages: 'idiomas',
    zero: 'archivos subidos',
  },
} satisfies AboutTexts;
