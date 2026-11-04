// Ad configuration from the Workers Builds variables (PLANO "Como o anúncio liga").
// PUBLIC_* values are read at build time; nothing here runs in the browser.
// F12 (DECISOES § 412): the area "geral" (the home and the guides hub), one unit per position (conteudo, conteudo-2 to
// conteudo-9, lateral, lateral-2 and multiplex; 37 in the map of the F10) and the ad-block wall variable.
import type { AdArea } from '../i18n/routes.ts';

export const AD_AREAS = ['geral', 'arquivos', 'dinheiro', 'casa-saude', 'utilidades'] as const satisfies readonly AdArea[];
/** The content positions: the nth content ad of a page uses conteudo-n (the 1st, plain conteudo). */
export const CONTENT_UNITS = ['conteudo', 'conteudo-2', 'conteudo-3', 'conteudo-4', 'conteudo-5', 'conteudo-6', 'conteudo-7', 'conteudo-8', 'conteudo-9'] as const;
export const AD_UNITS = [...CONTENT_UNITS, 'lateral', 'lateral-2', 'multiplex'] as const;

export type ContentUnit = (typeof CONTENT_UNITS)[number];
export type AdUnit = (typeof AD_UNITS)[number];
export type AdSlots = Partial<Record<AdArea, Partial<Record<AdUnit, string>>>>;

/** PUBLIC_ADBLOCK_WALL: off by default, a closable notice, or the wall that only the escape lifts (PLANO-MELHORIAS A). */
export const WALL_MODES = ['desligado', 'aviso', 'bloqueio'] as const;
export type WallMode = (typeof WALL_MODES)[number];

export interface AdsConfig {
  /** ca-pub-…, or null before the AdSense account exists. */
  client: string | null;
  slots: AdSlots;
  enabled: boolean;
  /** Script and units load only with the three variables filled in. */
  scriptEnabled: boolean;
  /** The value of PUBLIC_ADBLOCK_WALL; the wall itself only exists with scriptEnabled (wallModeOf). */
  wall: WallMode;
}

export type AdsEnv = Partial<
  Record<'PUBLIC_ADSENSE_CLIENT' | 'PUBLIC_ADSENSE_SLOTS' | 'PUBLIC_ADS_ENABLED' | 'PUBLIC_ADBLOCK_WALL', string | undefined>
>;

const CLIENT = /^ca-pub-\d{16}$/;
const UNIT_ID = /^\d{6,}$/;

function parseSlots(raw: string): AdSlots {
  const value: unknown = JSON.parse(raw);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('PUBLIC_ADSENSE_SLOTS must be a JSON object');
  }
  const slots: AdSlots = {};
  for (const [area, units] of Object.entries(value as Record<string, unknown>)) {
    if (!(AD_AREAS as readonly string[]).includes(area)) throw new Error(`PUBLIC_ADSENSE_SLOTS: unknown area "${area}"`);
    if (typeof units !== 'object' || units === null || Array.isArray(units)) throw new Error(`PUBLIC_ADSENSE_SLOTS.${area} must be an object`);
    const parsed: Partial<Record<AdUnit, string>> = {};
    for (const [unit, id] of Object.entries(units as Record<string, unknown>)) {
      if (!(AD_UNITS as readonly string[]).includes(unit)) throw new Error(`PUBLIC_ADSENSE_SLOTS.${area}: unknown unit "${unit}"`);
      if (typeof id !== 'string' || !UNIT_ID.test(id)) throw new Error(`PUBLIC_ADSENSE_SLOTS.${area}.${unit} must be a numeric id`);
      parsed[unit as AdUnit] = id;
    }
    slots[area as AdArea] = parsed;
  }
  return slots;
}

function parseWall(raw: string | undefined): WallMode {
  const value = raw?.trim().toLowerCase() || 'desligado';
  if (!(WALL_MODES as readonly string[]).includes(value)) {
    throw new Error(`PUBLIC_ADBLOCK_WALL must be desligado, aviso or bloqueio (got "${raw ?? ''}")`);
  }
  return value as WallMode;
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
    wall: parseWall(env.PUBLIC_ADBLOCK_WALL),
  };
}

export function buildAdsConfig(): AdsConfig {
  return adsConfigFrom({
    PUBLIC_ADSENSE_CLIENT: import.meta.env.PUBLIC_ADSENSE_CLIENT,
    PUBLIC_ADSENSE_SLOTS: import.meta.env.PUBLIC_ADSENSE_SLOTS,
    PUBLIC_ADS_ENABLED: import.meta.env.PUBLIC_ADS_ENABLED,
    PUBLIC_ADBLOCK_WALL: import.meta.env.PUBLIC_ADBLOCK_WALL,
  });
}

/** ads.txt line: the publisher id without the "ca-" prefix. */
export function adsTxt(client: string): string {
  return `google.com, ${client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`;
}

export function adsenseScriptSrc(client: string): string {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
}

/** The unit of the nth content ad of a page (1-based): conteudo, conteudo-2, …; null past conteudo-9. */
export function contentUnit(position: number): ContentUnit | null {
  return CONTENT_UNITS[position - 1] ?? null;
}

export function unitFor(config: AdsConfig, area: AdArea, unit: AdUnit): string | null {
  if (!config.scriptEnabled) return null;
  return config.slots[area]?.[unit] ?? null;
}

/** The wall only exists with the ads on (the three variables): otherwise it is off, whatever PUBLIC_ADBLOCK_WALL says. */
export function wallModeOf(config: AdsConfig): WallMode {
  return config.scriptEnabled ? config.wall : 'desligado';
}
