import { useNuxtApp } from "nuxt/app";
import { ref } from "vue";
import { useAuthUser, useNewAuthUser } from "~/composables/index";
import type { UserProfile } from "~/types/type";
import { useAuth } from "~/composables/useAuth";
import type { ExtendedUser } from "~/types/type";

// cspell:ignore Nuxt
// cspell:ignore Supabase

const { $supabase } = useNuxtApp();
const { checkUser } = useAuth();

// セッションの有効性を確認
// 呼び出し元にて、他2つの関数含めた3つ全ての戻り値がtrueの場合に、updateProfileがtrueを返す
const checkUserValid = async (): Promise<false | void> => {
    const isUserValid = await checkUser(); // ユーザーの認証状態を取得
    if (!isUserValid) {
        errMsgAboutSessionOrAuth(); // セッション or ユーザー認証時のエラーメッセージ
        return false;
    }
};

/**
 * ログ関数: 統一的なログ出力を行う
 * @param message ログメッセージ
 * @param data 任意の追加データ
 */
const errMsgAboutSessionOrAuth = () => {
    console.log('Session is invalid or user is not authenticated');
};

export const useUserProfile = () => {

    const authUser = useAuthUser();     // 認証されたユーザー情報を取得
    let newAuthUser = useNewAuthUser(); // 編集用

    


    // 現在ログインしているアカウントの情報を取得
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


    // メイン関数：プロフィール更新
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

    // 1. usersテーブルの更新
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

    // 2. Supabase Auth のメールアドレス更新
    const updateAuthEmail = async (email: string): Promise<boolean> => {
        const { data, error } = await $supabase.auth.updateUser({ email });

        if (error) {
            console.error('Error updating auth email:', error);
            return false;
        }
        console.log('Auth email updated successfully:', data);
        return true;
    };

    // 3. セッション再取得
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


// アプリに登録されているユーザー一覧を取得
export const useAllUsers = async (): Promise<Partial<ExtendedUser>[]> => {

    // セッションの有効性を確認
    await checkUserValid();

    // DBからユーザーの全データ取得
    const { data, error } = await $supabase
        .from('users')
        .select('*');
    
    if (error) {
        console.log('Error getting all users data');
        return [];
    }

    return data as Partial<ExtendedUser>[];
};
