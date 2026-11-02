interface ImportMetaEnv {
  readonly PUBLIC_ADSENSE_CLIENT?: string;
  readonly PUBLIC_ADSENSE_SLOTS?: string;
  readonly PUBLIC_ADS_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// The deep path the QR code generator imports (F7, decision 8): the matrix only, without the renderers of the package's index.
// @types/qrcode types the index; `create` is the same function there.
declare module 'qrcode/lib/core/qrcode.js' {
  export { create } from 'qrcode';
}
