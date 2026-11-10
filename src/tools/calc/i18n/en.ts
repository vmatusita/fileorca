import type { CalcSharedTexts } from '../types.ts';

/** The page parts every calculator page shares (not sent to the island). */
export interface CalcPageShared {
  seal: string;
  reviewed: string;
  /** The one-line signature of a calculator page (F13b, G-23): the name and the short date. */
  signed: string;
  firstPublished: string;
  readOn: string;
  exampleInputs: string;
  exampleResults: string;
  /** Under the calculator of a guide: the link to that calculator's own page. */
  openCalc: string;
  disclaimerHeading: string;
  /** Visually hidden caption of the worked example table. */
  exampleCaption: string;
}

export default {
  island: {
    example: 'example',
    pdf: 'Download PDF',
    csv: 'Download CSV',
    copyLink: 'Copy link',
    copied: 'Link copied',
    decimalHint: 'Use a dot for the decimals, like 6.5.',
    decimalsMany: 'Use up to {n} decimal places.',
    decimalsOne: 'Use up to 1 decimal place.',
    decimalsNone: 'Use a whole number.',
    csvUnit: 'Unit',
    csvFrom: '{label} (from)',
    csvTo: '{label} (to)',
    copyThis: 'Copy this link',
    exportFailed: "Oli couldn't load the PDF maker. Reload the page and try again.",
    exportOffline: "No internet, and the PDF maker isn't saved yet. Download a PDF once with internet and it works offline too.",
    stale: 'Fix the highlighted field to update the result.',
    lastWorked: 'Last result that worked: {label} {value}.',
    nextLabel: 'Next step',
    scheduleHeading: 'Payment schedule',
    year: 'Year {n}',
    columns: { number: 'Payment', payment: 'Amount', principal: 'Principal', interest: 'Interest', balance: 'Balance' },
    duration: { year: '1 year', years: '{n} years', month: '1 month', months: '{n} months', join: ' ', none: 'no time' },
    addRow: 'Add a debt',
    removeRow: 'Remove debt {n}',
    row: 'Debt {n}',
    unitLabel: 'Down payment in dollars or in percent of the price',
    units: { amount: '$', percent: '%' },
    pdfLabels: {
      inputs: 'What you entered',
      results: 'Results',
      premises: 'Assumptions',
      schedule: 'Schedule',
      notice: 'Educational tool',
      site: 'Made with the free calculators at fileorca.com',
      page: 'Page {n} of {total}',
    },
  } satisfies CalcSharedTexts,
  page: {
    seal: 'Your numbers stay on your device',
    reviewed: 'Reviewed by {name} on {date}.',
    signed: 'Reviewed by {name} · {date}',
    firstPublished: 'First published {date}.',
    readOn: 'Read on {date}.',
    exampleInputs: 'You enter',
    exampleResults: 'You get',
    openCalc: 'Open the {name} on its own page',
    disclaimerHeading: 'Educational tool',
    exampleCaption: 'The worked example: what goes in and what comes out',
  } satisfies CalcPageShared,
};
