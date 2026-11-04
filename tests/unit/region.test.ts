// F12 · o fuso da região (review C-1; DECISOES § 449). The time zone list of src/platform/region.ts against an oracle
// written from outside it (tests/e2e/lib/region-zones.ts, from zone.tab): every zone of the 32 regions the Consent Mode
// denies by default (§ 9), and of the outermost regions of the EU, as Node's Intl reports it, stands for the region, both
// in the build-time helper and in the JavaScript the inline scripts run. consent.spec.ts does the same in both browsers.
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { DENIED_BY_DEFAULT_REGIONS } from '../../src/analytics/consent.ts';
import { gdprZoneJs, inGdprTimeZone } from '../../src/platform/region.ts';
import { INSIDE_ZONES, OUTSIDE_ZONES, REGION_ZONES } from '../e2e/lib/region-zones.ts';

/** The name Intl gives a time zone: the canonical one (Europe/Nicosia is Asia/Nicosia, Atlantic/Faroe is Atlantic/Faeroe). */
const reported = (zone: string): string => new Intl.DateTimeFormat('en', { timeZone: zone }).resolvedOptions().timeZone;

/** What the inline scripts compute on a device whose Intl reports this time zone. */
function inlineSays(timeZone: string): unknown {
  return runInNewContext(gdprZoneJs(), { Intl: { DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone }) }) } });
}

describe('o fuso da região, contra o zone.tab (§ 449)', () => {
  it('has a zone for each of the 32 regions denied by default, and only for them', () => {
    expect(Object.keys(REGION_ZONES).sort()).toEqual([...DENIED_BY_DEFAULT_REGIONS].sort());
  });

  it('counts every zone of those regions and of the outermost regions as inside, by the name Intl reports and by its own', () => {
    const outside: string[] = [];
    for (const { where, zone } of INSIDE_ZONES) {
      for (const name of new Set([zone, reported(zone)])) {
        if (!inGdprTimeZone(name) || inlineSays(name) !== true) outside.push(`${where} ${zone} -> ${name}`);
      }
    }
    expect(outside).toEqual([]);
    // Cyprus is the case the review found: the browsers and Node report Asia/*, never Europe/Nicosia.
    expect(reported('Europe/Nicosia')).toBe('Asia/Nicosia');
  });

  it('counts the places next to them, or sharing their tz data, as outside', () => {
    const inside = OUTSIDE_ZONES.flatMap((zone) => [...new Set([zone, reported(zone)])]).filter((name) => inGdprTimeZone(name) || inlineSays(name) !== false);
    expect(inside).toEqual([]);
  });
});
