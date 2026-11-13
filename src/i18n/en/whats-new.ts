import type { WhatsNewTexts } from '../types.ts';

// F19a (decision 2; DECISOES § 752 and § 755): the What's new page. The entries (date, pull request, pages) are in
// src/platform/changelog.ts; each title and text here says what changed for the person, in the voice of the site
// (docs/design/README.md), with no count of tools, no name of a phase and no number that does not come from a registry.
// A text exists exactly for the entries English shows (entriesIn('en'); tests/unit/changelog.test.ts).
export default {
  title: "What's new on FileOrca",
  description: 'Every change you can see on FileOrca since the site went live: new tools, new languages and new guides, each with the day it reached the site.',
  h1: "What's new",
  intro: 'Every change you can see on FileOrca, newest first, with the day it reached the site and links to the pages it changed.',
  more: 'and {n} more',
  entries: {
    launch: {
      title: 'FileOrca goes live',
      body: 'FileOrca opens with Compress image in English, Portuguese and Spanish, and with the pages that say who makes the site, how it treats your data and how to reach its author.',
    },
    'image-tools': {
      title: 'Image tools',
      body: 'Resize, crop, rotate and convert images, and turn photos into a PDF, as many at once as you like, with a ZIP at the end. Each file comes out the right way up, with no metadata and no location.',
    },
    'private-chunks': {
      title: 'No hidden data in PNG and WebP',
      body: 'The image tools now also remove the private blocks some apps hide inside PNG and WebP files. Image tools now says which tool fits each job.',
    },
    'cookie-notice-space': {
      title: 'The cookie notice floats',
      body: 'While the cookie notice is open, it floats over the end of the page, and no empty band is left under the footer.',
    },
    'money-calculators': {
      title: 'Money calculators',
      body: 'Calculators for mortgages, loans, credit cards, debt and savings that update as you type, with a chart, the schedule year by year and a PDF or CSV to save. Guides walk through common choices with real numbers, such as renting or buying.',
    },
    'calculator-terms': {
      title: 'Privacy and terms for the calculators',
      body: 'The privacy policy says the numbers you type in a calculator are worked out on your device and never sent. The terms say the calculators are for learning and are not financial advice.',
    },
    'pdf-tools': {
      title: 'PDF tools',
      body: 'Merge, split, compress and rotate PDFs, delete or reorder pages, add page numbers or a watermark, sign, protect and unlock them, and turn pages into JPG. The PDF is read and written in your browser.',
    },
    'pdf-terms': {
      title: 'Terms for passwords and signatures',
      body: 'The terms say what Protect PDF, Unlock PDF and Sign PDF do with a password or a signature, and the privacy policy says the password never leaves your device. Licenses credits the libraries that read and write the PDF.',
    },
    'file-guides': {
      title: 'Guides with measured numbers',
      body: 'Guides to common file questions, such as HEIC photos on Windows or a PDF that is too large, each with the tool inside and numbers measured on real test files. Image tools and PDF tools lead to them.',
    },
    'home-health-calculators': {
      title: 'Home and health calculators',
      body: 'Calculators for square footage, concrete, mulch, paint, tile and BTU, and for BMI, calories, ovulation, body fat and a due date. Each one updates as you type and saves a PDF or CSV.',
    },
    'qr-code': {
      title: 'QR code generator',
      body: 'Type a link or any text and get a QR code made in your browser, with Oli in the middle or plain, as PNG or SVG.',
    },
    'health-terms': {
      title: 'Terms for health, home and QR codes',
      body: 'The terms say the health calculators give estimates from published formulas and are not medical advice, and the privacy policy says the measurements, dates and text you type stay on your device. Licenses credits the libraries behind the QR code.',
    },
    offline: {
      title: 'Pages you opened work offline',
      body: 'Pages you have opened keep working without internet, and on Android you can share an image or a PDF with FileOrca and pick the tool. The privacy policy says what the offline copy keeps, and that your files and numbers never go in it.',
    },
    'theme-and-menu': {
      title: 'Light, dark and a Menu',
      body: 'Every page has a theme button, to follow your system or stay light or dark, and a Menu with every category of the site. The privacy policy says the theme you pick stays in your browser.',
    },
    'guides-hub': {
      title: 'A home for the guides',
      body: 'The guides have a page of their own, in groups for images, PDFs and money, and every tool or calculator with a guide shows it after its steps.',
    },
    'header-width': {
      title: 'Header and footer line up',
      body: 'The header and the footer now share the same edges at every screen width.',
    },
    'support-page': {
      title: 'A new page to support Oli',
      body: 'The page to support Oli was redone, and the coffee line now opens the footer.',
    },
    'tool-page': {
      title: 'Each tool in one place',
      body: 'Each image and PDF tool now keeps everything in one frame, from the file you drop to the result, without the page jumping. A suggestion under Download can take your result to the next tool, and the privacy policy says how it stays on your device.',
    },
    'cookie-notice': {
      title: 'A smaller cookie notice',
      body: 'The cookie notice is shorter on a phone and never covers the buttons to choose or download a file.',
    },
    'calculator-card': {
      title: 'A new result card',
      body: 'Each calculator shows its answer in one card at the top, with Download PDF inside it, and an error says which field to fix. The QR code generator shows its code in the same card.',
    },
    'file-guide-page': {
      title: 'A clearer guide page',
      body: 'Each file guide opens with what was measured and the tool, right under the title, and its tables are easier to read on a phone.',
    },
    'home-and-hubs': {
      title: 'A new home page and hubs',
      body: 'The home page was redone around the sea where Oli swims, and the page of each category has a strip of the same sea.',
    },
    'institutional-pages': {
      title: 'Pages about the site, easier to read',
      body: 'On a wide screen, Privacy, Terms and Licenses show an index of their sections, and About and Contact a card with the site in numbers.',
    },
    'footer-phone': {
      title: 'A shorter footer on the phone',
      body: 'On a phone, the footer shows the main page of each category and keeps its tools in a list you open.',
    },
    'home-cards': {
      title: 'One card per tool on the home page',
      body: 'Each category of the home page lists its tools as cards, with the icon, the name and what the tool does.',
    },
    'pdf-pages': {
      title: 'Whole pages in the PDF tools',
      body: 'The PDF tools show each page whole, small or large, and a magnifier opens it big, with the action of the tool. Delete PDF pages shows the pages that will go, and a result that is one PDF has View the new PDF.',
    },
    'next-steps': {
      title: 'Next steps that take your file along',
      body: 'In Image to PDF the photos can be reordered and removed, with Undo, and every image batch has a trash button for each file. Compress image can bring images down to a size you type, with Up to a size. The suggestions after a result take the file to more tools, and on a phone the QR code shows right under the box you type in.',
    },
    'calculator-typing': {
      title: 'Typing in a calculator, without stumbles',
      body: 'A calculator field now takes a digit typed in the middle of a number and says how many decimal places it accepts, and a screen reader hears the result once per typing. The CSV of the home and health calculators keeps one value per cell, and the PDF labels each value.',
    },
    'avif-webp': {
      title: 'AVIF to JPG and Convert to WebP',
      body: 'AVIF to JPG turns AVIF images into JPG, and Convert to WebP turns JPG and PNG into smaller WebP or AVIF files. An AVIF dropped on another image tool points you to AVIF to JPG.',
    },
    'organize-exif': {
      title: 'Organize PDF and Remove EXIF data',
      body: 'Organize PDF lets you mark, rotate, remove and move pages in one grid, and Remove EXIF data takes the location and other metadata out of a photo without touching its pixels. New presets extract pages from a PDF, turn a PDF into PNG and flip an image.',
    },
    'file-guides-measured': {
      title: 'Guide numbers measured again',
      body: 'Every number in the file guides was measured again, and the guide to removing location from photos now uses Remove EXIF data.',
    },
    'trust-and-content': {
      title: "What's new and How it works",
      body: 'This page lists every change you can see, and How it works shows what happens to your file and how to check it in your browser. The tool and calculator pages now say each thing in one place, and About says when the site went live.',
    },
  },
} satisfies WhatsNewTexts;
