/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOW_UNPUBLISHED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
