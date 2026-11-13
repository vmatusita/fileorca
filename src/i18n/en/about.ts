import type { AboutTexts } from '../types.ts';

export default {
  title: 'About FileOrca and the person behind it',
  description:
    'FileOrca is made and run by Victor Yuki Matusita, a developer in Curitiba, Brazil. Read why the tools are free and what an orca has to do with it.',
  h1: 'About FileOrca',
  intro: [
    'FileOrca is made and run by one person: Victor Yuki Matusita, a developer in Curitiba, Paraná, Brazil.',
    'It is a set of free tools that run in your browser: {image} image tools, {pdf} PDF tools, {money} money calculators, {life} home and health calculators and a QR code generator in English. The image and PDF tools, the QR code generator and the guides about files are in Portuguese and Spanish too, with {brazil} money calculators made for Brazil in Portuguese and all {spanish} in Spanish, with their guides.',
  ],
  whyHeading: 'Why this site exists',
  why: [
    'FileOrca exists to offer free tools with no account, no upload and no limits. You drop a file, the tool does its work in your browser, and the file never leaves your device.',
    'Ads cover the running costs, and optional coffees pay for new tools. Your files are not part of the deal: the site never receives them.',
  ],
  orcaHeading: 'Orcas are dolphins',
  orca: 'Here is a fact for the road: an orca is not a whale. It is a dolphin, the largest member of the oceanic dolphin family. Oli, the orca on this site, is a dolphin too.',
  linksHeading: 'Find Victor online',
  websiteLabel: "Victor's website",
  linkedinLabel: 'Victor on LinkedIn',
  // F19a (decision 5; DECISOES § 758): the day the site went live comes from LAUNCH_DATE, never typed here.
  since:
    'FileOrca went live on {date}. The {whatsNew} page lists the changes since then, with their dates, and the {howItWorks} page shows what happens to your file and how to check it in your browser.',
  // F19a (decision 6; DECISOES § 763): the author box at the end of every guide.
  author: {
    heading: 'About the author',
    who: '{name} is a developer in Curitiba, Brazil, who makes and runs FileOrca on his own.',
    fileGuide: 'The numbers of this guide were measured on {date} with the engine of the tools of this site, on the test files the guide lists.',
    moneyGuide: 'The numbers of this guide come from the calculator inside it, whose math is checked against an independent calculation.',
  },
  stats: {
    heading: 'FileOrca in numbers',
    image: 'image tools',
    pdf: 'PDF tools',
    money: 'money calculators',
    life: 'home and health calculators',
    zero: 'uploads',
  },
} satisfies AboutTexts;
