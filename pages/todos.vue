<script setup lang="ts">
import Login from '~/components/auth/Login.vue';
import Sort from '~/components/Sort.vue';
import TableInput from '~/components/TableInput.vue';
import TableOutput from '~/components/TableOutput.vue';
import { useAuth } from '~/composables/useAuth';
import { watchEffect, onMounted } from 'vue';

const { isAuthenticated} = useAuth();

/**
 * 認証状態の変化に応じてタスクデータの取得を行うウォッチャー
 * @function watchEffect
 * @returns {void}
 * @description 認証状態が変化した際に、ログイン済みであればタスクデータを取得する。
 */
 watchEffect(() => {
  console.log('isAuthenticated in todos.vue: ', isAuthenticated.value);

  if (isAuthenticated.value) {
    // ログイン済みの場合、タスクデータを取得
    fetchTodos();
  }
});
</script>

<template>
    <!-- 未ログインの場合、ログイン画面を表示 -->
    <div v-if="!isAuthenticated">
        <Login />
    </div>

    <!-- ログイン済みの場合、todo一覧を表示 -->
    <div v-else>
        <ClientOnly>
            <TableInput />
            <Sort />
            <TableOutput />
        </ClientOnly>
    </div>
</template>
