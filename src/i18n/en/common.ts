import type { CommonTexts } from '../types.ts';

export default {
  skipToContent: 'Skip to content',
  header: {
    homeLabel: 'FileOrca home',
    search: 'Search tools',
    langCode: 'EN',
    langSr: ' · Language: English',
    langMenuLabel: 'Choose a language',
    langNames: { en: 'English', pt: 'Português', es: 'Español' },
  },
  breadcrumb: { label: 'Breadcrumb', home: 'Home' },
  seal: 'Your files never leave your device',
  footer: {
    imageColumn: 'Image',
    siteColumn: 'FileOrca',
    about: 'About',
    privacy: 'Privacy',
    terms: 'Terms',
    licenses: 'Licenses',
    contact: 'Contact',
    coffee: 'Like these tools? Support them with a coffee',
    signature: 'Made by {name} in {city}',
  },
  cookie: {
    title: 'Cookies, quickly.',
    body: 'We use Google Analytics to see which tools help, and ads to keep FileOrca free. Your files never leave your device either way.',
    privacyLink: 'Privacy',
    accept: 'Accept',
    decline: 'Decline',
  },
  adLabel: 'Advertisements',
  search: {
    dialogLabel: 'Search tools',
    inputLabel: 'Search tools',
    listLabel: 'Tools',
    placeholder: 'Compress, resize, PDF…',
    close: 'Close',
    emptyTitle: 'No tool called "{query}"',
    emptyHint: 'Try "compress", "image" or "photo".',
    imageCategory: 'Image',
    shortcut: 'Ctrl K',
  },
  tools: {
    'compress-image': {
      name: 'Compress image',
      description: 'Make a JPG, PNG or WebP lighter, right in your browser.',
      synonyms: ['compress', 'shrink', 'reduce', 'optimize', 'smaller', 'photo', 'image', 'jpg', 'png', 'webp'],
    },
  },
} satisfies CommonTexts;
