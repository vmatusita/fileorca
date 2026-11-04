// The test build seen as fileorca.com (F12; DECISOES § 414). The site asks for ads and opens the wall only when
// location.hostname is fileorca.com, so a spec opens https://fileorca.com/... and every request to that origin is
// answered by the test server (redirects included), through context.route, in Chromium and WebKit alike. Every Google
// domain is answered here too, so no test ever reaches Google: the AdSense loader fails or gets an empty stub, the ad
// blocking recovery tag gets the script the spec gives (the googlefc stub of the wall) or fails, and everything else
// (gtag.js, the analytics collector, the ad frames) is aborted. The service worker stays blocked (playwright.config.ts),
// or it would answer from its cache what the routes expect to see.
import type { BrowserContext, Route } from '@playwright/test';
import { TEST_BUILD_ORIGIN } from './test-build.ts';

export const PRODUCTION_ORIGIN = 'https://fileorca.com';
const GOOGLE = /^https:\/\/([a-z0-9-]+\.)*(google|googletagmanager|google-analytics|doubleclick|gstatic|googlesyndication|googleadservices)\.(com|net)\//;
const LOADER = /^https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/;
const RECOVERY = /^https:\/\/fundingchoicesmessages\.google\.com\//;

export interface ProductionOptions {
  /** The AdSense loader: "error" aborts it (what an ad blocker does; its error event fires), "stub" answers an empty script. */
  loader?: 'error' | 'stub';
  /** The ad blocking recovery tag: a script body (the googlefc stub of a case), or "error" to abort it. */
  recovery?: string | 'error';
}

const js = (route: Route, body: string) => route.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body });

/** Answers fileorca.com from the test build and Google from stubs; call it before the first page.goto. */
export async function serveAsProduction(context: BrowserContext, options: ProductionOptions = {}): Promise<void> {
  const { loader = 'error', recovery = 'error' } = options;
  await context.route(/^https:\/\/fileorca\.com\//, async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({ url: `${TEST_BUILD_ORIGIN}${url.pathname}${url.search}`, maxRedirects: 0 });
    await route.fulfill({ response });
  });
  await context.route(GOOGLE, async (route) => {
    const url = route.request().url();
    if (LOADER.test(url)) return loader === 'stub' ? js(route, '') : route.abort('blockedbyclient');
    if (RECOVERY.test(url)) return recovery === 'error' ? route.abort('blockedbyclient') : js(route, recovery);
    return route.abort('blockedbyclient');
  });
}
