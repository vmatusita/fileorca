// F12 · o fuso da região (review C-1; DECISOES § 449): the oracle of src/platform/region.ts, written from outside it. For
// each region the Consent Mode denies by default (§ 9: the EU 27, the EEA, the United Kingdom and Switzerland), every
// time zone the IANA tz database gives that country in zone.tab; and the outermost regions of the EU (article 349 of the
// TFEU), which have codes of their own in zone.tab but are part of France, Portugal and Spain. The tests pass each zone
// through Intl (the name the browser and Node report, Asia/Nicosia for Europe/Nicosia, Atlantic/Faeroe for
// Atlantic/Faroe in Chromium) and expect "inside": tests/unit/region.test.ts in Node, consent.spec.ts in both browsers.

/** zone.tab: the time zones of each of the 32 regions denied by default. */
export const REGION_ZONES: Record<string, readonly string[]> = {
  AT: ['Europe/Vienna'],
  BE: ['Europe/Brussels'],
  BG: ['Europe/Sofia'],
  HR: ['Europe/Zagreb'],
  CY: ['Asia/Nicosia', 'Asia/Famagusta'],
  CZ: ['Europe/Prague'],
  DK: ['Europe/Copenhagen'],
  EE: ['Europe/Tallinn'],
  FI: ['Europe/Helsinki'],
  FR: ['Europe/Paris'],
  DE: ['Europe/Berlin', 'Europe/Busingen'],
  GR: ['Europe/Athens'],
  HU: ['Europe/Budapest'],
  IE: ['Europe/Dublin'],
  IT: ['Europe/Rome'],
  LV: ['Europe/Riga'],
  LT: ['Europe/Vilnius'],
  LU: ['Europe/Luxembourg'],
  MT: ['Europe/Malta'],
  NL: ['Europe/Amsterdam'],
  PL: ['Europe/Warsaw'],
  PT: ['Europe/Lisbon', 'Atlantic/Madeira', 'Atlantic/Azores'],
  RO: ['Europe/Bucharest'],
  SK: ['Europe/Bratislava'],
  SI: ['Europe/Ljubljana'],
  ES: ['Europe/Madrid', 'Africa/Ceuta', 'Atlantic/Canary'],
  SE: ['Europe/Stockholm'],
  IS: ['Atlantic/Reykjavik'],
  LI: ['Europe/Vaduz'],
  NO: ['Europe/Oslo'],
  GB: ['Europe/London'],
  CH: ['Europe/Zurich'],
};

/**
 * The outermost regions of the EU with a code of their own in zone.tab (the Azores, Madeira and the Canaries are under PT
 * and ES above), the Åland Islands (Finland), the old name of the Cyprus zone, and the Faroes of the section A list.
 */
export const OTHER_INSIDE_ZONES: Record<string, readonly string[]> = {
  RE: ['Indian/Reunion'],
  YT: ['Indian/Mayotte'],
  GP: ['America/Guadeloupe'],
  MQ: ['America/Martinique'],
  GF: ['America/Cayenne'],
  MF: ['America/Marigot'],
  AX: ['Europe/Mariehamn'],
  'CY (alias)': ['Europe/Nicosia'],
  FO: ['Atlantic/Faroe'],
};

/**
 * Places outside, next to the ones inside or sharing their tz data: a link of the tz database is not the same zone in Intl
 * (America/Guadeloupe and America/Marigot are links to America/Puerto_Rico, Indian/Mayotte to Africa/Nairobi), and the
 * territories that left the EU or never were in it (Saint-Barthélemy, Sint Maarten, Saint-Pierre, Svalbard).
 */
export const OUTSIDE_ZONES: readonly string[] = [
  'America/Sao_Paulo', 'America/New_York', 'UTC', 'Etc/UTC', 'Asia/Beirut', 'Asia/Jerusalem', 'Africa/Cairo', 'Africa/Casablanca',
  'America/Puerto_Rico', 'Africa/Nairobi', 'Indian/Comoro', 'Indian/Mauritius', 'America/Paramaribo', 'America/St_Barthelemy',
  'America/Lower_Princes', 'America/Miquelon', 'Arctic/Longyearbyen', 'Atlantic/Bermuda', 'Atlantic/Stanley',
];

/** Every zone expected inside, with where it is. */
export const INSIDE_ZONES: readonly { where: string; zone: string }[] = Object.entries({ ...REGION_ZONES, ...OTHER_INSIDE_ZONES }).flatMap(([where, zones]) =>
  zones.map((zone) => ({ where, zone })),
);
