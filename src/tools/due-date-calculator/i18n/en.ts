import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Due Date Calculator by Last Period, Conception or IVF',
  description: 'Estimate a due date from the first day of the last period, the conception date or an IVF transfer, with the weeks along today and when each trimester starts.',
  h1: 'Due date calculator',
  lead: 'The estimated due date of a pregnancy, the weeks along today and the start of each trimester.',
  panel: {
    fields: {
      m: { label: 'Count from', error: '' },
      d: { label: 'Date', error: 'Enter a day from January 1, 2000 to December 31, 2099.' },
    },
    options: {
      m: { lmp: 'Last period', conception: 'Conception', ivf3: 'IVF, day-3 embryo', ivf5: 'IVF, day-5 embryo' },
    },
    view: {
      label: 'Due date',
      sentence: 'Counted from a first day of the last period on {lmp}. {today}',
      today: 'Today the pregnancy is {age} along.',
      before: 'Today is before that first day, so there are no weeks to count yet.',
      after: 'Today is more than 42 weeks after that first day.',
      todayLabel: 'Today',
      age: '{weeks} and {days}',
      week: '{n} week',
      weeks: '{n} weeks',
      day: '{n} day',
      days: '{n} days',
      trimester1: 'First trimester starts (week 1)',
      trimester2: 'Second trimester starts (week 13)',
      trimester3: 'Third trimester starts (week 29)',
      fullTerm: 'Full term starts (39 weeks)',
      scheduleHeading: 'The dates of the pregnancy',
      caption: 'When each trimester starts, when full term starts and the due date',
      colMilestone: 'Milestone',
      colDate: 'Date',
    },
    premises: [
      'The due date is 280 days (40 weeks) after the first day of the last period, the count the NICHD uses.',
      'From a conception date it is 266 days; from an IVF transfer, 263 days for a day-3 embryo and 261 for a day-5 embryo, as in the NIH nuMoM2b study.',
      'The count assumes a cycle of about 28 days with ovulation near the middle; an early ultrasound dates a pregnancy more exactly.',
      'Weeks are counted from the first day of the last period. The trimesters follow the NICHD: weeks 1 to 12, 13 to 28 and 29 to 40.',
    ],
  },
  howHeading: 'How to use the due date calculator',
  howSteps: [
    'Choose what to count from: the first day of the last period, the conception date or an IVF transfer.',
    'Enter that date.',
    'Read the due date, the weeks along today and when each trimester starts; save them as a PDF or a CSV.',
  ],
  worksHeading: 'How the due date is worked out',
  formulaHeading: 'The formula',
  formula: [
    'Due date = first day of the last period + 280 days, the 40 weeks the NICHD counts from the last period. From a conception date: + 266 days. From an IVF transfer: + 263 days for a day-3 embryo, + 261 days for a day-5 embryo.',
    'The weeks along are the days from the first day of the last period to today, in weeks and days; the day is read from your device. Full term starts at 39 weeks, and the second and third trimesters at weeks 13 and 29.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above, with November 2, 2026 as today.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'NICHD, "About Pregnancy"', href: 'https://www.nichd.nih.gov/health/topics/pregnancy/conditioninfo' },
    { label: 'NIH, nuMoM2b study methods: dating by insemination and IVF transfer (PMC4387083)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4387083/' },
    { label: 'ACOG Committee Opinion 700, "Methods for Estimating the Due Date" (PubMed)', href: 'https://pubmed.ncbi.nlm.nih.gov/28426621/' },
    { label: 'MedlinePlus, "When you pass your due date"', href: 'https://medlineplus.gov/ency/patientinstructions/000515.htm' },
  ],
  disclaimer:
    'This calculator is an educational tool for adults 18 and older, not medical advice. A due date is an estimate: most births come between 37 and 42 weeks. Your doctor or midwife sets the due date of a pregnancy, often with an early ultrasound.',
  faqHeading: 'Questions about the due date',
  faq: [
    {
      q: 'Why count from the last period and not from conception?',
      a: 'The first day of the last period is a date most people know, while the day of conception is rarely known. Counting from it adds about two weeks before conception, so a pregnancy is 40 weeks long on paper.',
    },
    {
      q: 'How exact is the due date?',
      a: 'It is an estimate. Few babies arrive on the due date itself; most births come between 37 and 42 weeks. An ultrasound early in the pregnancy dates it more exactly, and your doctor or midwife may change the date after one.',
    },
    {
      q: 'How do IVF due dates work?',
      a: 'The transfer date is known, so the count starts there: 263 days for a day-3 embryo and 261 days for a day-5 embryo, which is 266 days from fertilization.',
    },
    {
      q: 'What if my cycle is longer or shorter than 28 days?',
      a: 'The count from the last period assumes about 28 days with ovulation near the middle. With a longer or shorter cycle, the date can be off by a few days: count from a known conception date, or ask your doctor or midwife.',
    },
    {
      q: 'When is full term?',
      a: 'The NICHD calls a baby born at 39 or 40 weeks full term, 37 and 38 weeks early term, and 41 weeks late term.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so the date you enter and today’s date are never sent anywhere, and the link you copy keeps the date after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
