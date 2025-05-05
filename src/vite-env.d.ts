/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MISTRAL_API_URL: string;
  readonly VITE_MISTRAL_API_KEY: string;
  readonly VITE_MISTRAL_MODEL: string;
  readonly VITE_MAX_TOKENS: string;
  readonly VITE_TEMPERATURE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 