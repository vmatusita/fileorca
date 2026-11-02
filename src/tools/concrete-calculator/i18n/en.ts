import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Concrete Calculator for Slabs, Footings and Round Columns',
  description: 'Work out the cubic yards of concrete for a slab, a footing or a round column, with extra for waste, and how many 40, 60 or 80 lb bags to buy.',
  h1: 'Concrete calculator',
  lead: 'Cubic yards and bags for a pour.',
  panel: {
    fields: {
      sh: { label: 'Shape', error: '' },
      l: { label: 'Length', suffix: 'ft', error: 'Enter a length from 0.01 to 500 ft.' },
      w: { label: 'Width', suffix: 'ft', error: 'Enter a width from 0.01 to 500 ft.' },
      t: { label: 'Thickness', suffix: 'in', error: 'Enter a thickness from 0.01 to 60 in.' },
      d: { label: 'Diameter', suffix: 'in', error: 'Enter a diameter from 0.01 to 240 in.' },
      h: { label: 'Height or depth', suffix: 'in', error: 'Enter a height or depth from 0.01 to 240 in.' },
      q: { label: 'Quantity', error: 'Enter a quantity from 1 to 100.' },
      wa: {
        label: 'Extra for waste',
        suffix: '%',
        help: 'Added to the volume for spills, an uneven base and forms that bow.',
        error: 'Enter an extra from 0 to 50%.',
      },
      y4: {
        label: '40 lb bag yield',
        suffix: 'cu ft',
        help: 'Check the bag: it prints how many cubic feet it makes.',
        error: 'Enter a yield from 0.01 to 5 cu ft.',
      },
      y6: { label: '60 lb bag yield', suffix: 'cu ft', error: 'Enter a yield from 0.01 to 5 cu ft.' },
      y8: { label: '80 lb bag yield', suffix: 'cu ft', error: 'Enter a yield from 0.01 to 5 cu ft.' },
    },
    options: { sh: { slab: 'Slab or footing', round: 'Round column' } },
    moreHeading: 'Extra and bag yields',
    view: {
      label: 'Concrete needed',
      unit: 'cu yd',
      placard: 'cubic yards',
      sentence: 'That is {feet} cu ft with {waste}% extra, or {bags} bags of 80 lb at the yield you entered.',
      feet: 'In cubic feet',
      feetUnit: 'cu ft',
      net: 'Before the extra',
      bag40: '40 lb bags',
      bag60: '60 lb bags',
      bag80: '80 lb bags',
      scheduleHeading: 'Bags to buy',
      caption: 'Bags of premixed concrete for the volume with the extra, by bag weight',
      colBag: 'Bag',
      colYield: 'Yield (cu ft)',
      colBags: 'Bags to buy',
    },
    premises: [
      'A slab or footing is length × width × thickness ÷ 12, with the thickness in inches; a round column is pi × diameter² × height ÷ 4 ÷ 1,728, all in inches.',
      'The volume is multiplied by the quantity and by 1 plus the extra you enter; 27 cubic feet make 1 cubic yard.',
      'Bags are the volume with the extra divided by the yield of one bag, rounded up to a whole bag. The yields are examples: check the bag.',
      'Volumes are rounded to two decimals, half up, once at the end.',
    ],
  },
  howHeading: 'How to use the concrete calculator',
  howSteps: [
    'Choose a slab or footing, or a round column.',
    'Enter the size: length and width in feet and thickness in inches, or diameter and height in inches. Add how many and the extra for waste.',
    'Type the yields printed on the bags you can buy, then read the cubic yards and the bags, and save them as a PDF or a CSV.',
  ],
  worksHeading: 'How the concrete is worked out',
  formulaHeading: 'The formula',
  formula: [
    'Slab or footing: cubic feet = length × width × thickness ÷ 12, with the length and width in feet and the thickness in inches. Round column: cubic feet = π × diameter² × height ÷ 4 ÷ 1,728, with the diameter and height in inches, because a cubic foot is 1,728 cubic inches.',
    'Total = cubic feet × quantity × (1 + extra ÷ 100), and cubic yards = cubic feet ÷ 27. Bags = total in cubic feet ÷ the yield of one bag, rounded up.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'NIST, "Circumference, Area and Volume"', href: 'https://www.nist.gov/pml/owm/circumference-area-and-volume' },
    { label: 'NIST Handbook 44 (2026), Appendix C, "General Tables of Units of Measurement"', href: 'https://www.nist.gov/document/2026-nist-handbook-44-appendix-c' },
  ],
  disclaimer:
    'This calculator is an educational tool, and its result is an estimate. Check the yield printed on the bag, and ask the supplier or a contractor before you order.',
  faqHeading: 'Questions about concrete',
  faq: [
    {
      q: 'How many bags of concrete make a cubic yard?',
      a: 'It depends on the yield printed on the bag. A cubic yard is 27 cubic feet, so it takes 45 bags that make 0.60 cu ft each, 60 bags of 0.45 cu ft or 90 bags of 0.30 cu ft.',
    },
    {
      q: 'Why are the bag yields marked as examples?',
      a: 'The yield changes from one product to another, and each bag prints its own. The examples, 0.30, 0.45 and 0.60 cu ft for bags of 40, 60 and 80 lb, are a starting point: type the numbers from the bags you buy.',
    },
    {
      q: 'How much extra should I add?',
      a: 'The extra is for spills, an uneven base and forms that bow. The example uses 10%; your supplier or contractor can tell you what to add for your job.',
    },
    {
      q: 'Can I work out post holes or a round form tube?',
      a: 'Yes. Choose Round column, enter the diameter and the depth in inches, and the number of holes as the quantity. Each one is worked out as a cylinder; if a post stands in the hole, the concrete is a little less.',
    },
    {
      q: 'Why is the thickness in inches and the length in feet?',
      a: 'That is how slabs are described, as a 4-inch slab of 10 by 10 feet. The calculator divides the inches by 12, so every number is in feet before it multiplies.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so the measurements you type are never sent anywhere, and the link you copy keeps them after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
