/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_SECRET_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
