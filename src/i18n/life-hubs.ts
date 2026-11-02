// The texts of the home and health hubs (F7, decision 9): English only, so they live beside TEXTS instead of in it (TEXTS
// has the same keys in every language). The hub view, the Open Graph image and the tests read them here.
import type { LifeHub } from '../tools/calc/registry.ts';
import type { LifeHubTexts } from './types.ts';
import home from './en/home-calculators.ts';
import health from './en/health-calculators.ts';

export const LIFE_HUB_TEXTS: Record<LifeHub, LifeHubTexts> = { house: home, health };
