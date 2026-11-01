#!/usr/bin/env python3
"""Independent oracle for the FileOrca money calculators (run F4).

Run it outside the Node project, with uv:

    uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python scripts/oracle/calc.py

`--check` recomputes everything and compares with the files on disk without writing.

It imports nothing from the repository. For each calculator it writes fixtures/calc/<route-id>.json
with the inputs in engine units and the expected outputs. The expected values come from a
cent-by-cent loop in Python's decimal (ROUND_HALF_UP), and every loop is checked against
numpy-financial (pmt, ipmt, ppmt, fv, pv, nper, irr) within the bound that cent rounding allows.
The CI never runs this script: it only reads the JSON (tests/unit/calc-oracle.test.ts).

Conventions (PLANO "Regra das calculadoras", DECISOES of the F4):

- Money is an integer number of cents. A rate is an integer in 1/10,000 of a percentage point
  (6.5% = 65000), so a typed rate with up to four decimals is exact.
- The periodic rate is the annual rate divided by the periods per year (12, or 26 for biweekly).
- The interest of each period is the balance times the periodic rate, rounded to the cent, half up.
- The payment comes from the closed formula, rounded to the cent, half up; at 0% it is the
  principal over the number of payments, rounded the same way.
- The last payment zeroes the balance: at the last period, or as soon as the regular payment (plus
  any extra) covers the balance and its interest, the payment is the balance plus that interest.
- A "maximum" (affordability) is rounded down to the cent, so it never passes the limit.
- A monthly rate from another compounding is (1 + r/n)^(n/12) - 1, cut (floor) to 30 decimals.
- A loop that would pass 1,200 months is the error "too-long"; a balance above 10^15 cents is the
  error "too-large".
"""

from __future__ import annotations

import argparse
import hashlib
import itertools
import json
import math
import platform
import random
import sys
import warnings
from datetime import date
from decimal import ROUND_CEILING, ROUND_FLOOR, ROUND_HALF_UP, Decimal as D, getcontext, localcontext
from pathlib import Path

import numpy
import numpy_financial as npf

getcontext().prec = 100
# npf.pv and npf.fv evaluate both branches of np.where, so a 0% rate warns about a division it discards.
warnings.filterwarnings('ignore', category=RuntimeWarning, module='numpy_financial')

SCRIPT = Path(__file__).resolve()
REPO = SCRIPT.parents[2]
OUT = REPO / 'fixtures' / 'calc'

S = 10_000  # rate units per percentage point
ONE = 100 * S  # rate units per 1.0 (100%)
MAX_MONTHS = 1200
MAX_CENTS = 10**15
ROOT_DIGITS = 30
COMPOUNDINGS = [1, 2, 4, 12, 365]


class OracleError(Exception):
    pass


def ensure(condition: bool, message: str) -> None:
    if not condition:
        raise OracleError(message)


# --- rounding and the cent loop -------------------------------------------------------------------


def half_up(x) -> int:
    return int(D(x).quantize(D(1), rounding=ROUND_HALF_UP))


def floor_int(x) -> int:
    return int(D(x).to_integral_value(rounding=ROUND_FLOOR))


def ceil_int(x) -> int:
    return int(D(x).to_integral_value(rounding=ROUND_CEILING))


def interest(balance: int, rate: int, ppy: int = 12) -> int:
    """One period of interest on `balance`, rounded to the cent, half up."""
    return half_up(D(balance) * D(rate) / D(ONE * ppy))


def per_month(per_year: int) -> int:
    return half_up(D(per_year) / D(12))


def share(amount: int, rate: int) -> int:
    """`rate` (rate units) of `amount`, rounded to the cent, half up."""
    return half_up(D(amount) * D(rate) / D(ONE))


def annuity_payment(principal: int, rate: int, n: int, ppy: int = 12) -> int:
    """P = L*i*(1+i)^n / ((1+i)^n - 1) with i = rate/(ONE*ppy), written over whole numbers so that the
    only rounding is the last division: a repeating i (6.5%/12) would otherwise lose an exact half cent."""
    if principal == 0:
        return 0
    if rate == 0:
        return half_up(D(principal) / D(n))
    d = ONE * ppy
    grown = (d + rate) ** n
    return half_up(D(principal * rate * grown) / D(d * (grown - d**n)))


def present_value(pay: int, rate: int, n: int, ppy: int = 12) -> int:
    """The largest loan `pay` amortizes: L = P*(1 - (1+i)^-n)/i over whole numbers, rounded down."""
    if rate == 0:
        return pay * n
    d = ONE * ppy
    grown = (d + rate) ** n
    return floor_int(D(pay * d * (grown - d**n)) / D(rate * grown))


def amortize(principal: int, rate: int, n, pay: int, ppy: int = 12, extra=None, limit: int | None = None):
    """The cent loop. Returns rows [k, payment, interest, principal, balance], or None past `limit`."""
    rows = []
    balance = principal
    k = 0
    while balance > 0:
        k += 1
        if limit is not None and k > limit:
            return None
        ensure(k <= 100_000, 'runaway schedule')
        it = interest(balance, rate, ppy)
        due = pay + (extra(k) if extra else 0)
        total = balance + it
        p = total if (k >= n or due >= total) else due
        balance = total - p
        rows.append([k, p, it, p - it, balance])
    return rows


def year_end(rows, ppy: int = 12):
    return [rows[min(end, len(rows)) - 1][4] for end in range(ppy, len(rows) + ppy, ppy)]


def summary(rows, ppy: int = 12, full: bool = False) -> dict:
    out = {
        'count': len(rows),
        'totalInterest': sum(r[2] for r in rows),
        'totalPaid': sum(r[1] for r in rows),
        'lastPayment': rows[-1][1] if rows else 0,
        'yearEnd': year_end(rows, ppy),
    }
    if full:
        out['rows'] = rows
    return out


def cumulative_interest(rows):
    out, total = [], 0
    for row in rows:
        total += row[2]
        out.append(total)
    return out


# --- numpy-financial cross-checks -------------------------------------------------------------------


def check_payment(pay: int, principal: int, rate: int, n: int, ppy: int = 12) -> None:
    if principal == 0:
        return
    ref = -float(npf.pmt(rate / (ONE * ppy), n, principal))
    ensure(abs(pay - ref) <= 0.5 + 1e-9 * abs(ref), f'pmt {pay} vs numpy-financial {ref}')


def check_rows(rows, principal: int, rate: int, n: int, ppy: int = 12) -> None:
    """Each row's interest and principal against npf.ipmt/ppmt, within the drift that cent rounding allows."""
    if not rows:
        return
    i = rate / (ONE * ppy)
    drift = 0.0  # bound on |our balance - exact balance|, in cents
    for k, _p, it, pr, _bal in rows[:-1]:
        ref_i = -float(npf.ipmt(i, k, n, principal))
        ref_p = -float(npf.ppmt(i, k, n, principal))
        slack = 1e-7 * max(1.0, abs(ref_i) + abs(ref_p))
        ensure(abs(it - ref_i) <= 0.5 + drift * i + slack, f'ipmt row {k}: {it} vs {ref_i}')
        ensure(abs(pr - ref_p) <= 1.0 + drift * i + slack, f'ppmt row {k}: {pr} vs {ref_p}')
        drift = drift * (1 + i) + 1.0


def fv_bound(i: float, n: int) -> float:
    """Bound on the drift of a balance after n periods of half-cent roundings."""
    return 0.5 * n if i == 0 else 0.5 * ((1 + i) ** n - 1) / i


# --- the calculators ---------------------------------------------------------------------------------


def down_cents(price: int, down: dict) -> int:
    return share(price, down['rate']) if down['kind'] == 'percent' else down['cents']


def loan_schedule(loan: int, rate: int, n: int, full: bool):
    pay = annuity_payment(loan, rate, n)
    check_payment(pay, loan, rate, n)
    rows = amortize(loan, rate, n, pay)
    check_rows(rows, loan, rate, n)
    return pay, rows, summary(rows, 12, full)


def mortgage(inp: dict, full: bool = False) -> dict:
    down = down_cents(inp['price'], inp['down'])
    loan = inp['price'] - down
    pay, _rows, s = loan_schedule(loan, inp['rate'], inp['years'] * 12, full)
    tax, ins = per_month(inp['taxYear']), per_month(inp['insuranceYear'])
    return {
        'down': down,
        'loan': loan,
        'payment': pay,
        'taxMonth': tax,
        'insuranceMonth': ins,
        'monthlyTotal': pay + tax + ins + inp['pmiMonth'] + inp['hoaMonth'],
        **s,
    }


