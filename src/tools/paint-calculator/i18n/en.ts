import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Paint Calculator: Gallons for the Walls of a Room',
  description: 'Work out how many gallons of paint the walls of a room need, after doors and windows, for one to three coats at the coverage printed on your can.',
  h1: 'Paint calculator',
  lead: 'How many gallons of paint the walls of a room take, after the doors and windows.',
  panel: {
    fields: {
      mo: { label: 'Measure by', error: '' },
      co: { label: 'Coats', error: 'Enter from 1 to 3 coats.' },
      pe: { label: 'Perimeter', suffix: 'ft', error: 'Enter a perimeter from 1 to 1,000 ft.' },
      he: { label: 'Wall height', suffix: 'ft', error: 'Enter a height from 1 to 30 ft.' },
      ar: { label: 'Total area', suffix: 'sq ft', error: 'Enter an area from 1 to 20,000 sq ft.' },
      cv: {
        label: 'Coverage',
        suffix: 'sq ft',
        help: 'Check the can: the label says how many square feet a gallon covers.',
        error: 'Enter a coverage from 100 to 1,000 sq ft per gallon.',
      },
      dr: { label: 'Doors', error: 'Enter from 0 to 50 doors.' },
      da: {
        label: 'Door area',
        suffix: 'sq ft',
        help: 'The example, 21 sq ft, is a door 3 ft wide and 7 ft tall.',
        error: 'Enter a door area from 1 to 100 sq ft.',
      },
      wi: { label: 'Windows', error: 'Enter from 0 to 100 windows.' },
      wn: {
        label: 'Window area',
        suffix: 'sq ft',
        help: 'The example, 15 sq ft, is a window 3 ft wide and 5 ft tall.',
        error: 'Enter a window area from 1 to 100 sq ft.',
      },
    },
    options: { mo: { walls: 'Room walls', area: 'Total area' } },
    moreHeading: 'Coverage, doors and windows',
    view: {
      label: 'Paint needed',
      unit: 'gal',
      placard: 'gallons to buy',
      sentence: 'That is {area} sq ft to paint, times {coats} for the coats, at {coverage} sq ft a gallon. Gallons to buy, rounded up: {buy}.',
      noArea: 'The doors and windows cover the whole wall, so there is nothing left to paint. Check how many there are and their areas.',
      areaUnit: 'sq ft',
      wall: 'Wall area',
      openings: 'Doors and windows',
      paintable: 'Area to paint',
      coats: 'Coats',
      buy: 'Gallons to buy',
      scheduleHeading: 'How the gallons are worked out',
      caption: 'The wall, the doors and windows, and the paint',
      colItem: 'Item',
      colAmount: 'Amount',
    },
    premises: [
      'Wall area = perimeter of the room × wall height, or the area you type; each door and each window takes away the area you give it.',
      'Gallons = area to paint × coats ÷ coverage. The coverage, 350 sq ft per gallon, is an example: check the can.',
      'The gallons needed are rounded to two decimals, half up, and the gallons to buy are rounded up to whole gallons.',
      'Primer, ceilings and trim are left out: work each one out on its own, with the coverage on its can.',
    ],
  },
  howHeading: 'How to use the paint calculator',
  howSteps: [
    'Choose room walls to enter the perimeter and the wall height, or total area to type the square feet.',
    'Pick 1, 2 or 3 coats.',
    'Set the coverage from your can and the doors and windows, then read the gallons to buy and save them as a PDF or a CSV.',
  ],
  worksHeading: 'How the paint is worked out',
  formulaHeading: 'The formula',
  formula: [
    'Wall area = perimeter × wall height, in feet, or the area you type. Area to paint = wall area − doors × area of a door − windows × area of a window.',
    'Gallons = area to paint × coats ÷ coverage in square feet per gallon, and the gallons to buy are that number rounded up. The coverage comes from the can: the EPA Wall Paint Exposure Model takes 400 sq ft per gallon as its default, from the labels on paint cans, and the calculator starts at 350 as an example.',
  ],
  premisesHeading: 'Assumptions',
  exampleHeading: 'Worked example',
  exampleIntro: 'This is the example the calculator opens with, worked out by the same engine you use above.',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'NIST, "Circumference, Area and Volume"', href: 'https://www.nist.gov/pml/owm/circumference-area-and-volume' },
    { label: 'EPA, "Wall Paint Exposure Model (WPEM) Version 3.2 User’s Guide"', href: 'https://www.epa.gov/sites/default/files/2015-05/documents/wpemman_0.pdf' },
  ],
  disclaimer:
    'This calculator is an educational tool, and its result is an estimate. Check the coverage on the can, and ask the store or a painter about your walls.',
  faqHeading: 'Questions about paint',
  faq: [
    {
      q: 'How do I find the perimeter of a room?',
      a: 'Add up the length of every wall. A room of 14 by 10 feet has a perimeter of 14 + 10 + 14 + 10 = 48 ft.',
    },
    {
      q: 'How much does a gallon of paint cover?',
      a: 'The can says, and it changes with the paint and the wall. The EPA Wall Paint Exposure Model uses 400 sq ft per gallon as its default, taken from the labels on paint cans. The calculator starts at 350 as an example: type the number on your can.',
    },
    {
      q: 'Does the calculator subtract doors and windows?',
      a: 'Yes, at the areas you give: in the example, 21 sq ft for a door of 3 by 7 ft and 15 sq ft for a window of 3 by 5 ft. Set both counts to 0 to paint the whole wall.',
    },
    {
      q: 'How do the coats change the result?',
      a: 'Each coat covers the whole area again, so two coats take twice the paint of one. The calculator takes from 1 to 3 coats; the can may say how many it needs.',
    },
    {
      q: 'Can I work out a ceiling?',
      a: 'Yes. Choose Total area, type the ceiling area (the length × the width of the room) and set the doors and windows to 0. Ceiling paint can have its own coverage, so check that can.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so the measurements you type are never sent anywhere, and the link you copy keeps them after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
