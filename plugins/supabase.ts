// plugins/supabase.js
import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co'
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key'

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)





export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig()
  
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)

  nuxtApp.provide('supabase', supabase)
});
