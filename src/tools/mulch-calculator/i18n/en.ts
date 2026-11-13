import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Mulch and Gravel Calculator in Cubic Yards, Bags and Tons',
  description: 'Work out the cubic yards of mulch or gravel for a bed from its size and depth, the bags to buy and, for gravel, the weight in short tons.',
  h1: 'Mulch and gravel calculator',
  lead: 'Yards and bags of mulch or gravel.',
  panel: {
    fields: {
      m: { label: 'Material', error: '' },
      mo: { label: 'Measure by', error: '' },
      de: { label: 'Depth', suffix: 'in', error: 'Enter a depth from 0.01 to 36 in.' },
      l: { label: 'Length', suffix: 'ft', error: 'Enter a length from 0.01 to 500 ft.' },
      w: { label: 'Width', suffix: 'ft', error: 'Enter a width from 0.01 to 500 ft.' },
      ar: { label: 'Area', suffix: 'sq ft', error: 'Enter an area from 0.01 to 250,000 sq ft.' },
      bm: {
        label: 'Bag size',
        suffix: 'cu ft',
        help: 'Check the bag: it says how many cubic feet it holds.',
        error: 'Enter a bag size from 0.01 to 10 cu ft.',
      },
      bg: {
        label: 'Bag size',
        suffix: 'cu ft',
        help: 'Check the bag: it says how many cubic feet it holds.',
        error: 'Enter a bag size from 0.01 to 10 cu ft.',
      },
      dn: {
        label: 'Weight per cu yd',
        suffix: 'tons',
        help: 'Ask the supplier. The example, 1.28 short tons, is the EPA weight of loose gravel: 2,565 lb per cubic yard.',
        error: 'Enter a weight from 0.01 to 5 tons per cubic yard.',
      },
    },
    options: { m: { mulch: 'Mulch', gravel: 'Gravel' }, mo: { dims: 'Dimensions', area: 'Total area' } },
    moreHeading: 'Bags and weight',
    view: {
      label: 'Volume needed',
      unit: 'cu yd',
      placard: 'cubic yards',
      sentence: 'That is {feet} cu ft, or {bags} bags of {bag} cu ft.',
      sentenceGravel: 'That is {feet} cu ft, or {bags} bags of {bag} cu ft, and {tons} short tons at the weight you entered.',
      area: 'Area',
      areaUnit: 'sq ft',
      feet: 'In cubic feet',
      feetUnit: 'cu ft',
      bags: 'Bags of {bag} cu ft',
      tons: 'Weight (short tons)',
      scheduleHeading: 'What to buy',
      caption: 'The area, the volume and what to buy',
      colItem: 'Item',
      colAmount: 'Amount',
      // The bags' line in the CSV, with the bag size in a column of its own, and the unit of the weight (F16, DECISOES § 688).
      bagsName: 'Bags',
      tonsUnit: 'short tons',
    },
    premises: [
      'Cubic feet = area in square feet × depth in inches ÷ 12; 27 cubic feet make 1 cubic yard.',
      'Bags are the cubic feet divided by the size of one bag, rounded up to a whole bag. The bag sizes are examples: check the bag.',
      'The weight of gravel is the cubic yards times the weight of one cubic yard you enter, in short tons of 2,000 lb. The example, 1.28, is the EPA weight of loose gravel, 2,565 lb per cubic yard.',
      'The depth is taken as even over the whole area, and the material as it is when spread. Amounts are rounded to two decimals, half up, at the end.',
    ],
  },
  howHeading: 'How to use the mulch and gravel calculator',
  howSteps: [
    'Choose mulch or gravel, and measure the bed by length and width or by its total area.',
    'Enter the depth in inches and the size of the bed in feet or square feet.',
    'Set the bag size and, for gravel, the weight of a cubic yard; then read the cubic yards, the bags and the tons, and save them as a PDF or a CSV.',
  ],
  worksHeading: 'How mulch and gravel are worked out',
  formulaHeading: 'The formula',
  formula: [
    'Area = length × width, in feet, or the area you type. Cubic feet = area × depth in inches ÷ 12, and cubic yards = cubic feet ÷ 27.',
    'Bags = cubic feet ÷ the size of one bag, rounded up. For gravel, short tons = cubic yards × the weight of one cubic yard.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'NIST, "Circumference, Area and Volume"', href: 'https://www.nist.gov/pml/owm/circumference-area-and-volume' },
    { label: 'NIST Handbook 44 (2026), Appendix C, "General Tables of Units of Measurement"', href: 'https://www.nist.gov/document/2026-nist-handbook-44-appendix-c' },
    { label: 'EPA, "Standard Volume-to-Weight Conversion Factors"', href: 'https://www.epa.gov/sites/default/files/2016-03/documents/conversions.pdf' },
  ],
  disclaimer:
    'This calculator is an educational tool, and its result is an estimate. Check the size on the bag, and ask the supplier or a landscaper about the weight of the gravel you buy.',
  faqHeading: 'Questions about mulch and gravel',
  faq: [
    {
      q: 'How many bags of mulch make a cubic yard?',
      a: 'It takes 13.5 bags of 2 cu ft, or 9 bags of 3 cu ft.',
    },
    {
      q: 'How much does a cubic yard of gravel weigh?',
      a: 'It changes with the stone and how wet it is. For loose gravel, the EPA conversion table lists 2,565 lb a cubic yard.',
    },
    {
      q: 'What is a short ton?',
      a: 'The US ton of 2,000 pounds, as NIST Handbook 44 defines it. A metric ton is 1,000 kilograms, about 2,204.6 pounds.',
    },
    {
      q: 'Can I use an area from the square footage calculator?',
      a: 'Yes. Choose Total area and type the square feet. For a bed made of several shapes, add them up in the square footage calculator first.',
    },
    {
      q: 'Why are the bags rounded up and the cubic yards not?',
      a: 'A store sells whole bags, so 25.2 bags become 26. The cubic yards are the amount to ask for when you order bulk material.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so the measurements you type are never sent anywhere, and the link you copy keeps them after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
