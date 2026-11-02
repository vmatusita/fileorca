// The inline script of the offline page (F8, decision 8; DECISOES § 289): it lists the pages this device keeps,
// read from the cache of the service worker, with the title of each one. Inline because the offline page is shown
// in place of any address: a script file would be one more thing to keep. Titles go in as text, never as HTML.
// The list mixes the languages of the pages kept, so each link says its own (lang from the path, WCAG 3.1.2; review F8
// d-1, DECISOES § 307). tests/unit/offline-list.test.ts runs this very script on a fake page and cache.
import { LANG_TAG } from '../i18n/routes.ts';
import { PAGES_CACHE_PREFIX } from '../sw/shared.ts';

/** `skip`: the paths that are not pages to list (the offline and the share pages of every language). */
export function offlineListScript(skip: readonly string[]): string {
  return [
    '(function(){',
    "var l=document.querySelector('[data-saved]'),e=document.querySelector('[data-saved-empty]');",
    "if(!l||!e||!('caches'in window))return;",
    `var P=${JSON.stringify(PAGES_CACHE_PREFIX)},S=${JSON.stringify(skip)},L=${JSON.stringify(LANG_TAG)},seen={};`,
    'caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n.indexOf(P)===0}).map(function(n){',
    'return caches.open(n).then(function(c){return c.keys().then(function(r){return Promise.all(r.map(function(q){',
    'var u=new URL(q.url);',
    'if(u.origin!==location.origin||!/\\/$/.test(u.pathname)||S.indexOf(u.pathname)>=0||seen[u.pathname])return null;',
    'seen[u.pathname]=1;',
    'return c.match(q).then(function(m){return m.text()}).then(function(h){',
    "var t=new DOMParser().parseFromString(h,'text/html').title.replace(/ \\| FileOrca$/,'');",
    'return{p:u.pathname,t:t||u.pathname}})}))})})}))}).then(function(g){',
    'var a=[].concat.apply([],g).filter(Boolean);',
    "a.forEach(function(x){var i=document.createElement('li'),k=document.createElement('a'),g=/^\\/(pt|es)\\//.exec(x.p);k.href=x.p;k.lang=L[g?g[1]:'en'];k.textContent=x.t;i.appendChild(k);l.appendChild(i)});",
    'if(a.length){e.hidden=true;l.hidden=false}}).catch(function(){})})();',
  ].join('');
}