def apr_from_payments(net: int, payments: list[int]):
    """Actuarial APR (Regulation Z, Appendix J): the monthly rate x with net = sum(p_k / (1 + x)^k)."""

    def present(x: D) -> D:
        v = 1 / (1 + x)
        acc, f = D(0), D(1)
        for p in payments:
            f *= v
            acc += D(p) * f
        return acc

    lo, hi = D(0), D(1)
    while present(hi) > net:
        hi *= 2
    for _ in range(120):
        mid = (lo + hi) / 2
        if present(mid) > net:
            lo = mid
        else:
            hi = mid
    x = (lo + hi) / 2
    return half_up(x * 12 * 10_000), x


def personal_loan(inp: dict, full: bool = False) -> dict:
    amount, rate = inp['amount'], inp['rate']
    pay, rows, s = loan_schedule(amount, rate, inp['months'], full)
    fee = share(amount, inp['feeRate'])
    out = {'payment': pay, 'fee': fee, 'totalCost': s['totalInterest'] + fee, **s, 'aprHundredths': None}
    if fee > 0:
        payments = [r[1] for r in rows]
        hundredths, x = apr_from_payments(amount - fee, payments)
        ref = float(npf.irr([-(amount - fee), *payments]))
        ensure(abs(float(x) - ref) < 1e-9, f'apr {x} vs numpy-financial irr {ref}')
        out['aprHundredths'] = hundredths
    return out


def auto_loan(inp: dict, full: bool = False) -> dict:
    financed = max(0, inp['price'] + inp['taxesFees'] - inp['down'] - inp['tradeIn'])
    pay, _rows, s = loan_schedule(financed, inp['rate'], inp['months'], full)
    return {'financed': financed, 'payment': pay, 'totalCost': inp['price'] + inp['taxesFees'] + s['totalInterest'], **s}


def refinance(inp: dict, full: bool = False) -> dict:
    balance, costs = inp['balance'], inp['costs']
    pay_c, rows_c, s_c = loan_schedule(balance, inp['rate'], inp['monthsLeft'], full)
    loan = balance + (costs if inp['costsMode'] == 'loan' else 0)
    upfront = costs if inp['costsMode'] == 'cash' else 0
    pay_n, rows_n, s_n = loan_schedule(loan, inp['newRate'], inp['newYears'] * 12, full)
    cum_c, cum_n = cumulative_interest(rows_c), cumulative_interest(rows_n)
    break_even = None
    for m in range(1, max(len(rows_c), len(rows_n)) + 1):
        ic = cum_c[min(m, len(cum_c)) - 1] if cum_c else 0
        inew = cum_n[min(m, len(cum_n)) - 1] if cum_n else 0
        if costs + inew <= ic:
            break_even = m
            break
    savings = pay_c - pay_n
    return {
        'current': {'payment': pay_c, **s_c},
        'new': {'loan': loan, 'payment': pay_n, **s_n},
        'monthlySavings': savings,
        'interestDiff': s_c['totalInterest'] - s_n['totalInterest'],
        'costDiff': s_c['totalPaid'] - (s_n['totalPaid'] + upfront),
        'breakEven': break_even,
        'simpleBreakEven': ceil_int(D(costs) / D(savings)) if savings > 0 else None,
    }


def home_affordability(inp: dict, full: bool = False) -> dict:
    income, rate, n = inp['income'], inp['rate'], inp['years'] * 12
    front = floor_int(D(income) * D(inp['frontRatio']) / D(12 * ONE))
    back = floor_int(D(income) * D(inp['backRatio']) / D(12 * ONE)) - inp['debts']
    housing = min(front, back)
    limit = 'front' if front < back else 'back' if back < front else 'both'
    tax, ins = per_month(inp['taxYear']), per_month(inp['insuranceYear'])
    max_pi = housing - tax - ins - inp['hoaMonth']
    if max_pi <= 0:
        return {'frontCap': front, 'backCap': back, 'housingCap': housing, 'limit': limit, 'taxMonth': tax,
                'insuranceMonth': ins, 'noRoom': True, 'maxPI': 0, 'maxLoan': 0, 'maxPrice': 0, 'payment': 0,
                'monthlyTotal': 0}
    loan = present_value(max_pi, rate, n)
    ref = float(npf.pv(rate / (ONE * 12), n, -max_pi))
    ensure(abs(loan - ref) <= 1 + 1e-9 * ref, f'pv {loan} vs numpy-financial {ref}')
    pay = annuity_payment(loan, rate, n)
    ensure(pay <= max_pi, 'the payment of the maximum loan passes the limit')
    return {
        'frontCap': front, 'backCap': back, 'housingCap': housing, 'limit': limit, 'taxMonth': tax,
        'insuranceMonth': ins, 'noRoom': False, 'maxPI': max_pi, 'maxLoan': loan, 'maxPrice': loan + inp['down'],
        'payment': pay, 'monthlyTotal': pay + tax + ins + inp['hoaMonth'],
    }


def loan_amortization(inp: dict, full: bool = False) -> dict:
    pay, _rows, s = loan_schedule(inp['amount'], inp['rate'], inp['years'] * 12, full)
    return {'payment': pay, **s}


def monthly_rate_30(rate: int, comp: int) -> int:
    """floor(10^30 * ((1 + r/comp)^(comp/12) - 1)): the effective monthly rate, cut to 30 decimals."""
    with localcontext() as ctx:
        ctx.prec = 150
        base = 1 + D(rate) / D(ONE * comp)
        value = base ** (D(comp) / D(12)) - 1
        return floor_int(value * D(10) ** ROOT_DIGITS)


def compound_interest(inp: dict, full: bool = False) -> dict:
    initial, monthly, rate, comp = inp['initial'], inp['monthly'], inp['rate'], inp['compounding']
    begin = inp['timing'] == 'begin'
    j30 = None if comp == 12 else monthly_rate_30(rate, comp)
    scale = D(10) ** ROOT_DIGITS
    balance, contributed, table = initial, initial, []
    for y in range(1, inp['years'] + 1):
        y_contrib = y_interest = 0
        for _m in range(12):
            if begin:
                balance += monthly
                y_contrib += monthly
            it = interest(balance, rate, 12) if j30 is None else half_up(D(balance) * D(j30) / scale)
            balance += it
            y_interest += it
            if not begin:
                balance += monthly
                y_contrib += monthly
        contributed += y_contrib
        table.append([y, y_contrib, y_interest, balance])
    if balance > MAX_CENTS:
        return {'error': 'too-large'}
    j = rate / (ONE * 12) if j30 is None else j30 / 1e30
    n = 12 * inp['years']
    ref = float(npf.fv(j, n, -monthly, -initial, when='begin' if begin else 'end'))
    ensure(abs(balance - ref) <= fv_bound(j, n) + 1e-9 * abs(ref) + 1e-6, f'fv {balance} vs numpy-financial {ref}')
    out = {
        'monthlyRate30': None if j30 is None else str(j30),
        'final': balance,
        'contributed': contributed,
        'interest': balance - contributed,
        'yearEnd': [row[3] for row in table],
    }
    if full:
        out['years'] = table
    return out


def credit_card_payoff(inp: dict, full: bool = False) -> dict:
    balance, apr = inp['balance'], inp['apr']
    first = interest(balance, apr)
    if inp['mode'] == 'payment':
        pay = inp['payment']
        if pay <= first:
            return {'error': 'too-low', 'minimum': first + 1}
        rows = amortize(balance, apr, math.inf, pay, limit=MAX_MONTHS)
        if rows is None:
            return {'error': 'too-long'}
        nper = float(npf.nper(apr / (ONE * 12), -pay, balance))
        ensure(abs(len(rows) - math.ceil(nper - 1e-9)) <= 1, f'nper {len(rows)} vs numpy-financial {nper}')
    else:
        pay = annuity_payment(balance, apr, inp['months'])
        check_payment(pay, balance, apr, inp['months'])
        rows = amortize(balance, apr, inp['months'], pay)
        check_rows(rows, balance, apr, inp['months'])
    return {'payment': pay, 'months': len(rows), **summary(rows, 12, full)}


