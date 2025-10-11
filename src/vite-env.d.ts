/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_SUPABASE_SYNC_ENABLED?: string | boolean
  readonly VITE_SUPABASE_SYNC_INTERVAL?: string | number
  readonly VITE_SUPABASE_REALTIME_ENABLED?: string | boolean
  readonly VITE_APP_VERSION?: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
