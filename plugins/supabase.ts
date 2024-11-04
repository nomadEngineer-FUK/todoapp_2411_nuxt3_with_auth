// plugins/supabase.ts
import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  // SupabaseクライアントをNuxt Appインスタンスに提供
  nuxtApp.provide('supabase', supabase)
})
