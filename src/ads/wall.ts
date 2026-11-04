// F12 · a parede do bloqueador (decision 5; § 426 and § 427). The inline script of the ad-block wall, built at
// build time for the language and the mode of the page; AdblockWall.astro puts it at the end of the <body>, only on the
// pages with ads and only with the wall on (wallModeOf). It runs only on fileorca.com, like the AdSense loader, and it
// writes nothing but the time of the escape (fo-wall-escape, § 49 precedent: asked by the person, with or without the
// Accept of the cookie notice). ES5 in the style of the other inline scripts; no file of its own, no request.
//
// The detection, in this order (decision 5):
// 1. offline (navigator.onLine false): nothing is detected;
// 2. Google's signal: googlefc.getAdBlockerStatus() in the AD_BLOCK_DATA_READY of googlefc.callbackQueue (the recovery tag
//    of AdsenseHead.astro, § 416), compared by the numbers of the enum (1 extension, 2 network, 3 none, 0 unknown, which
//    decides nothing) and by the names, EXTENSION_LEVEL_AD_BLOCKER of Google's own example included;
// 3. the fallback, when Google said nothing 4 s after the load event: the AdSense loader failed (window.foAdsFailed, its
//    onerror) and the bait #fo-bait is hidden, both together (the Googlebot only ever has the first);
// 4. an ins.adsbygoogle[data-ad-status="filled"] on the page ends the detection (Acceptable Ads).
// The window closes 4 s after the load event: Google's answer after it, or nothing, leaves the page alone (§ 427).
// The mode: the network-level blocker always gets the closable notice (adjustment 2); so do the EU, the United Kingdom and
// Switzerland, by the __tcfapi (gdprApplies, after tcloaded or useractioncomplete, so the wall never covers Google's
// consent message) or, without it, by the time zone of the device (src/platform/region.ts).
import { PRODUCTION_HOSTNAME } from '../platform/site.ts';
import { gdprZoneJs } from '../platform/region.ts';
import type { Lang } from '../i18n/routes.ts';

/** The only key the wall keeps: the time of "Continue just this once", in ms (Date.now()). */
export const WALL_ESCAPE_KEY = 'fo-wall-escape';
/** How long the escape frees the site in that browser. */
export const WALL_ESCAPE_MS = 30 * 60_000;
/** How long after the load event the fallback waits for Google's answer, and when the detection ends. */
export const WALL_FALLBACK_MS = 4_000;

/** The ad blocking recovery tag of the publisher (§ 416): the publisher id without "ca-", the same cut as the ads.txt line. */
export function recoveryTagSrc(client: string): string {
  return `https://fundingchoicesmessages.google.com/i/${client.replace(/^ca-/, '')}?ers=1`;
}

export interface WallScriptOptions {
  lang: Lang;
  /** The mode the build gives (PUBLIC_ADBLOCK_WALL); the region and the network-level blocker can only soften it. */
  mode: 'aviso' | 'bloqueio';
}

