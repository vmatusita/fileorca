// The theme the person picks in the header (F11, decision 2; DECISOES § 385 and § 386): System (the default), Light or
// Dark. The choice stays in this browser, under one localStorage key, only when it is Light or Dark: no key means System,
// and going back to System removes the key. It is a functional preference the person asks for, so it does not wait for
// the cookie notice. Two inline scripts, no file of their own (the specification of docs/propostas/ux-v2/header-a.html):
// - the <head> one only reads, right after the color-scheme meta and before any CSS, so the first paint is already in
//   the stored theme (System puts no data-theme: prefers-color-scheme decides, as before);
// - the button one, right after the </header>, cycles System → Light → Dark, writes or removes the key, follows it with
//   the color-scheme meta and says the new name in the role="status" region next to the button.
// Reading and writing are inside try/catch: with the storage blocked the page opens in System, with no error, and the
// button changes the theme of that page only. No request, no event and no change to the address; another tab follows
// only when it reloads (no storage listener). The service worker keeps whole pages, so the offline page runs it too.

/** The localStorage key of the choice; its value is one of THEME_CHOICES. */
export const THEME_STORAGE_KEY = 'fo-theme';
/** The values the key may hold. System is the absence of the key. */
export const THEME_CHOICES = ['light', 'dark'] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];
/** The order the button goes through: '' is System. */
export const THEME_CYCLE = ['', ...THEME_CHOICES] as const;

const KEY = JSON.stringify(THEME_STORAGE_KEY);

/** The <head> script: reads the key and, for light or dark, puts data-theme on <html> and the same value in the meta. */
export function themeBootstrap(): string {
  return `try{let t=localStorage.getItem(${KEY});if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;document.querySelector('meta[name="color-scheme"]').content=t}}catch(e){}`;
}

/**
 * The button script: the next state of the cycle on each click (Enter and Space click a button), on <html>, in the meta
 * and in the key; then the name of the new state, read from its .fo-sr inside the button, into the status region.
 */
export function themeToggle(): string {
  return [
    '(function(){',
    'var d=document.documentElement,b=document.querySelector("[data-theme-toggle]"),m=document.querySelector(\'meta[name="color-scheme"]\'),s=document.querySelector("[data-theme-status]"),o=["","light","dark"];',
    'b&&b.addEventListener("click",function(){',
    'var t=o[(o.indexOf(d.dataset.theme||"")+1)%3],n;',
    't?d.dataset.theme=t:delete d.dataset.theme;',
    'm&&(m.content=t||"light dark");',
    'n=b.querySelector(".fo-theme__state--"+(t||"system")+" .fo-sr");',
    's&&n&&(s.textContent=n.textContent);',
    `try{t?localStorage.setItem(${KEY},t):localStorage.removeItem(${KEY})}catch(e){}`,
    '})})();',
  ].join('');
}
