import type { CalcPageTexts } from '../../calc/types.ts';

export default {
  title: 'Tile Calculator: Tiles and Boxes for a Floor or Wall',
  description: 'Work out how many tiles and boxes a floor or a wall needs from its area in square feet and the tile size in inches, with extra for cuts.',
  h1: 'Tile calculator',
  lead: 'How many tiles and boxes a floor or a wall takes, with extra for cuts.',
  panel: {
    fields: {
      ar: { label: 'Area', suffix: 'sq ft', error: 'Enter an area from 0.01 to 20,000 sq ft.' },
      wa: { label: 'Extra for cuts', suffix: '%', error: 'Enter an extra from 0 to 50%.' },
      tl: { label: 'Tile length', suffix: 'in', error: 'Enter a length from 0.5 to 96 in.' },
      tw: { label: 'Tile width', suffix: 'in', error: 'Enter a width from 0.5 to 96 in.' },
      pb: {
        label: 'Tiles per box',
        help: 'Printed on the box. Leave 0 if you don’t know it, and only the tiles are counted.',
        error: 'Enter from 0 to 500 tiles per box.',
      },
    },
    moreHeading: 'Boxes',
    view: {
      label: 'Tiles needed',
      unit: 'tiles',
      placard: 'tiles',
      sentence: 'Counted for {size} tiles with {waste}% extra for cuts. Boxes of {per} to buy: {boxes}.',
      sentenceNoBox: 'Counted for {size} tiles with {waste}% extra for cuts. Enter the tiles per box to count the boxes.',
      size: '{x} × {y} in',
      area: 'Area',
      areaUnit: 'sq ft',
      tile: 'Tile size',
      waste: 'Extra for cuts',
      boxes: 'Boxes to buy',
      noBox: 'Not counted: tiles per box is 0',
      scheduleHeading: 'Tiles and boxes',
      caption: 'The area, the tile, the extra and what to buy',
      colItem: 'Item',
      colAmount: 'Amount',
    },
    premises: [
      'Tiles = area × 144 × (1 + extra ÷ 100) ÷ (tile length × tile width), rounded up to a whole tile; 144 square inches make 1 square foot.',
      'The grout lines are left out: each tile counts only its own size, so the count is a little more than a layout with wide joints needs.',
      'Boxes = tiles ÷ tiles per box, rounded up. With 0 tiles per box, the boxes are not counted.',
      'The calculator does not lay out the tiles: the extra you enter stands for the cuts at the edges, the pattern and breakage.',
    ],
  },
  howHeading: 'How to use the tile calculator',
  howSteps: [
    'Enter the area of the floor or the wall in square feet, and the extra for cuts.',
    'Enter the length and the width of one tile in inches.',
    'Add the tiles per box if you know it, then read the tiles and boxes to buy and save them as a PDF or a CSV.',
  ],
  worksHeading: 'How the tiles are worked out',
  formulaHeading: 'The formula',
  formula: [
    'Area in square inches = area in square feet × 144. Tiles = area in square inches × (1 + extra ÷ 100) ÷ (tile length × tile width, in inches), rounded up to a whole tile.',
    'Boxes = tiles ÷ tiles per box, rounded up to a whole box.',
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
    'This calculator is an educational tool, and its result is an estimate. Check the tile size and the count on the box, and ask the store or your installer before you buy.',
  faqHeading: 'Questions about tile',
  faq: [
    {
      q: 'How much extra tile should I add?',
      a: 'It depends on the layout: a diagonal or herringbone layout cuts more tiles than a straight one.',
    },
    {
      q: 'Why are the grout lines left out?',
      a: 'A joint is a fraction of an inch and changes with the tile and the installer.',
    },
    {
      q: 'How do I tile a room that is not a rectangle?',
      a: 'Work out the area in the square footage calculator, shape by shape, and type the total here as the area.',
    },
    {
      q: 'What if I don’t know the tiles per box?',
      a: 'Leave it at 0, and you still get the number of tiles to buy.',
    },
    {
      q: 'Does it work for a wall or a backsplash?',
      a: 'Yes, the count is the same on a wall. Enter the wall area in square feet, without the windows and doors you won’t tile.',
    },
  ],
  privacyHeading: 'Privacy',
  privacyNote:
    'Your numbers stay on your device. The calculator runs in your browser, so the measurements you type are never sent anywhere, and the link you copy keeps them after the #, a part of the address your browser never sends.',
  relatedHeading: 'Related calculators',
} satisfies CalcPageTexts;
