import type { OfflineTexts } from '../types.ts';

// La página sin conexión (F8, decisão 8; DECISOES § 289).
export default {
  title: 'Sin conexión',
  description:
    'FileOrca guarda en este dispositivo las páginas que abres con internet, para que funcionen sin conexión. Esta página aún no se guardó.',
  h1: 'Estás sin conexión',
  says: 'Sin conexión, y esta página aún no está guardada.',
  saysDetail: 'Las páginas que abriste aquí con internet siguen funcionando.',
  savedHeading: 'Guardadas en este dispositivo',
  savedEmpty: 'Aún no hay nada guardado. Abre una herramienta con internet y quedará aquí.',
  homeLink: 'Ir a la página de inicio',
} satisfies OfflineTexts;
