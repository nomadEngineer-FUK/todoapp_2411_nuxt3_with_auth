import { useNuxtApp } from "nuxt/app";
import { computed } from "vue";
import { useAuthUser, useNewAuthUser, useAllUsers, useCurrentUser } from "~/composables/index";
import type { UserProfile } from "~/types/type";
import { useAuth } from "~/composables/useAuth";
import type { ExtendedUser, UserSortType } from "~/types/type";
import { getFilteredDataBySearch, getSortedData } from "./useTodoLogic";

// cspell:ignore Nuxt
// cspell:ignore Supabase

const { $supabase } = useNuxtApp();
const { checkUser } = useAuth();
const allUsers = useAllUsers();

/**
 * 認証セッションの有効性を確認
 * @async
 * @function checkUserValid
 * @returns {Promise<false | void>} 有効でない場合は false を返す
 */
const checkUserValid = async (): Promise<false | void> => {
    const isUserValid = await checkUser(); // ユーザーの認証状態を取得
    if (!isUserValid) {
        errMsgAboutSessionOrAuth(); // セッション or ユーザー認証時のエラーメッセージ
        return false;
    }
};

/**
 * 統一的なログ出力を行う関数
 * @function errMsgAboutSessionOrAuth
 * @description セッションまたは認証エラー時のログメッセージを出力
 */
const errMsgAboutSessionOrAuth = () => {
    console.log('Session is invalid or user is not authenticated');
};

/**
 * ログイン中のユーザーに関連する操作
 * @returns {Object} プロフィール関連の関数と状態
 */
export const useUserProfile = () => {

    const authUser = useAuthUser();     // 認証されたユーザー情報を取得
    let newAuthUser = useNewAuthUser(); // 編集用

    /**
     * 現在ログイン中のユーザーのプロフィール情報を取得
     * @async
     * @function loadUserProfile
     * @param {string} userId - ログイン中のユーザーID
     * @returns {Promise<void>} 成功時はauthUserを更新
     */
    const loadUserProfile = async (userId: string) => {
        console.log('Loading profile for userId:', userId);
        if (!userId) {
            console.error('No userId provided');
            return;
        }

        const { data, error } = await $supabase
            .from('users')
            .select('id, username, email, role, account_status')
            .eq('id', userId)
            .single();

        console.log('Supabase response:', { data, error });

        if (error) {
            console.error('Error loading user profile:', error);
            return;
        }

        if (data) {
            console.log('Fetched user profile data:', data);
            authUser.value = data;

        } else {
            console.warn('No data found for this user');
        }
    };

    /**
     * プロフィール情報を更新
     * @async
     * @function updateProfile
     * @param {string} userId - 更新対象のユーザーID
     * @returns {Promise<boolean>} 成功時はtrue、失敗時はfalse
     */
    const updateProfile = async (userId: string): Promise<boolean> => {

        // セッションの有効性を確認
        await checkUserValid();

        // 更新処理 1: users テーブルの更新
        const updateUserResult = await updateUsersTable(userId);
        if (!updateUserResult) {
            console.error('Failed to update users table');
            return false;
        }

        // 更新処理 2: Supabase Auth のメールアドレス更新
        if (newAuthUser.value.email) {
            const updateAuthResult = await updateAuthEmail(newAuthUser.value.email);
            if (!updateAuthResult) {
                console.error('Failed to update auth email');
                return false;
            }
        } else {
            console.error('Email is missing in newAuthUser');
            return false;
        }

        // 更新処理 3: セッション再取得
        const refreshSessionResult = await refreshSession();
        if (!refreshSessionResult) {
            console.error('Failed to refresh session');
            return false;
        }

        // 全て成功した場合
        return true;
    };

    /**
     * usersテーブルを更新
     * @async
     * @function updateUsersTable
     * @param {string} userId - 更新対象のユーザーID
     * @returns {Promise<boolean>} 成功時はtrue
     */
    const updateUsersTable = async (userId: string): Promise<boolean> => {
        const { username, email, role, account_status } = newAuthUser.value;
        const { data, error } = await $supabase
            .from('users')
            .update({ username, email, role, account_status })
            .eq('id', userId);

        if (error) {
            console.error('Error updating users table:', error);
            return false;
        }
        console.log('User table updated successfully:', data);
        return true;
    };

    /**
     * Supabase Auth のメールアドレスを更新
     * @async
     * @function updateAuthEmail
     * @param {string} email - 更新後のメールアドレス
     * @returns {Promise<boolean>} 成功時はtrue
     */
    const updateAuthEmail = async (email: string): Promise<boolean> => {
        const { data, error } = await $supabase.auth.updateUser({ email });

        if (error) {
            console.error('Error updating auth email:', error);
            return false;
        }
        console.log('Auth email updated successfully:', data);
        return true;
    };

    /**
     * 認証セッションを再取得
     * @async
     * @function refreshSession
     * @returns {Promise<boolean>} 成功時はtrue
     */
    const refreshSession = async (): Promise<boolean> => {
        const { data, error } = await $supabase.auth.getSession();

        if (error || !data?.session) {
            console.error('Error refreshing session:', error);
            return false;
        }
        console.log('Session refreshed successfully');
        return true;
    };

    return {
        authUser,
        loadUserProfile,
        updateProfile
    };
};

/**
 * ユーザー一覧をデータベースから取得
 * @async
 * @function fetchAllUsers
 * @returns {Promise<Partial<ExtendedUser>[]>} ユーザーリスト
 */
export const fetchAllUsers = async (): Promise<Partial<ExtendedUser>[]> => {

    // DBからユーザーの全データ取得
    const { data, error } = await $supabase
        .from('users')
        .select('*');
    
    if (error) {
        console.log('Error getting all users data');
        return [];
    }

    return allUsers.value = data as Partial<ExtendedUser>[];
};

/**
 * フィルタリングとソートが適用されたユーザーリストを計算する
 * @constant sortedUsersList
 * @returns {Partial<ExtendedUser>[]} フィルタとソート後のユーザーリスト
 */
export const sortedUsersList = computed(() => {
    const users = useAllUsers();                          // 全ユーザー
    const searchTextForUser = useSearchTextForUser();     // 検索文字列
    const selectedSortForUser = useSelectedSortForUser(); // ソート対象
    const sortOrderForUser = useSortOrderForUser();       // 'asc' or 'desc'

    if (!users.value.length) return [];

    // 1. 検索フィルタリング
    const filteredUsersBySearch = getFilteredDataBySearch(
        users.value,
        searchTextForUser.value,
        ['username', 'email'] // Userで検索対象とするキー
    );

    // 2. ソート処理
    return getSortedData(
        filteredUsersBySearch,
        selectedSortForUser.value,
        sortOrderForUser.value
    );
});
