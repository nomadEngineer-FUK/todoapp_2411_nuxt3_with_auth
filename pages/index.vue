<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { onMounted, watchEffect } from 'vue';
import Login from '~/components/auth/Login.vue';

const { isAuthenticated } = useAuth();
const router = useRouter();

/**
 * コンポーネントがマウントされたときに認証状態を確認し、リダイレクトを行う
 * @function onMounted
 * @returns {void}
 */
 onMounted(() => {
  if (isAuthenticated.value) {
    // ログイン済みの場合は自動的に /todos へリダイレクト
    router.push('/todos');
  }
});

/**
 * 認証状態の変化に応じてタスクデータの取得を実行
 * @function watchEffect
 * @returns {void}
 */
 watchEffect(() => {
  console.log('isAuthenticated:', isAuthenticated.value);

  // ログイン済みの場合はタスクを取得
  if (isAuthenticated.value) {
    // 認証済みの場合、タスク画面にリダイレクト
    router.push('/todos');
  }
});

</script>

<template>
  
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