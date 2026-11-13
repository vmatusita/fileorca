import type { HowItWorksTexts } from '../types.ts';

// F19a (decision 7; DECISOES § 759 to § 761): the How it works page. Every sentence is under a key that
// tests/unit/how-it-works.test.ts ties to its proof: a test that exists (most of them in tests/e2e/launch-claims.spec.ts),
// or, for a step in a browser, its official documentation read on 13/nov/2026 (§ 760). Google Analytics and the ads are
// said as the Privacy page says them, which is the source (§ 759). The page never names the code host of FileOrca, and the
// test reads it in the three languages.
export default {
  title: 'How FileOrca works: what happens to your file',
  description: 'What happens to a file you open on FileOrca, what runs as WebAssembly, what goes over the network and what never does, and how to check it in your browser.',
  h1: 'How FileOrca works',
  intro: "FileOrca's tools run in your browser. This page shows what happens to your file, which code does the work, what travels over the network and what never does, and how you can check it yourself.",
  file: {
    heading: 'What happens to your file',
    paragraphs: [
      {
        open: 'When you open a tool, your browser downloads the page and its code from fileorca.com.',
        read: 'When you choose or drop a file, the browser reads it into its own memory, on your device.',
        work: 'The tool does the work there, with the code your browser downloaded from fileorca.com.',
        result: 'The result is made there too, and Download saves it from the memory of the browser to your device.',
        nothing: 'The file itself is never sent: no request of the page carries it.',
      },
      {
        numbers: 'The calculators work the same way with the numbers you type: they stay on your device.',
        address: 'They are never added to the address of the page, and no Analytics event carries them.',
        hash: 'Copy link puts them after the # of the link it copies, the part of an address your browser keeps to itself and never sends to a server.',
      },
      {
        qr: 'The QR code generator draws the code in your browser, and the text you type goes nowhere.',
      },
    ],
  },
  wasm: {
    heading: 'What runs as WebAssembly',
    paragraphs: [
      {
        what: 'Part of the work is done by libraries compiled to WebAssembly, which your browser runs like the rest of the code of the page.',
        table: 'The table lists them, made from the files the site serves: each WebAssembly file has its row, and each row has its files.',
        same: 'Each of those files is the one its library publishes, unchanged, and it comes from fileorca.com.',
      },
    ],
    table: {
      caption: 'The libraries that do the work in your browser',
      library: 'Library',
      does: 'What it does',
      tools: 'Tools that can use it',
      wasm: 'WebAssembly',
      js: 'JavaScript',
      files: 'Files: {files}',
      license: 'License: {pkg}',
    },
    does: {
      mozjpeg: 'Reads and writes JPEG files.',
      libwebp: 'Reads and writes WebP files.',
      oxipng: 'Makes a PNG smaller without changing a pixel.',
      resize: 'Resizes a picture.',
      libheif: 'Reads HEIC photos.',
      libavif: 'Reads and writes AVIF files.',
      qpdf: 'Rewrites and compresses PDF files, and adds or removes a password.',
      jbig2: 'Inside PDF.js, reads the JBIG2 and CCITT images of a PDF.',
      openjpeg: 'Inside PDF.js, reads the JPEG 2000 images of a PDF.',
      pdfjs: 'Draws the pages of a PDF.',
      'pdf-lib': 'Builds and edits PDF files.',
    },
    after: [
      {
        native: 'To read a picture, a tool asks the browser first; WebAssembly steps in for a picture too large for the browser to draw in one piece and for a format the browser cannot read.',
        js: 'PDF.js, which draws the pages of a PDF, and pdf-lib, which builds and edits PDF files, are JavaScript; only the two image decoders inside PDF.js are WebAssembly.',
        threads: 'Each library is built to run on one thread, so no page uses shared memory or needs the isolation headers that some sites ask of the browser.',
        licenses: 'The {licenses} page has the license of each library; libheif, under the LGPL-3.0, stays a separate file, unchanged.',
      },
    ],
  },
  network: {
    heading: 'What goes over the network, and what never does',
    paragraphs: [
      {
        page: 'Your browser downloads from fileorca.com the files of each page you open: the page, its scripts, styles and fonts and, the first time you use a tool, its engine.',
        analytics: 'On fileorca.com, the page also loads Google Analytics, which counts page views and a short, fixed list of events, such as the name of the tool you used.',
        consent: 'The cookie notice decides only what Google Analytics may keep in your browser: declining does not switch it off, and it then works without cookies.',
        ads: 'When ads are on, Google will show them on pages such as the tools and the guides, as the {privacy} page describes; this page has none.',
      },
      {
        never: 'What never leaves your device: your file, its name, the password of a PDF, and the numbers and text you type.',
        privacy: 'The {privacy} page says in full what is collected, by whom, and what rights you have.',
      },
    ],
  },
  check: {
    heading: 'How to check it in your browser',
    paragraphs: [
      {
        intro: 'The developer tools of a browser list the requests a page makes, so you can watch what a tool sends while it works.',
      },
    ],
    chrome: {
      heading: 'Chrome and Edge',
      steps: {
        open: 'Open the tool, press Ctrl+Shift+J, or Command+Option+J on a Mac, and click the Network tab.',
        before: 'The list fills only while these tools are open, so open them before you choose your file.',
        domain: 'To see where each request goes, right-click the header of the list and select Domain.',
      },
    },
    firefox: {
      heading: 'Firefox',
      steps: {
        open: 'Open the tool and press Ctrl+Shift+E, or Cmd+Opt+E on a Mac, to open the Network Monitor.',
        before: 'It records requests while these tools are open, so open them before you choose your file.',
        domain: 'The Domain column says where each request goes; right-click the header of the list to show or hide a column.',
      },
    },
    safari: {
      heading: 'Safari on a Mac',
      steps: {
        settings: 'Choose Safari > Settings, go to Advanced and select Show features for web developers.',
        open: 'Open the tool, choose Develop > Show Web Inspector, or press Option+Command+I, and click Network.',
        before: 'The Network tab lists the requests made since Web Inspector opened, with the domain of each one, so open it before you choose your file.',
      },
    },
    watch: {
      heading: 'Then, in any of them',
      steps: {
        use: 'Choose your file and let the tool work.',
        rows: 'The new requests are files of fileorca.com that the tool needs, such as its engine, and, on fileorca.com, the Analytics events of the part above.',
        none: 'None of them carries your file.',
      },
    },
    phone: {
      heading: 'On a phone',
      steps: {
        load: 'Open the tool with the internet on and use it once on a file, so the page and its engine are loaded.',
        airplane: 'Turn on airplane mode and use the tool on another file: it still works, with no network.',
      },
    },
  },
  limits: {
    heading: 'What the check does not prove',
    paragraphs: [
      {
        extension: 'A browser extension you installed can read the pages you open, this one too: the check is about the page, not about everything that runs in your browser.',
        again: 'It also covers only the page you have open, so you can do it again whenever you like.',
      },
    ],
  },
} satisfies HowItWorksTexts;
