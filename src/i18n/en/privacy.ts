import type { LegalTexts } from '../types.ts';

export default {
  title: 'Privacy policy',
  description:
    'How FileOrca handles your data: files never leave your device, what Google Analytics, AdSense and Cloudflare process, and your GDPR and LGPD rights.',
  h1: 'Privacy policy',
  updated: 'Last updated: October 31, 2026',
  intro:
    'This page explains what happens to your data on fileorca.com. The short version: your files never leave your device. Below you will find who is responsible, what is collected, by whom, and what rights you have.',
  sections: [
    {
      heading: 'Who is responsible',
      paragraphs: [
        'The controller of your personal data on fileorca.com is Victor Yuki Matusita, an individual and developer based in Curitiba, Paraná, Brazil. FileOrca is made and run by one person.',
        'For any question about this policy or your data, write to contato@fileorca.com. You can learn more about me at https://vmatusita.com.br.',
      ],
    },
    {
      heading: 'Your files stay on your device',
      paragraphs: [
        'FileOrca tools run in your browser. The files you choose are processed on your device and are never uploaded. FileOrca has no server that processes them, and you do not need an account.',
        'The same goes for numbers. What you type in a tool, such as a width, a height or a percentage, stays in your browser: it is not added to the address of the page, and no analytics event carries it.',
        'The money calculators work the same way. The prices, rates and balances you type are worked out on your device and are never sent anywhere. The PDF and the CSV of a calculator are made on your device too. Copy link puts your numbers after the # of the address it copies: that part of an address stays in the browser that opens it and is never sent to our server, and the page never adds it to the address on its own.',
        'The image tools, for example, save a new copy of your picture that leaves out the photo metadata, including the GPS location.',
        'You can check this yourself. Open the Network tab of your browser while you use a tool: no request carries your file.',
      ],
    },
    {
      heading: 'Site delivery (Cloudflare)',
      paragraphs: [
        'FileOrca is a static site delivered by Cloudflare. When your browser asks for a page, Cloudflare processes technical request data, such as your IP address and browser, to deliver and protect the site.',
        'This data does not include your files. Cloudflare handles it under its own policies.',
      ],
    },
    {
      heading: 'Analytics (Google Analytics 4)',
      paragraphs: [
        'To see which tools help people, FileOrca uses Google Analytics 4, a service from Google. What it can store in your browser depends on the choice you make in the cookie notice, as described in the section on consent below.',
        'Google Analytics measures page views and a fixed list of events. No event carries file names, file contents or numbers you type. The events are:',
      ],
      list: [
        'Tool started',
        'Tool finished',
        'Download',
        'Click on a next-step suggestion',
        'Tool error, with the browser and the file format',
        'Click on a donation link',
        'First result of a calculator, with the name of the calculator only',
        'Download of a calculator PDF or CSV, with the format only',
        'Click on Copy link in a calculator, without the link',
      ],
    },
    {
      heading: 'Ads (Google AdSense)',
      paragraphs: [
        'To stay free, FileOrca shows, or will show, ads from Google AdSense. Google is the advertising partner of the site.',
        "Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites. Google's use of advertising cookies lets Google and its partners serve ads to you based on those visits.",
        'In the European Economic Area (EEA), the United Kingdom and Switzerland, a Google consent message will ask for your choice before ads use cookies, once ads are on.',
        'Use these links to opt out of personalized advertising and to read how Google uses data from partner sites:',
      ],
      list: [
        'Google Ads Settings: https://adssettings.google.com',
        'How Google uses data from partner sites: https://policies.google.com/technologies/partner-sites',
      ],
    },
    {
      heading: 'Your cookie choice in the browser',
      paragraphs: [
        "FileOrca saves your cookie choice in your browser's local storage, so the notice does not come back every time. This record stays on your device. To remove it, clear the site data in your browser; the notice then appears again.",
        "If you accept in the cookie notice, FileOrca also counts there how many image batches ended with at least one real result in this browser, such as a smaller, converted, rotated, cropped or resized image or a PDF, so the coffee request shows only from the third one and at most once a week; if you ask not to see it again, that is kept there too. This count stays only in your browser and never leaves it, and it is erased if you decline cookies later.",
      ],
    },
    {
      heading: 'E-mails',
      paragraphs: [
        'E-mails sent to contato@fileorca.com are forwarded by Cloudflare Email Routing to a Gmail inbox. I use them only to answer you.',
      ],
    },
    {
      heading: 'Consent by region and your choices',
      action: 'consent-choice',
      paragraphs: [
        'Consent depends on where you are, using Google Consent Mode v2.',
        'In the European Union, the EEA (Iceland, Liechtenstein and Norway), the United Kingdom and Switzerland, analytics and ad storage are denied by default until you accept.',
        'Elsewhere, analytics and ad storage are granted by default, and you can decline in the cookie notice.',
        'Declining, or not having accepted yet where consent is denied by default, does not switch Google Analytics off: it then works without cookies, and Google may still receive the page views and the events listed above, with no identifier stored in your browser.',
        'You can change your choice at any time with the button below.',
      ],
    },
    {
      heading: 'Legal bases',
      paragraphs: [
        'FileOrca follows the GDPR (the General Data Protection Regulation of the European Union) and the LGPD (Lei 13.709/2018, the Brazilian data protection law). The legal bases are:',
      ],
      list: [
        'Consent (GDPR Article 6(1)(a); LGPD Article 7, I) for Google Analytics and for ad cookies, where the law requires it. You can withdraw it at any time.',
        'Legitimate interest (GDPR Article 6(1)(f); LGPD Article 7, IX) to deliver and protect the site, which covers the technical data Cloudflare processes.',
        'Legitimate interest (same articles) in answering you when you write to contato@fileorca.com.',
      ],
    },
    {
      heading: 'International transfers',
      paragraphs: [
        'Google and Cloudflare may process data outside your country, including in the United States. They state that they use safeguards for these transfers, such as standard contractual clauses.',
      ],
    },
    {
      heading: 'How long data is kept',
      paragraphs: [
        'FileOrca never receives your files, so it keeps none. For the rest, it depends on who handles the data:',
      ],
      list: [
        'Analytics data: kept for the period set in the Google Analytics retention settings.',
        'Delivery data: Cloudflare keeps it under its own policies.',
        'Ad data: Google keeps it under its own policies.',
        'Cookie choice: stays in your browser, and you can delete it at any time by clearing the site data.',
        'E-mails: kept only as long as needed to answer you.',
      ],
    },
    {
      heading: 'Your rights',
      paragraphs: [
        'Under the GDPR and the LGPD, you have the right to access your data, correct it, delete it, receive it in a portable format, object to its use and withdraw your consent at any time.',
        'To use any of these rights, write to contato@fileorca.com.',
        "You can also file a complaint with the ANPD (Brazil's national data protection authority) or with the data protection authority of your country.",
      ],
    },
    {
      heading: 'Children',
      paragraphs: [
        'FileOrca is not directed to children. If you think a child sent personal data through the site or by e-mail, write to contato@fileorca.com so it can be deleted.',
      ],
    },
    {
      heading: 'Changes to this policy',
      paragraphs: [
        'This policy can change, for example when new tools are added or the site starts using a new service. The date at the top of the page shows the last update.',
      ],
    },
  ],
} satisfies LegalTexts;
