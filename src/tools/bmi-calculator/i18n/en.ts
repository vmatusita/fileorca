import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'BMI Calculator for Adults, in US or Metric Units',
  description: 'Work out your body mass index from your height and weight, in feet and pounds or in centimeters and kilograms, and see the CDC adult category it falls in.',
  h1: 'BMI calculator',
  lead: 'Your BMI from your height and weight.',
  panel: {
    fields: {
      u: { label: 'Units', error: '' },
      ft: { label: 'Height', suffix: 'ft', error: 'Enter feet from 3 to 8.' },
      in: { label: 'And inches', suffix: 'in', error: 'Enter inches from 0 to 11.9.' },
      lb: { label: 'Weight', suffix: 'lb', error: 'Enter a weight from 55 to 1,000 lb.' },
      cm: { label: 'Height', suffix: 'cm', error: 'Enter a height from 91.5 to 274.3 cm.' },
      kg: { label: 'Weight', suffix: 'kg', error: 'Enter a weight from 25 to 453.5 kg.' },
      ag: { label: 'Age', suffix: 'years', error: 'Enter an age from 20 to 120. The CDC adult categories start at 20.' },
    },
    options: { u: { us: 'US', metric: 'Metric' } },
    view: {
      label: 'Your BMI',
      sentence: 'In the CDC categories for adults, a BMI of {bmi} is in {category}, the range from {band}.',
      category: 'CDC category',
      scheduleHeading: 'The CDC adult categories',
      caption: 'The CDC categories of adult BMI, by the BMI rounded to one decimal',
      colCategory: 'Category',
      colBmi: 'BMI',
      colYours: 'Your BMI',
      'cat-underweight': 'Underweight',
      'cat-healthy': 'Healthy Weight',
      'cat-overweight': 'Overweight',
      'cat-obesity-1': 'Class 1 Obesity',
      'cat-obesity-2': 'Class 2 Obesity',
      'cat-obesity-3': 'Class 3 Obesity (Severe Obesity)',
      'band-underweight': 'below 18.5',
      'band-healthy': '18.5 to 24.9',
      'band-overweight': '25.0 to 29.9',
      'band-obesity-1': '30.0 to 34.9',
      'band-obesity-2': '35.0 to 39.9',
      'band-obesity-3': '40.0 or greater',
    },
    premises: [
      'The formula is the CDC one: 703 × weight in pounds ÷ height in inches², or weight in kilograms ÷ height in meters².',
      'The BMI is rounded to one decimal, half up, and the category is read from that number, the way the CDC calculator writes its ranges.',
      'The categories are the CDC ones for adults 20 and older; children and teens are measured against growth percentiles instead.',
      'BMI is a screening number: it does not measure body fat or show where it is.',
    ],
  },
  howHeading: 'How to use the BMI calculator',
  howSteps: [
    'Choose US units (feet, inches and pounds) or metric units (centimeters and kilograms).',
    'Enter your height, your weight and your age.',
    'Read your BMI and its CDC category, and save the result as a PDF or a CSV.',
  ],
  worksHeading: 'How the BMI is worked out',
  formulaHeading: 'The formula',
  formula: [
    'BMI = weight ÷ height². In US units the CDC writes it as 703 × weight in pounds ÷ height in inches²; in metric units it is weight in kilograms ÷ height in meters².',
    'The 703 turns pounds and inches into the same kg/m² that the metric formula gives, so both units read against the same categories. Feet and inches are added up first: 5 feet 9 inches is 69 inches.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'CDC, "Adult BMI Categories"', href: 'https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html' },
    { label: 'CDC, "BMI Frequently Asked Questions"', href: 'https://www.cdc.gov/bmi/faq/index.html' },
    { label: 'CDC, "About Body Mass Index (BMI)"', href: 'https://www.cdc.gov/bmi/about/index.html' },
  ],
  disclaimer:
    'This calculator is an educational tool for adults 18 and older, not medical advice. It takes ages from 20 because the CDC adult categories start at 20. A BMI does not diagnose anything: talk with a doctor or another health professional, who can read it together with your history and other measures.',
  faqHeading: 'Questions about BMI',
  faq: [
    {
      q: 'What does BMI measure?',
      a: 'It compares your weight with your height. As the CDC notes, it does not tell fat from muscle and bone.',
    },
    {
      q: 'Why does the calculator start at age 20?',
      a: 'From 2 to 19, the CDC reads BMI against growth percentiles by age and sex, which this page does not do.',
    },
    {
      q: 'Why can US and metric give a slightly different BMI?',
      a: 'Because 703 is a rounded factor: the same body in kilograms and meters can land 0.1 apart after rounding.',
    },
    {
      q: 'Which category is a BMI of 24.96?',
      a: 'Overweight: 24.96 shows as 25.0, the first number of the CDC range for Overweight, 25.0 to 29.9.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so your height, weight and age are never sent anywhere, and the link you copy keeps them after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
