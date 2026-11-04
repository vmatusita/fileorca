import type { WallTexts } from '../types.ts';

// F12 · a parede do bloqueador (decision 10, with adjustment 3; § F12-P6). The texts of the proposal (wall.html,
// "Especificação"), with the second sentence and the buttons of adjustment 3. The steps of the help come from the public
// help of each product (the sources and what was checked are in the § and in the report of the run); none has a link.
export default {
  title: 'Oli lives on ads',
  body: "FileOrca is free, with no sign-ups and no limits, because ads pay the bills. With an ad blocker on, the ads don't show, and nothing comes in. Please turn it off for fileorca.com and reload the page.",
  later: '“Continue just this once” comes back tomorrow.',
  reload: "Reload, it's off now",
  help: 'See how to turn it off',
  escape: 'Continue just this once',
  close: 'Close',
  helpTitle: 'Turn it off just for fileorca.com',
  helpHint: 'Find yours below. Every blocker can let one site through and keep blocking the rest.',
  entries: {
    ubo: {
      name: 'uBlock Origin',
      steps: ['Open uBlock Origin from its icon in the browser toolbar.', 'Press the big blue power button. It turns grey.', 'Reload the page.'],
      note: 'Using uBO Lite? Move the “filtering mode” slider to “no filtering”.',
    },
    adblock: {
      name: 'AdBlock',
      steps: ['Open AdBlock from its icon in the browser toolbar.', 'Choose “Pause on this site”.', 'The page reloads by itself.'],
      note: 'The pause lasts 7 days and renews each time you come back.',
    },
    abp: {
      name: 'Adblock Plus',
      steps: ['Open Adblock Plus from its icon in the browser toolbar.', 'Turn off the “This website” switch.', 'Press “Refresh”.'],
      note: 'The pause lasts 7 days and renews each time you come back.',
    },
    adguard: {
      name: 'AdGuard',
      steps: ['Open AdGuard from its icon in the browser toolbar.', 'Turn off “Protection for current website”.', 'Reload the page.'],
      note: 'The pause icon at the top stops AdGuard on every site. The switch is enough.',
    },
    brave: {
      name: 'Brave',
      steps: [
        'Open Brave Shields from the lion icon at the right of the address bar.',
        'Turn Shields down with the switch at the top of the panel.',
        "Reload the page if it doesn't reload by itself.",
      ],
      note: 'This changes fileorca.com only. On the phone, the lion is in the address bar too.',
    },
    firefox: {
      name: 'Firefox, strict mode',
      steps: [
        'Open the shield at the left of the address bar.',
        'Turn off “Enhanced Tracking Protection”. It now says “Off for this site”.',
        'The page reloads by itself.',
      ],
      note: 'Firefox calls it tracking protection, not an ad blocker. Strict mode also blocks some ads.',
    },
    'safari-mac': {
      name: 'Safari on Mac',
      steps: [
        'With fileorca.com open, choose Safari > Settings, then Websites.',
        'In the list on the left, choose “Content Blockers”.',
        'In the menu next to fileorca.com, choose “Off”, then reload the page.',
      ],
      note: 'AdBlock, Adblock Plus and AdGuard also have their own icon in Safari: see above.',
    },
    'safari-ios': {
      name: 'Safari on iPhone and iPad',
      steps: [
        'In Safari, tap the button at the left of the address (before iOS 18, it was “aA”).',
        'Tap “Manage Extensions” and turn off your blocker.',
        'Reload the page.',
      ],
      note: 'Is it a content blocker? In the same menu, open the website settings and turn off “Use Content Blockers”.',
    },
    other: {
      name: 'Another blocker, or the network',
      steps: ['Look for its icon in the browser toolbar or inside the address bar.', 'Allow fileorca.com, or pause it on this site.', 'Reload the page.'],
      note: "If the block comes from the network (at some offices and schools, or with some VPNs and DNS services), the browser can't turn it off. Try another network.",
    },
  },
} satisfies WallTexts;
