<script setup lang="ts">
import Login from '~/components/auth/Login.vue';
import Sort from '~/components/Sort.vue';
import TableInput from '~/components/TableInput.vue';
import TableOutput from '~/components/TableOutput.vue';
import { useAuth } from '~/composables/useAuth';
import { watchEffect, onMounted } from 'vue';
import checker from "vite-plugin-checker";

const { isAuthenticated, checkUser } = useAuth();
const isCheckComplete = ref(false);

/**
 * ページマウント時に認証チェックを実行
 */
onMounted(async () => {
  console.log('Running checkUser on mounted');
  await checkUser();
  isCheckComplete.value = true;
  console.log('Authentication check complete:', isAuthenticated.value);
});

/**
 * 認証状態の変化に応じてタスクデータの取得
 */
watchEffect(() => {
  if (isAuthenticated.value) {
    console.log('Authenticated, fetching todos...');
    fetchTodos();
  }
})
</script>

<template>
  <!-- ローディング中の表示 -->
  <div v-if="!isCheckComplete">
    <p>Loading...</p>
  </div>

  <div v-else>
    <!-- 未ログインの場合、ログイン画面を表示 -->
    <div v-if="!isAuthenticated">
      <Login />
    </div>

    <!-- ログイン済みの場合、todo一覧を表示 -->
    <div v-else>
      <ClientOnly>
        <TableInput />
        <Sort />
        <Search />
        <TableOutput />
      </ClientOnly>
    </div>
  </div>
</template>
