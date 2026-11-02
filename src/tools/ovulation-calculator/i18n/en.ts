import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Ovulation Calculator: Fertile Window for Six Cycles',
  description: 'Estimate your ovulation day and fertile window from the first day of your last period and your cycle length, for the next six cycles, with the next periods.',
  h1: 'Ovulation calculator',
  lead: 'Your estimated ovulation days and fertile windows for six cycles, from your last period.',
  panel: {
    fields: {
      d: { label: 'First day of last period', error: 'Enter a day from January 1, 2000 to December 31, 2099.' },
      c: { label: 'Cycle length', suffix: 'days', error: 'Enter a cycle from 20 to 40 days.' },
    },
    view: {
      label: 'Estimated ovulation',
      sentence: 'Your fertile window is about {from} to {to}, and your next period about {next}. The next six cycles are in the table below.',
      window: '{from} to {to}',
      fertile: 'Fertile window',
      next: 'Next period',
      scheduleHeading: 'Your next six cycles',
      caption: 'Six cycles from the first day of your last period: the fertile window, the estimated ovulation and the next period',
      colWindow: 'Fertile window',
      colOvulation: 'Ovulation',
      colNext: 'Next period',
    },
    premises: [
      'Every cycle is the length you enter, starting on the first day of your last period.',
      'Ovulation is estimated on day (cycle length − 14) of each cycle: day 14 of a 28-day cycle, as the NICHD and the Office on Women’s Health calculator count it.',
      'The fertile window is the 5 days before ovulation and the day of ovulation.',
      'These are estimates from the calendar only. Cycles change from month to month, and irregular cycles make them less reliable.',
    ],
  },
  howHeading: 'How to use the ovulation calculator',
  howSteps: [
    'Enter the first day of your last period.',
    'Enter how many days your cycle usually lasts, from the first day of one period to the first day of the next.',
    'Read the estimated ovulation and fertile window, and the six cycles in the table; save them as a PDF or a CSV.',
  ],
  worksHeading: 'How ovulation is estimated',
  formulaHeading: 'The formula',
  formula: [
    'Ovulation day = first day of the period + (cycle length − 15) days, which is day (cycle length − 14) of the cycle: day 14 in a 28-day cycle. The fertile window runs from 5 days before that day to the day itself. The next period starts one cycle length after the last one.',
    'The NICHD puts ovulation around day 12 to 14 of an average 28-day cycle, and the Office on Women’s Health counts the fertile window as about 6 days: an egg lives 12 to 24 hours, and sperm up to 5 days.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Office on Women’s Health, "Ovulation calculator"', href: 'https://www.womenshealth.gov/ovulation-calculator' },
    { label: 'Office on Women’s Health, "Your menstrual cycle"', href: 'https://www.womenshealth.gov/menstrual-cycle/your-menstrual-cycle' },
    { label: 'NICHD, "About Menstruation"', href: 'https://www.nichd.nih.gov/health/topics/menstruation/conditioninfo' },
  ],
  disclaimer:
    'This calculator is an educational tool for adults 18 and older, not medical advice. It is an estimate from the calendar, and it cannot tell you when you will or will not get pregnant: do not use it to prevent pregnancy. Irregular cycles make the dates less reliable. Talk with a doctor or nurse about your cycle, and if your cycles are often shorter than 24 days or longer than 38.',
  faqHeading: 'Questions about ovulation',
  faq: [
    {
      q: 'What is the fertile window?',
      a: 'The days when sex can lead to pregnancy: about the 5 days before ovulation and the day of ovulation, because sperm can live up to 5 days and an egg 12 to 24 hours.',
    },
    {
      q: 'How do I find my cycle length?',
      a: 'Count the days from the first day of one period to the day before the next one starts. The Office on Women’s Health says a cycle that comes every 24 to 38 days is still regular.',
    },
    {
      q: 'How exact is this?',
      a: 'It is a calendar estimate. Ovulation can move from month to month, even in regular cycles, so the real days can differ from the ones shown.',
    },
    {
      q: 'Can I use it to avoid getting pregnant?',
      a: 'No. A calendar estimate cannot tell you which days are safe. Talk with a doctor or nurse about ways to prevent pregnancy.',
    },
    {
      q: 'Why does the calculator take cycles from 20 to 40 days?',
      a: 'It is the range of the Office on Women’s Health ovulation calculator. Cycles shorter than 24 days or longer than 38 are worth talking about with a doctor or nurse.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so the dates you enter are never sent anywhere, and the link you copy keeps them after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
