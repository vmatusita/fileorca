// The PDF.js parser as a worker of its own, for the page path only: a browser whose workers have no OffscreenCanvas
// draws the pages on the page (DECISOES § 22), and this keeps the parsing off the main thread there. PDF.js's worker
// module starts listening to its port when it loads in a worker. The polyfills come first (Safari 16.4, § 144).
// Self-contained: nothing here imports from outside src/engine/pdf/.

import './polyfills.ts';
import 'pdfjs-dist/legacy/build/pdf.worker.mjs';
