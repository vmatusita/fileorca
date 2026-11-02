import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Square Footage Calculator for Rooms, Triangles and Circles',
  description: 'Work out the area of a room or a yard in square feet and square yards, adding up rectangles, triangles and circles, with a table of each shape.',
  h1: 'Square footage calculator',
  lead: 'Square feet of a room or a yard.',
  panel: {
    fields: {
      a: { label: 'Your areas', error: '' },
      s: { label: 'Shape', error: '' },
      x: { label: 'Length', suffix: 'ft', error: 'Enter a length from 0.01 to 300 ft.' },
      y: { label: 'Width', suffix: 'ft', error: 'Enter a width from 0.01 to 300 ft.' },
      'x-rect': { label: 'Length', suffix: 'ft', error: 'Enter a length from 0.01 to 300 ft.' },
      'y-rect': { label: 'Width', suffix: 'ft', error: 'Enter a width from 0.01 to 300 ft.' },
      'x-triangle': { label: 'Base', suffix: 'ft', error: 'Enter a base from 0.01 to 300 ft.' },
      'y-triangle': { label: 'Height', suffix: 'ft', error: 'Enter a height from 0.01 to 300 ft.' },
      'x-circle': { label: 'Diameter', suffix: 'ft', error: 'Enter a diameter from 0.01 to 300 ft.' },
    },
    options: { s: { rect: 'Rectangle', triangle: 'Triangle', circle: 'Circle' } },
    view: {
      label: 'Total area',
      unit: 'sq ft',
      placard: 'sq ft',
      sentence: 'That is {yards} square yards. Areas added up: {n}.',
      yards: 'In square yards',
      yardUnit: 'sq yd',
      count: 'Areas added up',
      row: 'Area {n}',
      addRow: 'Add an area',
      removeRow: 'Remove area {n}',
      sides: '{x} × {y} ft',
      diameter: 'Diameter {x} ft',
      scheduleHeading: 'The areas, shape by shape',
      caption: 'The area of each shape, in square feet',
      colArea: 'Area',
      colShape: 'Shape',
      colSize: 'Size',
      colSqft: 'Square feet',
    },
    premises: [
      'A rectangle is length × width and a triangle is base × height ÷ 2, the way Energy Star measures a room; a circle is pi × diameter² ÷ 4, from NIST.',
      'Lengths are in feet with decimals: 12 ft 6 in is 12.5 ft.',
      'The areas are added up and nothing is taken away. One square yard is 9 square feet.',
      'Each area and the total are rounded to two decimals, half up; the total is added up before it is rounded.',
    ],
  },
  howHeading: 'How to use the square footage calculator',
  howSteps: [
    'Split the space into rectangles, triangles and circles, and measure each one in feet.',
    'Choose the shape of each area and enter its sides or its diameter. Add up to 10 areas.',
    'Read the total in square feet and square yards, and save the table as a PDF or a CSV.',
  ],
  worksHeading: 'How square footage is worked out',
  formulaHeading: 'The formula',
  formula: [
    'Rectangle: length × width. Triangle: base × height ÷ 2, with the height measured square to the base. Circle: π × diameter² ÷ 4, which NIST writes as 0.7854 × diameter × diameter.',
    'Inches become a decimal of a foot first: 12 ft 6 in is 12.5 ft, the Energy Star example. The total is the sum of the areas, and square yards = square feet ÷ 9.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'Energy Star, "Room Air Conditioners" (how to measure a room)', href: 'https://www.energystar.gov/products/room_air_conditioners' },
    { label: 'NIST, "Circumference, Area and Volume"', href: 'https://www.nist.gov/pml/owm/circumference-area-and-volume' },
  ],
  disclaimer:
    'This calculator is an educational tool, and its result is an estimate. Measure twice, and check the area with your contractor or supplier before you order materials.',
  faqHeading: 'Questions about square footage',
  faq: [
    {
      q: 'How do I measure a room that is not a rectangle?',
      a: 'Split it into rectangles, triangles and circles, the way Energy Star suggests, and enter each one as an area. The calculator adds them up.',
    },
    {
      q: 'How do I enter feet and inches?',
      a: 'Divide the inches by 12 and add them to the feet: 6 inches make 0.5 ft, so 12 ft 6 in is 12.5 ft. Three inches make 0.25 ft, and 9 inches make 0.75 ft.',
    },
    {
      q: 'How many square feet are in a square yard?',
      a: 'Nine. A yard is 3 feet, so a square yard is 3 × 3 = 9 square feet. The calculator shows the total in both units.',
    },
    {
      q: 'How do I leave out a part I won’t cover, like a kitchen island?',
      a: 'The calculator only adds. Split the floor around the island into rectangles and enter those, or work out the area of the island and take it from the total yourself.',
    },
    {
      q: 'Why can the total differ by 0.01 from the sum of the rows?',
      a: 'Each row is rounded to two decimals, and the total is worked out from the exact areas before it is rounded. Adding the rounded rows can land a hundredth away.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so the measurements you type are never sent anywhere, and the link you copy keeps them after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
