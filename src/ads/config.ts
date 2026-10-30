// Ad configuration from the Workers Builds variables (PLANO "Como o anúncio liga").
// PUBLIC_* values are read at build time; nothing here runs in the browser.
import type { AdArea } from '../i18n/routes.ts';

export type AdUnit = 'conteudo' | 'lateral';
export type AdSlots = Partial<Record<AdArea, Partial<Record<AdUnit, string>>>>;

export interface AdsConfig {
  /** ca-pub-…, or null before the AdSense account exists. */
  client: string | null;
  slots: AdSlots;
  enabled: boolean;
  /** Script and units load only with the three variables filled in. */
  scriptEnabled: boolean;
}

export type AdsEnv = Partial<Record<'PUBLIC_ADSENSE_CLIENT' | 'PUBLIC_ADSENSE_SLOTS' | 'PUBLIC_ADS_ENABLED', string | undefined>>;

const CLIENT = /^ca-pub-\d{16}$/;
const AREAS: readonly AdArea[] = ['arquivos', 'dinheiro', 'casa-saude', 'utilidades'];

function parseSlots(raw: string): AdSlots {
  const value: unknown = JSON.parse(raw);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('PUBLIC_ADSENSE_SLOTS must be a JSON object');
  }
  const slots: AdSlots = {};
  for (const [area, units] of Object.entries(value as Record<string, unknown>)) {
    if (!AREAS.includes(area as AdArea)) throw new Error(`PUBLIC_ADSENSE_SLOTS: unknown area "${area}"`);
    if (typeof units !== 'object' || units === null) throw new Error(`PUBLIC_ADSENSE_SLOTS.${area} must be an object`);
    const parsed: Partial<Record<AdUnit, string>> = {};
    for (const [unit, id] of Object.entries(units as Record<string, unknown>)) {
      if (unit !== 'conteudo' && unit !== 'lateral') throw new Error(`PUBLIC_ADSENSE_SLOTS.${area}: unknown unit "${unit}"`);
      if (typeof id !== 'string' || !/^\d{6,}$/.test(id)) throw new Error(`PUBLIC_ADSENSE_SLOTS.${area}.${unit} must be a numeric id`);
      parsed[unit] = id;
    }
    slots[area as AdArea] = parsed;
  }
  return slots;
}

/** A malformed variable fails the build, so a typo never ships silently. */
export function adsConfigFrom(env: AdsEnv): AdsConfig {
  const rawClient = env.PUBLIC_ADSENSE_CLIENT?.trim() || null;
  if (rawClient !== null && !CLIENT.test(rawClient)) {
    throw new Error(`PUBLIC_ADSENSE_CLIENT must look like ca-pub-0000000000000000 (got "${rawClient}")`);
  }
  const rawSlots = env.PUBLIC_ADSENSE_SLOTS?.trim();
  const slots = rawSlots ? parseSlots(rawSlots) : {};
  const enabled = env.PUBLIC_ADS_ENABLED?.trim().toLowerCase() === 'true';
  return {
    client: rawClient,
    slots,
    enabled,
    scriptEnabled: rawClient !== null && Boolean(rawSlots) && enabled,
  };
}

export function buildAdsConfig(): AdsConfig {
  return adsConfigFrom({
    PUBLIC_ADSENSE_CLIENT: import.meta.env.PUBLIC_ADSENSE_CLIENT,
    PUBLIC_ADSENSE_SLOTS: import.meta.env.PUBLIC_ADSENSE_SLOTS,
    PUBLIC_ADS_ENABLED: import.meta.env.PUBLIC_ADS_ENABLED,
  });
}

/** ads.txt line: the publisher id without the "ca-" prefix. */
export function adsTxt(client: string): string {
  return `google.com, ${client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`;
}

export function adsenseScriptSrc(client: string): string {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
}

export function unitFor(config: AdsConfig, area: AdArea, unit: AdUnit): string | null {
  if (!config.scriptEnabled) return null;
  return config.slots[area]?.[unit] ?? null;
}
