import type { HomeTexts } from '../types.ts';

// F13b (UX-03 B, home-b.html; DECISOES § 567 a § 571): la home como el mar por categoría. Cada número es un {placeholder}
// que el build llena desde su fuente (src/components/home-numbers.ts y src/components/tool-count.ts).
export default {
  title: 'FileOrca: herramientas gratis que nunca suben tus archivos',
  description:
    'Herramientas gratis que funcionan en tu navegador, sin cuenta y sin subidas. Tus archivos se quedan en tu dispositivo y puedes comprobarlo en la pestaña Red.',
  h1: '{n} herramientas.',
  h1Promise: '0 subidas.',
  intro: 'Herramientas de imagen, PDF y dinero que hacen el trabajo en tu dispositivo, sin cuenta.',
  toolsHeading: 'Elige una herramienta',
  to: ' a ',
  image: {
    heading: 'Imagen',
    count: '{n} herramientas',
    say: '{photos} fotos de celular en Comprimir imagen: un {percent} más ligeras, con el ajuste por defecto.',
    more: 'Cada herramienta de imagen abre el archivo en esta pestaña, hace el trabajo en tu dispositivo y te da una copia nueva para guardar.',
    all: 'Todas las herramientas de imagen y los tamaños comunes',
  },
  pdf: {
    heading: 'PDF',
    count: '{n} herramientas',
    say: 'Un PDF de fotos en Comprimir PDF: un {percent} más ligero en el nivel recomendado.',
    more: 'Unir, dividir y firmar ocurren en la misma pestaña, y la contraseña que escribes para un PDF nunca sale de ella.',
    all: 'Todas las herramientas PDF',
  },
  money: {
    heading: 'Dinero',
    count: '{n} calculadoras',
    num: '{payment} al mes',
    say: 'La hipoteca del ejemplo, todo incluido: una casa de {price} con {down} de pago inicial, al {rate} a {years} años.',
    more: 'Cada calculadora explica su resultado, que puedes descargar en PDF o CSV, y lo que escribes se queda en tu dispositivo.',
    all: 'Las {n} calculadoras financieras',
  },
  qr: {
    heading: 'Código QR',
    count: '{n} herramienta',
    num: '{max} caracteres',
    say: 'en un solo código, con Oli en el centro, con corrección de errores H.',
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
