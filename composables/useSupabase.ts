// composables/useSupabase.ts
/**
 * Supabaseクライアントを提供するcomposable関数
 * 
 * NuxtアプリケーションからSupabaseインスタンスを取得して返します。
 * 
 * @returns {SupabaseClient} Supabaseクライアントインスタンス
 */
export const useSupabase = () => {
    const nuxtApp = useNuxtApp()
    return nuxtApp.$supabase
};
  