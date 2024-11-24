<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { onMounted, watchEffect } from 'vue';
import Login from '~/components/auth/Login.vue';
import { useRouter } from 'nuxt/app';

const { isAuthenticated, checkUser, isAdmin } = useAuth(); // 認証関連の関数と状態を取得
const router = useRouter(); // ルーターインスタンスを取得
const isCheckComplete = ref(false); // 認証チェックの完了フラグ

/**
 * ユーザーの認証状態を確認する処理
 * @async
 * @function onMounted
 * @description クライアントサイドでユーザー認証を確認し、認証チェック完了フラグを設定。
 */
onMounted(async () => {
  console.log("onMounted: Checking user");

  if (import.meta.client) {
    await checkUser();
    console.log("isAuthenticated after checkUser in mounted:", isAuthenticated.value);
    isCheckComplete.value = true;
  }
});

/**
 * 認証状態を監視し、ログイン済みの場合にリダイレクトする処理
 * @function watchEffect
 * @description 認証状態（`isAuthenticated`）を監視し、ログイン済みの場合は`/todos`ページにリダイレクト。
 */
watchEffect(() => {
  if (isCheckComplete.value && isAuthenticated.value) {
    console.log("Redirecting to /todos");
    router.push('/todos');
  }
});

/**
 * 認証状態の変更を監視
 * @function watch
 * @param {boolean} newValue - `isAuthenticated` の新しい値
 * @param {boolean} oldValue - `isAuthenticated` の古い値
 * @description 認証状態が変更された場合にコンソールにログを出力。
 */
watch(isAuthenticated, (newValue, oldValue) => {
  console.log(`isAuthenticated changed: ${oldValue} -> ${newValue}`);
});
</script>

<template>

  <!-- 未ログインの場合は、ログイン画面を表示 -->
  <div v-if="!isAuthenticated">
    <Login />
  </div>
</template>

<style>
* {
  color: #333333;
}
/* ボタンの装飾をリセット */
button{
  background-color: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  appearance: none;
  font-size: small;
}
</style>
