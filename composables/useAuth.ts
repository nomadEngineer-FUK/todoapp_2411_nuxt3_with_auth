import type { User } from "@supabase/supabase-js";
import { useNuxtApp } from "nuxt/app";
import { computed } from "vue";
import { useAuthUser, useIsAuthenticated } from "../composables/index";

export const useAuth = () => {
    // 状態管理
    const { $supabase } = useNuxtApp();
    const router = useRouter(); // Vue Router を使ってリダイレクト処理を行う
    const user = useAuthUser(); // 認証されたユーザー情報を取得
    const isAuthenticated = useIsAuthenticated(); // 認証状態を取得

    const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60分で自動タイムアウト
    const timeoutId = ref<NodeJS.Timeout | null>(null); // タイムアウトIDを管理
    
    /**
     * アカウント登録関数
     * @async
     * @param   {string}       email     - 登録するユーザーのメールアドレス
     * @param   {string}       password  - ユーザーのパスワード
     * @param   {Ref<boolean>} isLoading - ローディング状態の参照
     * @returns {Promise<User | null>} 登録したユーザー情報を返し、失敗した場合はnull
     */
    const signUp = async (email: string, password: string, isLoading: Ref<boolean>): Promise<User | null> => {
        isLoading.value = true; // ローディング開始

        try {
            // ストアドプロシージャを使用してユーザー数を取得
            const { data: userCountData, error: countError } = await $supabase.rpc('get_user_count');

            if (countError) throw new Error('Failed to check user count.');

            
            // ユーザー数を変数に格納
            const existingUserCount = userCountData || 0;
            console.log('existingUserCount: ', existingUserCount)

            // アカウント登録のフォームに入力した内容を取得
            const { data, error } = await $supabase
                .auth.signUp({ email, password });
            if (error) throw new Error(error.message);

            user.value = data.user || null;
            if (user.value) {

                // 最初のユーザーなら「admin」、それ以降は「user」として設定
                const role = (existingUserCount === 0) ? 'admin' : 'user';

                // ユーザー情報の挿入
                const { error: insertError } = await $supabase
                    .from('users')
                    .insert([{
                        id: user.value.id,
                        email: user.value.email,
                        role: role
                    }]);
                
                if (insertError) throw new Error('User role assignment failed.');

                // 登録成功後にメールでの認証を促すページにリダイレクト
                await router.push('/verify-email');
            };


        } catch (err) {
            console.error('Signup error:', err);
        } finally {
            isLoading.value = false; // ローディング終了
        }
        return user.value;
    };

    /**
     * ログイン関数
     * @async
     * @param {string} email           - ログインするユーザーのメールアドレス
     * @param {string} password        - ユーザーのパスワード
     * @param {Ref<boolean>} isLoading - ローディング状態の参照
     * @returns {Promise<User | null>} ログインしたユーザー情報を返し、失敗した場合はnull
     */
    const login = async (email: string, password: string, isLoading: Ref<boolean>): Promise<User | null> => {
        isLoading.value = true; // ローディング開始

        try {
            const { data, error } = await $supabase
                .auth.signInWithPassword({ email, password });
            
            if (error) throw new Error(error.message);

            user.value = data.user || null; // 認証されたユーザー情報をセット
            isAuthenticated.value = Boolean(data.user); // 認証状態をセット

            if (isAuthenticated.value) {
                console.log('User authenticated:', user.value);
                await router.push('/todos'); // 認証成功後にtodosページにリダイレクト
            }

        } catch (err) {
            console.error('Login error:', err);
        } finally {
            isLoading.value = false; // ローディング終了
        };

        return user.value;
    };

    /**
     * ログアウト関数
     * @async
     * @param {string} [reason] - ログアウト理由を示す文字列（任意）
     * @returns {Promise<void>}
     */
    const logout = async (reason?: string): Promise<void> => {
        const { error } = await $supabase.auth.signOut();
        if (error) throw new Error(error.message);

        
        user.value = null;             // ユーザー情報のクリア
        isAuthenticated.value = false; // 認証状態のクリア
        clearInactivityTimer();        // 自動ログアウト用タイマーのクリア

        // ログアウト時の理由をクエリパラメータに追加
        const redirectQuery = reason ? { query: { message: reason }} : {};
        await router.push({ path: '/', ...redirectQuery }); // ログアウト後にログインページにリダイレクト
    };

    /**
     * ユーザーの認証状態を確認する関数
     * @async
     * @returns {Promise<void>}
     */
    const checkUser = async (): Promise<void> => {
        const { data, error } = await $supabase
            .auth.getSession();
        
        if (error) return console.error('Error getting session:', error.message);
  
        // ユーザーがいない場合、ログインしていない状態をセットし、不要な処理をスキップ
        if (!data?.session) {
            user.value = null;
            isAuthenticated.value = false;
            console.log("No active session found. User is logged out.");
            return;
        }
        
        // セッションのuserを確認
        user.value = data?.session?.user as User ?? null;
        isAuthenticated.value = !!user.value;
  
        if (isAuthenticated.value && user.value?.id) {
          user.value.role = await fetchUserRole(user.value.id) || '';
          console.log('User Role in checkUser():', user.value.role);
        }
  
        console.log('isAuthenticated value:', isAuthenticated.value);
        if (isAuthenticated.value) startInactivityTimer();
      };

      /**
     * 指定されたユーザーIDの役割を取得する非同期関数
     * @async
     * @param {string} userId - 役割を取得するユーザーのID
     * @returns {Promise<string | null>} ユーザーの役割、またはエラーの場合はnull
     */
    const fetchUserRole = async (userId: string): Promise<string | null> => {
        const { $supabase } = useNuxtApp();
  
        const { data, error } = await $supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
  
          if (error) {
            console.error('Failed to fetch user role:', error.message);
            return null;
        };
  
        console.log('Fetched role:', data?.role); // デバッグ用ログ
        return data?.role || null;
      };

    /**
     * アクティビティタイマーを開始して、非アクティブユーザーを自動ログアウトする関数
     */
    const startInactivityTimer = (): void => {
        clearInactivityTimer(); // 既存のタイマーをクリア

        timeoutId.value = setTimeout(() => {
            console.log('自動ログアウト: 一定時間操作がありませんでした');
            logout('*You have been automatically logged out due to inactivity.'); // 自動ログアウト
        }, INACTIVITY_TIMEOUT);
    };
  
  /**
   * アクティビティタイマーをクリアする関数
   */
    const clearInactivityTimer = (): void => {
        if (timeoutId.value) clearTimeout(timeoutId.value);
        timeoutId.value = null;
    };

    /**
     * アクティビティタイマーをリセットする関数
     */
    const resetInactivityTimer = (): void => {
        if (isAuthenticated.value) startInactivityTimer();
    };

    // ページのアクティビティ（マウス、キーボード、スクロール）を監視
    if (typeof window !== 'undefined') { // クライアントサイドであることを確認
        window.addEventListener('mousemove', resetInactivityTimer);
        window.addEventListener('keydown', resetInactivityTimer);
        window.addEventListener('scroll', resetInactivityTimer);
    };

    /**
     * 管理者かどうかを確認する関数
     * @returns {boolean} ユーザーが管理者の場合はtrue、それ以外はfalse
     */
    const isAdmin = computed (() => {
        const result = user.value?.role === 'admin';
        // console.log('Authenticated User:', user.value);
        console.log('Is Admin:', result);
        return result;
    });

    return {
        user,
        isAuthenticated,
        signUp,
        login,
        logout,
        checkUser,
        startInactivityTimer,
        clearInactivityTimer,
        isAdmin
    };
};