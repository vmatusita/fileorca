// Consent Mode v2 defaults and the inline bootstrap that runs first in <head> (DECISOES §§ 8 e 9).
// The bootstrap declares the consent defaults, replays a stored choice, then `config`;
// gtag.js itself is only injected on the production hostname.
import { GA4_MEASUREMENT_ID, PRODUCTION_HOSTNAME } from '../platform/site.ts';
import { EVENT_PARAMS } from './events.ts';
import { gdprZoneJs } from '../platform/region.ts';

export const CONSENT_KEYS = ['ad_storage', 'analytics_storage', 'ad_user_data', 'ad_personalization'] as const;
export type ConsentKey = (typeof CONSENT_KEYS)[number];
export type ConsentValue = 'granted' | 'denied';
export type ConsentState = Record<ConsentKey, ConsentValue>;

/** EU 27. */
export const EU = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
] as const;
/** EEA outside the EU, the United Kingdom and Switzerland. */
export const EEA_EXTRA = ['IS', 'LI', 'NO'] as const;
export const DENIED_BY_DEFAULT_REGIONS: readonly string[] = [...EU, ...EEA_EXTRA, 'GB', 'CH'];

/** localStorage key holding the person's choice ("granted" or "denied"). */
export const CONSENT_STORAGE_KEY = 'fo-consent';

export function consentState(value: ConsentValue): ConsentState {
  return { ad_storage: value, analytics_storage: value, ad_user_data: value, ad_personalization: value };
}

/** What the region would get before any choice; used by tests and by the privacy page. */
export function defaultConsentFor(region: string): ConsentState {
  return consentState(DENIED_BY_DEFAULT_REGIONS.includes(region.toUpperCase()) ? 'denied' : 'granted');
}

export const GTAG_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;

/*
 * F12 · o consentimento (F3 c-04, saída A; § F12-P3). The choice made in the site's own notice, as the consent update it
 * sends, when it is replayed in <head> and when it is made in the notice (CookieNotice.astro calls window.foConsent):
 * - a Decline sends the four keys denied, everywhere: a denial grants nothing, and where the region is denied by default
 *   the ad_* are denied already, so Google's message still decides them (its update comes after this one);
 * - an Accept, where the time zone of the device stands for a region denied by default (src/platform/region.ts), sends only
 *   analytics_storage: the ad_* stay with Google's consent message, which comes with the AdSense loader on the pages with
 *   ads. Elsewhere it sends the four keys, as before: outside those regions nothing changes.
 */
export function consentUpdateJs(): string {
  return `function(v){if(!window.gtag)return;gtag('consent','update',v==='granted'&&${gdprZoneJs()}?{analytics_storage:v}:{ad_storage:v,analytics_storage:v,ad_user_data:v,ad_personalization:v});}`;
}

/**
 * Inline script for <head>. Keep it small and dependency-free: it runs before any other script.
 * `window.foTrack(name, params)` sends an event with only the allowed parameters (events.ts).
 */
export function consentBootstrap(): string {
  const granted = JSON.stringify(consentState('granted'));
  const denied = JSON.stringify({ ...consentState('denied'), region: DENIED_BY_DEFAULT_REGIONS });
  const allowed = JSON.stringify(EVENT_PARAMS);
  return [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments);}',
    'window.gtag=gtag;',
    `gtag('consent','default',${denied});`,
    `gtag('consent','default',${granted});`,
    // F12 (c-04; § F12-P3): the stored choice goes through window.foConsent, the same update the notice sends.
    `window.foConsent=${consentUpdateJs()};`,
    `try{var c=localStorage.getItem('${CONSENT_STORAGE_KEY}');if(c==='granted'||c==='denied'){foConsent(c);}}catch(e){}`,
    "gtag('js',new Date());",
    `gtag('config','${GA4_MEASUREMENT_ID}',{page_location:location.origin+location.pathname});`,
    `var A=${allowed};`,
    'window.foTrack=function(n,p){var k=A[n];if(!k)return;var o={};for(var i in p){if(k.indexOf(i)>=0)o[i]=p[i];}gtag(\'event\',n,o);};',
    `if(location.hostname==='${PRODUCTION_HOSTNAME}'){var s=document.createElement('script');s.async=true;s.src='${GTAG_SRC}';document.head.appendChild(s);}`,
  ].join('');
}
