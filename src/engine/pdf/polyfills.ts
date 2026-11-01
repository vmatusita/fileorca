// The three APIs PDF.js 6 calls that Safari 16.4 (the floor of the site, DECISOES § 61) does not have: the build
// targets Safari 18 and core-js does not cover them (DECISOES § 144). Installed only where they are missing, before
// PDF.js loads, in the worker of the PDF engine and on the page path. Nothing else changes.
// Self-contained: nothing here imports from outside src/engine/pdf/.

const promise = Promise as unknown as { withResolvers?: unknown };
if (typeof promise.withResolvers !== 'function') {
  Object.defineProperty(Promise, 'withResolvers', {
    configurable: true,
    writable: true,
    value<T>() {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: unknown) => void;
      const created = new Promise<T>((yes, no) => {
        resolve = yes;
        reject = no;
      });
      return { promise: created, resolve, reject };
    },
  });
}

for (const Type of [typeof Response === 'undefined' ? null : Response, typeof Blob === 'undefined' ? null : Blob]) {
  if (!Type) continue;
  const proto = Type.prototype as { bytes?: unknown; arrayBuffer(): Promise<ArrayBuffer> };
  if (typeof proto.bytes === 'function') continue;
  Object.defineProperty(Type.prototype, 'bytes', {
    configurable: true,
    writable: true,
    async value(this: { arrayBuffer(): Promise<ArrayBuffer> }) {
      return new Uint8Array(await this.arrayBuffer());
    },
  });
}

export {};
