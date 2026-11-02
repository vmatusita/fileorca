import type { LifeHubTexts } from '../types.ts';

export default {
  title: 'Health Calculators: BMI, Calories, Ovulation and Due Date',
  description: 'Free health calculators for adults: BMI, daily calories, ovulation, body fat and due date, by the formulas of the CDC, NIH and Navy. Your numbers stay on your device.',
  eyebrow: 'Health calculators',
  h1: 'Calculators for adult health numbers',
  intro: 'Each one uses a published formula and says where it comes from. For adults 18 and older, and nothing you type leaves your device.',
  listHeading: 'Body, cycle and pregnancy',
  worksHeading: 'How these calculators work',
  worksIntro: [
    'Every calculator here runs in your browser. BMI, calories and body fat take US units (feet, inches and pounds) or metric units (centimeters and kilograms); each set of units keeps its own values. The result changes as you type, and you can save it as a PDF or a CSV, or copy a link that keeps your numbers after the #.',
    'Each calculator uses one published formula, the same one its page cites, and says the result in plain words. None of them sets a goal, a diet or a diagnosis. The engines were checked against an independent oracle and against the worked examples of the CDC and the NIH.',
  ],
  formulaHeading: 'The formulas behind them',
  formula: [
    'BMI = weight ÷ height², by the CDC: 703 × pounds ÷ inches², or kilograms ÷ meters². Calories at rest by the Mifflin-St Jeor equation (1990), times an activity level for the day. Body fat by the Navy circumference equations of 1984.',
    'The due date is 280 days after the first day of the last period, the 40 weeks the NICHD counts; the ovulation estimate puts it on day (cycle length − 14) of each cycle. Inches and pounds become centimeters and kilograms by the exact factors 2.54 and 0.45359237.',
  ],
  premisesHeading: 'What every calculator assumes',
  premises: [
    'They are for adults 18 and older; a calculator whose source sets a higher age, such as the CDC adult BMI categories at 20, takes ages from there.',
    'Each result is an estimate from a formula, never a measurement, a diagnosis or a goal.',
    'The dates of a cycle or a pregnancy are calendar estimates from the day you enter and the day on your device.',
  ],
  exampleHeading: 'A worked example',
  exampleIntro: 'The BMI calculator opens with a height of 5 ft 9 in and a weight of 160 lb. The engine gives:',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'CDC, "Adult BMI Categories"', href: 'https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html' },
    { label: 'Mifflin MD, St Jeor ST et al., the resting energy equation (PubMed)', href: 'https://pubmed.ncbi.nlm.nih.gov/2305711/' },
    { label: 'NICHD, "About Pregnancy"', href: 'https://www.nichd.nih.gov/health/topics/pregnancy/conditioninfo' },
  ],
  disclaimerHeading: 'Educational tools',
  disclaimer: 'These calculators are educational tools for adults, not medical advice. A number from a formula is not a diagnosis: talk with a doctor or another health professional about what it means for you.',
} satisfies LifeHubTexts;
