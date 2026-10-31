import type { EnCommonTexts } from '../types.ts';

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
    change: 'Change my cookie choice',
  },
  adLabel: 'Advertisements',
  search: {
    dialogLabel: 'Search tools',
    inputLabel: 'Search tools',
    listLabel: 'Tools',
    placeholder: 'Find a tool',
    close: 'Close',
    emptyTitle: 'No tool called "{query}"',
    emptyHint: 'Try "compress", "resize" or "photo".',
    imageCategory: 'Image',
    shortcut: 'Ctrl K',
  },
  imageTools: 'Image tools',
  tools: {
    'compress-image': {
      name: 'Compress image',
      description: 'Make a JPG, PNG or WebP lighter, right in your browser.',
      synonyms: ['compress', 'shrink', 'reduce', 'reduce size', 'optimize', 'smaller', 'photo', 'image', 'jpg', 'jpeg', 'png', 'webp'],
    },
    'resize-image': {
      name: 'Resize image',
      description: 'Change the size of an image by pixels or by percentage.',
      synonyms: ['resize', 'scale', 'shrink', 'reduce size', 'dimensions', 'pixels', 'width', 'height', 'photo', 'image', 'jpg', 'jpeg', 'png', 'webp'],
    },
    'crop-image': {
      name: 'Crop image',
      description: 'Cut a photo to a square, 4:5, 16:9 or a free shape.',
      synonyms: ['crop', 'cut', 'trim', 'square', 'aspect ratio', '16:9', '4:5', 'photo', 'image', 'jpg', 'jpeg', 'png', 'webp'],
    },
    'rotate-image': {
      name: 'Rotate image',
      description: 'Turn a photo 90° or 180°, or mirror it.',
      synonyms: ['rotate', 'turn', 'flip', 'mirror', 'sideways', 'upside down', 'photo', 'image', 'jpg', 'jpeg', 'png', 'webp'],
    },
    'heic-to-jpg': {
      name: 'HEIC to JPG',
      description: 'Turn iPhone HEIC photos into JPG or PNG.',
      synonyms: ['heic', 'heif', 'iphone photo', 'iphone', 'apple photo', 'convert', 'jpg', 'jpeg', 'png', 'photo', 'image'],
    },
    'webp-to-jpg': {
      name: 'WebP to JPG',
      description: 'Turn WebP images into JPG or PNG.',
      synonyms: ['webp', 'convert', 'jpg', 'jpeg', 'png', 'animated webp', 'image'],
    },
    'png-to-jpg': {
      name: 'PNG to JPG',
      description: 'Turn PNG into JPG, or JPG into PNG.',
      synonyms: ['png', 'jpg', 'jpeg', 'jpg to png', 'convert', 'transparent', 'image'],
    },
    'avif-to-jpg': {
      name: 'AVIF to JPG',
      description: 'Turn AVIF images into JPG.',
      synonyms: ['avif', 'convert', 'jpg', 'jpeg', 'image'],
    },
    'convert-to-webp': {
      name: 'Convert to WebP',
      description: 'Turn JPG and PNG into smaller WebP or AVIF files.',
      synonyms: ['webp', 'avif', 'convert to avif', 'convert', 'smaller', 'jpg', 'jpeg', 'png', 'image'],
    },
    'image-to-pdf': {
      name: 'Image to PDF',
      description: 'Put your images in one PDF, one image per page.',
      synonyms: ['pdf', 'jpg to pdf', 'png to pdf', 'photo to pdf', 'combine', 'merge', 'jpg', 'jpeg', 'png', 'webp', 'image'],
    },
    'compress-image-to-100kb': {
      name: 'Compress image to 100 KB',
      description: 'A JPG of 100 KB or less, for forms with a size limit.',
      synonyms: ['100kb', '100 kb', 'under 100kb', 'compress to 100kb', 'reduce size', 'shrink', 'form', 'upload', 'jpg', 'jpeg'],
    },
    'compress-image-to-1mb': {
      name: 'Compress image to 1 MB',
      description: 'A JPG of 1 MB or less, for uploads with a size limit.',
      synonyms: ['1mb', '1 mb', 'under 1mb', 'compress to 1mb', 'reduce size', 'shrink', 'form', 'upload', 'jpg', 'jpeg'],
    },
    'resize-image-youtube-thumbnail': {
      name: 'YouTube thumbnail resizer',
      description: 'A 1280 × 720 JPG under 2 MB, ready for a YouTube video.',
      synonyms: ['youtube', 'thumbnail', 'youtube thumbnail', '1280x720', '1280 x 720', '16:9', 'video', 'jpg', 'jpeg'],
    },
  },
} satisfies EnCommonTexts;
