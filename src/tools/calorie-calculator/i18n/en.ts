import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Calorie Calculator: Daily Calories by Mifflin-St Jeor',
  description: 'Estimate the calories your body uses at rest and over a whole day from your sex, age, height, weight and activity level, by the Mifflin-St Jeor equation.',
  h1: 'Calorie calculator',
  lead: 'The calories your body uses in a day.',
  panel: {
    fields: {
      u: { label: 'Units', error: '' },
      sx: { label: 'Sex used by the formula', error: '' },
      ft: { label: 'Height', suffix: 'ft', error: 'Enter feet from 3 to 8.' },
      in: { label: 'And inches', suffix: 'in', error: 'Enter inches from 0 to 11.9.' },
      lb: { label: 'Weight', suffix: 'lb', error: 'Enter a weight from 55 to 1,000 lb.' },
      cm: { label: 'Height', suffix: 'cm', error: 'Enter a height from 91.5 to 274.3 cm.' },
      kg: { label: 'Weight', suffix: 'kg', error: 'Enter a weight from 25 to 453.5 kg.' },
      ag: { label: 'Age', suffix: 'years', error: 'Enter an age from 19 to 78, the ages the equation was built on.' },
      pa: {
        label: 'Activity level',
        help: 'The NIH Body Weight Planner puts it from 1.4 (sedentary) to 2.5 (very active); 1.6 is very light activity at work and moderate exercise once a week.',
        error: 'Enter an activity level from 1.4 to 2.5.',
      },
    },
    options: { u: { us: 'US', metric: 'Metric' }, sx: { female: 'Female', male: 'Male' } },
    moreHeading: 'Formula and activity',
    view: {
      label: 'Calories a day',
      unit: 'kcal',
      sentence: 'At rest the equation gives {ree} kcal a day; times an activity level of {pal}, that is {tdee} kcal a day.',
      ree: 'At rest (Mifflin-St Jeor)',
      pal: 'Activity level',
      scheduleHeading: 'How the number is made',
      caption: 'Resting energy, activity level and calories a day',
      colItem: 'Step',
      colAmount: 'Amount',
    },
    premises: [
      'Resting energy comes from the Mifflin-St Jeor equation: 10 × kg + 6.25 × cm − 5 × age, plus 5 for the male formula or minus 161 for the female one.',
      'The day is that number times the activity level, which the NIH Body Weight Planner puts from 1.4 (sedentary) to 2.5 (very active).',
      'Pounds and inches become kilograms and centimeters by the exact factors 0.45359237 and 2.54; both numbers are rounded to the whole calorie at the end.',
      'The equation was built on healthy adults aged 19 to 78, so the calculator takes those ages. It is an estimate, not a measurement.',
    ],
  },
  howHeading: 'How to use the calorie calculator',
  howSteps: [
    'Choose US or metric units and the sex the formula uses.',
    'Enter your height, your weight and your age.',
    'Set your activity level under the result, then read both numbers and save them as a PDF or a CSV.',
  ],
  worksHeading: 'How the calories are worked out',
  formulaHeading: 'The formula',
  formula: [
    'Resting energy expenditure (the calories the body uses at rest) by Mifflin and St Jeor, 1990: 10 × weight in kg + 6.25 × height in cm − 5 × age in years + 5 for the male formula, or − 161 for the female one.',
    'Calories a day = resting energy × physical activity level. The NIH Body Weight Planner, built on the same equation for the resting part, describes activity levels from about 1.4 for a sedentary day to 2.5 for a very active one.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Mifflin MD, St Jeor ST et al., "A new predictive equation for resting energy expenditure in healthy individuals" (PubMed)', href: 'https://pubmed.ncbi.nlm.nih.gov/2305711/' },
    { label: 'NIDDK, "Body Weight Planner"', href: 'https://www.niddk.nih.gov/bwp' },
    { label: 'NIDDK, Hall KD et al., web appendix of the Body Weight Planner model (resting energy by Mifflin-St Jeor)', href: 'https://www.niddk.nih.gov/-/media/Files/BWP/Hall_Lancet_Web_Appendix.pdf' },
  ],
  disclaimer:
    'This calculator is an educational tool for adults 18 and older, not medical or nutrition advice. It takes ages from 19 to 78, the ages of the people the equation was built on. Your body can use more or fewer calories than any equation says: talk with a doctor or a registered dietitian about your own needs.',
  faqHeading: 'Questions about daily calories',
  faq: [
    {
      q: 'What is the difference between the two numbers?',
      a: 'The first is the energy your body uses at rest, for breathing, circulation and the rest. The second adds the activity of a whole day, by multiplying the first by your activity level.',
    },
    {
      q: 'Which activity level should I enter?',
      a: 'The NIH Body Weight Planner describes 1.4 as sedentary, 1.6 as very light activity at work or school with moderate exercise about once a week, and 2.5 as very active. Pick the number that sounds closest to your usual day.',
    },
    {
      q: 'Why does the formula ask for sex?',
      a: 'Mifflin and St Jeor fitted one equation for men and one for women: they differ only in the constant at the end, plus 5 or minus 161. The field is the formula you want the calculator to use.',
    },
    {
      q: 'Why only from 19 to 78?',
      a: 'Those were the ages of the 498 healthy adults the equation was built on. Outside them the calculator would be guessing.',
    },
    {
      q: 'Is this the same as BMR?',
      a: 'Close: the equation estimates resting energy expenditure, which many sites call basal metabolic rate. The page uses the words of the original study.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so your height, weight, age and activity level are never sent anywhere, and the link you copy keeps them after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
