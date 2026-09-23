/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOW_UNPUBLISHED?: string;
  /** Optional absolute site origin for share/OG URLs (default https://showmob.vercel.app). */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
