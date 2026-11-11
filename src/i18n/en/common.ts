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
    menu: 'Menu',
    theme: { system: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' },
    menuLanguage: 'Language',
    menuTools: '{n} tools',
    menuCalculators: '{n} calculators',
    menuGuides: '{n} guides',
    menuQr: 'PNG or SVG',
    support: 'Support Oli',
    supportMeta: 'Ko-fi',
  },
  breadcrumb: { label: 'Breadcrumb', home: 'Home' },
  pageIndex: 'On this page',
  seal: 'Your files never leave your device',
  footer: {
    imageColumn: 'Image',
    moneyColumn: 'Money',
    pdfColumn: 'PDF',
    homeColumn: 'Home',
    healthColumn: 'Health',
    utilityColumn: 'Utilities',
    siteColumn: 'FileOrca',
    about: 'About',
    privacy: 'Privacy',
    terms: 'Terms',
    licenses: 'Licenses',
    contact: 'Contact',
    guidesAll: 'All guides',
    tools: {
      all: 'All {n}',
      popular: '{n} popular',
      popularRest: '{noun}',
      image: 'image tools',
      pdf: 'PDF tools',
      money: 'money calculators',
      home: 'home calculators',
      health: 'health calculators',
    },
    guidesTopics: '{n} topics',
    guidesTopicsRest: 'of guides',
    coffee: 'Help keep FileOrca free: buy me a coffee',
    signature: 'Made by {name} in {city}',
  },
  cookie: {
    title: 'Cookies',
    body: 'for Google Analytics and ads.',
    privacyLink: 'Privacy',
    accept: 'Accept',
    decline: 'Decline',
    change: 'Change my cookie choice',
  },
  adLabel: 'Advertisements',
  search: {
    dialogLabel: 'Search tools',
    inputLabel: 'Search tools and guides',
    listLabel: 'Results',
    placeholder: 'Find a tool or a guide',
    close: 'Close',
    emptyTitle: 'No tool or guide called "{query}"',
    emptyHint: 'Try "compress", "resize" or "photo".',
    toolsGroup: 'Tools',
    guidesGroup: 'Guides',
    guideCategory: 'Guide',
    imageCategory: 'Image',
    moneyCategory: 'Money calculators',
    pdfCategory: 'PDF',
    homeCategory: 'Home calculators',
    healthCategory: 'Health calculators',
    utilityCategory: 'Utilities',
    shortcut: 'Ctrl K',
  },
  imageTools: 'Image tools',
  moneyCalculators: 'Money calculators',
  homeCalculators: 'Home calculators',
  healthCalculators: 'Health calculators',
  qr: {
    name: 'QR code generator',
    description: 'A QR code of your link or text, with Oli in the middle, as PNG or SVG.',
    synonyms: ['qr', 'qr code', 'qr generator', 'qr maker', 'link to qr', 'url to qr', 'barcode'],
  },
  pdfTools: 'PDF tools',
  guidesHub: 'Guides',
  pdf: {
    'merge-pdf': {
      name: 'Merge PDF',
      description: 'Put several PDFs into one, in the order you choose.',
      synonyms: ['merge', 'combine', 'join', 'append', 'put together', 'pdf', 'merge pdf', 'combine pdf'],
    },
    'split-pdf': {
      name: 'Split PDF',
      description: 'Cut a PDF into parts: every page, ranges or picked pages.',
      synonyms: ['split', 'separate', 'extract pages', 'cut', 'divide', 'pdf', 'split pdf', 'extract'],
    },
    'pdf-to-jpg': {
      name: 'PDF to JPG',
      description: 'Turn every page of a PDF into a JPG or PNG image.',
      // F18 (decision 4; DECISOES § 724): "pdf to png" went to PDF to PNG, which has it as its name (DECISOES § 180).
      synonyms: ['pdf to jpg', 'pdf to jpeg', 'pdf to image', 'convert pdf', 'page to image', 'pdf', 'png'],
    },
    'compress-pdf': {
      name: 'Compress PDF',
      description: 'Make a PDF smaller, with or without touching its images.',
      synonyms: ['compress pdf', 'reduce pdf', 'shrink pdf', 'pdf size', 'smaller pdf', 'optimize pdf', 'pdf'],
    },
    'rotate-pdf': {
      name: 'Rotate PDF',
      description: 'Turn the pages of a PDF, all of them or one by one.',
      // F18 (decision 4; DECISOES § 737): "rotate", a word of its name, which Organize PDF also has (the prompt asks it there):
      // with both exact, the order of the index puts Rotate PDF first (DECISOES § 180).
      synonyms: ['rotate pdf', 'turn pdf', 'flip pdf', 'rotate pages', 'landscape', 'portrait', 'pdf', 'rotate'],
    },
    'delete-pdf-pages': {
      name: 'Delete PDF pages',
      description: 'Take pages out of a PDF and keep the rest.',
      // F18 (decision 4; DECISOES § 737): "delete", a word of its name, which Organize PDF also has (the prompt asks it there):
      // with both exact, the order of the index puts Delete PDF pages first (DECISOES § 180).
      synonyms: ['delete pages', 'remove pages', 'delete pdf pages', 'remove page from pdf', 'pdf', 'delete'],
    },
    'add-page-numbers-to-pdf': {
      name: 'Add page numbers',
      description: 'Number the pages of a PDF, where and how you like.',
      synonyms: ['page numbers', 'number pages', 'paginate', 'pagination', 'add page numbers', 'pdf'],
    },
    'sign-pdf': {
      name: 'Sign PDF',
      description: 'Draw, upload or type your signature and place it on a PDF.',
      synonyms: ['sign pdf', 'signature', 'add signature', 'sign document', 'e-sign', 'pdf'],
    },
    'protect-pdf': {
      name: 'Protect PDF',
      description: 'Lock a PDF with a password, using AES-256.',
      synonyms: ['protect pdf', 'password protect', 'encrypt pdf', 'lock pdf', 'pdf password', 'pdf'],
    },
    'unlock-pdf': {
      name: 'Unlock PDF',
      description: 'Remove the password or the restrictions of a PDF you can open.',
      synonyms: ['remove password', 'decrypt pdf', 'pdf password remover', 'remove restrictions', 'pdf'],
    },
    'organize-pdf': {
      name: 'Organize PDF',
      description: 'Move, rotate and remove the pages of a PDF in one grid.',
      synonyms: ['organize pdf', 'organize', 'rearrange', 'rotate', 'delete', 'move pages', 'manage pages', 'pdf'],
    },
    // F18 (decision 4; DECISOES § 724): "organize pdf" went to Organize PDF, which has the term in its name.
    'reorder-pdf-pages': {
      name: 'Reorder PDF pages',
      description: 'Change the order of the pages of a PDF.',
      synonyms: ['reorder pages', 'rearrange pages', 'sort pages', 'move pages', 'pdf'],
    },
    'watermark-pdf': {
      name: 'Watermark PDF',
      description: 'Stamp a text watermark across every page of a PDF.',
      synonyms: ['watermark', 'stamp', 'confidential', 'draft', 'add watermark', 'pdf'],
    },
    // F18 (decision 5): the PDF presets. "jpg" stays out of PDF to PNG, so the search "pdf to jpg" does not find it.
    'split-pdf-extract-pages': {
      name: 'Extract pages from PDF',
      description: 'Save the pages you pick from a PDF in one new PDF.',
      synonyms: ['extract', 'extract pages', 'extract pages from pdf', 'pull out pages', 'save pages', 'pdf'],
    },
    'pdf-to-jpg-to-png': {
      name: 'PDF to PNG',
      description: 'Turn the pages of a PDF into sharp PNG images.',
      synonyms: ['pdf to png', 'png', 'convert pdf to png', 'pdf page to png', 'pdf'],
    },
  },
  calcSeal: 'Your numbers stay on your device',
  calcs: {
    'mortgage-calculator': {
      name: 'Mortgage calculator',
      description: 'Your monthly payment with taxes, insurance, PMI and HOA.',
      synonyms: ['mortgage', 'home loan', 'house payment', 'monthly payment', 'piti', 'amortization', 'interest'],
    },
    'personal-loan-calculator': {
      name: 'Personal loan calculator',
      description: 'The payment, the interest and the APR with an origination fee.',
      synonyms: ['personal loan', 'installment loan', 'origination fee', 'apr', 'loan payment', 'interest'],
    },
    'auto-loan-calculator': {
      name: 'Auto loan calculator',
      description: 'What a car loan costs a month, with trade-in, taxes and fees.',
      synonyms: ['auto loan', 'car loan', 'car payment', 'vehicle loan', 'trade-in', 'interest'],
    },
    'refinance-calculator': {
      name: 'Refinance calculator',
      description: 'Whether refinancing pays off, and in which month it breaks even.',
      synonyms: ['refinance', 'refi', 'break-even', 'closing costs', 'new rate', 'mortgage'],
    },
    'home-affordability-calculator': {
      name: 'Home affordability calculator',
      description: 'How much house fits your income, with the 28% and 36% rules of thumb.',
      synonyms: ['affordability', 'how much house', 'debt-to-income', 'dti', 'income', 'mortgage'],
    },
    'loan-amortization-calculator': {
      name: 'Loan amortization calculator',
      description: 'The whole schedule of a loan: principal, interest and balance by payment.',
      synonyms: ['amortization', 'amortization schedule', 'loan schedule', 'principal', 'interest', 'balance'],
    },
    'credit-card-payoff-calculator': {
      name: 'Credit card payoff calculator',
      description: 'How long a card takes to pay off, or the payment for a target date.',
      synonyms: ['credit card', 'card payoff', 'card balance', 'apr', 'payoff', 'interest'],
    },
    'debt-payoff-calculator': {
      name: 'Debt payoff calculator',
      description: 'Snowball against avalanche for up to 10 debts, with an extra payment.',
      synonyms: ['debt payoff', 'snowball', 'avalanche', 'debt free', 'pay off debt', 'payoff plan'],
    },
    'debt-consolidation-calculator': {
      name: 'Debt consolidation calculator',
      description: 'Your debts now against one new loan: payment, interest and time.',
      synonyms: ['debt consolidation', 'consolidate', 'consolidation loan', 'combine debts', 'payoff', 'interest'],
    },
    'rent-vs-buy-calculator': {
      name: 'Rent vs buy calculator',
      description: 'Your net worth renting and buying, and the year buying catches up.',
      synonyms: ['rent vs buy', 'rent or buy', 'renting', 'buying a home', 'break-even', 'mortgage'],
    },
    'compound-interest-calculator': {
      name: 'Compound interest calculator',
      description: 'How a balance grows with monthly deposits and any compounding.',
      synonyms: ['compound interest', 'compounding', 'investment growth', 'savings growth', 'future value', 'interest'],
    },
    'savings-goal-calculator': {
      name: 'Savings goal calculator',
      description: 'The monthly deposit for a goal, or how long a deposit takes.',
      synonyms: ['savings goal', 'save money', 'monthly savings', 'goal', 'deposit', 'interest'],
    },
    'simple-interest-calculator': {
      name: 'Simple interest calculator',
      description: 'Interest on a principal for years, months or days.',
      synonyms: ['simple interest', 'principal', 'rate', 'days', 'interest'],
    },
    'apr-to-apy-calculator': {
      name: 'APR to APY calculator',
      description: 'A yearly rate turned into APY, or back, for any compounding.',
      synonyms: ['apr', 'apy', 'apy to apr', 'annual percentage yield', 'effective rate', 'compounding'],
    },
    'mortgage-calculator-extra-payments': {
      name: 'Mortgage with extra payments',
      description: 'The months and interest an extra payment saves on a mortgage.',
      synonyms: ['extra payments', 'extra payment', 'pay off mortgage early', 'prepayment', 'mortgage'],
    },
    'mortgage-calculator-biweekly': {
      name: 'Biweekly mortgage calculator',
      description: 'Half the payment every two weeks against the monthly payment.',
      synonyms: ['biweekly', 'bi-weekly', 'every two weeks', 'half payment', 'mortgage'],
    },
    'mortgage-calculator-15-vs-30-year': {
      name: '15-year vs 30-year mortgage',
      description: 'The two terms side by side: payment, interest and the difference.',
      synonyms: ['15 year', '30 year', '15 vs 30', 'mortgage term', 'mortgage'],
    },
    'loan-amortization-calculator-balloon-payment': {
      name: 'Balloon loan calculator',
      description: 'The payment of a balloon loan and what is left due at the end.',
      synonyms: ['balloon', 'balloon payment', 'balloon loan', 'amortization', 'interest'],
    },
    // The home and health calculators (F7, decision 9), in hub order.
    'square-footage-calculator': {
      name: 'Square footage calculator',
      description: 'The area of a room or a yard in square feet and square yards, shape by shape.',
      synonyms: ['square feet', 'square footage', 'sq ft', 'square yards', 'floor area', 'room size'],
    },
    'concrete-calculator': {
      name: 'Concrete calculator',
      description: 'The cubic yards of a slab, a footing or a round column, and the bags to buy.',
      synonyms: ['concrete', 'cement', 'cubic yards', 'slab', 'footing', 'post hole', 'bags of concrete'],
    },
    'mulch-calculator': {
      name: 'Mulch and gravel calculator',
      description: 'The cubic yards and bags of mulch or gravel for a bed, and the tons of gravel.',
      synonyms: ['mulch', 'gravel', 'cubic yards', 'garden bed', 'landscaping stone', 'tons of gravel'],
    },
    'paint-calculator': {
      name: 'Paint calculator',
      description: 'The gallons of paint for the walls of a room, after the doors and windows.',
      synonyms: ['paint', 'gallons of paint', 'wall paint', 'coats of paint', 'painting a room'],
    },
    'tile-calculator': {
      name: 'Tile calculator',
      description: 'The tiles and boxes for a floor or a wall, with a little extra for cuts.',
      synonyms: ['tile', 'tiles', 'floor tile', 'wall tile', 'backsplash', 'boxes of tile'],
    },
    'btu-calculator': {
      name: 'BTU calculator',
      description: 'The air conditioner size of a room, from the Energy Star table.',
      synonyms: ['btu', 'ac size', 'air conditioner size', 'window ac', 'room ac', 'cooling capacity'],
    },
    'bmi-calculator': {
      name: 'BMI calculator',
      description: 'Your body mass index and the CDC adult category it falls in.',
      synonyms: ['bmi', 'body mass index', 'height and weight', 'bmi for adults'],
    },
    'calorie-calculator': {
      name: 'Calorie calculator',
      description: 'The calories your body uses at rest and over a day, by Mifflin-St Jeor.',
      synonyms: ['calories', 'tdee', 'bmr', 'resting energy', 'mifflin st jeor', 'kcal per day'],
    },
    'ovulation-calculator': {
      name: 'Ovulation calculator',
      description: 'Your estimated ovulation days and fertile windows for the next six cycles.',
      synonyms: ['ovulation', 'fertile window', 'fertile days', 'menstrual cycle', 'trying to conceive'],
    },
    'body-fat-calculator': {
      name: 'Body fat calculator',
      description: 'Your body fat percentage from a tape measure, by the Navy formula.',
      synonyms: ['body fat', 'body fat percentage', 'navy method', 'tape measure', 'neck and waist'],
    },
    'due-date-calculator': {
      name: 'Due date calculator',
      description: 'The due date of a pregnancy, the weeks along today and when each trimester starts.',
      synonyms: ['due date', 'pregnancy', 'weeks pregnant', 'conception date', 'ivf due date', 'trimester'],
    },
  },
  guides: {
    'guides-15-vs-30-year-mortgage': {
      name: '15-year vs 30-year mortgage: the real cost',
      description: 'What the shorter term costs a month and saves in interest, rate by rate.',
      synonyms: ['guide', '15 vs 30', 'mortgage term'],
    },
    'guides-debt-snowball-vs-avalanche': {
      name: 'Snowball vs avalanche, with numbers',
      description: 'The two ways to pay off debts, run on the same four debts.',
      synonyms: ['guide', 'snowball', 'avalanche'],
    },
    'guides-extra-mortgage-payments': {
      name: 'How extra payments shorten a mortgage',
      description: 'What a little more each month does to the term and the interest.',
      synonyms: ['guide', 'extra payments', 'pay off mortgage early'],
    },
    'guides-refinance-break-even': {
      name: 'Refinancing: find your break-even month',
      description: 'Two ways to count the break-even, and why they can disagree.',
      synonyms: ['guide', 'refinance', 'break-even'],
    },
    'guides-rent-vs-buy-break-even': {
      name: 'Rent vs buy: when buying starts to pay off',
      description: 'The year buying catches up with renting, and what moves it.',
      synonyms: ['guide', 'rent vs buy', 'break-even'],
    },
  },
  fileGuides: {
    'guides-heic-to-jpg-on-windows': {
      name: 'How to convert HEIC to JPG on Windows',
      description: 'Why Windows asks for an extension, and what happens to size and location when a photo becomes a JPG.',
      synonyms: ['guide', 'convert heic to jpeg on windows', 'windows heic'],
    },
    'guides-why-is-my-pdf-so-large': {
      name: 'Why is my PDF so large?',
      description: 'What takes the space in a PDF, and what each mode of Compress PDF does to it.',
      synonyms: ['guide', 'large pdf', 'pdf file size'],
    },
    'guides-social-media-image-sizes': {
      name: 'Social media image sizes',
      description: 'The sizes each network publishes, and what a photo looks like when it is resized to them.',
      synonyms: ['guide', 'instagram size', 'image dimensions'],
    },
    'guides-open-webp-save-as-jpg': {
      name: 'How to open WebP images and save them as JPG',
      description: 'What a WebP is, where it opens, and what changes when it becomes a JPG.',
      synonyms: ['guide', 'save webp as jpeg', 'open webp'],
    },
    'guides-jpg-vs-png': {
      name: 'JPG or PNG: which one to use',
      description: 'When each format wins, measured on the same photos in both.',
      synonyms: ['guide', 'jpeg or png', 'png or jpg'],
    },
    'guides-remove-location-from-photos': {
      name: 'How to remove location data from photos',
      description: 'Where a photo keeps its location, and the way to strip it that changes no pixel.',
      synonyms: ['guide', 'remove gps', 'exif location'],
    },
    'guides-pdf-to-jpg-resolution': {
      name: 'Which resolution to choose for PDF to JPG',
      description: 'What a higher resolution adds to the pixels and to the file, page by page.',
      synonyms: ['guide', 'jpeg resolution', 'ppi'],
    },
    'guides-split-pdf-file-size': {
      name: 'How to split a PDF, and why the parts can weigh more',
      description: 'Why the parts of a PDF can add up to more than the whole, and when they do not.',
      synonyms: ['guide', 'split pdf size', 'pdf parts'],
    },
    'guides-combine-pdfs-on-phone': {
      name: 'How to combine PDFs on a phone',
      description: 'The ways to put PDFs together on an iPhone or an Android phone, and the size you get.',
      synonyms: ['guide', 'combine pdf on iphone', 'pdf on android'],
    },
    'guides-photos-to-one-pdf': {
      name: 'How to turn photos into one PDF',
      description: 'One PDF from a few photos, and what compressing the photos first does to its size.',
      synonyms: ['guide', 'photos to pdf', 'pictures to pdf'],
    },
  },
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
      synonyms: ['pdf', 'jpg to pdf', 'png to pdf', 'photo to pdf', 'combine images', 'merge images', 'jpg', 'jpeg', 'png', 'webp', 'image'],
    },
    'remove-exif-data': {
      name: 'Remove EXIF data',
      description: 'Take the location, date and camera out of a photo.',
      synonyms: ['exif', 'metadata', 'gps', 'location', 'remove exif', 'remove metadata', 'exif remover', 'photo', 'image', 'jpg', 'jpeg', 'png', 'webp'],
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
    'rotate-image-flip': {
      name: 'Flip image',
      description: 'Mirror a photo left to right or top to bottom.',
      synonyms: ['flip', 'mirror', 'flip image', 'mirror image', 'flip horizontally', 'flip vertically', 'photo', 'image', 'jpg', 'jpeg', 'png', 'webp'],
    },
  },
} satisfies EnCommonTexts;
