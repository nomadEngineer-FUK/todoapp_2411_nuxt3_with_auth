<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useRoute, useRouter } from 'vue-router';

const { login, user, checkUser, isAuthenticated } = useAuth();
const email = ref<string>('');
const password = ref<string>('');
const route =  useRoute();
const router = useRouter();
const logoutMessage = computed(() => (route.query.message as string) || '');
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

/**
 * ユーザーが入力したメールアドレスとパスワードでログインを試行します。
 * ■認証が成功した場合：「/todos」ページにリダイレクト
 * ■ログインに失敗した場合：エラーメッセージを画面に表示し、ユーザーが問題を把握できるようにします。
 * 
 * ※この関数には 「try-catch」文と「if」 文のそれぞれでエラーハンドリングを行います:
 * 
 * -- try-catch:
 *      ログイン処理中に発生する一般的なエラー
 *      （ネットワークエラーや無効なログインなど）をキャッチします。
 *      ユーザーに対し、メールアドレスとパスワードの再確認を促します。
 * 
 * -- if:
 *      ログイン試行後、認証状態 (isAuthenticated) を確認
 *      ログイン処理がエラーなく完了しても、クライアント側で認証が確立されているかを追加で確認するためのもの
 *      認証が確立されていない場合、再度ログインを促すメッセージを表示します。
 * 
 * @async
 * @function loginUser
 * @returns {Promise<void>}
 */
const loginUser = async (): Promise<void> => {
    errorMessage.value = null; // エラーメッセージをリセット

    try {
        await login(email.value, password.value, isLoading);
        await checkUser(); // 認証状態の確認

        if (isAuthenticated.value) {
            // 認証されていればリダイレクト
            console.log('Login succeeded. Your Email: ' + email.value);
            router.push('/todos'); // 認証済の場合はtodo一覧が表示される

        } else {
            // 認証が成功していない場合のエラーメッセージ
            errorMessage.value = "Your authentication information is incomplete. Please log in again.";
            console.error("Your authentication information is incomplete. Please log in again.");
        }

    } catch (error) {
        // try-catchでキャッチしたエラーを画面に表示
        errorMessage.value = "Login failed. Please double-check your email address and password.";
        console.error('Login error:', (error as Error).message);
    };
};

/**
 * ページロード時にユーザーの認証状態を確認
 * @async
 */
 onMounted(async () => {
  await checkUser();
});

watchEffect(() => {
  if (isAuthenticated.value) {
    router.push('/todos');
  }
});
</script>

<template>
    <div>
        <div class="login-page">
            <h1 class="welcome-our-page">Welcome to our Todo App!</h1>

            <!-- ログアウトメッセージ -->
            <p v-if="logoutMessage">{{ logoutMessage }}</p>

            <!-- エラーメッセージの表示 -->
            <p v-if="errorMessage" class="error-message">
                {{ errorMessage }}
            </p>



            <!-- 未ログインの場合 -->
            <div class="login-container" v-if="!user">
                <h2 class="login-header">Login to Your Account</h2>
                
                <form class="login-signup-form" @submit.prevent="loginUser">
                    <label for="login-id">Email: </label>
                    <input 
                        id="login-id"
                        name="login-id"
                        v-model="email"
                        placeholder="Enter your Email"
                        type="email" />

                    <label for="signup-password">Password:</label>
                    <input
                        id="signup-password"
                        name="signup-password"
                        v-model="password"
                        placeholder="Enter your Password"
                        type="password" />

                    <button
                        :disabled="isLoading"
                        class="btn-login-or-signup btn-login"
                        type="submit">
                            {{ isLoading ? 'Logging in...' : 'Login' }}
                    </button>
                </form>

                <!-- アカウント未登録の場合 -->
                <div class="signup-new-account">
                    <h4 class="new-to-our-app">New to our app?</h4>
                    <NuxtLink to="/register" class="btn-login-or-signup btn-signup">
                        Sign up here
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>
  
<style scoped>
/* ページ全体 */
.welcome-our-page {
    text-align: center;
}
.login-page {
   position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
}
.login-container {
    border-radius: 16px;
    padding: 3rem;
    background-color: rgba(175, 238, 238, 0.3);
}
.login-header {
    text-align: center;
}
.login-signup-form {
    display: flex;
    flex-direction: column;
    max-width: 300px;
    margin: 0 auto;
}
.login-signup-form input {
    margin-bottom: 1.5rem;
    min-height: 2rem;
    border-radius: 4px;
}

/* ボタン */
.btn-login-or-signup {
    margin: 0.1rem;
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    font-weight: bold;
}
.btn-login-or-signup:hover {
    opacity: 0.6;
    transition: 0.3s;
}
.btn-login {
    border: 3px solid rgba(0, 100, 200, 0.822);
    background-color: rgba(0, 100, 200, 0.822);
    color: aliceblue;
}

/* アカウント未登録の場合 */
.signup-new-account {
    margin: 2rem;
    text-align: center;
    border-top: 1px solid rgba(100,100,100,0.2);
}
.new-to-our-app {
    margin: 2rem 0;
}
.btn-signup {
    border: 3px solid rgba(150, 20, 60, 0.6);
    color: rgba(150, 20, 60, 0.6);
    text-decoration: none;
}
.btn-signup:hover {
    background-color: rgba(150, 20, 60, 0.6);
    color: aliceblue;
}

/* エラーメッセージ */
.error-message {
    color: rgb(200,50,50);
}
</style>
  