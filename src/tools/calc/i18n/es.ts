import type { CalcSharedTexts } from '../types.ts';
import type { CalcPageShared } from './en.ts';

// The texts every Spanish calculator page shares (docs/i18n/es.md): the island's, sent in data-props, and the page's.
export default {
  island: {
    example: 'ejemplo',
    pdf: 'Descargar PDF',
    csv: 'CSV',
    copyLink: 'Copiar enlace',
    copied: 'Enlace copiado',
    copyThis: 'Copia este enlace',
    exportFailed: 'Oli no pudo cargar el generador de PDF. Recarga la página e inténtalo de nuevo.',
    stale: 'Corrige el campo marcado para actualizar el resultado.',
    nextLabel: 'Siguiente paso',
    scheduleHeading: 'Tabla de amortización',
    showSchedule: 'Ver la tabla completa',
    hideSchedule: 'Ocultar la tabla',
    year: 'Año {n}',
    columns: { number: 'Pago', payment: 'Monto', principal: 'Capital', interest: 'Intereses', balance: 'Saldo' },
    duration: { year: '1 año', years: '{n} años', month: '1 mes', months: '{n} meses', join: ' y ', none: '0 meses' },
    addRow: 'Agregar una deuda',
    removeRow: 'Quitar la deuda {n}',
    row: 'Deuda {n}',
    unitLabel: 'Pago inicial en dólares o en porcentaje del precio',
    units: { amount: '$', percent: '%' },
    pdfLabels: {
      inputs: 'Lo que escribiste',
      results: 'Resultados',
      premises: 'Supuestos',
      schedule: 'Tabla',
      notice: 'Herramienta educativa',
      site: 'Hecho con las calculadoras gratis de fileorca.com',
      page: 'Página {n} de {total}',
    },
  } satisfies CalcSharedTexts,
  page: {
    seal: 'Tus números se quedan en tu dispositivo',
    reviewed: 'Revisado por {name} el {date}.',
    firstPublished: 'Publicado por primera vez el {date}.',
    readOn: 'Leído el {date}.',
    exampleInputs: 'Lo que escribes',
    exampleResults: 'Lo que obtienes',
    guide: 'Lee la guía: {title}',
    openCalc: 'Abrir la {name} en su propia página',
    disclaimerHeading: 'Herramienta educativa',
    exampleCaption: 'El ejemplo resuelto: lo que entra y lo que sale',
  } satisfies CalcPageShared,
};
