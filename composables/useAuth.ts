import type { User } from "@supabase/supabase-js";
import { useNuxtApp } from "nuxt/app";
import { ref, computed } from "vue";
import { useAuthUser, useIsAuthenticated } from "../composables/index";
import type { ExtendedUser } from "~/types/type";

// cspell:ignore Nuxt
// cspell:ignore Supabase

/**
 * 認証関連のユーティリティを提供するcomposable
 * @returns 認証操作と状態管理関数を含むオブジェクト
 */
export const useAuth = () => {
    const { $supabase } = useNuxtApp(); // Supabaseインスタンス
    const router = useRouter();         // Vue Routerインスタンス

    // 認証状態とユーザー情報
    const authUser = useAuthUser(); // 認証されたユーザー情報を取得
    const isAuthenticated = useIsAuthenticated(); // 認証状態を取得

    // タイムアウト設定
    const INACTIVITY_TIMEOUT = 60 * 60 * 1000;          // 60分（非アクティビティ時の自動ログアウト時間）
    const timeoutId = ref<NodeJS.Timeout | null>(null); // アクティビティタイマーID

    /**
     * 共通エラーログ出力関数
     * @param {string} message - エラーメッセージ
     * @param {any} [error] - エラーオブジェクト（任意）
     */
    const logError = (message: string, error?: any) => {
        console.error(`[Auth Error] ${message}`, error);
    };


    // =======================================
    //   ** ユーザー操作 **
    //    - サインアップ・ログイン・ログアウト
    // =======================================

    /**
     * アカウント登録関数
     * @async
     * @param   {string}       username  - ユーザー名
     * @param   {string}       email     - 登録するユーザーのメールアドレス
     * @param   {string}       password  - ユーザーのパスワード
     * @param   {Ref<boolean>} isLoading - ローディング状態の参照
     * @returns {Promise<Partial<ExtendedUser> | null>} 登録成功時はユーザー情報を返し、失敗時はnull
     */
    const signUp = async (
        username: string,
        email: string,
        password: string,
        isLoading: Ref<boolean>
    ): Promise<Partial<ExtendedUser> | null> => {

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
    const login = async (
        email: string,
        password: string,
        isLoading: Ref<boolean>
    ): Promise<Partial<ExtendedUser> | null> => {
        
        isLoading.value = true; // ローディング開始

        const { data, error } = await $supabase.auth.signInWithPassword({ email, password });
        
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
     * ユーザーのログアウト処理
     * @async
     * @param {string} [reason] - ログアウト理由（任意）
     * @returns {Promise<void>}
     */
    const logout = async (reason?: string): Promise<void> => {
        const { error } = await $supabase.auth.signOut();
        if (error) logError("Logout failed", error);

        clearUserState(); // ユーザー情報の初期化

        // ログアウト時の理由をクエリパラメータに追加
        const redirectQuery = reason ? { query: { message: reason }} : {};
        await router.push({ path: '/', ...redirectQuery }); // ログアウト後にログインページにリダイレクト
    };


    // =======================================
    //   ** 認証状態の確認と管理 **
    // =======================================

    /**
     * ユーザー情報を初期化
     */
    const clearUserState = () => {
        authUser.value = null;
        isAuthenticated.value = false;
        clearInactivityTimer();
        localStorage.removeItem('user');
    };

    /**
         * 認証状態を確認
         * @async
         * @returns {Promise<boolean>} 認証成功時はtrue、失敗時はfalse
         */
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
     * ユーザー情報を補完し、認証ユーザーに追加情報を統合
     * @async
     * @function mergeAdditionalUserInfo
     * @returns {Promise<void>}
     * @description 認証済みユーザーの基本情報（`authUser`）に、データベースから取得した追加情報（`username`、`account_status`、`role`）を統合します。
     *              情報取得が失敗した場合はログ出力を行います。
     */
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

        // 現在の認証ユーザー情報を更新
        authUser.value = {
            ...authUser.value,  // 既存のユーザー情報を維持
            ...data,            // 取得した追加情報をマージ
            role: data.role     // 明示的に `role` を更新（上書き）
        };
    };

    /**
     * 管理者かどうかを確認する関数
     * @returns {boolean} role：[Admin]true、[User]false
     */
    const isAdmin = computed(() => {
        return authUser.value && authUser.value.role === 'admin'
    });


    // =======================================
    //   ** ユーティリティ関数 **
    // =======================================

    /**
     * 現在の認証ユーザー情報をローカルストレージに保存
     * 認証情報が存在しない場合はローカルストレージから削除
     */
    const saveUserToLocalStorage = () => {
        if (authUser.value) {
            localStorage.setItem('user', JSON.stringify(authUser.value));
        } else {
            localStorage.removeItem('user');
        }
    };

    /**
     * 非アクティビティによる自動ログアウトを有効化するためのタイマーを開始
     * @function startInactivityTimer
     * @returns {void}
     * @description ユーザーが一定時間（`INACTIVITY_TIMEOUT`）操作を行わない場合、ログアウト処理を実行。
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
     * 現在のアクティビティタイマーをクリア
     * @function clearInactivityTimer
     * @returns {void}
     * @description 設定されたアクティビティタイマーを解除してリセットします。
     */
    const clearInactivityTimer = (): void => {
        if (timeoutId.value) clearTimeout(timeoutId.value);
        timeoutId.value = null;
    };

    /**
     * アクティビティが発生するたびにタイマーをリセット
     * @function resetInactivityTimer
     * @returns {void}
     * @description ユーザーが操作を行うたびにタイマーを再起動し、非アクティビティ期間をリセットします。
     */
    const resetInactivityTimer = (): void => {
        if (isAuthenticated.value) startInactivityTimer();
    };

    /**
     * クライアントサイドでアクティビティを監視
     * ユーザーのマウス操作、キーボード入力、スクロールを検出してタイマーをリセット
     */
    if (typeof window !== 'undefined') { // クライアントサイドのみ実行
        window.addEventListener('mousemove', resetInactivityTimer); // マウスの動き
        window.addEventListener('keydown', resetInactivityTimer);   // キーボード入力
        window.addEventListener('scroll', resetInactivityTimer);    // スクロール
    }


    // =======================================
    //   ** エクスポートする関数と状態 **
    // =======================================

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
