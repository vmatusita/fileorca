import type { HomeTexts } from '../types.ts';

// F13b (UX-03 B; DECISOES § 567 y § 568) y ajuste-home-cards (§ 602 a § 604): la parte de arriba de la home y, después, una
// sección por categoría con su título, su frase, los ToolCards de src/components/home-bands.ts y el enlace a su hub. Cada
// número es un {placeholder} que el build llena desde los registros (src/components/tool-count.ts y las guías).
export default {
  title: 'FileOrca: herramientas gratis que nunca suben tus archivos',
  description:
    'Herramientas gratis que funcionan en tu navegador, sin cuenta y sin subidas. Tus archivos se quedan en tu dispositivo y puedes comprobarlo en la pestaña Red.',
  h1: '{n} herramientas.',
  h1Promise: '0 subidas.',
  intro: 'Herramientas de imagen, PDF y dinero que hacen el trabajo en tu dispositivo, sin cuenta.',
  toolsHeading: 'Elige una herramienta',
  image: {
    heading: 'Imagen',
    more: 'Cada herramienta de imagen abre el archivo en esta pestaña, hace el trabajo en tu dispositivo y te da una copia nueva para guardar.',
    all: 'Todas las herramientas de imagen y los tamaños comunes',
  },
  pdf: {
    heading: 'PDF',
    more: 'Unir, dividir y firmar ocurren en la misma pestaña, y la contraseña que escribes para un PDF nunca sale de ella.',
    all: 'Todas las herramientas PDF',
  },
  money: {
    heading: 'Dinero',
    more: 'Cada calculadora explica su resultado, que puedes descargar en PDF o CSV, y lo que escribes se queda en tu dispositivo.',
    all: 'Las {n} calculadoras financieras',
  },
  qr: {
    heading: 'Código QR',
    more: 'Escribe un enlace o un texto corto y guarda el código en PNG o SVG, con el texto guardado en tu dispositivo.',
  },
  privacyHeading: 'Tus archivos se quedan contigo',
  privacyBody:
    'Tus archivos nunca salen de tu dispositivo. FileOrca hace el trabajo en tu navegador, y puedes comprobarlo tú mismo: abre la pestaña Red del navegador mientras usas una herramienta y verás que ninguna solicitud lleva tu archivo.',
  // F11 (decisión 7): la sección "Lee una guía"; {n} es el número de guías del idioma, leído de los registros.
  guides: {
    heading: 'Lee una guía',
    intro: 'Cada guía responde una pregunta con números y trae la herramienta dentro.',
    hubLink: 'Ver las {n} guías',
  },
} satisfies HomeTexts;
