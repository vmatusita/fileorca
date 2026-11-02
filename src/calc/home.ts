// The home calculators (prompt F7, decision 5): square footage, concrete, mulch and gravel, paint, tile and the room air
// conditioner size. US units only. Every typed number arrives as a whole number of a fixed scale (a length in
// hundredths of a foot or of an inch, an area in hundredths of a square foot), the accounts run as exact fractions in
// BigInt and are rounded once, at the end, half up, to the decimals the page shows (DECISOES § 258). What is bought
// (bags, gallons, tiles, boxes) is the ceiling of the exact value. A circle needs pi: there the account runs in floating
// point and the result also carries `exact`, the value before rounding, which tests/unit/calc-oracle.test.ts holds
// within 1e-9 of scripts/oracle/calc_home_health.py (50-digit decimal). Exact units from NIST HB 44 Appendix C:
// 1 ft = 12 in, 1 sq ft = 144 sq in, 1 cu ft = 1,728 cu in, 1 cu yd = 27 cu ft.

/** A fraction of two whole numbers, den > 0. */
interface Q {
  n: bigint;
  d: bigint;
}

const q = (n: number | bigint, d: number | bigint = 1n): Q => ({ n: BigInt(n), d: BigInt(d) });
const add = (a: Q, b: Q): Q => ({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
const sub = (a: Q, b: Q): Q => ({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
const mul = (a: Q, b: Q): Q => ({ n: a.n * b.n, d: a.d * b.d });
const div = (a: Q, b: Q): Q => (b.n < 0n ? { n: -a.n * b.d, d: -a.d * b.n } : { n: a.n * b.d, d: a.d * b.n });

/** a × scale rounded half up (a >= 0). */
export function roundQ(a: Q, scale = 100): number {
  const n = a.n * BigInt(scale);
  return Number((2n * n + a.d) / (2n * a.d));
}

/** The ceiling of a (a >= 0). */
export function ceilQ(a: Q): number {
  return Number((a.n + a.d - 1n) / a.d);
}

const toFloat = (a: Q): number => Number(a.n) / Number(a.d);

/** x × scale rounded half up, for a value with pi in it (the oracle keeps every case away from a tie). */
export function roundFloat(x: number, scale = 100): number {
  return Math.floor(x * scale + 0.5);
}

// --- square footage -------------------------------------------------------------------------------------------------

export type Shape = 'rect' | 'triangle' | 'circle';
export const SHAPES: readonly Shape[] = ['rect', 'triangle', 'circle'];

export interface AreaItem {
  shape: Shape;
  /** Length, base or diameter, in hundredths of a foot. */
  x: number;
  /** Width or height, in hundredths of a foot (not used by a circle). */
  y: number;
}

export interface SquareFootageInput {
  areas: AreaItem[];
}

export interface SquareFootageResult {
  items: { sqft: number; exact?: number }[];
  /** Hundredths of a square foot and of a square yard. */
  sqft: number;
  sqyd: number;
  exact?: { sqft: number; sqyd: number };
}

/** Energy Star: a rectangle is length × width, a triangle length × width ÷ 2; NIST: a circle is pi × diameter² ÷ 4. */
export function squareFootage(input: SquareFootageInput): SquareFootageResult {
  let rational = q(0);
  let circles = 0;
  let hasCircle = false;
  const items = input.areas.map((item) => {
    if (item.shape === 'circle') {
      hasCircle = true;
      circles += item.x * item.x;
      const exact = (Math.PI * item.x * item.x) / 40_000;
      return { sqft: roundFloat(exact), exact };
    }
    const area = q(item.x * item.y, item.shape === 'rect' ? 10_000 : 20_000);
    rational = add(rational, area);
    return { sqft: roundQ(area) };
  });
  if (!hasCircle) return { items, sqft: roundQ(rational), sqyd: roundQ(div(rational, q(9))) };
  const total = toFloat(rational) + (Math.PI * circles) / 40_000;
  const yards = total / 9;
  return { items, sqft: roundFloat(total), sqyd: roundFloat(yards), exact: { sqft: total, sqyd: yards } };
}

// --- concrete -------------------------------------------------------------------------------------------------------

export interface ConcreteInput {
  shape: 'slab' | 'round';
  /** Feet, in hundredths. */
  length: number;
  width: number;
  /** Inches, in hundredths. */
  thickness: number;
  diameter: number;
  depth: number;
  quantity: number;
  /** Whole percent. */
  waste: number;
  /** Cubic feet a 40, 60 and 80 lb bag makes, in hundredths. */
  y40: number;
  y60: number;
  y80: number;
}

export interface Volume {
  /** Hundredths of a cubic foot and of a cubic yard. */
  cuft: number;
  cuyd: number;
}

export interface ConcreteResult {
  net: Volume;
  total: Volume;
  bags: { b40: number; b60: number; b80: number };
  exact?: { cuft: number; cuyd: number };
}

export function concrete(input: ConcreteInput): ConcreteResult {
  const yields = { b40: input.y40, b60: input.y60, b80: input.y80 };
  if (input.shape === 'slab') {
    const per = q(input.length * input.width * input.thickness, 100 * 100 * 100 * 12);
    const net = mul(per, q(input.quantity));
    const total = mul(net, q(100 + input.waste, 100));
    return {
      net: { cuft: roundQ(net), cuyd: roundQ(div(net, q(27))) },
      total: { cuft: roundQ(total), cuyd: roundQ(div(total, q(27))) },
      bags: {
        b40: ceilQ(div(total, q(yields.b40, 100))),
        b60: ceilQ(div(total, q(yields.b60, 100))),
        b80: ceilQ(div(total, q(yields.b80, 100))),
      },
    };
  }
  // A cylinder: pi × diameter² × depth ÷ 4, in cubic inches, over 1,728.
  const per = Math.PI * toFloat(q(BigInt(input.diameter) ** 2n * BigInt(input.depth), 4 * 1728 * 100 ** 3));
  const net = per * input.quantity;
  const total = (net * (100 + input.waste)) / 100;
  return {
    net: { cuft: roundFloat(net), cuyd: roundFloat(net / 27) },
    total: { cuft: roundFloat(total), cuyd: roundFloat(total / 27) },
    bags: {
      b40: Math.ceil((total * 100) / yields.b40),
      b60: Math.ceil((total * 100) / yields.b60),
      b80: Math.ceil((total * 100) / yields.b80),
    },
    exact: { cuft: total, cuyd: total / 27 },
  };
}

// --- mulch and gravel -----------------------------------------------------------------------------------------------

export interface MulchInput {
  material: 'mulch' | 'gravel';
  mode: 'dims' | 'area';
  /** Feet, in hundredths. */
  length: number;
  width: number;
  /** Square feet, in hundredths. */
  area: number;
  /** Inches, in hundredths. */
  depth: number;
  /** Cubic feet per bag, in hundredths. */
  bag: number;
  /** Short tons per cubic yard, in hundredths. */
  density: number;
}

export interface MulchResult {
  sqft: number;
  cuft: number;
  cuyd: number;
  bags: number;
  /** Hundredths of a short ton (gravel only). */
  tons: number | null;
}

export function mulch(input: MulchInput): MulchResult {
  const area = input.mode === 'dims' ? q(input.length * input.width, 10_000) : q(input.area, 100);
  const cuft = mul(area, q(input.depth, 1200));
  const cuyd = div(cuft, q(27));
  return {
    sqft: roundQ(area),
    cuft: roundQ(cuft),
    cuyd: roundQ(cuyd),
    bags: ceilQ(div(cuft, q(input.bag, 100))),
    tons: input.material === 'gravel' ? roundQ(mul(cuyd, q(input.density, 100))) : null,
  };
}

// --- paint ----------------------------------------------------------------------------------------------------------

export interface PaintInput {
  mode: 'walls' | 'area';
  /** Feet, in hundredths. */
  perimeter: number;
  height: number;
  /** Square feet, in hundredths. */
  area: number;
  doors: number;
  doorArea: number;
  windows: number;
  windowArea: number;
  coats: number;
  /** Square feet per gallon. */
  coverage: number;
}

export type PaintResult =
  | { wall: number; openings: number; paintable: number; gallons: number; buy: number }
  | { error: 'no-area'; wall: number; openings: number };

export function paint(input: PaintInput): PaintResult {
  const wall = input.mode === 'walls' ? q(input.perimeter * input.height, 10_000) : q(input.area, 100);
  const openings = q(input.doors * input.doorArea + input.windows * input.windowArea, 100);
  const paintable = sub(wall, openings);
  if (paintable.n <= 0n) return { error: 'no-area', wall: roundQ(wall), openings: roundQ(openings) };
  const gallons = div(mul(paintable, q(input.coats)), q(input.coverage));
  return { wall: roundQ(wall), openings: roundQ(openings), paintable: roundQ(paintable), gallons: roundQ(gallons), buy: ceilQ(gallons) };
}

// --- tile -----------------------------------------------------------------------------------------------------------

export interface TileInput {
  /** Square feet, in hundredths. */
  area: number;
  /** The tile, in hundredths of an inch. */
  length: number;
  width: number;
  /** Whole percent. */
  waste: number;
  /** Tiles per box; 0 when the person leaves it out. */
  perBox: number;
}

export interface TileResult {
  tiles: number;
  boxes: number | null;
}

/** Area × 144 × (1 + waste) ÷ the tile's area, in square inches; the grout lines are left out. */
export function tile(input: TileInput): TileResult {
  const tiles = ceilQ(q(BigInt(input.area) * 144n * BigInt(100 + input.waste), BigInt(input.length) * BigInt(input.width)));
  return { tiles, boxes: input.perBox > 0 ? ceilQ(q(tiles, input.perBox)) : null };
}

// --- BTU: the Energy Star table of a room air conditioner -----------------------------------------------------------

/**
 * "Area To Be Cooled (square feet)" and "Capacity Needed (BTUs per hour)" of energystar.gov/products/room_air_conditioners,
 * read on 2026-11-02: each row runs from its first number up to (not including) the next one; the last row includes
 * 2,500 square feet.
 */
export const ENERGY_STAR_ROWS: readonly (readonly [from: number, upTo: number, btu: number])[] = [
  [100, 150, 5_000],
  [150, 250, 6_000],
  [250, 300, 7_000],
  [300, 350, 8_000],
  [350, 400, 9_000],
  [400, 450, 10_000],
  [450, 550, 12_000],
  [550, 700, 14_000],
  [700, 1_000, 18_000],
  [1_000, 1_200, 21_000],
  [1_200, 1_400, 23_000],
  [1_400, 1_500, 24_000],
  [1_500, 2_000, 30_000],
  [2_000, 2_500, 34_000],
];

export interface BtuInput {
  /** Square feet, in hundredths (100 to 2,500 square feet). */
  area: number;
  sun: 'normal' | 'shade' | 'sun';
  people: number;
  kitchen: boolean;
}

export interface BtuResult {
  /** The table's capacity, then what each adjustment adds (the shade takes away), then the total. */
  base: number;
  sun: number;
  people: number;
  kitchen: number;
  btu: number;
}

/** The table, then 10% less in heavy shade or 10% more in a very sunny room, then 600 per person past two, then 4,000 in a kitchen (DECISOES § 260). */
export function btu(input: BtuInput): BtuResult {
  const row = ENERGY_STAR_ROWS.find(([from, upTo]) => input.area >= from * 100 && (input.area < upTo * 100 || (upTo === 2_500 && input.area === 250_000)));
  const base = row ? row[2] : 0;
  const sun = input.sun === 'shade' ? -base / 10 : input.sun === 'sun' ? base / 10 : 0;
  const people = 600 * Math.max(0, input.people - 2);
  const kitchen = input.kitchen ? 4_000 : 0;
  return { base, sun, people, kitchen, btu: base + sun + people + kitchen };
}
