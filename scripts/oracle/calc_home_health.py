#!/usr/bin/env python3
"""Independent oracle for the FileOrca home and health calculators (run F7, decision 4).

Run it outside the Node project, with uv and nothing but the standard library:

    uv run --no-project --python 3.13 python -I scripts/oracle/calc_home_health.py

`--check` recomputes everything and compares with the files on disk without writing; `--only <id>` does one
calculator. It is self-contained: it imports nothing from the repository and nothing from calc.py or calc_br.py, whose
fixtures stay byte for byte as they are. For each calculator it writes fixtures/calc/<id>.json with the inputs in
engine units and the expected outputs. The CI never runs this script: it only reads the JSON
(tests/unit/calc-oracle.test.ts).

Conventions (prompt F7, decisions 2 to 5; DECISOES of the F7):

- Every typed number is a whole number of a fixed scale: a length in hundredths of a foot or of an inch, an area in
  hundredths of a square foot, a weight in tenths of a pound or of a kilogram, a circumference in tenths of an inch or of
  a centimetre, a bag in hundredths of a cubic foot. Dates are "YYYY-MM-DD" days of the Gregorian calendar.
- Exact units (NIST HB 44 Appendix C and SP 811): 1 in = 2.54 cm, 1 lb = 0.45359237 kg, 1 ft = 12 in, 1 yd = 3 ft,
  1 yd3 = 27 ft3, 1 ft3 = 1,728 in3, 1 short ton = 2,000 lb.
- Rational accounts (areas, volumes, BMI, calories, gallons, tiles) run in Fraction and are rounded once, at the end,
  half up, to the decimals the page shows. What is bought (bags, gallons, boxes, tiles) is the ceiling of the exact value.
- pi (a circle) and log10 (the Navy body fat equations) run in Decimal with 50 digits. Those outputs also store
  `exact`, the value before rounding with 30 significant digits; the engine works in floating point and the test asks
  for the same shown value and a difference under 1e-9 before rounding. A random draw whose shown value lies less than
  1e-9 from a rounding tie (or a ceiling from a whole number) is drawn again, and the fixture says how many were.
- Days are counted with date.toordinal(); the island reads "today" once from the device and passes it in.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import platform
import random
import sys
from datetime import date, timedelta
from decimal import Decimal as D, localcontext
from fractions import Fraction as F
from pathlib import Path

SCRIPT = Path(__file__).resolve()
REPO = SCRIPT.parents[1].parent
OUT = REPO / 'fixtures' / 'calc'
SCRIPT_NAME = 'scripts/oracle/calc_home_health.py'
SEED = '2026-11-02'

PI = D('3.14159265358979323846264338327950288419716939937510582097494459230781640628620899')
LB_KG = F('0.45359237')
IN_CM = F('2.54')
TIE = D('1e-9')


class OracleError(Exception):
    pass


class NearTie(Exception):
    """A shown value within 1e-9 of a rounding tie: the draw is redone (never stored)."""


def ensure(condition: bool, message: str) -> None:
    if not condition:
        raise OracleError(message)


# --- rounding ---------------------------------------------------------------------------------------------------


def half_up(x: F, scale: int) -> int:
    """x * scale rounded half up (x >= 0), exactly."""
    ensure(x >= 0, f'negative value {x}')
    q = x * scale
    return (q.numerator * 2 + q.denominator) // (2 * q.denominator)


def ceil_f(x: F) -> int:
    return -((-x.numerator) // x.denominator)


def dec(x: D) -> D:
    with localcontext() as ctx:
        ctx.prec = 50
        return +x


def half_up_d(x: D, scale: int) -> int:
    """An irrational value (Decimal, 50 digits) rounded half up at `scale`; a value too close to a tie is refused."""
    with localcontext() as ctx:
        ctx.prec = 50
        q = x * scale
        whole = int(q.to_integral_value(rounding='ROUND_FLOOR'))
        frac = q - whole
        if abs(frac - D('0.5')) < TIE * scale:
            raise NearTie()
        return whole + (1 if frac >= D('0.5') else 0)


def ceil_d(x: D) -> int:
    with localcontext() as ctx:
        ctx.prec = 50
        whole = int(x.to_integral_value(rounding='ROUND_FLOOR'))
        frac = x - whole
        if frac < TIE or 1 - frac < TIE:
            raise NearTie()
        return whole + (1 if frac > 0 else 0)


def exact_text(x: D) -> str:
    with localcontext() as ctx:
        ctx.prec = 30
        return str(+x)


def to_d(x: F) -> D:
    with localcontext() as ctx:
        ctx.prec = 50
        return D(x.numerator) / D(x.denominator)


# --- square footage (Energy Star: rectangle and triangle; NIST: circle) ---------------------------------------------

SHAPES = ('rect', 'triangle', 'circle')


def area_of(item: dict):
    """One area in square feet: a Fraction, or a Decimal for a circle. x and y in hundredths of a foot."""
    x, y = item['x'], item['y']
    if item['shape'] == 'rect':
        return F(x * y, 10_000)
    if item['shape'] == 'triangle':
        return F(x * y, 20_000)
    ensure(item['shape'] == 'circle', f'unknown shape {item["shape"]}')
    with localcontext() as ctx:
        ctx.prec = 50
        return PI * D(x * x) / D(40_000)


def square_footage(inp: dict) -> dict:
    items = []
    exact_sum = F(0)
    circle = D(0)
    any_circle = False
    for item in inp['areas']:
        value = area_of(item)
        if isinstance(value, F):
            items.append({'sqft': half_up(value, 100)})
            exact_sum += value
        else:
            any_circle = True
            items.append({'sqft': half_up_d(value, 100), 'exact': exact_text(value)})
            circle += value
    if not any_circle:
        return {'items': items, 'sqft': half_up(exact_sum, 100), 'sqyd': half_up(exact_sum / 9, 100)}
    with localcontext() as ctx:
        ctx.prec = 50
        total = to_d(exact_sum) + circle
        yards = total / 9
    return {
        'items': items,
        'sqft': half_up_d(total, 100),
        'sqyd': half_up_d(yards, 100),
        'exact': {'sqft': exact_text(total), 'sqyd': exact_text(yards)},
    }


def square_footage_cases() -> list[dict]:
    # One area, so the result stays above the fold on a phone (DECISOES § 268); the two-area example stays as a grid case.
    out = [case('page-example', 'page-example', {'areas': [{'shape': 'rect', 'x': 1500, 'y': 1200}]})]
    out.append(case('two-areas', 'grid', {'areas': [{'shape': 'rect', 'x': 1400, 'y': 1200}, {'shape': 'triangle', 'x': 600, 'y': 400}]}))
    corners = [1, 2, 99, 100, 1250, 29_999, 30_000]
    n = 1
    for shape in SHAPES:
        for x in corners:
            for y in (1, 1000, 30_000):
                if shape == 'circle' and y != 1000:
                    continue
                add_safe(out, f'grid-{n:03d}', 'grid', {'areas': [{'shape': shape, 'x': x, 'y': y}]}, square_footage)
                n += 1
    out.append(case(f'grid-{n:03d}', 'grid', {'areas': [{'shape': 'rect', 'x': 30_000, 'y': 30_000}] * 10}))
    n += 1
    add_safe(out, f'grid-{n:03d}', 'grid', {'areas': [{'shape': SHAPES[i % 3], 'x': 1000 + i, 'y': 800 + i} for i in range(10)]}, square_footage)
    n += 1
    # Energy Star's own example: 12 ft 6 in is 12.5 ft.
    out.append(case('energystar-12-ft-6-in', 'energystar', {'areas': [{'shape': 'rect', 'x': 1250, 'y': 1000}]}))
    return out


def square_footage_random(rng: random.Random, _index: int) -> dict:
    rows = rng.randint(1, 10)
    return {'areas': [{'shape': rng.choice(SHAPES), 'x': length(rng, 30_000), 'y': length(rng, 30_000)} for _ in range(rows)]}


def length(rng: random.Random, top: int) -> int:
    """A length in hundredths: whole feet half the time, any hundredth otherwise, small values as often as big ones."""
    kind = rng.random()
    if kind < 0.5:
        return 100 * rng.randint(1, top // 100)
    if kind < 0.75:
        return rng.randint(1, min(top, 5_000))
    return rng.randint(1, top)


# --- concrete (NIST: rectangular bin and cylinder) ------------------------------------------------------------------


def concrete(inp: dict) -> dict:
    if inp['shape'] == 'slab':
        per = F(inp['length'] * inp['width'] * inp['thickness'], 100 * 100 * 100 * 12)
        rational = True
    else:
        ensure(inp['shape'] == 'round', 'unknown shape')
        with localcontext() as ctx:
            ctx.prec = 50
            per = PI * D(inp['diameter'] ** 2 * inp['depth']) / D(4 * 1728 * 100**3)
        rational = False
    q = inp['quantity']
    w = inp['waste']
    yields = {'b40': inp['y40'], 'b60': inp['y60'], 'b80': inp['y80']}
    if rational:
        net = per * q
        total = net * F(100 + w, 100)
        return {
            'net': {'cuft': half_up(net, 100), 'cuyd': half_up(net / 27, 100)},
            'total': {'cuft': half_up(total, 100), 'cuyd': half_up(total / 27, 100)},
            'bags': {k: ceil_f(total / F(v, 100)) for k, v in yields.items()},
        }
    with localcontext() as ctx:
        ctx.prec = 50
        net = per * q
        total = net * D(100 + w) / D(100)
        return {
            'net': {'cuft': half_up_d(net, 100), 'cuyd': half_up_d(net / 27, 100)},
            'total': {'cuft': half_up_d(total, 100), 'cuyd': half_up_d(total / 27, 100)},
            'bags': {k: ceil_d(total * 100 / D(v)) for k, v in yields.items()},
            'exact': {'cuft': exact_text(total), 'cuyd': exact_text(total / 27)},
        }


CONCRETE_EXAMPLE = {'shape': 'slab', 'length': 1000, 'width': 1000, 'thickness': 400, 'diameter': 1200, 'depth': 3600, 'quantity': 1, 'waste': 10, 'y40': 30, 'y60': 45, 'y80': 60}


def concrete_cases() -> list[dict]:
    out = [case('page-example', 'page-example', dict(CONCRETE_EXAMPLE))]
    n = 1
    for shape in ('slab', 'round'):
        for a in (1, 100, 50_000 if shape == 'slab' else 24_000):
            for b in (1, 400, 6_000 if shape == 'slab' else 24_000):
                for q, w in ((1, 0), (100, 50)):
                    inp = dict(CONCRETE_EXAMPLE, shape=shape, quantity=q, waste=w)
                    if shape == 'slab':
                        inp.update(length=a, width=a, thickness=b)
                    else:
                        inp.update(diameter=a, depth=b)
                    for y in ((1, 1, 1), (500, 500, 500)):
                        add_safe(out, f'grid-{n:03d}', 'grid', dict(inp, y40=y[0], y60=y[1], y80=y[2]), concrete)
                        n += 1
    return out


def concrete_random(rng: random.Random, _index: int) -> dict:
    shape = rng.choice(('slab', 'round'))
    return {
        'shape': shape,
        'length': length(rng, 50_000),
        'width': length(rng, 50_000),
        'thickness': rng.choice((350, 400, 600, 800, 1200, rng.randint(1, 6_000))),
        'diameter': rng.choice((600, 800, 1000, 1200, 1800, rng.randint(1, 24_000))),
        'depth': rng.choice((1200, 2400, 3600, 4800, rng.randint(1, 24_000))),
        'quantity': rng.choice((1, 1, 2, 4, 8, rng.randint(1, 100))),
        'waste': rng.choice((0, 5, 10, 15, rng.randint(0, 50))),
        'y40': rng.choice((30, rng.randint(1, 500))),
        'y60': rng.choice((45, rng.randint(1, 500))),
        'y80': rng.choice((60, rng.randint(1, 500))),
    }


# --- mulch and gravel (NIST: rectangular bin; EPA: loose gravel 2,565 lb per cubic yard) ----------------------------


def mulch(inp: dict) -> dict:
    area = F(inp['length'] * inp['width'], 10_000) if inp['mode'] == 'dims' else F(inp['area'], 100)
    cuft = area * F(inp['depth'], 1200)
    cuyd = cuft / 27
    out = {'sqft': half_up(area, 100), 'cuft': half_up(cuft, 100), 'cuyd': half_up(cuyd, 100), 'bags': ceil_f(cuft / F(inp['bag'], 100))}
    out['tons'] = half_up(cuyd * F(inp['density'], 100), 100) if inp['material'] == 'gravel' else None
    return out


MULCH_EXAMPLE = {'material': 'mulch', 'mode': 'dims', 'length': 2000, 'width': 1000, 'area': 20_000, 'depth': 300, 'bag': 200, 'density': 128}


def mulch_cases() -> list[dict]:
    out = [case('page-example', 'page-example', dict(MULCH_EXAMPLE))]
    out.append(case('page-example-gravel', 'grid', dict(MULCH_EXAMPLE, material='gravel', depth=200, bag=50)))
    n = 1
    for material in ('mulch', 'gravel'):
        for mode in ('dims', 'area'):
            for a in (1, 1000, 50_000):
                for depth in (1, 300, 3_600):
                    for bag in (1, 200, 1_000):
                        inp = dict(MULCH_EXAMPLE, material=material, mode=mode, depth=depth, bag=bag)
                        if mode == 'dims':
                            inp.update(length=a, width=a)
                        else:
                            inp.update(area=a * 50)
                        for density in ((1, 500) if material == 'gravel' else (128,)):
                            out.append(case(f'grid-{n:03d}', 'grid', dict(inp, density=density)))
                            n += 1
    return out


def mulch_random(rng: random.Random, _index: int) -> dict:
    return {
        'material': rng.choice(('mulch', 'gravel')),
        'mode': rng.choice(('dims', 'area')),
        'length': length(rng, 50_000),
        'width': length(rng, 50_000),
        'area': rng.choice((10_000, 20_000, rng.randint(1, 25_000_000))),
        'depth': rng.choice((200, 300, 400, rng.randint(1, 3_600))),
        'bag': rng.choice((50, 150, 200, 300, rng.randint(1, 1_000))),
        'density': rng.choice((128, 140, rng.randint(1, 500))),
    }


# --- paint ----------------------------------------------------------------------------------------------------------


def paint(inp: dict) -> dict:
    wall = F(inp['perimeter'] * inp['height'], 10_000) if inp['mode'] == 'walls' else F(inp['area'], 100)
    openings = F(inp['doors'] * inp['doorArea'] + inp['windows'] * inp['windowArea'], 100)
    paintable = wall - openings
    if paintable <= 0:
        return {'error': 'no-area', 'wall': half_up(wall, 100), 'openings': half_up(openings, 100)}
    gallons = paintable * inp['coats'] / inp['coverage']
    return {
        'wall': half_up(wall, 100),
        'openings': half_up(openings, 100),
        'paintable': half_up(paintable, 100),
        'gallons': half_up(gallons, 100),
        'buy': ceil_f(gallons),
    }


PAINT_EXAMPLE = {'mode': 'walls', 'perimeter': 4800, 'height': 800, 'area': 38_400, 'doors': 1, 'doorArea': 2100, 'windows': 2, 'windowArea': 1500, 'coats': 2, 'coverage': 350}


def paint_cases() -> list[dict]:
    out = [case('page-example', 'page-example', dict(PAINT_EXAMPLE))]
    n = 1
    for mode in ('walls', 'area'):
        for big in (100, 100_000):
            for opening in ((0, 100, 0, 100), (50, 10_000, 100, 10_000), (1, 2100, 2, 1500)):
                for coats in (1, 2, 3):
                    for coverage in (100, 350, 1000):
                        inp = dict(PAINT_EXAMPLE, mode=mode, doors=opening[0], doorArea=opening[1], windows=opening[2], windowArea=opening[3], coats=coats, coverage=coverage)
                        if mode == 'walls':
                            inp.update(perimeter=big, height=800 if big == 100 else 3000)
                        else:
                            inp.update(area=big * 20)
                        out.append(case(f'grid-{n:03d}', 'grid', inp))
                        n += 1
    return out


def paint_random(rng: random.Random, _index: int) -> dict:
    return {
        'mode': rng.choice(('walls', 'area')),
        'perimeter': length(rng, 100_000),
        'height': rng.choice((800, 900, 1000, rng.randint(100, 3_000))),
        'area': rng.choice((40_000, rng.randint(100, 2_000_000))),
        'doors': rng.choice((0, 1, 2, rng.randint(0, 50))),
        'doorArea': rng.choice((2100, 2400, rng.randint(100, 10_000))),
        'windows': rng.choice((0, 1, 2, 4, rng.randint(0, 100))),
        'windowArea': rng.choice((1500, 1200, rng.randint(100, 10_000))),
        'coats': rng.randint(1, 3),
        'coverage': rng.choice((250, 350, 400, rng.randint(100, 1_000))),
    }


# --- tile -----------------------------------------------------------------------------------------------------------


def tile(inp: dict) -> dict:
    tiles_exact = F(inp['area'] * 144 * (100 + inp['waste']) * 100, inp['length'] * inp['width'] * 100)
    tiles = ceil_f(tiles_exact)
    boxes = ceil_f(F(tiles, inp['perBox'])) if inp['perBox'] > 0 else None
    return {'tiles': tiles, 'boxes': boxes}


TILE_EXAMPLE = {'area': 12_000, 'length': 1200, 'width': 1200, 'waste': 10, 'perBox': 10}


def tile_cases() -> list[dict]:
    out = [case('page-example', 'page-example', dict(TILE_EXAMPLE))]
    n = 1
    for area in (1, 12_000, 2_000_000):
        for size in ((50, 50), (300, 600), (1200, 2400), (9600, 9600)):
            for waste in (0, 10, 50):
                for per in (0, 1, 10, 500):
                    out.append(case(f'grid-{n:03d}', 'grid', {'area': area, 'length': size[0], 'width': size[1], 'waste': waste, 'perBox': per}))
                    n += 1
    return out


def tile_random(rng: random.Random, _index: int) -> dict:
    sizes = (300, 400, 600, 800, 1200, 1800, 2400, 3600)
    return {
        'area': rng.choice((rng.randint(1, 2_000_000), 100 * rng.randint(1, 20_000))),
        'length': rng.choice((rng.choice(sizes), rng.randint(50, 9_600))),
        'width': rng.choice((rng.choice(sizes), rng.randint(50, 9_600))),
        'waste': rng.choice((0, 5, 10, 15, rng.randint(0, 50))),
        'perBox': rng.choice((0, 8, 10, 12, rng.randint(0, 500))),
    }


# --- BTU (Energy Star, "Properly Sized Room Air Conditioners") -------------------------------------------------------

# The table of https://www.energystar.gov/products/room_air_conditioners, read on 2026-11-02, transcribed here on its
# own: (from square feet, up to square feet, BTU per hour). Each row is [from, up to), the last one up to 2,500 itself.
# The copy of the table on /most-efficient/me-certified-room-ac/ writes the last capacity "34,00", a typing slip.
ENERGY_STAR_TABLE = (
    (100, 150, 5_000),
    (150, 250, 6_000),
    (250, 300, 7_000),
    (300, 350, 8_000),
    (350, 400, 9_000),
    (400, 450, 10_000),
    (450, 550, 12_000),
    (550, 700, 14_000),
    (700, 1_000, 18_000),
    (1_000, 1_200, 21_000),
    (1_200, 1_400, 23_000),
    (1_400, 1_500, 24_000),
    (1_500, 2_000, 30_000),
    (2_000, 2_500, 34_000),
)


def btu(inp: dict) -> dict:
    area = F(inp['area'], 100)
    ensure(100 <= area <= 2_500, 'area outside the table')
    base = next(cap for low, high, cap in ENERGY_STAR_TABLE if low <= area < high or (high == 2_500 and area == 2_500))
    factor = {'normal': F(1), 'shade': F(9, 10), 'sun': F(11, 10)}[inp['sun']]
    adjusted = base * factor
    ensure(adjusted.denominator == 1, 'the percent left a fraction')
    people = 600 * max(0, inp['people'] - 2)
    kitchen = 4_000 if inp['kitchen'] else 0
    return {'base': base, 'sun': int(adjusted) - base, 'people': people, 'kitchen': kitchen, 'btu': int(adjusted) + people + kitchen}


BTU_EXAMPLE = {'area': 35_000, 'sun': 'sun', 'people': 3, 'kitchen': False}


def btu_cases() -> list[dict]:
    out = [case('page-example', 'page-example', dict(BTU_EXAMPLE))]
    n = 1
    for low, high, _cap in ENERGY_STAR_TABLE:
        for area in (low * 100, high * 100 - 1):
            for sun in ('normal', 'shade', 'sun'):
                for people, kitchen in ((1, False), (2, True), (3, False), (20, True)):
                    out.append(case(f'grid-{n:03d}', 'grid', {'area': area, 'sun': sun, 'people': people, 'kitchen': kitchen}))
                    n += 1
    out.append(case(f'grid-{n:03d}', 'grid', {'area': 250_000, 'sun': 'normal', 'people': 2, 'kitchen': False}))
    for index, (low, _high, _cap) in enumerate(ENERGY_STAR_TABLE, start=1):
        out.append(case(f'energystar-row-{index:02d}', 'energystar', {'area': low * 100, 'sun': 'normal', 'people': 2, 'kitchen': False}))
    return out


def btu_random(rng: random.Random, _index: int) -> dict:
    return {
        'area': rng.choice((rng.randint(10_000, 250_000), 100 * rng.randint(100, 2_500))),
        'sun': rng.choice(('normal', 'shade', 'sun')),
        'people': rng.choice((1, 2, 3, 4, rng.randint(1, 20))),
        'kitchen': rng.random() < 0.3,
    }


# --- BMI (CDC, adults 20 and older) ---------------------------------------------------------------------------------

BMI_CATEGORIES = ((185, 'underweight'), (250, 'healthy'), (300, 'overweight'), (350, 'obesity-1'), (400, 'obesity-2'))


def height_in(inp: dict) -> F:
    """Height in inches: feet and tenths of an inch, or tenths of a centimetre over 2.54."""
    if inp['unit'] == 'us':
        return F(inp['feet'] * 120 + inp['inches'], 10)
    return F(inp['cm'], 10) / IN_CM


def height_cm(inp: dict) -> F:
    return height_in(inp) * IN_CM if inp['unit'] == 'us' else F(inp['cm'], 10)


def weight_kg(inp: dict) -> F:
    return F(inp['pounds'], 10) * LB_KG if inp['unit'] == 'us' else F(inp['kg'], 10)


def bmi(inp: dict) -> dict:
    if inp['unit'] == 'us':
        value = 703 * F(inp['pounds'], 10) / height_in(inp) ** 2
    else:
        value = F(inp['kg'], 10) / (F(inp['cm'], 1000) ** 2)
    tenths = half_up(value, 10)
    category = next((name for limit, name in BMI_CATEGORIES if tenths < limit), 'obesity-3')
    return {'bmi': tenths, 'category': category}


BMI_EXAMPLE = {'unit': 'us', 'feet': 5, 'inches': 90, 'pounds': 1600, 'cm': 1750, 'kg': 700}


def bmi_cases() -> list[dict]:
    out = [case('page-example', 'page-example', dict(BMI_EXAMPLE)), case('page-example-metric', 'page-example', dict(BMI_EXAMPLE, unit='metric'))]
    n = 1
    for feet in (3, 5, 8):
        for inches in (0, 55, 119):
            for pounds in (550, 1600, 10_000):
                out.append(case(f'grid-{n:03d}', 'grid', dict(BMI_EXAMPLE, feet=feet, inches=inches, pounds=pounds)))
                n += 1
    for cm in (915, 1750, 2743):
        for kg in (250, 700, 4535):
            out.append(case(f'grid-{n:03d}', 'grid', dict(BMI_EXAMPLE, unit='metric', cm=cm, kg=kg)))
            n += 1
    # The edges of the CDC categories, on the shown value: 18.4 and 18.5, 24.9 and 25.0, 29.9 and 30.0, 34.9 and 35.0,
    # 39.9 and 40.0, from heights and weights that land on them.
    for target in (184, 185, 249, 250, 299, 300, 349, 350, 399, 400):
        found = edge_case(target)
        out.append(case(f'edge-{target}', 'grid', found))
    out.append(case('cdc-5-ft-8-in-200-lb', 'cdc', dict(BMI_EXAMPLE, feet=5, inches=80, pounds=2000)))
    return out


def edge_case(target: int) -> dict:
    """A US height and weight whose BMI shows `target` tenths (searched in whole pounds at 5 ft 6 in)."""
    for pounds in range(550, 10_001, 1):
        inp = dict(BMI_EXAMPLE, feet=5, inches=60, pounds=pounds)
        if bmi(inp)['bmi'] == target:
            return inp
    raise OracleError(f'no edge case for {target}')


def bmi_random(rng: random.Random, _index: int) -> dict:
    return dict(
        BMI_EXAMPLE,
        unit=rng.choice(('us', 'metric')),
        feet=rng.choice((4, 5, 5, 6, rng.randint(3, 8))),
        inches=rng.choice((10 * rng.randint(0, 11), rng.randint(0, 119))),
        pounds=rng.choice((10 * rng.randint(90, 350), rng.randint(550, 10_000))),
        cm=rng.choice((10 * rng.randint(140, 200), rng.randint(915, 2743))),
        kg=rng.choice((10 * rng.randint(40, 160), rng.randint(250, 4535))),
    )


# --- Calorie: Mifflin-St Jeor (1990) times the physical activity level (NIH Body Weight Planner) ---------------------


def calorie(inp: dict) -> dict:
    s = 5 if inp['sex'] == 'male' else -161
    ensure(inp['sex'] in ('male', 'female'), 'unknown sex')
    ree = 10 * weight_kg(inp) + F(625, 100) * height_cm(inp) - 5 * inp['age'] + s
    ensure(ree > 0, 'resting energy below zero')
    tdee = ree * F(inp['pal'], 100)
    return {'ree': half_up(ree, 1), 'tdee': half_up(tdee, 1)}


CALORIE_EXAMPLE = {'unit': 'us', 'sex': 'female', 'age': 35, 'feet': 5, 'inches': 50, 'pounds': 1500, 'cm': 1650, 'kg': 680, 'pal': 160}


def calorie_cases() -> list[dict]:
    out = [case('page-example', 'page-example', dict(CALORIE_EXAMPLE)), case('page-example-metric', 'page-example', dict(CALORIE_EXAMPLE, unit='metric'))]
    n = 1
    for unit in ('us', 'metric'):
        for sex in ('female', 'male'):
            for age in (19, 78):
                for size in ((3, 0, 550, 915, 250), (8, 119, 10_000, 2743, 4535)):
                    for pal in (140, 250):
                        inp = dict(CALORIE_EXAMPLE, unit=unit, sex=sex, age=age, feet=size[0], inches=size[1], pounds=size[2], cm=size[3], kg=size[4], pal=pal)
                        out.append(case(f'grid-{n:03d}', 'grid', inp))
                        n += 1
    return out


def calorie_random(rng: random.Random, _index: int) -> dict:
    return dict(bmi_random(rng, 0), sex=rng.choice(('female', 'male')), age=rng.randint(19, 78), pal=rng.choice((140, 160, 175, 200, rng.randint(140, 250))))


# --- Ovulation (Office on Women's Health; NICHD) --------------------------------------------------------------------


def day(text: str) -> date:
    return date.fromisoformat(text)


def iso(d: date) -> str:
    return d.isoformat()


def ovulation(inp: dict) -> dict:
    start = day(inp['lmp'])
    length_days = inp['cycle']
    ensure(20 <= length_days <= 40, 'cycle outside the range')
    cycles = []
    for k in range(6):
        begin = start + timedelta(days=k * length_days)
        ovulates = begin + timedelta(days=length_days - 15)
        cycles.append({'start': iso(begin), 'fertileStart': iso(ovulates - timedelta(days=5)), 'ovulation': iso(ovulates), 'nextPeriod': iso(begin + timedelta(days=length_days))})
    return {'cycles': cycles}


def ovulation_cases() -> list[dict]:
    out = [case('page-example', 'page-example', {'lmp': '2026-10-19', 'cycle': 28})]
    n = 1
    for lmp in ('2000-01-01', '2024-02-10', '2026-12-20', '2027-02-27', '2028-02-28', '2099-12-31', '2099-10-01'):
        for cycle in (20, 21, 28, 35, 40):
            out.append(case(f'grid-{n:03d}', 'grid', {'lmp': lmp, 'cycle': cycle}))
            n += 1
    return out


def ovulation_random(rng: random.Random, _index: int) -> dict:
    first = date(2000, 1, 1).toordinal()
    last = date(2099, 12, 31).toordinal()
    return {'lmp': iso(date.fromordinal(rng.randint(first, last))), 'cycle': rng.randint(20, 40)}


# --- Body fat: the Navy circumference method (Hodgdon and Beckett, NHRC, 1984), in inches -------------------------


def log10(x: D) -> D:
    with localcontext() as ctx:
        ctx.prec = 50
        return x.log10()


def body_fat(inp: dict) -> dict:
    with localcontext() as ctx:
        ctx.prec = 50
        scale = D(10) if inp['unit'] == 'us' else D('25.4')  # tenths of an inch, or tenths of a cm over 25.4
        height = D(inp['feet'] * 120 + inp['inches']) / D(10) if inp['unit'] == 'us' else D(inp['cm']) / scale
        if inp['sex'] == 'male':
            span = D(inp['waist'] - inp['neck'])
            if span <= 0:
                return {'error': 'domain'}
            value = D('86.010') * log10(span / scale) - D('70.041') * log10(height) + D('36.76')
        else:
            span = D(inp['waist'] + inp['hip'] - inp['neck'])
            if span <= 0:
                return {'error': 'domain'}
            value = D('163.205') * log10(span / scale) - D('97.684') * log10(height) - D('78.387')
        if value < D('0.05') or value >= D('99.95'):
            return {'error': 'range', 'exact': exact_text(value)}
        return {'percent': half_up_d(value, 10), 'exact': exact_text(value)}


BODY_FAT_EXAMPLE = {'unit': 'us', 'sex': 'female', 'feet': 5, 'inches': 50, 'cm': 1650, 'neck': 130, 'waist': 280, 'hip': 380}


def body_fat_cases() -> list[dict]:
    out = [
        case('page-example', 'page-example', dict(BODY_FAT_EXAMPLE)),
        case('page-example-metric', 'page-example', dict(BODY_FAT_EXAMPLE, unit='metric', neck=330, waist=710, hip=965)),
        case('page-example-male', 'grid', dict(BODY_FAT_EXAMPLE, sex='male', feet=5, inches=100, neck=150, waist=340)),
    ]
    # The ends of each field (US: neck 8 to 30 in, waist 15 to 80, hip 20 to 80; metric: 20 to 76 cm, 38 to 203, 50 to
    # 203), a span at zero or below (no logarithm), and values that leave 0 to 100%.
    corners = {
        'us': ((80, 800, 800), (300, 150, 200), (150, 340, 380), (300, 800, 200), (130, 280, 380), (150, 150, 200), (300, 300, 200)),
        'metric': ((200, 2030, 2030), (760, 380, 500), (380, 860, 965), (760, 2030, 500), (330, 710, 965), (380, 380, 500), (760, 760, 500)),
    }
    n = 1
    for unit in ('us', 'metric'):
        for sex in ('female', 'male'):
            for neck, waist, hip in corners[unit]:
                for size in ((3, 0, 915), (5, 60, 1680), (8, 119, 2743)):
                    inp = dict(BODY_FAT_EXAMPLE, unit=unit, sex=sex, feet=size[0], inches=size[1], cm=size[2], neck=neck, waist=waist, hip=hip)
                    add_safe(out, f'grid-{n:03d}', 'grid', inp, body_fat)
                    n += 1
    return out


def body_fat_random(rng: random.Random, _index: int) -> dict:
    unit = rng.choice(('us', 'metric'))
    if unit == 'us':
        neck, waist, hip = rng.randint(80, 300), rng.randint(150, 800), rng.randint(200, 800)
    else:
        neck, waist, hip = rng.randint(200, 760), rng.randint(380, 2030), rng.randint(500, 2030)
    return dict(BODY_FAT_EXAMPLE, unit=unit, sex=rng.choice(('female', 'male')), feet=rng.randint(4, 7), inches=rng.randint(0, 119), cm=rng.randint(1300, 2200), neck=neck, waist=waist, hip=hip)


# --- Due date (NICHD: 40 weeks from the last period; NIH nuMoM2b: 266, 263 and 261 days) -----------------------------

DUE_OFFSET = {'lmp': 280, 'conception': 266, 'ivf3': 263, 'ivf5': 261}


def due_date(inp: dict) -> dict:
    ensure(inp['method'] in DUE_OFFSET, 'unknown method')
    due = day(inp['date']) + timedelta(days=DUE_OFFSET[inp['method']])
    lmp = due - timedelta(days=280)
    age = (day(inp['today']) - lmp).days
    if age < 0:
        status, weeks = 'before', None
    elif age > 300:
        status, weeks = 'after', None
    else:
        status, weeks = 'pregnant', {'weeks': age // 7, 'days': age % 7}
    return {
        'due': iso(due),
        'lmp': iso(lmp),
        'trimesters': [iso(lmp), iso(lmp + timedelta(days=84)), iso(lmp + timedelta(days=196))],
        'fullTerm': iso(lmp + timedelta(days=273)),
        'status': status,
        'age': weeks,
    }


def due_date_cases() -> list[dict]:
    out = [case('page-example', 'page-example', {'method': 'lmp', 'date': '2026-09-07', 'today': '2026-11-02'})]
    n = 1
    for method in DUE_OFFSET:
        for start in ('2000-01-01', '2023-05-25', '2024-02-29', '2026-03-17', '2027-02-28', '2099-12-31'):
            for gap in (-1, 0, 6, 7, 84, 196, 280, 300, 301):
                today = day(start) + timedelta(days=gap)
                if today.year > 9999:
                    continue
                out.append(case(f'grid-{n:03d}', 'grid', {'method': method, 'date': start, 'today': iso(today)}))
                n += 1
    # The NIH nuMoM2b dating table: a day-3 transfer + 263 days, a day-5 transfer + 261, an insemination + 266.
    out.append(case('nichd-ivf-day-3', 'nih-numom2b', {'method': 'ivf3', 'date': '2026-03-17', 'today': '2026-04-01'}))
    out.append(case('nichd-ivf-day-5', 'nih-numom2b', {'method': 'ivf5', 'date': '2026-03-17', 'today': '2026-04-01'}))
    out.append(case('nichd-40-weeks', 'nichd', {'method': 'lmp', 'date': '2026-03-17', 'today': '2026-03-17'}))
    return out


def due_date_random(rng: random.Random, _index: int) -> dict:
    first = date(2000, 1, 1).toordinal()
    last = date(2099, 12, 31).toordinal()
    start = rng.randint(first, last)
    return {'method': rng.choice(tuple(DUE_OFFSET)), 'date': iso(date.fromordinal(start)), 'today': iso(date.fromordinal(start + rng.randint(-60, 340)))}


# --- the fixtures ---------------------------------------------------------------------------------------------------


def case(cid: str, source: str, inp: dict) -> dict:
    return {'id': cid, 'source': source, 'input': inp}


def add_safe(out: list[dict], cid: str, source: str, inp: dict, fn) -> None:
    """A grid case, unless it lands within 1e-9 of a rounding tie (counted with the random draws)."""
    try:
        fn(inp)
    except NearTie:
        SKIPPED[0] += 1
        return
    out.append(case(cid, source, inp))


SKIPPED = [0]

CALCULATORS = {
    'square-footage-calculator': (square_footage, square_footage_cases, square_footage_random, 100),
    'concrete-calculator': (concrete, concrete_cases, concrete_random, 100),
    'mulch-calculator': (mulch, mulch_cases, mulch_random, 100),
    'paint-calculator': (paint, paint_cases, paint_random, 100),
    'tile-calculator': (tile, tile_cases, tile_random, 100),
    'btu-calculator': (btu, btu_cases, btu_random, 100),
    'bmi-calculator': (bmi, bmi_cases, bmi_random, 100),
    'calorie-calculator': (calorie, calorie_cases, calorie_random, 100),
    'ovulation-calculator': (ovulation, ovulation_cases, ovulation_random, 100),
    'body-fat-calculator': (body_fat, body_fat_cases, body_fat_random, 100),
    'due-date-calculator': (due_date, due_date_cases, due_date_random, 100),
}

# Worked examples of the official sources (fixtures/calc/OFICIAIS.md): the case must reproduce them or the script stops.
OFFICIAL_CHECKS = {
    # CDC, "BMI Frequently Asked Questions": 5 feet 8 inches and 200 pounds have a BMI of 30.4.
    ('bmi-calculator', 'cdc-5-ft-8-in-200-lb'): lambda e: e['bmi'] == 304 and e['category'] == 'obesity-1',
    # Energy Star: 12 ft 6 in is 12.5 ft (a 12.5 by 10 ft room is 125 square feet).
    ('square-footage-calculator', 'energystar-12-ft-6-in'): lambda e: e['sqft'] == 12_500,
    # NIH nuMoM2b (NICHD): due date = transfer + 263 days (day-3 embryo), + 261 (day-5 embryo).
    ('due-date-calculator', 'nichd-ivf-day-3'): lambda e: e['due'] == '2026-12-05',
    ('due-date-calculator', 'nichd-ivf-day-5'): lambda e: e['due'] == '2026-12-03',
    # NICHD: about 40 weeks from the last menstrual period.
    ('due-date-calculator', 'nichd-40-weeks'): lambda e: e['due'] == '2026-12-22' and e['age'] == {'weeks': 0, 'days': 0},
}
for _row, (_low, _high, _cap) in enumerate(ENERGY_STAR_TABLE, start=1):
    OFFICIAL_CHECKS[('btu-calculator', f'energystar-row-{_row:02d}')] = lambda e, cap=_cap: e['base'] == cap and e['btu'] == cap

UNITS = {
    'square-footage-calculator': {'length': 'hundredths of a foot', 'area': 'hundredths of a square foot (sqft) and of a square yard (sqyd)'},
    'concrete-calculator': {'length, width': 'hundredths of a foot', 'thickness, diameter, depth': 'hundredths of an inch', 'waste': 'whole percent', 'y40, y60, y80': 'hundredths of a cubic foot per bag', 'volume': 'hundredths of a cubic foot and of a cubic yard'},
    'mulch-calculator': {'length, width': 'hundredths of a foot', 'area': 'hundredths of a square foot', 'depth': 'hundredths of an inch', 'bag': 'hundredths of a cubic foot', 'density': 'hundredths of a short ton per cubic yard', 'tons': 'hundredths of a short ton'},
    'paint-calculator': {'perimeter, height': 'hundredths of a foot', 'area, doorArea, windowArea': 'hundredths of a square foot', 'coverage': 'square feet per gallon', 'gallons': 'hundredths of a gallon'},
    'tile-calculator': {'area': 'hundredths of a square foot', 'length, width': 'hundredths of an inch', 'waste': 'whole percent'},
    'btu-calculator': {'area': 'hundredths of a square foot', 'btu': 'BTU per hour'},
    'bmi-calculator': {'inches, pounds, cm, kg': 'tenths', 'bmi': 'tenths of kg/m2'},
    'calorie-calculator': {'inches, pounds, cm, kg': 'tenths', 'pal': 'hundredths', 'ree, tdee': 'kcal per day'},
    'ovulation-calculator': {'dates': 'YYYY-MM-DD', 'cycle': 'days'},
    'body-fat-calculator': {'inches, cm, neck, waist, hip': 'tenths of an inch (us) or of a centimetre (metric)', 'percent': 'tenths of a percent'},
    'due-date-calculator': {'dates': 'YYYY-MM-DD', 'age': 'whole weeks and days'},
}


def random_cases(calc_id: str) -> list[dict]:
    fn, _cases, make, count = CALCULATORS[calc_id]
    rng = random.Random(f'{SEED}/{calc_id}')
    out = []
    while len(out) < count:
        inp = make(rng, len(out))
        try:
            fn(inp)
        except NearTie:
            SKIPPED[0] += 1
            continue
        out.append(case(f'random-{len(out) + 1:03d}', 'random', inp))
    return out


def script_sha256() -> str:
    """SHA-256 of this script, with line ends normalized to LF (the test does the same)."""
    return hashlib.sha256(SCRIPT.read_bytes().replace(b'\r\n', b'\n')).hexdigest()


def build(calc_id: str, today: str) -> dict:
    fn, fixed, _make, _count = CALCULATORS[calc_id]
    SKIPPED[0] = 0
    cases = []
    for c in fixed() + random_cases(calc_id):
        try:
            expected = fn(c['input'])
        except (OracleError, NearTie) as error:
            raise SystemExit(f'{calc_id} {c["id"]}: {error!r}') from None
        check = OFFICIAL_CHECKS.get((calc_id, c['id']))
        if check is not None and not check(expected):
            raise SystemExit(f'{calc_id} {c["id"]}: the official example does not match: {json.dumps(expected)[:400]}')
        cases.append({'id': c['id'], 'source': c['source'], 'full': False, 'input': c['input'], 'expected': expected})
    missing = [key for key in OFFICIAL_CHECKS if key[0] == calc_id and key[1] not in {c['id'] for c in cases}]
    ensure(not missing, f'official checks without a case: {missing}')
    ids = [c['id'] for c in cases]
    ensure(len(ids) == len(set(ids)), f'{calc_id}: repeated case id')
    return {
        'calculator': calc_id,
        'oracle': {'script': SCRIPT_NAME, 'sha256': script_sha256(), 'python': platform.python_version(), 'date': today, 'nearTiesDrawnAgain': SKIPPED[0]},
        'units': UNITS[calc_id],
        'cases': cases,
    }


def dump(data: dict) -> str:
    head = {k: v for k, v in data.items() if k != 'cases'}
    lines = json.dumps(head, indent=2, ensure_ascii=False)[:-2]
    body = ',\n'.join('    ' + json.dumps(c, separators=(',', ':'), ensure_ascii=False) for c in data['cases'])
    return f'{lines},\n  "cases": [\n{body}\n  ]\n}}\n'


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--check', action='store_true', help='compare with the files on disk, do not write')
    parser.add_argument('--only', help='one calculator id')
    args = parser.parse_args()
    today = date.today().isoformat()
    OUT.mkdir(parents=True, exist_ok=True)
    failed = False
    for calc_id in CALCULATORS:
        if args.only and calc_id != args.only:
            continue
        data = build(calc_id, today)
        path = OUT / f'{calc_id}.json'
        if args.check:
            old = json.loads(path.read_text(encoding='utf-8'))
            old['oracle']['date'] = today
            if old != json.loads(dump(data)):
                print(f'DIFERENTE: {path.name}')
                failed = True
            else:
                print(f'igual: {path.name} ({len(data["cases"])} casos)')
        else:
            path.write_text(dump(data), encoding='utf-8', newline='\n')
            print(f'{path.name}: {len(data["cases"])} casos, {data["oracle"]["nearTiesDrawnAgain"]} perto de empate refeito(s)')
    if failed:
        sys.exit(1)


if __name__ == '__main__':
    main()
