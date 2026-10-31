import type { LegalTexts } from '../types.ts';

export default {
  title: 'Terms of use',
  description:
    'The terms for using FileOrca, a set of free tools that run in your browser: your files, results, calculators, ads, donations and liability.',
  h1: 'Terms of use',
  updated: 'Last updated: October 31, 2026',
  intro:
    'These terms explain how you can use FileOrca. By using the site, you accept them. If you do not agree, please do not use the site.',
  sections: [
    {
      heading: 'Who offers the service',
      paragraphs: [
        'FileOrca (fileorca.com) is made and run by one person: Victor Yuki Matusita, a developer in Curitiba, Paraná, Brazil. He is an individual, not a company.',
        'How FileOrca handles personal data is explained on the Privacy page.',
      ],
    },
    {
      heading: 'What FileOrca is',
      paragraphs: [
        'FileOrca is a website with free tools that run in your browser. It is built for images, PDFs and calculators. Today the site has image tools: compress, resize, crop, rotate, convert and turn images into a PDF. They are in English, and the image compressor is also in Portuguese and Spanish.',
        'You do not need an account. Your files are processed on your device, not on a server, and they are never uploaded.',
      ],
    },
    {
      heading: 'Your files and your responsibility',
      paragraphs: [
        'The files you use with FileOrca stay yours. FileOrca never receives them, and it claims no rights over them.',
        'You are responsible for the files you choose to process and for what you do with the results.',
      ],
      list: [
        'Make sure you have the right to process each file.',
        'Keep your originals. Check the result before you delete or replace anything.',
        'FileOrca cannot recover a file that is lost, deleted or damaged, because it never receives your files.',
      ],
    },
    {
      heading: 'Results with no guarantee',
      paragraphs: [
        'FileOrca is provided "as is" and "as available", free of charge. Results vary by file and by browser, and a tool can work differently on your device than on another device.',
        'There is no guarantee that a tool will work with every file, that a result will fit what you need, or that the site will always be available and free of errors.',
        'Check each result before you use it.',
      ],
    },
    {
      heading: 'Calculators are educational, not advice',
      paragraphs: [
        'FileOrca will also have calculators. They are for learning and information only. They are not financial, legal or medical advice, and they do not replace a qualified professional.',
        'The results are estimates based on the numbers you type. Real life can differ, so check with a qualified professional before you make a decision about money, legal matters or health.',
      ],
    },
    {
      heading: 'Acceptable use',
      paragraphs: [
        'Please use FileOrca in good faith and follow these rules.',
        'Search engines and other robots may read and index the site, as long as they do not overload it.',
      ],
      list: [
        'Do not try to break, attack or overload the site.',
        'Do not try to get around the protections of the site.',
        'Do not use FileOrca for anything illegal.',
        'Do not use FileOrca to process files you have no right to process.',
      ],
    },
    {
      heading: 'Ads and donations',
      paragraphs: [
        'To stay free, FileOrca shows, or will show, ads from Google AdSense. Google is the advertising partner. The Privacy page explains how ads and cookies work.',
        'The ads, and the sites they lead to, come from third parties. FileOrca does not control their content and is not responsible for it.',
        'Donations are optional. FileOrca has a link to Ko-fi, where you can leave one. The payment happens on Ko-fi, under its own policies.',
        'A donation is voluntary. It buys nothing and changes nothing on the site.',
      ],
    },
    {
      heading: 'Intellectual property',
      paragraphs: [
        'The FileOrca name, the Oli mascot, the texts and the design of the site belong to Victor Yuki Matusita. Do not copy them or use them as if they were yours without permission.',
        'FileOrca also uses open-source libraries. They keep their own licenses, which are listed on the Licenses page.',
      ],
    },
    {
      heading: 'Limitation of liability',
      paragraphs: [
        'To the extent the law allows, Victor Yuki Matusita, who runs FileOrca, is not liable for any loss or damage that comes from using the site or from not being able to use it. This includes lost, deleted or damaged files, lost data, and decisions you make based on a result.',
        'Nothing in these terms takes away rights that the law gives you and does not allow you to waive, including consumer rights.',
      ],
    },
    {
      heading: 'Changes to these terms',
      paragraphs: [
        'These terms may change, for example when the site gets new tools. The date at the top of this page shows the last update.',
        'If you keep using FileOrca after a change, the new terms apply to you.',
      ],
    },
    {
      heading: 'Governing law and courts',
      paragraphs: [
        'These terms are governed by Brazilian law. Any dispute goes to the courts of Curitiba, Paraná, Brazil.',
        'The exception is when consumer protection law gives you the right to go to court where you live. In that case, your right stays.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [
        'Questions about these terms? Write to contato@fileorca.com. Emails are used only to answer you.',
      ],
    },
  ],
} satisfies LegalTexts;
