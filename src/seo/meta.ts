// Technical SEO helpers (PLANO "SEO agressivo › Técnico"): canonical, hreflang and JSON-LD.
import { AUTHOR, CONTACT_EMAIL, SITE_NAME, SITE_ORIGIN } from '../platform/site.ts';
import { DEFAULT_LANG, LANG_TAG, languagesOf, routeById, type Lang, type RouteDef, type RouteId } from '../i18n/routes.ts';

export function absolute(path: string): string {
  return new URL(path, SITE_ORIGIN).href;
}

export interface Alternate {
  hreflang: string;
  href: string;
}

/**
 * hreflang links of an indexable route: every equivalent language plus x-default (English).
 * A page in a single language (allowed by the plan) gets no hreflang at all.
 */
export function alternatesFor(route: RouteDef): Alternate[] {
  if (!route.indexable || languagesOf(route).length < 2) return [];
  const links = languagesOf(route).map((lang) => ({ hreflang: LANG_TAG[lang], href: absolute(route.paths[lang] ?? '/') }));
  const fallback = route.paths[DEFAULT_LANG];
  if (fallback) links.push({ hreflang: 'x-default', href: absolute(fallback) });
  return links;
}

/** '<page title> | FileOrca'; a title that already starts with the brand (the home) stays as is. */
export function pageTitle(title: string): string {
  return title.startsWith(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

export function ogImagePath(id: RouteId, lang: Lang): string {
  return `/og/${lang}/${id}.png`;
}

type JsonLd = Record<string, unknown>;

export function organizationLd(): JsonLd {
  return {
    '@type': 'Organization',
    '@id': `${SITE_ORIGIN}/#organization`,
    name: SITE_NAME,
    url: `${SITE_ORIGIN}/`,
    logo: `${SITE_ORIGIN}/icon-512.png`,
    email: CONTACT_EMAIL,
    founder: { '@id': `${SITE_ORIGIN}/#victor` },
  };
}

export function personLd(): JsonLd {
  return {
    '@type': 'Person',
    '@id': `${SITE_ORIGIN}/#victor`,
    name: AUTHOR.name,
    url: AUTHOR.website,
    sameAs: [AUTHOR.website, AUTHOR.linkedin],
    address: { '@type': 'PostalAddress', addressLocality: AUTHOR.city, addressRegion: AUTHOR.region, addressCountry: 'BR' },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbLd(crumbs: Crumb[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  };
}

/** WebApplication without rating: no aggregateRating, no review (PLANO: "sem nota"). Calculators are FinanceApplication. */
export function webApplicationLd(name: string, description: string, path: string, lang: Lang, category = 'MultimediaApplication'): JsonLd {
  return {
    '@type': 'WebApplication',
    name,
    description,
    url: absolute(path),
    inLanguage: LANG_TAG[lang],
    applicationCategory: category,
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
  };
}

/** A hub page (/image-tools/): a CollectionPage whose main entity is the list of the pages it links to. */
export function collectionPageLd(name: string, description: string, path: string, lang: Lang, items: Crumb[]): JsonLd {
  return {
    '@type': 'CollectionPage',
    name,
    description,
    url: absolute(path),
    inLanguage: LANG_TAG[lang],
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: absolute(item.path),
      })),
    },
  };
}

/** A guide (F4): an Article by the author, with the date it was published and the date it was last reviewed. */
export function articleLd(headline: string, description: string, path: string, lang: Lang, published: string, modified: string): JsonLd {
  return {
    '@type': 'Article',
    headline,
    description,
    url: absolute(path),
    mainEntityOfPage: absolute(path),
    inLanguage: LANG_TAG[lang],
    datePublished: published,
    dateModified: modified,
    author: { '@id': `${SITE_ORIGIN}/#victor` },
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    image: absolute(`/og/${lang}/${path.split('/').filter(Boolean).join('-')}.png`),
  };
}

export function graph(...nodes: JsonLd[]): string {
  // Escape "<" so a text can never close the script element.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c');
}

export function homePath(lang: Lang): string {
  return routeById('home').paths[lang] ?? '/';
}
