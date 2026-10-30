interface ImportMetaEnv {
  readonly PUBLIC_ADSENSE_CLIENT?: string;
  readonly PUBLIC_ADSENSE_SLOTS?: string;
  readonly PUBLIC_ADS_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
