// GA4 events with a closed list of parameters (PLANO, eventos do GA4; DECISOES § 10).
// No event carries a file name, file content or a number the person typed.
import type { Lang } from '../i18n/routes.ts';

export const EVENT_PARAMS = {
  tool_start: ['tool', 'lang'],
  tool_complete: ['tool', 'lang', 'outcome'],
  download: ['tool', 'lang'],
  next_step_click: ['tool', 'lang', 'target'],
  tool_error: ['tool', 'lang', 'browser', 'codec', 'reason'],
  donate_click: ['place', 'lang'],
} as const;

export type EventName = keyof typeof EVENT_PARAMS;

export type ToolId = 'compress-image';
export type DonatePlace = 'result' | 'footer' | 'support_page';

export interface EventMap {
  tool_start: { tool: ToolId; lang: Lang };
  tool_complete: { tool: ToolId; lang: Lang; outcome: 'smaller' | 'unchanged' };
  download: { tool: ToolId; lang: Lang };
  next_step_click: { tool: ToolId; lang: Lang; target: string };
  tool_error: { tool: ToolId; lang: Lang; browser: string; codec: string; reason: 'decode' | 'encode' | 'unsupported' };
  donate_click: { place: DonatePlace; lang: Lang };
}

/** Drops any parameter outside the list (defence in depth: the types already forbid them). */
export function cleanParams<N extends EventName>(name: N, params: Record<string, unknown>): Partial<EventMap[N]> {
  const allowed: readonly string[] = EVENT_PARAMS[name];
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (allowed.includes(key) && (typeof value === 'string' || typeof value === 'number')) out[key] = value;
  }
  return out as Partial<EventMap[N]>;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    foTrack?: (name: string, params: Record<string, unknown>) => void;
    dataLayer?: unknown[];
  }
}

export function track<N extends EventName>(name: N, params: EventMap[N]): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, cleanParams(name, params as unknown as Record<string, unknown>));
}

/** Short browser label for tool_error, e.g. "safari-18" or "chrome-131". */
export function browserLabel(userAgent: string): string {
  const rules: [string, RegExp][] = [
    ['edge', /Edg\/(\d+)/],
    ['firefox', /Firefox\/(\d+)/],
    ['chrome', /Chrome\/(\d+)/],
    ['safari', /Version\/(\d+)[^ ]* (?:Mobile\/\S+ )?Safari/],
  ];
  for (const [name, pattern] of rules) {
    const match = pattern.exec(userAgent);
    if (match) return `${name}-${match[1]}`;
  }
  return 'other';
}
