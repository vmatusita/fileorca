#!/usr/bin/env python3
"""Independent oracle for the FileOrca money calculators adapted to Brazil (run F6, decision 5).

Run it outside the Node project, with uv:

    uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python -I scripts/oracle/calc_br.py

`--check` recomputes everything and compares with the files on disk without writing; `--only <id>` does one
calculator. It is self-contained: it imports nothing from the repository and nothing from scripts/oracle/calc.py
(the English oracle, whose 18 fixtures stay byte for byte as they are). For each calculator it writes
fixtures/calc/<id>.json with the inputs in engine units and the expected outputs: every value comes from exact
integer arithmetic and Python's decimal (ROUND_HALF_UP), and the loops are checked against numpy-financial (pmt,
ipmt, irr) within the bound that cent rounding allows. The CI never runs this script: it only reads the JSON
(tests/unit/calc-oracle.test.ts).

Conventions (PLANO "Regra das calculadoras"; DECISOES of the F4 and the F6):

- Money is an integer number of cents; a rate is an integer in 1/10,000 of a percentage point (1.8% = 18000).
- Every rate is EFFECTIVE (Res. CMN 5.004/2022, art. 3, I: contracts state the effective monthly and yearly rate).
  A monthly rate is used as it is: j = r / 1,000,000, exactly. A yearly rate becomes monthly by compounding,
  j = (1 + a)^(1/12) - 1, cut (floor) to 30 decimals; never a / 12.
- The interest of each month is the balance times j, rounded to the cent, half up.
- A PRICE payment comes from the closed formula P = L*j*(1+j)^n / ((1+j)^n - 1), written over whole numbers so
  that the only rounding is the last division, half up; at 0% it is L / n, half up. The last payment zeroes the
  balance: at the last month, or as soon as the payment covers the balance and its interest, it is exactly that.
- SAC: each month the amortization is the balance (after the TR) over the months still to go, half up; the last
  month amortizes what is left.
- TR (SAC x PRICE): at the start of each month the TR corrects the balance (balance * TR, half up), before the
  interest. With the TR at zero the PRICE payment is the one of the first month, fixed; with a TR it is worked out
  again each month on the corrected balance and the months still to go.
- CET (Res. CMN 4.881/2020, art. 4): the monthly rate i with FC0 = sum(FCj / (1 + i)^j), FC0 the credit released
  less what is paid up front, FCj the payments, in equal monthly periods (exponent j/12 of a year: the convention
  of the official example of Boletim nº 8, BCB and Senacon, 2014). CET per year = (1 + i)^12 - 1. Both in
  hundredths of a percent, half up; the year from the unrounded month.
- A loop that would pass 1,200 months is the error "too-long"; a balance above 10^15 cents, "too-large".
"""

from __future__ import annotations

import argparse
import hashlib
import itertools
import json
import platform
import random
import sys
import warnings
from datetime import date
from decimal import ROUND_HALF_UP, Decimal as D, getcontext, localcontext
from pathlib import Path

import numpy
import numpy_financial as npf

getcontext().prec = 100
warnings.filterwarnings('ignore', category=RuntimeWarning, module='numpy_financial')

SCRIPT = Path(__file__).resolve()
REPO = SCRIPT.parents[1].parent
OUT = REPO / 'fixtures' / 'calc'

S = 10_000  # rate units per percentage point
ONE = 100 * S  # rate units per 1.0 (100%)
J_ONE = 10**30  # the 30-decimal scale of a monthly rate
MAX_MONTHS = 1200
MAX_CENTS = 10**15  # a balance above this (R$ 10 trillion) is the error "too-large": past it a double loses cents


class OracleError(Exception):
    pass


def ensure(condition: bool, message: str) -> None:
    if not condition:
        raise OracleError(message)


# --- whole-number arithmetic --------------------------------------------------------------------------


def div_half_up(num: int, den: int) -> int:
    """num / den rounded half up, away from zero (den > 0), exactly."""
    ensure(den > 0, 'division by a non-positive number')
    q, r = divmod(abs(num), den)
    if 2 * r >= den:
        q += 1
    return q if num >= 0 else -q


def half_up(x) -> int:
    return int(D(x).quantize(D(1), rounding=ROUND_HALF_UP))


def share(amount: int, rate: int) -> int:
    """`rate` (rate units) of `amount`, half up."""
    return div_half_up(amount * rate, ONE)


def per_month(per_year: int) -> int:
    return div_half_up(per_year, 12)


