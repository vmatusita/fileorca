import type { LifeHubTexts } from '../types.ts';

export default {
  title: 'Home Calculators: Square Footage, Concrete, Paint and More',
  description: 'Free home calculators for square footage, concrete, mulch and gravel, paint, tile and air conditioner size, in US units. Your numbers stay on your device.',
  eyebrow: 'Home calculators',
  h1: 'Calculators for home projects',
  intro: 'Measure once, then get the square feet, the cubic yards, the gallons or the bags. Nothing you type leaves your device.',
  listHeading: 'Measure, pour, paint and cool',
  worksHeading: 'How these calculators work',
  worksIntro: [
    'Every calculator here runs in your browser, in US units: feet, inches, square feet, cubic yards, gallons and BTU per hour. The values a field starts with are an example; the result changes as you type, and you can save it as a PDF or a CSV, or copy a link that keeps your numbers after the #.',
    'The areas and volumes are worked out as exact fractions and rounded once, at the end, to two decimals. What you buy (bags, gallons, tiles, boxes) is rounded up. The engines were checked against an independent oracle and against the Energy Star table they use.',
  ],
  formulaHeading: 'The formulas behind them',
  formula: [
    'Area: a rectangle is length × width and a triangle length × width ÷ 2, as Energy Star measures a room; a circle is π × diameter² ÷ 4. Volume: the area times the depth, with the inches divided by 12.',
    'Units: 12 inches to the foot, 144 square inches to the square foot, 1,728 cubic inches to the cubic foot and 27 cubic feet to the cubic yard, the exact relations of NIST Handbook 44.',
  ],
  premisesHeading: 'What every calculator assumes',
  premises: [
    'Your measures are in feet and inches; the calculators do not take metric units.',
    'What a bag, a can or a box covers is a field you fill in from the label: the values it starts with are examples.',
    'The results are estimates for buying materials, with no allowance for spills, uneven ground or the cuts a pro would plan, beyond the extra you type.',
  ],
  exampleHeading: 'A worked example',
  exampleIntro: 'The square footage calculator opens with a 14 by 12 ft room and a triangle of 6 by 4 ft. The engine gives:',
  sourcesHeading: 'Sources',
  sources: [
    { label: 'ENERGY STAR, "Room Air Conditioners": how to measure a room, and the capacity table', href: 'https://www.energystar.gov/products/room_air_conditioners' },
    { label: 'NIST Office of Weights and Measures, "Circumference, Area and Volume"', href: 'https://www.nist.gov/pml/owm/circumference-area-and-volume' },
    { label: 'NIST Handbook 44, Appendix C, "General Tables of Units of Measurement"', href: 'https://www.nist.gov/document/2026-nist-handbook-44-appendix-c' },
  ],
  disclaimerHeading: 'Educational tools',
  disclaimer: 'These calculators are educational tools that give estimates. Check the label of every bag, can and box, and ask a contractor or the store before a large order.',
} satisfies LifeHubTexts;