def payoff_plan(debts: list[dict], extra: int, order: list[int]):
    k = len(debts)
    balances = [d['balance'] for d in debts]
    budget = sum(d['minimum'] for d in debts) + extra
    month = total_interest = total_paid = 0
    paid_off = [None] * k
    year_totals = []
    while any(b > 0 for b in balances):
        month += 1
        if month > MAX_MONTHS:
            return None
        owed, pay = [], []
        for i in range(k):
            if balances[i] > 0:
                it = interest(balances[i], debts[i]['apr'])
                total_interest += it
                owed.append(balances[i] + it)
            else:
                owed.append(0)
            pay.append(min(debts[i]['minimum'], owed[i]))
        left = budget - sum(pay)
        for i in order:
            room = owed[i] - pay[i]
            if room > 0 and left > 0:
                x = min(room, left)
                pay[i] += x
                left -= x
        for i in range(k):
            if owed[i] > 0:
                balances[i] = owed[i] - pay[i]
                if balances[i] == 0:
                    paid_off[i] = month
        total_paid += sum(pay)
        if month % 12 == 0:
            year_totals.append(sum(balances))
    if month % 12 != 0:
        year_totals.append(0)
    position = {debt: rank for rank, debt in enumerate(order)}
    payoff_order = sorted(range(k), key=lambda i: (paid_off[i], position[i]))
    return {'months': month, 'totalInterest': total_interest, 'totalPaid': total_paid, 'paidOff': paid_off,
            'payoffOrder': payoff_order, 'yearEnd': year_totals}


def debt_payoff(inp: dict, full: bool = False) -> dict:
    debts, extra = inp['debts'], inp['extra']
    budget = sum(d['minimum'] for d in debts) + extra
    first = sum(interest(d['balance'], d['apr']) for d in debts)
    if budget <= first:
        return {'error': 'too-low', 'minimum': first + 1, 'budget': budget}
    snowball = sorted(range(len(debts)), key=lambda i: (debts[i]['balance'], i))
    avalanche = sorted(range(len(debts)), key=lambda i: (-debts[i]['apr'], i))
    a, b = payoff_plan(debts, extra, snowball), payoff_plan(debts, extra, avalanche)
    if a is None or b is None:
        return {'error': 'too-long', 'budget': budget}
    return {'budget': budget, 'snowball': a, 'avalanche': b,
            'interestDiff': a['totalInterest'] - b['totalInterest'], 'monthsDiff': a['months'] - b['months']}


def rent_vs_buy(inp: dict, full: bool = False) -> dict:
    price, down = inp['price'], inp['down']
    loan = price - down
    pay, rows, _s = loan_schedule(loan, inp['rate'], inp['termYears'] * 12, False)
    tax, ins = per_month(inp['taxYear']), per_month(inp['insuranceYear'])
    value, rent = price, inp['rent']
    buyer, renter = 0, down
    buyer_net, renter_net = [], []
    total_rent = total_owner = 0
    break_even = None
    for y in range(1, inp['years'] + 1):
        upkeep = half_up(D(value) * D(inp['maintenanceRate']) / D(12 * ONE))
        for m in range(1, 13):
            k = (y - 1) * 12 + m
            owner = (rows[k - 1][1] if k <= len(rows) else 0) + tax + ins + inp['hoaMonth'] + upkeep
            total_owner += owner
            total_rent += rent
            buyer += interest(buyer, inp['returnRate'])
            renter += interest(renter, inp['returnRate'])
            if owner > rent:
                renter += owner - rent
            elif rent > owner:
                buyer += rent - owner
        value = half_up(D(value) * D(ONE + inp['appreciationRate']) / D(ONE))
        rent = half_up(D(rent) * D(ONE + inp['rentIncreaseRate']) / D(ONE))
        k = y * 12
        owed = rows[k - 1][4] if k <= len(rows) else 0
        net = half_up(D(value) * D(ONE - inp['sellingRate']) / D(ONE)) - owed + buyer
        buyer_net.append(net)
        renter_net.append(renter)
        if break_even is None and net >= renter:
            break_even = y
    return {'payment': pay, 'taxMonth': tax, 'insuranceMonth': ins, 'buyer': buyer_net, 'renter': renter_net,
            'breakEven': break_even, 'buyerFinal': buyer_net[-1], 'renterFinal': renter_net[-1],
            'totalRent': total_rent, 'totalOwnerCost': total_owner}


def mortgage_extra_payments(inp: dict, full: bool = False) -> dict:
    down = down_cents(inp['price'], inp['down'])
    loan, rate, n = inp['price'] - down, inp['rate'], inp['years'] * 12
    pay, _rows, base = loan_schedule(loan, rate, n, full)

    def extra(k: int) -> int:
        return (inp['extraMonthly'] + (inp['extraYearly'] if k % 12 == 0 else 0)
                + (inp['extraOnce'] if k == inp['extraOnceMonth'] else 0))

    with_extra = summary(amortize(loan, rate, n, pay, extra=extra), 12, full)
    tax, ins = per_month(inp['taxYear']), per_month(inp['insuranceYear'])
    return {'down': down, 'loan': loan, 'payment': pay,
            'monthlyTotal': pay + tax + ins + inp['pmiMonth'] + inp['hoaMonth'],
            'base': base, 'extra': with_extra,
            'monthsSaved': base['count'] - with_extra['count'],
            'interestSaved': base['totalInterest'] - with_extra['totalInterest']}


def mortgage_biweekly(inp: dict, full: bool = False) -> dict:
    down = down_cents(inp['price'], inp['down'])
    loan, rate, years = inp['price'] - down, inp['rate'], inp['years']
    pay, _rows, monthly = loan_schedule(loan, rate, years * 12, full)
    half = half_up(D(pay) / D(2))
    rows_b = amortize(loan, rate, years * 26, half, ppy=26)
    biweekly = summary(rows_b, 26, full)
    months_b = ceil_int(D(len(rows_b) * 12) / D(26))
    tax, ins = per_month(inp['taxYear']), per_month(inp['insuranceYear'])
    return {'down': down, 'loan': loan, 'payment': pay, 'halfPayment': half,
            'monthlyTotal': pay + tax + ins + inp['pmiMonth'] + inp['hoaMonth'],
            'monthly': monthly, 'biweekly': biweekly, 'biweeklyMonths': months_b,
            'monthsSaved': monthly['count'] - months_b,
            'interestSaved': monthly['totalInterest'] - biweekly['totalInterest']}


def mortgage_15_vs_30(inp: dict, full: bool = False) -> dict:
    down = down_cents(inp['price'], inp['down'])
    loan = inp['price'] - down
    pay15, _r15, s15 = loan_schedule(loan, inp['rate15'], 180, full)
    pay30, _r30, s30 = loan_schedule(loan, inp['rate30'], 360, full)
    return {'down': down, 'loan': loan,
            'fifteen': {'payment': pay15, **s15}, 'thirty': {'payment': pay30, **s30},
            'paymentDiff': pay15 - pay30, 'interestDiff': s30['totalInterest'] - s15['totalInterest']}


def balloon_loan(inp: dict, full: bool = False) -> dict:
    amount, rate, n, b = inp['amount'], inp['rate'], inp['years'] * 12, inp['balloonMonth']
    pay = annuity_payment(amount, rate, n)
    check_payment(pay, amount, rate, n)
    rows = amortize(amount, rate, b, pay)
    check_rows(rows, amount, rate, n)
    balloon = rows[-1][1] - pay if len(rows) == b else 0
    i = rate / (ONE * 12)
    ref = -float(npf.fv(i, b, -pay, amount))
    ensure(abs(balloon - ref) <= 2 * fv_bound(i, b) + 1e-9 * abs(ref) + 1e-6, f'fv {balloon} vs numpy-financial {ref}')
    return {'payment': pay, 'balloon': balloon, **summary(rows, 12, full)}


def savings_run(current: int, rate: int, deposit: int, months: int):
    balance, rows = current, []
    for m in range(1, months + 1):
        it = interest(balance, rate)
        balance += it + deposit
        rows.append([m, deposit, it, balance])
    return rows


