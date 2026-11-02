import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'BTU Calculator: Room Air Conditioner Size by Energy Star',
  description: 'Find the size of a room air conditioner in BTU per hour from the Energy Star table, adjusted for sun or shade, the people in the room and a kitchen.',
  h1: 'BTU calculator',
  lead: 'The size of a room air conditioner, in BTU per hour, from the Energy Star table.',
  panel: {
    fields: {
      ar: { label: 'Room area', suffix: 'sq ft', error: 'Enter an area from 100 to 2,500 sq ft, the range of the Energy Star table.' },
      pe: { label: 'People in the room', error: 'Enter from 1 to 20 people.' },
      su: { label: 'Sunlight', error: '' },
      ki: { label: 'In a kitchen', error: '' },
    },
    options: {
      su: { normal: 'Normal', shade: 'Heavy shade', sun: 'Very sunny' },
      ki: { no: 'No', yes: 'Yes' },
    },
    view: {
      label: 'AC size',
      unit: 'BTU/hr',
      placard: 'BTU per hour',
      sentence: 'The Energy Star table gives {base} BTU per hour for this area, before the steps for sun, people and a kitchen.',
      base: 'Energy Star table for {area} sq ft',
      normal: 'Normal sun (no change)',
      shade: 'Heavy shade (10% less)',
      sunny: 'Very sunny (10% more)',
      people: 'People past two (600 each)',
      kitchen: 'Kitchen',
      scheduleHeading: 'How the size is worked out',
      caption: 'The Energy Star table and each adjustment, in BTU per hour',
      colStep: 'Step',
      colBtu: 'BTU per hour',
    },
    premises: [
      'The base is the Energy Star table for a room air conditioner: each row runs from its first area up to the next one, without it, and the last row includes 2,500 sq ft.',
      'Then, in this order: 10% less in a heavily shaded room or 10% more in a very sunny one, taken on the table value; 600 BTU per hour for each person past two; and 4,000 BTU per hour in a kitchen. Energy Star sets no order; this page applies them in this one.',
      'Energy Star calculates the capacities for an 8-foot ceiling.',
      'It sizes a room air conditioner for one room, not a central system.',
    ],
  },
  howHeading: 'How to use the BTU calculator',
  howSteps: [
    'Enter the area of the room in square feet; the square footage calculator can add up a room of several shapes.',
    'Enter how many people are usually in the room, and choose the sunlight and whether it is a kitchen.',
    'Read the size in BTU per hour and each step that made it, and save them as a PDF or a CSV.',
  ],
  worksHeading: 'How the AC size is worked out',
  formulaHeading: 'The formula',
  formula: [
    'BTU per hour = the Energy Star table value for the area, minus 10% of that value for heavy shade or plus 10% for a very sunny room, + 600 for each person past two, + 4,000 in a kitchen.',
    'The table, in square feet and BTU per hour: 100 up to 150, 5,000; 150 up to 250, 6,000; 250 up to 300, 7,000; 300 up to 350, 8,000; 350 up to 400, 9,000; 400 up to 450, 10,000; 450 up to 550, 12,000; 550 up to 700, 14,000; 700 up to 1,000, 18,000; 1,000 up to 1,200, 21,000; 1,200 up to 1,400, 23,000; 1,400 up to 1,500, 24,000; 1,500 up to 2,000, 30,000; 2,000 to 2,500, 34,000.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [{ label: 'Energy Star, "Room Air Conditioners" (sizing table and adjustments)', href: 'https://www.energystar.gov/products/room_air_conditioners' }],
  disclaimer:
    'This calculator is an educational tool, and its result is an estimate from the Energy Star table. Check the capacity on the unit, and ask an HVAC professional about your room.',
  faqHeading: 'Questions about AC size',
  faq: [
    {
      q: 'What does BTU mean?',
      a: 'British thermal unit: the heat it takes to warm one pound of water by one degree Fahrenheit. The capacity of an air conditioner is the heat it removes in an hour, in BTU per hour.',
    },
    {
      q: 'Why is a room of exactly 150 sq ft in the 6,000 row?',
      a: 'Each Energy Star row runs from its first number up to the next one, without including it, so 150 sq ft starts the row of 150 up to 250. Only the last row includes its top, 2,500 sq ft.',
    },
    {
      q: 'In what order are the adjustments made?',
      a: 'Energy Star lists them without an order. This page takes the sun first, as 10% of the table value, then adds 600 for each person past two and 4,000 for a kitchen. A very sunny room of 9,000 gets 900 more, whatever the people and the kitchen add.',
    },
    {
      q: 'What if my room is larger than 2,500 sq ft?',
      a: 'The Energy Star table stops at 2,500 sq ft, and so does the calculator. A larger space, or a whole home, needs a cooling load calculation by an HVAC professional.',
    },
    {
      q: 'Does the ceiling height matter?',
      a: 'Yes. Energy Star calculates the capacities for an 8-foot ceiling. A room with a higher ceiling has more air to cool, so ask a professional before you buy.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so the area and the details you enter are never sent anywhere, and the link you copy keeps them after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