export function wallScript({ lang, mode }: WallScriptOptions): string {
  return [
    '(function(){',
    `var d=document,w=window,dlg=d.getElementById('fo-wall');if(!(location.hostname===${JSON.stringify(PRODUCTION_HOSTNAME)})||!dlg||!navigator.onLine)return;`,
    `var M=${JSON.stringify(mode)},L=${JSON.stringify(lang)},K=${JSON.stringify(WALL_ESCAPE_KEY)},H=${WALL_ESCAPE_MS},s=0,done=false,ready=false,free=false,mode=M,`,
    "help=d.getElementById('fo-wall-help'),reload=dlg.querySelector('[data-wall=\"reload\"]');",
    'function at(){try{return +localStorage.getItem(K)||0;}catch(e){return 0;}}',
    "function day(t){var x=new Date(t);return x.getFullYear()+'-'+x.getMonth()+'-'+x.getDate();}",
    // Escaped less than 30 minutes ago: this page stays free until the next navigation.
    'var now=Date.now(),last=at();if(last&&now>=last&&now-last<H)return;',
    "function track(a){if(w.foTrack)w.foTrack('adblock_wall',{action:a,mode:mode,lang:L});}",
    "function filled(){return !!d.querySelector('ins.adsbygoogle[data-ad-status=\"filled\"]');}",
    'function hold(){if(reload)reload.focus();}',
    // The region: the __tcfapi of Google's consent message, when it answers; otherwise the time zone of the device.
    `function region(cb){var z=${gdprZoneJs()},once=function(v){if(cb){var c=cb;cb=null;c(v);}};`,
    "if(typeof w.__tcfapi!=='function')return once(z);",
    "try{w.__tcfapi('addEventListener',2.2,function(t,ok){if(!ok||!t||typeof t.gdprApplies!=='boolean')return once(z);if(!t.gdprApplies)return once(false);",
    "if(t.eventStatus==='tcloaded'||t.eventStatus==='useractioncomplete')once(true);});}catch(e){once(z);}}",
    'function open(){if(free||dlg.open)return;var c=mode===\'aviso\',t=Date.now(),l=at();',
    "dlg.classList.toggle('fo-wall--aviso',c);dlg.classList.toggle('fo-wall--escaped',!!l&&day(l)===day(t));",
    "dlg.setAttribute('closedby',c?'closerequest':'none');dlg.showModal();hold();track('shown');}",
    "function decide(net){if(done)return;done=true;if(!navigator.onLine||filled())return;region(function(eu){mode=eu||net?'aviso':M;open();});}",
    // Esc on the wall (three layers, § 369, and the keydown): closedby none, a cancel prevented, a close that opens again.
    // Ctrl+K (the search) never opens over the wall.
    "dlg.addEventListener('cancel',function(e){if(mode!=='aviso')e.preventDefault();});",
    "dlg.addEventListener('close',function(){if(!free&&mode!=='aviso'){dlg.showModal();hold();return;}",
    // Closed (the notice, or the escape): the browser gives the focus back to where it was; when it was nowhere (the wall
    // opens by itself), it goes to <main>, after the browser is done with it.
    "setTimeout(function(){var a=d.activeElement,m=d.getElementById('main');if((!a||a===d.body||dlg.contains(a))&&m){m.setAttribute('tabindex','-1');m.focus({preventScroll:true});}},0);});",
    "w.addEventListener('keydown',function(e){if(!dlg.open)return;var k=String(e.key||'').toLowerCase();",
    "if((e.ctrlKey||e.metaKey)&&k==='k'){e.preventDefault();e.stopImmediatePropagation();}else if(k==='escape'&&mode!=='aviso')e.preventDefault();},true);",
    "dlg.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-wall]');if(!b)return;var a=b.getAttribute('data-wall');",
    "if(a==='reload'){track(a);location.reload();}",
    "else if(a==='help'){var o=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(o));if(help)help.hidden=!o;if(o)track(a);}",
    "else if(a==='escape'){if(dlg.classList.contains('fo-wall--escaped'))return;free=true;try{localStorage.setItem(K,String(Date.now()));}catch(x){}track(a);dlg.close('escape');}",
    "else if(a==='close'&&mode==='aviso')dlg.close('close');});",
    // Google's signal, by the numbers of AdBlockerStatusEnum and by its names (0, unknown, decides nothing).
    'function status(){var g=w.googlefc,E=g.AdBlockerStatusEnum||{},v=g.getAdBlockerStatus();if(typeof v!==\'number\')return 0;',
    'if(v===1||v===E.EXTENSION_AD_BLOCKER||v===E.EXTENSION_LEVEL_AD_BLOCKER)return 1;if(v===2||v===E.NETWORK_LEVEL_AD_BLOCKER)return 2;if(v===3||v===E.NO_AD_BLOCKER)return 3;return 0;}',
    'function check(){if(!ready||done)return;if(s===3)done=true;else if(s===1||s===2)decide(s===2);}',
    'w.googlefc=w.googlefc||{};w.googlefc.callbackQueue=w.googlefc.callbackQueue||[];',
    'w.googlefc.callbackQueue.push({AD_BLOCK_DATA_READY:function(){try{s=status();}catch(e){s=0;}check();}});',
    // The fallback, 4 s after the load event: the loader failed and the bait is hidden, both; then the detection ends.
    `function start(){ready=true;check();setTimeout(function(){if(done)return;var b=d.getElementById('fo-bait');if(w.foAdsFailed&&(!b||!b.offsetHeight))decide(false);else done=true;},${WALL_FALLBACK_MS});}`,
    "if(d.readyState==='complete')start();else w.addEventListener('load',start);",
    '})();',
  ].join('');
}
