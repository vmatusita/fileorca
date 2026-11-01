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
    moneyColumn: 'Money',
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
    moneyCategory: 'Money calculators',
    shortcut: 'Ctrl K',
  },
  imageTools: 'Image tools',
  moneyCalculators: 'Money calculators',
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
      name: '15 vs 30-year mortgage',
      description: 'The two terms side by side: payment, interest and the difference.',
      synonyms: ['15 year', '30 year', '15 vs 30', 'mortgage term', 'mortgage'],
    },
    'loan-amortization-calculator-balloon-payment': {
      name: 'Balloon loan calculator',
      description: 'The payment of a balloon loan and what is left due at the end.',
      synonyms: ['balloon', 'balloon payment', 'balloon loan', 'amortization', 'interest'],
    },
  },
  guides: {
    'guides-15-vs-30-year-mortgage': {
      name: '15 vs 30-year mortgage: the real cost',
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
