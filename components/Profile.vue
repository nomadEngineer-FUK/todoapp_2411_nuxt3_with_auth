<script setup lang="ts">
/**
 * 認証およびユーザー操作に関連するComposableをインポート
 */
import { useAuth } from '~/composables/useAuth';
import { onMounted, ref } from 'vue';
import { useUserProfile } from '~/composables/useUsers';
import { useAuthUser, useNewAuthUser } from "~/composables";

/**
 * 認証に関連する関数と状態
 */
const { checkUser, isAdmin } = useAuth(); // ユーザーの認証状態や管理者権限の確認を提供
const { loadUserProfile, updateProfile } = useUserProfile(); // ユーザープロファイルの読み込みと更新を提供
const authUser = useAuthUser();       // 現在ログインしている認証済みユーザー情報
const newAuthUser = useNewAuthUser(); // 編集用のユーザー情報（認証済み情報のコピー）

const isProfileLoaded = ref(false);  // プロファイルのロード状態
const isProfileEditing = ref(false); // プロファイル編集モードの状態

const errorMessage = ref<string | null>(null); // バリデーションエラーメッセージ

/**
 * ページマウント時に実行される処理
 * 認証チェックとプロファイル情報の読み込みを行う
 */
onMounted(async () => {
    isProfileLoaded.value = false;

    const isUserValid = await checkUser(); // ユーザーが認証されているか確認
    if (!isUserValid) {
        console.error('User is not authenticated');
        return;
    }

    if (authUser.value?.id) {
        await loadUserProfile(authUser.value.id);  // ユーザーのプロファイルを読み込む
        newAuthUser.value = { ...authUser.value }; // 編集用のプロファイルデータを設定
    }

    isProfileLoaded.value = true;
});

/**
 * プロファイルの更新を処理する関数
 * @async
 * @returns {Promise<void>}
 */
const handleUpdateProfile = async () => {

    if (!validateProfile()) return; // プロファイルのバリデーションを実行

    if (authUser.value?.id) {
        const success = await updateProfile(authUser.value.id); // プロファイルを更新

        if (success) {
            alert('Profile updated successfully');
            isProfileEditing.value = false;

        } else {
            alert('Failed to update profile');
        }
    }
};

/**
 * 編集用プロファイルデータをリセットする関数
 */
const resetNewAuthUser = () => {
    if (authUser.value) {
        newAuthUser.value = { ...authUser.value };
    }
};

/**
 * 編集モードをキャンセルする関数
 * 編集データをリセットして編集モードを終了する
 */
const cancelEdit = (): void => {
    resetNewAuthUser(); // 編集用のデータをリセット
    isProfileEditing.value = false
};

/**
 * プロファイルのバリデーションを行う関数
 * @returns {boolean} バリデーションが成功したかどうか
 */
const validateProfile = (): boolean => {
    
    // 空白をトリムしてチェック
    if (!newAuthUser.value?.username?.trim()) {
        errorMessage.value = "Usernameを1文字以上入力してください";
        return false;
    }

    if (!newAuthUser.value?.email?.trim()) {
        errorMessage.value = "Emailを1文字以上入力してください";
        return false;
    }

    return true;
};
</script>

<template>
    <div v-if="isProfileLoaded && authUser" class="profile">
        <h1 class="profile-header">Profile</h1>

        <div class="buttons-in-profile">
            <div v-if="!isProfileEditing">
                <button class="btn-profile for-edit" @click="isProfileEditing = true;">Edit</button>
            </div>
            <div v-else>
                <button class="btn-profile for-update" @click="handleUpdateProfile">Update</button>
                <button class="btn-profile cancel" @click="cancelEdit">Cancel</button>
            </div>
        </div>


        <table>
            <tbody>
                <tr>
                    <th>Username</th>
                    <td>
                        <input type="text" v-model="newAuthUser.username" :readonly="!isProfileEditing"
                            :class="{ 'readonly-field': !isProfileEditing, 'editable-field': isProfileEditing }" />
                    </td>
                </tr>
                <tr>
                    <th>Email</th>
                    <td>
                        <input type="text" v-model="newAuthUser.email" :readonly="!isProfileEditing"
                            :class="{ 'readonly-field': !isProfileEditing, 'editable-field': isProfileEditing }" />
                    </td>
                </tr>
                <tr>
                    <th>Role</th>
                    <td>
                        <span v-if="!isProfileEditing">{{ newAuthUser.role }}</span>
                        <select v-else v-model="newAuthUser.role" :disabled="!isProfileEditing || !isAdmin"
                            :class="{ 'readonly-field': !isProfileEditing || !isAdmin, 'editable-field': isProfileEditing && isAdmin }">
                            <option value="admin">admin</option>
                            <option value="user">user</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th>Account Status</th>
                    <td>
                        <span v-if="!isProfileEditing">{{ newAuthUser.account_status }}</span>
                        <select v-else v-model="newAuthUser.account_status" :disabled="!isProfileEditing || !isAdmin"
                            :class="{ 'readonly-field': !isProfileEditing || !isAdmin, 'editable-field': isProfileEditing && isAdmin }">
                            <option value="active">active</option>
                            <option value="inactive">inactive</option>
                        </select>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
/* 全体のプロファイルスタイル */
.profile {
    margin: 2rem auto;
    padding: 1.5rem;
    width: 50%;
    border-radius: 10px;
    background-color: #f6f6f6;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* ヘッダーのスタイル */
.profile-header {
    text-align: center;
    margin-bottom: 0.2rem;
    font-size: 1.8rem;
    color: #333;
}

/* テーブル全体のスタイル */
table {
    width: 90%;
    border-spacing: 0 1rem;
    margin: 0 auto;
}

/* テーブルのヘッダー */
th {
    text-align: center;
    width: 35%;
    padding: 0.5rem 1rem;
    background-color: #e0e6ef;
    border-radius: 10px 0 0 10px;
    font-weight: bold;
    color: #555;
}

/* テーブルのデータセル */
td {
    padding: 0.5rem 1rem;
    background-color: #fff;
    border-radius: 0 10px 10px 0;
    color: #444;
}

/* フォーム内の入力枠の幅 */
td>input {
    width: 70%;
}

/* 閲覧モードのinputスタイル */
.readonly-field {
    border: none;
    background-color: transparent;
    color: #333;
    cursor: default;
    padding: 0.5rem 0;
    font-size: 1rem;
    appearance: none;
}

/* 編集モードのinputスタイル */
.editable-field {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0.5rem;
    background-color: #fefefe;
}


/* ボタン */
.buttons-in-profile {
    text-align: end;
    width: 90%;
    margin: 0.6rem auto;
}

.btn-profile {
    padding: 0.4rem 1rem;
    border-radius: 4px;
    box-sizing: border-box;
    border: 3px solid transparent;
}

/* [Edit]ボタン */
.for-edit {
    text-decoration: none;
}

.for-edit,
.for-update

/* [Update]ボタン */
    {
    background-color: bisque;
}

/* [キャンセル]ボタン */
.cancel {
    margin-left: 0.8rem;
    background-color: #bababa;
    color: #fff;
}

.for-update,
.cancel {
    padding: 0.6rem 1.2rem;
}


.for-edit:hover,
.for-update:hover {
    opacity: 0.7;
}

.for-update:hover {
    background-color: bisque;
}

.cancel:hover {
    border: 3px solid #bababa;
    background-color: #e0e6ef;
    color: #555;
}

.for-edit:hover,
.for-update:hover,
.cancel:hover {
    transition: 0.3s;
}
</style>
