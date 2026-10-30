import type { ContactTexts } from '../types.ts';

export default {
  title: 'Contacto por correo electrónico',
  description:
    'Escribe a contato@fileorca.com con una pregunta o un archivo que no funciona. Respuestas en español, inglés o portugués. El correo solo se usa para responder.',
  h1: 'Contacto',
  intro: '¿Tienes una pregunta o un archivo que no funciona? Escribe un correo electrónico a esta dirección.',
  emailLabel: 'Correo electrónico',
  notes: [
    'Si un archivo no funciona, indica qué navegador usas y de qué tipo es el archivo. No hace falta que lo envíes.',
    'Las respuestas llegan en español, inglés o portugués.',
    'Nunca envíes contraseñas ni datos de pago. FileOrca jamás los pedirá.',
    'Los correos enviados a esta dirección se reenvían mediante Cloudflare Email Routing a una bandeja de Gmail y se usan solo para responder.',
  ],
} satisfies ContactTexts;
