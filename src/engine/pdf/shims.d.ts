// Ambient types the PDF engine needs that its packages do not ship: PDF.js's parser module (loaded only to run the
// parser in the same thread, its exports are never read here) and the .wasm files imported by URL (Vite).
// Self-contained: nothing here imports from outside src/engine/pdf/.

declare module 'pdfjs-dist/legacy/build/pdf.worker.mjs';

declare module '*.wasm?url' {
  const url: string;
  export default url;
}