def kth_root_floor(m: int, k: int) -> int:
    """floor(m^(1/k)) for m >= 0, by integer Newton's method from above."""
    if m < 2:
        return m
    x = 1 << ((m.bit_length() + k - 1) // k)
    while True:
        y = ((k - 1) * x + m // x ** (k - 1)) // k
        if y >= x:
            break
        x = y
    while x**k > m:
        x -= 1
    while (x + 1) ** k <= m:
        x += 1
    return x


def j_month(rate: int) -> int:
    """A monthly effective rate (rate units) as a whole number of 10^-30: exact."""
    return rate * (J_ONE // ONE)


def j_year(rate: int) -> int:
    """A yearly effective rate as the monthly one, floor(10^30 * ((1 + a)^(1/12) - 1)), cross-checked in decimal."""
    m = (ONE + rate) * J_ONE**12 // ONE
    j = kth_root_floor(m, 12) - J_ONE
    with localcontext() as ctx:
        ctx.prec = 80
        ref = ((1 + D(rate) / D(ONE)) ** (D(1) / D(12)) - 1) * D(J_ONE)
    ensure(abs(D(j) - ref) <= 1, f'monthly rate of {rate}: {j} vs {ref}')
    return j


def interest30(balance: int, j: int) -> int:
    return div_half_up(balance * j, J_ONE)


def annuity30(principal: int, j: int, n: int) -> int:
    """P = L*j*(1+j)^n / ((1+j)^n - 1) over whole numbers (j in 10^-30), half up; at 0%, L / n."""
    if principal == 0:
        return 0
    if j == 0:
        return div_half_up(principal, n)
    grown = (J_ONE + j) ** n
    return div_half_up(principal * j * grown, J_ONE * (grown - J_ONE**n))


def jf(j: int) -> float:
    return j / J_ONE


def check_payment(pay: int, principal: int, j: int, n: int) -> None:
    if principal == 0:
        return
    ref = -float(npf.pmt(jf(j), n, principal))
    ensure(abs(pay - ref) <= 0.5 + 1e-9 * abs(ref), f'pmt {pay} vs numpy-financial {ref}')


def check_rows(rows, principal: int, j: int, n: int) -> None:
    """Each row's interest against npf.ipmt, within the drift that cent rounding allows (a fixed payment)."""
    i = jf(j)
    drift = 0.0
    for row in rows[:-1]:
        k, it = row[0], row[2]
        ref = -float(npf.ipmt(i, k, n, principal))
        ensure(abs(it - ref) <= 0.5 + drift * i + 1e-7 * max(1.0, abs(ref)), f'ipmt row {k}: {it} vs {ref}')
        drift = drift * (1 + i) + 1.0


def price_rows(principal: int, j: int, n: int, payment: int, limit: int | None = None, cap: int | None = None):
    """The cent loop of a fixed payment: rows [k, payment, interest, amortization, balance]. With `cap`, the
    interest of all the months together never passes `cap` (Lei 14.690/2023, art. 28): past it, a month has no
    interest. Returns None past `limit` months."""
    rows = []
    balance, k, charged = principal, 0, 0
    while balance > 0:
        k += 1
        if limit is not None and k > limit:
            return None
        ensure(k <= 100_000, 'runaway schedule')
        it = interest30(balance, j)
        if cap is not None:
            it = min(it, cap - charged)
        charged += it
        total = balance + it
        pay = total if (k >= n or payment >= total) else payment
        balance = total - pay
        rows.append([k, pay, it, pay - it, balance])
    return rows


def totals(rows) -> dict:
    return {
        'count': len(rows),
        'totalInterest': sum(r[2] for r in rows),
        'totalPaid': sum(r[1] for r in rows),
        'firstPayment': rows[0][1] if rows else 0,
        'lastPayment': rows[-1][1] if rows else 0,
    }


# --- SAC x PRICE ----------------------------------------------------------------------------------------


def down_cents(price: int, down: dict) -> int:
    return share(price, down['rate']) if down['kind'] == 'percent' else down['cents']


def sac_rows(loan: int, j: int, n: int, tr: int):
    """SAC with the TR: [k, payment, interest, amortization, balance, correction]."""
    rows, balance = [], loan
    for k in range(1, n + 1):
        if balance == 0:
            break
        correction = share(balance, tr)
        corrected = balance + correction
        it = interest30(corrected, j)
        amort = corrected if k == n else div_half_up(corrected, n - k + 1)
        balance = corrected - amort
        rows.append([k, amort + it, it, amort, balance, correction])
    return rows


def price_tr_rows(loan: int, j: int, n: int, tr: int):
    """PRICE with the TR: [k, payment, interest, amortization, balance, correction]. With the TR at zero the
    payment of the first month stays; with a TR it is worked out again on the corrected balance each month."""
    first = annuity30(loan, j, n)
    rows, balance = [], loan
    for k in range(1, n + 1):
        if balance == 0:
            break
        correction = share(balance, tr)
        corrected = balance + correction
        it = interest30(corrected, j)
        pay = first if tr == 0 else annuity30(corrected, j, n - k + 1)
        total = corrected + it
        if k == n or pay >= total:
            pay = total
        balance = total - pay
        rows.append([k, pay, it, pay - it, balance, correction])
    return rows


def system_summary(rows, fees: int, full: bool) -> dict:
    out = {**totals(rows), 'totalCorrection': sum(r[5] for r in rows), 'totalWithFees': sum(r[1] for r in rows) + fees * len(rows)}
    if full:
        out['rows'] = rows
    return out


def sac_price(inp: dict, full: bool = False) -> dict:
    price = inp['price']
    down = down_cents(price, inp['down'])
    loan = price - down
    n, tr, fees = inp['months'], inp['tr'], inp['fees']
    j = j_year(inp['rate'])
    sac, pr = sac_rows(loan, j, n, tr), price_tr_rows(loan, j, n, tr)
    if tr == 0 and loan > 0:
        check_payment(pr[0][1], loan, j, n)
        check_rows(pr, loan, j, n)
    a, b = system_summary(sac, fees, full), system_summary(pr, fees, full)
    return {'down': down, 'loan': loan, 'sac': a, 'price': b, 'interestDiff': b['totalInterest'] - a['totalInterest']}


# --- credit with the CET (vehicle, personal) --------------------------------------------------------------


def monthly_irr(released: int, payments: list[int]) -> D:
    """The rate i with released = sum(p_k / (1 + i)^k), by bisection in decimal (and checked against npf.irr)."""

    def present(x: D) -> D:
        v = 1 / (1 + x)
        acc, f = D(0), D(1)
        for p in payments:
            f *= v
            acc += D(p) * f
        return acc

    lo, hi = D(0), D(1)
    while present(hi) > released:
        hi *= 2
    for _ in range(140):
        mid = (lo + hi) / 2
        if present(mid) > released:
            lo = mid
        else:
            hi = mid
    x = (lo + hi) / 2
    ref = float(npf.irr([-released, *payments]))
    ensure(abs(float(x) - ref) < 1e-9, f'cet {x} vs numpy-financial irr {ref}')
    return x


def hundredths(x: D) -> int:
    """A rate as hundredths of a percent, half up; refused when it sits so close to a half that a double could
    round it the other way (the engine works the CET out in floating point)."""
    scaled = x * 10_000
    frac = scaled - int(scaled)
    ensure(abs(frac - D('0.5')) > D('1e-6'), f'rate {x} too close to a rounding boundary')
    return half_up(scaled)


def credit(credit_amount: int, inp: dict, full: bool) -> dict:
    n = inp['months']
    j = j_month(inp['rate'])
    costs = inp['iof'] + inp['fees']
    financed = inp['costs'] == 'financed'
    principal = credit_amount + (costs if financed else 0)
    upfront = 0 if financed else costs
    released = credit_amount - upfront
    pay = annuity30(principal, j, n)
    check_payment(pay, principal, j, n)
    rows = price_rows(principal, j, n, pay)
    check_rows(rows, principal, j, n)
    t = totals(rows)
    out = {'credit': credit_amount, 'principal': principal, 'upfront': upfront, 'released': released, 'payment': pay,
           'count': t['count'], 'totalInterest': t['totalInterest'], 'totalPaid': t['totalPaid'] + upfront,
           'lastPayment': t['lastPayment'], 'cetMonth': None, 'cetYear': None}
    if released > 0 and rows:
        payments = [r[1] for r in rows]
        if sum(payments) <= released:
            out['cetMonth'], out['cetYear'] = 0, 0
        else:
            x = monthly_irr(released, payments)
            out['cetMonth'] = hundredths(x)
            out['cetYear'] = hundredths((1 + x) ** 12 - 1)
    if full:
        out['rows'] = rows
    return out


def vehicle_loan(inp: dict, full: bool = False) -> dict:
    return credit(max(0, inp['price'] - inp['down']), inp, full)


def personal_loan(inp: dict, full: bool = False) -> dict:
    return credit(inp['amount'], inp, full)


# --- early payoff ---------------------------------------------------------------------------------------


def plain_sac_rows(balance: int, j: int, n: int):
    """SAC with the amortization = balance / months to go (no TR)."""
    return [row[:5] for row in sac_rows(balance, j, n, 0)]


def shorter_sac_rows(left: int, j: int, n: int, amort: int, prepay: int):
    """SAC that reduces the term (review F6, a-3): the term is cut by the whole amortizations of today the prepayment covers,
    and the schedule keeps the rule of the contract (balance / months to go), so a prepayment of zero leaves the contract
    as it is. Before, a fixed amortization against the contract's rounding gave cents of saving, even negative, for zero."""
    term = max(1, n - (prepay // amort if amort else 0))
    return plain_sac_rows(left, j, term)


def early_payoff(inp: dict, full: bool = False) -> dict:
    balance, n, prepay = inp['balance'], inp['months'], inp['prepay']
    ensure(prepay <= balance, 'prepayment above the balance')
    j = j_month(inp['rate'])
    left = balance - prepay
    if inp['system'] == 'price':
        pay = annuity30(balance, j, n)
        check_payment(pay, balance, j, n)
        base = price_rows(balance, j, n, pay)
        shorter = price_rows(left, j, n, pay)
        lower = price_rows(left, j, n, annuity30(left, j, n))
    else:
        base = plain_sac_rows(balance, j, n)
        amort = base[0][3] if base else 0
        shorter = shorter_sac_rows(left, j, n, amort, prepay)
        lower = plain_sac_rows(left, j, n)
    if prepay == 0:
        # Nothing prepaid, nothing saved, in both systems and both ways.
        ensure(shorter == base and lower == base, 'a prepayment of zero changed the schedule')

    def part(rows, saved: bool) -> dict:
        out = totals(rows)
        if saved:
            out['interestSaved'] = sum(r[2] for r in base) - out['totalInterest']
            out['monthsSaved'] = len(base) - len(rows)
        if full:
            out['rows'] = rows
        return out

    return {'left': left, 'base': part(base, False), 'shorter': part(shorter, True), 'lower': part(lower, True)}


# --- credit card ----------------------------------------------------------------------------------------


def credit_card(inp: dict, full: bool = False) -> dict:
    bill, minimum, n, iof = inp['bill'], inp['minimum'], inp['installments'], inp['iof']
    ensure(minimum <= bill, 'minimum above the bill')
    jr, jp = j_month(inp['revolvingRate']), j_month(inp['installmentRate'])
    # A: the minimum now; the rest one month on the revolving credit, then the installment plan (Res. CMN 4.549,
    # arts. 1 and 2). The cap is the rest, the opening amount of the revolving credit (art. 2-A, sole paragraph).
    rest = bill - minimum
    revolving = min(interest30(rest, jr), rest)
    financed_a = rest + revolving + (iof if rest > 0 else 0)
    pay_a = annuity30(financed_a, jp, n)
    rows_a = price_rows(financed_a, jp, n, pay_a, cap=rest - revolving) if financed_a > 0 else []
    interest_a = revolving + sum(r[2] for r in rows_a)
    # B: the whole bill in installments now; the cap is the bill.
    financed_b = bill + iof
    pay_b = annuity30(financed_b, jp, n)
    rows_b = price_rows(financed_b, jp, n, pay_b, cap=bill)
    interest_b = sum(r[2] for r in rows_b)
    ensure(interest_a <= rest and interest_b <= bill, 'the cap was passed')

    def plan(rows, pay, financed, interest, cap, paid_now) -> dict:
        out = {'financed': financed, 'payment': pay if rows else 0, 'count': len(rows), 'totalInterest': interest,
               'totalPaid': paid_now + sum(r[1] for r in rows), 'capped': interest == cap and cap > 0,
               'lastPayment': rows[-1][1] if rows else 0}
        if full:
            out['rows'] = rows
        return out

    a = {'minimum': minimum, 'revolving': rest, 'revolvingInterest': revolving,
         **plan(rows_a, pay_a, financed_a, interest_a, rest, minimum)}
    b = plan(rows_b, pay_b, financed_b, interest_b, bill, 0)
    return {'a': a, 'b': b, 'diff': a['totalPaid'] - b['totalPaid']}


# --- debts (snowball x avalanche), monthly rates ----------------------------------------------------------


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
                it = div_half_up(balances[i] * debts[i]['rate'], ONE)
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
    first = sum(div_half_up(d['balance'] * d['rate'], ONE) for d in debts)
    if budget <= first:
        return {'error': 'too-low', 'minimum': first + 1, 'budget': budget}
    snowball = sorted(range(len(debts)), key=lambda i: (debts[i]['balance'], i))
    avalanche = sorted(range(len(debts)), key=lambda i: (-debts[i]['rate'], i))
    a, b = payoff_plan(debts, extra, snowball), payoff_plan(debts, extra, avalanche)
    if a is None or b is None:
        return {'error': 'too-long', 'budget': budget}
    return {'budget': budget, 'snowball': a, 'avalanche': b,
            'interestDiff': a['totalInterest'] - b['totalInterest'], 'monthsDiff': a['months'] - b['months']}


# --- compound interest ----------------------------------------------------------------------------------


def compound(inp: dict, full: bool = False) -> dict:
    initial, monthly, months = inp['initial'], inp['monthly'], inp['months']
    j = j_month(inp['rate']) if inp['unit'] == 'month' else j_year(inp['rate'])
    balance = initial
    years, deposits_y, interest_y = [], 0, 0
    for m in range(1, months + 1):
        it = interest30(balance, j)
        balance += it + monthly
        if balance > MAX_CENTS:
            return {'error': 'too-large'}
        interest_y += it
        deposits_y += monthly
        if m % 12 == 0 or m == months:
            years.append([(m + 11) // 12, deposits_y, interest_y, balance])
            deposits_y = interest_y = 0
    deposits = initial + monthly * months
    if inp['rate'] > 0 and months > 0:
        # numpy-financial's fv has no rounding: the cent loop may drift from it by half a cent a month, compounded.
        i = jf(j)
        ref = -float(npf.fv(i, months, monthly, initial))
        bound = 0.5 * ((1 + i) ** months - 1) / i
        ensure(abs(balance - ref) <= bound + 1e-9 * abs(ref) + 1, f'fv {balance} vs {ref}')
    out = {'final': balance, 'deposits': deposits, 'interest': balance - deposits}
    if full:
        out['years'] = years
    return out


# --- rent or buy ----------------------------------------------------------------------------------------


def grow(amount: int, rate: int) -> int:
    return div_half_up(amount * (ONE + rate), ONE)


def rent_or_buy(inp: dict, full: bool = False) -> dict:
    price, down = inp['price'], inp['down']
    loan = price - down
    j = j_year(inp['rate'])
    n = inp['months']
    rows = sac_rows(loan, j, n, 0) if inp['system'] == 'sac' else price_tr_rows(loan, j, n, 0)
    upfront = share(price, inp['itbiRate']) + share(price, inp['notaryRate'])
    iptu = per_month(inp['iptuYear'])
    jr = j_year(inp['returnRate'])
    value, rent = price, inp['rent']
    buyer, renter = 0, down + upfront
    buyer_net, renter_net = [], []
    total_rent = total_owner = 0
    break_even = None
    for y in range(1, inp['years'] + 1):
        upkeep = div_half_up(value * inp['maintenanceRate'], 12 * ONE)
        for m in range(1, 13):
            k = (y - 1) * 12 + m
            owner = (rows[k - 1][1] if k <= len(rows) else 0) + iptu + upkeep
            total_owner += owner
            total_rent += rent
            buyer += interest30(buyer, jr)
            renter += interest30(renter, jr)
            if owner > rent:
                renter += owner - rent
            elif rent > owner:
                buyer += rent - owner
        value = grow(value, inp['appreciationRate'])
        rent = grow(rent, inp['rentIncreaseRate'])
        k = y * 12
        owed = rows[k - 1][4] if k <= len(rows) else 0
        net = grow(value, -inp['sellingRate']) - owed + buyer
        buyer_net.append(net)
        renter_net.append(renter)
        if break_even is None and net >= renter:
            break_even = y
    return {'payment': rows[0][1] if rows else 0, 'upfront': upfront, 'iptuMonth': iptu, 'buyer': buyer_net,
            'renter': renter_net, 'breakEven': break_even, 'buyerFinal': buyer_net[-1], 'renterFinal': renter_net[-1],
            'totalRent': total_rent, 'totalOwnerCost': total_owner}


# --- the cases ------------------------------------------------------------------------------------------


def reais(x) -> int:
    return half_up(D(str(x)) * 100)


def pct(x) -> int:
    return half_up(D(str(x)) * S)


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
def r_money(rng: random.Random, lo_reais, hi_reais, round_share: float = 0.3) -> int:
    lo, hi = reais(lo_reais), reais(hi_reais)
    while True:
        digits = rng.randrange(len(str(max(lo, 1))), len(str(hi)) + 1)
        value = rng.randrange(10 ** (digits - 1), 10**digits)
        if rng.random() < round_share:
            value -= value % 100
        if lo <= value <= hi:
            return value


def r_rate(rng: random.Random, hi_pct, zero: float = 0.06, lo_pct=0) -> int:
    hi, lo = D(str(hi_pct)), D(str(lo_pct))
    x = rng.random()
    if x < zero and lo <= 0:
        return 0
    if x < 0.45:
        return rng.randrange(int(lo * 8), int(hi * 8) + 1) * (S // 8)
    return rng.randrange(int(lo * S), int(hi * S) + 1)


# The examples the pages start with (each definition's `initial`; tests/unit/calc-defs.test.ts ties them).
PAGE_EXAMPLES = {
    'br-sac-price': {'price': reais(500_000), 'down': {'kind': 'percent', 'rate': pct(20)}, 'months': 360,
                     'rate': pct(11), 'tr': 0, 'fees': reais(150)},
    'br-vehicle-loan': {'price': reais(80_000), 'down': reais(20_000), 'months': 48, 'rate': pct('1.8'),
                        'iof': reais(1500), 'fees': reais(800), 'costs': 'financed'},
    'br-personal-loan': {'amount': reais(10_000), 'months': 24, 'rate': pct('2.5'), 'iof': reais(300), 'fees': 0,
                         'costs': 'financed'},
    'br-early-payoff': {'balance': reais(200_000), 'rate': pct('0.9'), 'months': 300, 'system': 'price',
                        'prepay': reais(20_000)},
    'br-credit-card': {'bill': reais(3000), 'minimum': reais(450), 'revolvingRate': pct(14), 'installmentRate': pct(8),
                       'installments': 12, 'iof': reais(50)},
    'br-debt-payoff': {'debts': [{'balance': reais(4000), 'rate': pct(12), 'minimum': reais(600)},
                                 {'balance': reais(1500), 'rate': pct(8), 'minimum': reais(150)},
                                 {'balance': reais(9000), 'rate': pct(3), 'minimum': reais(450)}],
                       'extra': reais(300)},
    'br-compound-interest': {'initial': reais(5000), 'monthly': reais(500), 'rate': pct(10), 'unit': 'year', 'months': 120},
    'br-rent-or-buy': {'price': reais(500_000), 'down': reais(100_000), 'rent': reais(2500), 'years': 10, 'system': 'sac',
                       'rate': pct(11), 'months': 360, 'itbiRate': pct(3), 'notaryRate': pct(1), 'iptuYear': reais(1500),
                       'maintenanceRate': pct(1), 'appreciationRate': pct(4), 'sellingRate': pct(6),
                       'rentIncreaseRate': pct(5), 'returnRate': pct(9)},
}


def page(calc_id: str) -> list[dict]:
    return [case('page-example', 'page-example', PAGE_EXAMPLES[calc_id], True)]


def sac_price_cases() -> list[dict]:
    def build(price, share_pct, months, rate, tr):
        return {'price': reais(price), 'down': {'kind': 'percent', 'rate': pct(share_pct)}, 'months': months,
                'rate': pct(rate), 'tr': pct(tr), 'fees': reais(80)}
    out = page('br-sac-price')
    out += grid('grid', build, [150_000, 800_000], [0, 20, 30], [120, 360, 420], [0, '9.5', 13], [0, '0.1'])
    out.append(case('amount-down', 'grid', {'price': reais(300_000), 'down': {'kind': 'amount', 'cents': reais('60000.55')},
                                            'months': 240, 'rate': pct('10.75'), 'tr': pct('0.15'), 'fees': 0}, True))
    out.append(case('all-down', 'grid', {'price': reais(200_000), 'down': {'kind': 'percent', 'rate': pct(100)},
                                         'months': 360, 'rate': pct(11), 'tr': pct('0.1'), 'fees': reais(50)}))
    out.append(case('one-month', 'grid', {'price': reais(50_000), 'down': {'kind': 'amount', 'cents': 0},
                                          'months': 12, 'rate': pct(30), 'tr': pct(2), 'fees': 0}, True))
    return out


def sac_price_random(rng, i):
    price = r_money(rng, 10_000, 5_000_000)
    down = {'kind': 'percent', 'rate': r_rate(rng, 60, 0.1)} if rng.random() < 0.6 else {'kind': 'amount', 'cents': r_money(rng, 0, price / 100)}
    return {'price': price, 'down': down, 'months': rng.randrange(12, 421), 'rate': r_rate(rng, 30),
            'tr': r_rate(rng, '0.5', 0.6), 'fees': r_money(rng, 0, 500) if rng.random() < 0.6 else 0}


def credit_input(rng, base: dict) -> dict:
    principal_hint = base.get('amount', base.get('price', 0))
    hi = max(1, principal_hint // 100 // 20)
    return {**base, 'months': rng.randrange(1, 97), 'rate': r_rate(rng, 12, 0.05),
            'iof': r_money(rng, 0, hi) if rng.random() < 0.8 else 0,
            'fees': r_money(rng, 0, hi) if rng.random() < 0.6 else 0,
            'costs': 'financed' if rng.random() < 0.55 else 'upfront'}


def vehicle_cases() -> list[dict]:
    def build(price, down, months, rate, costs):
        return {'price': reais(price), 'down': reais(down), 'months': months, 'rate': pct(rate), 'iof': reais(1200),
                'fees': reais(700), 'costs': costs}
    out = page('br-vehicle-loan')
    out += grid('grid', build, [35_000, 120_000], [0, 15_000], [12, 36, 60], [0, '1.29', '2.99'], ['financed', 'upfront'])
    out.append(case('no-costs', 'grid', {'price': reais(60_000), 'down': reais(10_000), 'months': 48, 'rate': pct('1.5'),
                                         'iof': 0, 'fees': 0, 'costs': 'upfront'}, True))
    return out


def vehicle_random(rng, i):
    price = r_money(rng, 5000, 600_000)
    return credit_input(rng, {'price': price, 'down': r_money(rng, 0, price / 100 * 0.7) if rng.random() < 0.8 else 0})


def personal_cases() -> list[dict]:
    def build(amount, months, rate, costs):
        return {'amount': reais(amount), 'months': months, 'rate': pct(rate), 'iof': reais(250), 'fees': reais(150),
                'costs': costs}
    out = page('br-personal-loan')
    out += grid('grid', build, [2000, 30_000], [6, 24, 72], [0, '1.9', '5.5'], ['financed', 'upfront'])
    return out


def personal_random(rng, i):
    return credit_input(rng, {'amount': r_money(rng, 300, 300_000)})


def early_cases() -> list[dict]:
    def build(balance, rate, months, system, share_pct):
        b = reais(balance)
        return {'balance': b, 'rate': pct(rate), 'months': months, 'system': system, 'prepay': div_half_up(b * pct(share_pct), ONE)}
    out = page('br-early-payoff')
    out += grid('grid', build, [40_000, 350_000], [0, '0.85', '2.4'], [24, 180, 360], ['price', 'sac'], [0, 10, 50, 100])
    return out


def early_random(rng, i):
    balance = r_money(rng, 1000, 3_000_000)
    prepay = rng.randrange(0, balance + 1) if rng.random() < 0.9 else balance
    return {'balance': balance, 'rate': r_rate(rng, 4), 'months': rng.randrange(1, 421),
            'system': 'price' if rng.random() < 0.5 else 'sac', 'prepay': prepay}


def card_cases() -> list[dict]:
    def build(bill, minimum, revolving, installment, n):
        if minimum > bill:
            return None
        return {'bill': reais(bill), 'minimum': reais(minimum), 'revolvingRate': pct(revolving), 'installmentRate': pct(installment),
                'installments': n, 'iof': reais(40)}
    out = page('br-credit-card')
    out += grid('grid', build, [800, 6000], [0, 120, 800], [0, 9, 15], [0, '4.5', 9], [3, 12, 24])
    # The cap bites: a high rate on a long plan (Lei 14.690/2023, art. 28).
    out.append(case('cap-bites', 'grid', {'bill': reais(2000), 'minimum': reais(200), 'revolvingRate': pct(18),
                                          'installmentRate': pct(12), 'installments': 24, 'iof': reais(30)}, True))
    out.append(case('paid-in-full', 'grid', {'bill': reais(1500), 'minimum': reais(1500), 'revolvingRate': pct(15),
                                             'installmentRate': pct(8), 'installments': 10, 'iof': 0}))
    return out


def card_random(rng, i):
    bill = r_money(rng, 50, 60_000)
    return {'bill': bill, 'minimum': rng.randrange(0, bill + 1), 'revolvingRate': r_rate(rng, 25),
            'installmentRate': r_rate(rng, 15), 'installments': rng.randrange(1, 49), 'iof': r_money(rng, 0, 300) if rng.random() < 0.7 else 0}


def debt_cases() -> list[dict]:
    sets = {
        'one': [{'balance': reais(8000), 'rate': pct('2.9'), 'minimum': reais(350)}],
        'ties': [{'balance': reais(2000), 'rate': pct(4), 'minimum': reais(120)},
                 {'balance': reais(2000), 'rate': pct(4), 'minimum': reais(120)}],
        'ten': [{'balance': reais(500 + 900 * k), 'rate': pct(D('0.5') + D('1.1') * k), 'minimum': reais(60 + 25 * k)}
                for k in range(10)],
        'zero-rate': [{'balance': reais(3000), 'rate': 0, 'minimum': reais(100)},
                      {'balance': reais(1500), 'rate': 0, 'minimum': reais(50)}],
    }
    out = page('br-debt-payoff')
    out.append(case('too-low', 'grid', {'debts': [{'balance': reais(20_000), 'rate': pct(15), 'minimum': reais(100)}], 'extra': 0}))
    n = 0
    for name, debts in sets.items():
        for extra in [0, 300, 1500]:
            n += 1
            out.append(case(f'grid-{n:03d}-{name}', 'grid', {'debts': debts, 'extra': reais(extra)}))
    return out


def debt_random(rng, i):
    debts = []
    for _ in range(rng.randrange(1, 11)):
        balance = r_money(rng, 1, 80_000)
        rate = r_rate(rng, 15)
        floor = div_half_up(balance * rate, ONE) + 1
        debts.append({'balance': balance, 'rate': rate,
                      'minimum': max(floor, balance // 30) if rng.random() < 0.85 else r_money(rng, 0, 800)})
    return {'debts': debts, 'extra': r_money(rng, 0, 3000) if rng.random() < 0.8 else 0}


def compound_cases() -> list[dict]:
    def build(initial, monthly, rate, unit, months):
        return {'initial': reais(initial), 'monthly': reais(monthly), 'rate': pct(rate), 'unit': unit, 'months': months}
    out = page('br-compound-interest')
    out += grid('grid', build, [0, 10_000], [0, 750], [0, '0.85', 12], ['month', 'year'], [1, 18, 240])
    return out


def compound_random(rng, i):
    unit = 'month' if rng.random() < 0.5 else 'year'
    return {'initial': r_money(rng, 0, 1_000_000), 'monthly': r_money(rng, 0, 20_000) if rng.random() < 0.8 else 0,
            'rate': r_rate(rng, 3 if unit == 'month' else 30), 'unit': unit, 'months': rng.randrange(1, 601)}


def rent_cases() -> list[dict]:
    base = PAGE_EXAMPLES['br-rent-or-buy']

    def build(system, years, rate, ret, appreciation):
        return {**base, 'system': system, 'years': years, 'rate': pct(rate), 'returnRate': pct(ret), 'appreciationRate': pct(appreciation)}
    out = page('br-rent-or-buy')
    out += grid('grid', build, ['sac', 'price'], [1, 10, 35], [0, 11], [0, 9], [0, 6])
    out.append(case('paid-cash', 'grid', {**base, 'down': base['price'], 'years': 5}))
    return out


def rent_random(rng, i):
    price = r_money(rng, 80_000, 3_000_000)
    return {'price': price, 'down': rng.randrange(0, price + 1), 'rent': r_money(rng, 300, 20_000),
            'years': rng.randrange(1, 41), 'system': 'sac' if rng.random() < 0.6 else 'price', 'rate': r_rate(rng, 18),
            'months': rng.randrange(60, 421), 'itbiRate': r_rate(rng, 5), 'notaryRate': r_rate(rng, 3),
            'iptuYear': r_money(rng, 0, 20_000), 'maintenanceRate': r_rate(rng, 3), 'appreciationRate': r_rate(rng, 12),
            'sellingRate': r_rate(rng, 8), 'rentIncreaseRate': r_rate(rng, 12), 'returnRate': r_rate(rng, 16)}


def official_cases() -> dict[str, list[dict]]:
    """Worked examples from official pages (fixtures/calc/OFICIAIS.md, section Brasil)."""
    return {
        'br-personal-loan': [
            # Boletim Consumo e Finanças nº 8 (BCB and Senacon, 2014): R$ 1,000 financed at 12% a year (0.9489% a
            # month, the field's four decimals), 5 months, a R$ 50 fee and R$ 10 of IOF paid up front.
            case('boletim-8-cet', 'bcb-senacon-boletim-8', {'amount': reais(1000), 'months': 5, 'rate': pct('0.9489'),
                                                            'iof': reais(10), 'fees': reais(50), 'costs': 'upfront'}, True),
            # IN BCB 83/2021, art. 2: R$ 1,000 asked, R$ 80 of costs financed (R$ 30 fees, R$ 10 taxes, R$ 40 other),
            # 1% a month, 24 payments of R$ 50.84.
            case('in-83-demonstrativo', 'in-bcb-83', {'amount': reais(1000), 'months': 24, 'rate': pct(1),
                                                     'iof': reais(10), 'fees': reais(70), 'costs': 'financed'}),
        ],
    }


# The numbers each official page prints, checked against the oracle's own result.
OFFICIAL_CHECKS = {
    ('br-personal-loan', 'boletim-8-cet'): lambda e: (
        e['payment'] == 20573 and e['released'] == 94000 and e['cetMonth'] == 308 and e['cetYear'] == 4393),
    # The page's total of R$ 1,220.16 is 24 x 50.84; the last payment that zeroes the balance makes it R$ 1,220.14
    # (OFICIAIS.md). The payment and the amount financed are reproduced.
    ('br-personal-loan', 'in-83-demonstrativo'): lambda e: e['payment'] == 5084 and e['principal'] == 108000,
}


CALCULATORS = {
    'br-sac-price': (sac_price, sac_price_cases, sac_price_random, 100),
    'br-vehicle-loan': (vehicle_loan, vehicle_cases, vehicle_random, 100),
    'br-personal-loan': (personal_loan, personal_cases, personal_random, 100),
    'br-early-payoff': (early_payoff, early_cases, early_random, 100),
    'br-credit-card': (credit_card, card_cases, card_random, 100),
    'br-debt-payoff': (debt_payoff, debt_cases, debt_random, 60),
    'br-compound-interest': (compound, compound_cases, compound_random, 100),
    'br-rent-or-buy': (rent_or_buy, rent_cases, rent_random, 60),
}

SEED = '2026-10-31'


def random_cases(calc_id: str, fn) -> list[dict]:
    """Random cases from a seed of their own; a draw the CET cannot settle in floating point is drawn again."""
    _fn, _cases, make, count = CALCULATORS[calc_id]
    rng = random.Random(f'{SEED}/{calc_id}')
    out = []
    while len(out) < count:
        inp = make(rng, len(out))
        try:
            fn(inp, False)
        except OracleError as error:
            if 'rounding boundary' in str(error):
                continue
            raise
        out.append(case(f'random-{len(out) + 1:03d}', 'random', inp))
    return out


def script_sha256() -> str:
    """SHA-256 of this script, with line ends normalized to LF (the test does the same)."""
    return hashlib.sha256(SCRIPT.read_bytes().replace(b'\r\n', b'\n')).hexdigest()


def build(calc_id: str, today: str) -> dict:
    fn, fixed, _make, _count = CALCULATORS[calc_id]
    cases = []
    for c in fixed() + official_cases().get(calc_id, []) + random_cases(calc_id, fn):
        try:
            expected = fn(c['input'], c.get('full', False))
        except OracleError as error:
            raise SystemExit(f'{calc_id} {c["id"]}: {error}') from None
        check = OFFICIAL_CHECKS.get((calc_id, c['id']))
        if check is not None and not check(expected):
            raise SystemExit(f'{calc_id} {c["id"]}: the official example does not match: {json.dumps(expected)[:400]}')
        cases.append({'id': c['id'], 'source': c['source'], 'full': c.get('full', False), 'input': c['input'], 'expected': expected})
    missing = [key for key in OFFICIAL_CHECKS if key[0] == calc_id and key[1] not in {c['id'] for c in cases}]
    ensure(not missing, f'official checks without a case: {missing}')
    ids = [c['id'] for c in cases]
    ensure(len(ids) == len(set(ids)), f'{calc_id}: repeated case id')
    return {
        'calculator': calc_id,
        'oracle': {
            'script': 'scripts/oracle/calc_br.py',
            'sha256': script_sha256(),
            'python': platform.python_version(),
            'numpy': numpy.__version__,
            'numpyFinancial': npf.__version__,
            'date': today,
        },
        'units': {'money': 'cents', 'rate': '1/10000 of a percentage point (1.8% = 18000), effective',
                  'hundredths': '1/100 of a percentage point (43.93% = 4393)'},
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
