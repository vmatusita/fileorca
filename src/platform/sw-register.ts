// The inline script of BaseLayout that registers /sw.js (F8, decision 6; DECISOES § 287). It runs after the load
// event, only where service workers exist, and adds no JS file to the page. Once the worker is active, the page tells
// it its own address and the same-origin files it fetched, so the first page visited is kept too (the worker was not
// there yet when it loaded); the worker drops the query, the fragment and anything it never stores (src/sw/logic.ts).
// It never waits on navigator.serviceWorker.ready, which never settles where service workers are blocked (the
// Playwright default of this repository resolves register() with undefined).
export function swRegistration(): string {
  return [
    "if('serviceWorker'in navigator)addEventListener('load',function(){",
    "navigator.serviceWorker.register('/sw.js').then(function(r){",
    'var w=r&&(r.installing||r.waiting||r.active);if(!w)return;',
    'var u=[location.origin+location.pathname];',
    "performance.getEntriesByType('resource').forEach(function(e){u.push(e.name)});",
    "var m={type:'warm',urls:u};",
    "if(w.state==='activated')w.postMessage(m);",
    "else w.addEventListener('statechange',function(){if(w.state==='activated')w.postMessage(m)})",
    '}).catch(function(){})});',
  ].join('');
}
