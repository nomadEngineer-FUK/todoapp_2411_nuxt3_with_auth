<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '~/composables/useAuth';

const { signUp, user } = useAuth();
const email = ref<string>('');    // ユーザーが入力したメールアドレス
const password = ref<string>(''); // ユーザーが入力したパスワード
const isLoading = ref(false);     // ローディングフラグ
const errorMessage = ref<string | null>(null); // サインアップエラーメッセージ

/**
 * ユーザーを新規登録する非同期関数
 * @async
 * @function registerUser
 * @returns {Promise<void>}
 * @description 入力したメールとパスワードでユーザーの新規登録を行う。
 *              成功時はユーザー情報が返され、エラー時にはエラーメッセージを設定。
 */
 const registerUser = async () => {
    errorMessage.value = null;  // エラーメッセージをリセット

    try {
        await signUp(email.value, password.value, isLoading);
        
    } catch (error) {
        console.error('Signup error:', (error as Error).message);
        errorMessage.value = (error as Error).message; // エラーメッセージを表示
        password.value = '';                           // パスワードをクリア
    }
};
</script>

<template>
    <div class="signup-page">
        <h1 class="welcome-our-page">Welcome to our Todo App!</h1>

        <!-- エラーメッセージの表示 -->
        <div v-if="errorMessage">
            <p>
                Failed to sign up for the account. The reasons are as follows:
            </p>
            <p class="error-message">*{{ errorMessage }}</p>
        </div>

        <div class="signup-container" v-if="!user">
            <h2 class="signup-header">Sign Up for an Account</h2>
            <h4 class="signup-header">Provide your account information</h4>

            <form class="signup-form" @submit.prevent="registerUser">
                <label for="signup-email">Email: </label>
                <input
                    id="signup-email"
                    name="signup-email"
                    type="email"
                    v-model="email"
                    placeholder="Enter your Email" />

                <label for="">Password: </label>
                <input
                    id="signup-password"
                    name="signup-password"
                    type="password" 
                    v-model="password"
                    placeholder="Enter your Password" />

                <button
                    :disabled="isLoading"
                    type="submit"
                    class="btn-signup">
                        {{ isLoading ? 'Signing up...' : 'Sign Up' }}
                </button>
            </form>

            <div class="link-to-login">
                <h4 class="already-have-an-account">Already have an account?</h4>
                <NuxtLink to="/" class="btn-login">
                    Login here
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.welcome-our-page {
    text-align: center;
}
.signup-page {
   position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
}
.signup-container {
    border-radius: 16px;
    padding: 3rem;
    background-color: rgba(237, 175, 175, 0.3);
}
.signup-header {
    text-align: center;
}
.signup-form {
    display: flex;
    flex-direction: column;
    max-width: 300px;
    margin: 0 auto;
}
.signup-form input {
    margin-bottom: 1.5rem;
    min-height: 2rem;
    border-radius: 4px;
}
.btn-signup, .btn-login {
    margin: 0.1rem;
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    font-weight: bold;
}
.btn-signup {
    background-color: rgba(180, 50, 80, 0.7);
    color: aliceblue;
}
.btn-login {
    border: 3px solid rgba(0, 100, 200, 0.822);
    text-decoration: none;
}
.btn-signup:hover,
.btn-login:hover {
    opacity: 0.6;
    transition: 0.3s;
    color: aliceblue;
}
.btn-signup:hover {
    background-color: rgba(180, 50, 80, 0.7);
}
.btn-login:hover {
    background-color: rgba(0, 100, 200, 0.822);
}
.link-to-login {
    margin-top: 2rem;
    text-align: center;
    border-top: 1px solid rgba(100,100,100,0.2);
}
.already-have-an-account {
    margin: 2rem 0;
}
.error-message {
    color: rgb(200,50,50);
}
</style>
