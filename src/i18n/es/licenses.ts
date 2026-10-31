import type { LicensesTexts } from '../types.ts';

export default {
  title: 'Licencias del software de código abierto y las tipografías',
  description:
    'El software de código abierto y las tipografías que llegan a tu navegador, con sus licencias. Las herramientas usadas solo para construir el sitio no aparecen.',
  h1: 'Licencias',
  intro:
    'FileOrca se apoya en software de código abierto. Esta página enumera el software y las tipografías que llegan a tu navegador, con sus licencias. Las herramientas que solo sirven para construir el sitio no aparecen, porque no se distribuyen.',
  packagesHeading: 'Software',
  fontsHeading: 'Tipografías',
  noFonts: 'Por ahora el sitio no carga ninguna tipografía web.',
  packageColumn: 'Paquete',
  versionColumn: 'Versión',
  licenseColumn: 'Licencia',
  showText: 'Mostrar el texto de la licencia',
  sourceLabel: 'Código fuente',
  bundledHeading: 'Software dentro de otro software',
  bundledIntro:
    'Estos paquetes no se instalan solos. Cada uno viene dentro de un paquete de la lista de arriba y termina en los archivos que recibe tu navegador.',
  viaLabel: 'Viene con',
  showTextOf: 'Mostrar la licencia de',
  copiedFrom: 'Copiado de',
  lgplHeading: 'Fotos HEIC y la LGPL',
  lgplWhat:
    'Las fotos HEIC se abren con libheif, una biblioteca libre bajo la GNU Lesser General Public License, versión 3 (LGPL-3.0). Llega a tu navegador por el paquete libheif-js, que también incluye libde265, el decodificador de vídeo que necesitan las fotos HEIC, bajo la misma licencia.',
  lgplSeparate:
    'FileOrca usa libheif sin ningún cambio. La biblioteca compilada es el archivo libheif.wasm, y el sitio lo entrega como un archivo aparte, byte a byte como lo publica el paquete. El JavaScript que lo inicia es el del propio paquete, tratado solo por la herramienta que construye el sitio.',
  lgplReplace:
    'Puedes usar otra versión de la biblioteca. La página pide libheif.wasm por su dirección web, así que una versión que compilaste a partir del código fuente de abajo puede ocupar su lugar, por ejemplo con las sustituciones locales de las herramientas para desarrolladores del navegador.',
  lgplSourceHeading: 'Código fuente de la versión en uso',
  lgplRoles: {
    libheif: 'la biblioteca',
    libde265: 'el decodificador HEVC que trae',
    wrapper: 'el paquete npm que la envuelve',
    build: 'los scripts que construyen el archivo .wasm',
  },
  lgplTexts:
    'El texto completo de la LGPL-3.0 y el de la GPL-3.0, a la que remite, están en libheif-js, en la primera tabla de abajo.',
} satisfies LicensesTexts;
