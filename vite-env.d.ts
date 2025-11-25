/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRACKED_ETH_ADDRESS: string
  readonly VITE_EXCLUDED_CONTRACT_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}