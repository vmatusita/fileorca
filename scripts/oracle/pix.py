#!/usr/bin/env python3
"""Independent oracle for the FileOrca Pix codes (run F6, decision 8).

Run it outside the Node project, with uv and nothing but the standard library:

    uv run --no-project --python 3.13 python -I scripts/oracle/pix.py

`--check` rebuilds everything and compares with fixtures/pix.json without writing (the date is ignored).

It imports nothing from the repository and shares no code with the generator (src/platform/pix.ts). The receiver
comes from docs/F0-SAIDA.md (the random Pix key of the site and the name), the city from the plan ("Doações":
CURITIBA). The CRC is the standard library's binascii.crc_hqx: CRC-16/CCITT, polynomial 0x1021, started at 0xFFFF,
as the BR Code manual asks; the generator computes its own.

The code is a static BR Code (Manual de Padrões para Iniciação do Pix, version 2.10.0 of 19 August 2026, section 2.6;
Manual do BR Code, version 2.0.1), read at bcb.gov.br on 1 November 2026:

- 00 Payload Format Indicator "01";
- 26 Merchant Account Information: 00 GUI "br.gov.bcb.pix", 01 the key;
- 52 Merchant Category Code "0000", 53 Transaction Currency "986";
- 54 Transaction Amount, only when there is an amount ("5.00", "10.00", "20.00");
- 58 "BR", 59 the name (1 to 25 characters), 60 the city (1 to 15 characters);
- 62 Additional Data Field Template with 05 Reference Label "***" (no transaction id);
- 63 the CRC16 over everything before it, "6304" included, as 4 upper-case hexadecimal digits.

There is no field 01 (Point of Initiation Method): it is optional, and the static example of the manual has none.
Before writing, the oracle rebuilds the manual's static example and stops if it does not come out exactly.
"""

from __future__ import annotations

import argparse
import binascii
import hashlib
import json
import platform
import re
import sys
from datetime import date
from pathlib import Path

SCRIPT = Path(__file__).resolve()
REPO = SCRIPT.parents[1].parent
OUT = REPO / 'fixtures' / 'pix.json'
F0 = REPO / 'docs' / 'F0-SAIDA.md'

CITY = 'CURITIBA'
AMOUNTS = [None, '5.00', '10.00', '20.00']

# Manual de Padrões para Iniciação do Pix 2.10.0, § 2.6.3: a static QR with a random key, no amount, no txid.
MANUAL = {
    'key': '123e4567-e12b-12d1-a456-426655440000',
    'name': 'Fulano de Tal',
    'city': 'BRASILIA',
    'code': '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D',
}


class OracleError(Exception):
    pass


def field(tag: str, value: str) -> str:
    if len(value) > 99:
        raise OracleError(f'field {tag} is longer than 99 characters')
    return f'{tag}{len(value):02d}{value}'


def crc16(payload: str) -> str:
    return f'{binascii.crc_hqx(payload.encode("utf-8"), 0xFFFF):04X}'


def br_code(key: str, name: str, city: str, amount: str | None) -> str:
    if not 1 <= len(name) <= 25:
        raise OracleError('the name has 1 to 25 characters')
    if not 1 <= len(city) <= 15:
        raise OracleError('the city has 1 to 15 characters')
    if amount is not None and not re.fullmatch(r'\d{1,10}\.\d{2}', amount):
        raise OracleError(f'not an amount: {amount}')
    payload = (
        field('00', '01')
        + field('26', field('00', 'br.gov.bcb.pix') + field('01', key))
        + field('52', '0000')
        + field('53', '986')
        + (field('54', amount) if amount is not None else '')
        + field('58', 'BR')
        + field('59', name)
        + field('60', city)
        + field('62', field('05', '***'))
        + '6304'
    )
    return payload + crc16(payload)


def receiver() -> dict:
    """The key and the name of the receiver, read from the table of docs/F0-SAIDA.md."""
    text = F0.read_text(encoding='utf-8')
    key = re.search(r'^\| Chave Pix aleatória \(só do site\) \| ([0-9a-f-]+) \|', text, re.M)
    name = re.search(r'^\| Nome que aparece no Pix \| ([A-Z ]+?) \|', text, re.M)
    if not key or not name:
        raise OracleError('docs/F0-SAIDA.md has no Pix key or name')
    if not re.fullmatch(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', key.group(1)):
        raise OracleError('the Pix key is not a random key (UUID)')
    return {'key': key.group(1), 'name': name.group(1), 'city': CITY}


def script_sha256() -> str:
    return hashlib.sha256(SCRIPT.read_text(encoding='utf-8').replace('\r\n', '\n').encode('utf-8')).hexdigest()


def build(today: str) -> dict:
    manual = br_code(MANUAL['key'], MANUAL['name'], MANUAL['city'], None)
    if manual != MANUAL['code']:
        raise SystemExit(f'the manual example does not come out:\n  got  {manual}\n  want {MANUAL["code"]}')
    who = receiver()
    return {
        'oracle': {
            'script': 'scripts/oracle/pix.py',
            'sha256': script_sha256(),
            'python': platform.python_version(),
            'date': today,
        },
        'manual': {'source': 'Manual de Padrões para Iniciação do Pix 2.10.0, § 2.6.3', **MANUAL},
        'receiver': who,
        'codes': [{'amount': amount, 'code': br_code(who['key'], who['name'], who['city'], amount)} for amount in AMOUNTS],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--check', action='store_true', help='compare with fixtures/pix.json without writing')
    args = parser.parse_args()
    data = build(date.today().isoformat())
    text = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    if args.check:
        old = json.loads(OUT.read_text(encoding='utf-8'))
        old['oracle'].pop('date', None)
        new = json.loads(text)
        new['oracle'].pop('date', None)
        if old != new:
            print('fixtures/pix.json differs from the oracle', file=sys.stderr)
            raise SystemExit(1)
        print(f'fixtures/pix.json: {len(data["codes"])} codes match the oracle (and the manual example)')
        return
    OUT.write_text(text, encoding='utf-8', newline='\n')
    print(f'wrote fixtures/pix.json: {len(data["codes"])} codes')


if __name__ == '__main__':
    main()
