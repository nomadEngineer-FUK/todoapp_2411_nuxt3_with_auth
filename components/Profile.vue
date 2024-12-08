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

        <div class="profile-fields">
            <div class="field-row">
                <label for="username" class="field-label">Username</label>
                <input id="username" name="username" type="text" v-model="newAuthUser.username"
                    :readonly="!isProfileEditing">
            </div>
            <div class="field-row">
                <label for="email" class="field-label">Email</label>
                <input id="email" name="email" type="text" v-model="newAuthUser.email" :readonly="!isProfileEditing"
                    :class="{
                        'readonly-field': !isProfileEditing,
                        'editable-field': !isProfileEditing
                    }">
            </div>
            <div class="field-row">
                <label for="role" class="field-label">Role</label>
                <span v-if="!isProfileEditing">{{ newAuthUser.role }}</span>
                <select v-else v-model="newAuthUser.role" name="" id="" :disabled="!isProfileEditing || !isAdmin"
                    :class="{
                        'readonly-field': !isProfileEditing || !isAdmin,
                        'editable-field': isProfileEditing && isAdmin
                    }">
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
            </div>
            <div class="field-row">
                <label for="account_status" class="field-label">Account Status</label>
                <span v-if="!isProfileEditing">{{ newAuthUser.account_status }}</span>
                <select v-else v-model="newAuthUser.account_status" name="" id=""
                    :disabled="!isProfileEditing || !isAdmin" :class="{
                        'readonly-field': !isProfileEditing || !isAdmin,
                        'editable-field': isProfileEditing && isAdmin
                    }">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
        </div>

        <div class="buttons-in-profile">
            <div v-if="!isProfileEditing">
                <button class="btn-profile for-edit" @click="isProfileEditing = true;">Edit</button>
            </div>
            <div v-else>
                <button class="btn-profile for-update" @click="handleUpdateProfile">Update</button>
                <button class="btn-profile cancel" @click="cancelEdit">Cancel</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* プロフィール全体 */
.profile {
    margin: 2rem auto;
    padding: 1.5rem;
    width: 50%;
    border-radius: 10px;
    background-color: #f6f6f6;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* ヘッダー */
.profile-header {
    text-align: center;
    margin-bottom: 1rem;
    font-size: 1.8rem;
    color: #333;
}

/* body部分 */
.profile-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 80%;
    margin: 0 auto;
}
.field-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.field-label {
    flex: 1;
    text-align: left;
    font-weight: bold;
    margin-right: 0.4rem;
}
.field-row input,
.field-row select,
.field-row span {
    flex: 2;
    padding: 0.5rem;
    border-radius: 4px;
    border: none;
    font-size: 0.8rem;
}
.field-row span {
    background-color: #fff;
}

/* 閲覧モードと編集モードのスタイル */
.readonly-field {
    border: none;
    background-color: transparent;
    color: #333;
    cursor: default;
    padding: 0.5rem 0;
}

/* 編集モードのinputスタイル */
.editable-field {
    background-color: #fefefe;
}


/* ボタン */
.buttons-in-profile {
    text-align: center;
    margin: 1rem auto;
    margin-top: 3rem;
}

/* 全ボタン共通 */
.btn-profile {
    padding: 0.4rem 1rem;
    border-radius: 4px;
    box-sizing: border-box;
    border: 3px solid transparent;
    padding: 0.6rem 1.2rem;
}

/* 編集 ボタン */
.for-edit {
    
    width: 50%;
    background-color: bisque;
    /* border: 2px solid bisque; */
}
/* 更新 ボタン */
.for-update {
    background-color: bisque;
}
/* キャンセル ボタン */
.cancel {
    margin-left: 1rem;
    background-color: #bababa;
    color: #fff;
}
.for-update,
.cancel {
    width: 20%;
}

/* ボタンホバー時 */
.for-edit:hover{
    /* background-color: bisque; */
    background-color: #fefefe;
    border: 3px solid bisque;
}
.for-update:hover {
    
    opacity: 0.7;
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

/* レスポンシブデザイン */
@media (max-width: 768px) {
    .profile {
        width: 80%;
    }
    .profile-fields {
        width: 75%;
        margin: auto;
        padding: 2rem 0;
        border-top: 1px solid #3333332f;
        border-bottom: 1px solid #3333332f;
    }
    .field-row input,
    .field-row select,
    .field-row span {
        width: 70%;
        font-size: 1rem;
        margin: 0 auto;
    }
    .field-row {
        flex-direction: column;
        align-items: flex-start;
    }
    .field-label {
        margin-bottom: 0.4rem;
        margin-left: 1rem;
    }

    /* ボタン */
    .buttons-in-profile {
        margin-top: 2rem;
        
    }
    .for-edit {
        width: 70%;
        margin: 0 auto;
        display: block;
    }
    .for-update,
    .cancel {
        /* justify-content: space-around; */
        width: 30%;
        display: inline-block;
        
    }
}
</style>
