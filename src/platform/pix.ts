// The Pix of the Portuguese pages (PLANO "Doações"; prompt F6, decision 8): a static BR Code for "any amount", R$ 5,
// R$ 10 and R$ 20, built at build time and drawn as a QR in SVG (src/platform/pix-qr.ts). The code follows the
// Manual de Padrões para Iniciação do Pix 2.10.0, section 2.6 (static QR), and the Manual do BR Code 2.0.1: the
// EMV fields in order, each as id, two-digit length and value, closed by a CRC16-CCITT (polynomial 0x1021, start
// 0xFFFF) over everything before it, "6304" included. No dependency: the CRC is computed here, and
// scripts/oracle/pix.py, which shares no code with this file, is the oracle (tests/unit/pix.test.ts).

/** The random Pix key of the site (docs/F0-SAIDA.md): one line of configuration. */
export const PIX_KEY = '1647afcb-3eb8-4fee-8dfe-d5ef477fb13c';
/** The receiver as the BR Code carries it: ASCII, upper case (the payer's app shows the name of the key's owner). */
export const PIX_NAME = 'VICTOR YUKI MATUSITA';
export const PIX_CITY = 'CURITIBA';

/** The amounts of the support page, in reais with two decimals; null is "any amount" (no field 54). */
export const PIX_AMOUNTS = [null, '5.00', '10.00', '20.00'] as const;
export type PixAmount = (typeof PIX_AMOUNTS)[number];

export interface PixInput {
  key: string;
  name: string;
  city: string;
  amount: string | null;
}

/** CRC-16/CCITT-FALSE: polynomial 0x1021, start 0xFFFF, no reflection, over the UTF-8 bytes; 4 upper-case hex digits. */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(payload)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function field(id: string, value: string): string {
  if (value.length > 99) throw new Error(`Pix field ${id} is longer than 99 characters`);
  return `${id}${String(value.length).padStart(2, '0')}${value}`;
}

/** The static BR Code: the receiver, an optional amount, no transaction id ("***"). */
export function brCode({ key, name, city, amount }: PixInput): string {
  if (name.length < 1 || name.length > 25) throw new Error('the Pix name has 1 to 25 characters');
  if (city.length < 1 || city.length > 15) throw new Error('the Pix city has 1 to 15 characters');
  if (amount !== null && !/^\d{1,10}\.\d{2}$/.test(amount)) throw new Error(`not a Pix amount: ${amount}`);
  const payload = [
    field('00', '01'),
    field('26', field('00', 'br.gov.bcb.pix') + field('01', key)),
    field('52', '0000'),
    field('53', '986'),
    amount === null ? '' : field('54', amount),
    field('58', 'BR'),
    field('59', name),
    field('60', city),
    field('62', field('05', '***')),
    '6304',
  ].join('');
  return payload + crc16(payload);
}

/** The code of the site's key for one amount of the support page. */
export function sitePixCode(amount: PixAmount): string {
  return brCode({ key: PIX_KEY, name: PIX_NAME, city: PIX_CITY, amount });
}
