// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
  ssr: true,
  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  app: {
    head: {
      title: 'TodoApp with Nuxt & Supabase',
    }
  },
  // cookies: {
  //   secure: process.env.NODE_ENV === 'production',
  //   sameSite: 'lax',
  //   httpOnly: true,
  // },
  test: true,
  css: ['@/assets/styles/variables.css'],
});
