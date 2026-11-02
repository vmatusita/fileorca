import type { OpenWithTexts } from '../types.ts';

// La página de compartir (F8, decisão 1; DECISOES § 290).
export default {
  title: 'Abrir con',
  description:
    'Elige una herramienta de FileOrca para las imágenes y los PDF que compartiste desde tu celular. Los archivos se quedan en tu dispositivo.',
  h1: 'Abrir con FileOrca',
  lead: 'Elige una herramienta para los archivos que compartiste. Se quedan en este dispositivo.',
  filesHeading: 'Tus archivos',
  takesThis: 'Abre este archivo',
  takesAll: 'Abre los {total} archivos',
  takesSome: 'Abre {count} de {total} archivos',
  noTool: 'Ninguna herramienta de aquí abre estos archivos. FileOrca trabaja con JPG, PNG, WebP, HEIC y PDF.',
  emptySays: 'No hay nada para abrir aquí.',
  emptyDetail: 'Comparte imágenes o PDF con FileOrca desde tu celular, o elige una herramienta.',
  unknown: 'formato desconocido',
  unnamed: 'Archivo sin nombre',
} satisfies OpenWithTexts;
