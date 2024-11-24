import type { User } from "@supabase/supabase-js";
import { useNuxtApp } from "nuxt/app";
import { ref, computed } from "vue";
import { useAuthUser, useIsAuthenticated } from "../composables/index";
import type { ExtendedUser } from "~/types/type";

/**
 * 認証関連のユーティリティを提供するcomposable
 * @returns 認証操作と状態管理関数を含むオブジェクト
 */
export const useAuth = () => {
    const { $supabase } = useNuxtApp();
    const router = useRouter();     // Vue Router を使ってリダイレクト処理を行う
    const authUser = useAuthUser();     // 認証されたユーザー情報を取得
    const isAuthenticated = useIsAuthenticated(); // 認証状態を取得

    const INACTIVITY_TIMEOUT = 60 * 60 * 1000;          // 60分で自動タイムアウト
    const timeoutId = ref<NodeJS.Timeout | null>(null); // タイムアウトIDを管理

    /**
     * 共通エラーログ出力関数
     */
    const logError = (message: string, error?: any) => {
        console.error(`[Auth Error] ${message}`, error);
    };

    /**
     * アカウント登録関数
     * @async
     * @param   {string}       email     - 登録するユーザーのメールアドレス
     * @param   {string}       password  - ユーザーのパスワード
     * @param   {string}       role      - ユーザーの役割
     * @param   {string}       username  - ユーザー名
     * @param   {Ref<boolean>} isLoading - ローディング状態の参照
     * @returns {Promise<User | null>} 登録したユーザー情報を返し、失敗した場合はnull
     */
    const signUp = async (username: string, email: string, password: string, isLoading: Ref<boolean>): Promise<Partial<ExtendedUser> | null> => {
        isLoading.value = true; // ローディング開始

        // ストアドプロシージャを使用してユーザー数を取得
        const {data: userCountData, error: countError} = await $supabase.rpc('get_user_count');

        if (countError) {
            logError('Failed to check user count.', countError);
            isLoading.value = false;
            return null;
        }

        // ユーザー数を変数に格納
        const existingUserCount = userCountData || 0;

        // アカウント登録のフォームに入力した内容を取得
        const {data, error} = await $supabase.auth.signUp({email, password});
        if (error || !data?.user) {
            logError('Signup failed', error);
            isLoading.value = false;
            return null;
        }

        // 登録したユーザー情報を取得
        const newUser = data.user || null;
        const role = (existingUserCount) === 0 ? 'admin' : 'user';

        // ユーザー情報を挿入
        const {error: insertError} = await $supabase
            .from('users')
            .insert([{
                id: newUser.id,
                email: newUser.email,
                role: role,
                username: username,
                account_status: 'active'
            }]);

        if (insertError) logError('User role assignment failed', insertError);

        isLoading.value = false;
        await router.push('/verify-email');
        return authUser.value;
    }

    /**
     * ログイン関数
     * @async
     * @param {string} email           - ログインするユーザーのメールアドレス
     * @param {string} password        - ユーザーのパスワード
     * @param {Ref<boolean>} isLoading - ローディング状態の参照
     * @returns {Promise<User | null>} ログインしたユーザー情報を返し、失敗した場合はnull
     */
    const login = async (email: string, password: string, isLoading: Ref<boolean>): Promise<Partial<ExtendedUser> | null> => {
        isLoading.value = true; // ローディング開始

        const { data, error } = await $supabase.auth.signInWithPassword({email, password});
        if (error || !data) {
            logError('Login failed', error);
            isLoading.value = false;
            return null;
        }

        authUser.value = data.user as ExtendedUser;
        isAuthenticated.value = true;
        saveUserToLocalStorage();
        isLoading.value = false;

        await router.push('/todos');
        return authUser.value;
    };

    /**
     * ログアウト関数
     * @async
     * @param {string} [reason] - ログアウト理由を示す文字列（任意）
     */
    const logout = async (reason?: string): Promise<void> => {
        const { error } = await $supabase.auth.signOut();
        if (error) logError("Logout failed", error);

        clearUserState(); // ユーザー情報の初期化

        // ログアウト時の理由をクエリパラメータに追加
        const redirectQuery = reason ? { query: { message: reason }} : {};
        await router.push({ path: '/', ...redirectQuery }); // ログアウト後にログインページにリダイレクト
    };

    const mergeAdditionalUserInfo = async (): Promise<void> => {
        if (!authUser.value) return;

        const { data, error } = await $supabase
            .from('users')
            .select('username, account_status, role')
            .eq('id', authUser.value.id)
            .maybeSingle();

        if (error || !data) {
            logError("Failed to fetch additional user info", error);
            return;
        }

        authUser.value = {
            ...authUser.value,
            ...data,
            role: data.role
        };
    };

    const checkUser = async (): Promise<boolean> => {
            const { data: sessionData, error } = await $supabase.auth.getSession();

            if (error || !sessionData?.session) {
                if (error) {
                    logError("Session check failed", error);
                }
                clearUserState();
                return false;
            }

        authUser.value = sessionData.session.user as ExtendedUser;
            await mergeAdditionalUserInfo();
            isAuthenticated.value = true;

            return true;
    };


    /**
     * ユーザー情報の初期化
     */
    const clearUserState = () => {
        authUser.value = null;
        isAuthenticated.value = false;
        clearInactivityTimer();
        localStorage.removeItem('user');
    };

    const saveUserToLocalStorage = () => {
        if (authUser.value) {
            localStorage.setItem('user', JSON.stringify(authUser.value));
        } else {
            localStorage.removeItem('user');
        }
    };

    /**
     * アクティビティタイマーを開始して、非アクティブユーザーを自動ログアウトする関数
     */
    const startInactivityTimer = (): void => {
        if (isAuthenticated.value) {
            clearInactivityTimer(); // 既存のタイマーをクリア

            timeoutId.value = setTimeout(() => {
                console.log('自動ログアウト: 一定時間操作がありませんでした');
                logout('*You have been automatically logged out due to inactivity.'); // 自動ログアウト
            }, INACTIVITY_TIMEOUT);
        }
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
    }

    /**
     * 管理者かどうかを確認する関数
     * @returns {boolean} role：[Admin]true、[User]false
     */
    const isAdmin = computed(() => {
        return authUser.value && authUser.value.role === 'admin'
    });

    return {
        authUser,
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
