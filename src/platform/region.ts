// F12 · a parede do bloqueador e o consentimento (§ 428 and § 449): the one helper of the region on the device, for the
// ad-block wall (always the closable notice in the EU, the United Kingdom and Switzerland when the __tcfapi is not there)
// and for the cookie choice of the site's own notice (F3 c-04: in the regions denied by default, an Accept replays only
// the analytics_storage). The browser does not know the country: the time zone of the device stands for it, with the list
// of the section A of PLANO-MELHORIAS (Europe/*, the Azores, Madeira, the Canaries, Iceland and the Faroes) plus the zones
// of the EU outside Europe that the browsers report (§ 449): Cyprus (Asia/Nicosia and Asia/Famagusta, the canonical names
// Intl gives, Europe/Nicosia included), Ceuta and Melilla (Africa/Ceuta), and the outermost regions of France (Réunion,
// Mayotte, Guadeloupe, Martinique, French Guiana and Saint-Martin); and Atlantic/Faeroe, the name Chromium and Node give
// the Faroes. tests/unit/region.test.ts and consent.spec.ts pass every zone of those countries through Intl.
// The time zone is read only on the device: it never goes into an event, an address or the storage. A time zone that
// cannot be read counts as inside, the safe side of both uses (the wall becomes the closable notice; the Accept stays on
// analytics_storage, and outside the region the ad_* are granted by default).
// Build-time only: it gives the JavaScript the inline scripts carry. No imports and no side effects.

/** The time zones that stand for the EU, the EEA, the United Kingdom and Switzerland. */
export const GDPR_TIME_ZONE =
  /^(?:Europe\/.+|Atlantic\/(?:Azores|Madeira|Canary|Reykjavik|Faroe|Faeroe)|Africa\/Ceuta|Asia\/(?:Nicosia|Famagusta)|Indian\/(?:Reunion|Mayotte)|America\/(?:Guadeloupe|Martinique|Cayenne|Marigot))$/;

/** Whether a time zone of the device stands for the region; an empty one (it could not be read) counts as inside. */
export function inGdprTimeZone(timeZone: string): boolean {
  return timeZone === '' || GDPR_TIME_ZONE.test(timeZone);
}

/**
 * The same test as a JavaScript expression for an inline script: true when the time zone of the device is in the list,
 * or when it cannot be read. It reads Intl once and keeps nothing.
 */
export function gdprZoneJs(): string {
  return `(function(){try{var z=Intl.DateTimeFormat().resolvedOptions().timeZone||'';return z===''||/${GDPR_TIME_ZONE.source}/.test(z);}catch(e){return true;}})()`;
}