def savings_goal(inp: dict, full: bool = False) -> dict:
    goal, current, rate = inp['goal'], inp['current'], inp['rate']
    if inp['mode'] == 'months':
        n = inp['months']

        def reaches(d: int) -> bool:
            return savings_run(current, rate, d, n)[-1][3] >= goal

        if current >= goal or reaches(0):
            deposit = 0
        else:
            lo, hi = 0, goal  # reaches(goal) is true: one deposit of the goal is enough
            while hi - lo > 1:
                mid = (lo + hi) // 2
                if reaches(mid):
                    hi = mid
                else:
                    lo = mid
            deposit = hi
            i = rate / (ONE * 12)
            ref = -float(npf.pmt(i, n, -current, goal)) if rate else (goal - current) / n
            ensure(abs(deposit - ref) <= 1 + fv_bound(i, n) * (i / ((1 + i) ** n - 1) if i else 1 / n),
                   f'deposit {deposit} vs numpy-financial {ref}')
        rows = savings_run(current, rate, deposit, n)
    else:
        deposit = inp['deposit']
        if current >= goal:
            rows = []
        else:
            rows, balance, m = [], current, 0
            while balance < goal:
                m += 1
                if m > MAX_MONTHS:
                    return {'error': 'too-long'}
                it = interest(balance, rate)
                balance += it + deposit
                rows.append([m, deposit, it, balance])
            if rate or deposit:
                i = rate / (ONE * 12)
                nper = float(npf.nper(i, -deposit, -current, goal)) if rate else (goal - current) / deposit
                ensure(abs(len(rows) - math.ceil(nper - 1e-9)) <= 1, f'nper {len(rows)} vs numpy-financial {nper}')
    # The balance only grows, so the last one is the largest: past 10^15 cents it is "too-large", as in
    # compound interest (a goal already met, left for decades at a high rate).
    if rows and rows[-1][3] > MAX_CENTS:
        return {'error': 'too-large'}
    final = rows[-1][3] if rows else current
    deposited = deposit * len(rows)
    out = {'deposit': deposit, 'months': len(rows), 'final': final, 'deposited': deposited,
           'interest': final - current - deposited,
           'yearEnd': [rows[min(end, len(rows)) - 1][3] for end in range(12, len(rows) + 12, 12)]}
    if full:
        out['rows'] = rows
    return out


def debt_consolidation(inp: dict, full: bool = False) -> dict:
    current = {'payment': 0, 'months': 0, 'totalInterest': 0, 'totalPaid': 0}
    for index, d in enumerate(inp['debts']):
        first = interest(d['balance'], d['apr'])
        if d['payment'] <= first:
            return {'error': 'too-low', 'debt': index, 'minimum': first + 1}
        rows = amortize(d['balance'], d['apr'], math.inf, d['payment'], limit=MAX_MONTHS)
        if rows is None:
            return {'error': 'too-long', 'debt': index}
        current['payment'] += d['payment']
        current['months'] = max(current['months'], len(rows))
        current['totalInterest'] += sum(r[2] for r in rows)
        current['totalPaid'] += sum(r[1] for r in rows)
    principal = sum(d['balance'] for d in inp['debts'])
    fee = share(principal, inp['feeRate'])
    pay, _rows, s = loan_schedule(principal + fee, inp['newRate'], inp['newMonths'], full)
    new = {'loan': principal + fee, 'fee': fee, 'payment': pay, 'months': s['count'], **s}
    return {'principal': principal, 'current': current, 'new': new,
            'paymentDiff': current['payment'] - pay,
            'interestDiff': current['totalInterest'] - (s['totalInterest'] + fee),
            'costDiff': current['totalPaid'] - s['totalPaid'],
            'monthsDiff': current['months'] - s['count']}


def simple_interest(inp: dict, full: bool = False) -> dict:
    per = {'years': ONE, 'months': ONE * 12, 'days': ONE * 365}[inp['unit']]
    it = half_up(D(inp['principal']) * D(inp['rate']) * D(inp['time']) / D(per))
    return {'interest': it, 'total': inp['principal'] + it}


def apy_hundredths(rate: int, comp: int) -> int:
    value = (1 + D(rate) / D(ONE * comp)) ** comp - 1
    return half_up(value * 10_000)


def apr_hundredths(rate: int, comp: int) -> int:
    with localcontext() as ctx:
        ctx.prec = 150
        value = comp * ((1 + D(rate) / D(ONE)) ** (D(1) / D(comp)) - 1)
        return half_up(value * 10_000)


def apr_to_apy(inp: dict, full: bool = False) -> dict:
    convert = apy_hundredths if inp['direction'] == 'apr-to-apy' else apr_hundredths
    return {'result': convert(inp['rate'], inp['compounding']),
            'table': [[c, convert(inp['rate'], c)] for c in COMPOUNDINGS]}


# --- the cases -----------------------------------------------------------------------------------------

def dollars(x) -> int:
    return half_up(D(str(x)) * 100)


def pct(x) -> int:
    return half_up(D(str(x)) * S)


def amount(cents: int) -> dict:
    return {'kind': 'amount', 'cents': cents}


def percent(rate: int) -> dict:
    return {'kind': 'percent', 'rate': rate}


def case(cid: str, source: str, inp: dict, full: bool = False) -> dict:
    return {'id': cid, 'source': source, 'input': inp, 'full': full}


def grid(prefix: str, build, *axes) -> list[dict]:
    out = []
    for values in itertools.product(*axes):
        inp = build(*values)
        if inp is not None:
            out.append(case(f'{prefix}-{len(out) + 1:03d}', 'grid', inp))
    return out


# Random values use only integer draws (randrange), so the cases do not depend on the platform's libm.
def r_money(rng: random.Random, lo_dollars, hi_dollars, round_share: float = 0.3) -> int:
    lo, hi = dollars(lo_dollars), dollars(hi_dollars)
    while True:
        digits = rng.randrange(len(str(max(lo, 1))), len(str(hi)) + 1)
        value = rng.randrange(10 ** (digits - 1), 10**digits)
        if rng.random() < round_share:
            value -= value % 100
        if lo <= value <= hi:
            return value


