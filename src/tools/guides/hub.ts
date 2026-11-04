// The guides of the guides hub (F11, decision 5; DECISOES § 364), in its three groups, always read from the registries:
// the file guides of FILE_GUIDES in the order of FILE_GUIDE_IDS, in the group of their hub (Image or PDF), then the money
// guides of GUIDES in the order of GUIDE_IDS, each only in the languages where the route map has its page (the money guides
// are not in Portuguese). The names and descriptions are those of the guide cards (common.fileGuides and common.guides).
// Plain data, importable by Node (the gates and tests): no import.meta.glob here, and never import it from an island.
import { LANGS, pagePath, type Lang } from '../../i18n/routes.ts';
import { TEXTS } from '../../i18n/texts.ts';
import { GUIDE_IDS, type GuideId } from '../calc/registry.ts';
import { FILE_GUIDES, FILE_GUIDE_IDS, type FileGuideId } from './registry.ts';

/** The groups of the hub, in the order of the page; their section ids are the anchors #image, #pdf and #money. */
export const HUB_GROUPS = ['image', 'pdf', 'money'] as const;
export type HubGroup = (typeof HUB_GROUPS)[number];

export interface HubGuide {
  id: FileGuideId | GuideId;
  group: HubGroup;
  /** The path of the guide in the language. */
  path: string;
  name: string;
  description: string;
}

/** The card of a guide, which must exist in every language the guide has a page in: no name would be an empty link. */
function blurb(card: { name: string; description: string } | undefined, id: string, lang: Lang): { name: string; description: string } {
  if (!card) throw new Error(`no ${lang} card for the guide ${id}`);
  return card;
}

/** Every guide of a language, in the order of the hub: the image group, the PDF group, then the money group. */
export function hubGuides(lang: Lang): HubGuide[] {
  const common = TEXTS[lang].common;
  const files = FILE_GUIDE_IDS.flatMap((id): HubGuide[] => {
    const path = pagePath(id, lang);
    if (!path) return [];
    const { name, description } = blurb(common.fileGuides?.[id], id, lang);
    return [{ id, group: FILE_GUIDES[id].hub === 'pdf-tools' ? 'pdf' : 'image', path, name, description }];
  });
  const money = GUIDE_IDS.flatMap((id): HubGuide[] => {
    const path = pagePath(id, lang);
    if (!path) return [];
    const { name, description } = blurb(common.guides?.[id], id, lang);
    return [{ id, group: 'money', path, name, description }];
  });
  return HUB_GROUPS.flatMap((group) => [...files, ...money].filter((guide) => guide.group === group));
}

/**
 * The four guides of the home's "Read a guide" section, per language (F11, decision 7; DECISOES § 398): one per group of
 * the hub and a fourth for the phone, chosen by the volume of data/keywords.csv (guides-entries.html, the specification):
 * HEIC to JPG on Windows (image), why a PDF is so large (PDF), combining PDFs on a phone (the fourth, the one guide
 * written for the phone) and the extra mortgage payments (money). Portuguese has no money guide, so JPG or PNG takes its
 * place. Every id must have a page in its language: the home never shows a card that leads nowhere.
 */
export const HOME_GUIDES: Record<Lang, readonly (FileGuideId | GuideId)[]> = {
  en: ['guides-heic-to-jpg-on-windows', 'guides-why-is-my-pdf-so-large', 'guides-combine-pdfs-on-phone', 'guides-extra-mortgage-payments'],
  pt: ['guides-heic-to-jpg-on-windows', 'guides-why-is-my-pdf-so-large', 'guides-combine-pdfs-on-phone', 'guides-jpg-vs-png'],
  es: ['guides-heic-to-jpg-on-windows', 'guides-why-is-my-pdf-so-large', 'guides-combine-pdfs-on-phone', 'guides-extra-mortgage-payments'],
};
for (const lang of LANGS) {
  for (const id of HOME_GUIDES[lang]) if (!pagePath(id, lang)) throw new Error(`HOME_GUIDES: ${id} has no page in ${lang}`);
}

/** The guides of one group of the hub in a language, in the order of the page (an empty list where the group has none). */
export function hubGroup(group: HubGroup, lang: Lang): HubGuide[] {
  return hubGuides(lang).filter((guide) => guide.group === group);
}
