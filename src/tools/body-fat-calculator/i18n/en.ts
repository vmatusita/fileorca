import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Body Fat Calculator by the Navy Tape Measure Method',
  description: 'Estimate your body fat percentage from your height and your neck, waist and hip measures, by the Navy circumference equations of 1984, in US or metric units.',
  h1: 'Body fat calculator',
  lead: 'Body fat from a few tape measures.',
  panel: {
    fields: {
      u: { label: 'Units', error: '' },
      sx: { label: 'Sex used by the formula', error: '' },
      ft: { label: 'Height', suffix: 'ft', error: 'Enter feet from 3 to 8.' },
      in: { label: 'And inches', suffix: 'in', error: 'Enter inches from 0 to 11.9.' },
      cm: { label: 'Height', suffix: 'cm', error: 'Enter a height from 91.5 to 274.3 cm.' },
      nk: { label: 'Neck', suffix: 'in', error: 'Enter a neck from 8 to 30 in.' },
      wa: { label: 'Waist', suffix: 'in', error: 'Enter a waist from 15 to 80 in.' },
      hp: { label: 'Hip', suffix: 'in', help: 'Used by the female formula only.', error: 'Enter a hip from 20 to 80 in.' },
      nkc: { label: 'Neck', suffix: 'cm', error: 'Enter a neck from 20 to 76 cm.' },
      wac: { label: 'Waist', suffix: 'cm', error: 'Enter a waist from 38 to 203 cm.' },
      hpc: { label: 'Hip', suffix: 'cm', help: 'Used by the female formula only.', error: 'Enter a hip from 50 to 203 cm.' },
      ag: { label: 'Age', suffix: 'years', error: 'Enter an age from 18 to 120. The calculator is for adults.' },
    },
    options: { u: { us: 'US', metric: 'Metric' }, sx: { female: 'Female', male: 'Male' } },
    moreHeading: 'Formula, hip and age',
    view: {
      label: 'Body fat',
      sentence: 'By the Navy circumference equations, with the {sex} formula, these measures give an estimated {percent}% body fat.',
      female: 'female',
      male: 'male',
      method: 'Equation',
      formulaMale: 'Male: neck and waist at the navel',
      formulaFemale: 'Female: neck, waist at its narrowest and hip',
      domainMale: 'The waist has to be larger than the neck for the equation. Check both measures.',
      domainFemale: 'The waist and hip together have to be larger than the neck for the equation. Check the measures.',
      range: 'These measures give a result outside 0.1% to 99.9%, so the equation cannot estimate it. Check them.',
      scheduleHeading: 'The equation used',
      caption: 'The equation used and the estimate',
      colItem: 'Step',
      colAmount: 'Value',
    },
    premises: [
      'The equations are those of Hodgdon and Beckett, Naval Health Research Center, 1984, in inches; centimeters are divided by 2.54 first.',
      'Male: 86.010 × log10(waist − neck) − 70.041 × log10(height) + 36.76. Female: 163.205 × log10(waist + hip − neck) − 97.684 × log10(height) − 78.387.',
      'The result is rounded to one decimal, half up. The page gives no category or range for it.',
      'A tape measure estimate can be several points away from a lab measurement such as a DEXA scan.',
    ],
  },
  howHeading: 'How to use the body fat calculator',
  howSteps: [
    'Choose US or metric units and the formula: female or male.',
    'Measure your height without shoes, your neck just below the larynx, and your waist: at the navel for the male formula, at the narrowest point for the female one.',
    'For the female formula, also measure the hip at its widest point; then read the estimate and save it as a PDF or a CSV.',
  ],
  worksHeading: 'How body fat is estimated',
  formulaHeading: 'The formula',
  formula: [
    'Male: body fat % = 86.010 × log10(waist − neck) − 70.041 × log10(height) + 36.76. Female: body fat % = 163.205 × log10(waist + hip − neck) − 97.684 × log10(height) − 78.387. All measures are in inches.',
    'The equations come from two Naval Health Research Center reports of 1984 by Hodgdon and Beckett, fitted on Navy men and women. The U.S. military no longer uses them as its standard: the Army, for one, replaced the tape test with the waist-to-height ratio in July 2026.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Foulis SA, Friedl KE et al., Frontiers in Physiology, 2023: the equations in print (PMC10282178)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10282178/' },
    { label: 'Schuna JM Jr et al., International Journal of Exercise Science, 2013: the male equation in inches (PMC4831679)', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4831679/' },
    { label: 'U.S. Army, "Army modifies body composition program, adopts waist-to-height ratio"', href: 'https://www.army.mil/article/293753/army_modifies_body_composition_program_adopts_waist_to_height_ratio' },
  ],
  disclaimer:
    'This calculator is an educational tool for adults 18 and older, not medical advice. It gives an estimate from a tape measure, not a diagnosis or a military standard. Talk with a doctor or another health professional about what your body composition means for you.',
  faqHeading: 'Questions about the body fat estimate',
  faq: [
    {
      q: 'Where exactly do I measure?',
      a: 'The neck just below the larynx (the Adam’s apple). For the male formula, the waist at the navel; for the female formula, the waist at its narrowest point and the hip at its widest. Keep the tape flat on the skin without pressing in.',
    },
    {
      q: 'Is this the military body fat standard?',
      a: 'No. These are the Navy equations of 1984, which the armed forces used for decades. Today the services use other methods: the Army replaced the tape test with the waist-to-height ratio in July 2026.',
    },
    {
      q: 'How exact is a tape measure estimate?',
      a: 'It is an estimate: the same person can get a different number from small changes in where the tape sits. A lab method such as a DEXA scan measures body fat more directly.',
    },
    {
      q: 'Why does the formula ask for sex?',
      a: 'The 1984 reports fitted one equation on men and another on women, with different measures. The field is the equation you want the calculator to use.',
    },
    {
      q: 'Why is there no category for my result?',
      a: 'The equations estimate a number; this page does not judge it. Talk about it with a health professional, who can read it together with other measures.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so your measures and the sex the formula uses are never sent anywhere, and the link you copy keeps them after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