def r_rate(rng: random.Random, hi_pct, zero: float = 0.06, lo_pct=0) -> int:
    x = rng.random()
    if x < zero and lo_pct <= 0:
        return 0
    if x < 0.45:
        return rng.randrange(int(lo_pct * 8), int(hi_pct * 8) + 1) * (S // 8)
    return rng.randrange(int(lo_pct * S), int(hi_pct * S) + 1)


def costs_block(i: int) -> dict:
    """Taxes, insurance, PMI and HOA that alternate between none and typical."""
    if i % 2:
        return {'taxYear': 0, 'insuranceYear': 0, 'pmiMonth': 0, 'hoaMonth': 0}
    return {'taxYear': dollars(4500), 'insuranceYear': dollars(1500), 'pmiMonth': dollars(120), 'hoaMonth': dollars(75)}


# The default example of each page (PAGE) and the main example of each guide (GUIDE). The pages and
# guides take their inputs from here only through src/calc tests that compare them with these cases.
DESIGN_MORTGAGE = {'price': dollars(375_000), 'down': percent(pct(20)), 'years': 30, 'rate': pct(6.5),
                   'taxYear': dollars(4500), 'insuranceYear': dollars(1500), 'pmiMonth': 0, 'hoaMonth': 0}
GUIDE_DEBTS = [
    {'balance': dollars(4800), 'apr': pct(24.99), 'minimum': dollars(120)},
    {'balance': dollars(1200), 'apr': pct(19.99), 'minimum': dollars(35)},
    {'balance': dollars(9500), 'apr': pct(7.9), 'minimum': dollars(260)},
    {'balance': dollars(3600), 'apr': pct(11.5), 'minimum': dollars(110)},
]
GUIDE_RENT_BUY = {'price': dollars(400_000), 'down': dollars(80_000), 'rate': pct(6.5), 'termYears': 30,
                  'taxYear': dollars(4800), 'insuranceYear': dollars(1800), 'maintenanceRate': pct(1),
                  'hoaMonth': 0, 'appreciationRate': pct(3), 'sellingRate': pct(6), 'rent': dollars(2200),
                  'rentIncreaseRate': pct(3), 'returnRate': pct(6), 'years': 10}
GUIDE_REFINANCE = {'balance': dollars(250_000), 'rate': pct(7.25), 'monthsLeft': 300, 'newRate': pct(6),
                   'newYears': 30, 'costs': dollars(6000), 'costsMode': 'cash'}
CONSOLIDATION_DEBTS = [
    {'balance': dollars(5200), 'apr': pct(24.99), 'payment': dollars(180)},
    {'balance': dollars(3100), 'apr': pct(19.99), 'payment': dollars(110)},
    {'balance': dollars(1700), 'apr': pct(27.99), 'payment': dollars(65)},
]


def mortgage_cases() -> list[dict]:
    downs = [percent(0), percent(pct(3.5)), percent(pct(20)), amount(dollars(25_000))]

    def build(price, down, years, rate):
        return {'price': dollars(price), 'down': down, 'years': years, 'rate': pct(rate), **costs_block(years + int(rate))}

    return [
        case('design-system', 'design-system', {**DESIGN_MORTGAGE}, True),
        case('cfpb-h24', 'cfpb-h24', {'price': dollars(180_000), 'down': amount(dollars(18_000)), 'years': 30,
                                      'rate': pct(3.875), 'taxYear': 0, 'insuranceYear': 0, 'pmiMonth': 0,
                                      'hoaMonth': 0}, True),
        case('page-example', 'page-example', {**DESIGN_MORTGAGE}),
        case('full-zero-rate', 'grid', {**DESIGN_MORTGAGE, 'rate': 0, 'years': 15}, True),
        *grid('grid', build, [50_000, 375_000, 2_000_000], downs, [1, 15, 30, 40], [0, 1, 6.5, 12.375]),
    ]


def mortgage_random(rng: random.Random, i: int) -> dict:
    price = r_money(rng, 10_000, 20_000_000)
    down = percent(rng.randrange(0, 101) * S) if rng.random() < 0.5 else amount(rng.randrange(0, price + 1))
    return {'price': price, 'down': down, 'years': rng.randrange(1, 41), 'rate': r_rate(rng, 40),
            'taxYear': r_money(rng, 0, 50_000) if rng.random() < 0.7 else 0,
            'insuranceYear': r_money(rng, 0, 20_000) if rng.random() < 0.7 else 0,
            'pmiMonth': r_money(rng, 0, 500) if rng.random() < 0.3 else 0,
            'hoaMonth': r_money(rng, 0, 1500) if rng.random() < 0.3 else 0}


def personal_cases() -> list[dict]:
    def build(amt, rate, months, fee):
        return {'amount': dollars(amt), 'rate': pct(rate), 'months': months, 'feeRate': pct(fee)}

    return [
        case('page-example', 'page-example', build(15_000, 11.5, 36, 5), True),
        *grid('grid', build, [100, 15_000, 1_000_000], [0, 3.99, 11.5, 29.99, 35.99], [1, 12, 36, 120], [0, 5]),
    ]


def personal_random(rng, i):
    return {'amount': r_money(rng, 100, 1_000_000), 'rate': r_rate(rng, 40), 'months': rng.randrange(1, 121),
            'feeRate': r_rate(rng, 20, zero=0.3)}


def auto_cases() -> list[dict]:
    def build(price, extras, rate, months):
        down, trade, taxes = extras
        return {'price': dollars(price), 'down': dollars(down), 'tradeIn': dollars(trade), 'taxesFees': dollars(taxes),
                'rate': pct(rate), 'months': months}

    return [
        case('page-example', 'page-example', build(32_000, (4000, 6000, 2400), 7.5, 60), True),
        *grid('grid', build, [5000, 32_000, 150_000], [(0, 0, 0), (4000, 6000, 2400)], [0, 2.9, 7.5, 21.99],
              [1, 12, 60, 84]),
    ]


def auto_random(rng, i):
    price = r_money(rng, 500, 2_000_000)
    return {'price': price, 'down': rng.randrange(0, price // 2 + 1) if rng.random() < 0.7 else 0,
            'tradeIn': rng.randrange(0, price // 2 + 1) if rng.random() < 0.4 else 0,
            'taxesFees': r_money(rng, 0, 50_000) if rng.random() < 0.7 else 0,
            'rate': r_rate(rng, 40), 'months': rng.randrange(1, 121)}


def refinance_cases() -> list[dict]:
    def build(balance, left, new_rate, new_years, costs):
        c, mode = costs
        return {'balance': dollars(balance), 'rate': pct(7.25), 'monthsLeft': left, 'newRate': pct(new_rate),
                'newYears': new_years, 'costs': dollars(c), 'costsMode': mode}

    return [
        case('page-example', 'page-example', {**GUIDE_REFINANCE}, True),
        case('guide-refinance-break-even', 'guide:refinance-break-even', {**GUIDE_REFINANCE}),
        case('guide-refinance-rolled', 'guide:refinance-break-even', {**GUIDE_REFINANCE, 'costsMode': 'loan'}),
        *grid('grid', build, [50_000, 250_000], [1, 12, 180, 360], [0, 6.0, 9.5], [15, 30],
              [(0, 'cash'), (6000, 'cash'), (6000, 'loan')]),
    ]


def refinance_random(rng, i):
    return {'balance': r_money(rng, 1000, 20_000_000), 'rate': r_rate(rng, 40), 'monthsLeft': rng.randrange(1, 481),
            'newRate': r_rate(rng, 40), 'newYears': rng.randrange(1, 41),
            'costs': r_money(rng, 0, 50_000) if rng.random() < 0.85 else 0,
            'costsMode': 'cash' if rng.random() < 0.5 else 'loan'}


def afford_cases() -> list[dict]:
    def build(income, debts, rate, years, down):
        return {'income': dollars(income), 'debts': dollars(debts), 'down': dollars(down), 'rate': pct(rate),
                'years': years, 'taxYear': dollars(3600), 'insuranceYear': dollars(1500), 'hoaMonth': 0,
                'frontRatio': pct(28), 'backRatio': pct(36)}

    example = build(95_000, 450, 6.5, 30, 40_000)
    return [
        case('page-example', 'page-example', example),
        case('ratios-31-43', 'grid', {**example, 'frontRatio': pct(31), 'backRatio': pct(43)}),
        case('no-room', 'grid', {**example, 'income': dollars(20_000), 'debts': dollars(900)}),
        case('equal-limits', 'grid', {**example, 'debts': 0, 'frontRatio': pct(36), 'backRatio': pct(36)}),
        *grid('grid', build, [30_000, 95_000, 400_000], [0, 450, 3000], [0, 6.5, 12], [15, 30], [0, 40_000]),
    ]


def afford_random(rng, i):
    front = rng.randrange(10, 51) * S
    return {'income': r_money(rng, 1000, 5_000_000), 'debts': r_money(rng, 0, 20_000) if rng.random() < 0.8 else 0,
            'down': r_money(rng, 0, 2_000_000) if rng.random() < 0.8 else 0, 'rate': r_rate(rng, 40),
            'years': rng.randrange(1, 41), 'taxYear': r_money(rng, 0, 30_000) if rng.random() < 0.8 else 0,
            'insuranceYear': r_money(rng, 0, 10_000) if rng.random() < 0.8 else 0,
            'hoaMonth': r_money(rng, 0, 1000) if rng.random() < 0.3 else 0,
            'frontRatio': front, 'backRatio': front + rng.randrange(0, 21) * S}


def amortization_cases() -> list[dict]:
    def build(amt, rate, years):
        return {'amount': dollars(amt), 'rate': pct(rate), 'years': years}

    return [
        case('page-example', 'page-example', build(25_000, 7, 5), True),
        case('design-system', 'design-system', build(300_000, 6.5, 30), True),
        case('full-zero-rate', 'grid', build(10_000, 0, 3), True),
        *grid('grid', build, [100, 25_000, 300_000, 5_000_000], [0, 1, 6.5, 29.99], [1, 15, 30]),
    ]


def amortization_random(rng, i):
    return {'amount': r_money(rng, 100, 100_000_000), 'rate': r_rate(rng, 40), 'years': rng.randrange(1, 51)}


def compound_cases() -> list[dict]:
    def build(start, rate, comp, years, timing):
        initial, monthly = start
        return {'initial': dollars(initial), 'monthly': dollars(monthly), 'rate': pct(rate), 'compounding': comp,
                'years': years, 'timing': timing}

    return [
        case('page-example', 'page-example', build((10_000, 300), 6, 12, 20, 'end'), True),
        case('daily-example', 'grid', build((10_000, 300), 6, 365, 20, 'end'), True),
        case('too-large', 'grid', build((10_000_000, 1_000_000), 40, 365, 80, 'begin')),
        *grid('grid', build, [(0, 300), (10_000, 0), (10_000, 300)], [0, 1, 6, 12], COMPOUNDINGS, [1, 20],
              ['begin', 'end']),
    ]


def compound_random(rng, i):
    return {'initial': r_money(rng, 0, 1_000_000) if rng.random() < 0.85 else 0,
            'monthly': r_money(rng, 0, 10_000) if rng.random() < 0.8 else 0, 'rate': r_rate(rng, 25),
            'compounding': COMPOUNDINGS[rng.randrange(len(COMPOUNDINGS))], 'years': rng.randrange(1, 61),
            'timing': 'begin' if rng.random() < 0.5 else 'end'}


def card_cases() -> list[dict]:
    def build(balance, apr, mode):
        kind, value = mode
        inp = {'balance': dollars(balance), 'apr': pct(apr), 'mode': kind}
        inp['payment' if kind == 'payment' else 'months'] = dollars(value) if kind == 'payment' else value
        return inp

    modes = [('payment', 25), ('payment', 250), ('payment', 1000), ('months', 1), ('months', 12), ('months', 36),
             ('months', 180)]
    return [
        case('page-example', 'page-example', build(6500, 22.99, ('payment', 250)), True),
        case('target-example', 'grid', build(6500, 22.99, ('months', 24))),
        case('barely-covers', 'grid', build(25_000, 59.99, ('payment', 1249.80))),
        *grid('grid', build, [500, 6500, 25_000], [0, 18.99, 29.99, 36, 59.99], modes),
    ]


def card_random(rng, i):
    balance = r_money(rng, 1, 100_000)
    if rng.random() < 0.6:
        return {'balance': balance, 'apr': r_rate(rng, 60), 'mode': 'payment', 'payment': r_money(rng, 1, 20_000)}
    return {'balance': balance, 'apr': r_rate(rng, 60), 'mode': 'months', 'months': rng.randrange(1, 601)}


def debt_sets() -> dict:
    return {
        'guide': GUIDE_DEBTS,
        'ties': [{'balance': dollars(2000), 'apr': pct(18), 'minimum': dollars(60)},
                 {'balance': dollars(2000), 'apr': pct(18), 'minimum': dollars(60)}],
        'one': [{'balance': dollars(8000), 'apr': pct(21.5), 'minimum': dollars(200)}],
        'ten': [{'balance': dollars(500 + 900 * k), 'apr': pct(4 + 2.75 * k), 'minimum': dollars(25 + 15 * k)}
                for k in range(10)],
        'low-minimum': [{'balance': dollars(12_000), 'apr': pct(29.99), 'minimum': dollars(150)},
                        {'balance': dollars(900), 'apr': pct(9.9), 'minimum': dollars(40)}],
        'zero-rate': [{'balance': dollars(3000), 'apr': 0, 'minimum': dollars(100)},
                      {'balance': dollars(1500), 'apr': 0, 'minimum': dollars(50)}],
    }


def debt_payoff_cases() -> list[dict]:
    out = [case('page-example', 'page-example', {'debts': GUIDE_DEBTS, 'extra': dollars(200)}),
           case('guide-snowball-avalanche', 'guide:debt-snowball-vs-avalanche',
                {'debts': GUIDE_DEBTS, 'extra': dollars(200)}),
           case('too-low', 'grid', {'debts': [{'balance': dollars(20_000), 'apr': pct(30), 'minimum': dollars(100)}],
                                    'extra': 0})]
    n = 0
    for name, debts in debt_sets().items():
        for extra in [0, 200, 1000]:
            n += 1
            out.append(case(f'grid-{n:03d}-{name}', 'grid', {'debts': debts, 'extra': dollars(extra)}))
    return out


def debt_payoff_random(rng, i):
    debts = []
    for _ in range(rng.randrange(1, 11)):
        balance = r_money(rng, 1, 50_000)
        apr = r_rate(rng, 36)
        floor = interest(balance, apr) + 1
        debts.append({'balance': balance, 'apr': apr,
                      'minimum': max(floor, balance // 40) if rng.random() < 0.85 else r_money(rng, 0, 500)})
    return {'debts': debts, 'extra': r_money(rng, 0, 2000) if rng.random() < 0.8 else 0}


def rent_buy_cases() -> list[dict]:
    def build(years, appreciation, ret, rent):
        return {**GUIDE_RENT_BUY, 'years': years, 'appreciationRate': pct(appreciation), 'returnRate': pct(ret),
                'rent': dollars(rent)}

    return [
        case('page-example', 'page-example', {**GUIDE_RENT_BUY}),
        case('guide-rent-vs-buy', 'guide:rent-vs-buy-break-even', {**GUIDE_RENT_BUY}),
        case('paid-off-before-horizon', 'grid', {**GUIDE_RENT_BUY, 'termYears': 15, 'years': 30}),
        case('all-cash', 'grid', {**GUIDE_RENT_BUY, 'down': GUIDE_RENT_BUY['price']}),
        *grid('grid', build, [1, 5, 10, 30], [0, 3, -2], [0, 6], [1500, 2200, 4000]),
    ]


def rent_buy_random(rng, i):
    price = r_money(rng, 10_000, 5_000_000)
    return {'price': price, 'down': rng.randrange(0, price + 1), 'rate': r_rate(rng, 15), 'termYears': rng.randrange(1, 41),
            'taxYear': r_money(rng, 0, 30_000), 'insuranceYear': r_money(rng, 0, 10_000),
            'maintenanceRate': r_rate(rng, 5), 'hoaMonth': r_money(rng, 0, 800) if rng.random() < 0.3 else 0,
            'appreciationRate': r_rate(rng, 10, lo_pct=-5), 'sellingRate': r_rate(rng, 10),
            'rent': r_money(rng, 100, 20_000), 'rentIncreaseRate': r_rate(rng, 10), 'returnRate': r_rate(rng, 12),
            'years': rng.randrange(1, 41)}


def extra_cases() -> list[dict]:
    def build(rate, years, extras):
        monthly, yearly, once, month = extras
        return {**DESIGN_MORTGAGE, 'rate': pct(rate), 'years': years, 'extraMonthly': dollars(monthly),
                'extraYearly': dollars(yearly), 'extraOnce': dollars(once), 'extraOnceMonth': month}

    example = {**DESIGN_MORTGAGE, 'extraMonthly': dollars(200), 'extraYearly': 0, 'extraOnce': 0, 'extraOnceMonth': 1}
    return [
        case('page-example', 'page-example', example, True),
        case('guide-extra-payments', 'guide:extra-mortgage-payments', example),
        *grid('grid', build, [0, 6.5], [15, 30],
              [(100, 0, 0, 1), (0, 2000, 0, 1), (0, 0, 10_000, 24), (200, 1000, 5000, 60), (0, 0, 300_000, 1)]),
    ]


def extra_random(rng, i):
    years = rng.randrange(1, 41)
    return {**mortgage_random(rng, i), 'years': years,
            'extraMonthly': r_money(rng, 0, 3000) if rng.random() < 0.7 else 0,
            'extraYearly': r_money(rng, 0, 20_000) if rng.random() < 0.4 else 0,
            'extraOnce': r_money(rng, 0, 100_000) if rng.random() < 0.4 else 0,
            'extraOnceMonth': rng.randrange(1, years * 12 + 1)}


def biweekly_cases() -> list[dict]:
    def build(price, rate, years):
        return {**DESIGN_MORTGAGE, 'price': dollars(price), 'rate': pct(rate), 'years': years}

    return [
        case('page-example', 'page-example', {**DESIGN_MORTGAGE}, True),
        case('one-cent-loan', 'grid', {**DESIGN_MORTGAGE, 'price': dollars(10_000), 'down': amount(dollars('9999.99')),
                                       'rate': 0}),
        *grid('grid', build, [125_000, 375_000], [0, 3, 6.5, 12], [15, 30]),
    ]


def fifteen_cases() -> list[dict]:
    def build(price, down, rates):
        r15, r30 = rates
        return {'price': dollars(price), 'down': down, 'rate15': pct(r15), 'rate30': pct(r30)}

    example = build(375_000, percent(pct(20)), (6.5, 6.5))
    return [
        case('design-system', 'design-system', example, True),
        case('page-example', 'page-example', example),
        case('guide-15-vs-30', 'guide:15-vs-30-year-mortgage', example),
        *[case(f'guide-table-{r}', 'guide:15-vs-30-year-mortgage', build(375_000, percent(pct(20)), (r, r)))
          for r in [4, 5, 6, 7, 8]],
        *grid('grid', build, [200_000, 375_000], [percent(0), percent(pct(20))],
              [(6.5, 6.5), (5.75, 6.5), (0, 0), (12, 12)]),
    ]


def fifteen_random(rng, i):
    m = mortgage_random(rng, i)
    return {'price': m['price'], 'down': m['down'], 'rate15': r_rate(rng, 20), 'rate30': r_rate(rng, 20)}


def balloon_cases() -> list[dict]:
    def build(amt, rate, years, month):
        if month >= years * 12:
            return None
        return {'amount': dollars(amt), 'rate': pct(rate), 'years': years, 'balloonMonth': month}

    return [
        case('page-example', 'page-example', build(200_000, 7, 30, 84), True),
        *grid('grid', build, [10_000, 200_000], [0, 7, 15], [5, 30], [1, 36, 59, 359]),
    ]


def balloon_random(rng, i):
    years = rng.randrange(1, 41)
    return {'amount': r_money(rng, 100, 10_000_000), 'rate': r_rate(rng, 40), 'years': years,
            'balloonMonth': rng.randrange(1, years * 12)} if years * 12 > 1 else balloon_random(rng, i)


def savings_cases() -> list[dict]:
    def build_months(goal, current, rate, months):
        return {'goal': dollars(goal), 'current': dollars(current), 'rate': pct(rate), 'mode': 'months',
                'months': months}

    def build_deposit(current, rate, deposit):
        return {'goal': dollars(20_000), 'current': dollars(current), 'rate': pct(rate), 'mode': 'deposit',
                'deposit': dollars(deposit)}

    return [
        case('page-example', 'page-example', build_months(20_000, 2000, 4, 36), True),
        case('deposit-example', 'grid', build_deposit(2000, 4, 500)),
        case('already-there', 'grid', build_months(1000, 2000, 4, 12)),
        case('interest-alone', 'grid', build_months(2100, 2000, 12, 12)),
        case('too-long', 'grid', build_deposit(0, 0, 1)),
        # A goal already met, left for 100 years at 40%: the balance passes 10^15 cents (review F4, ANU-2).
        case('too-large', 'grid', build_months(100_000_000, 100_000_000, 40, 1200)),
        case('too-large-small', 'grid', build_months(10_000, 10_000, 30, 1200)),
        # Just under the cap: 100 years at 9.9% on $1,000,000 stays below 10^15 cents.
        case('large-under-cap', 'grid', build_months(1_000_000, 1_000_000, 9.9, 1200)),
        *grid('grid-months', build_months, [1000, 20_000, 1_000_000], [0, 2000], [0, 4, 12], [1, 12, 36, 360]),
        *grid('grid-deposit', build_deposit, [0, 2000], [0, 4], [50, 500]),
    ]


def savings_random(rng, i):
    goal = r_money(rng, 1, 2_000_000)
    base = {'goal': goal, 'current': r_money(rng, 0, goal // 100 + 1) if rng.random() < 0.7 else 0,
            'rate': r_rate(rng, 15)}
    if rng.random() < 0.6:
        return {**base, 'mode': 'months', 'months': rng.randrange(1, 601)}
    return {**base, 'mode': 'deposit', 'deposit': r_money(rng, max(1, goal // 100_000 + 1), 50_000)}


def consolidation_cases() -> list[dict]:
    sets = {
        'example': CONSOLIDATION_DEBTS,
        'one': [{'balance': dollars(9000), 'apr': pct(22.9), 'payment': dollars(300)}],
        'ten': [{'balance': dollars(400 + 700 * k), 'apr': pct(6 + 2.5 * k), 'payment': dollars(40 + 20 * k)}
                for k in range(10)],
    }
    out = [case('page-example', 'page-example',
                {'debts': CONSOLIDATION_DEBTS, 'newRate': pct(12.5), 'newMonths': 48, 'feeRate': pct(4)}, True),
           case('too-low', 'grid', {'debts': [{'balance': dollars(9000), 'apr': pct(24), 'payment': dollars(150)}],
                                    'newRate': pct(12.5), 'newMonths': 48, 'feeRate': 0})]
    n = 0
    for name, debts in sets.items():
        for new_rate, months, fee in [(12.5, 48, 4), (0, 12, 0), (35.99, 120, 8)]:
            n += 1
            out.append(case(f'grid-{n:03d}-{name}', 'grid', {'debts': debts, 'newRate': pct(new_rate),
                                                             'newMonths': months, 'feeRate': pct(fee)}))
    return out


def consolidation_random(rng, i):
    debts = []
    for _ in range(rng.randrange(1, 11)):
        balance = r_money(rng, 1, 30_000)
        apr = r_rate(rng, 36)
        debts.append({'balance': balance, 'apr': apr,
                      'payment': interest(balance, apr) + 1 + rng.randrange(0, max(1, balance // 10))})
    return {'debts': debts, 'newRate': r_rate(rng, 36), 'newMonths': rng.randrange(1, 121), 'feeRate': r_rate(rng, 12, zero=0.3)}


def simple_cases() -> list[dict]:
    def build(principal, rate, when):
        unit, time = when
        return {'principal': dollars(principal), 'rate': pct(rate), 'unit': unit, 'time': time}

    return [
        case('page-example', 'page-example', build(10_000, 5, ('years', 3))),
        *grid('grid', build, ['0.01', 10_000, 1_000_000], [0, 5, 18.25],
              [('years', 3), ('months', 18), ('days', 90), ('days', 365), ('years', 0)]),
    ]


def simple_random(rng, i):
    unit = ['years', 'months', 'days'][rng.randrange(3)]
    time = {'years': rng.randrange(0, 101), 'months': rng.randrange(0, 1201), 'days': rng.randrange(0, 36_501)}[unit]
    return {'principal': r_money(rng, '0.01', 100_000_000), 'rate': r_rate(rng, 100), 'unit': unit, 'time': time}


def apy_cases() -> list[dict]:
    def build(rate, comp, direction):
        return {'rate': pct(rate), 'compounding': comp, 'direction': direction}

    return [
        case('page-example', 'page-example', build(5, 365, 'apr-to-apy')),
        *grid('grid', build, [0, 0.01, 1, 5, 6, 12.5, 29.99, 100], COMPOUNDINGS, ['apr-to-apy', 'apy-to-apr']),
    ]


def apy_random(rng, i):
    return {'rate': r_rate(rng, 100), 'compounding': COMPOUNDINGS[rng.randrange(len(COMPOUNDINGS))],
            'direction': 'apr-to-apy' if rng.random() < 0.5 else 'apy-to-apr'}


def official_cases() -> dict[str, list[dict]]:
    """Worked examples from official pages and the numpy-financial docs (fixtures/calc/OFICIAIS.md)."""
    return {
        'mortgage-calculator': [],  # cfpb-h24 is in mortgage_cases (a canonical case with the full schedule)
        'auto-loan-calculator': [
            case(f'cfpb-auto-{months}', 'cfpb-auto-loan-offers',
                 {'price': dollars(20_000), 'down': 0, 'tradeIn': 0, 'taxesFees': 0, 'rate': pct(4.75), 'months': months})
            for months in (36, 72)
        ],
        'personal-loan-calculator': [
            # Appendix J (b)(9): $1,000 financed, 36 payments of $33.61. A 0% loan of $1,209.96 with a $209.96
            # fee has that amount financed and those payments.
            case('regz-j-b9', 'regz-appendix-j', {'amount': dollars('1209.96'), 'rate': 0, 'months': 36,
                                                   'feeRate': pct('17.3526')}),
            # Appendix J (c)(1)(i): $5,000 financed, 24 monthly payments of $230.
            case('regz-j-c1i', 'regz-appendix-j', {'amount': dollars(5520), 'rate': 0, 'months': 24,
                                                    'feeRate': pct('9.4203')}),
        ],
        'apr-to-apy-calculator': [
            case(f'regdd-a-tier-{n}', 'regdd-appendix-a', {'rate': pct(rate), 'compounding': 365, 'direction': 'apr-to-apy'})
            for n, rate in ((1, '5.25'), (2, '5.50'), (3, '5.75'))
        ],
        'loan-amortization-calculator': [
            case('npf-docs-pmt', 'numpy-financial-docs', {'amount': dollars(200_000), 'rate': pct(7.5), 'years': 15}),
            case('npf-docs-ipmt', 'numpy-financial-docs', {'amount': dollars(2500), 'rate': pct('8.24'), 'years': 1}, True),
        ],
        'credit-card-payoff-calculator': [
            case('npf-docs-nper', 'numpy-financial-docs', {'balance': dollars(8000), 'apr': pct(7), 'mode': 'payment',
                                                           'payment': dollars(150)}),
        ],
        'compound-interest-calculator': [
            # The CFPB's $1,000 at 5% compounded yearly ($1,050, then $1,102.50) is left out: the monthly
            # convention rounds each month and ends year 1 at $1,049.99 (OFICIAIS.md). Kept as a plain case.
            case('cfpb-compound-like', 'grid', {'initial': dollars(1000), 'monthly': 0, 'rate': pct(5),
                                                'compounding': 1, 'years': 2, 'timing': 'end'}),
            # The docs' fv of 15692.93 has no rounding; the cent loop ends at $15,692.97 (OFICIAIS.md).
            case('npf-docs-fv-like', 'grid', {'initial': dollars(100), 'monthly': dollars(100), 'rate': pct(5),
                                              'compounding': 12, 'years': 10, 'timing': 'end'}),
        ],
    }


def whole_dollars(cents: int) -> int:
    return half_up(D(cents) / D(100))


# The numbers each official page prints, checked against the oracle's own result. A case listed in
# OFICIAIS.md as "left out" is not here.
OFFICIAL_CHECKS = {
    ('mortgage-calculator', 'cfpb-h24'): lambda e: (
        e['payment'] == 76178 and whole_dollars(e['loan'] - e['yearEnd'][4]) == 15773),
    ('mortgage-calculator', 'design-system'): lambda e: (
        e['payment'] == 189620 and e['totalInterest'] == 38263671 and e['yearEnd'][:3] == [29664688, 29306920, 28925191]),
    ('mortgage-calculator-15-vs-30-year', 'design-system'): lambda e: (
        e['fifteen']['payment'] == 261332 and e['fifteen']['totalInterest'] == 17039828
        and whole_dollars(e['paymentDiff']) == 717 and whole_dollars(e['interestDiff']) == 212238),
    ('auto-loan-calculator', 'cfpb-auto-36'): lambda e: (
        whole_dollars(e['payment']) == 597 and whole_dollars(e['totalInterest']) == 1498),
    # The page's $3,024 of interest is 72 x $319.78 - $20,000; with the last payment that zeroes the balance
    # ($320.16) the interest is $3,024.54. Only the payment is reproduced (OFICIAIS.md).
    ('auto-loan-calculator', 'cfpb-auto-72'): lambda e: whole_dollars(e['payment']) == 320,
    ('personal-loan-calculator', 'regz-j-b9'): lambda e: (
        e['fee'] == 20996 and e['payment'] == 3361 and e['lastPayment'] == 3361 and e['aprHundredths'] == 1283),
    ('personal-loan-calculator', 'regz-j-c1i'): lambda e: (
        e['fee'] == 52000 and e['payment'] == 23000 and e['lastPayment'] == 23000 and e['aprHundredths'] == 969),
    ('apr-to-apy-calculator', 'regdd-a-tier-1'): lambda e: e['result'] == 539,
    ('apr-to-apy-calculator', 'regdd-a-tier-2'): lambda e: e['result'] == 565,
    ('apr-to-apy-calculator', 'regdd-a-tier-3'): lambda e: e['result'] == 592,
    ('loan-amortization-calculator', 'npf-docs-pmt'): lambda e: e['payment'] == 185402,
    # The docs' total of -112.98 sums unrounded interest; the cent loop gives $112.97 (OFICIAIS.md).
    ('loan-amortization-calculator', 'npf-docs-ipmt'): lambda e: (
        e['payment'] == 21775 and e['rows'][0][1:5] == [21775, 1717, 20058, 229942]),
    ('credit-card-payoff-calculator', 'npf-docs-nper'): lambda e: e['months'] == 65,
}


CASES = {
    'mortgage-calculator': mortgage_cases(),
    'personal-loan-calculator': personal_cases(),
    'auto-loan-calculator': auto_cases(),
    'refinance-calculator': refinance_cases(),
    'home-affordability-calculator': afford_cases(),
    'loan-amortization-calculator': amortization_cases(),
    'compound-interest-calculator': compound_cases(),
    'credit-card-payoff-calculator': card_cases(),
    'debt-payoff-calculator': debt_payoff_cases(),
    'rent-vs-buy-calculator': rent_buy_cases(),
    'mortgage-calculator-extra-payments': extra_cases(),
    'mortgage-calculator-biweekly': biweekly_cases(),
    'mortgage-calculator-15-vs-30-year': fifteen_cases(),
    'loan-amortization-calculator-balloon-payment': balloon_cases(),
    'savings-goal-calculator': savings_cases(),
    'debt-consolidation-calculator': consolidation_cases(),
    'simple-interest-calculator': simple_cases(),
    'apr-to-apy-calculator': apy_cases(),
}

RANDOM = {
    'mortgage-calculator': (mortgage_random, 100),
    'personal-loan-calculator': (personal_random, 100),
    'auto-loan-calculator': (auto_random, 100),
    'refinance-calculator': (refinance_random, 100),
    'home-affordability-calculator': (afford_random, 100),
    'loan-amortization-calculator': (amortization_random, 100),
    'compound-interest-calculator': (compound_random, 100),
    'credit-card-payoff-calculator': (card_random, 100),
    'debt-payoff-calculator': (debt_payoff_random, 60),
    'rent-vs-buy-calculator': (rent_buy_random, 60),
    'mortgage-calculator-extra-payments': (extra_random, 60),
    'mortgage-calculator-biweekly': (lambda rng, i: mortgage_random(rng, i), 60),
    'mortgage-calculator-15-vs-30-year': (fifteen_random, 60),
    'loan-amortization-calculator-balloon-payment': (balloon_random, 60),
    'savings-goal-calculator': (savings_random, 100),
    'debt-consolidation-calculator': (consolidation_random, 60),
    'simple-interest-calculator': (simple_random, 100),
    'apr-to-apy-calculator': (apy_random, 100),
}

SEED = '2026-10-31'


def random_cases(calc_id: str) -> list[dict]:
    make, count = RANDOM[calc_id]
    rng = random.Random(f'{SEED}/{calc_id}')
    return [case(f'random-{i + 1:03d}', 'random', make(rng, i)) for i in range(count)]

CALCULATORS = {
    'mortgage-calculator': mortgage,
    'personal-loan-calculator': personal_loan,
    'auto-loan-calculator': auto_loan,
    'refinance-calculator': refinance,
    'home-affordability-calculator': home_affordability,
    'loan-amortization-calculator': loan_amortization,
    'compound-interest-calculator': compound_interest,
    'credit-card-payoff-calculator': credit_card_payoff,
    'debt-payoff-calculator': debt_payoff,
    'rent-vs-buy-calculator': rent_vs_buy,
    'mortgage-calculator-extra-payments': mortgage_extra_payments,
    'mortgage-calculator-biweekly': mortgage_biweekly,
    'mortgage-calculator-15-vs-30-year': mortgage_15_vs_30,
    'loan-amortization-calculator-balloon-payment': balloon_loan,
    'savings-goal-calculator': savings_goal,
    'debt-consolidation-calculator': debt_consolidation,
    'simple-interest-calculator': simple_interest,
    'apr-to-apy-calculator': apr_to_apy,
}


def script_sha256() -> str:
    """SHA-256 of this script, with line ends normalized to LF (the test does the same)."""
    return hashlib.sha256(SCRIPT.read_bytes().replace(b'\r\n', b'\n')).hexdigest()


def build(calc_id: str, today: str) -> dict:
    fn = CALCULATORS[calc_id]
    cases = []
    for case in CASES[calc_id] + official_cases().get(calc_id, []) + random_cases(calc_id):
        try:
            expected = fn(case['input'], case.get('full', False))
        except OracleError as error:
            raise SystemExit(f'{calc_id} {case["id"]}: {error}') from None
        check = OFFICIAL_CHECKS.get((calc_id, case['id']))
        if check is not None and not check(expected):
            raise SystemExit(f'{calc_id} {case["id"]}: the official example does not match: {json.dumps(expected)[:400]}')
        cases.append({'id': case['id'], 'source': case['source'], 'full': case.get('full', False),
                      'input': case['input'], 'expected': expected})
    missing = [key for key in OFFICIAL_CHECKS if key[0] == calc_id and key[1] not in {c['id'] for c in cases}]
    ensure(not missing, f'official checks without a case: {missing}')
    ids = [c['id'] for c in cases]
    ensure(len(ids) == len(set(ids)), f'{calc_id}: repeated case id')
    return {
        'calculator': calc_id,
        'oracle': {
            'script': 'scripts/oracle/calc.py',
            'sha256': script_sha256(),
            'python': platform.python_version(),
            'numpy': numpy.__version__,
            'numpyFinancial': npf.__version__,
            'date': today,
        },
        'units': {'money': 'cents', 'rate': '1/10000 of a percentage point (6.5% = 65000)',
                  'hundredths': '1/100 of a percentage point (5.13% = 513)'},
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
            print(f'{path.name}: {len(data["cases"])} casos')
    if failed:
        sys.exit(1)


if __name__ == '__main__':
    main()
