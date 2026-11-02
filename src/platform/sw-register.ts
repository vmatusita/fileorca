// The inline script of BaseLayout that registers /sw.js (F8, decision 6; DECISOES § 287). It runs after the load
// event, only where service workers exist, and adds no JS file to the page. Once the worker is active, the page tells
// it its own address and the same-origin files it loaded, so the first page visited is kept too (the worker was not
// there yet when it loaded): the scripts and stylesheets of the page, its preloads, manifest and icon, and what the
// resource timing lists. Never the alternate or canonical links, which are other pages. The worker drops the query,
// the fragment and anything it never stores (src/sw/logic.ts). When a new version takes the page over, the page tells it
// again.
// It never waits on navigator.serviceWorker.ready, which never settles where service workers are blocked (the
// Playwright default of this repository resolves register() with undefined).
export const WARM_SELECTOR = 'script[src],link[rel=stylesheet],link[rel=preload],link[rel=modulepreload],link[rel=manifest],link[rel=apple-touch-icon]';

export function swRegistration(): string {
  return [
    "if('serviceWorker'in navigator)addEventListener('load',function(){",
    "navigator.serviceWorker.register('/sw.js').then(function(r){",
    'var w=r&&(r.installing||r.waiting||r.active);if(!w)return;',
    'var m=function(){var u=[location.origin+location.pathname];',
    `document.querySelectorAll('${WARM_SELECTOR}').forEach(function(e){u.push(e.src||e.href)});`,
    "performance.getEntriesByType('resource').forEach(function(e){u.push(e.name)});",
    "return{type:'warm',urls:u}};",
    "if(w.state==='activated')w.postMessage(m());",
    "else w.addEventListener('statechange',function(){if(w.state==='activated')w.postMessage(m())});",
    // A new version takes the page over after the load (review F8 b-1; DECISOES § 307): the list went to the old worker,
    // whose cache the new one deletes, so it goes again to the new one. On the first install the new controller is the
    // worker that already has the list, and it is not told twice (second pass, s-1).
    "navigator.serviceWorker.addEventListener('controllerchange',function(){var c=navigator.serviceWorker.controller;if(c&&c!==w)c.postMessage(m())})",
    '}).catch(function(){})});',
  ].join('');
}
