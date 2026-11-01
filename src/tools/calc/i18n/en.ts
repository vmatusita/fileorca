import type { CalcSharedTexts } from '../types.ts';

/** The page parts every calculator page shares (not sent to the island). */
export interface CalcPageShared {
  seal: string;
  reviewed: string;
  firstPublished: string;
  readOn: string;
  exampleInputs: string;
  exampleResults: string;
  guide: string;
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
    csv: 'CSV',
    copyLink: 'Copy link',
    copied: 'Link copied',
    copyThis: 'Copy this link',
    exportFailed: "Oli couldn't load the PDF maker. Reload the page and try again.",
    stale: 'Fix the highlighted field to update the result.',
    nextLabel: 'Next step',
    scheduleHeading: 'Payment schedule',
    showSchedule: 'Show the full schedule',
    hideSchedule: 'Hide the schedule',
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
    firstPublished: 'First published {date}.',
    readOn: 'Read on {date}.',
    exampleInputs: 'You enter',
    exampleResults: 'You get',
    guide: 'Read the guide: {title}',
    openCalc: 'Open the {name} on its own page',
    disclaimerHeading: 'Educational tool',
    exampleCaption: 'The worked example: what goes in and what comes out',
  } satisfies CalcPageShared,
};
